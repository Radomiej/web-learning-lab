import { useEffect, useId, useRef, useState } from 'react';

function HandIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M9 11.5V5.2a1.4 1.4 0 0 1 2.8 0v5M11.8 10V3.8a1.4 1.4 0 0 1 2.8 0V10M14.6 10.4V5.6a1.4 1.4 0 0 1 2.8 0v7.9c0 3.6-2.4 6-5.7 6-3 0-4.6-1.6-5.6-4L4.3 11c-.4-1 .5-2 1.5-1.5L9 11.5Z"
      fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

const FPS_OPTIONS = [30, 60, 120];
const TEMPO_OPTIONS = [0.5, 1, 2];

// Plansza cyklu życia komponentu: tworzy obiekt, tick'uje onUpdate(delta)
// w wybranym tempie FPS i loguje kamienie milowe (onCreate, onCollision,
// onDestroy). Wariant lifetime: iskra leci do ściany — w połowie drogi
// odpala onCollision(Wall), a po `life` sekundach onDestroy i zniknięcie.
// Mniej FPS = większe delta, ale elapsed idzie tym samym tempem.
// Bajtowo identyczna w java-lab i web-learning-lab.
export default function LifecycleBoard({ variant = 'counter', life = 3, objectName = 'Spark' }) {
  const helpId = useId();
  const [hintVisible, setHintVisible] = useState(true);
  const touch = () => setHintVisible(false);

  const [fps, setFps] = useState(60);
  const [tempo, setTempo] = useState(1);
  const [alive, setAlive] = useState(false);
  const [snap, setSnap] = useState({ ticks: 0, elapsed: 0, collided: false, events: [] });
  const sim = useRef({ ticks: 0, elapsed: 0, collided: false, events: [] });

  const delta = 1 / fps;
  const collisionAt = life * 0.4;

  const pushEvent = (text) => {
    sim.current.events = [...sim.current.events, { t: sim.current.elapsed, text }];
  };

  const create = () => {
    touch();
    sim.current = { ticks: 0, elapsed: 0, collided: false, events: [{ t: 0, text: 'onCreate() — raz, przy utworzeniu' }] };
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
      if (variant === 'lifetime') {
        if (!sim.current.collided && sim.current.elapsed >= collisionAt) {
          sim.current.collided = true;
          pushEvent('onCollision(Wall) — zdarzenie w trakcie życia');
        }
        if (sim.current.elapsed >= life) {
          destroy(false);
          return;
        }
      }
      setSnap({ ...sim.current });
    }, (1000 / fps) / tempo);
    return () => clearInterval(id);
  }, [alive, fps, tempo]);

  const remaining = Math.max(life - snap.elapsed, 0);
  const progress = Math.min(snap.elapsed / life, 1);
  const fly = Math.min(snap.elapsed / collisionAt, 1); // 0→1 do ściany
  const sparkX = 40 + fly * 200;

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
  const axisX = (t) => 40 + ((t - Math.max(0, snap.elapsed - 1.2)) / 1.2) * 240;

  return <div className="pilot-lifecycle-board" role="group"
    aria-label="Plansza cyklu życia komponentu" aria-describedby={helpId}>
    <p id={helpId} className="pilot-lifecycle-help">
      Utwórz obiekt — onCreate() odpala raz, onUpdate(delta) co klatkę, onCollision w locie, onDestroy na końcu. Zmień FPS: mniej klatek = większe delta, ale elapsed idzie tak samo.
    </p>
    <div className="pilot-lifecycle-stage">
      <svg viewBox="0 0 320 120" aria-hidden="true">
        <rect x="2" y="2" width="316" height="116" rx="8" className="pilot-lifecycle-world" />
        {variant === 'lifetime' && <>
          <rect x="250" y="20" width="16" height="60" rx="3" className="pilot-lifecycle-wall" />
          <text x="258" y="14" textAnchor="middle" className="pilot-lifecycle-axis-label">Wall</text>
        </>}
        {alive ? (variant === 'lifetime' ? <>
          <g transform={`translate(${sparkX} 50)`}>
            <circle r="9" className={`pilot-lifecycle-spark${snap.collided ? ' is-hit' : ''}`} />
            <text y="-14" textAnchor="middle" className="pilot-lifecycle-name">{objectName}</text>
          </g>
          <rect x="40" y="70" width="200" height="6" rx="3" className="pilot-lifecycle-track" />
          <rect x="40" y="70" width={200 * progress} height="6" rx="3" className="pilot-lifecycle-fill" />
          <text x="40" y="66" className="pilot-lifecycle-axis-label">remaining = {remaining.toFixed(2)} s</text>
        </> : <>
          <rect x="110" y="18" width="100" height="44" rx="8" className="pilot-lifecycle-object" />
          <text x="160" y="36" textAnchor="middle" className="pilot-lifecycle-name">{objectName}</text>
          <text x="160" y="52" textAnchor="middle" className="pilot-lifecycle-ticks">ticks = {snap.ticks}</text>
        </>) : <>
          <rect x="110" y="18" width="100" height="44" rx="8" className="pilot-lifecycle-ghost" />
          <text x="160" y="44" textAnchor="middle" className="pilot-lifecycle-ghost-label">
            {snap.events.length ? 'zniszczony' : 'brak obiektu'}
          </text>
        </>}
        <line x1="40" y1="98" x2="280" y2="98" className="pilot-lifecycle-axis" />
        {tickMarks.map((t) => <line key={t.toFixed(4)} x1={axisX(t)} y1="93" x2={axisX(t)} y2="103"
          className="pilot-lifecycle-mark" />)}
        <text x="40" y="112" className="pilot-lifecycle-axis-label">ticki ({fps} FPS, ostatnie 1.2 s)</text>
      </svg>
      {hintVisible && <div className="pilot-lifecycle-hint"><HandIcon /><span>Utwórz obiekt!</span></div>}
    </div>
    <div className="pilot-lifecycle-controls">
      {!alive
        ? <button type="button" className="pilot-lifecycle-btn" onClick={create}>
            {snap.events.length ? 'Utwórz ponownie' : 'Utwórz obiekt'}
          </button>
        : <button type="button" className="pilot-lifecycle-btn" onClick={() => destroy(true)}>Usuń obiekt</button>}
      <span className="pilot-lifecycle-fps" role="group" aria-label="Tempo symulacji w klatkach na sekundę">
        {FPS_OPTIONS.map((f) => <button key={f} type="button"
          className={`pilot-lifecycle-fps-btn${f === fps ? ' is-active' : ''}`}
          aria-pressed={f === fps} onClick={() => { touch(); setFps(f); }}>{f}</button>)}
        <span className="pilot-lifecycle-fps-unit">FPS</span>
      </span>
      <span className="pilot-lifecycle-fps" role="group" aria-label="Prędkość odtwarzania">
        {TEMPO_OPTIONS.map((f) => <button key={f} type="button"
          className={`pilot-lifecycle-fps-btn${f === tempo ? ' is-active' : ''}`}
          aria-pressed={f === tempo} onClick={() => { touch(); setTempo(f); }}>×{f}</button>)}
        <span className="pilot-lifecycle-fps-unit">tempo</span>
      </span>
    </div>
    <p className="pilot-lifecycle-live" aria-hidden="true">
      {alive ? `onUpdate(${delta.toFixed(3)}) — wywołanie #${snap.ticks}` : 'onUpdate(delta) czeka na obiekt'}
    </p>
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
