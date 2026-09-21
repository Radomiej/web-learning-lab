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

test('escapes script end markers inside student JavaScript', () => {
  const document = buildPreviewDocument({
    html: '<p>safe</p>',
    baseCss: '',
    themeCss: '',
    js: 'const label = "</script>";',
  }, { track: 'html' });
  expect(document).toContain('<\\/script>');
});
