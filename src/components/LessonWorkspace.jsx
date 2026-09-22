import CodeEditor from "./CodeEditor.jsx";
import EditorTabs from "./EditorTabs.jsx";
import FeedbackPanel from "./FeedbackPanel.jsx";
import LessonOverview from "./LessonOverview.jsx";
import TaskPanel from "./TaskPanel.jsx";

export default function LessonWorkspace({
  lesson,
  activeTask,
  activeFile,
  files,
  completedTasks,
  checkResults,
  runtimeErrors,
  onTaskChange,
  onFileChange,
  onCodeChange,
  onRun,
  onReset,
  onCheck,
  onSolution,
  onAddFile,
}) {
  const path = Object.hasOwn(files.files, activeFile)
    ? activeFile
    : files.entry;
  return (
    <div className="lesson-workspace">
      <LessonOverview lesson={lesson} />
      <TaskPanel
        lesson={lesson}
        activeTask={activeTask}
        completedTasks={completedTasks}
        onTaskChange={onTaskChange}
      />
      <section className="editor-section" aria-labelledby="editor-title">
        <div className="section-heading-row editor-section-heading">
          <div>
            <p className="eyebrow">Laboratorium kodu</p>
            <h2 id="editor-title">Zbuduj rozwiązanie</h2>
          </div>
        </div>
        <div className="editor-shell">
          <EditorTabs
            files={files.files}
            activeFile={path}
            onFileChange={onFileChange}
            onAddFile={onAddFile}
          />
          <CodeEditor
            key={`${activeTask.id}:${path}`}
            fileKey={path}
            fileLabel={path}
            value={files.files[path] || ""}
            onChange={(value) => onCodeChange(path, value)}
            onRun={onRun}
            onReset={onReset}
            onCheck={onCheck}
            onSolution={activeTask.mode === "guided" ? onSolution : undefined}
          />
        </div>
      </section>
      <FeedbackPanel
        checkResults={checkResults}
        runtimeErrors={runtimeErrors}
      />
    </div>
  );
}
