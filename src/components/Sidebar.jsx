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
  onClose,
  isOpen = false,
}) {
  const track = tracks[selectedTrack] || tracks[trackOrder[0]];
  const trackLessons = lessons.filter(
    (lesson) => lesson.track === selectedTrack,
  );
  const completedCount = completedTasks.length;
  const currentLesson = trackLessons.find(lesson => lesson.id === selectedLessonId) || trackLessons[0];

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
          className="sidebar-close-button"
          type="button"
          aria-label="Zamknij panel lekcji"
          onClick={onClose}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="m7 7 10 10M17 7 7 17" />
          </svg>
        </button>
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
                  lessons.reduce((sum, lesson) => sum + lesson.tasks.filter(task => task.mode !== 'playground').length, 0),
                )
              }%`,
            }}
          />
        </div>
        <span className="progress-caption">
          {completedCount} ukończonych zadań
        </span>
      </div>

      <div className="sidebar-navigation-scroll">
      <details className="sidebar-section sidebar-track-picker">
      <summary className="sidebar-track-trigger" aria-label="Wybierz ścieżkę">
        <span className="track-icon" style={{ '--track-accent': track.accent }} aria-hidden="true">{selectedTrack === 'game-dev' || selectedTrack === 'playground' ? <svg viewBox="0 0 24 24"><path d="M7 8h10a4 4 0 0 1 4 4l1 5-4 1-3-3H9l-3 3-4-1 1-5a4 4 0 0 1 4-4Z M7 10v4m-2-2h4m7-1h1m1 2h1" /></svg> : ({ html: '</>', css: '✦', layout: '▦', js: 'JS', react: '⚛', php: 'PHP' }[selectedTrack])}</span>
        <span className="sidebar-track-current"><small>Ścieżka nauki</small><strong>{track.label}</strong></span>
        <svg className="sidebar-track-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </summary>
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
              onClick={event => {
                const picker = event.currentTarget.closest('details');
                picker.open = false;
                picker.querySelector('summary')?.focus();
                onTrackChange(trackId);
              }}
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
                        : trackId === "react"
                          ? "⚛"
                          : trackId === "php"
                            ? "PHP"
                            : trackId === "game-dev" || trackId === "playground"
                              ? <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                                  <path d="M7 8h10a4 4 0 0 1 3.9 3.1l.9 4.6a2 2 0 0 1-3.4 1.8L16 15H8l-2.4 2.5a2 2 0 0 1-3.4-1.8l.9-4.6A4 4 0 0 1 7 8Z" />
                                  <path d="M7 10v4m-2-2h4" />
                                  <circle cx="16" cy="11" r=".8" />
                                  <circle cx="18.5" cy="13.5" r=".8" />
                                </svg>
                              : "?"}
              </span>
              <span>{item.label}</span>
              <span className="track-count">
                {lessons.filter((lesson) => lesson.track === trackId).length}
              </span>
            </button>
          );
        })}
      </div>

      </details>
      <details className="sidebar-section sidebar-track-picker sidebar-lesson-picker" key={selectedTrack}>
      <summary className="sidebar-track-trigger" aria-label="Wybierz lekcję">
        <span className="track-icon" aria-hidden="true">▤</span>
        <span className="sidebar-track-current"><small>Lekcja {currentLesson?.order}</small><strong>{currentLesson?.title || 'Własny projekt'}</strong></span>
        <svg className="sidebar-track-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </summary>
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
              onClick={event => {
                const picker = event.currentTarget.closest('details');
                picker.open = false;
                picker.querySelector('summary')?.focus();
                onLessonChange(lesson.id);
              }}
            >
              <span className="lesson-number">
                {String(lesson.order).padStart(2, "0")}
              </span>
              <span className="lesson-copy">
                <strong title={lesson.title}>{lesson.title}</strong>
                <small>{lesson.summary}</small>
                <em>
                  {lesson.track === 'playground' ? 'swobodna praca' : <>
                  {lesson.tasks.length}{" "}
                  {lesson.tasks.length === 1 ? "zadanie" : "zadania"}
                  </>}
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

      </details>
      </div>

      <div className="sidebar-footer">
        <span>{lessons.length} lekcji</span>
        <span className="offline-badge">
          <span className="status-dot" />
          lokalnie
        </span>
      </div>
    </nav>
  );
}
