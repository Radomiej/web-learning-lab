import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { editSelection, formatCode } from '../services/codeEditing.js';
import EditorHelp from './EditorHelp.jsx';

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
  const inputRef = useRef(null);
  const selectionRef = useRef(null);
  const history = useRef({ undo: [], redo: [] });
  const revision = useRef(0);
  const alive = useRef(true);
  const escapeTab = useRef(false);
  const currentValue = useRef(value);
  const [formatting, setFormatting] = useState(false);
  const [notice, setNotice] = useState('');
  currentValue.current = value;
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useLayoutEffect(() => {
    if (selectionRef.current) {
      const { start, end, scrollTop } = selectionRef.current;
      inputRef.current.focus();
      inputRef.current.setSelectionRange(start, end);
      inputRef.current.scrollTop = scrollTop;
      selectionRef.current = null;
    }
  }, [value]);
  function snapshot() {
    const input = inputRef.current;
    return { text: value, start: input.selectionStart, end: input.selectionEnd, scrollTop: input.scrollTop };
  }
  function applyEdit(next, remember = true) {
    setNotice('');
    if (next.text === value) {
      inputRef.current.setSelectionRange(next.start, next.end);
      return;
    }
    if (remember) {
      history.current.undo.push(snapshot());
      if (history.current.undo.length > 100) history.current.undo.shift();
      history.current.redo = [];
    }
    revision.current++;
    selectionRef.current = { ...next, scrollTop: next.scrollTop ?? inputRef.current.scrollTop };
    onChange(next.text);
  }
  async function handleFormat() {
    if (formatting) return;
    const source = value;
    const version = revision.current;
    setFormatting(true); setNotice('Formatuję…');
    try {
      const formatted = await formatCode(source, fileKey);
      if (!alive.current) return;
      if (version !== revision.current || currentValue.current !== source) {
        setNotice('Kod zmienił się podczas formatowania. Kliknij Formatuj ponownie.');
        return;
      }
      if (formatted !== source) applyEdit({ text: formatted, start: 0, end: 0 });
      setNotice('Kod sformatowany. Ctrl+Z cofa zmianę.');
    } catch (error) {
      if (alive.current) setNotice('Nie udało się sformatować. Kod pozostał bez zmian. ' + error.message);
    } finally {
      if (alive.current) setFormatting(false);
    }
  }
  function handleKeyDown(event) {
    if (event.isComposing || event.nativeEvent.isComposing) return;
    const modifier = event.ctrlKey || event.metaKey;
    if (event.key === 'Escape') { escapeTab.current = true; return; }
    if (event.key === 'Tab' && escapeTab.current) { escapeTab.current = false; return; }
    escapeTab.current = false;
    if (event.shiftKey && event.altKey && event.key.toLowerCase() === 'f') {
      event.preventDefault(); handleFormat(); return;
    }
    if (modifier && ['z', 'y'].includes(event.key.toLowerCase())) {
      event.preventDefault();
      const redo = event.key.toLowerCase() === 'y' || event.shiftKey;
      const from = redo ? 'redo' : 'undo';
      const to = redo ? 'undo' : 'redo';
      const next = history.current[from].pop();
      if (next) { history.current[to].push(snapshot()); applyEdit(next, false); }
      return;
    }
    const command = event.key === 'Tab' ? (event.shiftKey ? 'outdent' : 'indent')
      : modifier && event.shiftKey && event.key.toLowerCase() === 'k' ? 'deleteLine'
        : event.key === 'Enter' && !modifier ? 'newline' : null;
    if (!command) return;
    event.preventDefault();
    const input = inputRef.current;
    applyEdit(editSelection(value, input.selectionStart, input.selectionEnd, command));
  }
  return (
    <section className="editor-card">
      <div className="editor-card-heading">
        <div>
          <span className="eyebrow">Plik aktywny</span>
          <strong>{fileLabel}</strong>
        </div>
        <div className="editor-card-heading-actions">
          <button className="button button--ghost" type="button" onClick={handleFormat} disabled={formatting} title="Shift+Alt+F">Formatuj kod</button>
          <EditorHelp />
        </div>
      </div>
      <label className="sr-only" htmlFor={`editor-${fileKey}`}>Edytor {fileLabel}</label>
      <textarea
        ref={inputRef}
        id={`editor-${fileKey}`}
        className="code-editor"
        value={value}
        onChange={(event) => {
          setNotice('');
          history.current.undo.push({ text: value, start: event.target.selectionStart, end: event.target.selectionStart });
          if (history.current.undo.length > 100) history.current.undo.shift();
          history.current.redo = [];
          revision.current++;
          onChange(event.target.value);
        }}
        onKeyDown={handleKeyDown}
        spellCheck="false"
        autoCapitalize="off"
        autoCorrect="off"
        wrap="off"
        aria-label={`Edytor ${fileLabel}`}
      />
      <p className="editor-status" role="status">{notice}</p>
      <div className="editor-actions">
        <button className="button button--primary" type="button" onClick={() => onRun?.()}><span aria-hidden="true">▶</span> Uruchom</button>
        <button className="button button--secondary" type="button" onClick={() => onCheck?.()}>Sprawdź</button>
        <button className="button button--ghost" type="button" onClick={() => onReset?.()}>Wyczyść</button>
        {onSolution && <button className="button button--ghost button--solution" type="button" onClick={onSolution}>Pokaż rozwiązanie</button>}
      </div>
    </section>
  );
}
