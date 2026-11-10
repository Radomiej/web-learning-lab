import { useEffect, useState } from 'react';
import { codeText } from './codeText.jsx';
import './StepTrial.css';

const PANEL_ORDER = [
  ['php', 'index.php'],
  ['mem', 'Obiekt w pamięci'],
  ['html', 'Wygenerowany HTML'],
  ['js', 'Skrypt w przeglądarce'],
  ['api', 'api.php (odpowiedź)'],
  ['result', 'Widok #result'],
];

// Próba krokowa dla zadań PHP → HTML → JS. Każdy krok pokazuje panele
// z bieżącą treścią (brakujące przejmują stan z kroku wcześniejszego)
// i podświetla panel, w którym aktualnie dzieje się akcja.
export default function StepTrial({ trace }) {
  const steps = trace?.steps ?? [];
  const [index, setIndex] = useState(0);
  useEffect(() => { setIndex(0); }, [trace]);

  const step = steps[index] ?? {};
  const panels = {};
  for (let k = 0; k <= index; k++) Object.assign(panels, steps[k]?.panels);
  const active = new Set([].concat(step.active ?? []));

  return (
    <div className="step-trial">
      <div className="step-trial-panels">
        {PANEL_ORDER.filter(([key]) => panels[key] != null).map(([key, label]) => (
          <figure key={key} className={`step-trial-panel step-trial-panel--${key}${active.has(key) ? ' is-active' : ''}`}>
            <figcaption>{label}</figcaption>
            {key === 'result'
              ? <p className="step-trial-result">{panels[key]}</p>
              : <pre className="step-trial-code"><code>{panels[key]}</code></pre>}
          </figure>
        ))}
      </div>
      <p className="step-trial-caption" role="status">{codeText(step.caption)}</p>
      <div className="step-trial-controls">
        <button type="button" className="button button--ghost" disabled={index === 0} onClick={() => setIndex(value => Math.max(0, value - 1))}>◀ Wstecz</button>
        <span className="step-trial-counter">Krok {index + 1} / {steps.length}</span>
        <button type="button" className="button button--primary" disabled={index >= steps.length - 1} onClick={() => setIndex(value => Math.min(steps.length - 1, value + 1))}>Następny krok ▶</button>
        <button type="button" className="button button--ghost" disabled={index === 0} onClick={() => setIndex(0)}>Od początku</button>
      </div>
    </div>
  );
}
