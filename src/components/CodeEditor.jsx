export default function CodeEditor({
  fileKey,
  fileLabel,
  value,
  onChange,
  onRun,
  onReset,
  onCheck,
  onSolution,
}) {
  return (
    <section className="editor-card">
      <div className="editor-card-heading">
        <div>
          <span className="eyebrow">Plik aktywny</span>
          <strong>{fileLabel}</strong>
        </div>
        <span className="editor-language">{fileKey === 'html' ? 'HTML' : fileKey === 'js' ? 'JS' : 'CSS'}</span>
      </div>
      <label className="sr-only" htmlFor={`editor-${fileKey}`}>Edytor {fileLabel}</label>
      <textarea
        id={`editor-${fileKey}`}
        className="code-editor"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck="false"
        wrap="off"
        aria-label={`Edytor ${fileLabel}`}
      />
      <div className="editor-actions">
        <button className="button button--primary" type="button" onClick={() => onRun?.()}><span aria-hidden="true">▶</span> Uruchom</button>
        <button className="button button--secondary" type="button" onClick={() => onCheck?.()}>Sprawdź</button>
        <button className="button button--ghost" type="button" onClick={() => onReset?.()}>Wyczyść</button>
        <button className="button button--ghost button--solution" type="button" onClick={() => onSolution?.()}>Pokaż rozwiązanie</button>
      </div>
    </section>
  );
}
