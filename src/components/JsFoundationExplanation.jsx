import { useRef, useState } from 'react';
import CodeExample from '../../shared/lab-game-v2/editor/CodeExample.jsx';
import { jsCoursePages } from '../data/jsCoursePages.js';
import { lessonInfographics,lessonStepInfographics } from '../data/lessonInfographics.js';
import HtmlLessonExample from './HtmlLessonExample.jsx';
import './JsCourse.css';

export default function JsFoundationExplanation({ lesson, pages = jsCoursePages[lesson.id] }) {
  const [index, setIndex] = useState(0);
  const heading = useRef(null);
  const page = pages[index];
  const illustration = index === 0 ? lessonInfographics[lesson.id] : lessonStepInfographics[`${lesson.id}:${index}`];
  const imagePath = page.image?.startsWith('/') ? page.image : `/course-assets/js-foundations/${page.image}.png`;
  function go(next) {
    setIndex(next);
    heading.current?.focus();
  }
  return <section className="js-foundation" aria-label="Wyjaśnienie krok po kroku">
    <header className="js-foundation-header"><span>POZNAJ → PRZEŚLEDŹ → SPRÓBUJ</span><span aria-live="polite">Krok {index + 1} z {pages.length}</span></header>
    <article className="js-foundation-body">
      <h2 ref={heading} tabIndex={-1}>{page.title}</h2>
      <p>{page.text}</p>
      {page.markup && <><p className="js-code-label"><strong>HTML — przygotuj strukturę</strong></p><CodeExample key={page.markup} code={page.markup} /><p className="js-code-label"><strong>{lesson.track === 'php' ? 'PHP' : 'JavaScript'} — zachowanie</strong></p></>}
      {page.code && <CodeExample key={page.code} code={page.code} />}
      {page.parts && <dl className="js-code-parts">{page.parts.map(([code, meaning]) => <div key={code}><dt><code>{code}</code></dt><dd>{meaning}</dd></div>)}</dl>}
      <aside className="js-program-result"><strong>Co się dzieje?</strong><p>{page.result}</p></aside>
      {lesson.track==='html' && !illustration && <HtmlLessonExample page={page}/>}
      {illustration && <TeachingFigure src={illustration.src} alt={illustration.alt} title={page.title} />}
      {page.image && (illustration ? <details className="js-predict"><summary>Dokładny schemat kodu</summary><TeachingFigure src={imagePath} alt={page.alt} title={page.title} /></details> : <TeachingFigure src={imagePath} alt={page.alt} title={page.title} />)}
      {page.question && <details className="js-predict" key={index}><summary>{page.question}</summary><p>{page.answer}</p></details>}
    </article>
    <nav className="js-step-navigation" aria-label="Kroki lekcji">
      <button type="button" disabled={index === 0} onClick={() => go(index - 1)}>← Wstecz</button>
      <div>{pages.map((step, i) => <button type="button" key={step.title} aria-label={`Krok ${i + 1}: ${step.title}`} aria-current={i === index ? 'step' : undefined} onClick={() => go(i)}>{i + 1}</button>)}</div>
      <button type="button" disabled={index === pages.length - 1} onClick={() => go(index + 1)}>Dalej →</button>
    </nav>
  </section>;
}

function TeachingFigure({src,alt,title}) {
  return <figure className="js-teaching-image"><a href={src} target="_blank" rel="noopener noreferrer" aria-label={`Otwórz pełną infografikę: ${title}`}><img src={src} alt={alt} width={src.endsWith('.svg') ? 1100 : 1536} height={src.endsWith('.svg') ? 650 : 1024} loading="lazy" /></a><figcaption>{alt}</figcaption></figure>;
}
