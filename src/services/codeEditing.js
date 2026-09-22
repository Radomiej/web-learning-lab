export function editSelection(text, start, end, command) {
  const lineStart = start === 0 ? 0 : text.lastIndexOf('\n', start - 1) + 1;
  const lastSelected = end > start && text[end - 1] === '\n' ? end - 1 : end;
  const nextBreak = text.indexOf('\n', lastSelected);
  const lineEnd = nextBreak < 0 ? text.length : nextBreak;
  if (command === 'deleteLine') {
    const from = nextBreak < 0 && lineStart > 0 ? lineStart - 1 : lineStart;
    const to = nextBreak < 0 ? text.length : lineEnd + 1;
    return { text: text.slice(0, from) + text.slice(to), start: from, end: from };
  }
  if (command === 'indent' && start === end) {
    return { text: text.slice(0, start) + '  ' + text.slice(end), start: start + 2, end: start + 2 };
  }
  if (command === 'newline') {
    const indent = text.slice(lineStart, start).match(/^[\t ]*/)[0];
    const insertion = '\n' + indent;
    return { text: text.slice(0, start) + insertion + text.slice(end), start: start + insertion.length, end: start + insertion.length };
  }
  const lines = text.slice(lineStart, lineEnd).split('\n');
  const removed = lines.map(line => line.match(/^(?: {1,2}|\t)/)?.[0].length || 0);
  const changed = lines.map((line, i) => command === 'outdent' ? line.slice(removed[i]) : '  ' + line).join('\n');
  const startDelta = command === 'outdent' ? -Math.min(removed[0], start - lineStart) : 2;
  const endDelta = command === 'outdent' ? -removed.reduce((a, b) => a + b, 0) : 2 * lines.length;
  return {
    text: text.slice(0, lineStart) + changed + text.slice(lineEnd),
    start: start + startDelta,
    end: start === end ? start + startDelta : Math.max(start + startDelta, end + endDelta),
  };
}

export async function formatCode(text, fileKey) {
  const [{ format }, html, postcss, babel, estree] = await Promise.all([
    import('prettier/standalone'), import('prettier/plugins/html'),
    import('prettier/plugins/postcss'), import('prettier/plugins/babel'), import('prettier/plugins/estree'),
  ]);
  const extension = String(fileKey ?? '').toLowerCase().split('.').pop();
  return format(text, {
    parser: extension === 'html' ? 'html' : ['js', 'jsx'].includes(extension) ? 'babel' : 'css',
    plugins: [html, postcss, babel, estree], tabWidth: 2, printWidth: 90,
  });
}
