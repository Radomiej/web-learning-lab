import { useEffect, useRef, useState } from 'react';
import './LearningModule.css';

const stages = [['learn', 'Nauka'], ['quiz', 'Quiz'], ['task', 'Zadanie']];
export default function LearningModule({ enabled = true, stage, onChange, learning, quiz, children }) {
  const content = useRef(null);
  const [visited, setVisited] = useState(() => new Set([stage]));
  useEffect(() => { setVisited(previous => previous.has(stage) ? previous : new Set([...previous, stage])); }, [stage]);
  function go(next) {
    onChange(next);
    requestAnimationFrame(() => { content.current?.focus(); content.current?.scrollIntoView?.({ block: 'start' }); });
  }
  if (!enabled) return children;
  return <section className="learning-module" aria-label="Moduł lekcji">
    <nav className="learning-stages" aria-label="Etapy lekcji">
      {stages.map(([id, label], index) => <button key={id} type="button" aria-current={stage === id ? 'step' : undefined} onClick={() => go(id)}><span aria-hidden="true">{index + 1}</span>{label}</button>)}
    </nav>
    <div className="learning-stage-content" ref={content} tabIndex={-1}>
      <div hidden={stage !== 'learn'}>{(stage === 'learn' || visited.has('learn')) && learning}</div>
      <div hidden={stage !== 'quiz'}>{(stage === 'quiz' || visited.has('quiz')) && quiz}</div>
      <div hidden={stage !== 'task'}>{(stage === 'task' || visited.has('task')) && children}</div>
    </div>
    {stage === 'learn' && <button type="button" className="button button--primary learning-next" onClick={() => go('quiz')}>Sprawdź się w quizie →</button>}
  </section>;
}
