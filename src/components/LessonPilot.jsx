import { useEffect, useRef, useState } from 'react';
import CodeExample from '../../shared/lab-game-v2/editor/CodeExample.jsx';
import CopyLessonLink from './CopyLessonLink.jsx';
import HtmlLessonExample from './HtmlLessonExample.jsx';
import StepTrial from './StepTrial.jsx';
import { codeText } from './codeText.jsx';
import './LessonPilot.css';

function TheoryVisual({ learning }) {
  if (learning.visual?.kind === 'html') {
    return <HtmlLessonExample page={{ title: learning.title, code: learning.visual.code }} />;
  }
  return null;
}

function AnswerDetails({ answer }) {
  return <details className="pilot-observation">
    <summary>Porównaj z oczekiwanym wynikiem</summary>
    <p>{codeText(answer)}</p>
    <p>Jeśli wynik różni się od przewidywania, znajdź w kodzie instrukcję lub warunek, który o nim decyduje.</p>
  </details>;
}

function PredictionQuiz({ question, options }) {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  if (!options?.length) return null;
  const chosen = selected != null ? options[selected] : null;
  return <fieldset className="pilot-quiz">
    <legend>{codeText(question || 'Szybkie pytanie')}</legend>
    <div className="pilot-quiz-options">
      {options.map((option, index) => <label key={index} className={`pilot-quiz-option${checked && index === selected ? (option.correct ? ' is-correct' : ' is-wrong') : ''}${checked && option.correct ? ' shows-correct' : ''}`}>
        <input type="radio" name="pilot-quiz" checked={selected === index} onChange={() => { setSelected(index); setChecked(false); }} />
        <span>{codeText(option.label)}</span>
      </label>)}
    </div>
    <button type="button" className="pilot-quiz-check" disabled={selected == null} onClick={() => setChecked(true)}>Sprawdź odpowiedź</button>
    <p className="pilot-quiz-verdict" role="status" aria-live="polite">
      {checked && chosen && (chosen.correct ? `Dobrze! ${chosen.why}` : `Niezupełnie. ${chosen.why}`)}
    </p>
    {checked && <p className="pilot-quiz-hint">Przejdź teraz próbę krokową poniżej i porównaj z odpowiedzią.</p>}
  </fieldset>;
}

