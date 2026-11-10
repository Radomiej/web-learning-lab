import { useEffect, useRef, useState } from 'react';

export default function PreviewInspector({ previewDocument, previewKey, onMessage, onFrameReady, runtimeState = {}, htmlFiles = [], previewFiles = htmlFiles, previewPath, onPreviewPathChange, autoPreview = false, onAutoPreviewChange, gameMode = false }) {
  const frameRef = useRef(null);
  const panelRef = useRef(null);
  const fullscreenButton = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [viewOverlay, setViewOverlay] = useState(false);
  const [colliderOverlay, setColliderOverlay] = useState(false);

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

  const debugRef = useRef({ view: false, colliders: false });
  const sendDebug = () => frameRef.current?.contentWindow?.postMessage({ source: 'web-learning-lab', type: 'game-debug', payload: debugRef.current }, '*');
  useEffect(() => {
    debugRef.current = { view: viewOverlay, colliders: colliderOverlay };
    sendDebug();
  }, [viewOverlay, colliderOverlay]);

  const settingsSwitch = (label, hint, checked, onChange, disabled = false) => (
    <label className={`preview-switch${disabled ? ' preview-switch--disabled' : ''}`} title={hint}>
      <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={event => onChange(event.target.checked)} />
      <span className="preview-switch-track" aria-hidden="true"><span className="preview-switch-thumb" /></span>
      <span>{label}</span>
    </label>
  );

  return (
    <section ref={panelRef} className={`preview-card${gameMode ? ' game-preview' : ''}${fullscreen ? ' game-preview--fullscreen' : ''}`} role={fullscreen ? 'dialog' : undefined} aria-modal={fullscreen ? true : undefined} aria-labelledby="preview-title">
      <div className="preview-heading">
        <div>
          {gameMode ? <h2 id="preview-title" className="preview-title--game">Podgląd gry</h2> : <><p className="eyebrow">Sandbox</p><h2 id="preview-title">Podgląd na żywo</h2></>}
        </div>
        <div className="game-preview-actions"><span className={`runtime-pill runtime-pill--${runtimeState.status || 'idle'}`}>
          <span className="status-dot" />{runtimeState.label || 'Gotowe'}
        </span><div className="preview-settings">
          <button className="button button--ghost game-settings-button" type="button" title="Ustawienia podglądu" aria-label="Ustawienia podglądu" aria-expanded={settingsOpen} onClick={() => setSettingsOpen(value => !value)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3h4l.6 2.6 1.2.7 2.6-.8 2 3.5-2 1.8v1.4l2 1.8-2 3.5-2.6-.8-1.2.7L14 20h-4l-.6-2.6-1.2-.7-2.6.8-2-3.5 2-1.8v-1.4l-2-1.8 2-3.5 2.6.8 1.2-.7z" transform="translate(0 .5)"/><circle cx="12" cy="12" r="3"/></svg></button>
          {settingsOpen && <div className="preview-settings-menu" role="group" aria-label="Ustawienia podglądu">
            {settingsSwitch('Auto-podgląd', 'Odświeża po krótkiej pauzie w pisaniu', autoPreview, value => onAutoPreviewChange?.(value))}
            {settingsSwitch('Współrzędne widoku', 'Rogi ekranu pokazują zakres świata widziany przez kamerę', viewOverlay, setViewOverlay, !gameMode)}
            {settingsSwitch('Bounding boxy', 'Żółty kontur to collider, niebieski przerywany to trigger', colliderOverlay, setColliderOverlay, !gameMode)}
          </div>}
        </div>{gameMode && <button ref={fullscreenButton} className="button button--ghost game-fullscreen-button" type="button" aria-label={fullscreen ? 'Zamknij pełny ekran gry' : 'Pełny ekran gry'} onClick={() => setFullscreen(value => !value)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={fullscreen ? 'M9 3v6H3m12-6v6h6M3 15h6v6m6 0v-6h6' : 'M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6'} /></svg></button>}</div>
      </div>
      <div className="preview-controls">
        <span className="preview-save-hint"><kbd>Ctrl</kbd><span>+</span><kbd>S</kbd> zapisuje i odświeża</span>
      </div>
      {previewFiles.length > 1 && <div className="preview-page-choice"><label htmlFor="preview-page">Plik wejściowy podglądu</label><select id="preview-page" value={previewPath} onChange={event=>onPreviewPathChange(event.target.value)}>{previewFiles.map(path=><option key={path} value={path}>{path}</option>)}</select><small>Po kliknięciu ▶ Play test sprawdza plik wejściowy zadania. Wybór tutaj zmienia tylko podgląd.</small></div>}
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
            sendDebug();
          }}
        />
      </div>
    </section>
  );
}
