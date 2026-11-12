import { useEffect, useId, useRef, useState } from 'react';
import { Sprite } from '../../shared/lab-game-v2/editor/PageDiagram.jsx';

const SHOT_MS = 480;
const TICK_MS = 160;
const FLASH_MS = 150;
const SHOT_TRAVEL = 330;

function SpacebarIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="2" y="7" width="20" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <line x1="6" y1="13" x2="18" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>;
}

function KeyboardIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="2" y="5" width="20" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <path d="M5.5 9.5h2M10 9.5h2M14.5 9.5h2M5.5 13.5h2M17.5 9.5h1M17.5 13.5h1M9 13.5h6"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>;
}

const projectiles = n => (n === 1 ? 'pocisk' : 'pociski');
const isSpaceKey = event => event.key === ' ' || event.key === 'Spacebar';

// Interaktywna plansza „jedno naciśnięcie — jeden pocisk". Keycap Space i
// przełącznik „Przytrzymaj" pokazują, że isKeyPressed odpala tylko na
// początku naciśnięcia — trzymanie klawisza nie strzela. Bajtowo identyczna
// w java-lab i web-learning-lab; fragment kodu przychodzi w `board.code`.
export default function KeyPressBoard({ code, shooter = 'BulletShooter' }) {
  const [shots, setShots] = useState(0);
  const [held, setHeld] = useState(false);
  const [ticks, setTicks] = useState(0);
  const [flash, setFlash] = useState(false);
  const [flying, setFlying] = useState([]);
  const [hintVisible, setHintVisible] = useState(true);
  const [announcement, setAnnouncement] = useState('Czekam na naciśnięcie Space.');
  const board = useRef(null);
  const keycap = useRef(null);
  const shotsRef = useRef(0);
  const nextId = useRef(0);
  const timers = useRef({ tick: null, flash: null, flying: new Map() });
  const helpId = useId();

  useEffect(() => {
    const store = timers.current;
    return () => {
      clearInterval(store.tick);
      clearTimeout(store.flash);
      for (const timer of store.flying.values()) clearTimeout(timer);
      store.flying.clear();
    };
  }, []);

  const fire = () => {
    shotsRef.current += 1;
    const count = shotsRef.current;
    setShots(count);
    const id = ++nextId.current;
    setFlying(list => [...list, id]);
    timers.current.flying.set(id, setTimeout(() => {
      timers.current.flying.delete(id);
      setFlying(list => list.filter(value => value !== id));
    }, SHOT_MS));
    setAnnouncement(`Space naciśnięty — ${shooter}.shoot() → pocisk nr ${count}.`);
    setHintVisible(false);
    setFlash(true);
    clearTimeout(timers.current.flash);
    timers.current.flash = setTimeout(() => setFlash(false), FLASH_MS);
  };

  const holdStart = () => {
    if (held) return;
    setHeld(true);
    setTicks(0);
    fire();
    clearInterval(timers.current.tick);
    timers.current.tick = setInterval(() => setTicks(value => value + 1), TICK_MS);
  };

  const holdEnd = () => {
    setHeld(false);
    clearInterval(timers.current.tick);
    timers.current.tick = null;
    setTicks(0);
  };

  const ownTarget = event => event.target === board.current || event.target === keycap.current;
  const onKeyDown = event => {
    if (!isSpaceKey(event) || !ownTarget(event)) return;
    event.preventDefault();
    holdStart();
  };
  const onKeyUp = event => {
    if (!isSpaceKey(event) || !ownTarget(event)) return;
    holdEnd();
  };

  const status = held
    ? `Klawisz trzymany — isKeyPressed odpala raz; nadal ${shots} ${projectiles(shots)}.`
    : announcement;

  return <div ref={board} className="pilot-key-board" tabIndex={0} role="group"
    aria-label="Plansza naciśnięcia klawisza" aria-describedby={helpId}
    onKeyDown={onKeyDown} onKeyUp={onKeyUp}>
    <p id={helpId} className="pilot-key-help">
      Kliknij klawisz Space albo wybierz planszę klawiszem Tab i naciśnij Space — jedno naciśnięcie wywołuje {shooter}.shoot().
    </p>
    <div className="pilot-key-stage">
      <svg viewBox="0 0 480 140" aria-hidden="true">
        <rect x="8" y="8" width="464" height="124" rx="10" className="pilot-key-world" />
        <line x1="96" y1="70" x2="452" y2="70" className="pilot-key-lane" />
        <Sprite asset="player" x={26} y={44} size={52} />
        <path d="M84 70 h24" className="pilot-key-dir" />
        <path d="M112 64 l10 6 -10 6Z" className="pilot-key-dir-head" />
        <text x="122" y="92" className="pilot-key-caption">kierunek</text>
        {flying.map(id => <g key={id} className="pilot-key-shot">
          <Sprite asset="fireball" x={118} y={58} size={24} />
        </g>)}
        <text x="452" y="30" textAnchor="end" className="pilot-key-label">pociski: {shots}</text>
      </svg>
      {hintVisible && <div className="pilot-key-hint">
        <KeyboardIcon />
        <span>Naciśnij Space!</span>
      </div>}
    </div>
    <div className="pilot-key-controls">
      <button ref={keycap} type="button" className="pilot-key-cap"
        data-down={held || flash || undefined} onClick={fire}>
        <SpacebarIcon />
        <kbd>Space</kbd>
      </button>
      <button type="button" role="switch" aria-checked={held} className="pilot-key-hold"
        onClick={() => (held ? holdEnd() : holdStart())}>
        Przytrzymaj Space
      </button>
      <span className="pilot-key-ticks">onUpdate: {held ? `×${ticks}` : '—'}</span>
      <code className="pilot-key-count">shots = {shots}</code>
    </div>
    {code && <pre className="pilot-key-code"><code>{code}</code></pre>}
    <p role="status" className="pilot-key-status">{status}</p>
  </div>;
}
