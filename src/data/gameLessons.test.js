// @vitest-environment node
import { JSDOM, VirtualConsole } from 'jsdom';
import { gameLessons } from './gameLessons.js';
import { buildPreviewDocument } from '../services/previewDocument.js';
import { evaluateChecks } from '../services/lessonValidator.js';

const parser = new JSDOM('');
beforeAll(() => vi.stubGlobal('DOMParser', parser.window.DOMParser));
afterAll(() => { parser.window.close(); vi.unstubAllGlobals(); });

test('contains ten sequenced lessons, twenty distinct exercises and full documents', () => {
  expect(gameLessons.map(l => l.order)).toEqual(Array.from({ length: 10 }, (_, i) => 701 + i));
  const tasks = gameLessons.flatMap(l => l.tasks);
  expect(tasks).toHaveLength(20);
  expect(new Set(tasks.map(t => t.prompt)).size).toBe(20);
  for (const task of tasks) {
    expect(task.starter.files['index.html']).toMatch(/<!doctype html>/i);
    expect(task.starter.files['game.js']).toBeDefined();
    expect(task.checks.some(c => c.type === 'gameScenario')).toBe(true);
  }
});

async function execute(task, project) {
  let signals = { runtimeErrors: [] };
  const dom = new JSDOM(buildPreviewDocument(project, { track: 'game-dev', requestedSignals: task.checks }), {
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: new VirtualConsole(),
    beforeParse(win) {
      win.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: (t, key) => t[key] || (() => {}) });
      win.addEventListener('message', event => {
        if (event.data.type === 'signals') signals = { ...signals, ...event.data.payload };
        if (event.data.type === 'runtime-error') signals.runtimeErrors.push(event.data.payload.message);
      });
    },
  });
  try {
    await vi.waitFor(() => expect(signals.gameScenarios).toBeDefined(), { timeout: 3000 });
    return evaluateChecks(task.checks, { files: project, signals });
  } finally { dom.window.close(); }
}

for (const lesson of gameLessons) for (const [index, task] of lesson.tasks.entries()) {
  test(`${task.id} solution passes real executing sandbox scenarios`, async () => {
    const result = await execute(task, task.solution);
    expect(result.results.filter(r => !r.passed)).toEqual([]);
  });
  test(`${task.id} starter requires student work`, async () => {
    const result = await execute(task, task.starter);
    expect(result.passed).toBeLessThan(result.total);
  });
  if (index) test(`${task.id} rejects copied guided solution`, async () => {
    const result = await execute(task, lesson.tasks[0].solution);
    expect(result.passed).toBeLessThan(result.total);
  });
}

test('checks the required appearance even when an object is inactive', async () => {
  const task = gameLessons[2].tasks[1];
  const project = { ...task.solution, files: { ...task.solution.files } };
  project.files['game.js'] = project.files['game.js'].replace('#ee6666', '#000000');
  const result = await execute(task, project);
  expect(result.passed).toBeLessThan(result.total);
});

test('rejects the wrong player color despite correct position and treasure', async () => {
  const task = gameLessons[2].tasks[0];
  const project = { ...task.solution, files: { ...task.solution.files } };
  project.files['game.js'] = project.files['game.js'].replace('#76b9f2', '#000000');
  const result = await execute(task, project);
  expect(result.passed).toBeLessThan(result.total);
});
