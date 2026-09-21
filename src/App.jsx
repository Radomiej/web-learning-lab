import { useEffect, useMemo, useState } from 'react';
import { allLessons, trackOrder, tracks } from './data/curriculum.js';
import { evaluateChecks } from './services/lessonValidator.js';
import { buildPreviewDocument } from './services/previewDocument.js';
import { useCourseProgress } from './hooks/useCourseProgress.js';
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
  const [previewKey, setPreviewKey] = useState(1);
  const [runtimeState, setRuntimeState] = useState({ status: 'idle', label: 'Gotowe' });
  const [runtimeMessages, setRuntimeMessages] = useState([]);
  const [runtimeErrors, setRuntimeErrors] = useState([]);
  const [runtimeSignals, setRuntimeSignals] = useState({ dom: {}, styles: {}, viewport: {}, interactions: {}, runtimeErrors: [], react: {} });
  const [checkResults, setCheckResults] = useState([]);

  useEffect(() => {
    if (!selectedLesson.tasks.some((task) => task.id === activeTaskId)) {
      setActiveTaskId(selectedLesson.tasks[0]?.id);
      setActiveFile('html');
      setCheckResults([]);
    }
  }, [activeTaskId, selectedLesson]);

  const activeTask = selectedLesson.tasks.find((task) => task.id === activeTaskId) || selectedLesson.tasks[0];
  const files = useMemo(() => ({
    ...selectedLesson.starter,
    ...activeTask.starter,
    ...(filesByTask[activeTask.id] || {}),
  }), [activeTask, filesByTask, selectedLesson.starter]);
  const previewDocument = useMemo(() => buildPreviewDocument(files, {
    track: selectedLesson.track,
    requestedSignals: activeTask.checks,
  }), [activeTask.checks, files, selectedLesson.track]);

  const handlePreviewMessage = (message) => {
    if (message?.type === 'load') {
      setRuntimeState((current) => current.status === 'idle' && current.label === 'Gotowe'
        ? current
        : { status: 'idle', label: 'Gotowe' });
      return;
    }
    if (!message || message.source !== 'web-learning-lab') return;
    if (message.type === 'ready') setRuntimeState({ status: 'idle', label: 'Gotowe' });
    if (message.type === 'console') setRuntimeMessages((current) => [...current.slice(-29), message.payload]);
    if (message.type === 'runtime-error') {
      const errorMessage = message.payload?.message || 'Nieznany błąd runtime';
      setRuntimeErrors((current) => [...current, errorMessage]);
      setRuntimeState({ status: 'error', label: 'Błąd' });
    }
    if (message.type === 'signals') {
      setRuntimeSignals((current) => ({
        ...current,
        ...message.payload,
        dom: { ...current.dom, ...(message.payload?.dom || {}) },
        styles: { ...current.styles, ...(message.payload?.styles || {}) },
        interactions: { ...current.interactions, ...(message.payload?.interactions || {}) },
      }));
    }
  };

  const handleRun = () => {
    setRuntimeMessages([]);
    setRuntimeErrors([]);
    setRuntimeSignals({ dom: {}, styles: {}, viewport: {}, interactions: {}, runtimeErrors: [], react: {} });
    setCheckResults([]);
    setRuntimeState({ status: 'running', label: 'Uruchamiam' });
    setPreviewKey((key) => key + 1);
  };

  const handleCheck = () => {
    const result = evaluateChecks(activeTask.checks, {
      files,
      signals: { ...runtimeSignals, runtimeErrors },
    });
    setCheckResults(result.results);
    if (result.total > 0 && result.passed === result.total) markTaskComplete(activeTask.id);
  };

  const handleReset = () => {
    resetTask(activeTask.id);
    setCheckResults([]);
    setPreviewKey((key) => key + 1);
  };

  const handleSolution = () => {
    updateFiles(activeTask.id, activeTask.solution);
    setPreviewKey((key) => key + 1);
  };

  const handleTaskChange = (taskId) => {
    setActiveTaskId(taskId);
    setActiveFile('html');
    setCheckResults([]);
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
      <MobileHeader onOpen={() => setSidebarOpen(true)} runtimeLabel={runtimeState.label} />
      <LessonWorkspace
        lesson={selectedLesson}
        activeTask={activeTask}
        activeFile={activeFile}
        files={files}
        completedTasks={completedTasks}
        checkResults={checkResults}
        runtimeErrors={runtimeErrors}
        onTaskChange={handleTaskChange}
        onFileChange={setActiveFile}
        onCodeChange={(fileKey, value) => updateFiles(activeTask.id, { [fileKey]: value })}
        onRun={handleRun}
        onReset={handleReset}
        onCheck={handleCheck}
        onSolution={handleSolution}
      />
    </>
  );

  const inspector = (
    <>
      <PreviewInspector
        previewDocument={previewDocument}
        previewKey={previewKey}
        onMessage={handlePreviewMessage}
        runtimeState={runtimeState}
      />
      <RuntimeConsole messages={runtimeMessages} />
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
