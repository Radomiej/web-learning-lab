import { useMemo } from 'react';
import { emptyFileBundle } from '../data/lessonFactories.js';
import { useLocalStorage } from './useLocalStorage.js';

export const PROGRESS_STORAGE_KEY = 'web-learning-lab.progress.v1';
export const FILES_STORAGE_KEY = 'web-learning-lab.files.v1';

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

function normalizeBundle(bundle) {
  return { ...emptyFileBundle(), ...(bundle && typeof bundle === 'object' ? bundle : {}) };
}

export function useCourseProgress(lessons = []) {
  const firstLesson = lessons[0] || null;
  const defaultProgress = {
    selectedTrack: firstLesson?.track || 'html',
    selectedLessonId: firstLesson?.id || '',
    completedTasks: [],
  };
  const [storedProgress, setStoredProgress] = useLocalStorage(PROGRESS_STORAGE_KEY, defaultProgress);
  const [storedFiles, setStoredFiles] = useLocalStorage(FILES_STORAGE_KEY, {});

  const progress = storedProgress && typeof storedProgress === 'object'
    ? storedProgress
    : defaultProgress;
  const filesByTask = storedFiles && typeof storedFiles === 'object' && !Array.isArray(storedFiles)
    ? storedFiles
    : {};
  const selectedLesson = findLesson(lessons, progress.selectedLessonId) || firstLesson;
  const selectedTrack = selectedLesson?.track || progress.selectedTrack || firstLesson?.track || 'html';
  const completedTasks = Array.isArray(progress.completedTasks) ? progress.completedTasks : [];

  const taskIndex = useMemo(() => new Map(
    lessons.flatMap((lesson) => lesson.tasks.map((task) => [task.id, task])),
  ), [lessons]);

  const selectLesson = (lessonId) => {
    const lesson = findLesson(lessons, lessonId);
    if (!lesson) return;
    setStoredProgress((current) => ({
      ...defaultProgress,
      ...(current && typeof current === 'object' ? current : {}),
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
    setStoredFiles((current) => ({
      ...(current && typeof current === 'object' ? current : {}),
      [task.id]: {
        ...normalizeBundle(task.starter),
        ...normalizeBundle(current?.[task.id]),
        ...(changes && typeof changes === 'object' ? changes : {}),
      },
    }));
  };

  const resetTask = (taskId) => {
    const task = taskIndex.get(taskId) || findTask(lessons, taskId);
    if (!task) return;
    setStoredFiles((current) => ({
      ...(current && typeof current === 'object' ? current : {}),
      [task.id]: normalizeBundle(task.starter),
    }));
  };

  const markTaskComplete = (taskId) => {
    if (!taskIndex.has(taskId) || completedTasks.includes(taskId)) return;
    setStoredProgress((current) => ({
      ...defaultProgress,
      ...(current && typeof current === 'object' ? current : {}),
      completedTasks: [...(Array.isArray(current?.completedTasks) ? current.completedTasks : []), taskId],
    }));
  };

  return {
    selectedTrack,
    selectedLessonId: selectedLesson?.id || '',
    filesByTask,
    completedTasks,
    selectTrack,
    selectLesson,
    updateFiles,
    resetTask,
    markTaskComplete,
  };
}
