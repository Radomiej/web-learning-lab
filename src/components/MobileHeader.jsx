export default function MobileHeader({ onOpen, runtimeLabel = 'Gotowe' }) {
  return (
    <header className="mobile-header">
      <button className="icon-button" type="button" aria-label="Otwórz menu" onClick={onOpen}>
        <span aria-hidden="true">☰</span>
      </button>
      <div className="mobile-brand">
        <span className="brand-mark" aria-hidden="true">&lt;/&gt;</span>
        <span>Web Lab</span>
      </div>
      <span className="runtime-pill runtime-pill--small"><span className="status-dot" />{runtimeLabel}</span>
    </header>
  );
}
