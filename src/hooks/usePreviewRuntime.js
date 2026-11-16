import { useCallback, useEffect, useRef, useState } from 'react';
import { evaluateChecks } from '../services/lessonValidator.js';
import { buildPreviewDocument } from '../services/previewDocument.js';
import { warmGameUiFonts } from '../data/gameUiTheme.js';
import { buildPhpErrorDocument, buildPhpPreviewDocument, describePhpResponse } from '../services/phpPreview.js';
import { requestKey as phpRequestKey, runPhpProject } from '../services/phpRuntime.js';

const emptySignals = () => ({
  dom: {},
  styles: {},
  viewport: {},
  interactions: {},
  runtimeErrors: [],
  consoleOutput: [],
  react: {},
  phpRequest: null,
  phpRequests: {},
  gameScenarios: {},
  probes: {},
});

const initialRuntimeState = (scopeKey = 'default') => ({
  scopeKey,
  status: 'idle',
  messages: [],
  errors: [],
  signals: emptySignals(),
  checkResults: [],
});

function buildRequestedPreviewDocument(files, track, checks, documentPath, runId) {
  if (track === 'php' || files?.runtime?.kind === 'php-wasm') {
    return buildPhpPreviewDocument(
      '<main><p>Kliknij przycisk ▶ Play, aby wykonać kod PHP.</p></main>',
      files,
      { track, requestedSignals: checks, documentPath, runId },
    );
  }
  return buildPreviewDocument(files, {
    track,
    requestedSignals: checks,
    documentPath,
    runId,
  });
}

function mergeSignals(previous, payload = {}) {
  return {
    ...previous,
    ...payload,
    dom: { ...(previous.dom || {}), ...(payload.dom || {}) },
    styles: payload.styles ?? previous.styles ?? {},
    interactions: { ...(previous.interactions || {}), ...(payload.interactions || {}) },
    gameScenarios: { ...(previous.gameScenarios || {}), ...(payload.gameScenarios || {}) },
    runtimeErrors: payload.runtimeErrors || previous.runtimeErrors || [],
  };
}

