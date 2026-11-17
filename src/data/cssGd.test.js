// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { JSDOM, VirtualConsole } from 'jsdom';
import { lessons } from './lessons.js';
import { cssLessons } from './cssLessons.js';
import { cssGdLessons, cssGdTheorySource } from './cssGdLessons.js';
import { taskLearningFor } from './taskLearning.js';
import { htmlCssTeachingPages } from './htmlCssTeachingPages.js';
import { buildPreviewDocument } from '../services/previewDocument.js';
import { evaluateChecks } from '../services/lessonValidator.js';
import { courseQuizPages } from '../../shared/assignments/courseQuizCatalog.js';

const parserDom = new JSDOM('');
beforeAll(() => {
  vi.stubGlobal('DOMParser', parserDom.window.DOMParser);
});
afterAll(() => {
  parserDom.window.close();
  vi.unstubAllGlobals();
});

const gdLessons = lessons.filter((lesson) => lesson.track === 'css-gd');
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

describe('CSS GD lessons 1001–1006', () => {
  it('defines 6 lessons in the 1000 block with file styles.css', () => {
    expect(gdLessons.map((lesson) => lesson.order)).toEqual([1001, 1002, 1003, 1004, 1005, 1006]);
    expect(gdLessons.every((lesson) => lesson.file === 'styles.css')).toBe(true);
  });

  it('teaches the same six CSS concepts in classic and GD, with a quiz in classic', () => {
    const classic = lessons.filter((lesson) => Object.values(cssGdTheorySource).includes(lesson.id));
    expect(classic).toHaveLength(6);
    expect(Object.keys(cssGdTheorySource)).toEqual(gdLessons.map((lesson) => lesson.id));
    for (const gdLesson of gdLessons) {
      const classicId = cssGdTheorySource[gdLesson.id];
      const classicLesson = classic.find((lesson) => lesson.id === classicId);
      const classicIndex = cssGdTheorySource[gdLesson.id] && classic.findIndex((lesson) => lesson.id === classicId);
      expect(classicLesson.theory, gdLesson.id).toBeTruthy();
      expect(courseQuizPages[classicId]?.length, classicId).toBeGreaterThan(0);
      expect(courseQuizPages[classicId].every((page) => page.title && page.text && page.code)).toBe(true);
      expect(gdLesson.theory, gdLesson.id).toEqual(htmlCssTeachingPages[classicId]);
      expect(gdLesson.objectives, gdLesson.id).toEqual(classicLesson.objectives);
      expect(cssGdLessons[gdLesson.order - 1001].requiredProperties, gdLesson.id).toEqual(cssLessons[classicIndex].requiredProperties);
      expect(cssGdLessons[gdLesson.order - 1001].requiredPractices, gdLesson.id).toEqual(cssLessons[classicIndex].requiredPractices);
    }
  });

  it('keeps stable unique task ids: guided / modified-v2 / independent-v2', () => {
    const ids = allTasks.map((task) => task.id);
    expect(new Set(ids).size).toBe(18);
    for (const lesson of gdLessons) {
      const stem = `css-gd-${lesson.order}`;
      expect(lesson.tasks.map((task) => task.id)).toEqual([`${stem}-guided`, `${stem}-modified-v2`, `${stem}-independent-v2`]);
      expect(lesson.tasks.map((task) => task.mode)).toEqual(['guided', 'modified', 'independent']);
    }
  });

  it('ships ready HTML and a CSS workspace in every starter and solution', () => {
    for (const task of allTasks) {
      expect(task.starter.files['index.html'], `${task.id} starter html`).toContain('class=');
      expect(task.starter.files['styles.css'], `${task.id} starter css`).toContain('@font-face');
      const countRules = (source) => (source.match(/\{/g) || []).length;
      expect(countRules(task.solution.files['styles.css']), `${task.id} solution css`)
        .toBeGreaterThanOrEqual(countRules(task.starter.files['styles.css']));
      expect(task.solution.files['styles.css'], `${task.id} solution differs`).not.toBe(task.starter.files['styles.css']);
    }
  });

  it('covers all 18 tasks with pilot learning entries, traces and quiz options', () => {
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
