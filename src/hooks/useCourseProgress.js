import { useMemo, useRef, useState } from "react";
import { normalizeProject } from "../services/projectFiles.js";
import {
  clearCourseStorage,
  loadProjects,
  saveProjects,
  PROJECT_STORAGE_KEY,
} from "../services/projectStorage.js";
import { useLocalStorage } from "./useLocalStorage.js";

export const PROGRESS_STORAGE_KEY = "web-learning-lab.progress.v1";
// The file bundle shape and lesson starters changed after the first course
// release. A new key prevents stale, partially empty bundles from replacing
// the current starter and producing a blank preview.
export const FILES_STORAGE_KEY = PROJECT_STORAGE_KEY;

function findLesson(lessons, lessonId) {
  return lessons.find((lesson) => lesson.id === lessonId) || null;
}

function findTask(lessons, taskId) {
  for (const lesson of lessons) {
    const task = lesson.tasks.find((candidate) => candidate.id === taskId);
    if (task) return task;
  }
  return null;
}

export function useCourseProgress(lessons = []) {
  const firstLesson = lessons[0] || null;
  const initialLesson =
    lessons.find((lesson) => lesson.order === 2) || firstLesson;
  const defaultProgress = {
    selectedTrack: initialLesson?.track || "html",
    selectedLessonId: initialLesson?.id || "",
    completedTasks: [],
  };
  const [storedProgress, setStoredProgress, resetStoredProgress] =
    useLocalStorage(PROGRESS_STORAGE_KEY, defaultProgress);
  const [initialProjects] = useState(() => {
    try {
      return loadProjects(window.localStorage, lessons);
    } catch {
      return loadProjects(null, lessons);
    }
  });
  const [storedFiles, setStoredFiles] = useState(initialProjects.projects);
  const filesRef = useRef(storedFiles);
  const [storageWarning, setStorageWarning] = useState(initialProjects.warning);
  function storeProjects(projects) {
    filesRef.current = projects;
    setStoredFiles(projects);
    if (initialProjects.readOnly) return;
    try {
      setStorageWarning(saveProjects(window.localStorage, projects).warning);
    } catch {
      setStorageWarning(
        "Nie udało się zapisać pracy. Zachowaj kopię kodu przed zamknięciem.",
      );
    }
  }

  const progress =
    storedProgress && typeof storedProgress === "object"
      ? storedProgress
      : defaultProgress;
  const filesByTask =
    storedFiles &&
    typeof storedFiles === "object" &&
    !Array.isArray(storedFiles)
      ? storedFiles
      : {};
  const selectedLesson =
    findLesson(lessons, progress.selectedLessonId) || firstLesson;
  const selectedTrack =
    selectedLesson?.track ||
    progress.selectedTrack ||
    firstLesson?.track ||
    "html";

  const taskIndex = useMemo(
    () =>
      new Map(
        lessons.flatMap((lesson) =>
          lesson.tasks.map((task) => [task.id, task]),
        ),
      ),
    [lessons],
  );
  const completedTasks = Array.isArray(progress.completedTasks)
    ? progress.completedTasks.filter((taskId) => taskIndex.has(taskId))
    : [];

  const selectLesson = (lessonId) => {
    const lesson = findLesson(lessons, lessonId);
    if (!lesson) return;
    setStoredProgress((current) => ({
      ...defaultProgress,
      ...(current && typeof current === "object" ? current : {}),
      selectedTrack: lesson.track,
      selectedLessonId: lesson.id,
    }));
  };

  const selectTrack = (trackId) => {
    const lesson = lessons.find((candidate) => candidate.track === trackId);
    if (!lesson) return;
    selectLesson(lesson.id);
  };

  const updateFiles = (taskId, changes = {}) => {
    const task = taskIndex.get(taskId) || findTask(lessons, taskId);
    if (!task) return;
    const current = filesRef.current;
    const track = lessons.find((lesson) =>
      lesson.tasks.some((candidate) => candidate.id === taskId),
    )?.track;
    const previous =
      current[task.id] || normalizeProject(task.starter, { track });
    const next = changes.files
      ? normalizeProject(changes)
      : normalizeProject({
          ...previous,
          files: { ...previous.files, ...changes },
        });
    storeProjects({ ...current, [task.id]: next });
  };

  const resetTask = (taskId) => {
    const task = taskIndex.get(taskId) || findTask(lessons, taskId);
    if (!task) return;
    const track = lessons.find((lesson) =>
      lesson.tasks.some((candidate) => candidate.id === taskId),
    )?.track;
    storeProjects({
      ...filesRef.current,
      [task.id]: normalizeProject(task.starter, { track }),
    });
  };

  const markTaskComplete = (taskId, complete = true) => {
    if (!taskIndex.has(taskId) || completedTasks.includes(taskId) === complete)
      return;
    setStoredProgress((current) => ({
      ...defaultProgress,
      ...(current && typeof current === "object" ? current : {}),
      completedTasks: complete
        ? [
            ...new Set([
              ...(Array.isArray(current?.completedTasks)
                ? current.completedTasks
                : []),
              taskId,
            ]),
          ]
        : (Array.isArray(current?.completedTasks)
            ? current.completedTasks
            : []
          ).filter((id) => id !== taskId),
    }));
  };

  const hardReset = () => {
    try {
      clearCourseStorage(window.localStorage);
    } catch {}
    filesRef.current = {};
    setStoredFiles({});
    setStorageWarning("");
    resetStoredProgress();
  };

  return {
    storageWarning,
    selectedTrack,
    selectedLessonId: selectedLesson?.id || "",
    filesByTask,
    completedTasks,
    selectTrack,
    selectLesson,
    updateFiles,
    resetTask,
    markTaskComplete,
    hardReset,
  };
}
