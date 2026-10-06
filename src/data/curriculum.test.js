import { allLessons } from './curriculum.js';
import { lessons } from './lessons.js';
import { evaluateChecks } from '../services/lessonValidator.js';

test('reserves a three-digit lesson range for every track', () => {
  expect(allLessons).toHaveLength(60);
  const expected = {
    html: Array.from({ length: 9 }, (_, index) => 101 + index),
    css: Array.from({ length: 6 }, (_, index) => 201 + index),
    layout: Array.from({ length: 8 }, (_, index) => 301 + index),
    js: Array.from({ length: 8 }, (_, index) => 401 + index),
    react: Array.from({ length: 8 }, (_, index) => 501 + index),
    php: Array.from({ length: 8 }, (_, index) => 601 + index),
    'game-dev': Array.from({ length: 12 }, (_, index) => 701 + index),
    playground: [801],
  };

  for (const [track, orders] of Object.entries(expected)) {
    expect(allLessons.filter((lesson) => lesson.track === track).map((lesson) => lesson.order)).toEqual(orders);
  }
});

test('contains exactly 24 layout tasks across the layout range', () => {
  const layoutLessons = lessons.filter((lesson) => lesson.track === 'layout');
  const tasks = layoutLessons.flatMap((lesson) => lesson.tasks);
  expect(layoutLessons).toHaveLength(8);
  expect(tasks).toHaveLength(24);
  expect(tasks.filter((task) => task.mode === 'guided')).toHaveLength(8);
  expect(tasks.filter((task) => task.mode === 'independent')).toHaveLength(8);
  expect(tasks.filter((task) => task.mode === 'challenge')).toHaveLength(8);
});

test('contains eight React lessons after the JavaScript track', () => {
  const reactLessons = lessons.filter((lesson) => lesson.track === 'react');
  expect(reactLessons).toHaveLength(8);
  expect(reactLessons[0].order).toBe(501);
  expect(reactLessons.at(-1).order).toBe(508);
});

test('exposes the standard project files in every starter', () => {
  expect(lessons.every((lesson) => (
    lesson.track === 'react'
      ? lesson.starter.entry === 'public/index.html' &&
        lesson.starter.files['public/index.html'] !== undefined &&
        lesson.starter.files['src/index.js'] !== undefined &&
        lesson.starter.files['src/App.js'] !== undefined &&
        lesson.starter.files['src/index.css'] !== undefined &&
        lesson.starter.files['src/App.css'] !== undefined
      : lesson.track === 'php'
        ? lesson.starter.entry === 'index.php' &&
          lesson.starter.files['index.php'] !== undefined &&
          lesson.starter.files['styles.css'] !== undefined
        : lesson.starter.entry === 'index.html' &&
        lesson.starter.files['index.html'] !== undefined &&
        lesson.starter.files['styles.css'] !== undefined &&
        lesson.starter.files[lesson.track === 'game-dev' ? 'game.js' : 'script.js'] !== undefined
  ))).toBe(true);
});

test('React tasks use the exam profile paths in their instructions', () => {
  const tasks = lessons
    .filter((lesson) => lesson.track === 'react')
    .flatMap((lesson) => lesson.tasks);

  expect(tasks).not.toHaveLength(0);
  expect(tasks.every((task) => task.prompt.includes('src/'))).toBe(true);
  expect(tasks.some((task) => task.prompt.includes('src/components/'))).toBe(true);
  expect(tasks.some((task) => task.prompt.includes('src/hooks/'))).toBe(true);
});

test('React lesson metadata points to the CRA files students edit', () => {
  const expectedFiles = new Map([
    [501, 'src/index.js'],
    [502, 'src/components/Card.js'],
    [503, 'src/App.js'],
    [504, 'src/App.js'],
    [505, 'src/App.js'],
    [506, 'src/App.js'],
    [507, 'src/hooks/useCounter.js'],
    [508, 'src/components/TaskItem.js'],
  ]);

  for (const lesson of lessons.filter((candidate) => candidate.track === 'react')) {
    expect(lesson.file).toBe(expectedFiles.get(lesson.order));
    expect(`${lesson.theory.join(' ')} ${lesson.focus}`).not.toMatch(/main\.jsx|App\.jsx/);
  }
});

test('HTML and CSS tasks require more than one copy-paste token', () => {
  const tasks = lessons
    .filter((lesson) => ['html', 'css'].includes(lesson.track))
    .flatMap((lesson) => lesson.tasks);

  expect(tasks.length).toBeGreaterThan(0);
  expect(tasks.every((task) => (
    task.checks.length > 1
    || task.checks.some((check) => check.type !== 'sourceIncludes')
  ))).toBe(true);
});

test('untouched and lesson-one starter code cannot pass later HTML or CSS tasks', () => {
  const laterTasks = lessons
    .filter((lesson) => lesson.id !== 'html-three-layers' && ['html', 'css'].includes(lesson.track))
    .flatMap((lesson) => lesson.tasks);
  const lessonOneFiles = lessons.find((lesson) => lesson.id === 'html-three-layers').starter.files;
  const emptySignals = {
    dom: {},
    styles: {},
    viewport: {},
    interactions: {},
    runtimeErrors: [],
    react: {},
  };

  laterTasks.forEach((task) => {
    const untouched = evaluateChecks(task.checks, { files: task.starter.files, signals: emptySignals });
    const copiedFromLessonOne = evaluateChecks(task.checks, { files: lessonOneFiles, signals: emptySignals });

    expect(untouched.passed, `${task.id} passes untouched`).toBeLessThan(untouched.total);
    expect(copiedFromLessonOne.passed, `${task.id} passes copied lesson one`).toBeLessThan(copiedFromLessonOne.total);
  });
});
