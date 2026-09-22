import { allLessons } from './curriculum.js';
import { lessons } from './lessons.js';
import { evaluateChecks } from '../services/lessonValidator.js';

test('contains the complete 39-lesson sequence', () => {
  expect(allLessons).toHaveLength(39);
  expect(allLessons.map((lesson) => lesson.order)).toEqual(
    Array.from({ length: 39 }, (_, index) => index + 1),
  );
});

test('contains exactly 24 layout tasks across lessons 15 to 22', () => {
  const layoutLessons = lessons.filter(
    (lesson) => lesson.order >= 15 && lesson.order <= 22,
  );
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
  expect(reactLessons[0].order).toBe(32);
  expect(reactLessons.at(-1).order).toBe(39);
});

test('exposes the standard project files in every starter', () => {
  expect(lessons.every((lesson) => (
    lesson.starter.entry === 'index.html' &&
    lesson.starter.files['index.html'] !== undefined &&
    lesson.starter.files['styles.css'] !== undefined &&
    (lesson.track === 'react'
      ? lesson.starter.files['main.jsx'] !== undefined && lesson.starter.files['App.jsx'] !== undefined
      : lesson.starter.files['script.js'] !== undefined)
  ))).toBe(true);
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
    .filter((lesson) => lesson.order > 1 && ['html', 'css'].includes(lesson.track))
    .flatMap((lesson) => lesson.tasks);
  const lessonOneFiles = lessons.find((lesson) => lesson.order === 1).starter.files;
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
