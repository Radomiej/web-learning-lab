import { useState } from 'react';
import './CopyCodeButton.css';

export default function CopyCodeButton({ code, fileName }) {
  const [result, setResult] = useState(null);
  const status = result?.code === code && result?.fileName === fileName ? result.message : '';
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setResult({code, fileName, message: 'Skopiowano kod'});
    } catch {
      setResult({code, fileName, message: 'Zaznacz kod i użyj Ctrl+C.'});
    }
  }
  return <span className="editor-copy-control"><button type="button" className="button button--ghost" aria-label="Kopiuj kod pliku" title={fileName ? `Kopiuj kod: ${fileName}` : 'Kopiuj kod pliku'} onClick={copy}>
    <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" aria-hidden="true">{status==='Skopiowano kod'?<path d="m5 12 4 4L19 6"/>:<><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 5V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1"/></>}</svg>
  </button><span className="editor-copy-status" role={status ? "status" : undefined}>{status}</span></span>;
}