export function usePreviewRuntime(files, checks = [], track = 'html', scopeKey = 'default', {onRun} = {}) {
  const onRunRef=useRef(onRun);onRunRef.current=onRun;
  const notifyRun=(project)=>{try{onRunRef.current?.({project:structuredClone(project),scopeKey:scopeKeyRef.current,runId:runIdRef.current});}catch{/* Telemetry must not interrupt preview. */}};
  const autoPreviewDelay = 700;
  const runIdRef = useRef(crypto.randomUUID());
  const pathRef = useRef(files.entry || 'index.html');
  const [previewPath, setPath] = useState(pathRef.current);
  const [previewKey, setPreviewKey] = useState(1);
  const [previewDocument, setPreviewDocument] = useState(() => (
    buildRequestedPreviewDocument(files, track, checks, pathRef.current, runIdRef.current)
  ));
  const [autoPreview, setAutoPreviewState] = useState(false);
  const [runtimeState, setRuntimeState] = useState(() => initialRuntimeState(scopeKey));
  const frameRef = useRef(null);
  const filesRef = useRef(files);
  const checksRef = useRef(checks);
  const trackRef = useRef(track);
  const scopeKeyRef = useRef(scopeKey);
  const signalsRef = useRef(emptySignals());
  const pendingCheckRef = useRef(false);
  // Interakcje i snapshoty mają sens dopiero na docelowym dokumencie —
  // placeholder „Uruchamiam PHP.wasm…" też wysyła ready, ale nie ma tam formularzy.
  const previewSettledRef = useRef(false);
  const evaluationTimerRef = useRef(null);
  const autoPreviewTimerRef = useRef(null);
  const previewSignatureRef = useRef(JSON.stringify(files));

  useEffect(() => { filesRef.current = files; }, [files]);
  useEffect(() => { checksRef.current = checks; }, [checks]);
  useEffect(() => { trackRef.current = track; }, [track]);

  // Pierwszy dokument może powstać zanim fonty trafią do cache'u data-URI —
  // po rozgrzaniu przebudowujemy go raz, żeby Cinzel działał także w srcdoc.
  useEffect(() => {
    let active = true;
    warmGameUiFonts().then((ok) => {
      if (!active || !ok) return;
      setPreviewDocument((current) => (
        current && current.includes('.woff2')
          ? buildRequestedPreviewDocument(filesRef.current, trackRef.current, checksRef.current, pathRef.current, runIdRef.current)
          : current
      ));
    });
    return () => { active = false; };
  }, []);

  if (scopeKeyRef.current !== scopeKey) scopeKeyRef.current = scopeKey;

  const clearEvaluationTimer = useCallback(() => {
    if (evaluationTimerRef.current !== null) {
      window.clearTimeout(evaluationTimerRef.current);
      evaluationTimerRef.current = null;
    }
  }, []);

  const clearAutoPreviewTimer = useCallback(() => {
    if (autoPreviewTimerRef.current !== null) {
      window.clearTimeout(autoPreviewTimerRef.current);
      autoPreviewTimerRef.current = null;
    }
  }, []);

  const sendToFrame = useCallback((message) => {
    frameRef.current?.contentWindow?.postMessage(message, '*');
  }, []);

  const isPhpProject = useCallback((project = filesRef.current, projectTrack = trackRef.current) => (
    projectTrack === 'php' || project?.runtime?.kind === 'php-wasm'
  ), []);

  const refreshPreview = useCallback((nextFiles = filesRef.current, path = pathRef.current) => {
    pathRef.current = nextFiles.files && !Object.hasOwn(nextFiles.files, path) ? nextFiles.entry : path;
    setPath(pathRef.current);
    runIdRef.current = crypto.randomUUID();
    previewSettledRef.current = true;
    setPreviewDocument(buildRequestedPreviewDocument(
      nextFiles,
      trackRef.current,
      checksRef.current,
      pathRef.current,
      runIdRef.current,
    ));
    previewSignatureRef.current = JSON.stringify(nextFiles);
    setPreviewKey((key) => key + 1);
  }, []);

  const scheduleCheckEvaluation = useCallback(() => {
    clearEvaluationTimer();
    const evaluationScope = scopeKeyRef.current;
    evaluationTimerRef.current = window.setTimeout(() => {
      evaluationTimerRef.current = null;
      if (scopeKeyRef.current !== evaluationScope) return;
      const result = evaluateChecks(checksRef.current, {
        files: filesRef.current,
        signals: signalsRef.current,
      });
      pendingCheckRef.current = false;
      setRuntimeState((current) => ({
        ...current,
        scopeKey: evaluationScope,
        status: current.errors.length > 0 ? 'error' : 'ready',
        checkResults: result.results,
      }));
    }, 25);
  }, [clearEvaluationTimer]);

  // Checki phpRequest mogą wymagać kilku różnych żądań (np. POST i GET).
  // Każde uruchamiamy sekwencyjnie; podgląd pokazuje pierwszy wynik albo
  // pierwszy dokument błędu, a snapshoty DOM trafiają do signals.phpRequests.
  const runPhpPreview = useCallback((nextFiles = filesRef.current, documentPath = pathRef.current, requests = [{}]) => {
    const activePath = nextFiles.files && !Object.hasOwn(nextFiles.files, documentPath)
      ? nextFiles.entry
      : (documentPath || nextFiles.entry);
    pathRef.current = activePath;
    setPath(activePath);
    const requestedRunId = crypto.randomUUID();
    runIdRef.current = requestedRunId;
    previewSettledRef.current = false;
    setPreviewDocument(buildPhpPreviewDocument(
      '<main><p>Uruchamiam PHP.wasm…</p></main>',
      nextFiles,
      { track: trackRef.current, requestedSignals: checksRef.current, documentPath: activePath, runId: requestedRunId },
    ));
    setPreviewKey((key) => key + 1);
    const queue = (Array.isArray(requests) ? requests : [requests])
      .filter((request) => request && typeof request === 'object');
    const runList = queue.length ? queue : [{}];
    const phpSelectors = [...new Set(checksRef.current
      .filter((check) => check.type === 'phpRequest' && check.selector)
      .map((check) => check.selector))];
    const results = [];
    // stderr z PHP może nieść tylko Warning/Notice — na hostingu z
    // display_errors strona i tak się renderuje. Za błąd krytyczny uznajemy
    // niezerowy kod wyjścia albo Fatal/Parse/Uncaught; resztę pokazujemy
    // w konsoli, ale dokument zostaje (uczeń widzi i stronę, i ostrzeżenie).
    const isFatalStderr = (text) => /fatal error|parse error|uncaught/i.test(text);
    const finish = () => {
      if (runIdRef.current !== requestedRunId || results.length === 0) return;
      const isFatal = (result) => Boolean(result.exitCode) || (result.errors || []).some(isFatalStderr);
      const shown = results.find(isFatal) || results[0];
      const fatal = isFatal(shown);
      const errors = results.flatMap((result) => result.errors || (result.exitCode ? [`PHP zakończył pracę z kodem ${result.exitCode}.`] : []));
      const errorText = errors.join('\n') || `PHP zakończył pracę z kodem ${shown.exitCode}.`;
      signalsRef.current = {
        ...signalsRef.current,
        phpRequest: { requestKey: shown.requestKey, exitCode: shown.exitCode },
        runtimeErrors: errors,
      };
      setRuntimeState((current) => ({
        ...current,
        status: fatal ? 'error' : 'running',
        errors,
        signals: {
          ...current.signals,
          phpRequest: signalsRef.current.phpRequest,
          phpRequests: signalsRef.current.phpRequests,
          runtimeErrors: errors,
        },
      }));
      previewSettledRef.current = true;
      setPreviewDocument(fatal
        ? buildPhpErrorDocument(errorText, nextFiles, { track: trackRef.current, requestedSignals: checksRef.current, runId: requestedRunId })
        : buildPhpPreviewDocument(shown.html, nextFiles, { track: trackRef.current, requestedSignals: checksRef.current, documentPath: activePath, runId: requestedRunId }));
      setPreviewKey((key) => key + 1);
      if (fatal && pendingCheckRef.current) scheduleCheckEvaluation();
    };
    const runNext = (index) => {
      if (index >= runList.length) {
        finish();
        return;
      }
      runPhpProject({ files: nextFiles.files, entry: runList[index]?.path || nextFiles.entry, request: runList[index] })
        .then((result) => {
          if (runIdRef.current !== requestedRunId) return;
          results.push(result);
          if (result.requestKey != null) {
            signalsRef.current = {
              ...signalsRef.current,
              phpRequests: {
                ...(signalsRef.current.phpRequests || {}),
                [result.requestKey]: {
                  requestKey: result.requestKey,
                  exitCode: result.exitCode,
                  ...describePhpResponse(result.html, phpSelectors),
                },
              },
            };
          }
          runNext(index + 1);
        })
        .catch((error) => {
          if (runIdRef.current !== requestedRunId) return;
          const message = error?.message || 'Nie udało się uruchomić PHP.';
          signalsRef.current = { ...signalsRef.current, runtimeErrors: [message] };
          setRuntimeState((current) => ({
            ...current,
            status: 'error',
            errors: [message],
            signals: { ...current.signals, runtimeErrors: [message] },
          }));
          previewSettledRef.current = true;
          setPreviewDocument(buildPhpErrorDocument(message, nextFiles, { track: trackRef.current, requestedSignals: checksRef.current, runId: requestedRunId }));
          setPreviewKey((key) => key + 1);
          if (pendingCheckRef.current) scheduleCheckEvaluation();
        });
    };
    runNext(0);
  }, [scheduleCheckEvaluation]);

  // Interactions run one at a time — an action (np. fetch → php-wasm) may take
  // seconds and a second click could overwrite its result before the first
  // signal was captured.
  const actionQueueRef = useRef([]);
  const sendNextAction = useCallback(() => {
    const check = actionQueueRef.current[0];
    if (!check) return;
    sendToFrame({
      source: 'web-learning-lab',
      type: 'run-action',
      payload: {
        checkId: check.id,
        selector: check.selector,
        resultSelector: check.resultSelector,
        action: check.action || 'click',
        value: check.value,
      },
    });
  }, [sendToFrame]);
  const sendDeclaredActions = useCallback(() => {
    actionQueueRef.current = checksRef.current.filter((check) => check.type === 'interaction' && check.selector);
    sendNextAction();
  }, [sendNextAction]);

  const handleMessage = useCallback((message) => {
    if (!message) return;
    if (message.type === 'load') {
      return;
    }
    if (message.source !== 'web-learning-lab') return;
    if (message.runId !== runIdRef.current) return;

    if (message.type === 'ready') {
      setRuntimeState((current) => ({ ...current, status: current.errors.length ? 'error' : 'ready' }));
      if (pendingCheckRef.current && previewSettledRef.current) {
        sendToFrame({ source: 'web-learning-lab', type: 'collect-signals', payload: { checks: checksRef.current } });
        sendDeclaredActions();
      }
      return;
    }

    if (message.type === 'php-fetch') {
      const { id, path, method, query, headers, body } = message.payload || {};
      runPhpProject({
        files: filesRef.current.files,
        entry: path || 'index.php',
        request: { method, query, headers, body: body || undefined },
      }).then((result) => {
        sendToFrame({ source: 'web-learning-lab', type: 'php-fetch-result', payload: { id, status: result.status || 200, headers: result.headers || {}, body: result.html } });
      }).catch((error) => {
        sendToFrame({ source: 'web-learning-lab', type: 'php-fetch-result', payload: { id, status: 500, headers: {}, body: String(error?.message || error) } });
      });
      return;
    }

    if (message.type === 'console') {
      if (message.payload?.level === 'log') {
        signalsRef.current.consoleOutput = [...signalsRef.current.consoleOutput, (message.payload.args || []).join(' ')].slice(-80);
      }
      setRuntimeState((current) => ({
        ...current,
        messages: [...current.messages, message.payload].slice(-80),
        signals: { ...current.signals, consoleOutput: signalsRef.current.consoleOutput },
      }));
      return;
    }

    if (message.type === 'runtime-error') {
      const errorMessage = message.payload?.message || 'Nieznany błąd runtime';
      signalsRef.current.runtimeErrors.push(errorMessage);
      setRuntimeState((current) => ({
        ...current,
        status: 'error',
        checkResults: [],
        errors: [...current.errors, errorMessage].slice(-40),
        signals: { ...current.signals, runtimeErrors: [...(current.signals.runtimeErrors || []), errorMessage] },
      }));
      if (pendingCheckRef.current) scheduleCheckEvaluation();
      return;
    }

    if (message.type === 'signals') {
      // The PHP placeholder ("Uruchamiam PHP.wasm…") also sends a snapshot on
      // load — grading it would read selectors from an empty document before
      // the real page arrives. Only signals from the settled document count.
      if (!previewSettledRef.current) return;
      const inFlight = actionQueueRef.current[0];
      if (inFlight && message.payload?.interactions?.[inFlight.id]) {
        actionQueueRef.current = actionQueueRef.current.slice(1);
        sendNextAction();
      }
      signalsRef.current = mergeSignals(signalsRef.current, message.payload);
      setRuntimeState((current) => ({
        ...current,
        signals: mergeSignals(current.signals, message.payload),
      }));
      // Evaluate only after a real DOM snapshot arrives. Auxiliary payloads
      // ({gameScenarios}, {interactions}) can beat the ~200ms snapshot by a
      // wide margin on large React documents, grading an empty page.
      const isSnapshot = ['dom', 'styles', 'elements', 'react', 'viewport'].some(key => Object.hasOwn(message.payload || {}, key));
      const awaitingData = checksRef.current.some(check => check.pendingText && signalsRef.current.dom?.[check.selector]?.text?.trim() === check.pendingText);
      if (pendingCheckRef.current && isSnapshot && !awaitingData && checksRef.current.filter(check => check.type === 'interaction').every(check => signalsRef.current.interactions[check.id])) scheduleCheckEvaluation();
    }
  }, [scheduleCheckEvaluation, sendDeclaredActions, sendToFrame]);

  const setFrame = useCallback((frame) => {
    frameRef.current = frame;
  }, []);

  const runPreview = useCallback((nextFiles, documentPath) => {
    clearAutoPreviewTimer();
    pendingCheckRef.current = false;
    actionQueueRef.current = [];
    clearEvaluationTimer();
    signalsRef.current = emptySignals();
    setRuntimeState({ ...initialRuntimeState(scopeKeyRef.current), status: 'running' });
    const activeFiles = nextFiles || filesRef.current;
    if (isPhpProject(activeFiles, trackRef.current)) runPhpPreview(activeFiles, documentPath, {});
    else refreshPreview(activeFiles, documentPath);
    notifyRun(activeFiles);
  }, [clearAutoPreviewTimer, clearEvaluationTimer, isPhpProject, refreshPreview, runPhpPreview]);

  const checkPreview = useCallback(() => {
    clearAutoPreviewTimer();
    pendingCheckRef.current = true;
    clearEvaluationTimer();
    signalsRef.current = emptySignals();
    setRuntimeState({ ...initialRuntimeState(scopeKeyRef.current), status: 'running' });
    const activeFiles = filesRef.current;
    const seenRequests = new Set();
    const requests = [];
    for (const check of checksRef.current) {
      if (check.type !== 'phpRequest') continue;
      const request = check.request || {};
      const key = phpRequestKey(request);
      if (seenRequests.has(key)) continue;
      seenRequests.add(key);
      requests.push(request);
    }
    if (isPhpProject(activeFiles, trackRef.current)) runPhpPreview(activeFiles, activeFiles.entry, requests.length ? requests : [{}]);
    else refreshPreview(activeFiles, activeFiles.entry || 'index.html');
    notifyRun(activeFiles);
  }, [clearAutoPreviewTimer, clearEvaluationTimer, isPhpProject, refreshPreview, runPhpPreview]);

  const clearRuntime = useCallback(() => {
    pendingCheckRef.current = false;
    clearEvaluationTimer();
    signalsRef.current = emptySignals();
    setRuntimeState(initialRuntimeState(scopeKeyRef.current));
  }, [clearEvaluationTimer]);

  const setAutoPreview = useCallback((enabled) => {
    setAutoPreviewState(enabled);
    if (!enabled) clearAutoPreviewTimer();
  }, [clearAutoPreviewTimer]);

  const savePreview = useCallback(() => {
    runPreview(filesRef.current, pathRef.current);
  }, [runPreview]);

  useEffect(() => {
    pendingCheckRef.current = false;
    clearEvaluationTimer();
    signalsRef.current = emptySignals();
    setRuntimeState(initialRuntimeState(scopeKey));
    pathRef.current = filesRef.current.entry || 'index.html';
    setPath(pathRef.current);
    runIdRef.current = crypto.randomUUID();
    previewSettledRef.current = true;
    previewSignatureRef.current = JSON.stringify(filesRef.current);
    setPreviewDocument(buildRequestedPreviewDocument(
      filesRef.current,
      trackRef.current,
      checksRef.current,
      pathRef.current,
      runIdRef.current,
    ));
    setPreviewKey((key) => key + 1);
  }, [clearEvaluationTimer, scopeKey]);

  useEffect(() => () => clearEvaluationTimer(), [clearEvaluationTimer]);

  useEffect(() => () => clearAutoPreviewTimer(), [clearAutoPreviewTimer]);

  const draftSignature = JSON.stringify(files);
  useEffect(() => {
    pendingCheckRef.current = false;
    clearEvaluationTimer();
    setRuntimeState(current => current.checkResults.length ? { ...current, checkResults: [] } : current);
  }, [draftSignature, clearEvaluationTimer]);

  useEffect(() => {
    if (!autoPreview) {
      clearAutoPreviewTimer();
      return undefined;
    }
    if (draftSignature === previewSignatureRef.current) return undefined;
    clearAutoPreviewTimer();
    autoPreviewTimerRef.current = window.setTimeout(() => {
      autoPreviewTimerRef.current = null;
      runPreview(filesRef.current, pathRef.current);
    }, autoPreviewDelay);
    return clearAutoPreviewTimer;
  }, [autoPreview, autoPreviewDelay, clearAutoPreviewTimer, draftSignature, runPreview]);

  useEffect(() => {
    if (runtimeState.status !== 'running') return;
    const timer = window.setTimeout(() => {
      pendingCheckRef.current = false;
      setRuntimeState(current => ({ ...current, status: 'error', errors: [...current.errors, 'Podgląd nie odpowiedział. Sprawdź składnię i uruchom kod ponownie.'], checkResults: [] }));
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [runtimeState.status]);

  const visibleRuntimeState = runtimeState.scopeKey === scopeKey
    ? runtimeState
    : initialRuntimeState(scopeKey);

  return {
    runId: runIdRef.current,
    previewPath,
    setPreviewPath: (path) => runPreview(filesRef.current, path),
    previewDocument,
    previewKey,
    autoPreview,
    runtimeState: visibleRuntimeState,
    runPreview,
    savePreview,
    setAutoPreview,
    checkPreview,
    clearRuntime,
    handleMessage,
    setFrame,
    track: trackRef.current,
  };
}
