// Tiny syntax highlighter for lesson code examples (JS and Java).
// Produces plain token spans; it is not a full parser — it covers the
// vocabulary used by generated course code and theory snippets.

const KEYWORDS = new Set((
  'abstract async await boolean break byte case catch class const continue ' +
  'default do double else enum export extends final finally for from function ' +
  'get if implements import instanceof int interface let long native new of ' +
  'package private protected public return set short static super switch ' +
  'synchronized this throw throws transient try var void volatile while yield'
).split(' '));
const LITERALS = new Set(['true', 'false', 'null', 'undefined']);

export function highlightCode(code) {
  const tokens = [];
  const push = (type, value) => {
    if (!value) return;
    const last = tokens[tokens.length - 1];
    if (last?.type === type) last.value += value;
    else tokens.push({ type, value });
  };
  let i = 0;
  while (i < code.length) {
    const c = code[i], two = code.slice(i, i + 2);
    if (two === '//') {
      const end = code.indexOf('\n', i);
      push('comment', code.slice(i, end < 0 ? code.length : end));
      i = end < 0 ? code.length : end;
      continue;
    }
    if (two === '/*') {
      const end = code.indexOf('*/', i + 2);
      push('comment', code.slice(i, end < 0 ? code.length : end + 2));
      i = end < 0 ? code.length : end + 2;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1;
      while (j < code.length && code[j] !== c) j += code[j] === '\\' ? 2 : 1;
      push('string', code.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    if (c === '@' && /[A-Za-z_]/.test(code[i + 1] ?? '')) {
      const match = code.slice(i).match(/^@[A-Za-z_]\w*/)[0];
      push('annotation', match);
      i += match.length;
      continue;
    }
    if (/[0-9]/.test(c) && (i === 0 || !/[\w$]/.test(code[i - 1]))) {
      const match = code.slice(i).match(/^\d[\d_]*(?:\.\d+)?[dfl]?/i)[0];
      push('number', match);
      i += match.length;
      continue;
    }
    if (/[A-Za-z_$]/.test(c)) {
      const match = code.slice(i).match(/^[A-Za-z_$][\w$]*/)[0];
      push(KEYWORDS.has(match) ? 'keyword' : LITERALS.has(match) ? 'literal' : /^[A-Z]/.test(match) ? 'type' : 'plain', match);
      i += match.length;
      continue;
    }
    push('plain', c);
    i += 1;
  }
  return tokens;
}
