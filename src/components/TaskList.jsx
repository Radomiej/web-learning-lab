const modeLabels = {
  guided: 'Z przykładem',
  independent: 'Samodzielnie',
  challenge: 'Wyzwanie',
};

export default function TaskList({ tasks = [], activeTaskId, completedTasks = [], onTaskChange }) {
  return (
    <ul className="task-list" aria-label="Zadania lekcji">
      {tasks.map((task, index) => {
        const completed = completedTasks.includes(task.id);
        return (
          <li key={task.id}><button
            className={`task-button${activeTaskId === task.id ? ' is-active' : ''}`}
            type="button"
            aria-pressed={activeTaskId === task.id}
            key={task.id}
            onClick={() => onTaskChange(task.id)}
          >
            <span className={`task-index task-index--${task.mode}`}>{completed ? '✓' : index + 1}</span>
            <span className="task-button-copy">
              <small>{modeLabels[task.mode] || task.mode}</small>
              <strong>{task.title}</strong>
            </span>
            {completed && <span className="task-done-label">gotowe</span>}
          </button></li>
        );
      })}
    </ul>
  );
}
