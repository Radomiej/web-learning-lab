import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { editSelection, formatCode } from '../services/codeEditing.js';
import { createEditorUri, getEditorLanguage } from '../services/editorLanguage.js';
import { createEditorActions } from '../services/monacoEditorCommands.js';
import { loadMonaco } from '../services/monacoRuntime.js';
import EditorHelp from './EditorHelp.jsx';

const LANGUAGE_LABELS = {
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript / JSX',
  php: 'PHP',
  plaintext: 'Plik tekstowy',
};

function editorLanguageLabel(fileKey) {
  return LANGUAGE_LABELS[getEditorLanguage(fileKey)] || LANGUAGE_LABELS.plaintext;
}

export default function CodeEditor({
  fileKey,
  fileLabel,
  value,
  onChange,
  onRun,
  onReset,
  onCheck,
  onSolution,
  onSave,
  workspaceKey = 'lesson',
  monacoLoader = loadMonaco,
}) {
  const inputRef = useRef(null);
  const editorHostRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const modelsRef = useRef(new Map());
  const listenersRef = useRef(new Map());
  const editorActionsRef = useRef([]);
  const selectionRef = useRef(null);
  const history = useRef({ undo: [], redo: [] });
  const revision = useRef(0);
  const alive = useRef(true);
  const escapeTab = useRef(false);
  const sourceRef = useRef(value);
  const valueRef = useRef(value);
  const fileKeyRef = useRef(fileKey);
  const workspaceKeyRef = useRef(workspaceKey);
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);
  const ignoreModelChangeRef = useRef(false);
  const formattingRef = useRef(false);
  const handleFormatRef = useRef(() => {});
  const [editorState, setEditorState] = useState('loading');
  const [formatting, setFormatting] = useState(false);
  const [notice, setNotice] = useState('');

  sourceRef.current = value;
  valueRef.current = value;
  fileKeyRef.current = fileKey;
  workspaceKeyRef.current = workspaceKey;
  onChangeRef.current = onChange;
  onSaveRef.current = onSave;

  useLayoutEffect(() => {
    if (!selectionRef.current || !inputRef.current) return;
    const { start, end, scrollTop } = selectionRef.current;
    inputRef.current.focus();
    inputRef.current.setSelectionRange(start, end);
    inputRef.current.scrollTop = scrollTop;
    selectionRef.current = null;
  }, [value]);

  function emitChange(changedFileKey, nextValue) {
    const callback = onChangeRef.current;
    if (!callback) return;
    if (callback.length >= 2) {
      callback(changedFileKey, nextValue);
      return;
    }
    callback(nextValue);
  }

  function snapshot() {
    const input = inputRef.current;
    return {
      text: valueRef.current,
      start: input?.selectionStart ?? 0,
      end: input?.selectionEnd ?? 0,
      scrollTop: input?.scrollTop ?? 0,
    };
  }

  function applyEdit(next, remember = true) {
    const input = inputRef.current;
    if (!input) return;
    setNotice('');
    if (next.text === valueRef.current) {
      input.setSelectionRange(next.start, next.end);
      return;
    }
    if (remember) {
      history.current.undo.push(snapshot());
      if (history.current.undo.length > 100) history.current.undo.shift();
      history.current.redo = [];
    }
    revision.current++;
    sourceRef.current = next.text;
    selectionRef.current = {
      ...next,
      scrollTop: next.scrollTop ?? input.scrollTop,
    };
    emitChange(fileKeyRef.current, next.text);
  }

  function ensureModel(nextFileKey, initialValue) {
    const monaco = monacoRef.current;
    if (!monaco) return null;
    const existing = modelsRef.current.get(nextFileKey);
    if (existing) return existing;

    const uri = monaco.Uri.parse(
      createEditorUri(workspaceKeyRef.current, nextFileKey),
    );
    const model = monaco.editor.createModel(
      initialValue,
      getEditorLanguage(nextFileKey),
      uri,
    );
    const listener = model.onDidChangeContent(() => {
      if (ignoreModelChangeRef.current) return;
      const nextValue = model.getValue();
      revision.current++;
      sourceRef.current = nextValue;
      emitChange(nextFileKey, nextValue);
    });
    modelsRef.current.set(nextFileKey, model);
    listenersRef.current.set(nextFileKey, listener);
    return model;
  }

  function handleSave() {
    onSaveRef.current?.();
    setNotice('Zapisano plik. Podgląd odświeżony.');
  }

  async function handleFormat(targetEditor = editorRef.current) {
    if (formattingRef.current) return;
    const editor = targetEditor || null;
    const model = editor?.getModel?.() || null;
    const activeFile = fileKeyRef.current;
    const source = model?.getValue?.() ?? sourceRef.current;
    const version = revision.current;

    formattingRef.current = true;
    setFormatting(true);
    setNotice('Formatuję…');
    try {
      const formatted = await formatCode(source, activeFile);
      if (!alive.current) return;
      if (
        version !== revision.current
        || fileKeyRef.current !== activeFile
        || sourceRef.current !== source
        || (model && model.getValue() !== source)
      ) {
        setNotice('Kod zmienił się podczas formatowania. Kliknij Formatuj ponownie.');
        return;
      }

      if (formatted !== source) {
        if (model && editor === editorRef.current) {
          editor.pushUndoStop?.();
          editor.executeEdits('web-learning-lab-format', [{
            range: model.getFullModelRange(),
            text: formatted,
          }]);
          editor.pushUndoStop?.();
        } else {
          applyEdit({ text: formatted, start: 0, end: 0 });
        }
      }
      setNotice('Kod sformatowany. Ctrl+Z cofa zmianę.');
    } catch (error) {
      if (alive.current) {
        setNotice(
          'Nie udało się sformatować. Kod pozostał bez zmian. '
          + (error instanceof Error ? error.message : String(error)),
        );
      }
    } finally {
      formattingRef.current = false;
      if (alive.current) setFormatting(false);
    }
  }

  handleFormatRef.current = handleFormat;

  function handleKeyDown(event) {
    if (event.isComposing || event.nativeEvent.isComposing) return;
    const modifier = event.ctrlKey || event.metaKey;
    if (event.key === 'Escape') {
      escapeTab.current = true;
      return;
    }
    if (event.key === 'Tab' && escapeTab.current) {
      escapeTab.current = false;
      return;
    }
    escapeTab.current = false;
    if (event.shiftKey && event.altKey && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      handleFormat();
      return;
    }
    if (modifier && event.key.toLowerCase() === 's') {
      event.preventDefault();
      handleSave();
      return;
    }
    if (modifier && ['z', 'y'].includes(event.key.toLowerCase())) {
      event.preventDefault();
      const redo = event.key.toLowerCase() === 'y' || event.shiftKey;
      const from = redo ? 'redo' : 'undo';
      const to = redo ? 'undo' : 'redo';
      const next = history.current[from].pop();
      if (next) {
        history.current[to].push(snapshot());
        applyEdit(next, false);
      }
      return;
    }
    const command = event.key === 'Tab'
      ? (event.shiftKey ? 'outdent' : 'indent')
      : modifier && event.shiftKey && event.key.toLowerCase() === 'k'
        ? 'deleteLine'
        : event.key === 'Enter' && !modifier ? 'newline' : null;
    if (!command) return;
    event.preventDefault();
    const input = event.currentTarget;
    applyEdit(editSelection(
      valueRef.current,
      input.selectionStart,
      input.selectionEnd,
      command,
    ));
  }

  useEffect(() => {
    alive.current = true;
    let cancelled = false;
    setEditorState('loading');
    setNotice('');

    async function mountMonaco() {
      try {
        const { monaco } = await monacoLoader();
        if (cancelled || !editorHostRef.current) return;

        const editor = monaco.editor.create(editorHostRef.current, {
          automaticLayout: true,
          minimap: { enabled: false },
          theme: 'vs-dark',
          fontSize: 13,
          lineHeight: 21,
          padding: { top: 16, bottom: 16 },
          tabSize: 2,
          scrollBeyondLastLine: false,
          wordWrap: 'off',
        });
        editorRef.current = editor;
        monacoRef.current = monaco;

        const model = ensureModel(fileKeyRef.current, valueRef.current);
        if (model) editor.setModel(model);

        const actions = createEditorActions(monaco, {
          format: (currentEditor) => handleFormatRef.current(currentEditor),
          save: () => handleSave(),
        });
        editorActionsRef.current = actions
          .map((action) => editor.addAction(action))
          .filter(Boolean);
        editor.layout?.();
        if (!cancelled) setEditorState('ready');
      } catch (error) {
        if (!cancelled) {
          setEditorState('error');
          setNotice(
            'Monaco jest niedostępne — aktywowano edytor awaryjny. '
            + (error instanceof Error ? error.message : String(error)),
          );
        }
      }
    }

    mountMonaco();

    return () => {
      cancelled = true;
      alive.current = false;
      editorActionsRef.current.forEach((action) => action.dispose?.());
      editorActionsRef.current = [];
      listenersRef.current.forEach((listener) => listener.dispose?.());
      listenersRef.current.clear();
      modelsRef.current.forEach((model) => model.dispose?.());
      modelsRef.current.clear();
      editorRef.current?.dispose?.();
      editorRef.current = null;
      monacoRef.current = null;
      ignoreModelChangeRef.current = false;
    };
  }, [monacoLoader, workspaceKey]);

  useEffect(() => {
    if (editorState !== 'ready' || !editorRef.current) return;
    const model = ensureModel(fileKey, value);
    if (model && editorRef.current.getModel?.() !== model) {
      editorRef.current.setModel(model);
    }
  }, [editorState, fileKey, value, workspaceKey]);

  useEffect(() => {
    if (editorState !== 'ready') return;
    const model = modelsRef.current.get(fileKey);
    if (!model || model.getValue() === value) return;
    ignoreModelChangeRef.current = true;
    try {
      model.setValue(value);
    } finally {
      ignoreModelChangeRef.current = false;
    }
  }, [editorState, fileKey, value]);

  const editorId = `editor-${encodeURIComponent(fileKey)}`;
  const languageLabel = `${editorLanguageLabel(fileKey)} · Monaco`;

  return (
    <section className="editor-card">
      <div className="editor-card-heading">
        <div>
          <span className="eyebrow">Plik aktywny</span>
          <strong>{fileLabel}</strong>
        </div>
        <div className="editor-card-heading-actions">
          <span className="editor-language">{languageLabel}</span>
          <button
            className="button button--ghost"
            type="button"
            onClick={() => handleFormat()}
            disabled={formatting || editorState === 'loading'}
            title="Shift+Alt+F"
          >
            Formatuj kod
          </button>
          <EditorHelp />
        </div>
      </div>
      <label className="sr-only" htmlFor={editorId}>Edytor {fileLabel}</label>
      {editorState === 'error' ? (
        <textarea
          ref={inputRef}
          id={editorId}
          className="code-editor"
          value={value}
          onChange={(event) => {
            setNotice('');
            history.current.undo.push({
              text: valueRef.current,
              start: event.target.selectionStart,
              end: event.target.selectionStart,
            });
            if (history.current.undo.length > 100) history.current.undo.shift();
            history.current.redo = [];
            revision.current++;
            sourceRef.current = event.target.value;
            emitChange(fileKeyRef.current, event.target.value);
          }}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          aria-label={`Edytor ${fileLabel}`}
        />
      ) : (
        <div className="monaco-editor-wrap" aria-busy={editorState === 'loading'}>
          <div
            ref={editorHostRef}
            id={editorId}
            className="monaco-editor-host"
            data-testid={editorState === 'ready' ? 'monaco-editor' : undefined}
            role={editorState === 'ready' ? 'textbox' : undefined}
            aria-label={`Edytor ${fileLabel}`}
          />
          {editorState === 'loading' && (
            <div className="monaco-loading" aria-live="polite">Ładowanie edytora…</div>
          )}
        </div>
      )}
      <p
        className={`editor-status${editorState === 'error' ? ' editor-status--fallback' : ''}`}
        role="status"
      >
        {editorState === 'loading' ? 'Ładowanie edytora…' : notice}
      </p>
      <div className="editor-actions">
        <button className="button button--primary" type="button" onClick={() => onRun?.()}><span aria-hidden="true">▶</span> Uruchom</button>
        <button className="button button--secondary" type="button" onClick={() => onCheck?.()}>Sprawdź</button>
        <button className="button button--ghost" type="button" onClick={() => onReset?.()}>Wyczyść</button>
        {onSolution && <button className="button button--ghost button--solution" type="button" onClick={onSolution}>Pokaż rozwiązanie</button>}
      </div>
    </section>
  );
}
