import { useState } from 'react';
import { Sprite } from '../../shared/lab-game-v2/editor/PageDiagram.jsx';

function ToggleIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="2" y="7" width="20" height="10" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="16" cy="12" r="3.2" fill="currentColor" />
  </svg>;
}

function EyeIcon({ off }) {
  return off
    ? <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M3 4l18 16M9.9 5.5A9.7 9.7 0 0 1 12 5c5 0 8.7 3.4 10 7-.5 1.4-1.4 2.8-2.8 4M6.3 7.4A13 13 0 0 0 2 12c1.3 3.6 5 7 10 7 1.2 0 2.4-.3 3.5-.7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M9.9 9.9a3.2 3.2 0 0 0 4.4 4.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    : <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M2 12c1.3-3.6 5-7 10-7s8.7 3.4 10 7c-1.3 3.6-5 7-10 7s-8.7-3.4-10-7Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>;
}

const PAD = { left: 14, top: 14, right: 14, bottom: 14 };

// Interaktywna tablica „widać / nie widać": obok siebie kod i efekt.
// GameObject istnieje zawsze w punkcie Transform — komponent decyduje,
// czy coś na ekranie widać. Współrzędne świata jak w CoordinateBoard:
// (0,0) w lewym górnym rogu, X w prawo, Y w dół.
// Bajtowo identyczna w java-lab i web-learning-lab; różnią się tylko
// łańcuchy `code`/`objectCode` przekazane w `board` notatki.
export default function ComponentToggleBoard({ object, objectCode, components = [] }) {
  const [enabled, setEnabled] = useState(() => components.map((c) => Boolean(c.on)));
  const [hintVisible, setHintVisible] = useState(true);
  const [lastToggled, setLastToggled] = useState(0);
  const base = { name: 'Object', x: 0, y: 0, ...object };

  // Jedne marker Transform na każdy odrębny obiekt (dedupe po nazwie).
  const objects = [base];
  for (const c of components) {
    if (c.object && !objects.some((o) => o.name === c.object.name)) objects.push(c.object);
  }
  const worldW = Math.max(220, ...objects.map((o) => o.x + 70));
  const worldH = Math.max(160, ...objects.map((o) => o.y + 50));
  const scale = Math.min(250 / worldW, 190 / worldH);
  const viewW = PAD.left + worldW * scale + PAD.right;
  const viewH = PAD.top + worldH * scale + PAD.bottom;
  const marker = (o) => ({ mx: PAD.left + o.x * scale, my: PAD.top + o.y * scale });

  const toggle = (index) => {
    setEnabled((prev) => prev.map((value, i) => (i === index ? !value : value)));
    setLastToggled(index);
    setHintVisible(false);
  };

  const statusFor = (component, on) => {
    const owner = component.object?.name ?? base.name;
    const pos = component.object ?? base;
    if (component.kind === 'collider') {
      return on
        ? `${component.label} włączony — pomarańczowy obrys pokazuje fizyczny obszar ${owner}.`
        : `${component.label} wyłączony — ${owner} nie ma fizycznego obszaru kontaktu.`;
    }
    return on
      ? `${component.label} włączony — ${owner} jest widoczny.`
      : `${component.label} wyłączony — ${owner} nadal istnieje w (${pos.x}, ${pos.y}), ale nic go nie rysuje.`;
  };

  const active = components[lastToggled];
  const status = active ? statusFor(active, enabled[lastToggled]) : '';

  return <div className="pilot-ct">
    <div className="pilot-ct-code">
      {objectCode && <p className="pilot-ct-code-line">{objectCode}</p>}
      {components.map((component, index) => (
        <p key={component.id} className={`pilot-ct-code-line${enabled[index] ? '' : ' pilot-ct-code-line--off'}`}>
          {component.code}
          {!enabled[index] && <span className="pilot-ct-off-marker"> // wyłączony</span>}
        </p>
      ))}
    </div>
    <div className="pilot-ct-stage">
      <svg viewBox={`0 0 ${viewW} ${viewH}`} role="group" aria-label={`Podgląd sceny — obiekt ${base.name}`}>
        <rect x="0" y="0" width={viewW} height={viewH} className="pilot-ct-world" />
        {objects.map((o) => {
          const { mx, my } = marker(o);
          const labelRight = mx < viewW - 120;
          const labelAbove = my > 40;
          return <g key={o.name} className="pilot-ct-marker" data-testid={`ct-marker-${o.name}`} aria-hidden="true">
            <line x1={mx - 10} y1={my} x2={mx + 10} y2={my} />
            <line x1={mx} y1={my - 10} x2={mx} y2={my + 10} />
            <text x={mx + (labelRight ? 14 : -14)} y={my + (labelAbove ? -14 : 24)}
              textAnchor={labelRight ? 'start' : 'end'}>{o.name} ({o.x}, {o.y})</text>
          </g>;
        })}
        {components.map((component, index) => {
          if (!enabled[index]) return null;
          const { mx, my } = marker(component.object ?? base);
          const w = (component.width ?? 32) * scale;
          const h = (component.height ?? 32) * scale;
          if (component.kind === 'collider') {
            return component.radius
              ? <circle key={component.id} data-testid={`ct-shape-${component.id}`} cx={mx} cy={my} r={component.radius * scale} className="pilot-ct-collider" />
              : <rect key={component.id} data-testid={`ct-shape-${component.id}`} x={mx - w / 2} y={my - h / 2} width={w} height={h} className="pilot-ct-collider" />;
          }
          if (component.kind === 'sprite') {
            return <g key={component.id} data-testid={`ct-shape-${component.id}`}>
              <Sprite asset={component.asset ?? 'player'} x={mx - w / 2} y={my - h / 2} size={Math.max(w, h)} />
            </g>;
          }
          return <rect key={component.id} data-testid={`ct-shape-${component.id}`} x={mx - w / 2} y={my - h / 2} width={w} height={h} className="pilot-ct-shape" style={{ fill: component.color ?? '#76b9f2' }} />;
        })}
      </svg>
      {hintVisible && <div className="pilot-ct-hint" data-testid="ct-hint">
        <ToggleIcon />
        <span>Przełącz komponent</span>
      </div>}
    </div>
    <div className="pilot-ct-switches">
      {components.map((component, index) => (
        <button key={component.id} type="button" role="switch" aria-checked={enabled[index]}
          data-testid={`ct-toggle-${component.id}`} className="pilot-ct-switch" onClick={() => toggle(index)}>
          <EyeIcon off={!enabled[index]} />
          <span>{component.label}</span>
          <span className="pilot-ct-track" aria-hidden="true"><span className="pilot-ct-thumb" /></span>
        </button>
      ))}
    </div>
    <p role="status" className="pilot-ct-status" data-testid="ct-status">{status}</p>
  </div>;
}
