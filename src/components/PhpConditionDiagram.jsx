import './PhpConditionDiagram.css';

function Truth({ value }) {
  return <span className={`php-truth php-truth--${value}`}>{value ? 'true' : 'false'}</span>;
}

export default function PhpConditionDiagram({ logic = false }) {
  return <figure className="php-condition-diagram">
    <figcaption><strong>{logic ? 'AND wymaga obu, OR wystarczy jeden' : 'Czy liczba przekracza próg 5?'}</strong></figcaption>
    {logic ? <>
      <div className="php-logic-rule">
        <p><code>A &amp;&amp; B</code><strong>AND · i</strong><span>Oba warunki dają true.</span></p>
        <p><code>A || B</code><strong>OR · lub</strong><span>Co najmniej jeden warunek daje true.</span></p>
      </div>
      <table>
        <caption>Wszystkie cztery kombinacje dwóch warunków</caption>
        <thead><tr><th scope="col">A</th><th scope="col">B</th><th scope="col">AND<br /><code>&amp;&amp;</code></th><th scope="col">OR<br /><code>||</code></th></tr></thead>
        <tbody>{[[true, true], [true, false], [false, true], [false, false]].map(([a, b]) =>
          <tr key={`${a}-${b}`}><td><Truth value={a} /></td><td><Truth value={b} /></td><td><Truth value={a && b} /></td><td><Truth value={a || b} /></td></tr>
        )}</tbody>
      </table>
      <p className="php-condition-example"><code>17 &gt;= 18</code> daje <Truth value={false} />, a <code>$permission === true</code> daje <Truth value={true} />.
        {' '}Z <code>&amp;&amp;</code> wynik to <Truth value={false} />, z <code>||</code> to <Truth value={true} />.</p>
    </> : <>
      <table>
        <caption>Ten sam próg, trzy liczby do porównania</caption>
        <thead><tr><th scope="col">Warunek</th><th scope="col">x = 4</th><th scope="col">x = 5</th><th scope="col">x = 7</th></tr></thead>
        <tbody>{[
          ['>', 'więcej niż 5', [false, false, true]],
          ['>=', 'co najmniej 5', [false, true, true]],
          ['<', 'mniej niż 5', [true, false, false]],
          ['<=', 'co najwyżej 5', [true, true, false]],
        ].map(([sign, meaning, results]) => <tr key={sign}>
          <th scope="row"><code>x {sign} 5</code><small>{meaning}</small></th>
          {results.map((value, index) => <td key={index}><Truth value={value} /></td>)}
        </tr>)}</tbody>
      </table>
      <p>Przy <strong>x = 5</strong> znaki <code>&gt;=</code> i <code>&lt;=</code> obejmują także równość.</p>
      <div className="php-condition-flow">
        <code>$points = 7<br />$points &gt;= 5</code><span aria-hidden="true">↓</span>
        <span><Truth value={true} /> → blok <code>if</code> → <strong>Zaliczone</strong></span>
      </div>
    </>}
  </figure>;
}
