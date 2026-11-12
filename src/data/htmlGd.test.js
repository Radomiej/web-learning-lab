// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { JSDOM, VirtualConsole } from 'jsdom';
import { lessons } from './lessons.js';
import { taskLearningFor } from './taskLearning.js';
import { gameUiThemeCss } from './gameUiTheme.js';
import { buildPreviewDocument } from '../services/previewDocument.js';
import { evaluateChecks } from '../services/lessonValidator.js';

const parserDom = new JSDOM('');
beforeAll(() => {
  vi.stubGlobal('DOMParser', parserDom.window.DOMParser);
});
afterAll(() => {
  parserDom.window.close();
  vi.unstubAllGlobals();
});

const gdLessons = lessons.filter((lesson) => lesson.track === 'html-gd');
const allTasks = gdLessons.flatMap((lesson) => lesson.tasks);

// Collect real DOM signals for a project, like the browser preview does.
async function signalsFor(project, track, checks) {
  const signals = { dom: {}, styles: {}, interactions: {}, runtimeErrors: [] };
  let snapshots = 0;
  const dom = new JSDOM(buildPreviewDocument(project, { track, requestedSignals: checks }), {
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: new VirtualConsole(),
    beforeParse(window) {
      window.addEventListener('message', (event) => {
        const message = event.data;
        if (message.type === 'signals') {
          Object.assign(signals, message.payload);
          snapshots++;
        }
        if (message.type === 'runtime-error') signals.runtimeErrors.push(message.payload.message);
      });
    },
  });
  try {
    await vi.waitFor(() => expect(snapshots).toBeGreaterThan(0), { timeout: 3000 });
    return evaluateChecks(checks, { files: project.files, signals });
  } finally {
    dom.window.close();
  }
}

describe('HTML GD lessons 901–909', () => {
  it('defines 9 lessons in the 900 block with file index.html', () => {
    expect(gdLessons.map((lesson) => lesson.order)).toEqual([901, 902, 903, 904, 905, 906, 907, 908, 909]);
    expect(gdLessons.every((lesson) => lesson.file === 'index.html')).toBe(true);
  });

  it('keeps stable unique task ids: guided / modified-v2 / independent-v2', () => {
    const ids = allTasks.map((task) => task.id);
    expect(new Set(ids).size).toBe(27);
    for (const lesson of gdLessons) {
      const stem = `html-gd-${lesson.order}`;
      expect(lesson.tasks.map((task) => task.id)).toEqual([`${stem}-guided`, `${stem}-modified-v2`, `${stem}-independent-v2`]);
      expect(lesson.tasks.map((task) => task.mode)).toEqual(['guided', 'modified', 'independent']);
    }
  });

  it('ships the game UI theme in every starter and solution styles.css', () => {
    for (const task of allTasks) {
      expect(task.starter.files['styles.css'], `${task.id} starter`).toContain(gameUiThemeCss);
      expect(task.solution.files['styles.css'], `${task.id} solution`).toContain(gameUiThemeCss);
    }
  });

  it('covers all 27 tasks with pilot learning entries, traces and quiz options', () => {
    for (const task of allTasks) {
      const entry = taskLearningFor(task.id);
      expect(entry, task.id).toBeTruthy();
      for (const field of ['title', 'text', 'code', 'question', 'answer']) {
        expect(entry[field], `${task.id}.${field}`).toBeTruthy();
      }
      expect(entry.trace.steps.length, task.id).toBeGreaterThan(0);
      expect(entry.prediction.options, task.id).toHaveLength(3);
      expect(entry.prediction.options.filter((option) => option.correct), task.id).toHaveLength(1);
      for (const option of entry.prediction.options) expect(option.why, task.id).toBeTruthy();
    }
  });

  it('keeps steps only on the guided task of each lesson', () => {
    for (const lesson of gdLessons) {
      expect(lesson.tasks[0].steps?.length, lesson.id).toBeGreaterThan(0);
      expect(lesson.tasks[1].steps, `${lesson.id} modified`).toBeUndefined();
      expect(lesson.tasks[2].steps, `${lesson.id} independent`).toBeUndefined();
    }
  });

  it.each(gdLessons.map((lesson) => [lesson.id, lesson]))('passes official solutions in a real document: %s', async (_id, lesson) => {
    for (const task of lesson.tasks) {
      const result = await signalsFor(task.solution, lesson.track, task.checks);
      expect(result.results.filter((item) => !item.passed).map((item) => item.label), task.id).toEqual([]);
    }
  }, 15000);

  it.each(gdLessons.map((lesson) => [lesson.id, lesson]))('fails every starter in a real document: %s', async (_id, lesson) => {
    for (const task of lesson.tasks) {
      const result = await signalsFor(task.starter, lesson.track, task.checks);
      expect(result.results.some((item) => !item.passed), task.id).toBe(true);
    }
  }, 15000);
});
