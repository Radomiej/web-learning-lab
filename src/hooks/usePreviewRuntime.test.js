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
  expect(result.current.previewDocument).not.toContain('https://');
});
