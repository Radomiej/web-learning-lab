// @vitest-environment node
import { JSDOM, VirtualConsole } from 'jsdom';
import { lessons } from './lessons.js';
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

test('waits for asynchronous React effects before judging a solution', async () => {
  const lesson = lessons.find(candidate => candidate.id === 'react-effects-data');
  const task = lesson.tasks[0];
  const project = { ...task.solution, files: { ...task.solution.files } };
  for (const path of Object.keys(project.files)) {
    project.files[path] = project.files[path].replace('setReady(true), 20)', 'setReady(true), 250)');
  }
  const result = await runTask(lesson, task, project, true);
  expect(result.results.filter(item => !item.passed)).toEqual([]);
});

async function runTask(lesson, task, project, waitForSolution = false) {
      let signals = { dom: {}, styles: {}, interactions: {}, runtimeErrors: [] };
      let snapshots = 0;
      const dom = new JSDOM(buildPreviewDocument(project, { track: lesson.track, requestedSignals: task.checks }), {
        runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: new VirtualConsole(),
        beforeParse(window) {
          window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'signals') {
              signals = { ...signals, ...message.payload, interactions: { ...signals.interactions, ...message.payload.interactions } };
              if (message.payload.dom) snapshots++;
            }
            if (message.type === 'runtime-error') signals.runtimeErrors.push(message.payload.message);
          });
        },
      });
      try {
        await vi.waitFor(() => expect(snapshots).toBeGreaterThan(0), { timeout: 3000 });
        const beforeActions = snapshots;
        const actions = task.checks.filter(check => check.type === 'interaction');
        for (const check of actions) {
          dom.window.postMessage({ source: 'web-learning-lab', type: 'run-action', payload: { action: 'click', checkId: check.id, ...check } }, '*');
        }
        if (actions.length) await vi.waitFor(() => {
          expect(snapshots).toBeGreaterThan(beforeActions);
          actions.forEach(check => expect(signals.interactions[check.id]).toBeDefined());
        }, { timeout: 3000 });
        // Effects may finish after the first load snapshot, especially on a
        // slow machine. Recollect actual DOM signals, without replaying clicks
        // or accepting a partial result. Negative cases still inspect as-is.
        if (waitForSolution) await vi.waitFor(() => {
          dom.window.postMessage({ source: 'web-learning-lab', type: 'collect-signals' }, '*');
          expect(evaluateChecks(task.checks, { files: project.files, signals }).results.filter(item => !item.passed)).toEqual([]);
        }, { timeout: 3000 });
        return evaluateChecks(task.checks, { files: project.files, signals });
      } finally { dom.window.close(); }
}

// PHP.wasm is a browser-only runtime. Its integration path is validated in
// the native preview; this Node/JSDOM suite covers deterministic DOM, CSS,
// JavaScript, and React execution without pretending to execute PHP.
for (const lesson of lessons.filter((candidate) => !['php', 'game-dev'].includes(candidate.track))) {
  for (const [index, task] of lesson.tasks.entries()) {
    test(task.id + ' solution passes in an executing document', async () => {
      const result = await runTask(lesson, task, task.solution, true);
      expect(result.results.filter(item => !item.passed)).toEqual([]);
    });
    test(task.id + ' starter cannot pass without student work', async () => {
      const result = await runTask(lesson, task, task.starter);
      expect(result.passed).toBeLessThan(result.total);
    });
    if (index > 0) test(task.id + ' rejects the preceding solution even with cosmetic legacy adaptations', async () => {
      const preceding = lesson.tasks[index - 1].solution;
      const project = { ...preceding, files: { ...preceding.files } };
      project.files[project.entry] = project.files[project.entry].replace('</body>', '<section id="podsumowanie"><h2>Podsumowanie</h2><p>Wnioski</p></section></body>');
      const cssPath = Object.keys(project.files).find((path) => path.endsWith('.css'));
      project.files[cssPath] += '\n.practice { letter-spacing: 2px; }';
      for (const path of Object.keys(project.files).filter((name) => /\.(?:js|jsx)$/.test(name))) {
        project.files[path] = project.files[path].replaceAll('GOTOWE', 'SAMODZIELNIE').replaceAll('c + 1', 'c + 2');
      }
      const result = await runTask(lesson, task, project);
      expect(result.passed).toBeLessThan(result.total);
    });
  }
}
