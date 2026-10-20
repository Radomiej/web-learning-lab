import CopyLessonLink from './CopyLessonLink.jsx';
import LessonExplanation from '../../shared/lab-game-v2/editor/LessonExplanation.jsx';
import JsFoundationExplanation from './JsFoundationExplanation.jsx';
import { jsCoursePages } from '../data/jsCoursePages.js';
import { htmlCssTeachingPages } from '../data/htmlCssTeachingPages.js';
import { phpTeachingPages } from '../data/phpTeachingPages.js';
import { reactTeachingPages } from '../data/reactTeachingPages.js';
export default function LessonOverview({ lesson, headingOnly = false, learningOnly = false }) {
  const teachingPages = jsCoursePages[lesson.id] || htmlCssTeachingPages[lesson.id] || phpTeachingPages[lesson.id] || reactTeachingPages[lesson.id];
  return (
    <section className="lesson-overview" aria-labelledby="lesson-title">
      {!learningOnly && <><p className="lesson-meta">Kurs Web · {lesson.track.toUpperCase()} · Lekcja {lesson.order}</p>
      <div className="lesson-heading-row">
        <div>
          <h1 id="lesson-title"><span aria-hidden="true">▤ </span>{lesson.title}</h1>
        </div>
      </div>
      <CopyLessonLink />
      </>}
      {!headingOnly && <>{teachingPages
        ? <JsFoundationExplanation key={lesson.id} lesson={lesson} pages={teachingPages} />
        : <LessonExplanation lesson={lesson} language="javascript" />}
      {lesson.track === 'php' && <p className="js-generator-link"><a href={lesson.id === 'php-post-forms' ? 'https://www.w3schools.com/php/php_forms.asp' : 'https://www.w3schools.com/php/'} target="_blank" rel="noopener noreferrer">Więcej przykładów — W3Schools ↗</a></p>}
      </>}
    </section>
  );
}
