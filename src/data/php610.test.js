import { describe, expect, it } from 'vitest';
import { phpLessons } from './phpLessons.js';
import { phpTaskLearning } from './phpTaskLearning.js';
import { evaluateChecks } from '../services/lessonValidator.js';

const lesson610 = phpLessons.find((lesson) => lesson.order === 610);
const [task1, task2, task3] = lesson610.tasks;

// Rozwiązanie ucznia z realnego błędu: atrybut na sztywno, odczyt z h1,
// zapis do h1 zamiast #result.
const wrongSource = `<?php
$name = 'Ala';
function e($text) { return htmlspecialchars($text, ENT_QUOTES, 'UTF-8'); }
?>
<!doctype html>
<html lang="pl"><head><meta charset="UTF-8"><title>Karta profilu</title></head>
<body>
  <main><article class="profile">
    <h1 id="message"><?= e($name) ?></h1>
    <button type="button" id="action" data-name="test">Przywitaj</button>
    <p id="result" aria-live="polite">Kliknij przycisk.</p>
    <script>
      const button = document.querySelector('#action');
      button.addEventListener('click', () => {
        let old = document.querySelector('#message').textContent;
        document.querySelector('#message').textContent = 'Cześć, ' + old + '!';
      });
    </script>
  </article></main>
</body></html>
`;

const wrongSignals = {
  dom: { '#action': { exists: true, text: 'Przywitaj', attrs: { 'data-name': 'test' } } },
  interactions: {
    'php-610-exercise-1-3': { ok: true, text: 'Kliknij przycisk.', before: { text: 'Kliknij przycisk.' } },
  },
};

const okSignals = (attrs, clickText, clickId) => ({
  dom: { '#action': { exists: true, text: 'x', attrs } },
  interactions: { [clickId]: { ok: true, text: clickText, before: { text: 'Kliknij przycisk.' } } },
});

describe('lesson 610 pilot data', () => {
  it('covers every task of lesson 610 with full learning entries', () => {
    const entries = lesson610.tasks.map((task) => phpTaskLearning[task.id]);
    expect(entries.every(Boolean)).toBe(true);
    for (const entry of entries) {
      for (const field of ['title', 'text', 'code', 'question', 'answer']) {
        expect(entry[field]).toBeTruthy();
      }
      expect(entry.prediction.context).toBeTruthy();
      expect(entry.prediction.code).toBeTruthy();
      expect(entry.trace.steps.length).toBeGreaterThan(0);
      for (const step of entry.trace.steps) {
        expect(step.caption).toBeTruthy();
        expect(Object.keys(step.panels ?? {}).length).toBeGreaterThan(0);
      }
    }
  });
});

describe('lesson 610 checks', () => {
  it('fails the hard-coded/read-from-h1 solution with clear messages', () => {
    const { results } = evaluateChecks(task1.checks, { files: { 'index.php': wrongSource }, signals: wrongSignals });
    const failures = results.filter((result) => !result.passed);
    expect(failures.map((result) => result.id)).toEqual([
      'php-610-exercise-1-0',
      'php-610-exercise-1-1',
      'php-610-exercise-1-2',
      'php-610-exercise-1-3',
    ]);
    expect(failures.find((result) => result.id === 'php-610-exercise-1-3')?.message)
      .toBe('W #result jest „Kliknij przycisk.”, oczekiwano „Cześć, Ala!”.');
    expect(failures.find((result) => result.id === 'php-610-exercise-1-2')?.message)
      .toContain('„test”');
  });

  it('passes the official solutions', () => {
    const runs = [
      [task1, okSignals({ 'data-name': 'Ala' }, 'Cześć, Ala!', 'php-610-exercise-1-3')],
      [task2, okSignals({ 'data-name': 'Ala', 'data-role': 'uczeń' }, 'Ala — uczeń', 'php-610-exercise-2-3')],
      [task3, okSignals({ 'data-name': 'Ala', 'data-role': 'uczeń', 'aria-expanded': 'true' }, 'Rola: uczeń', 'php-610-exercise-3-3')],
    ];
    for (const [task, signals] of runs) {
      const { results } = evaluateChecks(task.checks, { files: task.solution.files, signals });
      expect(results.filter((result) => !result.passed).map((result) => `${result.id}: ${result.message}`), task.id).toEqual([]);
    }
  });

  it('fails every starter', () => {
    for (const task of [task1, task2, task3]) {
      const { results } = evaluateChecks(task.checks, { files: task.starter.files, signals: { dom: {}, interactions: {} } });
      expect(results.every((result) => result.passed), task.id).toBe(false);
    }
  });

  it('keeps steps on the guided task only', () => {
    expect(task1.steps?.length).toBeGreaterThan(0);
    expect(task2.steps).toBeUndefined();
    expect(task3.steps).toBeUndefined();
  });
});
