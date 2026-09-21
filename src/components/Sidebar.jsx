const modeLabels = {
  guided: 'Prowadzone',
  independent: 'Samodzielnie',
  challenge: 'Wyzwanie',
};

export default function Sidebar({
  tracks,
  trackOrder,
  lessons,
  selectedTrack,
  selectedLessonId,
  completedTasks,
  onTrackChange,
  onLessonChange,
  isOpen = false,
}) {
  const track = tracks[selectedTrack] || tracks[trackOrder[0]];
  const trackLessons = lessons.filter((lesson) => lesson.track === selectedTrack);
  const completedCount = completedTasks.length;

  return (
    <nav className="sidebar" aria-label="Nawigacja kursu" data-open={String(isOpen)}>
      <div className="sidebar-brand">
        <span className="brand-mark" aria-hidden="true">&lt;/&gt;</span>
        <div>
          <strong>Web Learning Lab</strong>
          <span>Ucz się przez budowanie</span>
        </div>
      </div>

      <div className="sidebar-progress" aria-label="Postęp kursu">
        <div className="progress-heading"><span>Twój postęp</span><strong>{completedCount}</strong></div>
        <div className="progress-track"><span style={{ width: `${Math.min(100, completedCount * 4)}%` }} /></div>
        <span className="progress-caption">{completedCount} ukończonych zadań</span>
      </div>

      <div className="sidebar-section-title">Ścieżki nauki</div>
      <div className="track-list" role="tablist" aria-label="Ścieżki nauki">
        {trackOrder.map((trackId) => {
          const item = tracks[trackId];
          return (
            <button
              className={`track-button${selectedTrack === trackId ? ' is-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={selectedTrack === trackId}
              key={trackId}
              onClick={() => onTrackChange(trackId)}
            >
              <span className="track-icon" style={{ '--track-accent': item.accent }} aria-hidden="true">
                {trackId === 'html' ? '</>' : trackId === 'css' ? '✦' : trackId === 'layout' ? '▦' : trackId === 'js' ? 'JS' : '⚛'}
              </span>
              <span>{item.label}</span>
              <span className="track-count">{lessons.filter((lesson) => lesson.track === trackId).length}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-section-heading">
        <span>{track?.label || 'Lekcje'}</span>
        <span>{trackLessons.length} lekcji</span>
      </div>
      <div className="lesson-list">
        {trackLessons.map((lesson) => {
          const lessonComplete = lesson.tasks.length > 0 && lesson.tasks.every((task) => completedTasks.includes(task.id));
          return (
            <button
              className={`lesson-button${selectedLessonId === lesson.id ? ' is-active' : ''}`}
              type="button"
              key={lesson.id}
              aria-current={selectedLessonId === lesson.id ? 'page' : undefined}
              onClick={() => onLessonChange(lesson.id)}
            >
              <span className="lesson-number">{String(lesson.order).padStart(2, '0')}</span>
              <span className="lesson-copy">
                <strong title={lesson.title}>{selectedLessonId === lesson.id ? `Lekcja ${String(lesson.order).padStart(2, '0')}` : lesson.title}</strong>
                <small>{lesson.summary}</small>
                <em>{lesson.tasks.length} {lesson.tasks.length === 1 ? 'zadanie' : 'zadań'} · {modeLabels[lesson.tasks[0]?.mode] || 'praktyka'}</em>
              </span>
              {lessonComplete && <span className="lesson-check" aria-label="Ukończona">✓</span>}
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <span>39 lekcji</span>
        <span className="offline-badge"><span className="status-dot" />lokalnie</span>
      </div>
    </nav>
  );
}
