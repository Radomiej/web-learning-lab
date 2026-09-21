import { buildPreviewDocument } from './previewDocument.js';

test('places base CSS before theme CSS and student JavaScript after both', () => {
  const document = buildPreviewDocument({
    html: '<main id="app">Hello</main>',
    baseCss: 'body { color: red; }',
    themeCss: '#app { color: blue; }',
    js: 'document.body.dataset.ready = "yes";',
  }, { track: 'html' });
  expect(document.indexOf('body { color: red; }')).toBeLessThan(
    document.indexOf('#app { color: blue; }'),
  );
  expect(document.indexOf('document.body.dataset.ready')).toBeGreaterThan(
    document.indexOf('#app { color: blue; }'),
  );
});

test('waits for the iframe load event before collecting the initial snapshot', () => {
  const document = buildPreviewDocument({
    html: '<p>ready</p>',
    baseCss: '',
    themeCss: '',
    js: '',
  }, { track: 'html' });

  expect(document).toContain("window.addEventListener('load'");
});

test('does not duplicate head or body for a full HTML document', () => {
  const document = buildPreviewDocument({
    html: '<!doctype html><html lang="pl"><head><title>Ćwiczenie</title></head><body><h1>Start</h1></body></html>',
    baseCss: '',
    themeCss: '',
    js: '',
  }, { track: 'html' });
  expect((document.match(/<html\b/gi) || []).length).toBe(1);
  expect((document.match(/<head\b/gi) || []).length).toBe(1);
  expect((document.match(/<body\b/gi) || []).length).toBe(1);
  expect(document).toContain('<title>Ćwiczenie</title>');
});

test('builds a valid viewport meta tag for HTML fragments', () => {
  const document = buildPreviewDocument({
    html: '<div id="root"></div>',
    baseCss: '',
    themeCss: '',
    js: '',
  }, { track: 'react' });

  expect(document).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
});

test('escapes script end markers inside student JavaScript', () => {
  const document = buildPreviewDocument({
    html: '<p>safe</p>',
    baseCss: '',
    themeCss: '',
    js: 'const label = "</script>";',
  }, { track: 'html' });
  expect(document).toContain('\\x3c/script>');
});

test('escapes script openers inside inline runtime code', () => {
  const document = buildPreviewDocument({
    html: '<div id="root"></div>',
    baseCss: '',
    themeCss: '',
    js: '',
  }, { track: 'react' });

  expect(document).toContain('\\x3cscript');
  expect(document).not.toContain("'<script><' + '/script>'");
});

test('adds local React, ReactDOM, and compiled JSX only for the React track', () => {
  const document = buildPreviewDocument({
    html: '<div id="root"></div>',
    baseCss: '',
    themeCss: '',
    js: 'const App = () => <button>Gotowe</button>; ReactDOM.createRoot(document.getElementById("root")).render(<App />);',
  }, { track: 'react' });
  expect(document).toContain('ReactDOM');
  expect(document).toContain('React.createElement');
  expect(document.indexOf('React.createElement')).toBeGreaterThan(document.indexOf('data-runtime="true"'));
  expect(document).not.toMatch(/<script[^>]+src=/i);
});
