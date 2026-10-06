import { useEffect, useRef, useState } from 'react';
import { loadTutorConfig, sendTutorMessage } from '../services/tutorApi.js';
import { validateProposals } from '../services/tutorProposals.js';

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
    let alive = true;
    loadConfig().then(value => { if (alive) { setConfig(value); setModel(current => value.models?.some(item => item.id === current) ? current : ''); setError(''); } }).catch(e => { if (alive) { setConfig(null); setError(e.message); } });
    return () => { alive = false; pending.current?.abort(); };
  }, [loadConfig, refresh]);
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
    <button className="button button--ghost" type="button" aria-expanded={open} aria-controls="game-tutor-content" onClick={() => setOpen(value => !value)}>Pomoc AI</button>
    {open && <div id="game-tutor-content" className="game-tutor-content">
      <h2>Porozmawiaj o swojej grze</h2>
      <p className="muted-copy">Tutor zna API GameLab. Tłumaczy składnię i może zaproponować komponent; pliki zmieniasz dopiero po zatwierdzeniu.</p>
      <label className="game-tutor-question">Darmowy model OpenRouter<select value={model} disabled={busy || !config?.configured} onChange={event => setModel(event.target.value)}><option value="">Wybierz model…</option>{config?.models?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <button className="button button--ghost" type="button" disabled={busy} onClick={() => { setConfig(null); setRefresh(value => value + 1); }}>Odśwież modele</button>
      {config?.configured && !config.models?.length && <p role="status">Brak dostępnych darmowych modeli w aktualnym katalogu.</p>}
      <details><summary>Konfiguracja i prywatność</summary><p>{config?.configured ? 'Backend sprawdza cenę modelu przed każdym pytaniem i odrzuca modele płatne.' : 'Ustaw OPENROUTER_API_KEY w pliku .env backendu.'}</p><p>Pytania trafiają do OpenRouter i operatora modelu, który może je przechowywać. Darmowe modele mogą mieć limity dostępności. Kod wysyłamy tylko po zaznaczeniu opcji poniżej. Nie dołączaj sekretów.</p></details>
      {!config?.configured && <p role="status">Chat jest niedostępny bez skonfigurowanego backendu.</p>}
      <div className="game-tutor-history" aria-live="polite">{messages.map((message, index) => <article key={index}><strong>{message.role === 'user' ? 'Ty' : 'Tutor'}</strong><p>{message.content}</p></article>)}</div>
      {proposals.map(proposal => <article className="game-tutor-proposal" key={proposal.path}><h3>{proposal.path}</h3><p>{proposal.reason}</p>{Object.hasOwn(project.files, proposal.path) && <p>Uwaga: zastąpi istniejący plik.</p>}<details><summary>Zobacz proponowany kod</summary><pre><code>{proposal.content}</code></pre></details><button className="button button--primary" type="button" onClick={() => apply(proposal)}>Zastosuj {proposal.path}</button></article>)}
      {error && <p role="alert">{error}</p>}
      <form onSubmit={ask}><label className="game-tutor-question">Twoje pytanie<textarea maxLength={8000} value={question} onChange={event => setQuestion(event.target.value)} placeholder="Jak dodać przeciwnika śledzącego gracza?" disabled={busy} /></label><label><input type="checkbox" checked={includeCode} onChange={event => setIncludeCode(event.target.checked)} disabled={busy} /> Dołącz kod aktualnego projektu</label><div className="game-tutor-actions"><button className="button button--primary" disabled={busy || !config?.configured || !model || !question.trim()}>Wyślij pytanie</button>{busy && <><span role="status">Tutor przygotowuje odpowiedź…</span><button className="button button--ghost" type="button" onClick={cancel}>Anuluj</button></>}</div></form>
    </div>}
  </section>;
}
