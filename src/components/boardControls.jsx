import { useId } from 'react';

// Wspólne kontrolki plansz „pilot" dla ścieżki układu (Flexbox/Grid).
// Grupy opcji to role="radiogroup" z przyciskami role="radio" — każdy
// przycisk osiągalny Tabem, a strzałki/Home/End przesuwają wybór w grupie.
// Suwaki to input[type=range] z podpisem i odczytem wartości.

export function RadioGroup({ label, value, onChange, options, onInteract }) {
  const id = useId();
  const pick = (option) => {
    onChange(option);
    onInteract?.();
  };
  const onKeyDown = (event) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const index = Math.max(0, options.findIndex(([option]) => option === value));
    const next = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? options.length - 1
        : (index + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + options.length) % options.length;
    pick(options[next][0]);
    event.currentTarget.parentElement?.querySelectorAll('[role="radio"]')?.[next]?.focus();
  };
  return (
    <div className="pilot-lb-group" role="radiogroup" aria-label={label} id={id}>
      <span className="pilot-lb-name">{label}</span>
      <div className="pilot-lb-options">
        {options.map(([option, text]) => (
          <button key={option} type="button" role="radio" aria-checked={value === option}
            className="pilot-lb-option" onClick={() => pick(option)} onKeyDown={onKeyDown}>
            {text ?? option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SliderRow({ label, value, min, max, step = 1, unit = 'px', onChange, onInteract }) {
  const id = useId();
  return (
    <div className="pilot-lb-group pilot-lb-slider">
      <label className="pilot-lb-name" htmlFor={id}>{label}</label>
      <input id={id} type="range" min={min} max={max} step={step} value={value}
        aria-valuetext={`${value}${unit}`}
        onChange={(event) => { onChange(Number(event.target.value)); onInteract?.(); }} />
      <output className="pilot-lb-value" htmlFor={id}>{value}{unit}</output>
    </div>
  );
}

export function HintBubble({ visible, children = 'Zmień właściwość!' }) {
  if (!visible) return null;
  return (
    <div className="pilot-lb-hint" data-testid="lb-hint">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 11.5 20 4l-4.5 16-4-6.5L4 11.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

// Przesuwa wybór w radiogroupie obsługiwanej własnym znacznikiem (np. klikalne
// elementy .item). Zwraca indeks następnej opcji albo null, gdy klawisz nie
// jest klawiszem nawigacji.
export function nextRadioIndex(event, current, count) {
  const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
  if (!keys.includes(event.key) || count < 1) return null;
  event.preventDefault();
  if (event.key === 'Home') return 0;
  if (event.key === 'End') return count - 1;
  const step = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
  return (current + step + count) % count;
}
