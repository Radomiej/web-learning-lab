import './PhpForeachDiagram.css';

function Segment({ language, children }) {
  return <span className={`php-foreach-segment php-foreach-segment--${language.toLowerCase()}`}>
    <small>{language}</small><code>{children}</code>
  </span>;
}

export default function PhpForeachDiagram() {
  return <figure className="php-foreach-diagram" aria-label="HTML i PHP wewnątrz pętli foreach">
    <figcaption><strong>Jeden szablon → dwa elementy listy</strong></figcaption>
    <div className="php-foreach-source">
      <Segment language="PHP">{'<?php $tools = ["PHP", "SQL"]; ?>'}</Segment>
      <Segment language="HTML">{'<ul>'}</Segment>
      <div className="php-foreach-loop">
        <span className="php-foreach-boundary">Początek pętli</span>
        <Segment language="PHP">{'<?php foreach ($tools as $tool): ?>'}</Segment>
        <div className="php-foreach-repeat">
          <strong>Powtarzany fragment</strong>
          <p className="php-foreach-note">Wszystko w tej ramce wykonuje się dla każdego elementu tablicy.</p>
          <div className="php-foreach-body">
            <Segment language="HTML">{'<li>'}</Segment>
            <Segment language="PHP">{'<?= htmlspecialchars($tool, ENT_QUOTES, "UTF-8") ?>'}</Segment>
            <Segment language="HTML">{'</li>'}</Segment>
          </div>
        </div>
        <span className="php-foreach-boundary">Koniec pętli</span>
        <Segment language="PHP">{'<?php endforeach; ?>'}</Segment>
      </div>
      <Segment language="HTML">{'</ul>'}</Segment>
    </div>
    <p className="php-foreach-note">
      <code>?&gt;</code> kończy blok PHP. Pętla powtarza fragment pomiędzy <code>foreach</code> i <code>endforeach</code>.
    </p>
    <div className="php-foreach-iterations">
      {['PHP', 'SQL'].map((tool, index) => <div className="php-foreach-pass" key={tool}>
        <strong>Obieg {index + 1}</strong>
        <code className="php-foreach-value">$tool = "{tool}"</code>
        <div className="php-foreach-body">
          <Segment language="HTML">{'<li>'}</Segment>
          <Segment language="PHP">{tool}</Segment>
          <Segment language="HTML">{'</li>'}</Segment>
        </div>
        <p>↓ Powstaje <code>{`<li>${tool}</li>`}</code></p>
      </div>)}
    </div>
    <div className="php-foreach-output">
      <strong>W przeglądarce</strong>
      <ul><li>PHP</li><li>SQL</li></ul>
    </div>
  </figure>;
}
