import './LearningModule.css';

export default function LearningModule({ enabled = true, learning, quiz, children }) {
  if (!enabled) return children;
  return <section className="learning-module" aria-label="Moduł lekcji">
    <section className="learning-flow-step learning-flow-step--theory" aria-label="Teoria i przykład">
      <div className="learning-flow-heading"><span aria-hidden="true">01</span><p>POZNAJ <span aria-hidden="true">→</span> PRZEŚLEDŹ</p></div>
      {learning}
    </section>
    {quiz && <section className="learning-flow-step learning-flow-step--practice" aria-label="Krótka próba">
      <div className="learning-flow-heading"><span aria-hidden="true">02</span><p>SPRAWDŹ, CZY ROZUMIESZ</p></div>
      {quiz}
    </section>}
    <section id="lesson-task-section" className="learning-flow-step learning-flow-step--task" aria-label="Zadanie do wykonania">
      <div className="learning-flow-heading"><span aria-hidden="true">03</span><p>SPRÓBUJ SAMODZIELNIE</p></div>
      {children}
    </section>
  </section>;
}
