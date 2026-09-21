import { compileJsx, getReactRuntimeScripts } from './reactRuntimeAssets.js';

test('compiles JSX, fragments, and hooks without a network request', () => {
  const result = compileJsx(
    'const [count, setCount] = React.useState(0); const App = () => <><button onClick={() => setCount(count + 1)}>{count}</button></>;',
  );
  expect(result.code).toContain('React.createElement');
  expect(result.code).toContain('React.useState');
  expect(result.warnings).toEqual([]);
});

test('returns non-empty local React and ReactDOM runtime scripts', () => {
  const runtime = getReactRuntimeScripts();
  expect(runtime.react).toContain('React');
  expect(runtime.reactDom).toContain('ReactDOM');
  expect(runtime.react.startsWith('http')).toBe(false);
  expect(runtime.reactDom.startsWith('http')).toBe(false);
});

test('reports JSX errors as warnings instead of throwing from the editor', () => {
  const result = compileJsx('const App = () => <div>');
  expect(result.code).toBe('');
  expect(result.warnings[0]).toContain('JSX');
});
