// Lightweight deterministic formatter for generated course examples.
// The course generator emits compact single-line sources; this splits them
// into indented lines so starters and solutions are readable on load.
// The editor's Format action (Prettier) still handles full spacing.
// Strings and comments are opaque; braces inside parentheses stay inline.

const BLOCK_FOLLOWERS = new Set(['else', 'catch', 'finally', 'while']);

function lex(source) {
  const items = [];
  let text = '', i = 0;
  const flushText = () => {
    if (!text) return;
    items.push({ type: 'text', value: text.replace(/[ \t]+/g, ' ') });
    text = '';
  };
  while (i < source.length) {
    const c = source[i], two = source.slice(i, i + 2);
    if (two === '//') {
      const end = source.indexOf('\n', i);
      flushText();
      items.push({ type: 'lit', value: source.slice(i, end < 0 ? source.length : end) });
      i = end < 0 ? source.length : end;
      continue;
    }
    if (two === '/*') {
      const end = source.indexOf('*/', i + 2);
      flushText();
      items.push({ type: 'lit', value: source.slice(i, end < 0 ? source.length : end + 2).replace(/\s*\n\s*/g, ' ') });
      i = end < 0 ? source.length : end + 2;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1;
      while (j < source.length && source[j] !== c) j += source[j] === '\\' ? 2 : 1;
      flushText();
      items.push({ type: 'lit', value: source.slice(i, j + 1) });
      i = j + 1;
      continue;
    }
    if (c === '\n' || c === '\r') {
      flushText();
      items.push({ type: 'nl' });
      i += 1;
      continue;
    }
    if ('{};()[]'.includes(c)) {
      flushText();
      items.push({ type: c });
      i += 1;
      continue;
    }
    text += c;
    i += 1;
  }
  flushText();
  return items;
}

export function formatSource(source) {
  if (typeof source !== 'string' || !source.trim()) return source;
  const items = lex(source);
  const lines = [];
  let line = '', indent = 0, parens = 0;
  const endLine = () => {
    const trimmed = line.trimEnd();
    if (trimmed) lines.push(trimmed);
    line = '';
  };
  const append = (value) => {
    const v = line ? value : value.trimStart();
    if (!v) return;
    if (!line) line = '  '.repeat(Math.max(indent, 0));
    line += v;
  };
  for (let i = 0; i < items.length; i++) {
    const a = items[i];
    if (a.type === 'nl') { endLine(); continue; }
    if (a.type === '(' || a.type === '[') { parens++; append(a.type); continue; }
    if (a.type === ')' || a.type === ']') { parens--; append(a.type); continue; }
    if (a.type === '{') {
      if (parens === 0) { if (line.trim() && !/\s$/.test(line)) line += ' '; append('{'); indent++; endLine(); }
      else append('{');
      continue;
    }
    if (a.type === '}') {
      if (parens !== 0) { append('}'); continue; }
      endLine();
      indent--;
      append('}');
      const next = items[i + 1];
      const word = next?.type === 'text' ? next.value.trimStart().match(/^[a-z]+/i)?.[0] : '';
      if (next && (next.type === ')' || next.type === ']' || next.type === ';')) continue;
      if (next?.type === 'text' && /^[.,:]/.test(next.value.trimStart())) continue;
      if (BLOCK_FOLLOWERS.has(word)) { append(' '); continue; }
      endLine();
      continue;
    }
    if (a.type === ';') { append(';'); if (parens === 0) endLine(); continue; }
    append(a.value);
  }
  endLine();
  const result = lines.join('\n');
  return result ? `${result}\n` : source;
}

export function formatProjectFiles(files) {
  return Object.fromEntries(Object.entries(files ?? {}).map(([name, source]) => {
    const extension = name.split('.').pop();
    return [name, ['js', 'java', 'css'].includes(extension) ? formatSource(source) : source];
  }));
}
