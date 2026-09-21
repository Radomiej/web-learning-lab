import { allLessons } from './curriculum.js';
import { lessons } from './lessons.js';

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

test('exposes all four editable files in every starter bundle', () => {
  expect(lessons.every((lesson) => (
    lesson.starter.html !== undefined &&
    lesson.starter.baseCss !== undefined &&
    lesson.starter.themeCss !== undefined &&
    lesson.starter.js !== undefined
  ))).toBe(true);
});
