import { lessons } from './lessons.js';

test('teaches border style before border width in CSS 204', () => {
  const lesson = lessons.find((candidate) => candidate.order === 204);
  const guidedTask = lesson.tasks.find((task) => task.mode === 'guided');
  const styleChecks = guidedTask.checks
    .filter((check) => check.type === 'computedStyle')
    .map((check) => check.property);

  expect(styleChecks).toEqual([
    'box-sizing',
    'padding-top',
    'border-top-style',
    'border-top-width',
  ]);
});
