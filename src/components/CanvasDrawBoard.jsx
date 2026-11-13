import { useId, useState } from 'react';

function Slider({ label, min, max, value, onChange, unit = 'px' }) {
  return <label className="pilot-canvas-slider">
    <span className="pilot-canvas-slider-label">{label}: <strong>{value}{unit}</strong></span>
    <input type="range" min={min} max={max} value={value}
      onChange={(event) => onChange(Number(event.target.value))} />
  </label>;
}

function HandIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M9 11.5V5.2a1.4 1.4 0 0 1 2.8 0v5M11.8 10V3.8a1.4 1.4 0 0 1 2.8 0V10M14.6 10.4V5.6a1.4 1.4 0 0 1 2.8 0v7.9c0 3.6-2.4 6-5.7 6-3 0-4.6-1.6-5.6-4L4.3 11c-.4-1 .5-2 1.5-1.5L9 11.5Z"
      fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

// Interaktywna plansza rysowania na canvas: suwaki zmieniają argumenty
// drawRect/drawText, a podgląd pokazuje wynik w przestrzeni ekranu.
// drawRect dostaje ŚRODEK prostokąta — połowa szerokości rośnie w lewo,
// połowa w prawo. Bajtowo identyczna w java-lab i web-learning-lab;
// prefiks kodu przychodzi w `board.api` („canvas." albo „this.canvas.").
export default function CanvasDrawBoard({ variant = 'button', api = 'canvas.' }) {
  const helpId = useId();
  const [hintVisible, setHintVisible] = useState(true);
  const touch = () => setHintVisible(false);

  const [cx, setCx] = useState(80);
  const [cy, setCy] = useState(90);
  const [w, setW] = useState(40);
  const [h, setH] = useState(30);
  const [withText, setWithText] = useState(true);

  const [current, setCurrent] = useState(3);
  const max = 5;

  if (variant === 'bar') {
    const width = 200 * current / max;
    const left = 20, yCenter = 40;
    return <div className="pilot-canvas-board" role="group"
      aria-label="Plansza paska na canvas" aria-describedby={helpId}>
      <p id={helpId} className="pilot-canvas-help">
        Przesuń suwak „current" — wypełnienie rośnie, ale lewy brzeg x = 20 stoi w miejscu, bo drawRect dostaje środek.
      </p>
      <div className="pilot-canvas-stage">
        <svg viewBox="0 0 300 110" aria-hidden="true">
          <rect x="2" y="2" width="296" height="106" rx="8" className="pilot-canvas-world" />
          <rect x={left} y={yCenter - 6} width="200" height="12" rx="3" className="pilot-canvas-track" />
          <rect x={left} y={yCenter - 6} width={Math.max(width, 0)} height="12" rx="3" className="pilot-canvas-fill-green" />
          <line x1={left} y1={yCenter - 14} x2={left} y2={yCenter + 14} className="pilot-canvas-pin" />
          <text x={left} y={yCenter - 20} className="pilot-canvas-pin-label">x = 20 (przypięty brzeg)</text>
          <line x1={left} y1={yCenter + 20} x2={left + width} y2={yCenter + 20} className="pilot-canvas-measure" />
          <text x={left + width / 2} y={yCenter + 34} textAnchor="middle" className="pilot-canvas-measure-label">width = {width}</text>
          <text x={left + width / 2} y={yCenter + 4} textAnchor="middle" className="pilot-canvas-center-dot">◦</text>
          <text x={left + width + 8} y={yCenter + 4} className="pilot-canvas-center-label">środek: x = {left} + {width}/2 = {left + width / 2}</text>
        </svg>
        {hintVisible && <div className="pilot-canvas-hint"><HandIcon /><span>Przesuń suwak!</span></div>}
      </div>
      <div className="pilot-canvas-controls">
        <Slider label="current" min={0} max={max} value={current} unit=""
          onChange={(v) => { touch(); setCurrent(v); }} />
        <span className="pilot-canvas-formula">width = 200 × {current} / {max} = <strong>{width}px</strong></span>
      </div>
      <pre className="pilot-canvas-code"><code>{`const width = 200 * ${current} / ${max}; // ${width}
${api}drawRect(20 + width / 2, 40, width, 12, "#70c994");`}</code></pre>
      <p role="status" className="pilot-canvas-status">
        Lewy brzeg zostaje na x = 20 — drawRect rysuje od środka, więc x = 20 + width/2.
      </p>
    </div>;
  }

  return <div className="pilot-canvas-board" role="group"
    aria-label="Plansza prostokąta na canvas" aria-describedby={helpId}>
    <p id={helpId} className="pilot-canvas-help">
      Zmień suwaki — drawRect dostaje ŚRODEK prostokąta, nie róg. Połowa szerokości rośnie w lewo, połowa w prawo.
    </p>
    <div className="pilot-canvas-stage">
      <svg viewBox="0 0 300 210" aria-hidden="true">
        <rect x="2" y="2" width="296" height="206" rx="8" className="pilot-canvas-world" />
        <line x1="2" y1={cy} x2="298" y2={cy} className="pilot-canvas-guide" />
        <line x1={cx} y1="2" x2={cx} y2="208" className="pilot-canvas-guide" />
        <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx="4" className="pilot-canvas-fill" />
        {withText && <text x={cx} y={cy + 5} textAnchor="middle" className="pilot-canvas-text">Start</text>}
        <line x1={cx - w / 2} y1={cy + h / 2 + 8} x2={cx} y2={cy + h / 2 + 8} className="pilot-canvas-measure" />
        <line x1={cx} y1={cy + h / 2 + 8} x2={cx + w / 2} y2={cy + h / 2 + 8} className="pilot-canvas-measure" />
        <text x={cx - w / 4} y={cy + h / 2 + 20} textAnchor="middle" className="pilot-canvas-measure-label">w/2</text>
        <text x={cx + w / 4} y={cy + h / 2 + 20} textAnchor="middle" className="pilot-canvas-measure-label">w/2</text>
        <circle cx={cx} cy={cy} r="2.5" className="pilot-canvas-center" />
        <text x={cx} y={cy - h / 2 - 6} textAnchor="middle" className="pilot-canvas-pin-label">({cx}, {cy})</text>
      </svg>
      {hintVisible && <div className="pilot-canvas-hint"><HandIcon /><span>Zmień suwaki!</span></div>}
    </div>
    <div className="pilot-canvas-controls">
      <Slider label="środek x" min={30} max={270} value={cx} onChange={(v) => { touch(); setCx(v); }} />
      <Slider label="środek y" min={30} max={160} value={cy} onChange={(v) => { touch(); setCy(v); }} />
      <Slider label="szerokość" min={20} max={140} value={w} onChange={(v) => { touch(); setW(v); }} />
      <Slider label="wysokość" min={12} max={60} value={h} onChange={(v) => { touch(); setH(v); }} />
      <label className="pilot-canvas-toggle">
        <input type="checkbox" checked={withText} onChange={(e) => { touch(); setWithText(e.target.checked); }} />
        Napis „Start”
      </label>
    </div>
    <pre className="pilot-canvas-code"><code>{`${api}drawRect(${cx}, ${cy}, ${w}, ${h}, "#76b9f2");${withText ? `\n${api}drawText("Start", ${cx}, ${cy}, 18, "#ffffff", "center", "middle");` : ''}`}</code></pre>
    <p role="status" className="pilot-canvas-status">
      Prostokąt {w}×{h} ze środkiem w ({cx}, {cy}) — lewy brzeg wypada na {cx - w / 2}, prawy na {cx + w / 2}.
    </p>
  </div>;
}
