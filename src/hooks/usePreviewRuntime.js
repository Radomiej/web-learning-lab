import { useCallback, useEffect, useRef, useState } from 'react';
import { evaluateChecks } from '../services/lessonValidator.js';
import { buildPreviewDocument } from '../services/previewDocument.js';
import { buildPhpErrorDocument, buildPhpPreviewDocument } from '../services/phpPreview.js';
import { runPhpProject } from '../services/phpRuntime.js';

const emptySignals = () => ({
  dom: {},
  styles: {},
  viewport: {},
  interactions: {},
  runtimeErrors: [],
  react: {},
  phpRequest: null,
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
      '<main><p>Uruchom podgląd, aby wykonać kod PHP.</p></main>',
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
    runtimeErrors: payload.runtimeErrors || previous.runtimeErrors || [],
  };
}

export function usePreviewRuntime(files, checks = [], track = 'html', scopeKey = 'default') {
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
  const evaluationTimerRef = useRef(null);
  const autoPreviewTimerRef = useRef(null);
  const previewSignatureRef = useRef(JSON.stringify(files));

  useEffect(() => { filesRef.current = files; }, [files]);
  useEffect(() => { checksRef.current = checks; }, [checks]);
  useEffect(() => { trackRef.current = track; }, [track]);

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

  const runPhpPreview = useCallback((nextFiles = filesRef.current, documentPath = pathRef.current, request = {}) => {
    const activePath = nextFiles.files && !Object.hasOwn(nextFiles.files, documentPath)
      ? nextFiles.entry
      : (documentPath || nextFiles.entry);
    pathRef.current = activePath;
    setPath(activePath);
    const requestedRunId = crypto.randomUUID();
    runIdRef.current = requestedRunId;
    setPreviewDocument(buildPhpPreviewDocument(
      '<main><p>Uruchamiam PHP.wasm…</p></main>',
      nextFiles,
      { track: trackRef.current, requestedSignals: checksRef.current, documentPath: activePath, runId: requestedRunId },
    ));
    setPreviewKey((key) => key + 1);
    runPhpProject({ files: nextFiles.files, entry: nextFiles.entry, request })
      .then((result) => {
        if (runIdRef.current !== requestedRunId) return;
        const errors = result.errors || (result.exitCode ? [`PHP zakończył pracę z kodem ${result.exitCode}.`] : []);
        const errorText = errors.join('\n') || `PHP zakończył pracę z kodem ${result.exitCode}.`;
        signalsRef.current = {
          ...signalsRef.current,
          phpRequest: { requestKey: result.requestKey, exitCode: result.exitCode },
          runtimeErrors: errors,
        };
        setRuntimeState((current) => ({
          ...current,
          status: errors.length || result.exitCode ? 'error' : 'running',
          errors,
          signals: { ...current.signals, phpRequest: { requestKey: result.requestKey, exitCode: result.exitCode }, runtimeErrors: errors },
        }));
        setPreviewDocument(errors.length || result.exitCode
          ? buildPhpErrorDocument(errorText, nextFiles, { track: trackRef.current, requestedSignals: checksRef.current, runId: requestedRunId })
          : buildPhpPreviewDocument(result.html, nextFiles, { track: trackRef.current, requestedSignals: checksRef.current, documentPath: activePath, runId: requestedRunId }));
        setPreviewKey((key) => key + 1);
        if (errors.length || result.exitCode) {
          if (pendingCheckRef.current) scheduleCheckEvaluation();
        }
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
        setPreviewDocument(buildPhpErrorDocument(message, nextFiles, { track: trackRef.current, requestedSignals: checksRef.current, runId: requestedRunId }));
        setPreviewKey((key) => key + 1);
        if (pendingCheckRef.current) scheduleCheckEvaluation();
      });
  }, [scheduleCheckEvaluation]);

  const sendDeclaredActions = useCallback(() => {
    checksRef.current
      .filter((check) => check.type === 'interaction' && check.selector)
      .forEach((check) => sendToFrame({
        source: 'web-learning-lab',
        type: 'run-action',
        payload: {
          checkId: check.id,
          selector: check.selector,
          resultSelector: check.resultSelector,
          action: check.action || 'click',
          value: check.value,
        },
      }));
  }, [sendToFrame]);

  const handleMessage = useCallback((message) => {
    if (!message) return;
    if (message.type === 'load') {
      return;
    }
    if (message.source !== 'web-learning-lab') return;
    if (message.runId !== runIdRef.current) return;

    if (message.type === 'ready') {
      setRuntimeState((current) => ({ ...current, status: current.errors.length ? 'error' : 'ready' }));
      if (pendingCheckRef.current) {
        sendToFrame({ source: 'web-learning-lab', type: 'collect-signals', payload: { checks: checksRef.current } });
        sendDeclaredActions();
      }
      return;
    }

    if (message.type === 'console') {
      setRuntimeState((current) => ({
        ...current,
        messages: [...current.messages, message.payload].slice(-80),
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
      signalsRef.current = mergeSignals(signalsRef.current, message.payload);
      setRuntimeState((current) => ({
        ...current,
        signals: mergeSignals(current.signals, message.payload),
      }));
      if (pendingCheckRef.current && checksRef.current.filter(check => check.type === 'interaction').every(check => signalsRef.current.interactions[check.id])) scheduleCheckEvaluation();
    }
  }, [scheduleCheckEvaluation, sendDeclaredActions, sendToFrame]);

  const setFrame = useCallback((frame) => {
    frameRef.current = frame;
  }, []);

  const runPreview = useCallback((nextFiles, documentPath) => {
    clearAutoPreviewTimer();
    pendingCheckRef.current = false;
    clearEvaluationTimer();
    signalsRef.current = emptySignals();
    setRuntimeState({ ...initialRuntimeState(scopeKeyRef.current), status: 'running' });
    const activeFiles = nextFiles || filesRef.current;
    if (isPhpProject(activeFiles, trackRef.current)) runPhpPreview(activeFiles, documentPath, {});
    else refreshPreview(activeFiles, documentPath);
  }, [clearAutoPreviewTimer, clearEvaluationTimer, isPhpProject, refreshPreview, runPhpPreview]);

  const checkPreview = useCallback(() => {
    clearAutoPreviewTimer();
    pendingCheckRef.current = true;
    clearEvaluationTimer();
    signalsRef.current = emptySignals();
    setRuntimeState({ ...initialRuntimeState(scopeKeyRef.current), status: 'running' });
    const activeFiles = filesRef.current;
    const request = checksRef.current.find((check) => check.type === 'phpRequest')?.request || {};
    if (isPhpProject(activeFiles, trackRef.current)) runPhpPreview(activeFiles, activeFiles.entry, request);
    else refreshPreview(activeFiles, activeFiles.entry || 'index.html');
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
