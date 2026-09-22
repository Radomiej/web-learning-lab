function resourceMarkup(script) {
  const type = script.endsWith('.jsx') ? ' type="module"' : '';
  return {
    stylesheet: '  <link rel="stylesheet" href="styles.css">',
    script: `  <script${type} src="${script}"></script>`,
  };
}

export function fullDocument(html = '', title = 'Ćwiczenie', { script = 'script.js' } = {}) {
  const resources = resourceMarkup(script);
  if (/<!doctype\s+html/i.test(html)) {
    let document = html.includes('name="viewport"')
      ? html
      : html.replace(/<\/head>/i, '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>');
    if (!/href=["'](?:\.\/)?styles\.css["']/i.test(document)) {
      document = document.replace(/<\/head>/i, `${resources.stylesheet}\n</head>`);
    }
    if (!new RegExp(`src=["'](?:\\./)?${script.replace('.', '\\.')}["']`, 'i').test(document)) {
      document = document.replace(/<\/body>/i, `${resources.script}\n</body>`);
    }
    return document;
  }
  return `<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title.replace(/[<>&"]/g, '')}</title>
${resources.stylesheet}
</head>
<body>
  ${html.replace(/></g, '>\n  <')}
${resources.script}
</body>
</html>`;
}

export function documentBundle(bundle, title, options) {
  return { ...bundle, html: fullDocument(bundle.html, title, options) };
}
