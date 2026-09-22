export function fullDocument(html = '', title = 'Ćwiczenie') {
  if (/<!doctype\s+html/i.test(html)) {
    return html.includes('name="viewport"') ? html : html.replace(/<\/head>/i, '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>');
  }
  return `<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title.replace(/[<>&"]/g, '')}</title>
  <link rel="stylesheet" href="base.css">
  <link rel="stylesheet" href="theme.css">
  <script src="script.js" defer></script>
</head>
<body>
  ${html.replace(/></g, '>\n  <')}
</body>
</html>`;
}

export function documentBundle(bundle, title) {
  return { ...bundle, html: fullDocument(bundle.html, title) };
}
