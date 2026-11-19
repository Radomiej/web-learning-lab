import { useEffect, useId, useRef, useState } from 'react';
import { Sprite } from '../../shared/lab-game-v2/editor/PageDiagram.jsx';

const pad = { left: 16, top: 16, right: 16, bottom: 16 };

// Interaktywna tablica kamery: pozycja GameObjectu kamery to środek
// widoku. Gracza można przeciągać (mysz/strzałki), przełączniki
// followX/followY wybierają osie podążania, suwak ustawia ręczne Y
// kamery, przycisk wstrząsu drga ramką widoku bez ruszania pozycji.
// Bajtowo identyczna w java-lab i web-learning-lab; różnią się tylko
// łańcuchy kodu przekazane w `board` notatki.
export default function CameraBoard({
  player = { name: 'Player', x: 400, y: 300 },
  camera = { x: 400, y: 180 },
  world = { width: 1200, height: 700 },
  view = { width: 640, height: 360 },
  followCode = 'camera.follow(player);',
  axisCode = 'camera.{axis} = {value};',
  positionCode = 'camera.setPosition({x}, {y});',
}) {
  const [playerPos, setPlayerPos] = useState({ x: player.x, y: player.y });
  const [followX, setFollowX] = useState(true);
  const [followY, setFollowY] = useState(false);
  const [cameraY, setCameraY] = useState(camera.y);
  const [shakeOn, setShakeOn] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const [dragging, setDragging] = useState(false);
  const board = useRef(null);
  const shakeTimer = useRef(null);
  const helpId = useId();

  const camX = followX ? playerPos.x : camera.x;
  const camY = followY ? playerPos.y : cameraY;
  const viewX = Math.round(camX - view.width / 2);
  const viewY = Math.round(camY - view.height / 2);

  const scale = Math.min(520 / world.width, 300 / world.height);
  const svgW = pad.left + world.width * scale + pad.right;
  const svgH = pad.top + world.height * scale + pad.bottom;
  const px = pad.left + playerPos.x * scale;
  const py = pad.top + playerPos.y * scale;
  const cx = pad.left + camX * scale;
  const cy = pad.top + camY * scale;
  const vw = view.width * scale;
  const vh = view.height * scale;
  const groundY = pad.top + world.height * scale * 0.72;

  const dismissHint = () => setHintVisible(false);
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function place(point) {
    setPlayerPos({ x: Math.round(point.x / 10) * 10, y: Math.round(point.y / 10) * 10 });
    dismissHint();
  }

  function toWorld(event) {
    const rect = board.current.getBoundingClientRect();
    const k = svgW / rect.width;
    return {
      x: clamp((event.clientX - rect.left) * k - pad.left, 0, world.width * scale) / scale,
      y: clamp((event.clientY - rect.top) * k - pad.top, 0, world.height * scale) / scale,
    };
  }

  function onPointerDown(event) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    place(toWorld(event));
  }
  function onPointerMove(event) {
    if (dragging) place(toWorld(event));
  }
  function onPointerUp() {
    setDragging(false);
  }
  function onKeyDown(event) {
    const step = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[event.key];
    if (!step) return;
    event.preventDefault();
    place({ x: clamp(playerPos.x + step[0], 0, world.width), y: clamp(playerPos.y + step[1], 0, world.height) });
  }

  function shake() {
    setShakeOn(true);
    dismissHint();
    clearTimeout(shakeTimer.current);
    shakeTimer.current = setTimeout(() => setShakeOn(false), 700);
  }
  useEffect(() => () => clearTimeout(shakeTimer.current), []);

  const toggleX = () => { setFollowX((v) => !v); dismissHint(); };
  const toggleY = () => { setFollowY((v) => !v); dismissHint(); };
  const slide = (event) => { setCameraY(Number(event.target.value)); dismissHint(); };

  const code = [
    followCode,
    axisCode.replace('{axis}', 'followX').replace('{value}', String(followX)),
    axisCode.replace('{axis}', 'followY').replace('{value}', String(followY)),
    positionCode.replace('{x}', String(Math.round(camX))).replace('{y}', String(Math.round(camY))),
  ];

  const status = shakeOn
    ? `Wstrząs — obraz drga, a pozycja obiektu kamery zostaje (${Math.round(camX)}, ${Math.round(camY)}).`
    : `Kamera w (${Math.round(camX)}, ${Math.round(camY)}) — początek widoku (${viewX}, ${viewY}). Gracz w (${playerPos.x}, ${playerPos.y}).`;

  return <div className="pilot-cb">
    <div className="pilot-cb-stage">
      <svg ref={board} viewBox={`0 0 ${svgW} ${svgH}`} role="application"
        aria-label={`Tablica kamery — gracz w (${playerPos.x}, ${playerPos.y})`}
        aria-describedby={helpId}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
        onKeyDown={onKeyDown} tabIndex="0">
        <rect x="0" y="0" width={svgW} height={svgH} className="pilot-cb-world" />
        <line x1={pad.left} y1={groundY} x2={svgW - pad.right} y2={groundY} className="pilot-cb-ground" />
        <text x={pad.left + 6} y={groundY - 6} className="pilot-cb-label">świat {world.width}×{world.height}</text>
        <g className={shakeOn ? 'pilot-cb-view pilot-cb-view--shake' : 'pilot-cb-view'}>
          <rect x={cx - vw / 2} y={cy - vh / 2} width={vw} height={vh} className="pilot-cb-frame" />
          <text x={cx - vw / 2 + 6} y={cy - vh / 2 + 14} className="pilot-cb-label">widok {view.width}×{view.height}</text>
        </g>
        <g className="pilot-cb-marker" aria-hidden="true">
          <line x1={cx - 9} y1={cy} x2={cx + 9} y2={cy} />
          <line x1={cx} y1={cy - 9} x2={cx} y2={cy + 9} />
        </g>
        <g data-testid="cb-player" aria-hidden="true">
          <Sprite asset="player" x={px - 12} y={py - 12} size={24} />
        </g>
        <text x={px + 14} y={py - 14} className="pilot-cb-label" aria-hidden="true">{player.name}</text>
      </svg>
      {hintVisible && <div className="pilot-cb-hint" data-testid="cb-hint">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6.5 6.5 0 0 1-6.5 6.5h-.6a6 6 0 0 1-4.6-2.2L4.2 15a1.5 1.5 0 0 1 2.3-1.9L9 15.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span id={helpId}>Przeciągnij gracza — kamera podąża za zaznaczonymi osiami</span>
      </div>}
    </div>
    <div className="pilot-cb-controls">
      <button type="button" role="switch" aria-checked={followX} data-testid="cb-followX"
        className="pilot-cb-switch" onClick={toggleX}>
        <span>followX</span><span className="pilot-cb-track" aria-hidden="true"><span className="pilot-cb-thumb" /></span>
      </button>
      <button type="button" role="switch" aria-checked={followY} data-testid="cb-followY"
        className="pilot-cb-switch" onClick={toggleY}>
        <span>followY</span><span className="pilot-cb-track" aria-hidden="true"><span className="pilot-cb-thumb" /></span>
      </button>
      <label className="pilot-cb-slider">
        <span>Kamera Y</span>
        <input type="range" min="0" max={world.height} step="10" value={cameraY}
          disabled={followY} data-testid="cb-cameraY" onChange={slide} aria-label="Ręczna pozycja Y kamery" />
      </label>
      <button type="button" className="pilot-cb-shake" data-testid="cb-shake" onClick={shake}>
        Wstrząs
      </button>
    </div>
    <div className="pilot-cb-code">
      {code.map((line, i) => <p key={i} className="pilot-cb-code-line">{line}</p>)}
    </div>
    <p role="status" className="pilot-cb-status" data-testid="cb-status">{status}</p>
  </div>;
}
