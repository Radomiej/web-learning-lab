import { useId, useRef, useState } from 'react';
import { Sprite } from '../../shared/lab-game-v2/editor/PageDiagram.jsx';

const width = 480;
const height = 240;
const margin = 36;
const actors = [
  { id: 'slime', label: 'Slime', asset: 'slime' },
  { id: 'player', label: 'Gracz (target)', asset: 'player' },
];
const initial = { slime: { x: 110, y: 150 }, player: { x: 350, y: 85 } };
const exampleSlime = { x: 120, y: 130 };
const normalizeExamples = [
  { label: 'Przekątna 100 px', dx: 60, dy: -80 },
  { label: 'Przekątna 50 px', dx: 30, dy: -40 },
  { label: 'Poziomo', dx: 100, dy: 0 },
  { label: 'Ten sam punkt', dx: 0, dy: 0 },
];
const rangeExamples = [60, 120, 150].map(dx => ({ label: dx + ' px', dx, dy: 0 }));
const format = new Intl.NumberFormat('pl', { maximumFractionDigits: 3 });
const keySteps = new Map([
  ['ArrowLeft', [-10, 0]], ['ArrowRight', [10, 0]],
  ['ArrowUp', [0, -10]], ['ArrowDown', [0, 10]],
]);

export default function ChaseVectorBoard({ mode = 'move' }) {
  const [positions, setPositions] = useState(initial);
  const [draggedActor, setDraggedActor] = useState(null);
  const board = useRef(null);
  const arrowId = useId().replaceAll(':', '');
  const helpId = useId();
  const { slime, player } = positions;
  const dx = player.x - slime.x;
  const dy = player.y - slime.y;
  const distance = Math.hypot(dx, dy);
  const unitX = distance ? dx / distance : 0;
  const unitY = distance ? dy / distance : 0;
  const unitLength = Math.hypot(unitX, unitY);
  const examples = mode === 'normalize' ? normalizeExamples : mode === 'range' ? rangeExamples : [];
  const vectorLabel = mode === 'normalize'
    ? '(' + format.format(unitX) + '; ' + format.format(unitY) + ')'
    : mode === 'range' ? format.format(distance) + ' px' : 'move()';
  const inset = distance ? Math.min(30 / distance, 0.32) : 0;
  const middleX = (slime.x + player.x) / 2;
  const middleY = (slime.y + player.y) / 2;
  const verticalLabelSide = player.x > width - 135 || (dx < 0 && player.x > 135) ? -1 : 1;

  function moveActor(id, getNext) {
    setPositions(current => {
      const { x, y } = getNext(current[id]);
      return {
        ...current,
        [id]: {
          x: Math.min(width - margin, Math.max(margin, Math.round(x))),
          y: Math.min(height - margin, Math.max(margin, Math.round(y))),
        },
      };
    });
  }

  function moveFromPointer(id, event) {
    const matrix = board.current?.getScreenCTM();
    if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    moveActor(id, () => point);
  }

  return <div className="pilot-vector-board">
    <p id={helpId}>Przeciągnij postać albo wybierz ją klawiszem Tab i użyj strzałek.</p>
    {examples.length > 0 && <div className="pilot-vector-presets" aria-label="Przykładowe pozycje" role="group">
      {examples.map(({ label, dx, dy }) => (
        <button type="button" key={label} className="button button--ghost"
          onClick={() => setPositions({ slime: exampleSlime, player: { x: exampleSlime.x + dx, y: exampleSlime.y + dy } })}>
          {label}
        </button>
      ))}
    </div>}
    <svg ref={board} viewBox={`0 0 ${width} ${height}`} role="group" aria-label="Plansza wektora pościgu" aria-describedby={helpId}>
      <defs><marker id={arrowId} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
        <path d="M0 0 7 3.5 0 7Z" fill="#66e1cd" />
      </marker></defs>
      {distance > 0 && <>
        <path d={`M${slime.x} ${slime.y} H${player.x} V${player.y}`}
          stroke="#8198ad" strokeDasharray="5 5" fill="none" />
        <line x1={slime.x + dx * inset} y1={slime.y + dy * inset}
          x2={player.x - dx * inset} y2={player.y - dy * inset}
          stroke="#66e1cd" strokeWidth="3" markerEnd={`url(#${arrowId})`} />
        <text className="pilot-vector-label" x={middleX} y={slime.y + 19} textAnchor="middle">dx = {dx}</text>
        <text className="pilot-vector-label" x={player.x + 48 * verticalLabelSide} y={middleY}
          dominantBaseline="middle" textAnchor={verticalLabelSide < 0 ? 'end' : 'start'}>dy = {dy}</text>
        <text className="pilot-vector-label pilot-vector-label--move" x={middleX} y={middleY - 12}
          textAnchor="middle">{vectorLabel}</text>
      </>}
      {actors.map(({ id, label, asset }) => {
        const { x, y } = positions[id];
        return <g key={id} className="pilot-vector-actor" tabIndex={0} role="group"
          data-dragging={draggedActor === id || undefined}
          aria-label={`${label}, X ${x}, Y ${y}. Przesuń strzałkami.`}
          onPointerDown={event => {
            if (event.button !== 0) return;
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            setDraggedActor(id);
          }}
          onLostPointerCapture={() => setDraggedActor(current => current === id ? null : current)}
          onPointerMove={event => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) moveFromPointer(id, event);
          }}
          onKeyDown={event => {
            const step = keySteps.get(event.key);
            if (!step) return;
            event.preventDefault();
            moveActor(id, current => ({ x: current.x + step[0], y: current.y + step[1] }));
          }}>
          <circle cx={x} cy={y} r="27" fill="#173f55" stroke="#83a5b8" />
          <Sprite asset={asset} x={x - 48} y={y - 48} size={96} />
          <text x={x} y={y + 35} textAnchor="middle" fill="#fff" fontSize="13">{label}</text>
        </g>;
      })}
    </svg>
    <table className="pilot-vector-values" aria-label="Zmienne pościgu" aria-live="polite">
      <thead><tr><th scope="col">Nazwa</th><th scope="col">Wartość</th></tr></thead>
      <tbody>
        <tr><th scope="row">Slime</th><td>({slime.x}, {slime.y})</td></tr>
        <tr><th scope="row">Gracz (target)</th><td>({player.x}, {player.y})</td></tr>
        <tr><th scope="row"><code>dx</code></th><td>{player.x} − {slime.x} = <strong>{dx}</strong></td></tr>
        <tr><th scope="row"><code>dy</code></th><td>{player.y} − {slime.y} = <strong>{dy}</strong></td></tr>
        {mode === 'normalize' && <>
          <tr><th scope="row">Długość przed</th><td>{format.format(distance)}</td></tr>
          <tr><th scope="row">Kierunek po</th><td>{vectorLabel}</td></tr>
          <tr><th scope="row">Długość po</th><td>{format.format(unitLength)}</td></tr>
        </>}
        {mode === 'range' && <>
          <tr><th scope="row"><code>distance</code></th><td>{format.format(distance)} px</td></tr>
          <tr><th scope="row"><code>distance &lt; 120</code></th><td>{String(distance < 120)}</td></tr>
          <tr><th scope="row">Decyzja</th><td>{distance > 0 && distance < 120 ? 'Ucieka' : 'Stoi'}</td></tr>
        </>}
      </tbody>
    </table>
    {distance === 0 && <p>Postacie są w tym samym punkcie. Wektor (0, 0) nie wskazuje kierunku ruchu.</p>}
    <button type="button" className="button button--ghost" onClick={() => setPositions(initial)}>Przywróć pozycje</button>
  </div>;
}
