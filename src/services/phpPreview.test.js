import { JSDOM } from 'jsdom';
import { buildPhpPreviewDocument } from './phpPreview.js';

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

test('renders a silent loading document without the runtime bridge', () => {
  const source = buildPhpPreviewDocument(
    '<main><p>Uruchamiam PHP.wasm…</p></main>',
    { files: { 'index.php': '<?php echo "x";' }, entry: 'index.php' },
    { bridge: false },
  );
  const dom = new JSDOM(source);

  expect(dom.window.document.querySelector('main')?.textContent).toContain('Uruchamiam PHP.wasm');
  expect(dom.window.document.querySelector('script[data-runtime="bridge"]')).toBeNull();
  dom.window.close();
});
