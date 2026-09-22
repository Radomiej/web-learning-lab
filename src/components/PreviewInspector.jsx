import { useEffect, useRef } from 'react';

export default function PreviewInspector({ previewDocument, previewKey, onMessage, onFrameReady, runtimeState = {}, htmlFiles = [], previewPath, onPreviewPathChange }) {
  const frameRef = useRef(null);

  useEffect(() => {
    const handleWindowMessage = (event) => {
      if (!frameRef.current || event.source !== frameRef.current.contentWindow) return;
      onMessage?.(event.data);
    };
    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [onMessage]);

  return (
    <section className="preview-card" aria-labelledby="preview-title">
      <div className="preview-heading">
        <div>
          <p className="eyebrow">Sandbox</p>
          <h2 id="preview-title">Podgląd na żywo</h2>
          <small>Zmiany zastosujesz przyciskiem Uruchom lub Sprawdź.</small>
        </div>
        <span className={`runtime-pill runtime-pill--${runtimeState.status || 'idle'}`}>
          <span className="status-dot" />{runtimeState.label || 'Gotowe'}
        </span>
      </div>
      {htmlFiles.length>1 && <div className="preview-page-choice"><label htmlFor="preview-page">Strona podglądu</label><select id="preview-page" value={previewPath} onChange={event=>onPreviewPathChange(event.target.value)}>{htmlFiles.map(path=><option key={path} value={path}>{path}</option>)}</select><small>Sprawdź zawsze otwiera i ocenia index.html.</small></div>}
      <div className="preview-frame-wrap">
        <iframe
          ref={frameRef}
          className="preview-frame"
          title="Podgląd strony ucznia"
          data-preview-key={previewKey}
          sandbox="allow-scripts"
          srcDoc={`${previewDocument}\n<!-- preview-run:${previewKey} -->`}
          onLoad={(event) => {
            onFrameReady?.(event.currentTarget);
            onMessage?.({ type: 'load', frame: event.currentTarget });
          }}
        />
      </div>
      <div className="preview-footer">
        <span><span className="status-dot status-dot--teal" />iframe sandbox</span>
        <span>bez zapisu poza przeglądarką</span>
      </div>
    </section>
  );
}
