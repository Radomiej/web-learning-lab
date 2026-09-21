import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { evaluateChecks } from '../services/lessonValidator.js';
import { buildPreviewDocument } from '../services/previewDocument.js';

const emptySignals = () => ({
  dom: {},
  styles: {},
  viewport: {},
  interactions: {},
  runtimeErrors: [],
  react: {},
});

const initialRuntimeState = (scopeKey = 'default') => ({
  scopeKey,
  status: 'idle',
  messages: [],
  errors: [],
  signals: emptySignals(),
  checkResults: [],
});

function mergeSignals(previous, payload = {}) {
  return {
    ...previous,
    ...payload,
    dom: { ...(previous.dom || {}), ...(payload.dom || {}) },
    styles: { ...(previous.styles || {}), ...(payload.styles || {}) },
    interactions: { ...(previous.interactions || {}), ...(payload.interactions || {}) },
    runtimeErrors: payload.runtimeErrors || previous.runtimeErrors || [],
  };
}

export function usePreviewRuntime(files, checks = [], track = 'html', scopeKey = 'default') {
  const [previewKey, setPreviewKey] = useState(1);
  const [runtimeState, setRuntimeState] = useState(() => initialRuntimeState(scopeKey));
  const frameRef = useRef(null);
  const filesRef = useRef(files);
  const checksRef = useRef(checks);
  const trackRef = useRef(track);
  const scopeKeyRef = useRef(scopeKey);
  const signalsRef = useRef(emptySignals());
  const pendingCheckRef = useRef(false);
  const evaluationTimerRef = useRef(null);

  useEffect(() => { filesRef.current = files; }, [files]);
  useEffect(() => { checksRef.current = checks; }, [checks]);
  useEffect(() => { trackRef.current = track; }, [track]);

  if (scopeKeyRef.current !== scopeKey) scopeKeyRef.current = scopeKey;

  const previewDocument = useMemo(() => buildPreviewDocument(files, {
    track,
    requestedSignals: checks,
  }), [checks, files, track]);

  const clearEvaluationTimer = useCallback(() => {
    if (evaluationTimerRef.current !== null) {
      window.clearTimeout(evaluationTimerRef.current);
      evaluationTimerRef.current = null;
    }
  }, []);

  const sendToFrame = useCallback((message) => {
    frameRef.current?.contentWindow?.postMessage(message, '*');
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

  const sendDeclaredActions = useCallback(() => {
    checksRef.current
      .filter((check) => check.type === 'interaction' && check.selector)
      .forEach((check) => sendToFrame({
        source: 'web-learning-lab',
        type: 'run-action',
        payload: {
          checkId: check.id,
          selector: check.selector,
          action: check.action || 'click',
          value: check.value,
        },
      }));
  }, [sendToFrame]);

  const handleMessage = useCallback((message) => {
    if (!message) return;
    if (message.type === 'load') {
      setRuntimeState((current) => current.status === 'idle'
        ? current
        : { ...current, status: 'ready' });
      return;
    }
    if (message.source !== 'web-learning-lab') return;

    if (message.type === 'ready') {
      setRuntimeState((current) => ({ ...current, status: 'ready' }));
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
      setRuntimeState((current) => ({
        ...current,
        status: 'error',
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
      if (pendingCheckRef.current) scheduleCheckEvaluation();
    }
  }, [scheduleCheckEvaluation, sendDeclaredActions, sendToFrame]);

  const setFrame = useCallback((frame) => {
    frameRef.current = frame;
  }, []);

  const runPreview = useCallback(() => {
    pendingCheckRef.current = false;
    clearEvaluationTimer();
    signalsRef.current = emptySignals();
    setRuntimeState({ ...initialRuntimeState(scopeKeyRef.current), status: 'running' });
    setPreviewKey((key) => key + 1);
  }, [clearEvaluationTimer]);

  const checkPreview = useCallback(() => {
    pendingCheckRef.current = true;
    clearEvaluationTimer();
    signalsRef.current = emptySignals();
    setRuntimeState({ ...initialRuntimeState(scopeKeyRef.current), status: 'running' });
    setPreviewKey((key) => key + 1);
  }, [clearEvaluationTimer]);

  const clearRuntime = useCallback(() => {
    pendingCheckRef.current = false;
    clearEvaluationTimer();
    signalsRef.current = emptySignals();
    setRuntimeState(initialRuntimeState(scopeKeyRef.current));
  }, [clearEvaluationTimer]);

  useEffect(() => {
    pendingCheckRef.current = false;
    clearEvaluationTimer();
    signalsRef.current = emptySignals();
    setRuntimeState(initialRuntimeState(scopeKey));
  }, [clearEvaluationTimer, scopeKey]);

  useEffect(() => () => clearEvaluationTimer(), [clearEvaluationTimer]);

  const visibleRuntimeState = runtimeState.scopeKey === scopeKey
    ? runtimeState
    : initialRuntimeState(scopeKey);

  return {
    previewDocument,
    previewKey,
    runtimeState: visibleRuntimeState,
    runPreview,
    checkPreview,
    clearRuntime,
    handleMessage,
    setFrame,
    track: trackRef.current,
  };
}
