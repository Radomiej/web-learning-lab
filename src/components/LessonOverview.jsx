export default function LessonOverview({ lesson }) {
  return (
    <section className="lesson-overview" aria-labelledby="lesson-title">
      <div className="breadcrumb"><span>KURS WEB</span><span aria-hidden="true">/</span><span>{lesson.track.toUpperCase()}</span></div>
      <div className="lesson-heading-row">
        <div>
          <p className="eyebrow">Lekcja {String(lesson.order).padStart(2, '0')}</p>
          <h1 id="lesson-title">{lesson.title}</h1>
          <p className="lesson-summary">{lesson.summary}</p>
        </div>
      </div>
      <div className="overview-grid">
        <div className="overview-block">
          <h2>Po tej lekcji</h2>
          <ul>
            {lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}
          </ul>
        </div>
        <div className="overview-block overview-theory">
          <h2>Najważniejsze zasady</h2>
          {lesson.theory.slice(0, 2).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
    </section>
  );
}
