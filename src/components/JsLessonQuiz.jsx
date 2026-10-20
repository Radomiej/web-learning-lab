import { useEffect, useMemo, useRef, useState } from 'react';
import { generateLessonQuestions, gradeLessonQuestion } from '../services/lessonQuestionGenerator.js';
import CodeExample from '../../shared/lab-game-v2/editor/CodeExample.jsx';
import './JsCourse.css';
import { createSubmissionClient } from '../services/assignmentSubmissions.js';
import { getInstallationId } from '../services/installationId.js';
import { trackLabEvent } from '../services/labAnalytics.js';

export default function JsLessonQuiz({ lesson, clientFactory = createSubmissionClient, standalone = false, onContinue }) {
  const [variant, setVariant] = useState(1);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [studentId, setStudentId] = useState(() => { try { return JSON.parse(localStorage.getItem('www-lab-assignment-identity') || '{}').studentId || getInstallationId().slice(-6); } catch { return getInstallationId().slice(-6); } });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [outbox, setOutbox] = useState([]);
  const [savedCopy, setSavedCopy] = useState(null);
  const client = useRef(null);
  const seed = `${lesson.id}:${variant}`;
  const questions = useMemo(() => generateLessonQuestions(lesson, { seed, count: 3 }), [lesson, seed]);
  useEffect(() => {
    const syncIdentity = () => { if (!submitted) { try { setStudentId(JSON.parse(localStorage.getItem('www-lab-assignment-identity') || '{}').studentId || getInstallationId().slice(-6)); } catch {} } };
    addEventListener('student-identity-change', syncIdentity);
    return () => removeEventListener('student-identity-change', syncIdentity);
  }, [submitted]);
  useEffect(() => {
    let alive = true;
    client.current = clientFactory({ appId: 'www-lab', onChange: (rows, failure) => { if (alive) { setOutbox(rows); if (failure) setError(failure); } } });
    client.current.start();
    return () => { alive = false; client.current.stop(); };
  }, [clientFactory]);
  const complete = questions.every(question => answers[question.id]);
  const score = submitted ? questions.filter(question => gradeLessonQuestion(question, answers[question.id]).correct).length : 0;
  function nextSet() { setVariant(value => value + 1); setAnswers({}); setSubmitted(false); setNotice(''); setError(''); }
  async function handIn(event) {
    event.preventDefault();
    if (!complete || submitted || sending) return;
    if (!studentId.trim()) { setError('Podaj ID ucznia przed oddaniem quizu.'); return; }
    setSending(true); setError('');
    try {
      const topic = questions[0].topic;
      const assignment = { generatorVersion: '1', templateId: lesson.track === 'js' ? `js-quiz-${topic}` : `course-quiz-${lesson.id}`, seed, difficulty: 'standard', index: 0 };
      const files = { 'answer.json': JSON.stringify({ lessonId: lesson.id, answers }, null, 2) };
      const id = await client.current.submit({ assignment, studentId, files });
      setSavedCopy({ submissionId: id, assignment, studentId, files });
      setNotice(id); setSubmitted(true);
      trackLabEvent('quiz_submitted', { lesson_id: lesson.id, lesson_number: lesson.order, total: questions.length, passed: questions.filter(question => gradeLessonQuestion(question, answers[question.id]).correct).length, kind: 'quiz', action: 'queued' });
      void client.current.flush().catch(failure => setError(failure.message));
    } catch (failure) { setError(failure.message); }
    finally { setSending(false); }
  }
  const submission = outbox.find(row => row.id === notice);
  const delivered = submission?.status === 'broker_accepted';
  const Container = standalone ? 'section' : 'details';
  return <Container className="js-lesson-quiz" aria-label="Quiz lekcji">
    {!standalone &&
    <summary>Sprawdź rozumienie — 3 pytania do tej lekcji</summary>
    }
    <div className="js-quiz-body">
      <p>3 pytania · Zestaw {variant}</p>
      <form onSubmit={handIn}>
        {!standalone && <label>ID ucznia do oddania<input aria-label="ID ucznia do oddania quizu" value={studentId} onChange={event => setStudentId(event.target.value)} maxLength={80} disabled={sending || submitted} /></label>}
        {questions.map((question, index) => <fieldset key={question.id} disabled={submitted || sending}>
          <legend>{index + 1}. {question.prompt}</legend>
          {question.code && <CodeExample code={question.code} />}
          {question.options.map(option => <label key={option.id}><input type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => setAnswers(current => ({ ...current, [question.id]: option.id }))} /> <span>{option.text}</span></label>)}
          {submitted && <p className="js-question-feedback"><strong>{gradeLessonQuestion(question, answers[question.id]).correct ? 'Poprawnie. ' : 'Wróć do zasady. '}</strong>{question.explanation} Poprawna odpowiedź: {question.options.find(option => option.id === question.correctOptionId)?.text}</p>}
        </fieldset>)}
        <div className="js-quiz-actions"><button type="submit" disabled={!complete || submitted || sending}>{sending ? 'Zapisywanie…' : 'Oddaj quiz i zobacz wynik'}</button><button type="button" onClick={nextSet} disabled={sending}>Nowy zestaw</button></div>
        <p role="status">{submitted ? `Wynik: ${score} z ${questions.length}.` : 'Zaznacz jedną odpowiedź w każdym pytaniu.'}</p>
        {notice && <p role="status" className={delivered ? 'js-quiz-delivered' : undefined}>{delivered ? '✓ Wysłano' : submission?.status === 'rejected' ? 'Nie udało się wysłać. Pobierz kopię odpowiedzi i przekaż ją nauczycielowi.' : 'Odpowiedzi zapisane. Czekają na wysłanie…'}</p>}
        {!delivered && (error || submission?.error) && <p role="alert">{error || submission.error}</p>}
        {notice && !delivered && submission?.status !== 'rejected' && (error || submission?.error) && <button type="button" onClick={() => client.current.flush().catch(failure => setError(failure.message))}>Spróbuj wysłać ponownie</button>}
        {savedCopy && !delivered && (error || submission?.error || submission?.status === 'rejected') && <button type="button" onClick={() => {
          const url = URL.createObjectURL(new Blob([JSON.stringify(savedCopy, null, 2)], { type: 'application/json' }));
          const link = document.createElement('a'); link.href = url; link.download = `quiz-${savedCopy.submissionId}.json`; link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }}>Pobierz ostatnio oddany quiz</button>}
      </form>
      {onContinue && <button type="button" className="button button--primary" onClick={onContinue}>Przejdź do zadania →</button>}
    </div>
  </Container>;
}
