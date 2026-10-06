import { useEffect, useRef, useState } from 'react';
import { MAX_GAME_PROJECT_BYTES, parseGameProject, serializeGameProject } from '../services/gameProjectTransfer.js';

export default function PlaygroundTools({ project, onImport }) {
  const inputRef = useRef(null);
  const aliveRef = useRef(true);
  const [status, setStatus] = useState('');
  const [reading, setReading] = useState(false);
  useEffect(() => { aliveRef.current = true; return () => { aliveRef.current = false; }; }, []);

  function exportProject() {
    try {
      const blob = new Blob([serializeGameProject(project)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = 'moja-gra.json';
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus('Wyeksportowano wszystkie pliki projektu do moja-gra.json.');
    } catch (error) { setStatus(error.message); }
  }

  async function importProject(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setReading(true); setStatus('Wczytuję projekt…');
    try {
      if (file.size > MAX_GAME_PROJECT_BYTES) throw new Error('Projekt może mieć maksymalnie 5 MB.');
      const nextProject = parseGameProject(await file.text());
      if (!aliveRef.current) return;
      onImport(nextProject);
      setStatus(`Wczytano ${file.name}. Projekt jest zapisany w tej przeglądarce.`);
    } catch (error) { if (aliveRef.current) setStatus(`Nie zaimportowano: ${error.message}`); }
    finally { if (aliveRef.current) setReading(false); }
  }

  return <div className="playground-tools">
    <p>Twórz własne komponenty i uruchamiaj grę. Kopia JSON zawiera HTML, CSS, JavaScript oraz wszystkie dodane pliki.</p>
    <div className="playground-tools-actions">
      <button className="button button--secondary" type="button" onClick={exportProject}>Eksportuj JSON</button>
      <button className="button button--ghost" type="button" disabled={reading} onClick={() => {
        if (window.confirm('Import zastąpi pliki bieżącego projektu. Wyeksportuj je wcześniej, jeśli chcesz zachować kopię.')) inputRef.current?.click();
      }}>Importuj JSON</button>
      <input ref={inputRef} className="sr-only" type="file" accept=".json,application/json" aria-label="Plik JSON projektu gry" onChange={importProject} />
    </div>
    {status && <p role="status">{status}</p>}
  </div>;
}
