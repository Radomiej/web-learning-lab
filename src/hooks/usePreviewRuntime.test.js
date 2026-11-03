import { renderHook, act } from '@testing-library/react';
import { runPhpProject } from '../services/phpRuntime.js';
import { usePreviewRuntime } from './usePreviewRuntime.js';

vi.mock('../services/phpRuntime.js', () => ({ runPhpProject: vi.fn() }));

test('PHP check ignores the wasm loading placeholder and grades the real output', async () => {
  let resolveRun;
  runPhpProject.mockImplementation(() => new Promise((resolve) => { resolveRun = resolve; }));
  const checks = [{ id: 'text', type: 'textContains', expected: 'Witaj w PHP!' }];
  const project = { entry: 'index.php', files: { 'index.php': '<?php echo "Witaj w PHP!";' } };
  const { result } = renderHook(() => usePreviewRuntime(project, checks, 'php'));

  act(() => result.current.checkPreview());
  // The loading document must stay silent: a bridged iframe would emit a
  // ready/signals snapshot of the placeholder and grade the task early.
  expect(result.current.previewDocument).toContain('Uruchamiam PHP.wasm');
  expect(result.current.previewDocument).not.toContain('data-runtime="bridge"');

  await act(async () => {
    resolveRun({ html: '<main><h1>Witaj w PHP!</h1></main>', errors: [], stderr: '', exitCode: 0, requestKey: null });
    await Promise.resolve();
  });
  expect(result.current.previewDocument).toContain('Witaj w PHP!');
  expect(result.current.runtimeState.checkResults).toHaveLength(0);

  await act(async () => {
    result.current.handleMessage({ source: 'web-learning-lab', runId: result.current.runId, type: 'signals', payload: { dom: {}, text: 'Witaj w PHP!' } });
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
  expect(result.current.runtimeState.checkResults[0].passed).toBe(true);
});

test('waits for asynchronous lesson output instead of grading the loading message', async () => {
  const checks = [{ id: 'fetch', type: 'textEquals', selector: '#result', expected: 'Dane', pendingText: 'Ładowanie…' }];
  const { result } = renderHook(() => usePreviewRuntime({ html: '<output id="result"></output>' }, checks, 'js'));
  act(() => result.current.checkPreview());
  const signal = text => ({ source: 'web-learning-lab', runId: result.current.runId, type: 'signals', payload: { dom: { '#result': { exists: true, text } } } });
  await act(async () => { result.current.handleMessage(signal('Ładowanie…')); await new Promise(resolve => setTimeout(resolve, 50)); });
  expect(result.current.runtimeState.checkResults).toHaveLength(0);
  await act(async () => { result.current.handleMessage(signal('Dane')); await new Promise(resolve => setTimeout(resolve, 50)); });
  expect(result.current.runtimeState.checkResults[0].passed).toBe(true);
});

test('ignores auxiliary signal pings and evaluates only after the DOM snapshot arrives', async () => {
  const checks = [
    { id: 'react', type: 'reactRendered', selector: '#root' },
    { id: 'text', type: 'textContains', selector: '#result', expected: 'GOTOWE' },
  ];
  const { result } = renderHook(() => usePreviewRuntime({ html: '<div id="root"></div>' }, checks, 'react'));
  act(() => result.current.checkPreview());
  await act(async () => {
    result.current.handleMessage({ source: 'web-learning-lab', runId: result.current.runId, type: 'signals', payload: { gameScenarios: {} } });
    await new Promise(resolve => setTimeout(resolve, 50));
  });
  expect(result.current.runtimeState.checkResults).toHaveLength(0);
  await act(async () => {
    result.current.handleMessage({ source: 'web-learning-lab', runId: result.current.runId, type: 'signals', payload: { dom: { '#result': { exists: true, text: 'GOTOWE' }, '#root': { exists: true, text: 'GOTOWE' } }, react: { rootReady: true } } });
    await new Promise(resolve => setTimeout(resolve, 50));
  });
  expect(result.current.runtimeState.checkResults.every(check => check.passed)).toBe(true);
});

test('checks console output from current run and resets it before the next run', async () => {
  const checks = [{ id: 'output', type: 'consoleOutput', expected: 'Ola 5' }];
  const { result } = renderHook(() => usePreviewRuntime({ html: '<p>Konsola</p>' }, checks, 'js'));
  act(() => result.current.checkPreview());
  await act(async () => {
    result.current.handleMessage({ source: 'web-learning-lab', runId: result.current.runId, type: 'console', payload: { level: 'log', args: ['Ola', '5'] } });
    result.current.handleMessage({ source: 'web-learning-lab', runId: result.current.runId, type: 'signals', payload: { dom: {} } });
    await new Promise(resolve => setTimeout(resolve, 50));
  });
  expect(result.current.runtimeState.checkResults[0].passed).toBe(true);
  act(() => result.current.checkPreview());
  await act(async () => {
    result.current.handleMessage({ source: 'web-learning-lab', runId: result.current.runId, type: 'signals', payload: { dom: {} } });
    await new Promise(resolve => setTimeout(resolve, 50));
  });
  expect(result.current.runtimeState.checkResults[0].passed).toBe(false);
});

test('notifies telemetry with the actual run project and isolates observer failures',()=>{
  const project={entry:'index.html',files:{'index.html':'<p>one</p>'}};
  const onRun=vi.fn();
  const {result}=renderHook(()=>usePreviewRuntime(project,[],'html','task-1',{onRun}));
  act(()=>result.current.runPreview());
  expect(onRun).toHaveBeenCalledWith(expect.objectContaining({project,scopeKey:'task-1',runId:result.current.runId}));
  const captured=onRun.mock.calls[0][0];
  project.files['index.html']='<p>changed</p>';
  expect(captured.project.files['index.html']).toBe('<p>one</p>');
  onRun.mockImplementation(()=>{throw new Error('offline');});
  expect(()=>act(()=>result.current.checkPreview())).not.toThrow();
});

test('evaluates computed CSS arrays received from the iframe', async () => {
  const checks = [{ id: 'flex', type: 'computedStyle', selector: '.practice', property: 'display', expected: 'flex' }];
  const { result } = renderHook(() => usePreviewRuntime({ html: '<div class="practice"></div>' }, checks));
  act(() => result.current.checkPreview());
  await act(async () => {
    result.current.handleMessage({ source: 'web-learning-lab', runId:result.current.runId, type: 'signals', payload: { styles: [{ selector: '.practice', property: 'display', value: 'flex' }] } });
    await new Promise(resolve => setTimeout(resolve, 50));
  });
  expect(result.current.runtimeState.checkResults[0].passed).toBe(true);
});

test('invalidates successful results when the active iframe fails later', async () => {
  const checks = [{id: 'text', type: 'textEquals', selector: 'p', expected: 'OK'}];
  const {result} = renderHook(() => usePreviewRuntime({html: '<p>OK</p>'}, checks));
  act(() => result.current.checkPreview());
  await act(async () => {
    result.current.handleMessage({source: 'web-learning-lab', runId: result.current.runId, type: 'signals', payload: {dom: {p: {exists: true, text: 'OK'}}}});
    await new Promise(resolve => setTimeout(resolve, 50));
  });
  expect(result.current.runtimeState.checkResults[0].passed).toBe(true);
  act(() => result.current.handleMessage({source: 'web-learning-lab', runId: result.current.runId, type: 'runtime-error', payload: {message: 'late'}}));
  expect(result.current.runtimeState.checkResults).toEqual([]);
  expect(result.current.runtimeState.status).toBe('error');
});

test('ignores old run signals and checks entry instead of selected secondary page', async()=>{
  const project={entry:'index.html',files:{'index.html':'<p>First</p>','other.html':'<p>Other</p>'}};
  const checks=[{id:'text',type:'textEquals',selector:'p',expected:'First'}];
  const {result}=renderHook(()=>usePreviewRuntime(project,checks));
  const old=result.current.runId;
  act(()=>result.current.setPreviewPath('other.html'));
  expect(result.current.previewDocument).toContain('<p>Other</p>');
  act(()=>result.current.checkPreview());
  expect(result.current.previewPath).toBe('index.html');
  await act(async()=>{
    result.current.handleMessage({source:'web-learning-lab',runId:old,type:'signals',payload:{dom:{p:{exists:true,text:'First'}}}});
    await new Promise(resolve=>setTimeout(resolve,50));
  });
  expect(result.current.runtimeState.checkResults).toEqual([]);
  await act(async()=>{
    result.current.handleMessage({source:'web-learning-lab',runId:result.current.runId,type:'signals',payload:{dom:{p:{exists:true,text:'First'}}}});
    await new Promise(resolve=>setTimeout(resolve,50));
  });
  expect(result.current.runtimeState.checkResults[0].passed).toBe(true);
});

test('editing cancels pending verification even if iframe later sends success',async()=>{
  const checks=[{id:'text',type:'textEquals',selector:'p',expected:'First'}];
  const {result,rerender}=renderHook(({text})=>usePreviewRuntime({html:`<p>${text}</p>`},checks),{initialProps:{text:'First'}});
  act(()=>result.current.checkPreview());
  const runId=result.current.runId;
  rerender({text:'Edited'});
  await act(async()=>{
    result.current.handleMessage({source:'web-learning-lab',runId,type:'signals',payload:{dom:{p:{exists:true,text:'First'}}}});
    await new Promise(resolve=>setTimeout(resolve,50));
  });
  expect(result.current.runtimeState.checkResults).toEqual([]);
});

test('runPreview creates a new preview key and clears old runtime messages', () => {
  const { result } = renderHook(() => usePreviewRuntime(
    { html: '<p>ok</p>', baseCss: '', themeCss: '', js: '' },
    [],
    'html',
  ));
  const firstKey = result.current.previewKey;
  act(() => result.current.runPreview());
  expect(result.current.previewKey).not.toBe(firstKey);
  expect(result.current.runtimeState.messages).toEqual([]);
  expect(result.current.runtimeState.status).toBe('running');
});

test('keeps the last valid document while editing and applies CSS on run', () => {
  const { result, rerender } = renderHook(
    ({ files }) => usePreviewRuntime(files, [], 'html', 'html-02-guided'),
    { initialProps: { files: { html: '<main>Start</main>', baseCss: 'main { color: red; }', themeCss: '', js: '' } } },
  );
  const firstKey = result.current.previewKey;
  const firstDocument = result.current.previewDocument;

  rerender({ files: { html: '<main>Start</main>', baseCss: 'main { color: blue; }', themeCss: '', js: '' } });

  expect(result.current.previewKey).toBe(firstKey);
  expect(result.current.previewDocument).toBe(firstDocument);
  expect(result.current.previewDocument).toContain('color: red');

  act(() => result.current.runPreview());

  expect(result.current.previewKey).not.toBe(firstKey);
  expect(result.current.previewDocument).toContain('color: blue');
});

test('can run an explicit bundle when reset or solution updates are batched', () => {
  const { result } = renderHook(() => usePreviewRuntime(
    { html: '<main>Old</main>', baseCss: '', themeCss: '', js: '' },
    [],
    'html',
  ));

  act(() => result.current.runPreview({
    html: '<main>Starter</main>',
    baseCss: 'main { color: green; }',
    themeCss: '',
    js: '',
  }));

  expect(result.current.previewDocument).toContain('Starter');
  expect(result.current.previewDocument).toContain('color: green');
});

test('React track marks the runtime as local-react mode', () => {
  const { result } = renderHook(() => usePreviewRuntime(
    { html: '<div id="root"></div>', baseCss: '', themeCss: '', js: 'const App = () => <p>OK</p>;' },
    [],
    'react',
  ));
  expect(result.current.previewDocument).toContain('ReactDOM');
  expect(result.current.previewDocument).not.toMatch(/<script[^>]+src="https?:/i);
});

test('resets runtime state when the active task scope changes', () => {
  const { result, rerender } = renderHook(
    ({ scopeKey }) => usePreviewRuntime(
      { html: '<p>ok</p>', baseCss: '', themeCss: '', js: '' },
      [],
      'html',
      scopeKey,
    ),
    { initialProps: { scopeKey: 'html-02-guided' } },
  );

  act(() => result.current.runPreview());
  expect(result.current.runtimeState.status).toBe('running');

  rerender({ scopeKey: 'layout-15-guided' });

  expect(result.current.runtimeState.status).toBe('idle');
  expect(result.current.runtimeState.messages).toEqual([]);
  expect(result.current.runtimeState.checkResults).toEqual([]);
  expect(result.current.runtimeState.scopeKey).toBe('layout-15-guided');
});

test('auto-preview applies a changed draft after the typing debounce', () => {
  vi.useFakeTimers();
  try {
    const { result, rerender } = renderHook(
      ({ html }) => usePreviewRuntime({ html }, [], 'html', 'auto-preview'),
      { initialProps: { html: '<p>First</p>' } },
    );
    const firstKey = result.current.previewKey;

    act(() => result.current.setAutoPreview(true));
    rerender({ html: '<p>Second</p>' });

    expect(result.current.previewDocument).toContain('<p>First</p>');
    act(() => vi.advanceTimersByTime(699));
    expect(result.current.previewDocument).toContain('<p>First</p>');
    act(() => vi.advanceTimersByTime(1));

    expect(result.current.previewDocument).toContain('<p>Second</p>');
    expect(result.current.previewKey).toBeGreaterThan(firstKey);
  } finally {
    vi.useRealTimers();
  }
});

test('checking cancels a queued auto-preview so verification can finish', () => {
  vi.useFakeTimers();
  try {
    const checks = [{ id: 'text', type: 'textEquals', selector: 'p', expected: 'Edited' }];
    const { result, rerender } = renderHook(
      ({ html }) => usePreviewRuntime({ html }, checks, 'html', 'auto-check'),
      { initialProps: { html: '<p>First</p>' } },
    );

    act(() => result.current.setAutoPreview(true));
    rerender({ html: '<p>Edited</p>' });
    act(() => result.current.checkPreview());
    act(() => vi.advanceTimersByTime(700));
    const runId = result.current.runId;

    act(() => {
      result.current.handleMessage({
        source: 'web-learning-lab',
        runId,
        type: 'signals',
        payload: { dom: { p: { exists: true, text: 'Edited' } } },
      });
      vi.advanceTimersByTime(25);
    });

    expect(result.current.runtimeState.checkResults[0].passed).toBe(true);
  } finally {
    vi.useRealTimers();
  }
});
