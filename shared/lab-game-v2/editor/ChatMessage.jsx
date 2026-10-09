import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatMessage.css';

// Some model responses escape block markers. Repair only those markers,
// keeping fenced code and inline escapes unchanged.
export function normalizeTutorMarkdown(text) {
  let fence = null;
  return String(text ?? '').split(/\r?\n/).map(line => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length && /^\s*$/.test(line.slice(marker[0].length))) fence = null;
      return line;
    }
    if (fence || /^ {4}|^\t/.test(line)) return line;
    return line.replace(/^( {0,3})\\(?=#{1,6}\s|[*+-]\s|\d+[.)]\s|>\s)/, '$1');
  }).join('\n');
}
function CodeBlock({ language, code }) {
  const [status, setStatus] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(code); setStatus('Skopiowano'); }
    catch { setStatus('Nie udało się skopiować — zaznacz kod ręcznie.'); }
  }
  return <div className="chat-code-block"><div className="chat-code-heading"><span>{language || 'Kod'}</span><button type="button" onClick={copy} aria-label="Kopiuj kod">Kopiuj</button></div><pre tabIndex={0}><code>{code}</code></pre>{status && <small role="status">{status}</small>}</div>;
}
const components = {
  pre({ node }) {
    const code = node.children.find(child => child.tagName === 'code');
    const content = code?.children.map(child => child.value ?? '').join('') ?? '';
    const classes = code?.properties?.className ?? [];
    const language = classes.find(value => value.startsWith('language-'))?.slice(9) ?? '';
    return <CodeBlock language={language} code={content.replace(/\n$/, '')}/>;
  },
  a({ children, href }) { return href ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> : <span>{children}</span>; },
  table({ children }) { return <div className="chat-markdown-table"><table>{children}</table></div>; },
};
export default function ChatMessage({ text }) {
  return <div className="chat-message-text"><Markdown remarkPlugins={[remarkGfm]} components={components}>{normalizeTutorMarkdown(text)}</Markdown></div>;
}