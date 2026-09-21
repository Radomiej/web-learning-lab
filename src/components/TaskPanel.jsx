import TaskList from './TaskList.jsx';

export default function TaskPanel({ lesson, activeTask, completedTasks, onTaskChange }) {
  return (
    <section className="task-panel" aria-labelledby="task-panel-title">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Ćwiczenie</p>
          <h2 id="task-panel-title">Zadania lekcji</h2>
        </div>
        <span className="count-badge">{lesson.tasks.length}</span>
      </div>
      <TaskList
        tasks={lesson.tasks}
        activeTaskId={activeTask.id}
        completedTasks={completedTasks}
        onTaskChange={onTaskChange}
      />
      <div className="task-prompt">
        <span className="prompt-label">{activeTask.mode === 'challenge' ? 'Wyzwanie' : 'Cel zadania'}</span>
        <p>{activeTask.prompt}</p>
        {activeTask.hint && <p className="task-hint"><strong>Podpowiedź:</strong> {activeTask.hint}</p>}
      </div>
    </section>
  );
}
