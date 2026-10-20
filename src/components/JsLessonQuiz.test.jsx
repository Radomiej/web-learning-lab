import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import JsLessonQuiz from './JsLessonQuiz.jsx';
import { generateLessonQuestions } from '../services/lessonQuestionGenerator.js';

test('hands in an immutable descriptor and answers before revealing feedback', async () => {
  const lesson = { id: 'js-browser', track: 'js', order: 401 };
  const submit = vi.fn(async () => 'test-submission');
  const flush = vi.fn(async () => {});
  render(<JsLessonQuiz lesson={lesson} clientFactory={() => ({ start() {}, stop() {}, submit, flush })} />);
  fireEvent.click(screen.getByText('Sprawdź rozumienie — 3 pytania do tej lekcji'));
  expect(screen.getByRole('button', { name: 'Oddaj quiz i zobacz wynik' })).toBeDisabled();
  fireEvent.change(screen.getByLabelText('ID ucznia do oddania quizu'), { target: { value: '3A-12' } });
  const questions = generateLessonQuestions(lesson, { seed: 'js-browser:1', count: 3 });
  for (const question of questions) {
    const answer = question.options.find(option => option.id === question.correctOptionId);
    fireEvent.click(screen.getByLabelText(answer.text));
  }
  fireEvent.click(screen.getByRole('button', { name: 'Oddaj quiz i zobacz wynik' }));
  await screen.findByText(/Wynik: 3 z 3/);
  expect(submit).toHaveBeenCalledTimes(1);
  const snapshot = submit.mock.calls[0][0];
  expect(snapshot.assignment).toEqual({ templateId: 'js-quiz-variables', generatorVersion: '1', seed: 'js-browser:1', difficulty: 'standard', index: 0 });
  expect(snapshot.studentId).toBe('3A-12');
  expect(Object.keys(JSON.parse(snapshot.files['answer.json']).answers)).toHaveLength(3);
  fireEvent.click(screen.getByRole('button', { name: 'Nowy zestaw' }));
  expect(screen.queryByText(/Wynik: 3 z 3/)).toBeNull();
  expect(Object.keys(JSON.parse(snapshot.files['answer.json']).answers)).toHaveLength(3);
  await waitFor(() => expect(flush).toHaveBeenCalled());
});

test('confirms server delivery with a check and hides recovery controls after acceptance', async () => {
  const lesson = {id:'js-browser',track:'js',order:401};
  let changed;
  const clientFactory = ({onChange}) => {
    changed = onChange;
    return {start(){},stop(){},submit:async()=> 'accepted-quiz',flush:async()=>changed([{id:'accepted-quiz',status:'broker_accepted'}])};
  };
  render(<JsLessonQuiz lesson={lesson} standalone clientFactory={clientFactory} />);
  const questions = generateLessonQuestions(lesson,{seed:'js-browser:1',count:3});
  for(const question of questions) fireEvent.click(screen.getByLabelText(question.options.find(option=>option.id===question.correctOptionId).text));
  fireEvent.click(screen.getByRole('button',{name:'Oddaj quiz i zobacz wynik'}));
  expect(await screen.findByText('✓ Wysłano')).toBeVisible();
  expect(screen.queryByRole('button',{name:/Ponów|Pobierz|Spróbuj wysłać/})).toBeNull();
});
