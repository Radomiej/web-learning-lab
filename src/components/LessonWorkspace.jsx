import CodeEditor from './CodeEditor.jsx';
import EditorTabs, { tabs } from './EditorTabs.jsx';
import FeedbackPanel from './FeedbackPanel.jsx';
import LessonOverview from './LessonOverview.jsx';
import TaskPanel from './TaskPanel.jsx';

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
}) {
  const activeTab = tabs.find((tab) => tab.key === activeFile) || tabs[0];
  return (
    <div className="lesson-workspace">
      <LessonOverview lesson={lesson} />
      <TaskPanel lesson={lesson} activeTask={activeTask} completedTasks={completedTasks} onTaskChange={onTaskChange} />
      <section className="editor-section" aria-labelledby="editor-title">
        <div className="section-heading-row editor-section-heading">
          <div><p className="eyebrow">Laboratorium kodu</p><h2 id="editor-title">Zbuduj rozwiązanie</h2></div>
          <span className="file-count">4 pliki dostępne</span>
        </div>
        <div className="editor-shell">
          <EditorTabs activeFile={activeFile} onFileChange={onFileChange} />
          <CodeEditor
            key={`${activeTask.id}:${activeFile}`}
            fileKey={activeFile}
            fileLabel={activeTab.label}
            value={files[activeFile] || ''}
            onChange={(value) => onCodeChange(activeFile, value)}
            onRun={onRun}
            onReset={onReset}
            onCheck={onCheck}
            onSolution={activeTask.mode === 'guided' ? onSolution : undefined}
          />
        </div>
      </section>
      <FeedbackPanel checkResults={checkResults} runtimeErrors={runtimeErrors} />
    </div>
  );
}
