import { createGameLab } from './gameRuntime.js';

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
