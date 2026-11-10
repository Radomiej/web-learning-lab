// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { JSDOM, VirtualConsole } from 'jsdom';
import { lessons } from './lessons.js';
import { htmlTaskLearning } from './htmlTaskLearning.js';
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

const htmlLessons = lessons.filter((lesson) => lesson.track === 'html');
const allTasks = htmlLessons.flatMap((lesson) => lesson.tasks);

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

const withHtml = (task, mutator) => ({
  ...task.solution,
  files: { ...task.solution.files, 'index.html': mutator(task.solution.files['index.html']) },
});

describe('HTML pilot lessons 101–109', () => {
  it('keeps stable task ids: guided / modified-v2 / independent-v2', () => {
    for (const lesson of htmlLessons) {
      const stem = `html-${lesson.order}`;
      expect(lesson.tasks.map((task) => task.id)).toEqual([`${stem}-guided`, `${stem}-modified-v2`, `${stem}-independent-v2`]);
      expect(lesson.tasks.map((task) => task.mode)).toEqual(['guided', 'modified', 'independent']);
    }
  });

  it('covers all 27 tasks with learning entries, traces and quiz options', () => {
    for (const task of allTasks) {
      const entry = htmlTaskLearning[task.id];
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
    for (const lesson of htmlLessons) {
      expect(lesson.tasks[0].steps?.length, lesson.id).toBeGreaterThan(0);
      expect(lesson.tasks[1].steps, `${lesson.id} modified`).toBeUndefined();
      expect(lesson.tasks[2].steps, `${lesson.id} independent`).toBeUndefined();
    }
  });

  it.each(htmlLessons.map((lesson) => [lesson.id, lesson]))('passes official solutions in a real document: %s', async (_id, lesson) => {
    for (const task of lesson.tasks) {
      const result = await signalsFor(task.solution, lesson.track, task.checks);
      expect(result.results.filter((item) => !item.passed).map((item) => item.label), task.id).toEqual([]);
    }
  }, 15000);

  it.each(htmlLessons.map((lesson) => [lesson.id, lesson]))('fails modified and independent starters: %s', async (_id, lesson) => {
    for (const task of lesson.tasks.slice(1)) {
      const result = await signalsFor(task.starter, lesson.track, task.checks);
      expect(result.results.some((item) => !item.passed), task.id).toBe(true);
    }
  }, 15000);

  it.each([
    [1, 'footer wewnątrz <main>', (html) => html.replace(/<\/main>\s*<footer>/, '<footer>')],
    [2, 'meta description z pustym content', (html) => html.replace('content="Moja pierwsza strona"', 'content=""')],
    [3, 'brak bloku <pre><code>', (html) => html.replace(/<pre>[\s\S]*?<\/pre>/, '')],
    [4, 'podlista obok <li>, nie w środku', (html) => html.replace(/(<li>Przećwicz)\s*(<ul>)/, '$1</li>$2')],
    [5, 'sekcja z innym id niż link', (html) => html.replace('id="o-nas"', 'id="about"')],
    [6, 'drugi obraz bez lazy', (html) => html.replace(' loading="lazy"', '')],
    [7, 'nagłówek bez colspan', (html) => html.replace('colspan="2"', 'colspan="1"')],
    [8, 'pole number bez wymaganych atrybutów', (html) => html.replace(' min="1" max="6" required', '')],
    [9, 'details bez summary', (html) => html.replace(/<summary>.*?<\/summary>/, '')],
  ])('fails a typical wrong solution in 10%i modified: %s', async (order, _why, mutate) => {
    const lesson = htmlLessons.find((candidate) => candidate.order === 100 + order);
    const task = lesson.tasks[1];
    const wrong = withHtml(task, mutate);
    expect(wrong.files['index.html'], 'mutation must change the document').not.toBe(task.solution.files['index.html']);
    const result = await signalsFor(wrong, lesson.track, task.checks);
    const failing = result.results.filter((item) => !item.passed);
    expect(failing.length, task.id).toBeGreaterThan(0);
    for (const item of failing) expect(item.message, `${task.id} message`).toBeTruthy();
  });
});
