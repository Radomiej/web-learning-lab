import { useEffect, useId, useRef, useState } from 'react';

function HandIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M9 11.5V5.2a1.4 1.4 0 0 1 2.8 0v5M11.8 10V3.8a1.4 1.4 0 0 1 2.8 0V10M14.6 10.4V5.6a1.4 1.4 0 0 1 2.8 0v7.9c0 3.6-2.4 6-5.7 6-3 0-4.6-1.6-5.6-4L4.3 11c-.4-1 .5-2 1.5-1.5L9 11.5Z"
      fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

const FPS_OPTIONS = [30, 60, 120];
const MAX_EVENTS = 7;

// Plansza cyklu życia komponentu: tworzy obiekt, tick'uje onUpdate(delta)
// w wybranym tempie FPS i pokazuje dziennik zdarzeń oraz oś czasu ticków.
// Mniej FPS = większe delta, ale elapsed idzie tym samym tempem — silnik
// mnoży ruch przez delta, więc 0.3 s symulacji to zawsze 0.3 s.
// Bajtowo identyczna w java-lab i web-learning-lab.
export default function LifecycleBoard({ variant = 'counter', life = 0.3, objectName = 'Spark' }) {
  const helpId = useId();
  const [hintVisible, setHintVisible] = useState(true);
  const touch = () => setHintVisible(false);

  const [fps, setFps] = useState(60);
  const [alive, setAlive] = useState(false);
  const [snap, setSnap] = useState({ ticks: 0, elapsed: 0, events: [] });
  const sim = useRef({ ticks: 0, elapsed: 0, events: [] });

  const delta = 1 / fps;

  const pushEvent = (text) => {
    sim.current.events = [...sim.current.events, { t: sim.current.elapsed, text }].slice(-MAX_EVENTS);
  };

  const create = () => {
    touch();
    sim.current = { ticks: 0, elapsed: 0, events: [{ t: 0, text: 'onCreate() — raz, przy utworzeniu' }] };
    setSnap({ ...sim.current });
    setAlive(true);
  };

  const destroy = (manual) => {
    if (!alive) return;
    pushEvent(manual ? 'onDestroy() — usunięcie obiektu' : 'onDestroy() — koniec czasu życia');
    setSnap({ ...sim.current });
    setAlive(false);
  };

  useEffect(() => {
    if (!alive) return;
    const step = 1 / fps;
    const id = setInterval(() => {
      sim.current.elapsed += step;
      sim.current.ticks += 1;
      if (variant === 'lifetime' && sim.current.elapsed >= life) {
        destroy(false);
        return;
      }
      pushEvent(`onUpdate(${step.toFixed(3)}) → ticks = ${sim.current.ticks}`);
      setSnap({ ...sim.current });
    }, 1000 / fps);
    return () => clearInterval(id);
  }, [alive, fps]);

  const remaining = Math.max(life - snap.elapsed, 0);
  const progress = variant === 'lifetime' ? Math.min(snap.elapsed / life, 1) : 0;

  // Oś czasu: kreski ticków z ostatnich 1.2 s — przy 30 FPS rzadkie,
  // przy 120 gęste, ale elapsed na końcu okna jest ten sam.
  const tickMarks = [];
  if (alive) {
    const window = 1.2;
    const start = Math.max(0, snap.elapsed - window);
    for (let t = Math.ceil(start / delta) * delta; t <= snap.elapsed + 1e-9; t += delta) {
      tickMarks.push(t);
    }
  }
  const axisX = (t) => 40 + (t / 1.2) * 240;

  return <div className="pilot-lifecycle-board" role="group"
    aria-label="Plansza cyklu życia komponentu" aria-describedby={helpId}>
    <p id={helpId} className="pilot-lifecycle-help">
      Utwórz obiekt — onCreate() odpala raz, onUpdate(delta) co klatkę. Zmień FPS: mniej klatek = większe delta, ale elapsed idzie tak samo.
    </p>
    <div className="pilot-lifecycle-stage">
      <svg viewBox="0 0 320 120" aria-hidden="true">
        <rect x="2" y="2" width="316" height="116" rx="8" className="pilot-lifecycle-world" />
        {alive ? <>
          <rect x="110" y="18" width="100" height="44" rx="8" className="pilot-lifecycle-object" />
          <text x="160" y="36" textAnchor="middle" className="pilot-lifecycle-name">{objectName}</text>
          <text x="160" y="52" textAnchor="middle" className="pilot-lifecycle-ticks">
            {variant === 'lifetime' ? `remaining = ${remaining.toFixed(2)} s` : `ticks = ${snap.ticks}`}
          </text>
          {variant === 'lifetime' && <>
            <rect x="110" y="68" width="100" height="6" rx="3" className="pilot-lifecycle-track" />
            <rect x="110" y="68" width={100 * progress} height="6" rx="3" className="pilot-lifecycle-fill" />
          </>}
        </> : <>
          <rect x="110" y="18" width="100" height="44" rx="8" className="pilot-lifecycle-ghost" />
          <text x="160" y="44" textAnchor="middle" className="pilot-lifecycle-ghost-label">
            {snap.events.length ? 'zniszczony' : 'brak obiektu'}
          </text>
        </>}
        <line x1="40" y1="98" x2="280" y2="98" className="pilot-lifecycle-axis" />
        {tickMarks.map((t) => <line key={t.toFixed(4)} x1={axisX(t)} y1="93" x2={axisX(t)} y2="103"
          className="pilot-lifecycle-mark" />)}
        <text x="40" y="112" className="pilot-lifecycle-axis-label">ticki ({fps} FPS)</text>
      </svg>
      {hintVisible && <div className="pilot-lifecycle-hint"><HandIcon /><span>Utwórz obiekt!</span></div>}
    </div>
    <div className="pilot-lifecycle-controls">
      {!alive
        ? <button type="button" className="pilot-lifecycle-btn" onClick={create}>
            {snap.events.length ? 'Utwórz ponownie' : 'Utwórz obiekt'}
          </button>
        : <button type="button" className="pilot-lifecycle-btn" onClick={() => destroy(true)}>Usuń obiekt</button>}
      <span className="pilot-lifecycle-fps" role="group" aria-label="Tempo symulacji">
        {FPS_OPTIONS.map((f) => <button key={f} type="button"
          className={`pilot-lifecycle-fps-btn${f === fps ? ' is-active' : ''}`}
          aria-pressed={f === fps} onClick={() => { touch(); setFps(f); }}>{f}</button>)}
        <span className="pilot-lifecycle-fps-unit">FPS</span>
      </span>
    </div>
    <ol className="pilot-lifecycle-log">
      {snap.events.map((e, i) => <li key={`${i}-${e.text}`}>
        <span className="pilot-lifecycle-log-t">t={e.t.toFixed(2)}s</span>{e.text}
      </li>)}
      {snap.events.length === 0 && <li className="pilot-lifecycle-log-empty">dziennik zdarzeń jest pusty</li>}
    </ol>
    <p role="status" className="pilot-lifecycle-status">
      {alive
        ? `delta = ${delta.toFixed(3)} s · klatka ${snap.ticks} · elapsed = ${snap.elapsed.toFixed(2)} s${variant === 'lifetime' ? ` · onDestroy za ${remaining.toFixed(2)} s` : ''}`
        : snap.ticks > 0
          ? `${snap.ticks} klatek · elapsed = ${snap.elapsed.toFixed(2)} s — przy każdym FPS tyle samo czasu, inną liczbą wywołań`
          : 'Obiekt nie istnieje — żadne wywołanie nie leci'}
    </p>
  </div>;
}
