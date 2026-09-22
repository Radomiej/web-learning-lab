const extensions = {html:'html', css:'css', js:'js', react:'jsx'};
const forbidden = new Set(['__proto__','prototype','constructor']);

function safePath(value, relative = false) {
  if (typeof value !== 'string' || !value || value !== value.trim() || /[\\:#?%\s<>"'\x00-\x1f]/.test(value) || value.startsWith('/')) throw new Error('Podaj względną nazwę pliku, np. components/Card.jsx.');
  const parts=[];
  for (const part of value.split('/')) {
    if (part === '.' && relative) continue;
    if (part === '..' && relative) { if (!parts.length) throw new Error('Ścieżka wychodzi poza projekt.'); parts.pop(); continue; }
    if (!part || part === '.' || part === '..' || forbidden.has(part.split('.')[0])) throw new Error('Niedozwolona nazwa pliku.');
    parts.push(part);
  }
  return parts.join('/');
}

export function resolveLocalPath(from, specifier, files) {
  const directory = from.includes('/') ? from.slice(0, from.lastIndexOf('/') + 1) : '';
  if (/^(?:[a-z]+:|\/|\\)/i.test(specifier)) throw new Error(`${from}: niedozwolona ścieżka ${specifier}`);
  const path = safePath(directory + specifier, true);
  const found = [path, `${path}.js`, `${path}.jsx`].find(candidate => Object.hasOwn(files, candidate));
  if (!found) throw new Error(`${from}: nie znaleziono pliku ${specifier}`);
  return found;
}

export function normalizeProject(bundle = {}, {track = 'html'} = {}) {
  if (bundle.files && typeof bundle.files === 'object') {
    const files = Object.fromEntries(Object.entries(bundle.files).map(([path, value]) => {
      safePath(path);
      if (typeof value !== 'string') throw new Error(`Nieprawidłowa zawartość ${path}.`);
      return [path, value];
    }));
    const entry = safePath(bundle.entry || 'index.html');
    if (!Object.hasOwn(files, entry) || !entry.endsWith('.html')) throw new Error('Brak dokumentu wejściowego HTML.');
    return {entry, files};
  }
  let linked = false;
  let html = String(bundle.html ?? '').replace(/<link\b[^>]*href=["'](?:\.\/)?(?:base|theme)\.css["'][^>]*>/gi, () => {
    if (linked) return '';
    linked = true;
    return '<link rel="stylesheet" href="styles.css">';
  });
  const files = {'index.html': html, 'styles.css': [bundle.baseCss ?? '', bundle.themeCss ?? ''].join('\n')};
  if (track === 'react') {
    html = html.replace(/<script\b[^>]*src=["'](?:\.\/)?script\.js["'][^>]*>\s*<\/script>/gi, '<script type="module" src="main.jsx"></script>');
    files['index.html'] = html;
    files['main.jsx'] = "import './legacy.jsx';\n";
    files['legacy.jsx'] = String(bundle.js ?? '');
  } else files['script.js'] = String(bundle.js ?? '');
  return {entry:'index.html', files};
}

export function createProjectFile(project, {type, name}) {
  const extension = extensions[type];
  if (!extension) throw new Error('Wybierz typ pliku.');
  let path = safePath(name);
  const basename = path.split('/').pop();
  if (!basename.includes('.')) path += `.${extension}`;
  if (!path.endsWith(`.${extension}`)) throw new Error(`Ten typ pliku wymaga rozszerzenia .${extension}.`);
  if (Object.hasOwn(project.files, path)) throw new Error('Plik już istnieje.');
  const component = basename.replace(/\.[^.]+$/, '').split(/[^a-zA-Z0-9]+/).filter(Boolean).map(part => part[0].toUpperCase()+part.slice(1)).join('');
  const identifier = /^[A-Z]/.test(component) ? component : `Component${component}`;
  const source = type === 'react' ? `import React from 'react';\n\nexport default function ${identifier}() {\n  return <section>${identifier}</section>;\n}\n`
    : type === 'html' ? '<!doctype html>\n<html lang="pl">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Nowa strona</title>\n</head>\n<body>\n  <h1>Nowa strona</h1>\n</body>\n</html>\n'
    : type === 'css' ? '/* Dodaj style i podłącz ten plik do HTML lub modułu. */\n' : '// Podłącz ten plik przez script albo import.\n';
  return {project:{...project,files:{...project.files,[path]:source}},path};
}
