import { useEffect, useMemo, useState } from 'react';
import { allLessons, trackOrder, tracks } from './data/curriculum.js';
import { useCourseProgress } from './hooks/useCourseProgress.js';
import { usePreviewRuntime } from './hooks/usePreviewRuntime.js';
import AppShell from './components/AppShell.jsx';
import LessonWorkspace from './components/LessonWorkspace.jsx';
import MobileHeader from './components/MobileHeader.jsx';
import PreviewInspector from './components/PreviewInspector.jsx';
import RuntimeConsole from './components/RuntimeConsole.jsx';
import Sidebar from './components/Sidebar.jsx';

export default function App() {
  const {
    selectedTrack,
    selectedLessonId,
    filesByTask,
    completedTasks,
    selectTrack,
    selectLesson,
    updateFiles,
    resetTask,
    markTaskComplete,
  } = useCourseProgress(allLessons);
  const selectedLesson = allLessons.find((lesson) => lesson.id === selectedLessonId) || allLessons[0];
  const [activeTaskId, setActiveTaskId] = useState(selectedLesson.tasks[0]?.id);
  const [activeFile, setActiveFile] = useState('html');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!selectedLesson.tasks.some((task) => task.id === activeTaskId)) {
      setActiveTaskId(selectedLesson.tasks[0]?.id);
      setActiveFile('html');
    }
  }, [activeTaskId, selectedLesson]);

  const activeTask = selectedLesson.tasks.find((task) => task.id === activeTaskId) || selectedLesson.tasks[0];
  const files = useMemo(() => ({
    ...selectedLesson.starter,
    ...activeTask.starter,
    ...(filesByTask[activeTask.id] || {}),
  }), [activeTask, filesByTask, selectedLesson.starter]);

  const previewRuntime = usePreviewRuntime(files, activeTask.checks, selectedLesson.track);
  const runtimeLabel = previewRuntime.runtimeState.status === 'running'
    ? 'Uruchamiam'
    : previewRuntime.runtimeState.status === 'error'
      ? 'Błąd'
      : 'Gotowe';

  useEffect(() => {
    const results = previewRuntime.runtimeState.checkResults;
    if (results.length > 0 && results.every((result) => result.passed)) markTaskComplete(activeTask.id);
  }, [activeTask.id, markTaskComplete, previewRuntime.runtimeState.checkResults]);

  const handleReset = () => {
    resetTask(activeTask.id);
    previewRuntime.clearRuntime();
    previewRuntime.runPreview();
  };

  const handleSolution = () => {
    updateFiles(activeTask.id, activeTask.solution);
    previewRuntime.runPreview();
  };

  const handleTaskChange = (taskId) => {
    setActiveTaskId(taskId);
    setActiveFile('html');
    previewRuntime.clearRuntime();
  };

  const sidebar = (
    <Sidebar
      tracks={tracks}
      trackOrder={trackOrder}
      lessons={allLessons}
      selectedTrack={selectedTrack}
      selectedLessonId={selectedLesson.id}
      completedTasks={completedTasks}
      isOpen={sidebarOpen}
      onTrackChange={(trackId) => { selectTrack(trackId); setSidebarOpen(false); }}
      onLessonChange={(lessonId) => { selectLesson(lessonId); setSidebarOpen(false); }}
    />
  );

  const main = (
    <>
      <MobileHeader onOpen={() => setSidebarOpen(true)} runtimeLabel={runtimeLabel} />
      <LessonWorkspace
        lesson={selectedLesson}
        activeTask={activeTask}
        activeFile={activeFile}
        files={files}
        completedTasks={completedTasks}
        checkResults={previewRuntime.runtimeState.checkResults}
        runtimeErrors={previewRuntime.runtimeState.errors}
        onTaskChange={handleTaskChange}
        onFileChange={setActiveFile}
        onCodeChange={(fileKey, value) => updateFiles(activeTask.id, { [fileKey]: value })}
        onRun={previewRuntime.runPreview}
        onReset={handleReset}
        onCheck={previewRuntime.checkPreview}
        onSolution={handleSolution}
      />
    </>
  );

  const inspector = (
    <>
      <PreviewInspector
        previewDocument={previewRuntime.previewDocument}
        previewKey={previewRuntime.previewKey}
        onMessage={previewRuntime.handleMessage}
        onFrameReady={previewRuntime.setFrame}
        runtimeState={{ ...previewRuntime.runtimeState, label: runtimeLabel }}
      />
      <RuntimeConsole messages={previewRuntime.runtimeState.messages} />
    </>
  );

  return (
    <AppShell
      sidebar={sidebar}
      main={main}
      inspector={inspector}
      sidebarOpen={sidebarOpen}
      onSidebarClose={() => setSidebarOpen(false)}
    />
  );
}
