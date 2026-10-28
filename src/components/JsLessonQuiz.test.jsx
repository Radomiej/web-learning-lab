import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import JsLessonQuiz from './JsLessonQuiz.jsx';
import { generateLessonQuestions } from '../services/lessonQuestionGenerator.js';

test('hands in an immutable descriptor and answers before revealing feedback', async () => {
  const lesson = { id: 'js-browser', track: 'js', order: 401 };
  const submit = vi.fn(async () => 'test-submission');
  const flush = vi.fn(async () => {});
  const { container } = render(<JsLessonQuiz lesson={lesson} clientFactory={() => ({ start() {}, stop() {}, submit, flush })} />);
  fireEvent.click(screen.getByText('Sprawdź rozumienie — 6 pytań do tej lekcji'));
  expect(screen.getByRole('button', { name: 'Oddaj quiz i zobacz wynik' })).toBeDisabled();
  fireEvent.change(screen.getByLabelText('ID ucznia do oddania quizu'), { target: { value: '3A-12' } });
  fireEvent.change(screen.getByLabelText('Imię i nazwisko do oddania quizu'), { target: { value: 'Jan Kowalski' } });
  const questions = generateLessonQuestions(lesson, { seed: 'js-browser:1' });
  const fieldsets = container.querySelectorAll('fieldset');
  questions.forEach((question, index) => {
    const answer = question.options.find(option => option.id === question.correctOptionId);
    fireEvent.click(within(fieldsets[index]).getByLabelText(answer.text));
  });
  fireEvent.click(screen.getByRole('button', { name: 'Oddaj quiz i zobacz wynik' }));
  await screen.findByText(/Wynik: 6 z 6/);
  expect(submit).toHaveBeenCalledTimes(1);
  const snapshot = submit.mock.calls[0][0];
  expect(snapshot.assignment).toEqual({ templateId: 'js-quiz-variables', generatorVersion: '1', seed: 'js-browser:1', difficulty: 'standard', index: 0 });
  expect(snapshot.studentId).toBe('3A-12');
  expect(snapshot.studentName).toBe('Jan Kowalski');
  expect(Object.keys(JSON.parse(snapshot.files['answer.json']).answers)).toHaveLength(6);
  fireEvent.click(screen.getByRole('button', { name: 'Nowy zestaw' }));
  expect(screen.queryByText(/Wynik: 6 z 6/)).toBeNull();
  expect(Object.keys(JSON.parse(snapshot.files['answer.json']).answers)).toHaveLength(6);
  await waitFor(() => expect(flush).toHaveBeenCalled());
});

test('confirms server delivery with a check and hides recovery controls after acceptance', async () => {
  const lesson = {id:'js-browser',track:'js',order:401};
  let changed;
  const clientFactory = ({onChange}) => {
    changed = onChange;
    return {start(){},stop(){},submit:async()=> 'accepted-quiz',flush:async()=>changed([{id:'accepted-quiz',status:'broker_accepted'}])};
  };
  const { container } = render(<JsLessonQuiz lesson={lesson} standalone clientFactory={clientFactory} />);
  fireEvent.change(screen.getByLabelText('ID ucznia do oddania quizu'),{target:{value:'3A-12'}});
  fireEvent.change(screen.getByLabelText('Imię i nazwisko do oddania quizu'),{target:{value:'Jan Kowalski'}});
  const questions = generateLessonQuestions(lesson,{seed:'js-browser:1'});
  const fieldsets = container.querySelectorAll('fieldset');
  questions.forEach((question,index) => fireEvent.click(within(fieldsets[index]).getByLabelText(question.options.find(option=>option.id===question.correctOptionId).text)));
  fireEvent.click(screen.getByRole('button',{name:'Oddaj quiz i zobacz wynik'}));
  expect(await screen.findByText('✓ Wysłano')).toBeVisible();
  expect(screen.queryByRole('button',{name:/Ponów|Pobierz|Spróbuj wysłać/})).toBeNull();
});
