export default function RuntimeConsole({ messages = [] }) {
  return (
    <section className="runtime-console" aria-labelledby="console-title">
      <div className="section-heading-row">
        <div><p className="eyebrow">Diagnostyka</p><h2 id="console-title">Konsola</h2></div>
        <span className="count-badge">{messages.length}</span>
      </div>
      <div className="console-output" aria-live="polite">
        {messages.length === 0 ? <span className="console-placeholder">Brak komunikatów.</span> : messages.map((message, index) => (
          <div className={`console-line console-line--${message.level || 'log'}`} key={`${message.level}-${index}`}>
            <span>&gt;</span><code>{message.args?.join(' ') || message.message || String(message)}</code>
          </div>
        ))}
      </div>
    </section>
  );
}
