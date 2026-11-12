import {useState,useEffect} from 'react';
import GuidedChange from '../../shared/lab-game-v2/editor/GuidedChange.jsx';
import {changedRange} from '../../shared/lab-game-v2/editor/guidedChanges.js';
import CodeEditor from "./CodeEditor.jsx";
import EditorTabs from "./EditorTabs.jsx";
import FeedbackPanel from "./FeedbackPanel.jsx";
import LessonOverview from "./LessonOverview.jsx";
import TaskPanel from "./TaskPanel.jsx";
import RuntimeConsole from './RuntimeConsole.jsx';
import PlaygroundTools from './PlaygroundTools.jsx';
import GameTutor from './GameTutor.jsx';
import GameCoursePdf from './GameCoursePdf.jsx';
import LearningModule from './LearningModule.jsx';
import LessonPilot from './LessonPilot.jsx';
import JsLessonQuiz from './JsLessonQuiz.jsx';
import PhpMysqlShell from './PhpMysqlShell.jsx';
import {taskLearningFor} from '../data/taskLearning.js';

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
  stage = 'learn',
  onStageChange,
  inlinePreview,
}) {
  const [showChange,setShowChange]=useState(false);
  useEffect(()=>setShowChange(false),[activeTask.id]);
  const applySolution=()=>{onSolution?.();setShowChange(true);};
  const playground = lesson.track === 'playground';
  const modular = ['js', 'html', 'html-gd', 'css', 'css-gd', 'php', 'react'].includes(lesson.track);
  const taskIndex = lesson.tasks.findIndex(task => task.id === activeTask.id);
  const nextTask = lesson.tasks[taskIndex + 1];
  const path = Object.hasOwn(files.files, activeFile)
    ? activeFile
    : files.entry;
  const taskLearning = taskLearningFor(activeTask.id);

  const editorSection = (
    <section className="editor-section" aria-labelledby="editor-title">
      <div className="section-heading-row editor-section-heading">
        <div>
          <h2 id="editor-title"><span aria-hidden="true">⌨ </span>{playground ? 'Twój projekt' : 'Zbuduj rozwiązanie'}</h2>
        </div>
      </div>
      <div className="editor-shell">
        <EditorTabs
          workspaceKey={activeTask.id}
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
          onReset={()=>{setShowChange(false);onReset?.();}}
          resetLabel={playground ? 'Nowy projekt' : 'Przywróć start'}
          onCheck={playground ? undefined : onCheck}
          onSolution={!taskLearning && activeTask.mode === "guided" ? applySolution : undefined}
          highlight={showChange&&activeTask.solutionExplanation?changedRange(activeTask.starter.files[path]??'',files.files[path]??''):null}
        />
        <RuntimeConsole messages={runtimeState?.messages} errors={runtimeErrors} status={runtimeState?.status} />
      </div>
    </section>
  );
  const feedbackPanel = !playground && <FeedbackPanel checkResults={checkResults} runtimeErrors={runtimeErrors} />;
  const completion = !playground && lesson.tasks.length > 0 && lesson.tasks.every(task => completedTasks.includes(task.id)) && <section className="lesson-complete" aria-label="Lekcja ukończona"><p><span aria-hidden="true">✓ </span>Lekcja zaliczona!</p>{nextLesson ? <button className="button button--primary" type="button" onClick={onNextLesson}>Następna lekcja: {nextLesson.title} <span aria-hidden="true">→</span></button> : <p>To ostatnia lekcja tej ścieżki.</p>}</section>;
  const nextNav = !playground && <nav className="task-next-navigation" aria-label="Kolejne zadanie">{nextTask ? <button className="button button--primary" type="button" onClick={() => onTaskChange(nextTask.id)}>Następne zadanie →</button> : nextLesson && !lesson.tasks.every(task => completedTasks.includes(task.id)) ? <button className="button button--primary" type="button" onClick={onNextLesson}>Następna lekcja →</button> : null}</nav>;

  if (taskLearning) {
    return (
      <div className="lesson-workspace lesson-workspace--pilot">
        <LessonOverview lesson={lesson} headingOnly />
        <LessonPilot
          lesson={lesson}
          activeTask={activeTask}
          learning={taskLearning}
          completedTasks={completedTasks}
          onTaskChange={onTaskChange}
          onNextLesson={onNextLesson}
          editor={editorSection}
          preview={inlinePreview}
          feedback={feedbackPanel}
          submission={completion}
          studentHtml={files.files['index.html'] ?? files.files[files.entry] ?? ''}
        />
      </div>
    );
  }

  return (
    <div className="lesson-workspace">
      {playground ? <section className="lesson-overview"><p className="eyebrow">Playground · GameLab</p><h1>{lesson.title}</h1><p className="lesson-summary">{lesson.summary}</p><PlaygroundTools project={files} onImport={onImportProject} /></section> : <LessonOverview lesson={lesson} headingOnly={modular} />}
      <LearningModule enabled={modular} stage={stage} onChange={onStageChange} learning={<LessonOverview lesson={lesson} learningOnly />} quiz={<JsLessonQuiz key={lesson.id} lesson={lesson} standalone onContinue={() => onStageChange('task')} />}>
      {(playground || lesson.track === 'game-dev') && <><GameCoursePdf key={lesson.id} /><p className="task-hint">PDF startowy: aktualny program 24 lekcji i pierwszych pięć lekcji JS. Materiały o kamerze i tweenach uzupełniają lekcje 15–17 i 19.</p></>}
      {playground && <GameTutor key={`${activeTask.id}:${projectRevision}`} project={files} projectRevision={projectRevision} onApply={onTutorApply} />}
      {!playground && <TaskPanel
        lesson={lesson}
        activeTask={activeTask}
        completedTasks={completedTasks}
        onTaskChange={onTaskChange}
      />}
      {lesson.id === 'php-sqlite-pdo' && <PhpMysqlShell />}
      {showChange && <GuidedChange starter={activeTask.starter.files} solution={activeTask.solution.files} explanation={activeTask.solutionExplanation} />}
      {editorSection}
      {feedbackPanel}
      {completion}
      {nextNav}
      </LearningModule>
    </div>
  );
}
