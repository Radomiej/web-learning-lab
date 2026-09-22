export default function Sidebar({
  tracks,
  trackOrder,
  lessons,
  selectedTrack,
  selectedLessonId,
  completedTasks,
  onTrackChange,
  onLessonChange,
  onOpenSettings,
  isOpen = false,
}) {
  const track = tracks[selectedTrack] || tracks[trackOrder[0]];
  const trackLessons = lessons.filter(
    (lesson) => lesson.track === selectedTrack,
  );
  const completedCount = completedTasks.length;

  return (
    <nav
      className="sidebar"
      aria-label="Nawigacja kursu"
      data-open={String(isOpen)}
    >
      <div className="sidebar-brand">
        <span className="brand-mark" aria-hidden="true">
          &lt;/&gt;
        </span>
        <div className="sidebar-brand-copy">
          <strong>Web Learning Lab</strong>
          <span>Ucz się przez budowanie</span>
        </div>
        <button
          className="sidebar-settings-button"
          type="button"
          aria-label="Ustawienia kursu"
          onClick={onOpenSettings}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
            <path d="M19 13.3v-2.6l-2-.6a7 7 0 0 0-.7-1.6l1-1.8-1.9-1.9-1.8 1a7 7 0 0 0-1.6-.7l-.6-2H8.8l-.6 2a7 7 0 0 0-1.6.7l-1.8-1-1.9 1.9 1 1.8a7 7 0 0 0-.7 1.6l-2 .6v2.6l2 .6a7 7 0 0 0 .7 1.6l-1 1.8 1.9 1.9 1.8-1a7 7 0 0 0 1.6.7l.6 2h2.6l.6-2a7 7 0 0 0 1.6-.7l1.8 1 1.9-1.9-1-1.8a7 7 0 0 0 .7-1.6l2-.6Z" />
          </svg>
        </button>
      </div>

      <div className="sidebar-progress" aria-label="Postęp kursu">
        <div className="progress-heading">
          <span>Twój postęp</span>
          <strong>{completedCount}</strong>
        </div>
        <div className="progress-track">
          <span
            style={{
              width: `${
                (100 * completedCount) /
                Math.max(
                  1,
                  lessons.reduce((sum, lesson) => sum + lesson.tasks.length, 0),
                )
              }%`,
            }}
          />
        </div>
        <span className="progress-caption">
          {completedCount} ukończonych zadań
        </span>
      </div>

      <div className="sidebar-section-title">Ścieżki nauki</div>
      <div className="track-list" role="tablist" aria-label="Ścieżki nauki">
        {trackOrder.map((trackId) => {
          const item = tracks[trackId];
          return (
            <button
              className={`track-button${selectedTrack === trackId ? " is-active" : ""}`}
              type="button"
              role="tab"
              aria-selected={selectedTrack === trackId}
              key={trackId}
              onClick={() => onTrackChange(trackId)}
            >
              <span
                className="track-icon"
                style={{ "--track-accent": item.accent }}
                aria-hidden="true"
              >
                {trackId === "html"
                  ? "</>"
                  : trackId === "css"
                    ? "✦"
                    : trackId === "layout"
                      ? "▦"
                      : trackId === "js"
                        ? "JS"
                        : "⚛"}
              </span>
              <span>{item.label}</span>
              <span className="track-count">
                {lessons.filter((lesson) => lesson.track === trackId).length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-section-heading">
        <span>{track?.label || "Lekcje"}</span>
        <span>{trackLessons.length} lekcji</span>
      </div>
      <div className="lesson-list">
        {trackLessons.map((lesson) => {
          const lessonComplete =
            lesson.tasks.length > 0 &&
            lesson.tasks.every((task) => completedTasks.includes(task.id));
          return (
            <button
              className={`lesson-button${selectedLessonId === lesson.id ? " is-active" : ""}`}
              type="button"
              key={lesson.id}
              aria-current={selectedLessonId === lesson.id ? "page" : undefined}
              onClick={() => onLessonChange(lesson.id)}
            >
              <span className="lesson-number">
                {String(lesson.order).padStart(2, "0")}
              </span>
              <span className="lesson-copy">
                <strong title={lesson.title}>{lesson.title}</strong>
                <small>{lesson.summary}</small>
                <em>
                  {lesson.tasks.length}{" "}
                  {lesson.tasks.length === 1 ? "zadanie" : "zadania"}
                </em>
              </span>
              {lessonComplete && (
                <span className="lesson-check" aria-label="Ukończona">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <span>39 lekcji</span>
        <span className="offline-badge">
          <span className="status-dot" />
          lokalnie
        </span>
      </div>
    </nav>
  );
}
