import { phpLessons } from './phpLessons.js';
import { evaluateChecks } from '../services/lessonValidator.js';

// Tak buduje klucze signals.phpRequests runtime: po jednym wpisie na żądanie.
const phpRequestKey = (request) => JSON.stringify({
  method: String(request.method || 'GET').toUpperCase(),
  path: String(request.path || ''),
  query: request.query || {},
  form: request.form || {},
  body: request.body == null ? '' : String(request.body),
});

// Sygnały, które zebrałby podgląd dla sprawnego rozwiązania: run per żądanie,
// interakcje zakończone sukcesem i DOM z elementami opisanymi checkami.
const seedSignalsFor = (task) => {
  const phpRequests = {};
  const interactions = {};
  const dom = {};
  for (const check of task.checks) {
    if (check.type === 'phpRequest') {
      const key = phpRequestKey(check.request);
      phpRequests[key] = phpRequests[key] || { requestKey: key, exitCode: 0, text: '', dom: {} };
      phpRequests[key].dom[check.selector] = { exists: true, text: check.expected, attrs: {} };
      phpRequests[key].text = check.expected;
    } else if (check.type === 'interaction') {
      interactions[check.id] = {
        ok: true,
        text: check.expected?.textEquals ?? check.expected?.text ?? '',
        before: check.expected?.beforeText == null ? {} : { text: check.expected.beforeText },
      };
    } else if (check.selector) {
      dom[check.selector] = {
        exists: true,
        text: typeof check.expected === 'string' ? check.expected : '',
        attrs: check.attribute ? { [check.attribute]: check.expected } : {},
      };
    }
  }
  return { phpRequests, interactions, dom, runtimeErrors: [] };
};

const taskById = (id) => phpLessons.flatMap(({ tasks }) => tasks).find((task) => task.id === id);

const php07TaskIds = ['php-07-guided', 'php-07-modified', 'php-07-independent'];
const php08TaskIds = ['php-08-guided', 'php-08-modified', 'php-08-independent'];
const phpFormTaskIds = [...php07TaskIds, ...php08TaskIds];

test.each(phpFormTaskIds)('php form task %s defines a GET-run displayed page plus POST coverage', (id) => {
  const task = taskById(id);
  const requestChecks = task.checks.filter((check) => check.type === 'phpRequest');
  expect(requestChecks[0].request.method || 'GET').toBe('GET');
  expect(requestChecks.some((check) => check.request.method === 'POST')).toBe(true);
});

const reworkedTaskIds = [
  'php-02-independent', 'php-03-modified', 'php-03-independent',
  'php-04-modified', 'php-04-independent', 'php-05-modified', 'php-05-independent',
  'php-06-modified', 'php-06-independent',
  ...phpFormTaskIds,
];

test.each(reworkedTaskIds)('official solution of %s passes with seeded preview signals', (id) => {
  const task = taskById(id);
  const result = evaluateChecks(task.checks, {
    files: task.solution.files,
    signals: seedSignalsFor(task),
  });
  expect(result.results.filter((item) => !item.passed).map((item) => `${item.id}: ${item.message}`)).toEqual([]);
});

test.each(reworkedTaskIds)('starter of %s still fails at least one check', (id) => {
  const task = taskById(id);
  const result = evaluateChecks(task.checks, {
    files: task.starter.files,
    signals: seedSignalsFor(task),
  });
  expect(result.results.some((item) => !item.passed)).toBe(true);
});

test('builds the PHP lesson track from numbered definitions', () => {
  expect(phpLessons.map(({ order }) => order)).toEqual([601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615]);
  expect(phpLessons.map((lesson) => lesson.tasks.length)).toEqual([3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1]);
  expect(phpLessons.flatMap(({ tasks }) => tasks).every(({ mode }) => mode === 'exercise')).toBe(true);
  expect(phpLessons.flatMap(({ tasks }) => tasks).map(({ id }) => id)).toEqual([
    'php-01-guided', 'php-01-modified', 'php-01-independent',
    'php-02-guided', 'php-02-modified', 'php-02-independent',
    'php-603-exercise-1', 'php-603-exercise-2', 'php-603-exercise-3',
    'php-03-guided', 'php-03-modified', 'php-03-independent',
    'php-04-guided', 'php-04-modified', 'php-04-independent',
    'php-05-guided', 'php-05-modified', 'php-05-independent',
    'php-06-guided', 'php-06-modified', 'php-06-independent',
    'php-07-guided', 'php-07-modified', 'php-07-independent',
    'php-08-guided', 'php-08-modified', 'php-08-independent',
    'php-610-exercise-1', 'php-610-exercise-2', 'php-610-exercise-3',
    'php-json-data-exercise-1', 'php-json-data-exercise-2', 'php-json-data-exercise-3',
    'php-fetch-api-exercise-1', 'php-fetch-api-exercise-2', 'php-fetch-api-exercise-3',
    'php-objects-exercise-1', 'php-objects-exercise-2', 'php-objects-exercise-3',
    'php-611-exercise-1', 'php-611-exercise-2', 'php-611-exercise-3',
    'php-xampp-cinema-exercise-1',
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
