import {createGameLab} from './gameRuntime.js';
import {createAddons} from '../../shared/lab-game-v2/addons.js';
function scene(setup){
 const context=new Proxy({},{get:(target,key)=>target[key]??(()=>{})});vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockImplementation(()=>context);
 const lab=createGameLab({window,document,requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{},skipAssetLoading:true});const addon=createAddons(lab);
 class Scene extends lab.Game{onCreate(){setup(this,lab,addon);}}
 const game=new Scene();game.canvas=new lab.Canvas(document.createElement('canvas'));game.start();return {game,lab,addon,close(){game.dispose();lab.dispose();}};
}
function object(game,name,x,y,...parts){const o=game.createObject(name);o.setPosition(x,y);for(const part of parts)o.addComponent(part);return o;}
afterEach(()=>vi.restoreAllMocks());
test('factory survives serialization and exports the same ten public addon names',()=>{
 const state=scene(()=>{});try{const restored=new Function(`return (${createAddons.toString()});`)()(state.lab);expect(Object.keys(restored)).toEqual(['Steering2D','FollowTarget2D','FleeTarget2D','FlankTarget2D','ObstacleAvoidance2D','TopDownCharacterController2D','PlatformerCharacterController2D','KeyPressed','KeyDoublePressed','NoneOfKeysPressed']);}finally{state.close();}
});
test('follow normalizes movement, stops inside distance and rejects two active generators',()=>{
 let target,ai,player;const state=scene((g,l,a)=>{target=object(g,'Target',200,100);ai=new a.FollowTarget2D(target);ai.speed=60;player=object(g,'Follower',100,100,new l.CircleCollider2D(10),new l.CharacterController2D(),ai);});
 try{state.game.step(.1);expect(player.transform.x).toBeCloseTo(106);target.setPosition(110,100);state.game.step(.1);expect(player.transform.x).toBeCloseTo(106);player.addComponent(new state.addon.FleeTarget2D(target));expect(()=>state.game.step(.1)).toThrow(/Multiple/);}finally{state.close();}
});
test('inactive and foreign targets stop their follower',()=>{
 let target,player;const state=scene((g,l,a)=>{target=object(g,'Target',200,100);player=object(g,'Follower',100,100,new l.CircleCollider2D(10),new l.CharacterController2D(),new a.FollowTarget2D(target));});
 try{target.active=false;state.game.step(.1);expect(player.transform.x).toBe(100);const foreign=new state.lab.Game();player.getComponent(state.addon.FollowTarget2D).target=foreign.createObject('Foreign');state.game.step(.1);expect(player.transform.x).toBe(100);foreign.dispose();}finally{state.close();}
});
test('flee handles coincident centers without NaN and stops at the safe distance',()=>{
 let target,player;const state=scene((g,l,a)=>{target=object(g,'Target',100,100);player=object(g,'Flee',100,100,new l.CircleCollider2D(10),new l.CharacterController2D(),new a.FleeTarget2D(target));});
 try{state.game.step(.1);expect(player.transform.x).toBeCloseTo(110);target.setPosition(400,100);state.game.step(.1);expect(player.transform.x).toBeCloseTo(110);}finally{state.close();}
});
test('flank preserves Java radial/tangential signs in both directions',()=>{
 let ai;const state=scene((g,l,a)=>{const target=object(g,'Target',200,100);ai=new a.FlankTarget2D(target);object(g,'Flank',100,100,new l.CircleCollider2D(10),new l.CharacterController2D(),ai);});
 try{expect(ai.direction(100,0,100)).toEqual(new state.lab.Vector2(0,1));ai.clockwise=false;expect(ai.direction(100,0,100)).toEqual(new state.lab.Vector2(0,-1));expect(ai.direction(0,0,0)).toEqual(new state.lab.Vector2(1,0));}finally{state.close();}
});
test('avoidance uses the spatial query and ignores trigger obstacles',()=>{
 let avoidance,trigger;const state=scene((g,l,a)=>{avoidance=new a.ObstacleAvoidance2D();object(g,'Mover',100,100,new l.CircleCollider2D(10),avoidance);trigger=new l.Trigger2D(20,20);object(g,'Sensor',120,100,trigger);object(g,'Wall',140,100,new l.Collider2D(20,20));});
 try{const query=vi.spyOn(state.game.physics,'queryRadius');expect(avoidance.steer(1,0)).toEqual(new state.lab.Vector2(1,-2));expect(query).toHaveBeenCalledWith(100,100,98,0x7fffffff);state.game.find('Wall').destroy();expect(avoidance.steer(1,0)).toEqual(new state.lab.Vector2(1,0));expect(avoidance.steer(0,0)).toEqual(new state.lab.Vector2());}finally{state.close();}
});
test('top down walking/running normalizes and flips sprites with no keyboard dependency',()=>{
 let c,s;const state=scene((g,l,a)=>{c=new a.TopDownCharacterController2D();s=new l.Sprite(l.Assets.PLAYER01,32,32);object(g,'Player',100,100,new l.CircleCollider2D(10),s,c);});
 try{c.walk(1,1);expect(Math.hypot(c.velocity.x,c.velocity.y)).toBeCloseTo(120);expect(c.isWalk()).toBe(true);c.run(-1,0);expect(c.velocity.x).toBe(-240);expect(c.isRunning()).toBe(true);expect(s.flipX).toBe(true);c.setRunning(false);expect(c.velocity.x).toBe(-120);expect(c.isWalk()).toBe(true);c.stop();expect(c.isWalk()).toBe(false);expect(c.isRunning()).toBe(false);}finally{state.close();}
});
test('platformer lands, allows one jump, and resets vertical speed on a ceiling',()=>{
 let c,p;const state=scene((g,l,a)=>{c=new a.PlatformerCharacterController2D();p=object(g,'Player',100,90,new l.Collider2D(20,20),c);object(g,'Ground',100,110,new l.Collider2D(200,20));object(g,'Ceiling',100,30,new l.Collider2D(200,20));});
 try{expect(c.isGrounded()).toBe(true);expect(c.jump()).toBe(true);expect(c.jump()).toBe(false);state.game.step(.1);expect(p.transform.y).toBeCloseTo(65);state.game.step(.1);expect(p.transform.y).toBeCloseTo(50);expect(c.velocity.y).toBe(0);for(let i=0;i<20;i++)state.game.step(.1);expect(c.isGrounded()).toBe(true);expect(p.transform.y).toBeCloseTo(90);expect(c.velocity.y).toBe(0);}finally{state.close();}
});
test('bindings use the scene input, ignore OS repeats, clone key arrays and reset double pairs',()=>{
 let pressed=0,double=0,idle=0;const keys=['W','D'];const state=scene((g,l,a)=>object(g,'Bindings',0,0,new a.KeyPressed('W',()=>pressed++),new a.KeyDoublePressed('W',()=>double++),new a.NoneOfKeysPressed(keys,()=>idle++)));keys[0]='Q';
 try{state.game.input.setKey('w',true);state.game.step(.1);state.game.input.setKey('W',true);state.game.step(.1);expect(pressed).toBe(1);expect(double).toBe(0);expect(idle).toBe(0);state.game.input.setKey('W',false);state.game.step(.05);state.game.input.setKey('W',true);state.game.step(.05);expect(pressed).toBe(2);expect(double).toBe(1);state.game.input.setKey('W',false);state.game.step(.05);state.game.input.setKey('W',true);state.game.step(.05);expect(double).toBe(1);}finally{state.close();}
});
test('typed constructor and mutable parameter errors are explicit',()=>{
 const state=scene(()=>{});try{const a=state.addon;expect(()=>new a.KeyPressed('',()=>{})).toThrow();expect(()=>new a.KeyPressed('W',null)).toThrow();expect(()=>new a.NoneOfKeysPressed(['W',null],()=>{})).toThrow();expect(()=>new a.FollowTarget2D({})).toThrow();expect(()=>new a.Steering2D(null)).toThrow();const follow=new a.FollowTarget2D(null);follow.stopDistance=-1;expect(()=>follow.direction(1,0,1)).toThrow();const flank=new a.FlankTarget2D(null);flank.clockwise='yes';expect(()=>flank.direction(1,0,1)).toThrow();const double=new a.KeyDoublePressed('W',()=>{});double.maxDelaySeconds=NaN;expect(()=>double.onUpdate(.1)).toThrow();}finally{state.close();}
});
