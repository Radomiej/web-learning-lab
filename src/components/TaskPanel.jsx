import TaskList from './TaskList.jsx';
import MovementHint from '../../shared/lab-game-v2/editor/MovementHint.jsx';

export default function TaskPanel({ lesson, activeTask, completedTasks, onTaskChange }) {
  return (
    <section className="task-panel" aria-labelledby="task-panel-title">
      <div className="section-heading-row">
        <div>
          <h2 id="task-panel-title"><span aria-hidden="true">☑ </span>Zadania lekcji</h2>
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
        <MovementHint key={activeTask.id} taskId={activeTask.id} language="js" />
        <ol aria-label="Wymagania zadania">{activeTask.checks.filter(check => check.type !== 'runtimeError').map(check => <li key={check.id}>{check.label}</li>)}</ol>
        {activeTask.hint && <p className="task-hint"><strong>Podpowiedź:</strong> {activeTask.hint}</p>}
      </div>
    </section>
  );
}
