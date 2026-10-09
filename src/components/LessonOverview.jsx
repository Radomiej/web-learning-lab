import LessonExplanation from '../../shared/lab-game-v2/editor/LessonExplanation.jsx';
export default function LessonOverview({ lesson }) {
  return (
    <section className="lesson-overview" aria-labelledby="lesson-title">
      <p className="lesson-meta">Kurs Web · {lesson.track.toUpperCase()} · Lekcja {lesson.order}</p>
      <div className="lesson-heading-row">
        <div>
          <h1 id="lesson-title"><span aria-hidden="true">▤ </span>{lesson.title}</h1>
        </div>
      </div>
      <LessonExplanation lesson={lesson} language="javascript" />
    </section>
  );
}
