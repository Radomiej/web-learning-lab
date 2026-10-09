import { createGameLab } from './gameRuntime.js';

function labFixture() {
  const ctx = new Proxy({}, { get: (o, key) => o[key] ?? (() => {}) });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
  const canvas = document.createElement('canvas'); document.body.append(canvas);
  return { canvas, lab: createGameLab({ window, document, requestAnimationFrame: () => 1, cancelAnimationFrame: () => {}, skipAssetLoading: true }) };
}
afterEach(() => { vi.restoreAllMocks(); document.body.replaceChildren(); });

test('a live scene waits for all atlas images before creating gameplay objects',async()=>{
  const images=[];let creates=0;
  const ctx=new Proxy({}, {get:(o,key)=>o[key]??(()=>{})});
  vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue(ctx);
  vi.stubGlobal('Image',class{set src(value){this.source=value;images.push(this);}});
  const canvas=document.createElement('canvas');document.body.append(canvas);
  const lab=createGameLab({window,document,requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{}});
  class Scene extends lab.Game{onCreate(){creates++;this.createObject('Player').addComponent(new lab.Sprite(lab.Assets.PLAYER01));}}
  try {
    const game=lab.run(Scene,{canvas});expect(creates).toBe(0);expect(images.length).toBeGreaterThan(4);
    images.slice(0,-1).forEach(image=>image.onload());await Promise.resolve();expect(creates).toBe(0);
    images.at(-1).onload();await game.ready;expect(creates).toBe(1);expect(game.find('Player')).not.toBeNull();
  } finally {lab.dispose();vi.unstubAllGlobals();}
});

test('v2 Assets and component API expose snapshots, null and local services', () => {
  const { lab, canvas } = labFixture();
  class Scene extends lab.Game { onCreate() { this.hero = this.createObject('hero'); this.hero.addComponent(new lab.Sprite(lab.Assets.PLAYER01)); } }
  lab.run(Scene, { canvas });
  expect(lab.current.hero.getComponent(lab.Collider2D)).toBeNull();
  expect(lab.current.hero.getComponent(lab.Sprite).getGame()).toBe(lab.current);
  lab.current.getObjects().length = 0;
  expect(lab.current.getObjects()).toHaveLength(1);
  expect(lab.current.hero.getComponent(lab.Sprite).texture).toBe('player');
  lab.dispose();
});

test('v2 swept movement stops at a thin wall and visual scale is independent', () => {
  const { lab, canvas } = labFixture();
  class Movement extends lab.Component { onUpdate() { this.getComponent(lab.CharacterController2D).move(1, 0, 600); } }
  class Scene extends lab.Game {
    onCreate() {
      this.hero = this.createObject('hero').setPosition(100, 100);
      this.hero.addComponent(new lab.Sprite(lab.Assets.PLAYER01)); this.hero.transform.scale.x = 5;
      this.hero.addComponent(new lab.CircleCollider2D(12)); this.hero.addComponent(new lab.CharacterController2D()); this.hero.addComponent(new Movement());
      this.createObject('wall').setPosition(140, 110).addComponent(new lab.Collider2D(2, 400));
    }
  }
  lab.run(Scene, { canvas }); lab.current.step(0.1);
  expect(lab.current.hero.transform.x).toBeCloseTo(127, 6);
  lab.dispose();
});

test('v2 pause freezes WORLD while UI and unscaled clocks continue', () => {
  const { lab, canvas } = labFixture(); let world = 0, ui = 0;
  class W extends lab.Component { onUpdate() { world++; } }
  class U extends lab.Component { constructor() { super(); this.updateMode = 'UI'; } onUpdate() { ui++; } }
  class Scene extends lab.Game { onCreate() { const o = this.createObject(); o.addComponent(new W()); o.addComponent(new U()); } }
  lab.run(Scene, { canvas }); world = ui = 0; lab.current.pause(); lab.current.step(0.1);
  expect(world).toBe(0); expect(ui).toBe(1); expect(lab.current.time.elapsed).toBe(0); expect(lab.current.time.unscaledElapsed).toBeCloseTo(0.1);
  lab.dispose();
});

test('v2 dispersed bodies avoid the global all-pairs narrow phase', () => {
  const { lab, canvas } = labFixture();
  class Scene extends lab.Game { onCreate() { for (let i = 0; i < 500; i++) this.createObject().setPosition(i * 100, 100).addComponent(new lab.Trigger2D(20, 20)); } }
  lab.run(Scene, { canvas }); lab.current.step(0.1);
  expect(lab.current.physics.stats.narrowPhaseTests).toBeLessThan(500);
  expect(lab.current.physics.queryRadius(0, 100, 10, 1)).toHaveLength(1);
  lab.dispose();
});

