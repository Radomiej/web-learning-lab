import { createGameLab } from './gameRuntime.js';
import { playgroundProject } from '../data/playground.js';

function fixture() {
  const context = new Proxy({}, { get: (target, key) => target[key] ?? (() => {}) });
  const canvas = document.createElement('canvas');
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => context);
  canvas.getBoundingClientRect = () => ({ width: 400, height: 300 });
  document.body.append(canvas);
  const requestAnimationFrame = vi.fn(() => 42);
  const cancelAnimationFrame = vi.fn();
  const lab = createGameLab({ window, document, requestAnimationFrame, cancelAnimationFrame });
  return { lab, canvas, requestAnimationFrame, cancelAnimationFrame };
}

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

test('empty playground boots the engine without default objects or control instructions', () => {
  const { lab, canvas } = fixture(); canvas.id = 'game';
  new Function('GameLab', playgroundProject.files['game.js'])(lab);
  expect(lab.snapshot().objects).toEqual([]);
  expect(lab.snapshot().commands).toEqual([{ op: 'clear', color: '#0b2033' }]);
  lab.dispose();
});

test('camera follows a moving world object, handles resize and leaves HUD in screen space', () => {
  const { lab, canvas } = fixture();
  class Move extends lab.Component { onUpdate(delta) { this.transform.x += 100 * delta; } }
  class Scene extends lab.Game {
    onCreate() {
      const player = this.createObject('Player'); player.setPosition(100, 80);
      player.addComponent(new lab.Sprite('player'));
      player.addComponent(new Move());
      player.addComponent(new lab.TextRenderer(() => `X: ${player.transform.x}`, 10, 24));
      const cameraObject = this.createObject('Camera');
      this.camera = cameraObject.addComponent(new lab.Camera2D()); this.camera.follow(player);
    }
  }
  lab.run(Scene, { canvas });
  const state = lab.evaluateScenario({ width: 320, height: 200, steps: 10 });
  expect(state.objects[0].x).toBe(200);
  expect(state.commands.find(c => c.op === 'sprite')).toMatchObject({ x: 200, screenX: 160, screenY: 100 });
  expect(state.commands.find(c => c.op === 'text')).toMatchObject({ text: 'X: 200', x: 10, y: 24 });
  const resized = lab.evaluateScenario({ phases: [{ steps: 1, width: 600, height: 400 }] });
  expect(resized.commands.find(c => c.op === 'sprite')).toMatchObject({ screenX: 300, screenY: 200 });
  lab.current.camera.shake(5, 0.2); lab.current.step(0.1);
  expect(lab.snapshot().commands.find(c => c.op === 'sprite').screenX).not.toBe(200);
  expect(lab.snapshot().commands.find(c => c.op === 'text')).toMatchObject({ x: 10, y: 24 });
  lab.current.step(0.1);
  expect(lab.snapshot().commands.find(c => c.op === 'sprite').screenX).toBe(200);
  lab.current.camera.enabled = false; lab.current.step(0);
  expect(lab.snapshot().camera).toEqual({ x: 0, y: 0 });
  lab.dispose();
});

test('control hint is an optional component and hides while canvas has focus', () => {
  const { lab, canvas } = fixture();
  class Scene extends lab.Game {
    onCreate() {
      const hud = this.createObject('HUD');
      hud.addComponent(new lab.ControlsHint('WASD: ruch'));
    }
  }
  lab.run(Scene, { canvas });
  expect(lab.snapshot().commands.some(c => c.text === 'WASD: ruch')).toBe(true);
  canvas.focus(); lab.current.step(0);
  expect(lab.snapshot().commands.some(c => c.op === 'text')).toBe(false);
  canvas.blur(); lab.current.step(0);
  expect(lab.snapshot().commands.some(c => c.text === 'WASD: ruch')).toBe(true);
  lab.dispose();
});

