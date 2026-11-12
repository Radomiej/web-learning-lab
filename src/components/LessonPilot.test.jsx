import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import LessonPilot from './LessonPilot.jsx';
import { gameDevTaskLearning } from '../data/gameDevTaskLearning.js';

afterEach(cleanup);

const learning = {
  title: 'Tytuł teorii',
  text: 'Tekst z `kodem`.',
  code: '$a = 1;',
  question: 'Pytanie przewidywania',
  prediction: {
    context: 'Kontekst próby',
    code: 'echo 1;',
    options: [
      { label: 'Zła odpowiedź', correct: false, why: 'bo tak nie działa' },
      { label: 'Dobra odpowiedź', correct: true, why: 'bo właśnie tak' },
      { label: 'Trzecia opcja', correct: false, why: 'też nie' },
    ],
  },
  trial: 'Próba krokowa',
  trace: { steps: [{ caption: 'Krok', panels: { php: 'x' } }] },
  answer: 'Odpowiedź',
};
const lesson = { id: 'l1', tasks: [{ id: 't1', title: 'Zadanie', prompt: 'Prompt z `kodem`' }] };
const props = {
  lesson, activeTask: lesson.tasks[0], learning, completedTasks: [],
  onTaskChange: () => {}, onNextLesson: () => {},
  editor: <div>e</div>, preview: <div>p</div>, feedback: <div>f</div>, submission: <div>s</div>,
};

it('renders inline code spans in pilot texts', () => {
  const { container } = render(<LessonPilot {...props} />);
  const codes = [...container.querySelectorAll('code.inline-code')];
  expect(codes.some((code) => code.textContent === 'kodem')).toBe(true);
});

it('grades the quick quiz with why-feedback for wrong and right answers', () => {
  const { container } = render(<LessonPilot {...props} />);
  const check = screen.getByRole('button', { name: 'Sprawdź odpowiedź' });
  const verdict = () => container.querySelector('.pilot-quiz-verdict').textContent;
  expect(check.disabled).toBe(true);
  fireEvent.click(screen.getByLabelText(/Zła odpowiedź/));
  fireEvent.click(check);
  expect(verdict()).toContain('Niezupełnie. bo tak nie działa');
  fireEvent.click(screen.getByLabelText(/Dobra odpowiedź/));
  fireEvent.click(check);
  expect(verdict()).toContain('Dobrze! bo właśnie tak');
});

it('renders the game-dev pilot with linked terms, a chase board and a cheatsheet', () => {
  const gdLesson = {
    id: 'g2d.enemy-ai', track: 'game-dev',
    tasks: [{ id: 'g2d.enemy-ai.independent', title: 'Ucieczka', prompt: 'Zmień GameObject Slime' }],
  };
  const { container } = render(
    <LessonPilot {...props} lesson={gdLesson} activeTask={gdLesson.tasks[0]}
      learning={gameDevTaskLearning['g2d.enemy-ai.independent']} />,
  );
  expect(container.querySelector('.pilot-vector-board')).toBeInTheDocument();
  expect(container.querySelector('.pilot-cheatsheet')).toBeInTheDocument();
  const docButtons = screen.getAllByRole('button', { name: /^Dokumentacja: / });
  expect(docButtons.length).toBeGreaterThan(0);
});

it('renders the platform trial widget for g2d.scene.modified', () => {
  const gdLesson = {
    id: 'g2d.scene', track: 'game-dev',
    tasks: [{ id: 'g2d.scene.modified', title: 'Przesunięcie', prompt: 'Przesuń PlatformB' }],
  };
  const { container } = render(
    <LessonPilot {...props} lesson={gdLesson} activeTask={gdLesson.tasks[0]}
      learning={gameDevTaskLearning['g2d.scene.modified']} />,
  );
  const trial = container.querySelector('.pilot-platform-trial');
  expect(trial).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Odtwórz próbę' }));
  expect(trial.querySelector('[role="status"]')).toHaveTextContent('x = 340');
});

it('renders the coordinate board when learning has board kind coordinates', () => {
  const gdLesson = {
    id: 'g2d.scene', track: 'game-dev',
    tasks: [{ id: 'g2d.scene.modified', title: 'Przesunięcie', prompt: 'Przesuń PlatformB' }],
  };
  render(
    <LessonPilot {...props} lesson={gdLesson} activeTask={gdLesson.tasks[0]}
      learning={{ ...learning, board: { kind: 'coordinates' } }} />,
  );
  expect(screen.getByRole('group', { name: 'Plansza układu współrzędnych' })).toBeInTheDocument();
});
