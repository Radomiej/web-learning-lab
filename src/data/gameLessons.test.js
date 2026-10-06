// @vitest-environment node
import { JSDOM, VirtualConsole } from 'jsdom';
import { gameLessons } from './gameLessons.js';
import { buildPreviewDocument } from '../services/previewDocument.js';
import { evaluateChecks } from '../services/lessonValidator.js';

const parser = new JSDOM('');
beforeAll(() => vi.stubGlobal('DOMParser', parser.window.DOMParser));
afterAll(() => { parser.window.close(); vi.unstubAllGlobals(); });

test('contains twelve sequenced lessons, twenty-four distinct exercises and full documents', () => {
  expect(gameLessons.map(l => l.order)).toEqual(Array.from({ length: 12 }, (_, i) => 701 + i));
  const tasks = gameLessons.flatMap(l => l.tasks);
  expect(tasks).toHaveLength(24);
  expect(new Set(tasks.map(t => t.prompt)).size).toBe(24);
  for (const task of tasks) {
    expect(task.starter.files['index.html']).toMatch(/<!doctype html>/i);
    expect(task.starter.files['game.js']).toBeDefined();
    expect(task.checks.some(c => c.type === 'gameScenario')).toBe(true);
  }
});

test('teaches separate object creation and renderer components before the raw-canvas lesson', () => {
  for (const lesson of gameLessons) for (const task of lesson.tasks) {
    for (const bundle of [task.starter, task.solution]) {
      expect(bundle.files['index.html']).not.toContain('class="controls"');
      for (const [path, source] of Object.entries(bundle.files).filter(([path]) => path.endsWith('.js'))) {
        expect(source, path).not.toMatch(/createObject\([^\n;]+\)\.setPosition/);
        if (lesson.order < 712) expect(source, path).not.toMatch(/\.canvas\.draw(?:Rect|Text)\(/);
      }
    }
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

test('checks the required sand tilemap appearance in the independent arena', async () => {
  const task = gameLessons[3].tasks[1];
  const project = { ...task.solution, files: { ...task.solution.files } };
  project.files['game.js'] = project.files['game.js'].replace("new TileMap('sand', 24)", "new TileMap('grass', 24)");
  const result = await execute(task, project);
  expect(result.passed).toBeLessThan(result.total);
});

test('rejects the wrong ground texture despite correct player position', async () => {
  const task = gameLessons[3].tasks[0];
  const project = { ...task.solution, files: { ...task.solution.files } };
  project.files['game.js'] = project.files['game.js'].replace("new TileMap('grass', 32)", "new TileMap('sand', 32)");
  const result = await execute(task, project);
  expect(result.passed).toBeLessThan(result.total);
});
