import { buildPreviewDocument } from './previewDocument.js';
import { JSDOM } from 'jsdom';

const craProject = {
  entry: 'public/index.html',
  runtime: {
    kind: 'react-cra',
    module: 'src/index.js',
    root: '#root',
    bootstrap: true,
  },
  files: {
    'public/index.html': '<!doctype html><html lang="pl"><head><title>CRA</title></head><body><div id="root"></div></body></html>',
    'src/index.js': `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';

createRoot(document.getElementById('root')).render(<App />);`,
    'src/App.js': `import React from 'react';

export default function App() {
  return <h1>CRA działa</h1>;
}`,
  },
};

const waitForRender = () => new Promise((resolve) => setTimeout(resolve, 0));

test('runs the manifest CRA entry from public/index.html without changing the source file', async () => {
  const document = buildPreviewDocument(craProject, { track: 'react' });
  const dom = new JSDOM(document, { runScripts: 'dangerously', url: 'http://localhost/' });

  try {
    await waitForRender();
    expect(dom.window.document.querySelector('#root h1')?.textContent).toBe('CRA działa');
    expect(craProject.files['public/index.html']).not.toContain('script');
  } finally {
    dom.window.close();
  }
});

test('renders a minimal react01-style CRA fixture with both CSS files and Bootstrap', async () => {
  const project = {
    entry: 'public/index.html',
    runtime: craProject.runtime,
    files: {
      'public/index.html': '<!doctype html><html lang="pl"><head><title>React INF.04</title></head><body><div id="root"></div></body></html>',
      'src/index.css': 'body { background: #eef2ff; }',
      'src/App.css': '.app-title { color: #0d6efd; }',
      'src/index.js': `import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';

createRoot(document.getElementById('root')).render(<App />);`,
      'src/App.js': `import React from 'react';
import './App.css';

export default function App() {
  return <main className="container py-4"><h1 className="app-title">React INF.04 działa</h1><button className="btn btn-primary">Bootstrap</button></main>;
}`,
    },
  };

  const document = buildPreviewDocument(project, { track: 'react' });
  const dom = new JSDOM(document, { runScripts: 'dangerously', url: 'http://localhost/' });

  try {
    await waitForRender();
    expect(dom.window.document.querySelector('#root h1')?.textContent).toBe('React INF.04 działa');
    expect(dom.window.document.querySelector('.btn.btn-primary')).not.toBeNull();
    expect(dom.window.document.querySelectorAll('style').length).toBeGreaterThanOrEqual(3);
    expect(dom.window.document.body.dataset.previewError).toBeUndefined();
  } finally {
    dom.window.close();
  }
});

test('reports the CRA entry filename when an imported file is missing', () => {
  const project = {
    ...craProject,
    files: {
      ...craProject.files,
      'src/index.js': "import App from './Missing.js'; App;",
    },
  };

  const document = buildPreviewDocument(project, { track: 'react' });

  expect(document).toContain('src/index.js');
  expect(document).toContain('Missing.js');
});

test('does not mount the CRA app into a selected non-entry HTML document', () => {
  const project = {
    ...craProject,
    files: {
      ...craProject.files,
      'public/about.html': '<!doctype html><html><body><h1>O nas</h1></body></html>',
    },
  };

  const document = buildPreviewDocument(project, {
    track: 'react',
    documentPath: 'public/about.html',
  });

  expect(document).toContain('O nas');
  expect(document).not.toContain('data-file="src/index.js"');
});

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
