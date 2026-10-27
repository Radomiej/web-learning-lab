import { useState } from 'react';
import LessonInfographic from './LessonInfographic.jsx';
import PageDiagram from './PageDiagram.jsx';
import GameIntroDiagram from './GameIntroDiagram.jsx';
import CodeExample from './CodeExample.jsx';
import { gameExplanationPages } from './lessonVisuals.js';
import { gameIntroPages } from './gameIntroPages.js';
import { withConceptVisuals } from './lessonConcepts.js';
import './LessonExplanation.css';
import './GameIntroDiagram.css';

export function explanationPages(lesson) {
  const chapter = lesson.id?.replace(/^g2d\./, '');
  const gamePages = gameExplanationPages[chapter];
  if (gamePages && lesson.id?.startsWith('g2d.')) {
    const intro = gameIntroPages[lesson.id];
    if (intro) return chapter === 'input' ? [...intro, ...gamePages.slice(1)] : intro;
    return gamePages;
  }
  const blocks = (lesson.theory || []).map((block, index) => typeof block === 'string'
    ? { title: `Zasada ${index + 1}`, text: block }
    : block);
  const pages = blocks.flatMap(block => {
    const sentences = (block.text || '').split(/(?<=[.!?])\s+(?=[A-ZĄĆĘŁŃÓŚŹŻ])/u);
    const chunks = [];
    for (const sentence of sentences) {
      if (!chunks.length || (chunks[chunks.length - 1].length + sentence.length > 380)) chunks.push(sentence.trim());
      else chunks[chunks.length - 1] += ` ${sentence.trim()}`;
    }
    return chunks.map((text, index) => ({ title: block.title, text, code: index === chunks.length - 1 ? block.code : null }));
  });
  const objective = lesson.objective || lesson.objectives?.join(' ');
  if (objective && pages.length) pages.unshift({ title: 'Czego się nauczysz', text: objective });
  if (!pages.length) pages.push({ title: 'Cel lekcji', text: lesson.objective || lesson.objectives?.join(' ') || lesson.title });
  if (lesson.tips?.length) pages.push({ title: 'Zapamiętaj', text: lesson.tips.join(' ') });
  return withConceptVisuals(lesson, pages);
}

function ExplanationPages({ lesson, language }) {
  const pages = explanationPages(lesson);
  const [index, setIndex] = useState(0);
  const page = pages[index];
  const lang = language === 'javascript' ? 'js' : language;
  const pick = value => value && typeof value === 'object' ? value[lang] : value;
  const code = pick(page.code);
  const setupCode = pick(page.setupCode);
  const codeContext = pick(page.codeContext);
  return <section className="lesson-explanation" aria-label="Wyjaśnienie zagadnienia">
    <header className="explanation-header"><span>POZNAJ ZASADĘ</span><span aria-live="polite">{index + 1} / {pages.length}</span></header>
    <article className="explanation-copy" aria-live="polite" aria-atomic="true">
      <h2>{page.title}</h2><p>{page.text}</p>
      {setupCode && <><p className="game-intro-code-context">{lang === 'java' ? 'GameMain.onCreate()' : 'game.js · onCreate()'}: dodaj do przygotowanego Player</p><CodeExample code={setupCode} /></>}
      {code && <>{codeContext && <p className="game-intro-code-context">{codeContext}</p>}<CodeExample key={code} code={code} /></>}
      {page.result && <div className="concept-result"><span>Efekt tego przykładu</span><pre>{page.result}</pre></div>}
    </article>
    <div className="explanation-visual">{page.introDiagram ? <GameIntroDiagram kind={page.introDiagram} title={page.title} /> : page.visual ? <PageDiagram page={page} /> : <LessonInfographic lesson={{ ...lesson, theory: [page], tips: [page.text] }} language={language} />}</div>
    <nav className="explanation-pagination" aria-label="Strony wyjaśnienia">
      <button type="button" aria-label="Poprzedni krok" title="Poprzedni krok" disabled={index === 0} onClick={() => setIndex(index - 1)}><Arrow back /></button>
      <div className="explanation-pages">{pages.map((_, number) => <button type="button" key={number} aria-label={`Krok ${number + 1}`} aria-current={index === number ? 'step' : undefined} onClick={() => setIndex(number)}>{number + 1}</button>)}</div>
      <button type="button" aria-label="Następny krok" title="Następny krok" disabled={index === pages.length - 1} onClick={() => setIndex(index + 1)}><Arrow /></button>
    </nav>
  </section>;
}
function Arrow({ back }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={back ? 'm14 6-6 6 6 6' : 'm10 6 6 6-6 6'} /></svg>;
}
export default function LessonExplanation({ lesson, language = 'java' }) {
  return <ExplanationPages key={`${language}:${lesson.id}`} lesson={lesson} language={language} />;
}
