import { useEffect, useId, useRef, useState } from 'react';

function HandIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M9 11.5V5.2a1.4 1.4 0 0 1 2.8 0v5M11.8 10V3.8a1.4 1.4 0 0 1 2.8 0V10M14.6 10.4V5.6a1.4 1.4 0 0 1 2.8 0v7.9c0 3.6-2.4 6-5.7 6-3 0-4.6-1.6-5.6-4L4.3 11c-.4-1 .5-2 1.5-1.5L9 11.5Z"
      fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

const FPS_OPTIONS = [30, 60, 120];
const PLAYER_X = 64;
const PLAYER_Y = 56;
const SPAWN_X = 292;
const BULLET_SPEED = 110;
const EVENT_COLORS = { create: '#4ade80', update: '#60a5fa', hit: '#f87171', disable: '#fbbf24', enable: '#2dd4bf', destroy: '#94a3b8' };

// Plansza zdarzeń komponentu: gracz z HP 100 po lewej, pociski lecą
// z prawej. Trafienie = onCollision (-1 hp, unoszący się tekst, czerwony
// słupek na osi zdarzeń). Przełącznik setActive usypia/budzi gracza:
// onDisable/onEnable, brak ticków onUpdate i pociski przelatują przez
// niego bez trafień. Bajtowo identyczna w java-lab i web-learning-lab;
// kod API przychodzi w `code` z notatki.
export default function EventsBoard({ code }) {
  const helpId = useId();
  const [hintVisible, setHintVisible] = useState(true);
  const touch = () => setHintVisible(false);

  const [fps, setFps] = useState(60);
  const [active, setActive] = useState(true);
  const [snap, setSnap] = useState({
    elapsed: 0, ticks: 0, hp: 100, seq: 0,
    bullets: [], hits: [], events: [{ t: 0, kind: 'create', text: 'Player.onCreate() — hp = 100' }],
  });
  const sim = useRef(snap);
  const activeRef = useRef(true);
  activeRef.current = active;

  const delta = 1 / fps;

  const pushEvent = (kind, text) => {
    sim.current.events = [...sim.current.events.slice(-39), { t: sim.current.elapsed, kind, text }];
  };

  const spawnBullet = () => {
    touch();
    const s = sim.current;
    s.seq += 1;
    const id = s.seq;
    s.bullets = [...s.bullets, { id, x: SPAWN_X }];
    pushEvent('create', `Bullet${id}.onCreate()`);
    setSnap({ ...s });
  };

  const toggleActive = () => {
    touch();
    const next = !activeRef.current;
    activeRef.current = next;
    setActive(next);
    pushEvent(next ? 'enable' : 'disable', next ? 'Player.onEnable() — wznawia' : 'Player.onDisable() — uśpiony');
    setSnap({ ...sim.current });
  };

  useEffect(() => {
    const step = 1 / fps;
    const id = setInterval(() => {
      const s = sim.current;
      s.elapsed += step;
      if (activeRef.current) { s.ticks += 1; s.tickTimes = [...(s.tickTimes || []), s.elapsed].slice(-160); }
      const survivors = [];
      for (const b of s.bullets) {
        const nx = b.x - BULLET_SPEED * step;
        if (activeRef.current && nx <= PLAYER_X + 16) {
          s.hp = Math.max(0, s.hp - 1);
          s.hits = [...s.hits.slice(-4), { id: b.id, t: s.elapsed }];
          pushEvent('hit', `Player.onCollision(Bullet${b.id}) — hp -= 1`);
          pushEvent('destroy', `Bullet${b.id}.onDestroy()`);
          continue;
        }
        if (nx < 8) { pushEvent('destroy', `Bullet${b.id}.onDestroy() — poza sceną`); continue; }
        survivors.push({ ...b, x: nx });
      }
      s.bullets = survivors;
      s.hits = s.hits.filter(h => s.elapsed - h.t < 1.1);
      setSnap({ ...s });
    }, 1000 / fps);
    return () => clearInterval(id);
  }, [fps]);

  const tickWindow = 1.2, eventWindow = 4;
  const tickStart = Math.max(0, snap.elapsed - tickWindow);
  const tickX = t => 40 + ((t - tickStart) / tickWindow) * 250;
  const eventStart = Math.max(0, snap.elapsed - eventWindow);
  const eventX = t => 40 + ((t - eventStart) / eventWindow) * 250;
  const visibleEvents = snap.events.filter(e => e.t >= eventStart - 1e-9);
  const tickTimes = (snap.tickTimes || []).filter(t => t >= tickStart);

  return <div className="pilot-events-board" role="group"
    aria-label="Plansza zdarzeń komponentu — pociski, kolizje, setActive" aria-describedby={helpId}>
    <p id={helpId} className="pilot-events-help">
      Gracz tickuje onUpdate(delta). „Spawn pocisk" tworzy obiekt lecący w gracza — trafienie to onCollision i -1 hp. Wyłącz Player (setActive): brak ticków, brak trafień; włącz: onEnable i wznowienie.
    </p>
    <div className="pilot-events-stage">
      <svg viewBox="0 0 320 132" aria-hidden="true">
        <rect x="2" y="2" width="316" height="128" rx="8" className="pilot-events-world" />
        {/* gracz */}
        <g transform={`translate(${PLAYER_X} ${PLAYER_Y})`} className={active ? 'pilot-events-player' : 'pilot-events-player is-off'}>
          <rect x="-12" y="-10" width="24" height="22" rx="6" />
          <circle cx="5" cy="-3" r="2.4" className="pilot-events-eye" />
          <text y="30" textAnchor="middle" className="pilot-events-name">Player</text>
        </g>
        <rect x={PLAYER_X - 22} y={PLAYER_Y - 24} width="44" height="6" rx="3" className="pilot-events-hp-track" />
        <rect x={PLAYER_X - 22} y={PLAYER_Y - 24} width={44 * snap.hp / 100} height="6" rx="3" className="pilot-events-hp-fill" />
        <text x={PLAYER_X} y={PLAYER_Y - 29} textAnchor="middle" className="pilot-events-hp-label">hp {snap.hp}</text>
        {/* unoszące się -1 */}
        {snap.hits.map(h => {
          const age = snap.elapsed - h.t;
          return <text key={h.id} x={PLAYER_X + 10} y={PLAYER_Y - 16 - age * 26}
            className="pilot-events-float" opacity={Math.max(0, 1 - age)}>-1</text>;
        })}
        {/* pociski */}
        {snap.bullets.map(b => <g key={b.id} transform={`translate(${b.x} ${PLAYER_Y})`}>
          <circle r="5" className="pilot-events-bullet" />
          <text y="-10" textAnchor="middle" className="pilot-events-bullet-label">B{b.id}</text>
        </g>)}
        {/* oś ticków */}
        <line x1="40" y1="102" x2="290" y2="102" className="pilot-events-axis" />
        {tickTimes.map(t => <line key={t.toFixed(4)} x1={tickX(t)} y1="98" x2={tickX(t)} y2="106" className="pilot-events-tick" />)}
        <text x="40" y="114" className="pilot-events-axis-label">onUpdate — ticki ({fps} FPS)</text>
        {/* oś zdarzeń */}
        <line x1="40" y1="122" x2="290" y2="122" className="pilot-events-axis" />
        {visibleEvents.map((e, i) => <rect key={`${i}-${e.t}`} x={eventX(e.t) - 1.5} y="117" width="3" height="10" rx="1"
          fill={EVENT_COLORS[e.kind] || '#94a3b8'} />)}
        <text x="40" y="131" className="pilot-events-axis-label">zdarzenia (ostatnie 4 s)</text>
      </svg>
      {hintVisible && <div className="pilot-events-hint"><HandIcon /><span>Spawn pocisk!</span></div>}
    </div>
    <div className="pilot-events-controls">
      <button type="button" className="pilot-events-btn" onClick={spawnBullet}>Spawn pocisk</button>
      <button type="button" role="switch" aria-checked={active}
        className={`pilot-events-switch${active ? ' is-on' : ''}`}
        onClick={toggleActive}>
        Player active
      </button>
      <span className="pilot-events-fps" role="group" aria-label="Klatki na sekundę">
        {FPS_OPTIONS.map(f => <button key={f} type="button"
          className={`pilot-events-fps-btn${f === fps ? ' is-active' : ''}`}
          aria-pressed={f === fps} onClick={() => { touch(); setFps(f); }}>{f}</button>)}
        <span className="pilot-events-fps-unit">FPS</span>
      </span>
    </div>
    <p className="pilot-events-live" aria-hidden="true">
      {active ? `onUpdate(${delta.toFixed(3)}) — wywołanie #${snap.ticks}` : 'gracz nieaktywny — onUpdate stoi'}
    </p>
    <ol className="pilot-events-log">
      {[...snap.events].reverse().slice(0, 6).map((e, i) => <li key={`${i}-${e.text}`}>
        <span className="pilot-events-dot" style={{ background: EVENT_COLORS[e.kind] }} />
        <span className="pilot-events-log-t">t={e.t.toFixed(2)}s</span>{e.text}
      </li>)}
      {snap.events.length === 0 && <li className="pilot-events-log-empty">dziennik zdarzeń jest pusty</li>}
    </ol>
    <p role="status" className="pilot-events-status">
      {active
        ? `klatka ${snap.ticks} · hp ${snap.hp} · pociski w locie: ${snap.bullets.length}`
        : `Player uśpiony — ticki stanęły na ${snap.ticks}, hp ${snap.hp}; pociski przelatują bez trafień`}
    </p>
    <pre className="pilot-events-code"><code>{code}</code></pre>
  </div>;
}
