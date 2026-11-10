import { describe, expect, it } from 'vitest';
import { phpLessons } from './phpLessons.js';
import { phpTaskLearning } from './phpTaskLearning.js';
import { evaluateChecks } from '../services/lessonValidator.js';

const jsonLesson = phpLessons.find((lesson) => lesson.id === 'php-json-data');
const fetchLesson = phpLessons.find((lesson) => lesson.id === 'php-fetch-api');
const newTasks = [...jsonLesson.tasks, ...fetchLesson.tasks];

const signals = (dom = {}, interactions = {}) => ({
  dom: {
    '#action': { exists: true, text: 'x', attrs: {} },
    '#action-post': { exists: true, text: 'x', attrs: {} },
    '#result li': { exists: true, text: 'x', attrs: {} },
    ...dom,
  },
  interactions,
});

// Typowy błąd: struktura wpisana ręcznie zamiast produkowanej przez PHP.
const wrongJson = `<?php
$profile = ['imie' => 'Ala', 'rola' => 'uczeń'];
?>
<!doctype html><html><body><main>
  <button id="action">Pokaż</button><p id="result">Kliknij przycisk.</p>
  <script>
    const profile = {"imie":"Ala","rola":"uczeń"};
    const button = document.querySelector('#action');
    button.addEventListener('click', () => {
      document.querySelector('#result').textContent = 'Cześć, ' + profile.imie + '!';
    });
  </script>
</main></body></html>`;

// Typowy błąd: dane osadzone wprost przez <?= bez json_encode.
const wrongJsonUnsafe = wrongJson.replace('const profile = {"imie":"Ala","rola":"uczeń"};', 'const profile = \'<?= $profile ?>\';');

// Typowy błąd w fetch: lista wpisana na sztywno, bez zapytania.
const wrongFetch = fetchLesson.tasks[0].solution.files['index.php']
  .replace("fetch('api.php?rok=1834')", "Promise.resolve({json:()=>Promise.resolve([{tytul:'Pan Tadeusz'}])})");

describe('new pilot lessons data', () => {
  it('keeps stable task ids independent of lesson order', () => {
    expect(newTasks.map((task) => task.id)).toEqual([
      'php-json-data-exercise-1', 'php-json-data-exercise-2', 'php-json-data-exercise-3',
      'php-fetch-api-exercise-1', 'php-fetch-api-exercise-2', 'php-fetch-api-exercise-3',
    ]);
  });

  it('covers all six tasks with full learning entries', () => {
    const entries = newTasks.map((task) => phpTaskLearning[task.id]);
    expect(entries.every(Boolean)).toBe(true);
    for (const entry of entries) {
      for (const field of ['title', 'text', 'code', 'question', 'answer']) {
        expect(entry[field]).toBeTruthy();
      }
      expect(entry.trace.steps.length).toBeGreaterThan(0);
      for (const step of entry.trace.steps) {
        expect(step.caption).toBeTruthy();
        expect(Object.keys(step.panels ?? {}).length).toBeGreaterThan(0);
      }
    }
  });

  it('keeps steps only on the first (guided) task of each lesson', () => {
    expect(jsonLesson.tasks[0].steps?.length).toBeGreaterThan(0);
    expect(fetchLesson.tasks[0].steps?.length).toBeGreaterThan(0);
    for (const task of [...jsonLesson.tasks.slice(1), ...fetchLesson.tasks.slice(1)]) {
      expect(task.steps).toBeUndefined();
    }
  });
});

describe('json lesson checks', () => {
  const [task1] = jsonLesson.tasks;
  it('rejects a hand-written literal even when the result would look right', () => {
    const { results } = evaluateChecks(task1.checks, { files: { 'index.php': wrongJson }, signals: { dom: {}, interactions: { 'php-json-data-exercise-1-2': { ok: true, text: 'Cześć, Ala!', before: { text: 'Kliknij przycisk.' } } } } });
    const failures = results.filter((result) => !result.passed);
    expect(failures.map((result) => result.id)).toEqual(['php-json-data-exercise-1-0', 'php-json-data-exercise-1-1']);
    expect(failures.find((result) => result.id === 'php-json-data-exercise-1-1')?.message).toContain('nie powinno');
  });

  it('rejects unsafe <?= without json_encode', () => {
    const { results } = evaluateChecks(task1.checks, { files: { 'index.php': wrongJsonUnsafe }, signals: { dom: {}, interactions: {} } });
    expect(results.filter((result) => !result.passed).map((result) => result.id)).toEqual(['php-json-data-exercise-1-0', 'php-json-data-exercise-1-2']);
  });

  it('passes the official solutions', () => {
    const runs = [
      [jsonLesson.tasks[0], signals({}, { 'php-json-data-exercise-1-2': { ok: true, text: 'Cześć, Ala!', before: { text: 'Kliknij przycisk.' } } })],
      [jsonLesson.tasks[1], signals({}, { 'php-json-data-exercise-2-2': { ok: true, text: 'muzyka', before: { text: 'Kliknij przycisk.' } } })],
      [jsonLesson.tasks[2], signals({}, { 'php-json-data-exercise-3-2': { ok: true, text: 'Ferdydurke', before: { text: 'Kliknij przycisk.' } } })],
    ];
    for (const [task, runSignals] of runs) {
      const { results } = evaluateChecks(task.checks, { files: task.solution.files, signals: runSignals });
      expect(results.filter((result) => !result.passed).map((result) => `${result.id}: ${result.message}`), task.id).toEqual([]);
    }
  });
});

describe('fetch lesson checks', () => {
  it('rejects a hard-coded list instead of fetch', () => {
    const { results } = evaluateChecks(fetchLesson.tasks[0].checks, { files: { 'index.php': wrongFetch }, signals: { dom: {}, interactions: {} } });
    expect(results.filter((result) => !result.passed).map((result) => result.id)).toContain('php-fetch-api-exercise-1-0');
  });

  it('passes the official solutions', () => {
    const runs = [
      [fetchLesson.tasks[0], signals({}, { 'php-fetch-api-exercise-1-2': { ok: true, text: 'Pan Tadeusz', before: { text: 'Kliknij przycisk.' } } })],
      [fetchLesson.tasks[1], signals({}, { 'php-fetch-api-exercise-2-2': { ok: true, text: 'Dodano: Wiedźmin', before: { text: 'Kliknij przycisk.' } } })],
      [fetchLesson.tasks[2], signals({}, { 'php-fetch-api-exercise-3-1': { ok: true, text: 'Brak wyników', before: { text: 'Kliknij przycisk.' } }, 'php-fetch-api-exercise-3-2': { ok: true, text: 'Błąd serwera: 405', before: { text: 'Brak wyników' } } })],
    ];
    for (const [task, runSignals] of runs) {
      const { results } = evaluateChecks(task.checks, { files: task.solution.files, signals: runSignals });
      expect(results.filter((result) => !result.passed).map((result) => `${result.id}: ${result.message}`), task.id).toEqual([]);
    }
  });

  it('fails every starter', () => {
    for (const task of newTasks) {
      const { results } = evaluateChecks(task.checks, { files: task.starter.files, signals: { dom: {}, interactions: {} } });
      expect(results.every((result) => result.passed), task.id).toBe(false);
    }
  });
});
