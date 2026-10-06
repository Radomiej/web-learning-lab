import CodeEditor from "./CodeEditor.jsx";
import EditorTabs from "./EditorTabs.jsx";
import FeedbackPanel from "./FeedbackPanel.jsx";
import LessonOverview from "./LessonOverview.jsx";
import TaskPanel from "./TaskPanel.jsx";
import RuntimeConsole from './RuntimeConsole.jsx';
import PlaygroundTools from './PlaygroundTools.jsx';
import GameTutor from './GameTutor.jsx';

export default function LessonWorkspace({
  lesson,
  activeTask,
  activeFile,
  files,
  completedTasks,
  checkResults,
  runtimeErrors,
  runtimeState,
  onTaskChange,
  onFileChange,
  onCodeChange,
  onRun,
  onSave,
  onReset,
  onCheck,
  onSolution,
  onAddFile,
  onImportProject,
  projectRevision,
  onTutorApply,
  nextLesson,
  onNextLesson,
}) {
  const playground = lesson.track === 'playground';
  const path = Object.hasOwn(files.files, activeFile)
    ? activeFile
    : files.entry;
  return (
    <div className="lesson-workspace">
      {playground ? <section className="lesson-overview"><p className="eyebrow">Playground · GameLab</p><h1>{lesson.title}</h1><p className="lesson-summary">{lesson.summary}</p><PlaygroundTools project={files} onImport={onImportProject} /></section> : <LessonOverview lesson={lesson} />}
      {playground && <GameTutor key={`${activeTask.id}:${projectRevision}`} project={files} projectRevision={projectRevision} onApply={onTutorApply} />}
      {!playground && <TaskPanel
        lesson={lesson}
        activeTask={activeTask}
        completedTasks={completedTasks}
        onTaskChange={onTaskChange}
      />}
      <section className="editor-section" aria-labelledby="editor-title">
        <div className="section-heading-row editor-section-heading">
          <div>
            <h2 id="editor-title"><span aria-hidden="true">⌨ </span>{playground ? 'Twój projekt' : 'Zbuduj rozwiązanie'}</h2>
          </div>
        </div>
        <div className="editor-shell">
          <EditorTabs
            files={files.files}
            activeFile={path}
            onFileChange={onFileChange}
            onAddFile={onAddFile}
            runtime={files.runtime}
          />
          <CodeEditor
            fileKey={path}
            fileLabel={path}
            workspaceKey={activeTask.id}
            gameDev={files.runtime?.kind === 'game-js'}
            value={files.files[path] || ""}
            onChange={onCodeChange}
            onRun={onRun}
            onSave={onSave}
            onReset={onReset}
            resetLabel={playground ? 'Nowy projekt' : 'Przywróć start'}
            onCheck={playground ? undefined : onCheck}
            onSolution={activeTask.mode === "guided" ? onSolution : undefined}
          />
          <RuntimeConsole messages={runtimeState?.messages} errors={runtimeErrors} status={runtimeState?.status} />
        </div>
      </section>
      {!playground && <FeedbackPanel
        checkResults={checkResults}
        runtimeErrors={runtimeErrors}
      />}
      {!playground && lesson.tasks.length > 0 && lesson.tasks.every(task => completedTasks.includes(task.id)) && <section className="lesson-complete" aria-label="Lekcja ukończona"><p><span aria-hidden="true">✓ </span>Lekcja zaliczona!</p>{nextLesson ? <button className="button button--primary" type="button" onClick={onNextLesson}>Następna lekcja: {nextLesson.title} <span aria-hidden="true">→</span></button> : <p>To ostatnia lekcja tej ścieżki.</p>}</section>}
    </div>
  );
}