// Układ „pilot" — jak w java-lab: teoria pod ręką, przewidywanie z próbą
// krokową i zadanie z edytorem + podglądem na żywo w jednym widoku.
export default function LessonPilot({
  lesson, activeTask, learning, completedTasks, onTaskChange, onNextLesson, editor, preview, feedback, submission,
}) {
  const heading = useRef(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lesson.id]);
  const taskIndex = lesson.tasks.findIndex(task => task.id === activeTask.id);
  const nextTask = lesson.tasks[taskIndex + 1];
  const focusTask = () => {
    heading.current?.focus();
  };
  const goNext = () => {
    if (nextTask) {
      onTaskChange(nextTask.id);
      focusTask();
    } else {
      onNextLesson?.();
    }
  };
  const cheatsheet = learning.cheatsheet;

  return <>
    <nav className="pilot-task-picker" aria-label="Wybierz zadanie">
      {lesson.tasks.map((task, index) => (
        <button className="pilot-task-choice" key={task.id} type="button" aria-current={task.id === activeTask.id ? 'step' : undefined} onClick={() => { if (task.id !== activeTask.id) onTaskChange(task.id); }}>
          <span aria-hidden="true">{completedTasks.includes(task.id) ? '✓' : index + 1}</span>
          {task.title}
          {completedTasks.includes(task.id) && <span className="sr-only">, ukończone</span>}
        </button>
      ))}
    </nav>

    <div className="pilot-learning">
      <details className="pilot-disclosure" key={lesson.id} open>
        <summary><strong>Teoria pod ręką</strong><span>{learning.title}</span></summary>
        <div className="pilot-disclosure-body">
          <h2>{learning.title}</h2>
          <p>{codeText(learning.text)}</p>
          <div className="pilot-theory-grid">
            <TheoryVisual key={activeTask.id} learning={learning} />
            <div><h3>Zapis w kodzie</h3><CodeExample key={activeTask.id} code={learning.code} /></div>
          </div>
          <button type="button" className="pilot-return" onClick={focusTask}>Wróć do edytora ↓</button>
        </div>
      </details>
      <details className="pilot-disclosure" key={`predict-${activeTask.id}`}>
        <summary><strong>Przewidź i sprawdź</strong><span>{codeText(learning.question)}</span><small>Opcjonalnie</small></summary>
        <div className="pilot-disclosure-body">
          <p>{codeText(learning.prediction.context)}</p>
          <div className="pilot-prediction-code">
            <CodeExample label="Kod próby" code={learning.prediction.code} />
          </div>
          <PredictionQuiz question={learning.prediction.quizQuestion} options={learning.prediction.options} />
          {learning.trace ? <>
            {learning.trial && <p><strong>Sprawdź.</strong> {codeText(learning.trial)}</p>}
            <StepTrial trace={learning.trace} />
            <AnswerDetails answer={learning.answer} />
          </> : <>
            <p><strong>Sprawdź.</strong> {codeText(learning.trial)}</p>
            <AnswerDetails answer={learning.answer} />
          </>}
        </div>
      </details>
    </div>

    <section className="pilot-task" aria-labelledby="pilot-task-title">
      <div className="pilot-task-heading">
        <span className="pilot-start-label">Zacznij tutaj</span>
        <CopyLessonLink />
      </div>
      <h2 id="pilot-task-title" tabIndex={-1} ref={heading}>Zadanie {taskIndex + 1} · {activeTask.title}</h2>
      <p className="pilot-prompt">{codeText(activeTask.prompt)}</p>
      {activeTask.criteria?.length > 0 && <details className="pilot-criteria" key={`criteria-${activeTask.id}`}>
        <summary>Kryteria zaliczenia</summary>
        <ul>{activeTask.criteria.map(criterion => <li key={criterion}>{codeText(criterion)}</li>)}</ul>
      </details>}
      {activeTask.steps?.length > 0 && <details className="pilot-criteria" key={`steps-${activeTask.id}`}>
        <summary>Kroki</summary>
        <ol>{activeTask.steps.map(step => <li key={step}>{codeText(step)}</li>)}</ol>
      </details>}
      {(activeTask.hints?.length > 0 || activeTask.hint) && <details className="pilot-criteria" key={`hints-${activeTask.id}`}>
        <summary>Wskazówki</summary>
        <ul>{(activeTask.hints ?? [activeTask.hint]).map(hint => <li key={hint}>{codeText(hint)}</li>)}</ul>
      </details>}
      {cheatsheet && <details className="pilot-disclosure pilot-cheatsheet">
        <summary><strong>Ściąga do zadania</strong><span>{cheatsheet.title}</span></summary>
        <div className="pilot-disclosure-body">
          <p>{codeText(cheatsheet.intro)}</p>
          <CodeExample {...cheatsheet.examples[0]} />
          {cheatsheet.examples.length > 1 && <details className="pilot-cheatsheet-alternatives">
            <summary>Pokaż inne sposoby</summary>
            {cheatsheet.examples.slice(1).map(example => <CodeExample key={example.label} {...example} />)}
          </details>}
        </div>
      </details>}
      <div className="pilot-workbench">
        {editor}
        {preview}
      </div>
      {feedback}
      {submission}
      {(nextTask || onNextLesson) && <div className="pilot-next">
        <button className="button button--primary pilot-next-button" type="button" onClick={goNext}>{nextTask ? 'Następne zadanie →' : 'Następna lekcja →'}</button>
      </div>}
    </section>
  </>;
}
