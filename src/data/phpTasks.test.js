import { phpLessons } from './phpLessons.js';
import { evaluateChecks } from '../services/lessonValidator.js';

test('builds the PHP lesson track from numbered definitions', () => {
  expect(phpLessons).toHaveLength(8);
  expect(phpLessons.every((lesson) => lesson.tasks.length === 2)).toBe(true);
});

test.each(
  phpLessons.flatMap((lesson) => lesson.tasks.map((task) => [task.id, task])),
)('keeps every PHP solution source requirement executable: %s', (_id, task) => {
  const sourceChecks = task.checks.filter((check) => check.type === 'sourceIncludes');
  const result = evaluateChecks(sourceChecks, { files: task.solution.files });

  expect(sourceChecks.length).toBeGreaterThan(0);
  expect(result.results.filter((item) => !item.passed)).toEqual([]);
  expect(task.solution.files[task.solution.entry]).toContain('<?php');
});
