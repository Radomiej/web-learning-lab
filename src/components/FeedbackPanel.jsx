export default function FeedbackPanel({ checkResults = [], runtimeErrors = [] }) {
  const passed = checkResults.filter((result) => result.passed).length;
  return (
    <section className="feedback-panel" aria-labelledby="feedback-title">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Informacja zwrotna</p>
          <h2 id="feedback-title">Wynik sprawdzenia</h2>
        </div>
        {checkResults.length > 0 && <span className={`score-badge${passed === checkResults.length ? ' is-complete' : ''}`}>{passed}/{checkResults.length}</span>}
      </div>
      {runtimeErrors.length > 0 && (
        <div className="feedback-error" role="alert">
          <strong>Błąd uruchomienia</strong>
          {runtimeErrors.map((error, index) => <span key={`${error}-${index}`}>{error}</span>)}
        </div>
      )}
      {checkResults.length === 0 && runtimeErrors.length === 0 && <p className="muted-copy">Uruchom kod, a następnie kliknij „Sprawdź”, aby zobaczyć wynik.</p>}
      {checkResults.length > 0 && (
        <ul className="feedback-list">
          {checkResults.map((result) => (
            <li className={result.passed ? 'is-passed' : 'is-failed'} key={result.id}>
              <span className="feedback-icon" aria-hidden="true">{result.passed ? '✓' : '!'}</span>
              <span><strong>{result.label}</strong><small>{result.message}</small>{!result.passed && result.hint && <em>{result.hint}</em>}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
