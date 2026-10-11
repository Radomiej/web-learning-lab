import { useState } from 'react';
import './CodeExample.css';

export default function CodeExample({ code }) {
  const [status, setStatus] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus('Skopiowano kod');
    } catch {
      setStatus('Nie udało się skopiować. Zaznacz kod i użyj Ctrl+C.');
    }
  }
  const copied = status === 'Skopiowano kod';
  return <div className="lesson-code-example">
    <div className="lesson-code-toolbar"><span>Kod przykładowy</span><button type="button" onClick={copy} aria-label="Kopiuj kod" title={copied ? 'Skopiowano kod' : 'Kopiuj kod'}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">{copied ? <path d="m5 12 4 4L19 6"/> : <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 5V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1"/></>}</svg>
    </button></div>
    <pre tabIndex="0"><code>{code}</code></pre>
    <span className="lesson-code-status" role="status">{status}</span>
  </div>;
}
