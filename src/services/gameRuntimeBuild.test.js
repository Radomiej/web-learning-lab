// @vitest-environment node
import { readFileSync } from 'node:fs';
import { buildSync } from 'esbuild';
import { JSDOM } from 'jsdom';

test('minified production engine still serializes into a self-contained iframe script', () => {
  const code = buildSync({ entryPoints: [new URL('./gameRuntime.js', import.meta.url).pathname.replace(/^\/(\w:)/, '$1')], bundle: true, write: false, minify: true, format: 'cjs', target: 'es2020' }).outputFiles[0].text;
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
    for(const name of ['TopDownCharacterController2D','PlatformerCharacterController2D','ObstacleAvoidance2D'])expect(new lab[name]()).toBeInstanceOf(lab.Component);
    for(const name of ['FollowTarget2D','FleeTarget2D','FlankTarget2D'])expect(new lab[name](null)).toBeInstanceOf(lab.Component);
    expect(new lab.KeyDoublePressed('e',()=>{}).maxDelaySeconds).toBe(.3);
    class Scene extends lab.Game {
      onCreate() { const player=this.createObject('Player').setPosition(40,40);player.addComponent(new lab.ShapeRenderer());player.addComponent(new lab.TopDownCharacterController2D()); }
    }
    lab.run(Scene);
    expect(lab.evaluateScenario().objects[0].components).toEqual(['ShapeRenderer','TopDownCharacterController2D']);
    expect(lab.snapshot().commands[1].x).toBe(40);
    lab.dispose();
  } finally { spy.mockRestore(); dom.window.close(); }
});