test('runs components, renders shapes and stops the old loop on restart', () => {
  const { lab, canvas, cancelAnimationFrame } = fixture();
  const destroyed = vi.fn();
  class Controller extends lab.Component {
    onUpdate(delta) { this.transform.x += 100 * delta; }
    onDestroy() { destroyed(); }
  }
  class Scene extends lab.Game {
    onCreate() {
      this.createObject('Player').setPosition(100, 80)
        .addComponent(new lab.ShapeRenderer({ width: 32, height: 32, color: '#123456' }));
      this.find('Player').addComponent(new Controller());
    }
  }
  lab.run(Scene, { canvas });
  lab.current.step(0.1);
  expect(lab.snapshot().objects[0].x).toBe(110);
  expect(lab.snapshot().commands.some(c => c.op === 'rect' && c.x === 110)).toBe(true);
  lab.run(Scene, { canvas });
  expect(destroyed).toHaveBeenCalledOnce();
  expect(cancelAnimationFrame).toHaveBeenCalledWith(42);
  lab.dispose();
});

test('scenario resets state, simulates keys and distinguishes held from pressed', () => {
  const { lab, canvas } = fixture();
  class Scene extends lab.Game {
    onCreate() { this.count = 0; }
    onUpdate() {
      if (this.input.isKeyPressed('Space')) this.count++;
      this.canvas.drawText(`Punkty: ${this.count}`, 10, 20);
    }
  }
  lab.run(Scene, { canvas });
  const result = lab.evaluateScenario({ keys: ['Space'], steps: 10, delta: 0.1 });
  expect(result.commands.find(c => c.op === 'text').text).toBe('Punkty: 1');
  expect(lab.evaluateScenario({ steps: 1 }).commands.find(c => c.op === 'text').text).toBe('Punkty: 0');
  canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
  expect(lab.current.input.isKeyDown('ArrowRight')).toBe(true);
  canvas.dispatchEvent(new Event('blur'));
  expect(lab.current.input.isKeyDown('ArrowRight')).toBe(false);
  lab.dispose();
});

test('controller respects boundaries and triggers destroy a coin only once', () => {
  const { lab, canvas } = fixture();
  class Move extends lab.Component {
    onUpdate() { this.getComponent(lab.CharacterController2D).move(1, 0, 100); }
    onTrigger(other) { if (other.name === 'Coin') { this.game.points++; other.destroy(); } }
  }
  class Scene extends lab.Game {
    onCreate() {
      this.points = 0;
      const player = this.createObject('Player').setPosition(30, 50);
      player.addComponent(new lab.ShapeRenderer({ width: 20, height: 20 }));
      player.addComponent(new lab.CharacterController2D());
      player.addComponent(new Move());
      const coin = this.createObject('Coin').setPosition(60, 50);
      coin.addComponent(new lab.ShapeRenderer({ width: 20, height: 20 }));
      coin.addComponent(new lab.Trigger2D());
    }
    onUpdate() { this.canvas.drawText(`Punkty: ${this.points}`, 10, 20); }
  }
  lab.run(Scene, { canvas });
  const state = lab.evaluateScenario({ width: 100, height: 100, steps: 20, delta: 0.1 });
  expect(state.objects).toHaveLength(1);
  expect(state.objects[0].x).toBe(90);
  expect(state.commands.find(c => c.op === 'text').text).toBe('Punkty: 1');
  lab.dispose();
});

test('built-in component identities survive renamed/minified constructor names', () => {
  const { lab, canvas } = fixture();
  const original = lab.ShapeRenderer.name;
  Object.defineProperty(lab.ShapeRenderer, 'name', { value: 'a', configurable: true });
  class Scene extends lab.Game {
    onCreate() { this.createObject('Player').addComponent(new lab.ShapeRenderer()); }
  }
  try {
    lab.run(Scene, { canvas });
    expect(lab.snapshot().objects[0].components).toEqual(['ShapeRenderer']);
  } finally { lab.dispose(); Object.defineProperty(lab.ShapeRenderer, 'name', { value: original }); }
});
