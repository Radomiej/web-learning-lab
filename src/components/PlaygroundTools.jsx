import { useEffect, useRef, useState } from 'react';
import { MAX_GAME_PROJECT_BYTES, parseGameProject, serializeGameProject } from '../services/gameProjectTransfer.js';
import { buildPlaygroundOrbit, runPlaygroundOnLan } from '../services/orbitPlayground.js';

const NEKKO_ORIGIN = new URL(import.meta.env.VITE_NEKKO_ORIGIN || 'https://play.nekko.software').origin;

function sendOrbitPackage(target, requestId, name, bytes, waitForReady) {
  return new Promise((resolve, reject) => {
    let sent = false;
    const timeout = setTimeout(() => {
      window.removeEventListener('message', receive);
      reject(new Error('Nekko nie odebrało gry. Sprawdź, czy okno Nekko jest otwarte. Bez konta możesz połączyć tylko nieprzypisaną konsolę; do przypisanej zaloguj się na konto właściciela. Możesz też pobrać paczkę .orbit.'));
    }, waitForReady ? 180000 : 10000);
    function send() {
      if (sent) return;
      sent = true;
      target.postMessage({
        type: 'orbit:game-package', version: 1, intent: 'private-playground', requestId, name, bytes: bytes.buffer,
      }, NEKKO_ORIGIN);
    }
    function receive(event) {
      if (event.source !== target || event.origin !== NEKKO_ORIGIN || event.data?.requestId !== requestId) return;
      if (waitForReady && event.data.type === 'orbit:playground-ready') send();
      if (sent && event.data.type === 'orbit:game-package-ack') {
        clearTimeout(timeout);
        window.removeEventListener('message', receive);
        resolve();
      }
    }
    window.addEventListener('message', receive);
    if (!waitForReady) send();
  });
}

export default function PlaygroundTools({ project, onImport }) {
  const inputRef = useRef(null);
  const aliveRef = useRef(true);
  const [status, setStatus] = useState('');
  const [reading, setReading] = useState(false);
  const [sending, setSending] = useState(false);
  const [orbitOpen, setOrbitOpen] = useState(false);
  const [orbitAddress, setOrbitAddress] = useState('');
  const [orbitCode, setOrbitCode] = useState('');
  const orbitId = useRef(null);
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

  async function sendToOrbit(mode) {
    const requestId = crypto.randomUUID();
    const embedded = window.parent !== window && document.referrer &&
      new URL(document.referrer).origin === NEKKO_ORIGIN;
    const popup = mode === 'online' && !embedded
      ? window.open(NEKKO_ORIGIN + '/?orbitPlayground=' + requestId, '_blank') : null;
    setSending(true);
    setStatus('Przygotowuję paczkę Orbit…');
    try {
      orbitId.current ??= 'web-lab-' + crypto.randomUUID();
      const bytes = await buildPlaygroundOrbit(project, orbitId.current);
      if (!aliveRef.current) return;
      const name = orbitId.current + '.orbit';
      if (mode === 'local') {
        await runPlaygroundOnLan(orbitAddress, orbitCode, bytes);
        if (aliveRef.current) {
          setOrbitCode('');
          setStatus('Konsola przyjęła polecenie uruchomienia gry.');
        }
      } else if (mode === 'online' && (embedded || popup)) {
        setStatus('W Nekko wybierz sesję tymczasową bez konta dla nieprzypisanej konsoli albo zaloguj się, aby przypisać konsolę do swojego konta.');
        await sendOrbitPackage(embedded ? window.parent : popup, requestId, name, bytes, !embedded);
        if (aliveRef.current) setStatus('Nekko odebrało grę. Wpisz kod dla sesji tymczasowej albo zaloguj się na konto właściciela już przypisanej konsoli.');
      } else {
        const url = URL.createObjectURL(new Blob([bytes], { type: 'application/zip' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setStatus('Pobrano paczkę. W Nekko rozpocznij sesję tymczasową bez konta dla nieprzypisanej konsoli albo zaloguj się na konto właściciela już przypisanej konsoli. Wpisz kod i wczytaj plik .orbit w sekcji prywatnej gry Playground.');
      }
    } catch (error) {
      if (aliveRef.current) setStatus(`Orbit: ${error.message}`);
    } finally {
      if (aliveRef.current) setSending(false);
    }
  }

  return <div className="playground-tools">
    <p>Twórz własne komponenty i uruchamiaj grę. Kopia JSON zawiera HTML, CSS, JavaScript oraz wszystkie dodane pliki.</p>
    <div className="playground-tools-actions">
      <button className="button button--secondary" type="button" onClick={exportProject}>Eksportuj JSON</button>
      <button className="button button--secondary" type="button" aria-expanded={orbitOpen}
        aria-controls="playground-orbit" onClick={() => setOrbitOpen(value => !value)}>Uruchom na Orbit</button>
      <button className="button button--ghost" type="button" disabled={reading} onClick={() => {
        if (window.confirm('Import zastąpi pliki bieżącego projektu. Wyeksportuj je wcześniej, jeśli chcesz zachować kopię.')) inputRef.current?.click();
      }}>Importuj JSON</button>
      <input ref={inputRef} className="sr-only" type="file" accept=".json,application/json" aria-label="Plik JSON projektu gry" onChange={importProject} />
    </div>
    {orbitOpen && <form id="playground-orbit" onSubmit={event => { event.preventDefault(); void sendToOrbit('local'); }}>
      <p>Włącz tryb online na ekranie Dev Server konsoli. W Nekko możesz rozpocząć pięciogodzinną sesję tymczasową bez konta dla nieprzypisanej konsoli albo zalogować się na konto, do którego chcesz ją przypisać. Konsola już przypisana wymaga konta jej właściciela.</p>
      <div className="playground-tools-actions">
        <button className="button button--secondary" type="button" disabled={sending}
          onClick={() => void sendToOrbit('online')}>Przygotuj grę do uruchomienia online</button>
        <button className="button button--ghost" type="button" disabled={sending}
          onClick={() => void sendToOrbit('download')}>Pobierz paczkę .orbit</button>
      </div>
      <details>
        <summary>Połącz przez lokalne Wi‑Fi</summary>
        <label>Adres konsoli <input value={orbitAddress} placeholder="192.168.0.232:8080"
          onChange={event => setOrbitAddress(event.target.value)} /></label>
        <label>Pięcioznakowy kod LAN <input maxLength={5} autoComplete="off" value={orbitCode}
          onChange={event => setOrbitCode(event.target.value.toUpperCase())} /></label>
        <button className="button button--ghost" disabled={sending || !orbitAddress || !orbitCode}>Uruchom przez LAN</button>
      </details>
    </form>}
    {status && <p role="status">{status}</p>}
  </div>;
}
