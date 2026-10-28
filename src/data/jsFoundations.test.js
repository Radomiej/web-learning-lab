import { lessons } from './lessons.js';
import { jsFoundationPages } from './jsFoundations.js';
import { evaluateChecks } from '../services/lessonValidator.js';

test('starts with variables, objects, methods and DOM, retaining later topics', () => {
  const js = lessons.filter(lesson => lesson.track === 'js');
  expect(js.map(lesson => lesson.id)).toEqual(['js-browser', 'js-objects', 'js-functions', 'js-dom', 'js-function-values', 'js-comparisons', 'js-conditions-functions', 'js-data-loops', 'js-events-forms', 'js-small-state', 'js-error-handling', 'js-validation-storage', 'js-fetch', 'js-event-planner']);
  expect(js.map(lesson => lesson.order)).toEqual(Array.from({ length: 14 }, (_, i) => 401 + i));
});

test('first three lessons can be solved without document and check real output', () => {
  for (const lesson of lessons.filter(lesson => lesson.track === 'js' && lesson.order < 404)) {
    for (const task of lesson.tasks) {
      const source = task.solution.files['script.js'];
      expect(source).not.toMatch(/document|querySelector|getElementById/);
      const output = [];
      // Mirror the preview bridge: eval probes inside the scope that holds
      // the student's top-level let/const bindings.
      const evaluateInScope = new Function('console', `${source}\nreturn (expression) => eval(expression);`)({ log: (...values) => output.push(values.join(' ')) });
      const probes = {};
      for (const check of task.checks.filter((check) => check.type === 'jsProbe')) {
        try {
          probes[check.id] = { ok: true, value: evaluateInScope(`(${check.expression})`) };
        } catch (error) {
          probes[check.id] = { ok: false, error: String(error?.message || error) };
        }
      }
      const result = evaluateChecks(task.checks, { files: task.solution.files, signals: { consoleOutput: output, runtimeErrors: [], probes } });
      expect(result.passed, task.id).toBe(result.total);
      expect(evaluateChecks(task.checks, { files: task.solution.files, signals: { consoleOutput: [], runtimeErrors: [] } }).passed).toBeLessThan(result.total);
    }
  }
});

test('console check matches complete log lines rather than fragments', () => {
  const checks = [{ type: 'consoleOutput', expected: '5' }];
  expect(evaluateChecks(checks, { signals: { consoleOutput: ['15'] } }).passed).toBe(0);
  expect(evaluateChecks(checks, { signals: { consoleOutput: ['5'] } }).passed).toBe(1);
});

test('all foundation pages supply explanation, executable example and result', () => {
  for (const pages of Object.values(jsFoundationPages)) {
    expect(pages.length).toBeGreaterThanOrEqual(4);
    expect(pages.filter(page => page.image)).toHaveLength(1);
    for (const page of pages) {
      expect(page.text.length).toBeGreaterThan(70);
      expect(page.code).toBeTruthy();
      expect(page.result).toBeTruthy();
    }
  }
});
