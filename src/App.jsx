import { useEffect, useMemo, useRef, useState } from 'react';
import { allLessons, trackOrder, tracks } from './data/curriculum.js';
import { useCourseProgress } from './hooks/useCourseProgress.js';
import { usePreviewRuntime } from './hooks/usePreviewRuntime.js';
import AppShell from './components/AppShell.jsx';
import LessonWorkspace from './components/LessonWorkspace.jsx';
import MobileHeader from './components/MobileHeader.jsx';
import PreviewInspector from './components/PreviewInspector.jsx';
import RuntimeConsole from './components/RuntimeConsole.jsx';
import Sidebar from './components/Sidebar.jsx';
import AddFileDialog from './components/AddFileDialog.jsx';
import EditorDialog from './components/EditorDialog.jsx';
import {normalizeProject} from './services/projectFiles.js';

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
    storageWarning,
  } = useCourseProgress(allLessons);
  const selectedLesson = allLessons.find((lesson) => lesson.id === selectedLessonId) || allLessons[0];
  const [activeTaskId, setActiveTaskId] = useState(selectedLesson.tasks[0]?.id);
  const [activeFile, setActiveFile] = useState('index.html');
  const [dialog,setDialog]=useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!selectedLesson.tasks.some((task) => task.id === activeTaskId)) {
      setActiveTaskId(selectedLesson.tasks[0]?.id);
      setActiveFile('index.html');
    }
  }, [activeTaskId, selectedLesson]);

  const activeTask = selectedLesson.tasks.find((task) => task.id === activeTaskId) || selectedLesson.tasks[0];
  const files = useMemo(() => normalizeProject(filesByTask[activeTask.id] || activeTask.starter, {track:selectedLesson.track}), [activeTask, filesByTask, selectedLesson.track]);

  const previewRuntime = usePreviewRuntime(files, activeTask.checks, selectedLesson.track, activeTask.id);
  const awardedRunRef = useRef(null);
  const runtimeLabel = previewRuntime.runtimeState.status === 'running'
    ? 'Uruchamiam'
    : previewRuntime.runtimeState.status === 'error'
      ? 'Błąd'
      : 'Gotowe';

  useEffect(() => {
    const results = previewRuntime.runtimeState.checkResults;
    const run = `${activeTask.id}:${previewRuntime.runId}`;
    if (previewRuntime.runtimeState.errors.length) {
      if (awardedRunRef.current === run) {
        awardedRunRef.current = null;
        markTaskComplete(activeTask.id, false);
      }
      return;
    }
    if (results.length > 0 && results.every((result) => result.passed) && !completedTasks.includes(activeTask.id)) {
      awardedRunRef.current = run;
      markTaskComplete(activeTask.id);
    }
  }, [activeTask.id, completedTasks, markTaskComplete, previewRuntime.runId, previewRuntime.runtimeState.checkResults, previewRuntime.runtimeState.errors]);

  const handleReset = () => {
    setDialog(null);
    setActiveFile('index.html');
    resetTask(activeTask.id);
    previewRuntime.clearRuntime();
    previewRuntime.runPreview(normalizeProject(activeTask.starter,{track:selectedLesson.track}),'index.html');
  };

  const handleSolution = () => {
    if (activeTask.mode !== 'guided') return;
    const solution=normalizeProject(activeTask.solution,{track:selectedLesson.track});
    updateFiles(activeTask.id, solution);
    setActiveFile(solution.entry);
    previewRuntime.runPreview(solution,solution.entry);
  };

  const handleTaskChange = (taskId) => {
    setActiveTaskId(taskId);
    setActiveFile('index.html');
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
      {storageWarning && <p role="status" className="storage-warning">{storageWarning}</p>}
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
        onRun={() => previewRuntime.runPreview()}
        onReset={() => setDialog('reset')}
        onAddFile={() => setDialog('add')}
        onCheck={previewRuntime.checkPreview}
        onSolution={handleSolution}
      />
      {dialog==='add' && <AddFileDialog project={files} onClose={()=>setDialog(null)} onCreate={({project,path})=>{updateFiles(activeTask.id,project);setActiveFile(path);setDialog(null);}}/>}
      {dialog==='reset' && <EditorDialog title="Przywrócić pliki zadania?" onClose={()=>setDialog(null)}><p>Twoje zmiany i dodane pliki w tym zadaniu zostaną zastąpione plikami startowymi. Inne zadania pozostaną bez zmian.</p><div className="editor-dialog-actions"><button className="button button--ghost" onClick={()=>setDialog(null)}>Anuluj</button><button className="button button--primary" onClick={handleReset}>Przywróć starter</button></div></EditorDialog>}
    </>
  );

  const inspector = (
    <>
      <PreviewInspector
        htmlFiles={Object.keys(files.files).filter(path=>path.endsWith('.html'))}
        previewPath={previewRuntime.previewPath}
        onPreviewPathChange={previewRuntime.setPreviewPath}
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
