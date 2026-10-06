export function editSelection(text, start, end, command, language = 'javascript') {
  const lineStart = start === 0 ? 0 : text.lastIndexOf('\n', start - 1) + 1;
  const lastSelected = end > start && text[end - 1] === '\n' ? end - 1 : end;
  const nextBreak = text.indexOf('\n', lastSelected);
  const lineEnd = nextBreak < 0 ? text.length : nextBreak;
  const block = text.slice(lineStart, lineEnd);
  if (command === 'toggleComment') {
    const [open, close] = language === 'html' ? ['<!-- ', ' -->'] : language === 'css' ? ['/* ', ' */'] : ['// ', ''];
    const lines = block.split('\n');
    const uncomment = lines.every(line => line.trimStart().startsWith(open.trimEnd()) && (!close || line.trimEnd().endsWith(close.trimStart())));
    const changed = lines.map(line => {
      const indent = line.match(/^[\t ]*/)[0], body = line.slice(indent.length);
      if (!uncomment) return indent + open + body + close;
      const withoutOpen = body.slice(open.trimEnd().length).replace(/^ /, '');
      return indent + (close ? withoutOpen.slice(0, -close.trimStart().length).replace(/ $/, '') : withoutOpen);
    }).join('\n');
    return { text: text.slice(0, lineStart) + changed + text.slice(lineEnd), start: lineStart, end: lineStart + changed.length };
  }
  if (command === 'duplicateUp' || command === 'duplicateDown') {
    const offset = command === 'duplicateDown' ? lineEnd : lineStart;
    const insertion = command === 'duplicateDown' ? '\n' + block : block + '\n';
    const shift = command === 'duplicateDown' ? insertion.length : 0;
    return { text: text.slice(0, offset) + insertion + text.slice(offset), start: start + shift, end: end + shift };
  }
  if (command === 'moveUp') {
    if (!lineStart) return { text, start, end };
    const previousStart = text.lastIndexOf('\n', lineStart - 2) + 1;
    const previous = text.slice(previousStart, lineStart - 1);
    const shift = previous.length + 1;
    return { text: text.slice(0, previousStart) + block + '\n' + previous + text.slice(lineEnd), start: start - shift, end: end - shift };
  }
  if (command === 'moveDown') {
    if (nextBreak < 0) return { text, start, end };
    const followingBreak = text.indexOf('\n', lineEnd + 1);
    const followingEnd = followingBreak < 0 ? text.length : followingBreak;
    const following = text.slice(lineEnd + 1, followingEnd);
    const shift = following.length + 1;
    return { text: text.slice(0, lineStart) + following + '\n' + block + text.slice(followingEnd), start: start + shift, end: end + shift };
  }
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
  const extension = String(fileKey ?? '').toLowerCase().split('.').pop();
  if (extension === 'php') return text;
  const [{ format }, html, postcss, babel, estree] = await Promise.all([
    import('prettier/standalone'), import('prettier/plugins/html'),
    import('prettier/plugins/postcss'), import('prettier/plugins/babel'), import('prettier/plugins/estree'),
  ]);
  return format(text, {
    parser: extension === 'html' ? 'html' : ['js', 'jsx'].includes(extension) ? 'babel' : 'css',
    plugins: [html, postcss, babel, estree], tabWidth: 2, printWidth: 90,
  });
}
