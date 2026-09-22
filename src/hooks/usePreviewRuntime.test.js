import { renderHook, act } from '@testing-library/react';
import { usePreviewRuntime } from './usePreviewRuntime.js';

test('evaluates computed CSS arrays received from the iframe', async () => {
  const checks = [{ id: 'flex', type: 'computedStyle', selector: '.practice', property: 'display', expected: 'flex' }];
  const { result } = renderHook(() => usePreviewRuntime({ html: '<div class="practice"></div>' }, checks));
  act(() => result.current.checkPreview());
  await act(async () => {
    result.current.handleMessage({ source: 'web-learning-lab', type: 'signals', payload: { styles: [{ selector: '.practice', property: 'display', value: 'flex' }] } });
    await new Promise(resolve => setTimeout(resolve, 50));
  });
  expect(result.current.runtimeState.checkResults[0].passed).toBe(true);
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
