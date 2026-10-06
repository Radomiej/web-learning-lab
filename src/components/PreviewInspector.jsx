import { useEffect, useRef, useState } from 'react';

export default function PreviewInspector({ previewDocument, previewKey, onMessage, onFrameReady, runtimeState = {}, htmlFiles = [], previewFiles = htmlFiles, previewPath, onPreviewPathChange, autoPreview = false, onAutoPreviewChange, gameMode = false }) {
  const frameRef = useRef(null);
  const panelRef = useRef(null);
  const fullscreenButton = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => { if (!gameMode) setFullscreen(false); }, [gameMode]);
  useEffect(() => {
    if (!fullscreen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    fullscreenButton.current?.focus();
    const onKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); setFullscreen(false); }
      if (event.key === 'Tab') {
        const targets = [...panelRef.current.querySelectorAll('button, input, select, iframe')];
        const index = targets.indexOf(document.activeElement);
        if ((event.shiftKey && index <= 0) || (!event.shiftKey && index === targets.length - 1)) {
          event.preventDefault(); targets[event.shiftKey ? targets.length - 1 : 0]?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKey); fullscreenButton.current?.focus(); };
  }, [fullscreen]);

  useEffect(() => {
    const handleWindowMessage = (event) => {
      if (!frameRef.current || event.source !== frameRef.current.contentWindow) return;
      if (event.data?.source === 'web-learning-lab' && event.data.type === 'exit-game-fullscreen') setFullscreen(false);
      if (event.data?.source === 'web-learning-lab' && event.data.type === 'game-tab-boundary' && fullscreen) fullscreenButton.current?.focus();
      onMessage?.(event.data);
    };
    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [onMessage, fullscreen]);

  return (
    <section ref={panelRef} className={`preview-card${gameMode ? ' game-preview' : ''}${fullscreen ? ' game-preview--fullscreen' : ''}`} role={fullscreen ? 'dialog' : undefined} aria-modal={fullscreen ? true : undefined} aria-labelledby="preview-title">
      <div className="preview-heading">
        <div>
          <p className="eyebrow">{gameMode ? 'Canvas · Game Dev JS' : 'Sandbox'}</p>
          <h2 id="preview-title">{gameMode ? 'Podgląd gry' : 'Podgląd na żywo'}</h2>
          <small>{autoPreview ? 'Odświeżam po chwili od zakończenia pisania.' : 'Uruchom ręcznie albo użyj Ctrl+S, aby odświeżyć.'}</small>
        </div>
        <div className="game-preview-actions"><span className={`runtime-pill runtime-pill--${runtimeState.status || 'idle'}`}>
          <span className="status-dot" />{runtimeState.label || 'Gotowe'}
        </span>{gameMode && <button ref={fullscreenButton} className="button button--ghost game-fullscreen-button" type="button" aria-label={fullscreen ? 'Zamknij pełny ekran gry' : 'Pełny ekran gry'} onClick={() => setFullscreen(value => !value)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={fullscreen ? 'M9 3v6H3m12-6v6h6M3 15h6v6m6 0v-6h6' : 'M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6'} /></svg></button>}</div>
      </div>
      <div className="preview-controls">
        <label className="preview-auto-toggle">
          <input
            type="checkbox"
            aria-label="Auto-podgląd"
            checked={autoPreview}
            onChange={(event) => onAutoPreviewChange?.(event.target.checked)}
          />
          <span className="preview-auto-toggle-copy">
            <strong>Auto-podgląd</strong>
            <small>odświeża po krótkiej pauzie w pisaniu</small>
          </span>
        </label>
        <span className="preview-save-hint"><kbd>Ctrl</kbd><span>+</span><kbd>S</kbd> zapisuje i odświeża</span>
      </div>
      {previewFiles.length > 1 && <div className="preview-page-choice"><label htmlFor="preview-page">Plik wejściowy podglądu</label><select id="preview-page" value={previewPath} onChange={event=>onPreviewPathChange(event.target.value)}>{previewFiles.map(path=><option key={path} value={path}>{path}</option>)}</select><small>Sprawdź zawsze uruchamia plik wejściowy zadania.</small></div>}
      <div className="preview-frame-wrap">
        <iframe
          ref={frameRef}
          className="preview-frame"
          title={gameMode ? 'Podgląd gry ucznia' : 'Podgląd strony ucznia'}
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
        <span>{gameMode ? 'Podgląd gry' : 'bez zapisu poza przeglądarką'}</span>
      </div>
    </section>
  );
}
