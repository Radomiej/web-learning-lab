import { useEffect, useRef, useState } from 'react';
import { loadTutorConfig, sendTutorMessage } from '../services/tutorApi.js';
import { validateProposals } from '../services/tutorProposals.js';
import ChatMessage from './ChatMessage.jsx';
import ModelPicker from './ModelPicker.jsx';

function TutorAvatar() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="7" width="16" height="13" rx="4" /><path d="M12 3v4M2 12v4m20-4v4M9 16h6" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /></svg>;
}

export default function GameTutor({ project, projectRevision, onApply, loadConfig = loadTutorConfig, sendMessage = sendTutorMessage }) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState(null);
  const [model, setModel] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [question, setQuestion] = useState('');
  const [includeCode, setIncludeCode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [snapshot, setSnapshot] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(null);
  useEffect(() => {
    if (!open) return;
    let alive = true;
    loadConfig().then(value => { if (alive) { setConfig(value); setModel(current => value.models?.some(item => item.id === current) ? current : value.models?.find(item => item.id === 'openrouter/free')?.id || value.models?.[0]?.id || ''); setError(''); } }).catch(e => { if (alive) { setConfig(null); setError(e.message); } });
    return () => { alive = false; pending.current?.abort(); };
  }, [loadConfig, refresh, open]);
  async function ask(event) {
    event.preventDefault();
    if (busy || !config?.configured || !model || !question.trim()) return;
    const history = [...messages, { role: 'user', content: question.trim() }].slice(-19);
    const currentSnapshot = { project: structuredClone(project), revision: projectRevision };
    const controller = new AbortController(); pending.current = controller;
    setBusy(true); setError(''); setProposals([]); setMessages(history); setQuestion('');
    try {
      const answer = await sendMessage({ model, messages: history, ...(includeCode ? { project: currentSnapshot.project } : {}) }, { signal: controller.signal });
      if (controller.signal.aborted) return;
      const valid = validateProposals(answer.proposals ?? []);
      setSnapshot(currentSnapshot);
      setMessages([...history, { role: 'assistant', content: answer.message }]);
      setProposals(valid);
    } catch (e) { if (!controller.signal.aborted) setError(e.message); }
    finally { if (pending.current === controller) { pending.current = null; setBusy(false); } }
  }
  function cancel() { pending.current?.abort(); pending.current = null; setBusy(false); }
  async function apply(proposal) {
    try {
      await onApply(proposal, snapshot);
      setProposals(items => items.filter(item => item.path !== proposal.path));
      setError('');
    } catch (e) { setError(e.message); }
  }
  return <section className="game-tutor">
    {!open && <button className="game-tutor-launcher" type="button" title="Otwórz korepetytora AI" aria-expanded={false} aria-controls="game-tutor-content" onClick={() => setOpen(true)}><TutorAvatar /><span>Pomoc AI</span></button>}
    {open && <div id="game-tutor-content" className="game-tutor-content">
      <header className="game-tutor-heading"><span className="game-tutor-avatar"><TutorAvatar /></span><div><h2>Korepetytor AI</h2><small>Pomoc w tworzeniu gry</small></div><button className="game-tutor-close" type="button" aria-label="Zamknij panel korepetytora" title="Zamknij panel korepetytora" onClick={() => setOpen(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></header>
      <div className="game-tutor-conversation">
      {!config && !error && <p role="status">Ładowanie modeli…</p>}
      {config && !config.configured && <p role="status">Chat jest niedostępny bez skonfigurowanego backendu.</p>}
      {config?.configured && !config.models?.length && <p role="status">Brak dostępnych darmowych modeli.</p>}
      <div className="game-tutor-history" aria-live="polite">{messages.map((message, index) => <article key={index}><strong>{message.role === 'user' ? 'Ty' : 'Tutor'}</strong><ChatMessage text={message.content} /></article>)}</div>
      {!messages.length && <div className="game-tutor-welcome"><TutorAvatar /><h3>Co chcesz zbudować?</h3><p>Zapytaj o składnię, ruch gracza lub własny komponent.</p></div>}
      {proposals.map(proposal => <article className="game-tutor-proposal" key={proposal.path}><h3>{proposal.path}</h3><p>{proposal.reason}</p>{Object.hasOwn(project.files, proposal.path) && <p>Uwaga: zastąpi istniejący plik.</p>}<details><summary>Zobacz proponowany kod</summary><pre><code>{proposal.content}</code></pre></details><button className="button button--primary" type="button" onClick={() => apply(proposal)}>Zastosuj {proposal.path}</button></article>)}
      {error && <><p role="alert">{error}</p>{!busy && <button className="button button--ghost" type="button" onClick={() => { setError(''); setConfig(null); setRefresh(value => value + 1); }}>Spróbuj ponownie</button>}</>}
      </div>
      <form onSubmit={ask}>
        <div className="game-tutor-compose"><label className="sr-only" htmlFor="tutor-question">Twoje pytanie</label><textarea id="tutor-question" maxLength={8000} value={question} onChange={event => setQuestion(event.target.value)} placeholder="Napisz wiadomość…" disabled={busy} /><button className="game-tutor-send" aria-label="Wyślij pytanie" title="Wyślij wiadomość" disabled={busy || !config?.configured || !model || !question.trim()}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" /></svg></button></div>
        <div className="game-tutor-compose-options"><ModelPicker models={config?.models || []} value={model} disabled={busy || !config?.configured} onChange={setModel} /><label title="Wyślij aktualny kod wraz z wiadomością"><input type="checkbox" checked={includeCode} onChange={event => setIncludeCode(event.target.checked)} disabled={busy} /><span aria-hidden="true">Dołącz kod</span><span className="sr-only">Dołącz kod aktualnego projektu</span></label></div>
        {busy && <div className="game-tutor-actions"><span role="status">Tutor pisze…</span><button className="button button--ghost" type="button" onClick={cancel}>Anuluj</button></div>}
        <small className="game-tutor-privacy">Wiadomości trafiają do OpenRouter. Kod tylko po zaznaczeniu „Dołącz kod”. Zmiany plików wymagają Twojej zgody.</small>
      </form>
    </div>}
  </section>;
}
