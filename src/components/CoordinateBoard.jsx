import { useId, useRef, useState } from 'react';
import { Sprite } from '../../shared/lab-game-v2/editor/PageDiagram.jsx';

const pad = { left: 44, top: 34, right: 34, bottom: 14 };
const snap = 5;
const keySteps = new Map([
  ['ArrowLeft', [-1, 0]], ['ArrowRight', [1, 0]],
  ['ArrowUp', [0, -1]], ['ArrowDown', [0, 1]],
]);

function signed(value) {
  return value > 0 ? '+' + value : String(value);
}

function codeFor(dx, dy) {
  const lines = [];
  if (dx) lines.push(`player.transform.x ${dx > 0 ? '+=' : '-='} ${Math.abs(dx)};`);
  if (dy) lines.push(`player.transform.y ${dy > 0 ? '+=' : '-='} ${Math.abs(dy)};`);
  return lines.length ? lines.join('\n') : '// Gracz stoi na pozycji startowej';
}

function HandIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6.5 6.5 0 0 1-6.5 6.5h-.6a6 6 0 0 1-4.6-2.2L4.2 15a1.5 1.5 0 0 1 2.3-1.9L9 15.5"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export default function CoordinateBoard({ start = { x: 100, y: 150 }, width = 400, height = 300, ghost }) {
  const [position, setPosition] = useState({ x: start.x, y: start.y });
  const [dragging, setDragging] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const board = useRef(null);
  const helpId = useId();
  const { x, y } = position;
  const dx = x - start.x;
  const dy = y - start.y;
  const viewWidth = pad.left + width + pad.right;
  const viewHeight = pad.top + height + pad.bottom;
  const px = pad.left + x;
  const py = pad.top + y;

  const clamp = (value, max) => Math.min(max, Math.max(0, value));
  const announce = next => setAnnouncement(`Gracz na pozycji x ${next.x}, y ${next.y}.`);

  function place(next) {
    const snapped = {
      x: clamp(Math.round(next.x / snap) * snap, width),
      y: clamp(Math.round(next.y / snap) * snap, height),
    };
    setPosition(snapped);
    return snapped;
  }

  function moveFromPointer(event) {
    const matrix = board.current?.getScreenCTM();
    if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    place({ x: point.x - pad.left, y: point.y - pad.top });
  }

  const ticks = [];
  for (let v = 50; v <= width; v += 50) ticks.push(['x', v]);
  for (let v = 50; v <= height; v += 50) ticks.push(['y', v]);
  const grid = [];
  for (let v = 25; v <= width; v += 25) grid.push(<line key={'gx' + v} x1={pad.left + v} y1={pad.top} x2={pad.left + v} y2={pad.top + height} />);
  for (let v = 25; v <= height; v += 25) grid.push(<line key={'gy' + v} x1={pad.left} y1={pad.top + v} x2={pad.left + width} y2={pad.top + v} />);
  const labelRight = x < width - 90;
  const labelAbove = y > 50;

  return <div className="pilot-coord-board">
    <p id={helpId}>Przeciągnij gracza albo wybierz go klawiszem Tab i użyj strzałek (Shift = większy krok).</p>
    <div className="pilot-coord-stage">
      <svg ref={board} viewBox={`0 0 ${viewWidth} ${viewHeight}`} role="group"
        aria-label="Plansza układu współrzędnych" aria-describedby={helpId}>
        <rect x={pad.left} y={pad.top} width={width} height={height} className="pilot-coord-world" />
        <g className="pilot-coord-grid">{grid}</g>
        <line x1={pad.left} y1={pad.top} x2={pad.left + width + 22} y2={pad.top} className="pilot-coord-axis pilot-coord-axis--x" />
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + height + 8} className="pilot-coord-axis pilot-coord-axis--y" />
        <path d={`M${pad.left + width + 22} ${pad.top - 5} l8 5 -8 5Z`} className="pilot-coord-arrow--x" />
        <text x={pad.left - 8} y={pad.top - 8} textAnchor="end" className="pilot-coord-tick">0</text>
        <text x={pad.left + width + 30} y={pad.top - 12} textAnchor="end" className="pilot-coord-name pilot-coord-name--x">X →</text>
        <text x={pad.left - 6} y={pad.top + height + 10} textAnchor="end" className="pilot-coord-name pilot-coord-name--y">Y ↓</text>
        {ticks.map(([axis, v]) => axis === 'x'
          ? <text key={'tx' + v} x={pad.left + v} y={pad.top - 8} textAnchor="middle" className="pilot-coord-tick">{v}</text>
          : <text key={'ty' + v} x={pad.left - 8} y={pad.top + v} textAnchor="end" dominantBaseline="middle" className="pilot-coord-tick">{v}</text>)}
        {ghost && <g className="pilot-coord-ghost" aria-hidden="true">
          <circle cx={pad.left + ghost.x} cy={pad.top + ghost.y} r="6" />
          <text x={pad.left + ghost.x} y={pad.top + ghost.y + 22} textAnchor="middle">{ghost.label} ({ghost.x}, {ghost.y})</text>
        </g>}
        <g className="pilot-coord-projection" aria-hidden="true">
          <line x1={px} y1={py} x2={px} y2={pad.top} />
          <line x1={px} y1={py} x2={pad.left} y2={py} />
          <text x={px} y={pad.top + 16} textAnchor="middle" className="pilot-coord-value pilot-coord-value--x">{x}</text>
          <text x={pad.left + 6} y={py - 6} className="pilot-coord-value pilot-coord-value--y">{y}</text>
        </g>
        <g className="pilot-coord-player" tabIndex={0} role="button"
          data-dragging={dragging || undefined}
          aria-label={`Gracz — pozycja x ${x}, y ${y}. Strzałki przesuwają o 5, z Shift o 25.`}
          onPointerDown={event => {
            if (event.button !== 0) return;
            event.preventDefault();
            event.currentTarget.setPointerCapture?.(event.pointerId);
            setDragging(true);
            setHintVisible(false);
          }}
          onPointerMove={event => {
            if (dragging) moveFromPointer(event);
          }}
          onPointerUp={() => { setDragging(false); announce(position); }}
          onLostPointerCapture={() => setDragging(false)}
          onKeyDown={event => {
            const step = keySteps.get(event.key);
            if (!step) return;
            event.preventDefault();
            const size = event.shiftKey ? 25 : 5;
            setHintVisible(false);
            announce(place({ x: x + step[0] * size, y: y + step[1] * size }));
          }}>
          <circle cx={px} cy={py} r="24" className="pilot-coord-halo" />
          <Sprite asset="player" x={px - 36} y={py - 36} size={72} />
          <circle cx={px} cy={py} r="3.5" className="pilot-coord-dot" />
          <text x={px + (labelRight ? 28 : -28)} y={py + (labelAbove ? -26 : 36)}
            textAnchor={labelRight ? 'start' : 'end'} className="pilot-coord-label">({x}, {y})</text>
        </g>
      </svg>
      {hintVisible && <div className="pilot-coord-hint" data-testid="coord-hint"
        style={{ left: `${(px / viewWidth) * 100}%`, top: `${((py + 30) / viewHeight) * 100}%` }}>
        <HandIcon />
        <span>Przeciągnij mnie!</span>
      </div>}
    </div>
    <div className="pilot-coord-readout">
      <code>transform.x = {x}</code>
      <code>transform.y = {y}</code>
      <p>{dx || dy
        ? `Przesunięcie: x ${signed(dx)}, y ${signed(dy)}`
        : 'x rośnie w prawo, y rośnie w dół'}</p>
      <pre className="pilot-coord-code"><code>{codeFor(dx, dy)}</code></pre>
      <button type="button" className="button button--ghost" onClick={() => {
        setPosition({ x: start.x, y: start.y });
        announce(start);
      }}>Wróć na start</button>
    </div>
    <p role="status" className="pilot-coord-status">{announcement}</p>
  </div>;
}
