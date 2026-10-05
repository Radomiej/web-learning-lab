// @vitest-environment node
import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';
import { JSDOM } from 'jsdom';

test('minified production engine still serializes into a self-contained iframe script', () => {
  const source = readFileSync(new URL('./gameRuntime.js', import.meta.url), 'utf8');
  const { code } = transformSync(source, { minify: true, format: 'cjs', target: 'es2020' });
  const module = { exports: {} };
  new Function('module', 'exports', code)(module, module.exports);
  const context = new Proxy({}, { get: (target, key) => target[key] || (() => {}) });
  const dom = new JSDOM('');
  const document = dom.window.document;
  const spy = vi.spyOn(dom.window.HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => context);
  const canvas = document.createElement('canvas');
  canvas.id = 'game'; document.body.append(canvas);
  const isolated = { document, devicePixelRatio: 1, requestAnimationFrame: () => 1, cancelAnimationFrame: () => {}, addEventListener: () => {}, removeEventListener: () => {} };
  try {
    new Function('window', 'document', module.exports.getGameRuntimeScript())(isolated, document);
    const lab = isolated.GameLab;
    class Scene extends lab.Game {
      onCreate() { this.createObject('Player').setPosition(40, 40).addComponent(new lab.ShapeRenderer()); }
    }
    lab.run(Scene);
    expect(lab.evaluateScenario().objects[0].components).toEqual(['ShapeRenderer']);
    expect(lab.snapshot().commands[1].x).toBe(40);
    lab.dispose();
  } finally { spy.mockRestore(); dom.window.close(); }
});
