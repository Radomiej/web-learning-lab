import { describe, expect, it } from 'vitest';
import { phpLessons } from './phpLessons.js';
import { phpTaskLearning } from './phpTaskLearning.js';
import { evaluateChecks } from '../services/lessonValidator.js';

const objectsLesson = phpLessons.find((lesson) => lesson.id === 'php-objects');
const profileLesson = phpLessons.find((lesson) => lesson.id === 'php-profile-project');
const newTasks = [...objectsLesson.tasks, ...profileLesson.tasks];

const domFor = (task) => {
  const dom = {};
  for (const check of task.checks) {
    if (check.type === 'textEquals') dom[check.selector] = { exists: check.expected !== '', text: check.expected, attrs: {} };
    if (check.type === 'elementExists') dom[check.selector] = { exists: true, text: 'x', attrs: {} };
  }
  return { dom, interactions: {} };
};

// Typowy błąd: h1 wpisany na sztywno zamiast przez metodę obiektu.
const wrongObjects = objectsLesson.tasks[0].solution.files['index.php']
  .replace('<?= e($profile->label()) ?>', 'Ala — uczeń');

// Typowy błąd w projekcie: umiejętność wypisana bez e() i wynik wypisany wprost.
const wrongProfile = `<?php
$author = 'Kamil'; $bio = 'x'; $skills = ['HTML', 'PHP', 'git'];
?>
<!doctype html><html><body><main><article>
  <h1>Kamil</h1><p id="bio">x</p>
  <ul id="skills"><li>HTML</li><li>PHP</li><li>git</li></ul>
</article></main></body></html>`;

describe('objects and 608 pilot lessons data', () => {
  it('keeps stable task ids including legacy 608 ids', () => {
    expect(newTasks.map((task) => task.id)).toEqual([
      'php-objects-exercise-1', 'php-objects-exercise-2', 'php-objects-exercise-3',
      'php-08-guided', 'php-08-modified', 'php-08-independent',
    ]);
  });

  it('covers all six tasks with learning entries and quiz options', () => {
    for (const task of newTasks) {
      const entry = phpTaskLearning[task.id];
      expect(entry, task.id).toBeTruthy();
      for (const field of ['title', 'text', 'code', 'question', 'answer']) {
        expect(entry[field], `${task.id}.${field}`).toBeTruthy();
      }
      expect(entry.trace.steps.length).toBeGreaterThan(0);
      expect(entry.prediction.options).toHaveLength(3);
      expect(entry.prediction.options.filter((option) => option.correct)).toHaveLength(1);
      for (const option of entry.prediction.options) {
        expect(option.why).toBeTruthy();
      }
    }
  });

  it('keeps steps only on the first (guided) task of each lesson', () => {
    expect(objectsLesson.tasks[0].steps?.length).toBeGreaterThan(0);
    expect(profileLesson.tasks[0].steps?.length).toBeGreaterThan(0);
    for (const task of newTasks.slice(1).filter((task) => task.id !== 'php-08-guided')) {
      expect(task.steps, task.id).toBeUndefined();
    }
  });
});

describe('objects lesson checks', () => {
  it('rejects a hard-coded h1 instead of the object method', () => {
    const task = objectsLesson.tasks[0];
    const signals = domFor(task);
    signals.dom['h1'] = { exists: true, text: 'Ala — uczeń', attrs: {} };
    const { results } = evaluateChecks(task.checks, { files: { 'index.php': wrongObjects }, signals });
    const failures = results.filter((result) => !result.passed);
    expect(failures.map((result) => result.id)).toContain('php-objects-exercise-1-4');
  });

  it('passes the official solutions', () => {
    for (const task of objectsLesson.tasks) {
      const { results } = evaluateChecks(task.checks, { files: task.solution.files, signals: domFor(task) });
      expect(results.filter((result) => !result.passed).map((result) => `${result.id}: ${result.message}`), task.id).toEqual([]);
    }
  });
});

describe('608 profile project checks', () => {
  it('rejects the old gameable shape — literal list and no escaping helper', () => {
    const task = profileLesson.tasks[0];
    const signals = domFor(task);
    const { results } = evaluateChecks(task.checks, { files: { 'index.php': wrongProfile }, signals });
    const failures = results.map((result) => result.id).filter((id, i) => !results[i].passed);
    expect(failures).toEqual(['php-08-guided-0', 'php-08-guided-5']);
  });

  it('passes the official solutions', () => {
    for (const task of profileLesson.tasks) {
      const { results } = evaluateChecks(task.checks, { files: task.solution.files, signals: domFor(task) });
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
