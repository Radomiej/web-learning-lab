// Self-contained so the identical implementation can run inside the iframe.
export function createGameLab(environment = {}) {
  const win = environment.window || window;
  const doc = environment.document || win.document;
  const raf = environment.requestAnimationFrame || win.requestAnimationFrame.bind(win);
  const caf = environment.cancelAnimationFrame || win.cancelAnimationFrame.bind(win);
  const finite = (value, label) => {
    if (!Number.isFinite(value)) throw new Error(`${label}: oczekiwano skończonej liczby.`);
    return value;
  };
  const normalizeKey = key => key === ' ' || key === 'Spacebar' ? 'Space' : key.length === 1 ? key.toLowerCase() : key;
  const textures = {
    player: ['#76b9f2', '#17324d'], slime: ['#70c994', '#123c2c'],
    bat: ['#a98bd5', '#392c59'], ghost: ['#c3edf2', '#527783'], gem: ['#ffd166', '#9b631c'],
    coin: ['#ffd166', '#9b631c'], chest: ['#b77932', '#603b22'],
    projectile: ['#8be9fd', '#ffffff'], heart: ['#ef6a78', '#7d2938'],
    wall: ['#889aa9', '#405563'],
  };
  class Transform {
    constructor() { this.x = 0; this.y = 0; this.rotation = 0; this.scale = { x: 1, y: 1 }; this.visualOffset = { x: 0, y: 0 }; }
  }
  class Component {
    constructor() { this.enabled = true; this.gameObject = null; this.created = false; this.destroyed = false; }
    get transform() { return this.gameObject.transform; }
    get game() { return this.gameObject.game; }
    getComponent(type) { return this.gameObject.getComponent(type); }
    onCreate() {}
    onUpdate() {}
    onDrawUI() {}
    onDestroy() {}
    onCollision() {}
    onTrigger() {}
  }
  class ShapeRenderer extends Component {
    constructor({ width = 32, height = 32, color = '#76b9f2' } = {}) {
      super(); this.width = width; this.height = height; this.color = color;
    }
  }
  class Sprite extends ShapeRenderer {
    constructor(texture = 'player', width = 32, height = 32) {
      if (!textures[texture]) throw new Error(`Brak tekstury: ${texture}. Dostępne: ${Object.keys(textures).join(', ')}.`);
      super({ width, height }); this.texture = texture;
    }
  }
  class TextRenderer extends Component {
    constructor(text = '', x = 10, y = 24, color = '#ffffff') {
      super(); this.text = text; this.x = finite(x, 'Tekst x'); this.y = finite(y, 'Tekst y'); this.color = color;
    }
    onDrawUI() {
      const text = typeof this.text === 'function' ? this.text() : this.text;
      if (text !== null && text !== undefined) this.game.canvas.drawText(text, this.x, this.y, this.color);
    }
  }
  class ControlsHint extends TextRenderer {
    constructor(text = 'Kliknij planszę, aby sterować.') { super(text); }
    onDrawUI() {
      if (doc.activeElement !== this.game.canvas.element) {
        this.y = this.game.canvas.height - 12;
        super.onDrawUI();
      }
    }
  }
  class Camera2D extends Component {
    constructor() { super(); this.offsetX = 0; this.offsetY = 0; this.target = null; this.shakeStrength = 0; this.shakeRemaining = 0; this.shakeElapsed = 0; }
    follow(target) {
      if (!this.gameObject || !target || target.game !== this.game || target.destroyed) throw new Error('Kamera wymaga celu z tej samej sceny.');
      this.target = target;
    }
    stopFollowing() { this.target = null; }
    shake(strength, seconds) {
      finite(strength, 'Siła shake'); finite(seconds, 'Czas shake');
      if (strength < 0 || seconds < 0) throw new Error('Siła i czas shake nie mogą być ujemne.');
      this.shakeStrength = strength; this.shakeRemaining = seconds; this.shakeElapsed = 0;
    }
    stopShake() { this.shakeRemaining = 0; }
    onUpdate(delta) { this.shakeRemaining = Math.max(0, this.shakeRemaining - delta); this.shakeElapsed += delta; }
    getView() {
      const target = this.target?.active && !this.target.destroyed ? this.target : null;
      const x = target ? target.transform.x - this.game.canvas.width / 2 : 0;
      const y = target ? target.transform.y - this.game.canvas.height / 2 : 0;
      return {
        x: x + finite(this.offsetX, 'Kamera x') + (this.shakeRemaining > 0 ? Math.sin(this.shakeElapsed * 47) * this.shakeStrength : 0),
        y: y + finite(this.offsetY, 'Kamera y') + (this.shakeRemaining > 0 ? Math.cos(this.shakeElapsed * 39) * this.shakeStrength : 0),
      };
    }
  }
  class TileMap extends Component {
    constructor(texture = 'grass', tileSize = 32) {
      super();
      if (!['grass', 'sand'].includes(texture)) throw new Error('TileMap obsługuje tekstury grass i sand.');
      finite(tileSize, 'Rozmiar kafelka');
      if (tileSize < 8) throw new Error('Kafelek TileMap musi mieć co najmniej 8 px.');
      this.texture = texture; this.tileSize = tileSize;
    }
  }
  class Tween {
    constructor(object, property, from, to, duration) {
      this.object = object; this.property = property; this.from = from; this.to = to;
      this.duration = finite(duration, 'Czas tweena'); this.elapsed = 0; this.easing = 'linear';
      this.completed = false; this.cancelled = false;
      this.easing = 'smooth';
      if (duration < 0) throw new Error('Czas tweena nie może być ujemny.');
      if (duration === 0) { this.apply(1); this.completed = true; }
    }
    apply(progress) {
      const t = this.easing === 'smooth' ? progress * progress * (3 - 2 * progress) : progress;
      if (this.property === 'shake') {
        const strength = this.from * (1 - t);
        this.object.transform.visualOffset.x = Math.sin(this.elapsed * 47) * strength;
        this.object.transform.visualOffset.y = Math.cos(this.elapsed * 39) * strength;
      } else if (typeof this.from === 'number') {
        this.object.transform[this.property] = this.from + (this.to - this.from) * t;
      } else {
        for (const axis of ['x', 'y']) {
          const value = this.from[axis] + (this.to[axis] - this.from[axis]) * t;
          if (this.property === 'position') this.object.transform[axis] = value;
          else this.object.transform[this.property][axis] = value;
        }
      }
    }
    update(delta) {
      if (this.completed || this.cancelled || this.object.destroyed) return false;
      this.elapsed = Math.min(this.duration, this.elapsed + delta);
      this.apply(this.duration ? this.elapsed / this.duration : 1);
      this.completed = this.elapsed >= this.duration;
      if (this.completed && this.property === 'shake') this.object.transform.visualOffset = { x: 0, y: 0 };
      return !this.completed;
    }
    cancel() {
      this.cancelled = true;
      if (this.property === 'shake') this.object.transform.visualOffset = { x: 0, y: 0 };
    }
  }
  class Tweens {
    static start(object, property, to, seconds) {
      if (!object || object.destroyed) throw new Error('Tween wymaga aktywnego obiektu.');
      const from = property === 'shake' ? to : property === 'rotation' ? object.transform.rotation : property === 'position' ? { x: object.transform.x, y: object.transform.y } : { ...object.transform[property] };
      const target = property === 'shake' ? 0 : property === 'rotation' ? to : { x: to.x, y: to.y };
      const tween = new Tween(object, property, from, target, seconds);
      object.game.addTween(tween);
      return tween;
    }
    static position(object, x, y, seconds) { return this.start(object, 'position', { x, y }, seconds); }
    static scale(object, x, y, seconds) { return this.start(object, 'scale', { x, y }, seconds); }
    static rotation(object, radians, seconds) { return this.start(object, 'rotation', radians, seconds); }
    static shake(object, strength, seconds) { return this.start(object, 'shake', strength, seconds); }
  }
  class Collider2D extends Component {}
  class Trigger2D extends Collider2D {}
  class CharacterController2D extends Component {
    constructor() { super(); this.velocity = { x: 0, y: 0 }; this.collideWorldBounds = true; }
    move(x, y, speed = 120) {
      finite(x, 'Kierunek x'); finite(y, 'Kierunek y'); finite(speed, 'Prędkość');
      const length = Math.hypot(x, y);
      this.velocity.x = length ? x / length * speed : 0;
      this.velocity.y = length ? y / length * speed : 0;
    }
  }
  class GameObject {
    constructor(game, name) { this.game = game; this.name = name; this.transform = new Transform(); this.active = true; this.destroyed = false; this.components = []; }
    setPosition(x, y) { this.transform.x = finite(x, 'Pozycja x'); this.transform.y = finite(y, 'Pozycja y'); return this; }
    addComponent(component) {
      if (!(component instanceof Component) || component.gameObject || this.destroyed) throw new Error('Dodaj nowy komponent do aktywnego obiektu.');
      component.gameObject = this; this.components.push(component); return component;
    }
    getComponent(type) { return this.components.find(c => c instanceof type && !c.destroyed); }
    removeComponent(component) {
      if (!this.components.includes(component) || component.destroyed) return;
      component.destroyed = true; component.onDestroy(); this.components = this.components.filter(c => c !== component);
    }
    destroy() {
      if (this.destroyed) return;
      this.destroyed = true; this.active = false;
      for (const component of [...this.components]) this.removeComponent(component);
    }
  }
  const componentNames = new Map([
    [ShapeRenderer, 'ShapeRenderer'], [Sprite, 'Sprite'], [TextRenderer, 'TextRenderer'], [ControlsHint, 'ControlsHint'], [Camera2D, 'Camera2D'], [TileMap, 'TileMap'], [Collider2D, 'Collider2D'],
    [Trigger2D, 'Trigger2D'], [CharacterController2D, 'CharacterController2D'],
  ]);
  class Input {
    constructor() { this.down = new Set(); this.pressed = new Set(); }
    setKey(key, down) {
      key = normalizeKey(key);
      if (down) { if (!this.down.has(key)) this.pressed.add(key); this.down.add(key); }
      else this.down.delete(key);
    }
    isKeyDown(key) { return this.down.has(normalizeKey(key)); }
    isKeyPressed(key) { return this.pressed.has(normalizeKey(key)); }
    endFrame() { this.pressed.clear(); }
    clear() { this.down.clear(); this.pressed.clear(); }
  }
  class Canvas {
    constructor(element) {
      this.element = element; this.context = element.getContext('2d');
      if (!this.context) throw new Error('Canvas 2D jest niedostępny w tej przeglądarce.');
      this.commands = []; this.width = 640; this.height = 360; this.view = { x: 0, y: 0 };
    }
    resize(width, height, ratio = 1) {
      this.width = Math.max(1, finite(width, 'Szerokość')); this.height = Math.max(1, finite(height, 'Wysokość'));
      this.element.width = Math.round(this.width * ratio); this.element.height = Math.round(this.height * ratio);
      this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    clear(color = '#0b2033') {
      this.commands = [{ op: 'clear', color }]; this.context.fillStyle = color;
      this.context.fillRect(0, 0, this.width, this.height);
    }
    drawRect(x, y, width, height, color = '#76b9f2', rotation = 0, scale = { x: 1, y: 1 }) {
      [x, y, width, height, rotation, scale.x, scale.y].forEach(v => finite(v, 'Rysowanie'));
      this.commands.push({ op: 'rect', x, y, screenX: x - this.view.x, screenY: y - this.view.y, width, height, color });
      const ctx = this.context; ctx.save(); ctx.translate(x - this.view.x, y - this.view.y); ctx.rotate(rotation); ctx.scale(scale.x, scale.y);
      ctx.fillStyle = color; ctx.fillRect(-width / 2, -height / 2, width, height); ctx.restore();
    }
    drawText(text, x, y, color = '#ffffff') {
      finite(x, 'Tekst x'); finite(y, 'Tekst y');
      this.commands.push({ op: 'text', text: String(text), x, y, color });
      this.context.fillStyle = color; this.context.font = '16px monospace'; this.context.fillText(String(text), x, y);
    }
    drawTileMap(texture, tileSize) {
      const columns = Math.ceil(this.width / tileSize), rows = Math.ceil(this.height / tileSize);
      this.commands.push({ op: 'tilemap', texture, tileSize, columns, rows });
      const ctx = this.context;
      const firstColumn = Math.floor(this.view.x / tileSize), firstRow = Math.floor(this.view.y / tileSize);
      for (let row = firstRow; row <= firstRow + rows; row++) for (let column = firstColumn; column <= firstColumn + columns; column++) {
        const seed = ((column * 17 + row * 31 + (column * row * 7)) % 5 + 5) % 5;
        const x = column * tileSize - this.view.x, y = row * tileSize - this.view.y;
        ctx.fillStyle = texture === 'grass'
          ? ['#355b3f', '#395f42', '#3c6245', '#34583d', '#416848'][seed]
          : ['#9a7950', '#a18156', '#a8875b', '#98764d', '#b08d60'][seed];
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.fillStyle = texture === 'grass' ? '#739455' : '#d1b27b';
        const inset = 4 + seed * 2;
        ctx.fillRect(x + inset, y + tileSize / 2, 2, 3);
        ctx.fillRect(x + tileSize - inset, y + 8 + seed, 2, 3);
      }
    }
    drawSprite(sprite, transform) {
      const [color, detail] = textures[sprite.texture];
      const ctx = this.context;
      ctx.save(); ctx.translate(transform.x - this.view.x + transform.visualOffset.x, transform.y - this.view.y + transform.visualOffset.y); ctx.rotate(transform.rotation); ctx.scale(transform.scale.x, transform.scale.y);
      ctx.fillStyle = color; ctx.fillRect(-sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height);
      ctx.fillStyle = detail;
      if (sprite.texture === 'gem') {
        ctx.beginPath(); ctx.moveTo(0, -sprite.height / 3); ctx.lineTo(sprite.width / 3, 0); ctx.lineTo(0, sprite.height / 3); ctx.lineTo(-sprite.width / 3, 0); ctx.closePath(); ctx.fill();
      } else if (sprite.texture === 'coin') {
        ctx.beginPath(); ctx.arc(0, 0, Math.min(sprite.width, sprite.height) / 3, 0, Math.PI * 2); ctx.fill();
      } else if (sprite.texture === 'chest') {
        ctx.fillRect(-sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height / 3);
        ctx.fillStyle = '#f6ce72'; ctx.fillRect(-2, -sprite.height / 2, 4, sprite.height);
      } else if (sprite.texture === 'bat') {
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-sprite.width / 2, -sprite.height / 2); ctx.lineTo(-sprite.width / 3, sprite.height / 3); ctx.lineTo(0, sprite.height / 5); ctx.lineTo(sprite.width / 3, sprite.height / 3); ctx.lineTo(sprite.width / 2, -sprite.height / 2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.fillRect(-5, -2, 2, 2); ctx.fillRect(3, -2, 2, 2);
      } else if (sprite.texture === 'projectile') {
        ctx.beginPath(); ctx.arc(0, 0, Math.min(sprite.width, sprite.height) / 2, 0, Math.PI * 2); ctx.fill();
      } else if (sprite.texture === 'heart') {
        ctx.beginPath(); ctx.moveTo(0, sprite.height / 3); ctx.bezierCurveTo(-sprite.width, -sprite.height / 4, -sprite.width / 3, -sprite.height / 2, 0, -sprite.height / 4); ctx.bezierCurveTo(sprite.width / 3, -sprite.height / 2, sprite.width, -sprite.height / 4, 0, sprite.height / 3); ctx.fill();
      } else {
        ctx.fillRect(-sprite.width / 4, -sprite.height / 6, sprite.width / 8, sprite.height / 8);
        ctx.fillRect(sprite.width / 8, -sprite.height / 6, sprite.width / 8, sprite.height / 8);
      }
      ctx.restore();
      this.commands.push({ op: 'sprite', texture: sprite.texture, x: transform.x, y: transform.y, screenX: transform.x - this.view.x, screenY: transform.y - this.view.y, width: sprite.width, height: sprite.height });
    }
  }
  const size = object => {
    const renderer = object.getComponent(ShapeRenderer);
    return { width: (renderer?.width ?? 32) * Math.abs(object.transform.scale.x), height: (renderer?.height ?? 32) * Math.abs(object.transform.scale.y) };
  };
  const overlaps = (a, b) => {
    const sa = size(a), sb = size(b);
    return Math.abs(a.transform.x - b.transform.x) < (sa.width + sb.width) / 2 && Math.abs(a.transform.y - b.transform.y) < (sa.height + sb.height) / 2;
  };
  class Game {
    constructor() {
      this.objects = []; this.input = new Input(); this.time = { deltaTime: 0, elapsed: 0 };
      this.background = '#0b2033'; this.started = false; this.disposed = false; this.canvas = null; this.tweens = []; this.cameraView = { x: 0, y: 0 };
    }
    onCreate() {}
    onUpdate() {}
    onDrawUI() {}
    onDestroy() {}
    createObject(name = 'Object') {
      if (this.disposed) throw new Error('Gra jest zamknięta.');
      if (this.objects.length >= 1000) throw new Error('Limit 1000 obiektów w scenie.');
      const object = new GameObject(this, name); this.objects.push(object); return object;
    }
    find(name) { return this.objects.find(o => o.name === name && !o.destroyed); }
    addTween(tween) {
      for (const existing of this.tweens) if (existing.object === tween.object && existing.property === tween.property) existing.cancel();
      this.tweens = this.tweens.filter(existing => !existing.cancelled && !existing.completed);
      if (!tween.completed) this.tweens.push(tween);
      return tween;
    }
    initialize() {
      for (let pass = 0; pass < 100; pass++) {
        let pending = false;
        for (const object of [...this.objects]) for (const component of [...object.components]) {
          if (!object.destroyed && !component.destroyed && !component.created) {
            pending = true; component.created = true; component.onCreate();
          }
        }
        if (!pending) return;
      }
      throw new Error('onCreate tworzy komponenty bez końca.');
    }
    start() {
      if (this.started || this.disposed) throw new Error('Scenę można uruchomić tylko raz.');
      this.started = true; this.onCreate(); this.initialize();
    }
    render() {
      const camera = this.objects.filter(o => o.active && !o.destroyed).flatMap(o => o.components)
        .find(c => c instanceof Camera2D && c.enabled && c.created && !c.destroyed);
      this.cameraView = camera ? camera.getView() : { x: 0, y: 0 };
      this.canvas.view = this.cameraView;
      for (const object of this.objects) if (object.active && !object.destroyed) {
        for (const tileMap of object.components) if (tileMap instanceof TileMap && tileMap.enabled && tileMap.created && !tileMap.destroyed) this.canvas.drawTileMap(tileMap.texture, tileMap.tileSize);
      }
      for (const object of this.objects) {
        if (!object.active || object.destroyed) continue;
        for (const renderer of object.components) if (renderer instanceof ShapeRenderer && renderer.enabled && renderer.created && !renderer.destroyed) {
          if (renderer instanceof Sprite) this.canvas.drawSprite(renderer, object.transform);
          else this.canvas.drawRect(object.transform.x + object.transform.visualOffset.x, object.transform.y + object.transform.visualOffset.y, renderer.width, renderer.height, renderer.color, object.transform.rotation, object.transform.scale);
        }
      }
      this.canvas.view = { x: 0, y: 0 };
      this.onDrawUI();
      for (const object of this.objects) if (object.active && !object.destroyed) {
        for (const component of object.components) if (component.enabled && component.created && !component.destroyed) component.onDrawUI();
      }
    }
    step(delta) {
      if (!this.started || this.disposed) return;
      finite(delta, 'Czas klatki'); if (delta < 0) throw new Error('Czas klatki nie może być ujemny.');
      delta = Math.min(delta, 0.1); this.time.deltaTime = delta; this.time.elapsed += delta;
      try {
        this.initialize(); this.canvas.clear(this.background);
        this.tweens = this.tweens.filter(tween => tween.update(delta));
        for (const o of this.objects) { const c = o.getComponent(CharacterController2D); if (c) c.velocity = { x: 0, y: 0 }; }
        this.onUpdate(delta);
        const snapshot = [...this.objects];
        for (const o of snapshot) if (o.active && !o.destroyed) for (const c of [...o.components]) {
          if (c.enabled && c.created && !c.destroyed && !o.destroyed) c.onUpdate(delta);
        }
        const contacts = [];
        for (const o of snapshot) {
          const controller = o.getComponent(CharacterController2D);
          if (!o.active || o.destroyed || !controller?.enabled) continue;
          const dimensions = size(o);
          for (const axis of ['x', 'y']) {
            const previous = o.transform[axis]; o.transform[axis] += controller.velocity[axis] * delta;
            for (const other of snapshot) {
              const collider = other.getComponent(Collider2D);
              if (other === o || !other.active || other.destroyed || !collider?.enabled || collider instanceof Trigger2D) continue;
              if (overlaps(o, other)) {
                const extent = (axis === 'x' ? dimensions.width + size(other).width : dimensions.height + size(other).height) / 2;
                o.transform[axis] = controller.velocity[axis] > 0 ? other.transform[axis] - extent : controller.velocity[axis] < 0 ? other.transform[axis] + extent : previous;
                contacts.push([o, other, false]);
              }
            }
          }
          if (controller.collideWorldBounds) {
            o.transform.x = Math.max(dimensions.width / 2, Math.min(this.canvas.width - dimensions.width / 2, o.transform.x));
            o.transform.y = Math.max(dimensions.height / 2, Math.min(this.canvas.height - dimensions.height / 2, o.transform.y));
          }
        }
        for (let i = 0; i < snapshot.length; i++) for (let j = i + 1; j < snapshot.length; j++) {
          const a = snapshot[i], b = snapshot[j];
          const ca = a.getComponent(Collider2D), cb = b.getComponent(Collider2D);
          if (a.active && b.active && !a.destroyed && !b.destroyed && (ca?.enabled || a.getComponent(CharacterController2D)?.enabled) && (cb?.enabled || b.getComponent(CharacterController2D)?.enabled) && overlaps(a, b)) {
            contacts.push([a, b, ca instanceof Trigger2D || cb instanceof Trigger2D]);
          }
        }
        const dispatched = new Set();
        for (const [a, b, trigger] of contacts) {
          const key = `${snapshot.indexOf(a)}:${snapshot.indexOf(b)}:${trigger}`;
          if (dispatched.has(key) || a.destroyed || b.destroyed) continue;
          dispatched.add(key);
          for (const [owner, other] of [[a, b], [b, a]]) for (const c of [...owner.components]) {
            if (c.enabled && !c.destroyed) c[trigger ? 'onTrigger' : 'onCollision'](other);
          }
        }
        this.objects = this.objects.filter(o => !o.destroyed); this.render();
      } finally { this.input.endFrame(); }
    }
    dispose() {
      if (this.disposed) return; this.disposed = true;
      for (const tween of this.tweens) tween.cancel(); this.tweens = [];
      for (const object of [...this.objects]) object.destroy();
      this.objects = []; this.input.clear(); this.onDestroy();
    }
  }
  let current = null, factory = null, frame = null, cleanup = () => {}, lastTime = null;
  function stopLoop() { if (frame !== null) caf(frame); frame = null; lastTime = null; }
  function dispose() { stopLoop(); cleanup(); cleanup = () => {}; current?.dispose(); current = null; }
  function snapshot(game = current) {
    if (!game) return null;
    return {
      width: game.canvas.width, height: game.canvas.height, elapsed: game.time.elapsed, camera: { ...game.cameraView },
      objects: game.objects.filter(o => !o.destroyed).map(o => {
        const renderer = o.getComponent(ShapeRenderer);
        return {
          name: o.name, x: o.transform.x, y: o.transform.y, hp: o.hp ?? null,
          rotation: o.transform.rotation, scaleX: o.transform.scale.x, scaleY: o.transform.scale.y, active: o.active,
          components: o.components.map(c => componentNames.get(c.constructor) || c.constructor.name),
          visualOffsetX: o.transform.visualOffset.x, visualOffsetY: o.transform.visualOffset.y,
          renderer: renderer ? { kind: componentNames.get(renderer.constructor) || renderer.constructor.name, width: renderer.width, height: renderer.height, color: renderer.color, texture: renderer.texture ?? null } : null,
        };
      }),
      commands: game.canvas.commands.map(c => ({ ...c })),
    };
  }
  function createScene(canvas) {
    const game = new factory();
    if (!(game instanceof Game)) throw new Error('Twoja scena musi rozszerzać GameLab.Game.');
    game.canvas = new Canvas(canvas); return game;
  }
  function run(GameClass, config = {}) {
    dispose(); factory = GameClass;
    const element = typeof config.canvas === 'string' ? doc.querySelector(config.canvas) : config.canvas || doc.querySelector('#game');
    if (!element) throw new Error('Brak canvas #game w index.html.');
    current = createScene(element);
    const game = current;
    const resize = () => { const rect = element.getBoundingClientRect(); game.canvas.resize(rect.width || 640, rect.height || 360, win.devicePixelRatio || 1); };
    const down = event => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) event.preventDefault(); game.input.setKey(event.key, true); };
    const up = event => game.input.setKey(event.key, false);
    const blur = () => game.input.clear();
    const focus = () => element.focus();
    element.tabIndex = 0; element.addEventListener('pointerdown', focus); element.addEventListener('keydown', down); element.addEventListener('keyup', up); element.addEventListener('blur', blur);
    win.addEventListener('blur', blur); win.addEventListener('resize', resize);
    const observer = win.ResizeObserver ? new win.ResizeObserver(resize) : null; observer?.observe(element);
    cleanup = () => {
      observer?.disconnect(); element.removeEventListener('pointerdown', focus); element.removeEventListener('keydown', down); element.removeEventListener('keyup', up); element.removeEventListener('blur', blur);
      win.removeEventListener('blur', blur); win.removeEventListener('resize', resize);
    };
    try { resize(); game.start(); game.step(0); } catch (error) { dispose(); throw error; }
    const tick = now => {
      if (game !== current || game.disposed) return;
      try { game.step(lastTime === null ? 0 : (now - lastTime) / 1000); lastTime = now; frame = raf(tick); }
      catch (error) { stopLoop(); win.dispatchEvent(new win.ErrorEvent('error', { error, message: error.message })); }
    };
    frame = raf(tick); return game;
  }
  function evaluateScenario(scenario = {}) {
    if (!factory || !current) throw new Error('Uruchom scenę przez GameLab.run(YourGame).');
    // A detached canvas avoids disturbing the live game while using its real render path.
    const game = createScene(doc.createElement('canvas'));
    try {
      game.canvas.resize(scenario.width ?? 640, scenario.height ?? 360); game.start(); game.step(0);
      const phases = scenario.phases || [{ keys: scenario.keys || [], steps: scenario.steps ?? 1, delta: scenario.delta ?? 0.1 }];
      for (const phase of phases) {
        for (const key of [...game.input.down]) if (!(phase.keys || []).map(normalizeKey).includes(key)) game.input.setKey(key, false);
        for (const key of phase.keys || []) game.input.setKey(key, true);
        if (phase.width !== undefined || phase.height !== undefined) game.canvas.resize(phase.width ?? game.canvas.width, phase.height ?? game.canvas.height);
        const steps = phase.steps ?? 1;
        if (!Number.isInteger(steps) || steps < 0 || steps > 500) throw new Error('Scenariusz może mieć 0–500 kroków.');
        for (let i = 0; i < steps; i++) game.step(phase.delta ?? 0.1);
      }
      return snapshot(game);
    } finally { game.dispose(); }
  }
  win.addEventListener('pagehide', dispose);
  return { Game, GameObject, Component, Transform, Input, Canvas, ShapeRenderer, Sprite, TextRenderer, ControlsHint, Camera2D, TileMap, Tween, Tweens, Collider2D, Trigger2D, CharacterController2D, run, dispose, snapshot, evaluateScenario, get current() { return current; } };
}

export function getGameRuntimeScript() {
  return `window.GameLab = (${createGameLab.toString()})();`;
}
