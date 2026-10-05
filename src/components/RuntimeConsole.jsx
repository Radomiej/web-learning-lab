export default function RuntimeConsole({ messages = [], errors = [], status = 'idle' }) {
  const label = status === 'running' ? 'Uruchamiam' : status === 'error' ? 'Błąd' : status === 'ready' ? 'Gotowe' : 'Czeka';
  return (
    <section className="runtime-console" aria-labelledby="console-title">
      <div className="console-heading">
        <h2 id="console-title">Konsola</h2>
        <span className={`runtime-pill runtime-pill--${status}`} role="status">{label}</span>
      </div>
      <pre className="console-output" tabIndex={0} aria-label="Wynik programu i błędy">{messages.map((message, index) => (
        <span className={`console-line console-line--${message.level || 'log'}`} key={`${message.level}-${index}`}>{message.level === 'warn' ? '⚠ ' : message.level === 'error' ? 'Błąd: ' : '> '}{message.args?.join(' ') || message.message || String(message)}{'\n'}</span>
      ))}{errors.map((error, index) => <span className="console-line console-line--error" key={`error-${index}`}>Błąd: {error}{'\n'}</span>)}{messages.length === 0 && errors.length === 0 && <span className="console-placeholder">{status === 'running' ? 'Uruchamiam kod…' : status === 'ready' ? 'Kod działa. Brak komunikatów console.log.' : 'Uruchom kod, aby zobaczyć wynik programu lub błędy.'}</span>}</pre>
    </section>
  );
}
