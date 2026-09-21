const modeLabels = {
  guided: 'Prowadzone',
  independent: 'Samodzielnie',
  challenge: 'Wyzwanie',
};

export default function TaskList({ tasks = [], activeTaskId, completedTasks = [], onTaskChange }) {
  return (
    <div className="task-list" role="list" aria-label="Zadania lekcji">
      {tasks.map((task, index) => {
        const completed = completedTasks.includes(task.id);
        return (
          <button
            className={`task-button${activeTaskId === task.id ? ' is-active' : ''}`}
            type="button"
            role="listitem"
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
          </button>
        );
      })}
    </div>
  );
}