test('ProgressBar clamps percent, handles zero max, and emits independent UI geometry', () => {
  const { lab, canvas } = labFixture();
  class Scene extends lab.Game { onCreate() { this.pb = this.createObject('HP').setPosition(100, 20).addComponent(new lab.ProgressBar(200, 20)); } }
  lab.run(Scene, { canvas }); const pb = lab.current.pb;
  pb.setProgress(50); expect(pb.getProgress()).toBe(50);
  pb.setValue(3, 5); expect(pb.getProgress()).toBe(60);
  pb.setProgress(120); expect(pb.getProgress()).toBe(100);
  pb.setValue(3, 0); expect(pb.getProgress()).toBe(0);
  pb.setProgress(50); lab.current.pause(); lab.current.step(.1);
  expect(lab.snapshot().commands.find(c => c.op === 'progress')).toMatchObject({ x: 100, y: 20, progress: 50, width: 200 });
  lab.dispose();
});

test('mouse input is scene-local and activates a button on matching press/release', () => {
  const { lab, canvas } = labFixture(); let clicks = 0;
  canvas.getBoundingClientRect = () => ({ left: 10, top: 20, width: 400, height: 300 });
  class Scene extends lab.Game { onCreate() { const b = this.createObject('button').setPosition(100, 50).addComponent(new lab.Button(120, 40)); b.onClick = () => clicks++; } }
  lab.run(Scene, { canvas }); lab.current.pause();
  canvas.dispatchEvent(new MouseEvent('pointerdown', { clientX: 110, clientY: 70, button: 0 }));
  expect(lab.current.input.getPointerPosition()).toEqual({ x: 100, y: 50 });
  expect(lab.current.input.isMouseDown(0)).toBe(true);
  lab.current.step(.1);
  canvas.dispatchEvent(new MouseEvent('pointerup', { clientX: 110, clientY: 70, button: 0 }));
  lab.current.step(.1); expect(clicks).toBe(1);
  lab.current.step(.1); expect(clicks).toBe(1);
  const isolated = new lab.InputManager(); expect(isolated.isMouseDown(0)).toBe(false); expect(isolated.getPointerPosition()).toBeNull();
  lab.dispose();
});

test('UI anchor layout and camera conversions use CSS viewport coordinates', () => {
  const { lab, canvas } = labFixture();
  class Scene extends lab.Game { onCreate() {
    this.target = this.createObject().setPosition(600, 400);
    this.camera = this.createObject().addComponent(new lab.Camera2D()); this.camera.follow(this.target);
    this.layout = this.createObject().setPosition(12, 12).addComponent(new lab.UITransform(200, 18)); this.layout.anchor = lab.UIAnchor.TOP_LEFT;
  } }
  lab.run(Scene, { canvas }); lab.current.canvas.resize(640, 360); lab.current.step(0);
  expect(lab.current.layout.getBounds()).toEqual({ left: 12, top: 12, right: 212, bottom: 30 });
  expect(lab.current.camera.worldToScreen(new lab.Vector2(600, 400))).toEqual(new lab.Vector2(320, 180));
  expect(lab.current.camera.screenToWorld(new lab.Vector2(320, 180))).toEqual(new lab.Vector2(600, 400));
  lab.dispose();
});

test('mouse transitions last one frame, snapshots are isolated and blur clears held buttons', () => {
  const { lab, canvas } = labFixture();
  lab.run(class extends lab.Game {}, { canvas });
  const input = lab.current.input, right = lab.InputManager.MOUSE_RIGHT;
  input.setPointer(30, 40); const position = input.getPointerPosition(); position.x = 900;
  expect(input.getPointerPosition()).toEqual({ x: 30, y: 40 });
  input.setMouseButton(right, true); input.setMouseButton(right, true);
  expect(input.isMousePressed(right)).toBe(true);
  lab.current.step(.01);
  expect(input.isMousePressed(right)).toBe(false); expect(input.isMouseDown(right)).toBe(true);
  input.setMouseButton(right, false); expect(input.isMouseReleased(right)).toBe(true);
  lab.current.step(.01); expect(input.isMouseReleased(right)).toBe(false);
  input.setMouseButton(right, true); canvas.dispatchEvent(new Event('blur'));
  expect(input.isMouseDown(right)).toBe(false); expect(input.isMousePressed(right)).toBe(false);
  lab.dispose();
});

test('render order is stable across world layers and screen UI ignores the camera', () => {
  const { lab, canvas } = labFixture();
  class Scene extends lab.Game { onCreate() {
    const target=this.createObject().setPosition(600,400);
    this.createObject().addComponent(new lab.Camera2D()).follow(target);
    const front=this.createObject().setPosition(610,410).addComponent(new lab.ShapeRenderer(10,10,'front'));front.layer=2;
    const back=this.createObject().setPosition(620,420).addComponent(new lab.ShapeRenderer(10,10,'back'));back.layer=1;
    const ui=this.createObject().setPosition(12,12);ui.addComponent(new lab.UITransform(100,20)).anchor=lab.UIAnchor.TOP_LEFT;ui.addComponent(new lab.ShapeRenderer(100,20,'ui'));
  } }
  lab.run(Scene,{canvas});lab.current.canvas.resize(640,360);lab.current.step(0);
  const rects=lab.snapshot().commands.filter(c=>c.op==='rect');
  expect(rects.map(c=>c.color)).toEqual(['back','front','ui']);
  expect(rects[0]).toMatchObject({screenX:340,screenY:200});
  expect(rects[2]).toMatchObject({screenX:62,screenY:22});
  lab.dispose();
});

