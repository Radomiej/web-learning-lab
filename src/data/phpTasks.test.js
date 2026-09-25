import { phpLessons } from './phpLessons.js';

test('builds the PHP lesson track from numbered definitions', () => {
  expect(phpLessons).toHaveLength(8);
  expect(phpLessons.every((lesson) => lesson.tasks.length === 2)).toBe(true);
});
