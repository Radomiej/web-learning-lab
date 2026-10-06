export default function LessonOverview({ lesson }) {
  return (
    <section className="lesson-overview" aria-labelledby="lesson-title">
      <p className="lesson-meta">Kurs Web · {lesson.track.toUpperCase()} · Lekcja {lesson.order}</p>
      <div className="lesson-heading-row">
        <div>
          <h1 id="lesson-title"><span aria-hidden="true">▤ </span>{lesson.title}</h1>
        </div>
      </div>
      <div className="overview-grid">
        <div className="overview-block">
          <h2><span aria-hidden="true">◎ </span>Cel lekcji</h2>
          <ul>
            {lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}
          </ul>
        </div>
        <div className="overview-block overview-theory">
          <h2><span aria-hidden="true">ⓘ </span>Zasady</h2>
          {lesson.theory.slice(0, 2).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
    </section>
  );
}