test('owned tweens complete once, support late listeners and freeze WORLD during pause', () => {
  const { lab, canvas } = labFixture();let completions=0;
  class Scene extends lab.Game { onCreate(){this.target=this.createObject();} }
  lab.run(Scene,{canvas});const game=lab.current,target=game.target;
  const tween=lab.Tweens.position(target,20,0,.2).onComplete(()=>completions++);
  game.step(.1);expect(target.transform.x).toBe(10);game.pause();game.step(.1);expect(target.transform.x).toBe(10);
  game.resume();game.step(.1);expect(target.transform.x).toBe(20);expect(completions).toBe(1);
  tween.onComplete(()=>completions++);expect(completions).toBe(2);game.step(.1);expect(completions).toBe(2);
  lab.Tweens.scale(target,2,2,0).onComplete(()=>completions++);expect(target.transform.scale.x).toBe(2);expect(completions).toBe(3);
  const cancelled=lab.Tweens.rotation(target,3,1).onComplete(()=>completions++);cancelled.cancel();game.step(.1);expect(completions).toBe(3);
  target.transform.visualOffset.set(5,7);const shake=lab.Tweens.shake(target,10,1);game.step(.1);shake.cancel();expect(target.transform.visualOffset.x).toBeCloseTo(5);expect(target.transform.visualOffset.y).toBeCloseTo(7);
  const ui=lab.Tweens.position(target,40,0,.1);ui.updateMode='UI';game.pause();game.step(.1);expect(target.transform.x).toBe(40);
  lab.dispose();
});

test.each([100,1000,5000])('spatial hash keeps dispersed %i-body candidate counts bounded', count => {
  const {lab,canvas}=labFixture();
  class Scene extends lab.Game {onCreate(){for(let i=0;i<count;i++)this.createObject().setPosition((i%100)*100,Math.floor(i/100)*100).addComponent(new lab.Trigger2D(20,20));}}
  lab.run(Scene,{canvas});lab.current.step(.1);
  expect(lab.current.physics.stats.narrowPhaseTests).toBeLessThan(count);lab.dispose();
});

test('component and tag indexes track inheritance, intersections and immediate removal', () => {
 const {lab,canvas}=labFixture();class Player extends lab.Component{}class ArmoredPlayer extends Player{}
 lab.run(class extends lab.Game {},{canvas});const game=lab.current;
 expect(game.getObjectsWith(Player)).toEqual([]);
 const first=game.createObject('first').addTag('player');const player=first.addComponent(new ArmoredPlayer());first.addComponent(new lab.CircleCollider2D(10));
 const second=game.createObject('second');second.addComponent(new Player());
 expect(game.getObjectsWith(Player)).toEqual([first,second]);expect(game.getObjectsWith(Player,lab.Collider2D)).toEqual([first]);
 const copy=game.getObjectsWith(Player);copy.length=0;expect(game.getObjectsWith(Player)).toHaveLength(2);
 first.removeComponent(player);expect(game.getObjectsWith(Player)).toEqual([second]);expect(game.getObjectsWithTag('player')).toEqual([first]);
 first.removeTag('player');expect(game.getObjectsWithTag('player')).toEqual([]);second.destroy();expect(game.getObjectsWith(Player)).toEqual([]);
 lab.dispose();
});

test('typed contact listener fires on entry, re-entry and can unsubscribe',()=>{
 const {lab,canvas}=labFixture();class Player extends lab.Component{}let entered=0;
 class Scene extends lab.Game{onCreate(){this.player=this.createObject('player');this.player.addComponent(new Player());this.player.addComponent(new lab.CircleCollider2D(10));this.sensor=this.createObject('sensor').addComponent(new lab.Trigger2D(40,40));this.off=this.sensor.onContactEnter(Player,other=>{expect(other).toBe(this.player);entered++;});}}
 lab.run(Scene,{canvas});const game=lab.current;expect(entered).toBe(1);game.step(.1);game.step(.1);expect(entered).toBe(1);
 game.player.setPosition(100,100);game.step(.1);game.player.setPosition(0,0);game.step(.1);expect(entered).toBe(2);
 game.off();game.player.setPosition(100,100);game.step(.1);game.player.setPosition(0,0);game.step(.1);expect(entered).toBe(2);lab.dispose();
});
