import { useState } from 'react';

function CodeBlock({ language, code }) {
  const [status, setStatus] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(code); setStatus('Skopiowano'); }
    catch { setStatus('Nie udało się skopiować — zaznacz kod ręcznie.'); }
  }
  return <div className="chat-code-block"><div className="chat-code-heading"><span>{language || 'Kod'}</span><button type="button" onClick={copy} aria-label="Kopiuj kod">Kopiuj</button></div><pre tabIndex={0}><code>{code}</code></pre>{status && <small role="status">{status}</small>}</div>;
}
function inline(text) {
  return text.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*)/g).map((part, index) => part.startsWith('`') ? <code key={index}>{part.slice(1, -1)}</code> : part.startsWith('**') ? <strong key={index}>{part.slice(2, -2)}</strong> : part);
}
export default function ChatMessage({ text }) {
  const blocks = [];
  const fence = /```([^\n`]*)\r?\n([\s\S]*?)(?:```|$)/g;
  let cursor = 0;
  for (const match of text.matchAll(fence)) {
    if (match.index > cursor) blocks.push(<p key={`p${cursor}`}>{inline(text.slice(cursor, match.index))}</p>);
    const code = match[2].replace(/\r?\n$/, '');
    blocks.push(<CodeBlock key={`c${match.index}`} language={match[1].trim()} code={code} />);
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) blocks.push(<p key={`p${cursor}`}>{inline(text.slice(cursor))}</p>);
  return <div className="chat-message-text">{blocks}</div>;
}
