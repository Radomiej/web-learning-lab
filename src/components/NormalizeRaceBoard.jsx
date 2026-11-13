import { useEffect, useId, useRef, useState } from 'react';

function HandIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M9 11.5V5.2a1.4 1.4 0 0 1 2.8 0v5M11.8 10V3.8a1.4 1.4 0 0 1 2.8 0V10M14.6 10.4V5.6a1.4 1.4 0 0 1 2.8 0v7.9c0 3.6-2.4 6-5.7 6-3 0-4.6-1.6-5.6-4L4.3 11c-.4-1 .5-2 1.5-1.5L9 11.5Z"
      fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

const VECTORS = [
  { x: 3, y: 4, label: '(3, 4)' },
  { x: 1, y: 1, label: '(1, 1)' },
  { x: 5, y: 12, label: '(5, 12)' },
  { x: 1, y: 0, label: '(1, 0)' },
  { x: 0, y: 0, label: '(0, 0)' },
];
const SCALE = 0.5; // 1 px svg = 2 px świata; tor 300×160 px svg = 600×320 świata
const SPEED = 100;
const RUN_SECONDS = 2; // 1 s symulacji odtwarzana w 2 s dla czytelności

// Wyścig wektorów: dwie kulki lecą 1 s symulacji z tego samego punktu.
// „Surowy" mnoży direction przez speed bez normalizacji — dystans rośnie
// z długością wektora. „Znormalizowany" dzieli przez |v| — zawsze 100 px.
// Bajtowo identyczna w java-lab i web-learning-lab; kod w `code` z notatki.
export default function NormalizeRaceBoard({ code, speed = SPEED }) {
  const helpId = useId();
  const [hintVisible, setHintVisible] = useState(true);
  const touch = () => setHintVisible(false);

  const [vector, setVector] = useState(VECTORS[0]);
  const [t, setT] = useState(0); // 0..1 s symulacji
  const [running, setRunning] = useState(false);
  const raf = useRef();

  const length = Math.hypot(vector.x, vector.y);
  const ux = length ? vector.x / length : 0;
  const uy = length ? vector.y / length : 0;

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      setT((prev) => {
        const next = prev + dt / RUN_SECONDS;
        if (next >= 1) { setRunning(false); return 1; }
        return next;
      });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [running]);

  const startX = 20, startY = 30;
  const rawPos = { x: startX + vector.x * speed * t * SCALE, y: startY + vector.y * speed * t * SCALE };
  const normPos = { x: startX + ux * speed * t * SCALE, y: startY + uy * speed * t * SCALE };
  const rawDist = length * speed * t;
  const normDist = speed * t;
  const rawOut = rawPos.x > 300 || rawPos.y > 158;
  const done = t >= 1;

  return <div className="pilot-race-board" role="group"
    aria-label="Plansza wyścigu wektorów — normalizacja" aria-describedby={helpId}>
    <p id={helpId} className="pilot-race-help">
      Wybierz kierunek i uruchom wyścig: surowy leci direction·speed, znormalizowany direction/|v|·speed — ten sam kierunek, inny dystans.
    </p>
    <div className="pilot-race-stage">
      <svg viewBox="0 0 300 165" aria-hidden="true">
        <rect x="2" y="2" width="296" height="161" rx="8" className="pilot-race-world" />
        <circle cx={startX} cy={startY} r="3" className="pilot-race-start" />
        <line x1={startX} y1={startY} x2={Math.min(rawPos.x, 300)} y2={Math.min(rawPos.y, 160)}
          className="pilot-race-path-raw" />
        <line x1={startX} y1={startY} x2={normPos.x} y2={normPos.y}
          className="pilot-race-path-norm" />
        <circle cx={Math.min(rawPos.x, 296)} cy={Math.min(rawPos.y, 158)} r="6" className="pilot-race-dot-raw" />
        <circle cx={normPos.x} cy={normPos.y} r="6" className="pilot-race-dot-norm" />
        {done && length > 0 && <>
          <text x={Math.min(rawPos.x, 296) - 4} y={Math.min(rawPos.y, 158) - 10} textAnchor="end" className="pilot-race-label-raw">
            surowy: {rawDist.toFixed(0)} px{rawOut ? ' — wyleciał!' : ''}
          </text>
          <text x={normPos.x + 10} y={normPos.y + 4} className="pilot-race-label-norm">
            znormalizowany: {normDist.toFixed(0)} px
          </text>
        </>}
        <text x="290" y="155" textAnchor="end" className="pilot-race-scale">pole = 600×320 px świata</text>
      </svg>
      {hintVisible && <div className="pilot-race-hint"><HandIcon /><span>Uruchom wyścig!</span></div>}
    </div>
    <div className="pilot-race-controls">
      <span className="pilot-race-vectors" role="group" aria-label="Kierunek direction">
        {VECTORS.map((v) => <button key={v.label} type="button"
          className={`pilot-race-vector${v.label === vector.label ? ' is-active' : ''}`}
          aria-pressed={v.label === vector.label}
          onClick={() => { touch(); setVector(v); setT(0); setRunning(false); }}>{v.label}</button>)}
      </span>
      <button type="button" className="pilot-race-play" disabled={running || length === 0}
        onClick={() => { touch(); setT(0); setRunning(true); }}>
        {done ? 'Jeszcze raz' : 'Start (1 s)'}
      </button>
    </div>
    <pre className="pilot-race-code"><code>{code}</code></pre>
    <p role="status" className="pilot-race-status">
      {length === 0
        ? '|v| = 0 — nie dzielisz przez zero: obiekt stoi w miejscu'
        : `|v| = ${length % 1 ? length.toFixed(2) : length} · surowy: ${length % 1 ? (length * speed).toFixed(0) : length * speed} px/s · jednostkowy (${ux.toFixed(1)}, ${uy.toFixed(1)}) → zawsze ${speed} px/s`}
    </p>
  </div>;
}
