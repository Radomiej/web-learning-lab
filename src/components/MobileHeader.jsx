import {ConnectionStatus} from './StudentIdentity.jsx';
export default function MobileHeader({ onOpen, runtimeLabel = 'Gotowe', telemetry, previewOpen, onPreviewToggle }) {
  return (
    <header className="mobile-header">
      <button className="icon-button" type="button" aria-label="Otwórz menu" onClick={onOpen}>
        <span aria-hidden="true">☰</span>
      </button>
      <div className="mobile-brand">
        <span className="brand-mark" aria-hidden="true">&lt;/&gt;</span>
        <div><span>Web Lab</span><ConnectionStatus telemetry={telemetry} iconOnly/></div>
      </div>
      {onPreviewToggle ? <button className="icon-button" type="button" aria-label={previewOpen ? 'Schowaj podgląd' : 'Pokaż podgląd'} title="Podgląd zadania" aria-expanded={previewOpen} aria-controls="course-preview" onClick={onPreviewToggle}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8m-4-3v3"/></svg></button> : <span className="runtime-pill runtime-pill--small"><span className="status-dot" />{runtimeLabel}</span>}
    </header>
  );
}
