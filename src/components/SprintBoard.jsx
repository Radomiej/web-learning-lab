import { useEffect, useId, useRef, useState } from 'react';

function HandIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M9 11.5V5.2a1.4 1.4 0 0 1 2.8 0v5M11.8 10V3.8a1.4 1.4 0 0 1 2.8 0V10M14.6 10.4V5.6a1.4 1.4 0 0 1 2.8 0v7.9c0 3.6-2.4 6-5.7 6-3 0-4.6-1.6-5.6-4L4.3 11c-.4-1 .5-2 1.5-1.5L9 11.5Z"
      fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

// Plansza sprintu: postać biegnie w prawo i zawija się na krańcu toru.
// Przytrzymany Shift (klawisz albo przełącznik) podwaja prędkość z 100 do
// 200 px/s — to samo wywołanie move, inny argument speed. „Duch" biegnie
// stale 100 px/s: odstępstwo pokazuje, ile sprint daje w tym samym czasie.
// Bajtowo identyczna w java-lab i web-learning-lab; kod w `code` z notatki.
export default function SprintBoard({ code, base = 100, sprint = 200 }) {
  const helpId = useId();
  const [hintVisible, setHintVisible] = useState(true);
  const touch = () => setHintVisible(false);

  const [sprinting, setSprinting] = useState(false);
  const [pos, setPos] = useState({ x: 0, ghost: 0, dist: 0, ghostDist: 0 });
  const ref = useRef({ x: 0, ghost: 0, dist: 0, ghostDist: 0 });
  const sprintRef = useRef(false);
  sprintRef.current = sprinting;

  useEffect(() => {
    let raf; let last = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const speed = sprintRef.current ? sprint : base;
      const s = ref.current;
      s.dist += speed * dt;
      s.ghostDist += base * dt;
      s.x = s.dist % 300;
      s.ghost = s.ghostDist % 300;
      setPos({ ...s });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [base, sprint]);

  const onKey = (down) => (e) => {
    if (e.key === 'Shift') { touch(); setSprinting(down); }
  };

  const speed = sprinting ? sprint : base;
  const gap = pos.dist - pos.ghostDist; // >0: sprint wyprzedza tempo bazowe

  return <div className="pilot-sprint-board" role="group" tabIndex={0}
    aria-label="Plansza sprintu — przytrzymaj Shift lub przełącznik"
    aria-describedby={helpId}
    onKeyDown={onKey(true)} onKeyUp={onKey(false)} onBlur={() => setSprinting(false)}>
    <p id={helpId} className="pilot-sprint-help">
      Przytrzymaj Shift (klawisz lub przełącznik) — isKeyDown(Keys.SHIFT) zmienia argument speed w tym samym move(x, y, speed).
    </p>
    <div className="pilot-sprint-stage">
      <svg viewBox="0 0 320 120" aria-hidden="true">
        <rect x="2" y="2" width="316" height="116" rx="8" className="pilot-sprint-world" />
        <line x1="10" y1="86" x2="310" y2="86" className="pilot-sprint-track" />
        {[0, 75, 150, 225, 300].map((m) => <g key={m}>
          <line x1={10 + m} y1="82" x2={10 + m} y2="90" className="pilot-sprint-tick" />
          <text x={10 + m} y="102" textAnchor="middle" className="pilot-sprint-tick-label">{m}</text>
        </g>)}
        <g className="pilot-sprint-ghost" transform={`translate(${10 + pos.ghost} 60)`}>
          <rect x="-9" y="-9" width="18" height="18" rx="4" />
          <text x="0" y="26" textAnchor="middle" className="pilot-sprint-ghost-label">{base}</text>
        </g>
        <g className={`pilot-sprint-player${sprinting ? ' is-sprinting' : ''}`} transform={`translate(${10 + pos.x} 60)`}>
          <rect x="-9" y="-9" width="18" height="18" rx="4" />
          <text x="0" y="26" textAnchor="middle" className="pilot-sprint-player-label">Player</text>
        </g>
      </svg>
      {hintVisible && <div className="pilot-sprint-hint"><HandIcon /><span>Przytrzymaj Shift!</span></div>}
    </div>
    <div className="pilot-sprint-controls">
      <button type="button" role="switch" aria-checked={sprinting}
        className={`pilot-sprint-keycap${sprinting ? ' is-down' : ''}`}
        onClick={() => { touch(); setSprinting(!sprinting); }}>
        Shift
      </button>
      <span className="pilot-sprint-speed">speed = <strong>{speed}</strong> px/s</span>
      <span className="pilot-sprint-gap">{gap > 2 ? `sprint wyprzedza o ${gap.toFixed(0)} px` : 'ten sam dystans co duch'}</span>
    </div>
    <pre className="pilot-sprint-code"><code>{code}</code></pre>
    <p role="status" className="pilot-sprint-status">
      {sprinting
        ? `Shift wciśnięty → move(x, y, ${sprint}) — postać biegnie 2× szybciej niż duch (${base})`
        : `Move idzie ze speed = ${base}; Shift zmienia tylko argument speed, kierunek zostaje.`}
    </p>
  </div>;
}
