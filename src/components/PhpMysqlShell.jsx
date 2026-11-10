import { useState } from 'react';
import { phpMysqlShellProject } from '../data/phpMysqlSimulator.js';
import { runPhpProject } from '../services/phpRuntime.js';
import './PhpMysqlShell.css';

export default function PhpMysqlShell() {
  const [sql, setSql] = useState('SHOW TABLES;');
  const [database, setDatabase] = useState('biblioteka');
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  async function execute(event) {
    event.preventDefault();
    if (running || !sql.trim()) return;
    setRunning(true);
    setResult(null);
    try {
      const response = await runPhpProject({
        ...phpMysqlShellProject,
        request: { method: 'POST', form: { sql, database } },
      });
      if (response.exitCode || response.errors.length) throw new Error();
      const next = JSON.parse(response.html);
      setResult(next);
      if (!next.error) setDatabase(next.database);
    } catch {
      setResult({ error: 'Nie udało się uruchomić konsoli SQL. Spróbuj ponownie.' });
    } finally {
      setRunning(false);
    }
  }

  return (
    <details className="php-mysql-shell">
      <summary>Konsola SQL w stylu MySQL</summary>
      <p id="php-mysql-help">
        Baza <strong>{database}</strong> działa w SQLite. Wypróbuj <code>USE biblioteka</code>,
        {' '}<code>SHOW TABLES</code>, <code>DESCRIBE ksiazki</code> lub zapytanie <code>SELECT</code>.
      </p>
      <form onSubmit={execute}>
        <label htmlFor="php-mysql-command">Polecenie SQL</label>
        <textarea id="php-mysql-command" aria-describedby="php-mysql-help" rows={3}
          maxLength={2000} spellCheck={false} value={sql} onChange={(event) => setSql(event.target.value)} />
        <button type="submit" className="button button--primary" disabled={running || !sql.trim()}>
          Wykonaj
        </button>
      </form>
      <p role="status">{running ? 'Wykonuję polecenie…' : result?.message}</p>
      {result?.error && <p role="alert">{result.error}</p>}
      {result?.columns?.length > 0 && (
        <div className="php-mysql-results" role="region" aria-label="Wynik zapytania" tabIndex={0}>
          <table>
            <thead><tr>{result.columns.map((column, index) => <th scope="col" key={index}>{column}</th>)}</tr></thead>
            <tbody>{result.rows.map((row, index) => <tr key={index}>
              {row.map((value, cell) => <td key={cell}>{value ?? 'NULL'}</td>)}
            </tr>)}</tbody>
          </table>
        </div>
      )}
    </details>
  );
}
