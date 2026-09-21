export default function PreviewInspector({ previewDocument, previewKey, onMessage, runtimeState = {} }) {
  return (
    <section className="preview-card" aria-labelledby="preview-title">
      <div className="preview-heading">
        <div>
          <p className="eyebrow">Sandbox</p>
          <h2 id="preview-title">Podgląd na żywo</h2>
        </div>
        <span className={`runtime-pill runtime-pill--${runtimeState.status || 'idle'}`}>
          <span className="status-dot" />{runtimeState.label || 'Gotowe'}
        </span>
      </div>
      <div className="preview-frame-wrap">
        <iframe
          key={previewKey}
          className="preview-frame"
          title="Podgląd strony ucznia"
          sandbox="allow-scripts"
          srcDoc={previewDocument}
          onLoad={(event) => onMessage?.({ type: 'load', frame: event.currentTarget })}
        />
      </div>
      <div className="preview-footer">
        <span><span className="status-dot status-dot--teal" />iframe sandbox</span>
        <span>bez zapisu poza przeglądarką</span>
      </div>
    </section>
  );
}
