import {createCourseRoutes} from './services/courseRoutes.js';
import {useCourseRoute} from './hooks/useCourseRoute.js';
import {useSessionTelemetry} from './hooks/useSessionTelemetry.js';
import { trackLabEvent, setLabContext } from './services/labAnalytics.js';
import { useEffect, useMemo, useRef, useState } from "react";
import { allLessons, trackOrder, tracks } from "./data/curriculum.js";
import { useCourseProgress } from "./hooks/useCourseProgress.js";
import { usePreviewRuntime } from "./hooks/usePreviewRuntime.js";
import AppShell from "./components/AppShell.jsx";
import GameApiGuide from './components/GameApiGuide.jsx';
import LessonWorkspace from "./components/LessonWorkspace.jsx";
import MobileHeader from "./components/MobileHeader.jsx";
import PreviewInspector from "./components/PreviewInspector.jsx";
import Sidebar from "./components/Sidebar.jsx";
import AddFileDialog from "./components/AddFileDialog.jsx";
import EditorDialog from "./components/EditorDialog.jsx";
import { normalizeProject } from "./services/projectFiles.js";
import { applyTutorProposal } from './services/tutorProposals.js';
import { recordWorkEvent, workHistoryKey } from './services/workHistory.js';

function starterEntry(task, track) {
  const project = normalizeProject(task?.starter, { track });
  if (track === 'js' && Object.hasOwn(project.files, 'script.js')) return 'script.js';
  return project.runtime?.kind === 'game-js' ? 'game.js' : project.entry;
}

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
    hardReset,
    storageWarning,
  } = useCourseProgress(allLessons);
  const selectedLesson =
    allLessons.find((lesson) => lesson.id === selectedLessonId) ||
    allLessons[0];
  const [activeTaskId, setActiveTaskId] = useState(selectedLesson.tasks[0]?.id);
  const [activeFile, setActiveFile] = useState(() =>
    starterEntry(selectedLesson.tasks[0], selectedLesson.track),
  );
  const [dialog, setDialog] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projectRevision, setProjectRevision] = useState(0);
  const [stage, setStage] = useState('learn');
  const [previewOpen, setPreviewOpen] = useState(false);
  useEffect(() => { setStage('learn'); setPreviewOpen(false); }, [selectedLesson.id]);

  useEffect(() => {
    if (!selectedLesson.tasks.some((task) => task.id === activeTaskId)) {
      setActiveTaskId(selectedLesson.tasks[0]?.id);
      setActiveFile(starterEntry(selectedLesson.tasks[0], selectedLesson.track));
    }
  }, [activeTaskId, selectedLesson]);

  const activeTask =
    selectedLesson.tasks.find((task) => task.id === activeTaskId) ||
    selectedLesson.tasks[0];
  useEffect(() => {
    setLabContext({track_id:selectedLesson.track, lesson_id:selectedLesson.id, lesson_number:selectedLesson.order, task_id:activeTask.id});
    trackLabEvent('task_open');
  }, [selectedLesson.track, selectedLesson.id, activeTask.id]);
  useEffect(() => { trackLabEvent('lesson_open', {lesson_id:selectedLesson.id,track_id:selectedLesson.track}); }, [selectedLesson.id,selectedLesson.track]);
  const files = useMemo(
    () =>
      normalizeProject(filesByTask[activeTask.id] || activeTask.starter, {
        track: selectedLesson.track,
      }),
    [activeTask, filesByTask, selectedLesson.track],
  );

  const snapshotRef=useRef(null),pendingTelemetryRun=useRef(null),resultSignature=useRef('');
  const initialSnapshot={lessonNumber:selectedLesson.order,taskTitle:activeTask.title||'',progress:{completed:completedTasks.length,total:allLessons.reduce((n,lesson)=>n+lesson.tasks.length,0)},lessonId:selectedLesson.id,lessonTitle:selectedLesson.title,taskId:activeTask.id,activeFile,files:files.files,runnerStatus:'idle',output:'',passed:null,visibility:'visible'};
  const telemetry=useSessionTelemetry(snapshotRef.current?.taskId===activeTask.id?{...snapshotRef.current,lessonNumber:initialSnapshot.lessonNumber,taskTitle:initialSnapshot.taskTitle,progress:initialSnapshot.progress,files:files.files,activeFile}:initialSnapshot);
  const previewRuntime = usePreviewRuntime(
    files,
    activeTask.checks,
    selectedLesson.track,
    activeTask.id,
    {onRun:({project,runId,scopeKey})=>{
      setPreviewOpen(true);
      trackLabEvent('task_run_started');
      const snapshot={...snapshotRef.current,files:project.files,runnerStatus:'running',output:'',passed:null};
      pendingTelemetryRun.current={snapshot,runId,scopeKey};resultSignature.current='';
      telemetry.capture('run_started',snapshot);
    }},
  );
  const runtime=previewRuntime.runtimeState;
  snapshotRef.current={...initialSnapshot,runnerStatus:runtime.status,output:JSON.stringify({messages:runtime.messages,errors:runtime.errors,checks:runtime.checkResults}).slice(-20000),passed:runtime.checkResults.length?runtime.checkResults.every(r=>r.passed)&&!runtime.errors.length:runtime.errors.length?false:null};
  useEffect(()=>{
    const run=pendingTelemetryRun.current;
    if(!run||run.scopeKey!==activeTask.id||run.runId!==previewRuntime.runId||!['ready','error'].includes(runtime.status))return;
    const signature=JSON.stringify([run.runId,runtime.status,runtime.checkResults,runtime.errors,runtime.messages]);
    if(resultSignature.current===signature)return;
    resultSignature.current=signature;
    telemetry.capture('run_result',{...run.snapshot,runnerStatus:runtime.status,output:JSON.stringify({messages:runtime.messages,errors:runtime.errors,checks:runtime.checkResults}).slice(-20000),passed:runtime.checkResults.length?runtime.checkResults.every(r=>r.passed)&&!runtime.errors.length:runtime.errors.length?false:null});
  },[activeTask.id,previewRuntime.runId,runtime,telemetry.capture]);
  const awardedRunRef = useRef(null);
  const loggedResultRef = useRef(null);
  useEffect(() => {
    const state = previewRuntime.runtimeState;
    const run=pendingTelemetryRun.current;
    if(!run||run.scopeKey!==activeTask.id||run.runId!==previewRuntime.runId||!['ready','error'].includes(state.status))return;
    if (!state.checkResults.length && !state.errors.length) return;
    const signature = JSON.stringify([activeTask.id, previewRuntime.runId]);
    if (loggedResultRef.current === signature) return;
    loggedResultRef.current = signature;
    trackLabEvent('task_run_result', {passed:state.checkResults.length > 0 && state.checkResults.every(item => item.passed), total:state.checkResults.length, error_count:state.errors.length});
    recordWorkEvent({ type: 'result', taskId: activeTask.id, runId: previewRuntime.runId, passed: state.checkResults.filter(item => item.passed).length, total: state.checkResults.length, errorCount: state.errors.length });
  }, [activeTask.id, previewRuntime.runId, previewRuntime.runtimeState]);
  const runtimeLabel =
    previewRuntime.runtimeState.status === "running"
      ? "Uruchamiam"
      : previewRuntime.runtimeState.status === "error"
        ? "Błąd"
        : previewRuntime.runtimeState.status === 'ready' ? 'Gotowe' : 'Czeka';

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
    if (
      results.length > 0 &&
      results.every((result) => result.passed) &&
      !completedTasks.includes(activeTask.id)
    ) {
      awardedRunRef.current = run;
      markTaskComplete(activeTask.id);
    }
  }, [
    activeTask.id,
    completedTasks,
    markTaskComplete,
    previewRuntime.runId,
    previewRuntime.runtimeState.checkResults,
    previewRuntime.runtimeState.errors,
  ]);

  const handleReset = () => {
    trackLabEvent('task_reset');
    setProjectRevision(value => value + 1);
    setDialog(null);
    const starter = normalizeProject(activeTask.starter, {
      track: selectedLesson.track,
    });
    setActiveFile(starter.runtime?.kind === 'game-js' ? 'game.js' : starter.entry);
    resetTask(activeTask.id);
    previewRuntime.clearRuntime();
    previewRuntime.runPreview(starter, starter.entry);
  };

  const handleSolution = () => {
    trackLabEvent('solution_open');
    if (activeTask.mode !== "guided") return;
    const solution = normalizeProject(activeTask.solution, {
      track: selectedLesson.track,
    });
    updateFiles(activeTask.id, solution);
    setActiveFile(Object.entries(activeTask.starter.files).find(([,source])=>source.includes('TODO'))?.[0] || (solution.runtime?.kind === 'game-js' ? 'game.js' : solution.entry));
    previewRuntime.runPreview(solution, solution.entry);
  };

  const handleTaskChange = (taskId) => {
    const nextTask = selectedLesson.tasks.find((task) => task.id === taskId);
    setActiveTaskId(taskId);
    setActiveFile(starterEntry(nextTask, selectedLesson.track));
    previewRuntime.clearRuntime();
  };

  const courseRoutes=useMemo(()=>createCourseRoutes(allLessons),[]);
  useCourseRoute(courseRoutes,JSON.stringify([selectedLesson.track,selectedLesson.id,activeTask.id]),target=>{
    selectLesson(target.lesson.id);setActiveTaskId(target.task.id);
    setActiveFile(starterEntry(target.task,target.lesson.track));
    previewRuntime.clearRuntime();setSidebarOpen(false);
  });

  const sidebar = (
    <Sidebar
      telemetry={telemetry}
      tracks={tracks}
      trackOrder={trackOrder}
      lessons={allLessons}
      selectedTrack={selectedTrack}
      selectedLessonId={selectedLesson.id}
      selectedTask={activeTask}
      completedTasks={completedTasks}
      isOpen={sidebarOpen}
      onTrackChange={(trackId) => {
        trackLabEvent('topic_change', {track_id:trackId});
        selectTrack(trackId);
        setSidebarOpen(false);
      }}
      onLessonChange={(lessonId) => {
        selectLesson(lessonId);
        setSidebarOpen(false);
      }}
      onOpenSettings={() => setDialog("settings")}
      onClose={() => setSidebarOpen(false)}
    />
  );

  const togglePreview = () => {
    if (!previewOpen) { setStage('task'); setPreviewOpen(true); previewRuntime.runPreview(); }
    else { setPreviewOpen(false); previewRuntime.setAutoPreview(false); }
  };
  const main = (
    <>
      <MobileHeader
        telemetry={telemetry}
        previewOpen={previewOpen}
        onPreviewToggle={togglePreview}
        onOpen={() => setSidebarOpen(true)}
        runtimeLabel={runtimeLabel}
      />
      {storageWarning && (
        <p role="status" className="storage-warning">
          {storageWarning}
        </p>
      )}
      <LessonWorkspace
        key={selectedLesson.id}
        stage={stage}
        onStageChange={next => { setStage(next); if (next !== 'task') setPreviewOpen(false); }}
        nextLesson={allLessons.filter(lesson => lesson.track === selectedLesson.track && lesson.order > selectedLesson.order).sort((a, b) => a.order - b.order)[0]}
        onNextLesson={() => {
          const next = allLessons.filter(lesson => lesson.track === selectedLesson.track && lesson.order > selectedLesson.order).sort((a, b) => a.order - b.order)[0];
          if (next) { selectLesson(next.id); previewRuntime.clearRuntime(); }
        }}
        projectRevision={projectRevision}
        onTutorApply={(proposal, snapshot) => {
          if (!snapshot || snapshot.revision !== projectRevision) throw new Error('Projekt został zastąpiony. Poproś o nową propozycję.');
          const next = applyTutorProposal(files, snapshot.project, proposal);
          updateFiles(activeTask.id, next);
          setActiveFile(proposal.operation === 'delete' ? next.entry : proposal.path);
        }}
        lesson={selectedLesson}
        activeTask={activeTask}
        activeFile={activeFile}
        files={files}
        completedTasks={completedTasks}
        checkResults={previewRuntime.runtimeState.checkResults}
        runtimeErrors={previewRuntime.runtimeState.errors}
        runtimeState={previewRuntime.runtimeState}
        onTaskChange={handleTaskChange}
        onFileChange={setActiveFile}
        onCodeChange={(fileKey, value) => {
          recordWorkEvent({ type: 'edit', taskId: activeTask.id, file: fileKey, characterCount: value.length });
          updateFiles(activeTask.id, { [fileKey]: value });
        }}
        onRun={() => {
          recordWorkEvent({ type: 'run', taskId: activeTask.id });
          if (selectedLesson.track === 'playground') previewRuntime.runPreview();
          else previewRuntime.checkPreview();
        }}
        onSave={() => previewRuntime.savePreview()}
        onReset={() => setDialog("reset")}
        onAddFile={() => setDialog("add")}
        onCheck={() => { trackLabEvent('task_check_started'); previewRuntime.checkPreview(); }}
        onSolution={handleSolution}
        onImportProject={(project) => {
          setProjectRevision(value => value + 1);
          updateFiles(activeTask.id, project);
          setActiveFile('game.js');
          previewRuntime.clearRuntime();
          previewRuntime.runPreview(project, project.entry);
        }}
      />
      {dialog === "add" && (
        <AddFileDialog
          project={files}
          onClose={() => setDialog(null)}
          onCreate={({ project, path }) => {
            updateFiles(activeTask.id, project);
            setActiveFile(path);
            setDialog(null);
          }}
        />
      )}
      {dialog === "reset" && (
        <EditorDialog
          title={selectedLesson.track === 'playground' ? 'Utworzyć pusty projekt?' : 'Przywrócić pliki zadania?'}
          onClose={() => setDialog(null)}
        >
          <p>
            Twoje zmiany i dodane pliki w tym zadaniu zostaną zastąpione plikami
            startowymi. Inne zadania pozostaną bez zmian.
          </p>
          <div className="editor-dialog-actions">
            <button
              className="button button--ghost"
              onClick={() => setDialog(null)}
            >
              Anuluj
            </button>
            <button className="button button--primary" onClick={handleReset}>
              Przywróć starter
            </button>
          </div>
        </EditorDialog>
      )}
      {dialog === "settings" && (
        <EditorDialog title="Ustawienia kursu" onClose={() => setDialog(null)}>
          <div className="settings-danger-zone">
            <h3>Twardy reset</h3>
            <p>
              Usuń osiągnięcia, wybór lekcji i wszystkie zapisane projekty. Użyj
              tej opcji, gdy po aktualizacji kurs wczytuje nieaktualne pliki.
            </p>
            <button
              className="button button--danger-outline"
              type="button"
              onClick={() => setDialog("hard-reset")}
            >
              Wykonaj twardy reset
            </button>
          </div>
          <div className="editor-dialog-actions">
            <button
              className="button button--ghost"
              type="button"
              onClick={() => setDialog(null)}
            >
              Zamknij
            </button>
          </div>
        </EditorDialog>
      )}
      {dialog === "hard-reset" && (
        <EditorDialog
          title="Usunąć cały postęp i projekty?"
          onClose={() => setDialog("settings")}
        >
          <p>
            Ta operacja usunie wszystkie lokalne szkice i osiągnięcia Web
            Learning Lab, łącznie z kopiami ze starszych wersji. Nie można jej
            cofnąć.
          </p>
          <div className="editor-dialog-actions">
            <button
              className="button button--ghost"
              type="button"
              onClick={() => setDialog("settings")}
            >
              Anuluj
            </button>
            <button
              className="button button--danger"
              type="button"
              onClick={() => {
                hardReset();
                localStorage.removeItem(workHistoryKey);
                setProjectRevision(value => value + 1);
                setActiveFile(starterEntry(activeTask, selectedLesson.track));
                setDialog(null);
                setSidebarOpen(false);
                previewRuntime.clearRuntime();
              }}
            >
              Usuń wszystko i zacznij od nowa
            </button>
          </div>
        </EditorDialog>
      )}
    </>
  );

  const inspector = (
    <>
      <PreviewInspector
        gameMode={files.runtime?.kind === 'game-js'}
        previewFiles={Object.keys(files.files).filter((path) =>
          path.endsWith(".html") || path.endsWith(".php"),
        )}
        previewPath={previewRuntime.previewPath}
        onPreviewPathChange={previewRuntime.setPreviewPath}
        previewDocument={previewRuntime.previewDocument}
        previewKey={previewRuntime.previewKey}
        autoPreview={previewRuntime.autoPreview}
        onAutoPreviewChange={previewRuntime.setAutoPreview}
        onMessage={previewRuntime.handleMessage}
        onFrameReady={previewRuntime.setFrame}
        runtimeState={{ ...previewRuntime.runtimeState, label: runtimeLabel }}
      />
    </>
  );

  return (
    <AppShell
      toolbarActions={files.runtime?.kind === 'game-js' ? <GameApiGuide /> : null}
      sidebar={sidebar}
      main={main}
      inspector={inspector}
      previewOpen={previewOpen}
      onPreviewToggle={togglePreview}
      sidebarOpen={sidebarOpen}
      onSidebarClose={() => setSidebarOpen(false)}
    />
  );
}
