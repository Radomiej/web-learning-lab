// @vitest-environment node
import { JSDOM, VirtualConsole } from 'jsdom';
import { lessons } from './lessons.js';
import { buildPreviewDocument } from '../services/previewDocument.js';
import { evaluateChecks } from '../services/lessonValidator.js';

const parserDom = new JSDOM('');
beforeAll(() => vi.stubGlobal('DOMParser', parserDom.window.DOMParser));
afterAll(() => { parserDom.window.close(); vi.unstubAllGlobals(); });

async function runWithJs(task, js) {
  const project = { ...task.solution, files: { ...task.solution.files, 'script.js': js } };
  let signals = {};
  const dom = new JSDOM(buildPreviewDocument(project, { track: 'js', requestedSignals: task.checks }), {
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: new VirtualConsole(),
    beforeParse(window) {
      window.addEventListener('message', (event) => {
        const message = event.data;
        if (message?.type === 'signals') signals = { ...signals, ...message.payload };
        if (message?.type === 'console' && message.payload?.level === 'log') {
          signals.consoleOutput = [...(signals.consoleOutput || []), (message.payload.args || []).join(' ')];
        }
        if (message?.type === 'runtime-error') signals.runtimeErrors.push(message.payload.message);
      });
    },
  });
  await vi.waitFor(() => expect(signals.dom).toBeDefined(), { timeout: 3000 });
  const result = evaluateChecks(task.checks, { files: project.files, signals });
  dom.window.close();
  return result.results;
}

const guided = lessons.find(l => l.id === 'js-browser').tasks[0];

test('console.log(5) alone does NOT pass task 401/1', async () => {
  const results = await runWithJs(guided, 'console.log(5);');
  expect(results.find(r => r.id.includes('output'))?.passed).toBe(true);
  expect(results.find(r => r.id.includes('verify-0'))?.passed).toBe(false);
  expect(results.find(r => r.id.includes('verify-1'))?.passed).toBe(false);
});

test('let punkty = 5 without reassignment fails the +3 check', async () => {
  const results = await runWithJs(guided, 'let punkty = 5;\nconsole.log(punkty);');
  expect(results.find(r => r.id.includes('verify-0'))?.passed).toBe(true);
  expect(results.find(r => r.id.includes('verify-1'))?.passed).toBe(false);
});

test('punkty += 3 passes everything', async () => {
  const results = await runWithJs(guided, 'let punkty = 2;\npunkty += 3;\nconsole.log(punkty);');
  expect(results.filter(r => !r.passed)).toEqual([]);
});
