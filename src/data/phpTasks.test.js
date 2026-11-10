import { phpLessons } from './phpLessons.js';
import { evaluateChecks } from '../services/lessonValidator.js';

test('builds the PHP lesson track from numbered definitions', () => {
  expect(phpLessons.map(({ order }) => order)).toEqual([601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 611, 612, 613, 614]);
  expect(phpLessons.map((lesson) => lesson.tasks.length)).toEqual([3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
  expect(phpLessons.flatMap(({ tasks }) => tasks).every(({ mode }) => mode === 'exercise')).toBe(true);
  expect(phpLessons.flatMap(({ tasks }) => tasks).map(({ id }) => id)).toEqual([
    'php-01-guided', 'php-01-modified', 'php-01-independent',
    'php-02-guided', 'php-02-modified', 'php-02-independent',
    'php-03-guided', 'php-03-modified', 'php-03-independent',
    'php-04-guided', 'php-04-modified', 'php-04-independent',
    'php-05-guided', 'php-05-modified', 'php-05-independent',
    'php-06-guided', 'php-06-modified', 'php-06-independent',
    'php-07-guided', 'php-07-modified', 'php-07-independent',
    'php-08-guided', 'php-08-modified', 'php-08-independent',
    'php-609-exercise-1', 'php-609-exercise-2', 'php-609-exercise-3',
    'php-610-exercise-1', 'php-610-exercise-2', 'php-610-exercise-3',
    'php-json-data-exercise-1', 'php-json-data-exercise-2', 'php-json-data-exercise-3',
    'php-fetch-api-exercise-1', 'php-fetch-api-exercise-2', 'php-fetch-api-exercise-3',
    'php-objects-exercise-1', 'php-objects-exercise-2', 'php-objects-exercise-3',
    'php-611-exercise-1', 'php-611-exercise-2', 'php-611-exercise-3',
  ]);
});

test.each(
  phpLessons.flatMap((lesson) => lesson.tasks.map((task) => [task.id, task])),
)('keeps every PHP solution source requirement executable: %s', (_id, task) => {
  const sourceChecks = task.checks.filter((check) => ['sourceIncludes','sourceMatches','sourceNotMatches'].includes(check.type));
  const result = evaluateChecks(sourceChecks, { files: task.solution.files });

  expect(sourceChecks.length).toBeGreaterThan(0);
  expect(result.results.filter((item) => !item.passed)).toEqual([]);
  expect(Object.values(task.solution.files).some((source) => source.includes('<?php'))).toBe(true);
});

test.each(
  phpLessons.flatMap(({ tasks }) =>
    tasks.slice(1).map((task, index) => [task.id, task, tasks[index]]),
  ),
)('requires a new source operation in PHP task %s', (_id, task, previousTask) => {
  const sourceChecks = task.checks.filter((check) => ['sourceIncludes','sourceMatches','sourceNotMatches'].includes(check.type));
  const previousResult = evaluateChecks(sourceChecks, { files: previousTask.solution.files });

  expect(sourceChecks.length).toBeGreaterThan(0);
  expect(previousResult.results.some((item) => !item.passed)).toBe(true);
});
