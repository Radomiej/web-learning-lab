// @vitest-environment node
import { JSDOM, VirtualConsole } from 'jsdom';
import { lessons } from './lessons.js';
import { buildPreviewDocument } from '../services/previewDocument.js';
import { evaluateChecks } from '../services/lessonValidator.js';

for (const lesson of lessons) {
  for (const task of lesson.tasks) {
    test(task.id + ' solution passes in an executing document', async () => {
      let signals = { dom: {}, styles: {}, interactions: {}, runtimeErrors: [] };
      let snapshots = 0;
      const dom = new JSDOM(buildPreviewDocument(task.solution, { track: lesson.track, requestedSignals: task.checks }), {
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
        const result = evaluateChecks(task.checks, { files: task.solution, signals });
        expect(result.results.filter(item => !item.passed)).toEqual([]);
      } finally { dom.window.close(); }
    });
  }
}
