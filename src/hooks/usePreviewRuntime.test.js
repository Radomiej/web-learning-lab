import { renderHook, act } from '@testing-library/react';
import { usePreviewRuntime } from './usePreviewRuntime.js';

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
