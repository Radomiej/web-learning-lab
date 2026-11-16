import { JSDOM } from 'jsdom';
import { buildPhpPreviewDocument, describePhpResponse } from './phpPreview.js';

test('turns PHP output into a document with the project stylesheet and runtime bridge', () => {
  const source = buildPhpPreviewDocument(
    '<main><h1 id="result">Witaj w PHP!</h1></main>',
    {
      files: {
        'index.php': '<?php echo "Witaj w PHP!";',
        'styles.css': '#result { color: red; }',
      },
      entry: 'index.php',
    },
    { track: 'php', requestedSignals: [] },
  );
  const dom = new JSDOM(source);

  expect(dom.window.document.querySelector('#result')?.textContent).toBe('Witaj w PHP!');
  expect(dom.window.document.querySelector('style')?.textContent).toContain('color: red');
  expect(dom.window.document.querySelector('script[data-runtime="bridge"]')).not.toBeNull();
  dom.window.close();
});

test('keeps echo output printed before the doctype inside the preview body', () => {
  const output = 'Wiadomość: Cześć!<!doctype html>\n<html lang="pl"><head><title>Karta</title></head><body><main><p id="result">Wiadomość: Cześć!</p></main></body></html>';
  const source = buildPhpPreviewDocument(output, { files: { 'index.php': '<?php ?>' }, entry: 'index.php' }, { track: 'php' });
  const dom = new JSDOM(source);

  // Jak w przeglądarce: tekst sprzed <!doctype> ląduje na początku <body>.
  expect(dom.window.document.body.textContent).toContain('Wiadomość: Cześć!');
  expect(dom.window.document.querySelector('#result')?.textContent).toBe('Wiadomość: Cześć!');
  dom.window.close();
});

test('describePhpResponse snapshots selectors and visible text per request run', () => {
  const html = 'Poza<body class="card"><main><p id="result">Witaj, Ala!</p><script>var t = "ukryty";</script></main>';
  const response = describePhpResponse(html, ['#result', '#missing']);

  expect(response.dom['#result']).toMatchObject({ exists: true, text: 'Witaj, Ala!' });
  expect(response.dom['#missing'].exists).toBe(false);
  expect(response.text).toContain('Witaj, Ala!');
  // Tekst spoza <body> trafia do snapshotu — jak przy relokacji w przeglądarce.
  expect(response.text).toContain('Poza');
  expect(response.text).not.toContain('ukryty');
});
