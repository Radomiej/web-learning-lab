// Course source is deliberately separate from either editor's project adapter.
// A missing recipe remains visibly unfinished; it must never masquerade as a solution.
export function buildCourseProject(language, chapter, mode, solved = true) {
  if(!solved) {
    const solution=buildCourseProject(language,chapter,mode,true);
    const files={...solution.files};
    const extension=language==='java'?'java':'js';
    const entry=language==='java'?'GameMain.java':'game.js';
    if(chapter==='camera' && mode!=='independent') {
      files[entry]=files[entry].split('\n').filter(line=>!line.includes('.offsetX=')&&!line.includes('.offsetY=')&&!line.includes('.follow(player)')).join('\n');
      files[entry]=files[entry].replace(/(camera\.addComponent\(new (?:GameLab\.)?Camera2D\(\)\);)/,'$1\n// TODO: Ustaw kamerę zgodnie z poleceniem; ruch gracza jest już gotowy.');
      return {files,ready:solution.ready};
    }
    const targets={
      scene:[entry,'onCreate'],components:[`${mode==='independent'?'Lifetime':'Counter'}.${extension}`,'onUpdate'],
      time:[`${mode==='independent'?'DirectionMover':'Mover'}.${extension}`,'onUpdate'],input:[`${mode==='independent'?'ActionCounter':'PlayerController'}.${extension}`,'onUpdate'],
      graphics:[mode==='modified'?`FacingVisual.${extension}`:entry,mode==='modified'?'onUpdate':'onCreate'],collisions:[entry,'onCreate'],
      triggers:[`${mode==='independent'?'Chest':'Pickup'}.${extension}`,'onTrigger'],camera:[mode==='independent'?`CursorMarker.${extension}`:entry,mode==='independent'?'onUpdate':'onCreate'],
      'canvas-ui':[entry,mode==='guided'?'onCreate':'onDrawUI'],health:[`Health.${extension}`,'damage'],
      'enemy-ai':[`${mode==='independent'?'FleeAI':'EnemyAI'}.${extension}`,'onUpdate'],projectiles:[`ProjectileHit.${extension}`,'onTrigger'],weapons:[`Weapon.${extension}`,'onUpdate'],
      'loot-xp':[`${mode==='guided'?'LootOnDeath':'Experience'}.${extension}`,mode==='guided'?'onCreate':'add'],waves:[`WaveSpawner.${extension}`,'onUpdate'],
      pause:[`${mode==='modified'?'ResumeAfter':'PauseController'}.${extension}`,mode==='independent'?'request':'onUpdate'],upgrades:[`UpgradeController.${extension}`,'select'],
      'ui-flow':[`MenuView.${extension}`,'onLateUpdate'],feedback:[mode==='guided'?entry:`${mode==='modified'?'HitFeedback':'ReplaceTween'}.${extension}`,mode==='guided' || mode==='modified'?'onCreate':'onUpdate'],
      composition:[`${mode==='independent'?'Weapon':'EnemyFactory'}.${extension}`,mode==='independent'?'onUpdate':'create'],
      performance:[`${mode==='modified'?'Weapon':'LoadFixture'}.${extension}`,'onUpdate'],'run-state':[`RunController.${extension}`,'start'],
      portability:[`${mode==='guided'?'PlayerController':mode==='modified'?'Health':'RunController'}.${extension}`,mode==='guided'?'onUpdate':mode==='modified'?'damage':'start'],survivor:[`RunController.${extension}`,'start'],
    };
    const [file,method]=targets[chapter]??[entry,'onCreate'];
    const source=files[file];
    if(source) {
      const match=new RegExp(`\\b${method}\\s*\\([^)]*\\)\\s*\\{`).exec(source);
      if(match) {
        const begin=match.index+match[0].length;
        let depth=1,end=begin,quote='',escape=false;
        for(;end<source.length;end++) {
          const char=source[end];
          if(quote) {if(escape)escape=false;else if(char==='\\')escape=true;else if(char===quote)quote='';continue;}
          if(char==='"' || char==="'" || char==='`') {quote=char;continue;}
          if(char==='{')depth++;
          if(char==='}' && --depth===0)break;
        }
        const result=language==='java' && method==='damage'?'\nreturn false;':language==='java' && method==='create'?'\nreturn null;':'';
        files[file]=source.slice(0,begin)+'\n// TODO: '+chapter+' — '+method+'. Sprawdź kryteria zadania.\n'+result+source.slice(end);
      }
    }
    return {files,ready:solution.ready};
  }
  const java = language === 'java';
  const files = {};
  let setup = '', update = '', fields = '', draw = '';
  const declare = (type, name, expression) => `${java ? type : 'const'} ${name} = ${expression};`;
  const component = (name, jsBody, javaBody) => {
    files[`${name}.${java ? 'java' : 'js'}`] = java
      ? `public class ${name} extends Component {\n${javaBody}\n}\n`
      : `export default class ${name} extends GameLab.Component {\n${jsBody}\n}\n`;
  };
  const object = (name, x, y, components = []) => {
    const variable = name[0].toLowerCase() + name.slice(1);
    setup += `${declare('GameObject', variable, `createObject("${name}")`)}\n${variable}.setPosition(${x}, ${y});\n`;
    for (const value of components) setup += `${variable}.addComponent(new ${value});\n`;
    return variable;
  };
  const sprite = (asset, w=32, h=32) => `Sprite(Assets.${asset}, ${w}, ${h})`;
  const shape = (w,h,color) => `ShapeRenderer(${w}, ${h}, "${color}")`;
  const builtins = new Set(['Sprite','TileMap','ShapeRenderer','Camera2D','CharacterController2D','UITransform','CircleCollider2D','Button','ProgressBar','TextRenderer']);
  const get = (owner,type) => `${owner}.getComponent(${!java && builtins.has(type) ? 'GameLab.' : ''}${type}${java ? '.class' : ''})`;
  const movement = (speed=120, sprint=false) => component('PlayerController',
    `speed = ${speed}; facing = { x: 1, y: 0 };\nonUpdate(delta) {\n const input = this.game.input;\n const x = Number(input.isKeyDown("d") || input.isKeyDown("ArrowRight")) - Number(input.isKeyDown("a") || input.isKeyDown("ArrowLeft"));\n const y = Number(input.isKeyDown("s") || input.isKeyDown("ArrowDown")) - Number(input.isKeyDown("w") || input.isKeyDown("ArrowUp"));\n this.requireComponent(GameLab.CharacterController2D).move(x, y, ${sprint ? 'input.isKeyDown("Shift") ? this.speed * 2 : ' : ''}this.speed);\n if (x || y) this.facing = {x, y};\n}`,
    `public double speed = ${speed}; public Vector2 facing = new Vector2(1, 0);\n@Override public void onUpdate(double delta) {\n double x = (getGame().input.isKeyDown("d") || getGame().input.isKeyDown("ArrowRight") ? 1 : 0) - (getGame().input.isKeyDown("a") || getGame().input.isKeyDown("ArrowLeft") ? 1 : 0);\n double y = (getGame().input.isKeyDown("s") || getGame().input.isKeyDown("ArrowDown") ? 1 : 0) - (getGame().input.isKeyDown("w") || getGame().input.isKeyDown("ArrowUp") ? 1 : 0);\n requireComponent(CharacterController2D.class).move(x, y, ${sprint ? 'getGame().input.isKeyDown("Shift") ? speed * 2 : ' : ''}speed);\n if (x != 0 || y != 0) { facing.x = x; facing.y = y; }\n}`);
  const player = (x=100,y=100,speed=120,sprint=false,withCollider=true) => {
    movement(speed,sprint);
    return object('Player',x,y,[sprite('PLAYER01'),...(withCollider?['CircleCollider2D(12)']:[]),'CharacterController2D()','PlayerController()']);
  };
  const health = () => component('Health',
    `constructor(max=5,protection=0) { super(); this.maxHealth=max; this.currentHealth=max; this.invulnerabilityAfterHit=protection; this.invulnerability=0; this.dead=false; this.deathListeners=[]; this.damageListeners=[]; this.changedListeners=[]; }
onUpdate(delta) { this.invulnerability=Math.max(0,this.invulnerability-delta); }
damage(amount) { if(!Number.isInteger(amount) || amount<0)throw new Error("Obrażenia muszą być nieujemną liczbą całkowitą"); if(amount===0 || this.dead || this.invulnerability>1e-9)return false; this.currentHealth=Math.max(0,this.currentHealth-amount); this.invulnerability=this.invulnerabilityAfterHit; const died=this.currentHealth===0 && !this.dead;if(died)this.dead=true; for(const fn of [...this.damageListeners])fn(); for(const fn of [...this.changedListeners])fn(); if(died)for(const fn of [...this.deathListeners])fn(); return true; }
heal(amount) { if(!Number.isInteger(amount) || amount<0)throw new Error("Leczenie musi być nieujemną liczbą całkowitą"); if(this.dead || amount===0)return; const before=this.currentHealth;this.currentHealth=Math.min(this.maxHealth,this.currentHealth+amount);if(this.currentHealth!==before)for(const fn of [...this.changedListeners])fn(); }
onChanged(fn) { this.changedListeners.push(fn);return ()=>{this.changedListeners=this.changedListeners.filter(value=>value!==fn);}; }
onDeath(fn) { this.deathListeners.push(fn); return ()=>{this.deathListeners=this.deathListeners.filter(value=>value!==fn);}; }
onDamage(fn) { this.damageListeners.push(fn); return ()=>{this.damageListeners=this.damageListeners.filter(value=>value!==fn);}; }`,
    `public double maxHealth,currentHealth,invulnerabilityAfterHit,invulnerability=0; public boolean dead=false;
private final java.util.ArrayList<Runnable> deathListeners=new java.util.ArrayList<>(),damageListeners=new java.util.ArrayList<>(),changedListeners=new java.util.ArrayList<>();
public Health(double max,double protection) { maxHealth=max;currentHealth=max;invulnerabilityAfterHit=protection; }
@Override public void onUpdate(double delta) { invulnerability=Math.max(0,invulnerability-delta); }
public boolean damage(double amount) { if(!Double.isFinite(amount) || amount%1!=0 || amount<0)throw new IllegalArgumentException("Obrazenia musza byc nieujemna liczba calkowita"); if(amount==0 || dead || invulnerability>1e-9)return false; currentHealth=Math.max(0,currentHealth-amount); invulnerability=invulnerabilityAfterHit;boolean died=currentHealth==0&&!dead;if(died)dead=true;for(Runnable fn:new java.util.ArrayList<>(damageListeners))fn.run();for(Runnable fn:new java.util.ArrayList<>(changedListeners))fn.run();if(died)for(Runnable fn:new java.util.ArrayList<>(deathListeners))fn.run(); return true; }
public void heal(double amount) { if(!Double.isFinite(amount) || amount%1!=0 || amount<0)throw new IllegalArgumentException("Leczenie musi byc nieujemna liczba calkowita");if(dead || amount==0)return;double before=currentHealth;currentHealth=Math.min(maxHealth,currentHealth+amount);if(currentHealth!=before)for(Runnable fn:new java.util.ArrayList<>(changedListeners))fn.run(); }
public Runnable onChanged(Runnable fn) {changedListeners.add(fn);return ()->changedListeners.remove(fn);}
public Runnable onDeath(Runnable fn) { deathListeners.add(fn);return ()->deathListeners.remove(fn); }
public Runnable onDamage(Runnable fn) { damageListeners.add(fn);return ()->damageListeners.remove(fn); }`);
  const projectile = () => {
    component('ProjectileHit','constructor(owner,damage=1) {super();this.owner=owner;this.damage=damage;this.spent=false;} onTrigger(other) { if(this.spent || other===this.owner)return;const hp=other.getComponent(Health),collider=other.getComponent(GameLab.Collider2D);if(!hp || !collider || !(collider.layer&2))return;this.spent=true;hp.damage(this.damage);this.gameObject.destroy(); }','public GameObject owner;public double damage;private boolean spent=false;public ProjectileHit(GameObject owner,double damage) {this.owner=owner;this.damage=damage;} @Override public void onTrigger(GameObject other) {if(spent || other==owner)return;Health hp=other.getComponent(Health.class);Collider2D collider=other.getComponent(Collider2D.class);if(hp==null || collider==null || (collider.layer&2)==0)return;spent=true;hp.damage(damage);gameObject.destroy();}');
    component('ProjectileMotion','constructor(x,y,speed,lifetime) {super();const n=Math.hypot(x,y);this.dx=n?x/n:0;this.dy=n?y/n:0;this.speed=speed;this.remaining=lifetime;} onUpdate(delta) {const dt=Math.min(delta,this.remaining);this.transform.x+=this.dx*this.speed*dt;this.transform.y+=this.dy*this.speed*dt;this.remaining-=delta;if(this.remaining<=0)this.gameObject.destroy();}','public double dx,dy,speed,remaining;public ProjectileMotion(double x,double y,double speed,double lifetime) {double n=Math.hypot(x,y);dx=n==0?0:x/n;dy=n==0?0:y/n;this.speed=speed;remaining=lifetime;} @Override public void onUpdate(double delta) {double dt=Math.min(delta,remaining);transform.x+=dx*speed*dt;transform.y+=dy*speed*dt;remaining-=delta;if(remaining<=0)gameObject.destroy();}');
  };
  const weapon = (automatic = true, cooldown = 0.5, range = 200) => {
    projectile();health();
    component('Weapon',`cooldown=${cooldown}; damage=1; projectileSpeed=320; lifetime=2; range=${range}; timer=${automatic?cooldown:0}; evaluations=0; onUpdate(delta) { this.timer=Math.max(0,this.timer-delta); if(this.timer>1e-9)return; ${automatic?'':'if(!this.game.input.isKeyPressed("Space"))return;'} let target=null,best=Infinity; ${automatic?`for(const candidate of this.game.physics.queryRadius(this.transform.x,this.transform.y,this.range,2)) {const hp=candidate.getComponent(Health);if(!hp || hp.dead)continue;this.evaluations++;const dx=candidate.transform.x-this.transform.x,dy=candidate.transform.y-this.transform.y,d=dx*dx+dy*dy;if(d<best || (d===best && (!target || candidate.id<target.id))) {target=candidate;best=d;}} if(!target)return;`:''} const facing=this.getComponent(PlayerController)?.facing || {x:1,y:0}; const dx=target?target.transform.x-this.transform.x:facing.x,dy=target?target.transform.y-this.transform.y:facing.y; const shot=this.game.createObject("Projectile");shot.setPosition(this.transform.x,this.transform.y);shot.addComponent(new GameLab.Sprite(GameLab.Assets.FIREBALL,8,8));const motion=shot.addComponent(new GameLab.Projectile2D(dx,dy,this.projectileSpeed,this.lifetime,this.gameObject));motion.hitLayers=2;shot.addComponent(new ProjectileHit(this.gameObject,this.damage));this.timer=this.cooldown; }`,
    `public double cooldown=${cooldown},damage=1,projectileSpeed=320,lifetime=2,range=${range},timer=${automatic?cooldown:0};public int evaluations=0; @Override public void onUpdate(double delta) {timer=Math.max(0,timer-delta);if(timer>1e-9)return;${automatic?'':'if(!getGame().input.isKeyPressed("Space"))return;'} GameObject target=null;double best=Double.POSITIVE_INFINITY;${automatic?`for(GameObject candidate:getGame().physics.queryRadius(transform.x,transform.y,range,2)) {Health hp=candidate.getComponent(Health.class);if(hp==null || hp.dead)continue;evaluations++;double dx=candidate.transform.x-transform.x,dy=candidate.transform.y-transform.y,d=dx*dx+dy*dy;if(d<best || (d==best && (target==null || candidate.id<target.id))) {target=candidate;best=d;}} if(target==null)return;`:''} PlayerController controller=getComponent(PlayerController.class);Vector2 facing=controller==null?new Vector2(1,0):controller.facing;double dx=target==null?facing.x:target.transform.x-transform.x,dy=target==null?facing.y:target.transform.y-transform.y;GameObject shot=getGame().createObject("Projectile");shot.setPosition(transform.x,transform.y);shot.addComponent(new Sprite(Assets.FIREBALL,8,8));Projectile2D motion=shot.addComponent(new Projectile2D(dx,dy,projectileSpeed,lifetime,gameObject));motion.hitLayers=2;shot.addComponent(new ProjectileHit(gameObject,damage));timer=cooldown;}`);
  };
  const experience = () => { component('XpOrb','constructor(value) {super();this.value=value;}','public int value;public XpOrb(int value) {this.value=value;}');component('Experience','level=1;xp=0;pendingChoices=0; add(value) {if(value<=0)return;this.xp+=value;while(this.xp>=5*this.level) {this.xp-=5*this.level;this.level++;this.pendingChoices++;}} onTrigger(other) {const orb=other.getComponent(XpOrb);if(orb && !other.destroyed) {this.add(orb.value);other.destroy();}}','public int level=1,xp=0,pendingChoices=0;public void add(int value) {if(value<=0)return;xp+=value;while(xp>=5*level) {xp-=5*level;level++;pendingChoices++;}} @Override public void onTrigger(GameObject other) {XpOrb orb=other.getComponent(XpOrb.class);if(orb!=null && !other.destroyed) {add(orb.value);other.destroy();}}'); };
  const pauseController = () => component('PauseController','constructor() {super();this.updateMode="UI";this.reasons=new Set();} request(reason) {this.reasons.add(reason);this.game.pause();} release(reason) {this.reasons.delete(reason);if(!this.reasons.size)this.game.resume();} onUpdate() {if(this.game.input.isKeyPressed("Escape")) {if(this.reasons.has("manual"))this.release("manual");else this.request("manual");this.game.input.consumeKey("Escape");}}','private final java.util.HashSet<String> reasons=new java.util.HashSet<>();public PauseController() {updateMode="UI";} public void request(String reason) {reasons.add(reason);getGame().pause();} public void release(String reason) {reasons.remove(reason);if(reasons.isEmpty())getGame().resume();} @Override public void onUpdate(double delta) {if(getGame().input.isKeyPressed("Escape")) {if(reasons.contains("manual"))release("manual");else request("manual");getGame().input.consumeKey("Escape");}}');
  const upgrades = (all=true,shop=false) => {
    movement();weapon();experience();pauseController();
    component('Wallet','gold=0;','public int gold=0;');
    component('UpgradeController',`constructor() {super();this.updateMode="UI";this.opened=false;this.shop=false;} apply(choice) {const speed=this.requireComponent(PlayerController),weapon=this.requireComponent(Weapon);if(choice===1)speed.speed+=30;${all?'else if(choice===2)for(const value of this.gameObject.getComponents(Weapon))value.damage++;else if(choice===3)weapon.cooldown=Math.max(0.1,weapon.cooldown*0.8);':''}} select(choice) {if(!this.opened || choice<1 || choice>3)return;const xp=this.requireComponent(Experience),wallet=this.requireComponent(Wallet);if(this.shop) {if(wallet.gold<20)return;wallet.gold-=20;this.apply(2);}else {if(xp.pendingChoices<=0)return;xp.pendingChoices--;this.apply(choice);}this.opened=!this.shop && xp.pendingChoices>0;if(!this.opened)this.requireComponent(PauseController).release("upgrade");} onUpdate() {const xp=this.requireComponent(Experience);if(xp.pendingChoices>0 && !this.opened) {this.opened=true;this.shop=false;this.requireComponent(PauseController).request("upgrade");} ${shop?'if(this.game.input.isKeyPressed("e") && !this.opened) {this.shop=true;this.opened=true;this.requireComponent(PauseController).request("upgrade");}':''}if(this.opened)for(let choice=1;choice<=${all?3:1};choice++)if(this.game.input.isKeyPressed(String(choice))) {this.select(choice);this.game.input.consumeKey(String(choice));break;}}`,
    `public boolean opened=false,shop=false;public UpgradeController() {updateMode="UI";} public void apply(int choice) {PlayerController speed=requireComponent(PlayerController.class);Weapon weapon=requireComponent(Weapon.class);if(choice==1)speed.speed+=30;${all?'else if(choice==2)for(Weapon value:gameObject.getComponents(Weapon.class))value.damage++;else if(choice==3)weapon.cooldown=Math.max(0.1,weapon.cooldown*0.8);':''}} public void select(int choice) {if(!opened || choice<1 || choice>3)return;Experience xp=requireComponent(Experience.class);Wallet wallet=requireComponent(Wallet.class);if(shop) {if(wallet.gold<20)return;wallet.gold-=20;apply(2);}else {if(xp.pendingChoices<=0)return;xp.pendingChoices--;apply(choice);}opened=!shop && xp.pendingChoices>0;if(!opened)requireComponent(PauseController.class).release("upgrade");} @Override public void onUpdate(double delta) {Experience xp=requireComponent(Experience.class);if(xp.pendingChoices>0 && !opened) {opened=true;shop=false;requireComponent(PauseController.class).request("upgrade");}${shop?'if(getGame().input.isKeyPressed("e") && !opened) {shop=true;opened=true;requireComponent(PauseController.class).request("upgrade");}':''}if(opened)for(int choice=1;choice<=${all?3:1};choice++)if(getGame().input.isKeyPressed(String.valueOf(choice))) {select(choice);getGame().input.consumeKey(String.valueOf(choice));break;}}`);
    player();setup+='player.addComponent(new CircleCollider2D(12));\nplayer.addComponent(new Health(5,0.75));\nplayer.addComponent(new Weapon());\nplayer.addComponent(new Wallet());\nplayer.addComponent(new Experience());\nplayer.addComponent(new PauseController());\nplayer.addComponent(new UpgradeController());\n';
  };
  const enemyFactory = () => {
    health();
    component('EnemyAI','constructor(target,speed) {super();this.target=target;this.speed=speed;} onUpdate() {if(!this.target || this.target.destroyed)return;this.requireComponent(GameLab.CharacterController2D).move(this.target.transform.x-this.transform.x,this.target.transform.y-this.transform.y,this.speed);}','public GameObject target;public double speed;public EnemyAI(GameObject target,double speed) {this.target=target;this.speed=speed;} @Override public void onUpdate(double delta) {if(target==null || target.destroyed)return;requireComponent(CharacterController2D.class).move(target.transform.x-transform.x,target.transform.y-transform.y,speed);}');
    component('XpOrb','constructor(value) {super();this.value=value;}','public int value;public XpOrb(int value) {this.value=value;}');
    component('RunStats','kills=0;','public int kills=0;');
    component('LootOnDeath','onCreate() {this.unsubscribe=this.requireComponent(Health).onDeath(()=>{const player=this.game.find("Player");const stats=player?.getComponent(RunStats);if(stats)stats.kills++;const orb=this.game.createObject("XpOrb");orb.setPosition(this.transform.x,this.transform.y);orb.addComponent(new GameLab.Sprite(GameLab.Assets.GEM,16,16));orb.addComponent(new GameLab.Trigger2D(20,20));orb.addComponent(new XpOrb(1));this.gameObject.destroy();});} onDestroy() {this.unsubscribe?.();}','private Runnable unsubscribe;@Override public void onCreate() {unsubscribe=requireComponent(Health.class).onDeath(()->{GameObject player=getGame().find("Player");RunStats stats=player==null?null:player.getComponent(RunStats.class);if(stats!=null)stats.kills++;GameObject orb=getGame().createObject("XpOrb");orb.setPosition(transform.x,transform.y);orb.addComponent(new Sprite(Assets.GEM,16,16));orb.addComponent(new Trigger2D(20,20));orb.addComponent(new XpOrb(1));gameObject.destroy();});} @Override public void onDestroy() {if(unsubscribe!=null)unsubscribe.run();}');
    files[`EnemySpec.${java?'java':'js'}`]=java?'public class EnemySpec {public String name;public Assets asset;public double hp,speed,radius;public EnemySpec(String name,Assets asset,double hp,double speed,double radius) {this.name=name;this.asset=asset;this.hp=hp;this.speed=speed;this.radius=radius;}}':'export default class EnemySpec {constructor(name,asset,hp,speed,radius) {Object.assign(this,{name,asset,hp,speed,radius});}}';
    component('EnemyFactory','constructor(target) {super();this.target=target;} create(spec,x,y) {const enemy=this.game.createObject(spec.name);enemy.setPosition(x,y);enemy.addComponent(new GameLab.Sprite(spec.asset,32,32));const collider=enemy.addComponent(new GameLab.CircleCollider2D(spec.radius));collider.layer=2;enemy.addComponent(new GameLab.CharacterController2D());enemy.addComponent(new Health(spec.hp,0));enemy.addComponent(new EnemyAI(this.target,spec.speed));enemy.addComponent(new LootOnDeath());return enemy;}','private GameObject target;public EnemyFactory(GameObject target) {this.target=target;} public GameObject create(EnemySpec spec,double x,double y) {GameObject enemy=getGame().createObject(spec.name);enemy.setPosition(x,y);enemy.addComponent(new Sprite(spec.asset,32,32));CircleCollider2D collider=enemy.addComponent(new CircleCollider2D(spec.radius));collider.layer=2;enemy.addComponent(new CharacterController2D());enemy.addComponent(new Health(spec.hp,0));enemy.addComponent(new EnemyAI(target,spec.speed));enemy.addComponent(new LootOnDeath());return enemy;}');
  };
  const runScene = (survivor = false) => {
    upgrades(true,survivor && mode==='independent');enemyFactory();setup='';
    component('RunHud',`constructor() {super();this.updateMode="UI";this.buttons=[];this.wasOpen=false;} onCreate() {for(const [name,y] of [["HealthBar",12],["XpBar",38],["LevelText",64]]) {const object=this.game.createObject(name);object.setPosition(12,y);const ui=object.addComponent(new GameLab.UITransform(200,18));ui.anchor="TOP_LEFT";if(name==="LevelText")object.addComponent(new GameLab.TextRenderer("Poziom: 1",18,"#ffffff"));else object.addComponent(new GameLab.ProgressBar(200,18));}for(let i=0;i<3;i++) {const object=this.game.createObject("UpgradeButton"+i);object.setPosition(0,(i-1)*54);object.addComponent(new GameLab.UITransform(280,44));const button=object.addComponent(new GameLab.Button(280,44));button.text=["Szybkość","Obrażenia","Tempo"][i];button.onClick=()=>this.requireComponent(UpgradeController).select(i+1);object.active=false;this.buttons.push(button);}} onLateUpdate() {const hp=this.requireComponent(Health),xp=this.requireComponent(Experience),menu=this.requireComponent(UpgradeController);this.game.find("HealthBar").getComponent(GameLab.ProgressBar).setValue(hp.currentHealth,hp.maxHealth);this.game.find("XpBar").getComponent(GameLab.ProgressBar).setValue(xp.xp,5*xp.level);this.game.find("LevelText").getComponent(GameLab.TextRenderer).text="Poziom: "+xp.level;for(let i=0;i<3;i++) {const button=this.buttons[i];button.gameObject.active=menu.opened && (!menu.shop || i===1);button.width=Math.min(280,this.game.getViewportWidth()-32);button.getComponent(GameLab.UITransform).width=button.width;if(!menu.opened)button.blur();}if(menu.opened&&!this.wasOpen)this.buttons[menu.shop?1:0].focus();this.wasOpen=menu.opened;}`,
    `private final java.util.ArrayList<Button> buttons=new java.util.ArrayList<>();private boolean wasOpen=false;public RunHud() {updateMode="UI";} @Override public void onCreate() {String[] names={"HealthBar","XpBar","LevelText"};for(int i=0;i<3;i++) {GameObject object=getGame().createObject(names[i]);object.setPosition(12,12+26*i);UITransform ui=object.addComponent(new UITransform(200,18));ui.anchor="TOP_LEFT";if(i==2)object.addComponent(new TextRenderer("Poziom: 1",18,"#ffffff"));else object.addComponent(new ProgressBar(200,18));}for(int i=0;i<3;i++) {final int choice=i+1;GameObject object=getGame().createObject("UpgradeButton"+i);object.setPosition(0,(i-1)*54);object.addComponent(new UITransform(280,44));Button button=object.addComponent(new Button(280,44));button.text=new String[]{"Szybkość","Obrażenia","Tempo"}[i];button.onClick=()->requireComponent(UpgradeController.class).select(choice);object.active=false;buttons.add(button);}} @Override public void onLateUpdate(double delta) {Health hp=requireComponent(Health.class);Experience xp=requireComponent(Experience.class);UpgradeController menu=requireComponent(UpgradeController.class);getGame().find("HealthBar").getComponent(ProgressBar.class).setValue(hp.currentHealth,hp.maxHealth);getGame().find("XpBar").getComponent(ProgressBar.class).setValue(xp.xp,5*xp.level);getGame().find("LevelText").getComponent(TextRenderer.class).text="Poziom: "+xp.level;for(int i=0;i<3;i++) {Button button=buttons.get(i);button.gameObject.active=menu.opened&&(!menu.shop||i==1);button.width=Math.min(280,getGame().getViewportWidth()-32);button.getComponent(UITransform.class).width=button.width;if(!menu.opened)button.blur();}if(menu.opened&&!wasOpen)buttons.get(menu.shop?1:0).focus();wasOpen=menu.opened;}`);
    component('ContactDamage','onCollision(other) {const hp=other.getComponent(Health);if(hp)hp.damage(1);}','@Override public void onCollision(GameObject other) {Health hp=other.getComponent(Health.class);if(hp!=null)hp.damage(1);}');
    component('RunClock','elapsed=0;onUpdate(delta) {this.elapsed+=delta;}','public double elapsed=0;@Override public void onUpdate(double delta) {elapsed+=delta;}');
    const advanced=survivor && mode!=='guided';
    component('SurvivorSpawner',`elapsed=0;next=1.5;wave=0;random=new GameLab.Random(42);onUpdate(delta) {this.elapsed+=delta;const intervals=[1.5,1,0.75,0.5];while(this.next<=this.elapsed+1e-9) {${advanced?'if(this.wave<3 && this.next>=30*(this.wave+1)-1e-9) {this.wave++;this.next=this.wave*30+intervals[this.wave];continue;}':''}this.next+=intervals[this.wave];const player=this.game.find("Player");if(!player)return;if(this.game.getObjects().filter(o=>o.getComponent(EnemyAI)).length>=200)continue;const angle=this.random.next()*Math.PI*2;const type=Math.floor(this.random.next()*(this.wave>=2?3:this.wave>=1?2:1));const spec=type===0?new EnemySpec("Slime",GameLab.Assets.SLIME,2,40,12):type===1?new EnemySpec("Bat",GameLab.Assets.BAT,1,65,10):new EnemySpec("Ghost",GameLab.Assets.GHOST,3,35,12);const radius=0.5*Math.hypot(this.game.getViewportWidth(),this.game.getViewportHeight())+40;const enemy=player.getComponent(EnemyFactory).create(spec,player.transform.x+Math.cos(angle)*radius,player.transform.y+Math.sin(angle)*radius);enemy.addComponent(new ContactDamage());}}`,
    `public double elapsed=0;private double next=1.5;public int wave=0;private Random random=new Random(42);@Override public void onUpdate(double delta) {elapsed+=delta;double[] intervals={1.5,1,.75,.5};while(next<=elapsed+1e-9) {${advanced?'if(wave<3 && next>=30*(wave+1)-1e-9) {wave++;next=wave*30+intervals[wave];continue;}':''}next+=intervals[wave];GameObject player=getGame().find("Player");if(player==null)return;if(getGame().getObjects().stream().filter(o->o.hasComponent(EnemyAI.class)).count()>=200)continue;double angle=random.next()*Math.PI*2;int type=(int)(random.next()*(wave>=2?3:wave>=1?2:1));EnemySpec spec=type==0?new EnemySpec("Slime",Assets.SLIME,2,40,12):type==1?new EnemySpec("Bat",Assets.BAT,1,65,10):new EnemySpec("Ghost",Assets.GHOST,3,35,12);double radius=.5*Math.hypot(getGame().getViewportWidth(),getGame().getViewportHeight())+40;GameObject enemy=player.getComponent(EnemyFactory.class).create(spec,player.transform.x+Math.cos(angle)*radius,player.transform.y+Math.sin(angle)*radius);enemy.addComponent(new ContactDamage());}}`);
    const extraJs=survivor && mode==='independent'?'const orb=p.addComponent(new Weapon());orb.cooldown=1;orb.timer=1;orb.damage=2;orb.projectileSpeed=220;orb.lifetime=3;orb.range=240;const chest=this.game.createObject("Chest");chest.setPosition(420,180);chest.addComponent(new GameLab.Sprite(GameLab.Assets.CHEST,32,32));chest.addComponent(new GameLab.Trigger2D(24,24));chest.addComponent(new ShopChest());':'';
    const extraJava=survivor && mode==='independent'?'Weapon orb=p.addComponent(new Weapon());orb.cooldown=1;orb.timer=1;orb.damage=2;orb.projectileSpeed=220;orb.lifetime=3;orb.range=240;GameObject chest=getGame().createObject("Chest");chest.setPosition(420,180);chest.addComponent(new Sprite(Assets.CHEST,32,32));chest.addComponent(new Trigger2D(24,24));chest.addComponent(new ShopChest());':'';
    if(survivor && mode==='independent')component('ShopChest','opened=false;onTrigger(other) {const wallet=other.getComponent(Wallet),menu=other.getComponent(UpgradeController);if(this.opened || !wallet || !menu)return;this.opened=true;wallet.gold+=20;menu.shop=true;menu.opened=true;other.getComponent(PauseController).request("upgrade");}','public boolean opened=false;@Override public void onTrigger(GameObject other) {Wallet wallet=other.getComponent(Wallet.class);UpgradeController menu=other.getComponent(UpgradeController.class);if(opened || wallet==null || menu==null)return;opened=true;wallet.gold+=20;menu.shop=true;menu.opened=true;other.getComponent(PauseController.class).request("upgrade");}');
    const lost=survivor || mode!=='guided',win=survivor && mode!=='guided' || !survivor && mode==='independent';
    component('RunController',`constructor() {super();this.updateMode="UI";this.state="READY";this.player=null;this.unsubscribe=null;} start() {if(this.state==="RUNNING")return;this.game.time.elapsed=0;if(this.unsubscribe)this.unsubscribe();for(const object of this.game.getObjects())if(object!==this.gameObject && object.name!=="StartButton")object.destroy();this.game.resume();this.game.setWorldBounds(0,0,2000,1200);const ground=this.game.createObject("Ground");ground.addComponent(new GameLab.TileMap(GameLab.Assets.GRASS,32));const p=this.game.createObject("Player");p.setPosition(320,180);p.addComponent(new GameLab.Sprite(GameLab.Assets.PLAYER01,32,32));p.addComponent(new GameLab.CircleCollider2D(12));p.addComponent(new GameLab.CharacterController2D());p.addComponent(new PlayerController());const hp=p.addComponent(new Health(5,0.75));p.addComponent(new Weapon());p.getComponent(Weapon).range=240;p.addComponent(new Experience());p.addComponent(new Wallet());p.addComponent(new PauseController());p.addComponent(new UpgradeController());p.addComponent(new RunStats());p.addComponent(new RunClock());p.addComponent(new EnemyFactory(p));p.addComponent(new SurvivorSpawner());const camera=this.game.createObject("Camera");camera.addComponent(new GameLab.Camera2D()).follow(p);this.player=p;this.state="RUNNING";${lost?'this.unsubscribe=hp.onDeath(()=>{this.state="LOST";this.game.pause();});':''}${extraJs}} onUpdate() {if(this.game.input.isKeyPressed("Enter") && this.state!=="RUNNING") {this.start();this.game.input.consumeKey("Enter");}} onLateUpdate() {${win?'if(this.state==="RUNNING" && !this.player.getComponent(Health).dead && this.player.getComponent(RunClock).elapsed>=120) {this.state="WON";this.game.pause();}':''} const button=this.game.find("StartButton");if(button) {button.setActive(this.state!=="RUNNING");button.getComponent(GameLab.Button).text=this.state==="READY"?"Start":"Restart";} } onDestroy() {this.unsubscribe?.();} onDrawUI() {if(this.state==="READY")this.game.canvas.drawText("WASD: ruch; Enter: Start",320,100);if(this.state==="LOST" || this.state==="WON") {const xp=this.player.getComponent(Experience),stats=this.player.getComponent(RunStats),clock=this.player.getComponent(RunClock);this.game.canvas.drawText(this.state+"  Czas: "+clock.elapsed.toFixed(1)+"  Poziom: "+xp.level+"  Pokonani: "+stats.kills,320,100);}const menu=this.player?.getComponent(UpgradeController);if(menu?.opened)this.game.canvas.drawText("1 Szybkość  2 Obrażenia  3 Tempo",320,150);}`,
    `public String state="READY";public GameObject player;private Runnable unsubscribe;public RunController() {updateMode="UI";} public void start() {if(state.equals("RUNNING"))return;getGame().time.elapsed=0;if(unsubscribe!=null)unsubscribe.run();for(GameObject object:getGame().getObjects())if(object!=gameObject&&!object.name.equals("StartButton"))object.destroy();getGame().resume();getGame().setWorldBounds(0,0,2000,1200);GameObject ground=getGame().createObject("Ground");ground.addComponent(new TileMap(Assets.GRASS,32));GameObject p=getGame().createObject("Player");p.setPosition(320,180);p.addComponent(new Sprite(Assets.PLAYER01,32,32));p.addComponent(new CircleCollider2D(12));p.addComponent(new CharacterController2D());p.addComponent(new PlayerController());Health hp=p.addComponent(new Health(5,.75));p.addComponent(new Weapon());p.getComponent(Weapon.class).range=240;p.addComponent(new Experience());p.addComponent(new Wallet());p.addComponent(new PauseController());p.addComponent(new UpgradeController());p.addComponent(new RunStats());p.addComponent(new RunClock());p.addComponent(new EnemyFactory(p));p.addComponent(new SurvivorSpawner());GameObject camera=getGame().createObject("Camera");camera.addComponent(new Camera2D()).follow(p);player=p;state="RUNNING";${lost?'unsubscribe=hp.onDeath(()->{state="LOST";getGame().pause();});':''}${extraJava}} @Override public void onUpdate(double delta) {if(getGame().input.isKeyPressed("Enter")&&!state.equals("RUNNING")) {start();getGame().input.consumeKey("Enter");}} @Override public void onLateUpdate(double delta) {${win?'if(state.equals("RUNNING")&&!player.getComponent(Health.class).dead&&player.getComponent(RunClock.class).elapsed>=120) {state="WON";getGame().pause();}':''}GameObject button=getGame().find("StartButton");if(button!=null) {button.setActive(!state.equals("RUNNING"));button.getComponent(Button.class).text=state.equals("READY")?"Start":"Restart";}} @Override public void onDestroy() {if(unsubscribe!=null)unsubscribe.run();} @Override public void onDrawUI() {if(state.equals("READY"))getGame().canvas.drawText("WASD: ruch; Enter: Start",320,100);if(state.equals("LOST")||state.equals("WON")) {Experience xp=player.getComponent(Experience.class);RunStats stats=player.getComponent(RunStats.class);RunClock clock=player.getComponent(RunClock.class);getGame().canvas.drawText(state+" Czas: "+clock.elapsed+" Poziom: "+xp.level+" Pokonani: "+stats.kills,320,100);}UpgradeController menu=player==null?null:player.getComponent(UpgradeController.class);if(menu!=null&&menu.opened)getGame().canvas.drawText("1 Szybkość  2 Obrażenia  3 Tempo",320,150);}`);
    files[`RunController.${java?'java':'js'}`]=files[`RunController.${java?'java':'js'}`].replace('p.addComponent(new RunStats());','p.addComponent(new RunStats());p.addComponent(new RunHud());');
    object('Run',0,0,['RunController()']);object('StartButton',0,0,['UITransform(160,44)','Button(160,44)']);setup+=`${get('startButton','Button')}.text="Start";\n${get('startButton','Button')}.onClick=${java?'()->':'()=>'}${get('run','RunController')}.start();\n${java?'':'this.'}pause();\n`;
    if(survivor)files['README.md']='Sterowanie: WASD/strzałki, Escape pauza, 1/2/3 wybór ulepszenia, Enter start, Restart po zakończeniu. Balans: Orb zadaje 2 obrażenia co sekundę; dwa niezależne cooldowny zwiększają przewidywalność ataku.';
  };
  let ready = true;
  switch (chapter) {
    case 'scene':
      if (mode === 'guided') object('Player',80,90,[shape(40,30,'#76b9f2')]);
      else if (mode === 'modified') { object('PlatformA',120,180,[shape(100,20,'#70c994')]); const b=object('PlatformB',300,120,[shape(80,20,'#ffd166')]); setup += `${b}.transform.x += 40;\n`; }
      else { object('Player',100,100,[sprite('PLAYER01')]); object('Enemy',280,100,[sprite('SLIME')]); object('Coin',180,180,[sprite('COIN',16,16)]); }
      break;
    case 'components':
      if (mode === 'independent') {
        fields = java ? 'public int cleanup = 0;' : 'cleanup = 0;';
        component('Lifetime','remaining = 0.3; onUpdate(delta) { this.remaining -= delta; if (this.remaining <= 1e-9) this.gameObject.destroy(); } onDestroy() { this.game.cleanup++; }','public double remaining = 0.3; @Override public void onUpdate(double delta) { remaining -= delta; if (remaining <= 1e-9) gameObject.destroy(); } @Override public void onDestroy() { ((GameMain)getGame()).cleanup++; }');
        object('Spark',100,100,[sprite('FIREBALL',16,16),'Lifetime()']);
      } else {
        component('Counter','counts = 0; creates = 0; onCreate() { this.creates++; } onUpdate() { this.counts++; }','public int counts = 0, creates = 0; @Override public void onCreate() { creates++; } @Override public void onUpdate(double delta) { counts++; }');
        if (mode==='guided') object('Player',100,100,[sprite('PLAYER01'),'Counter()']);
        else { object('PlayerA',100,100,[sprite('PLAYER01'),'Counter()']); object('PlayerB',200,100,[sprite('PLAYER01'),'Counter()']); fields=java?'private int updates = 0;':'updates = 0;'; update=`if (++${java?'':'this.'}updates == 3) ${get(`${java?'':'this.'}find("PlayerB")`,'Counter')}.enabled = false;`; }
      }
      break;
    case 'time': {
      component('Mover', 'constructor(x=80,y=0) { super(); this.velocityX=x; this.velocityY=y; } onUpdate(delta) { this.transform.x += this.velocityX * delta; this.transform.y += this.velocityY * delta; }', 'public double velocityX, velocityY; public Mover(double x,double y) { velocityX=x; velocityY=y; } @Override public void onUpdate(double delta) { transform.x += velocityX * delta; transform.y += velocityY * delta; }');
      if (mode==='guided') object('MoverObject',100,80,[shape(32,32,'#76b9f2'),'Mover(80,0)']);
      else if (mode==='modified') { object('Drop',200,40,[shape(16,16,'#76b9f2'),'Mover(0,60)']); object('Spark',20,30,[shape(16,16,'#ffd166'),'Mover(-40,20)']); }
      else {
        component('DirectionMover','direction = {x:3,y:4}; speed = 100; onUpdate(delta) { const n=Math.hypot(this.direction.x,this.direction.y); if (!n) return; this.transform.x+=this.direction.x/n*this.speed*delta; this.transform.y+=this.direction.y/n*this.speed*delta; }','public Vector2 direction = new Vector2(3,4); public double speed=100; @Override public void onUpdate(double delta) { double n=Math.hypot(direction.x,direction.y); if(n==0)return; transform.x+=direction.x/n*speed*delta; transform.y+=direction.y/n*speed*delta; }');
        object('MoverObject',100,80,[shape(32,32,'#76b9f2'),'DirectionMover()']);
      }
      break;
    }
    case 'input':
      player(100,100,mode==='modified'?100:120,mode==='modified');
      if (mode==='independent') { component('ActionCounter','actions=0; onUpdate() { if(this.game.input.isKeyPressed("Space")) this.actions++; }','public int actions=0; @Override public void onUpdate(double delta) { if(getGame().input.isKeyPressed("Space")) actions++; }'); setup+='player.addComponent(new ActionCounter());\n'; }
      break;
    case 'graphics': {
      object('Ground',0,0,[`TileMap(Assets.${mode==='modified'?'SAND':'GRASS'}, ${mode==='modified'?48:32})`]);
      if(mode==='independent') { setup+=`${get('ground','TileMap')}.layer=-10;\n`; object('Path',320,180,[shape(400,32,'#d5b884')]); setup+=`${get('path','ShapeRenderer')}.layer=-5;\n`; }
      player();
      if(mode==='modified') {
        setup+=`${get('player','Sprite')}.texture=Assets.RANGER${java?'.key()':''};\n${get('player','Sprite')}.width=48;\n${get('player','Sprite')}.height=48;\n`;
        object('Wall',240,100,[shape(24,120,'#70c994'),'Collider2D(24,120)']);
      }
      if(mode==='modified') { component('FacingVisual','onUpdate() { const i=this.game.input; const x=Number(i.isKeyDown("d"))-Number(i.isKeyDown("a")); if(x) this.requireComponent(GameLab.Sprite).flipX=x<0; }','@Override public void onUpdate(double delta) { double x=(getGame().input.isKeyDown("d")?1:0)-(getGame().input.isKeyDown("a")?1:0); if(x!=0) requireComponent(Sprite.class).flipX=x<0; }'); setup+='player.addComponent(new FacingVisual());\n'; }
      if(mode==='independent') { object('Decoration',240,180,[sprite('COIN',16,16)]); setup+=`${get('decoration','Sprite')}.layer=5;\n`; }
      break;
    }
    case 'collisions':
      setup+='setWorldBounds(0,0,640,360);\n';
      player(mode==='independent'?230:100,mode==='independent'?100:180,120,false,false);
      setup+=`player.addComponent(new ${mode==='guided'?'Collider2D(32,32)':'CircleCollider2D(12)'});\n`;
      if(mode==='modified') setup+='player.transform.scale.set(2,2);\n';
      if(mode==='independent') { object('LeftWall',170,180,[shape(20,360,'#70c994'),'Collider2D(20,360)']); object('RightWall',290,180,[shape(20,360,'#70c994'),'Collider2D(20,360)']); }
      else { object('Wall',200,180,[shape(20,200,'#70c994'),'Collider2D(20,200)']); component('WalkRight','onUpdate() { this.requireComponent(GameLab.CharacterController2D).move(1,0,120); }','@Override public void onUpdate(double delta) { requireComponent(CharacterController2D.class).move(1,0,120); }'); setup+=`${get('player','PlayerController')}.enabled=false;\nplayer.addComponent(new WalkRight());\n`; }
      break;
    case 'camera':
      object('Ground',0,0,['TileMap(Assets.GRASS,32)']);
      if(mode==='modified') setup+='setWorldBounds(0,0,2000,1200);\n';
      player(mode==='modified'?400:100,mode==='modified'?300:mode==='independent'?200:100);
      object('Camera',mode==='independent'?60:80,mode==='independent'?150:40,['Camera2D()']);
      if(mode==='modified') setup+=`${get('camera','Camera2D')}.follow(player);\n`;
      else setup+=`${get('camera','Camera2D')}.offsetX=${mode==='independent'?60:80};\n${get('camera','Camera2D')}.offsetY=${mode==='independent'?150:40};\n`;
      if(mode==='independent') {
        component('CursorMarker','onUpdate() { const p=this.game.input.getPointerPosition(); if(!p)return; const camera=this.game.find("Camera").getComponent(GameLab.Camera2D); const world=camera.screenToWorld(p); this.gameObject.setPosition(world.x,world.y); }','@Override public void onUpdate(double delta) { Vector2 p=getGame().input.getPointerPosition(); if(p==null)return; Camera2D camera=getGame().find("Camera").getComponent(Camera2D.class); Vector2 world=camera.screenToWorld(p); gameObject.setPosition(world.x,world.y); }');
        object('Marker',0,0,[shape(8,8,'#ffd166'),'CursorMarker()']);
      }
      break;
    case 'triggers': {
      component('Wallet','gold=0;','public int gold=0;');
      player(); setup+='player.addComponent(new Wallet());\nplayer.addComponent(new CircleCollider2D(12));\n';
      if(mode==='independent') {
        component('Chest','opened=false; onTrigger(other) { const wallet=other.getComponent(Wallet); if(!wallet || this.opened)return; this.opened=true; wallet.gold+=20; this.requireComponent(GameLab.Sprite).flipX=true; }','public boolean opened=false; @Override public void onTrigger(GameObject other) { Wallet wallet=other.getComponent(Wallet.class); if(wallet==null || opened)return; opened=true;wallet.gold+=20;requireComponent(Sprite.class).flipX=true; }');
        object('Chest',160,100,[sprite('CHEST'),'Trigger2D(24,24)','Chest()']);
      } else {
        component('Pickup','constructor(value) { super();this.value=value;this.claimed=false; } onTrigger(other) { const wallet=other.getComponent(Wallet);if(!wallet || this.claimed)return;this.claimed=true;wallet.gold+=this.value;this.gameObject.destroy(); }','public int value;private boolean claimed=false;public Pickup(int value) {this.value=value;} @Override public void onTrigger(GameObject other) { Wallet wallet=other.getComponent(Wallet.class);if(wallet==null || claimed)return;claimed=true;wallet.gold+=value;gameObject.destroy(); }');
        for(const [name,x,value] of (mode==='guided'?[['Coin',160,1]]:[['CoinA',160,5],['CoinB',220,10]])) {
          const n=object(name,x,100,[sprite('COIN',16,16),`Pickup(${value})`]); setup+=`${declare('CircleCollider2D',`${n}Trigger`,'new CircleCollider2D(10)')}\n${n}Trigger.isTrigger=true;\n${n}.addComponent(${n}Trigger);\n`;
        }
        if(mode==='modified') object('Enemy',220,180,[sprite('SLIME'),'CircleCollider2D(12)']);
      }
      break;
    }
    case 'health':
      health();
      player(); setup+=`player.addComponent(new Health(${mode==='independent'?3:5},${mode==='guided'?0:0.75}));\nplayer.addComponent(new CircleCollider2D(12));\n`;
      if(mode==='independent') {
        object('PlayerB',220,100,[sprite('PLAYER01'),'CircleCollider2D(12)','Health(3,0.75)']);
        component('ContactDamage','onCollision(other) { const hp=other.getComponent(Health);if(hp)hp.damage(1); }','@Override public void onCollision(GameObject other) { Health hp=other.getComponent(Health.class);if(hp!=null)hp.damage(1); }');
        component('DeathReceiver','onCreate() { this.unsubscribe=this.requireComponent(Health).onDeath(()=>{this.gameObject.active=false;}); } onDestroy() { this.unsubscribe?.(); }','private Runnable unsubscribe; @Override public void onCreate() { unsubscribe=requireComponent(Health.class).onDeath(()->gameObject.active=false); } @Override public void onDestroy() {if(unsubscribe!=null)unsubscribe.run();}');
        setup+='player.addComponent(new DeathReceiver());\nplayerB.addComponent(new DeathReceiver());\n';
        object('EnemyA',160,100,[sprite('SLIME'),'CircleCollider2D(12)','ContactDamage()']);object('EnemyB',280,100,[sprite('BAT'),'CircleCollider2D(12)','ContactDamage()']);
      }
      break;
    case 'canvas-ui':
      if(mode==='guided') {
        object('HUD',12,12,['UITransform(200,18)','TextRenderer("Złoto: 0",18,"#ffffff")']);
        setup+=`${get('hUD','UITransform')}.anchor="TOP_LEFT";\n`;
      } else if(mode==='modified') draw='canvas.drawRect(80,90,40,30,"#76b9f2");\ncanvas.drawText("Start",80,140,18,"#ffffff","center","middle");';
      else draw=`${declare('double','width','200 * 3.0 / 5.0')}\ncanvas.drawRect(20+width/2,40,width,12,"#70c994");\ncanvas.drawText("Zdrowie: 3 / 5",20,70,18,"#ffffff","left","middle");`;
      break;
    case 'enemy-ai': {
      player(300,100); setup+=`${get('player','PlayerController')}.enabled=false;\n`;
      component('EnemyAI',`constructor(target,speed=60) { super(); this.target=target; this.speed=speed; } onUpdate() { if(!this.target || this.target.destroyed)return; const dx=this.target.transform.x-this.transform.x,dy=this.target.transform.y-this.transform.y; ${mode==='independent'?'if(Math.hypot(dx,dy)>=120)return;':''} this.requireComponent(GameLab.CharacterController2D).move(${mode==='independent'?'-':''}dx,${mode==='independent'?'-':''}dy,this.speed); }`,`public GameObject target; public double speed; public EnemyAI(GameObject target,double speed) { this.target=target; this.speed=speed; } @Override public void onUpdate(double delta) { if(target==null || target.destroyed)return; double dx=target.transform.x-transform.x,dy=target.transform.y-transform.y; ${mode==='independent'?'if(Math.hypot(dx,dy)>=120)return;':''} requireComponent(CharacterController2D.class).move(${mode==='independent'?'-':''}dx,${mode==='independent'?'-':''}dy,speed); }`);
      object('Slime',mode==='independent'?240:100,100,[sprite('SLIME'),'CircleCollider2D(12)','CharacterController2D()',`EnemyAI(player,${mode==='modified'?40:60})`]);
      if(mode==='modified') object('Bat',100,160,[sprite('BAT'),'CircleCollider2D(10)','CharacterController2D()','EnemyAI(player,80)']);
      break;
    }
    case 'projectiles': {
      health();projectile();player(100,100);setup+='player.addComponent(new CircleCollider2D(12));\n';
      object('Enemy',200,100,[sprite('SLIME'),'Health(3,0)','CircleCollider2D(12)']);setup+=`${get('enemy','CircleCollider2D')}.layer=2;\n`;
      const shot=object('Projectile',100,100,[sprite('FIREBALL',8,8),'ProjectileHit(player,1)']);
      if(mode==='independent') {
        setup+=`${declare('Projectile2D','motion',`${shot}.addComponent(new Projectile2D(1,0,3000,1,player))`)}\nmotion.hitLayers=2;\n`;
        object('Ally',150,100,[sprite('PLAYER01'),'CircleCollider2D(12)','Health(3,0)']);
        object('EnemyB',300,100,[sprite('BAT'),'CircleCollider2D(12)','Health(3,0)']);setup+=`${get('enemyB','CircleCollider2D')}.layer=2;\n`;
      } else setup+=`projectile.addComponent(new ProjectileMotion(1,0,200,${mode==='modified'?0.5:2}));\n${declare('CircleCollider2D','trigger','new CircleCollider2D(4)')}\ntrigger.isTrigger=true;projectile.addComponent(trigger);\n`;
      break;
    }
    case 'weapons':
      weapon(mode!=='guided',mode==='guided'?0.6:0.5);player();setup+='player.addComponent(new Weapon());\nplayer.addComponent(new CircleCollider2D(12));\n';
      object('Enemy',230,100,[sprite('SLIME'),'Health(3,0)','CircleCollider2D(12)']);setup+=`${get('enemy','CircleCollider2D')}.layer=2;\n`;
      if(mode==='independent') {object('EnemyB',100,230,[sprite('BAT'),'Health(3,0)','CircleCollider2D(12)']);setup+=`${get('enemyB','CircleCollider2D')}.layer=2;\n`;}
      break;
    case 'loot-xp':
      if(mode==='guided') {
        health();
        fields=java?'public RunStats runStats=new RunStats();':'runStats=new RunStats();';
        component('RunStats','kills=0;','public int kills=0;');
        component('XpOrb','constructor(value) { super(); this.value=value; }','public int value; public XpOrb(int value) {this.value=value;}');
        component('LootOnDeath','onCreate() { this.unsubscribe=this.requireComponent(Health).onDeath(()=>{ this.game.kills++;const orb=this.game.createObject("XpOrb");orb.setPosition(this.transform.x,this.transform.y);orb.addComponent(new GameLab.Sprite(GameLab.Assets.GEM,16,16));orb.addComponent(new GameLab.Trigger2D(20,20));orb.addComponent(new XpOrb(1)); }); } onDestroy() { this.unsubscribe?.(); }','private Runnable unsubscribe; @Override public void onCreate() {unsubscribe=requireComponent(Health.class).onDeath(()->{((GameMain)getGame()).kills++;GameObject orb=getGame().createObject("XpOrb");orb.setPosition(transform.x,transform.y);orb.addComponent(new Sprite(Assets.GEM,16,16));orb.addComponent(new Trigger2D(20,20));orb.addComponent(new XpOrb(1));});} @Override public void onDestroy() {if(unsubscribe!=null)unsubscribe.run();}');
        object('Enemy',220,120,[sprite('SLIME'),'Health(2,0)','LootOnDeath()']);
        break;
      }
      component('Experience',`level=1; xp=0; pendingChoices=0; add(value) { if(value<=0)return;this.xp+=value; ${mode==='independent'?'while(this.xp>=5*this.level) { this.xp-=5*this.level; this.level++; this.pendingChoices++; }':''} } onTrigger(other) { const orb=other.getComponent(XpOrb); if(!orb)return; this.add(orb.value); other.destroy(); }`,`public int level=1,xp=0,pendingChoices=0; public void add(int value) { if(value<=0)return;xp+=value; ${mode==='independent'?'while(xp>=5*level) { xp-=5*level; level++; pendingChoices++; }':''} } @Override public void onTrigger(GameObject other) { XpOrb orb=other.getComponent(XpOrb.class); if(orb==null)return; add(orb.value); other.destroy(); }`);
      component('XpOrb','constructor(value) { super(); this.value=value; }','public int value; public XpOrb(int value) { this.value=value; }');
      player(); setup+='player.addComponent(new Experience());\nplayer.addComponent(new CircleCollider2D(12));\n';
      for(const [name,x,value] of [['OrbA',160,3],['OrbB',220,4]]) { const n=object(name,x,100,[sprite('GEM',16,16),`XpOrb(${value})`]); setup+=`${declare('CircleCollider2D',`${n}Trigger`,'new CircleCollider2D(10)')}\n${n}Trigger.isTrigger=true;\n${n}.addComponent(${n}Trigger);\n`; }
      break;
    case 'pause':
      if(mode==='independent') {pauseController();player();setup+='player.addComponent(new PauseController());\n';break;}
      if(mode==='modified') {
        weapon();enemyFactory();player();setup+='player.addComponent(new Health(5,0.75));\nplayer.addComponent(new Weapon());\nplayer.addComponent(new EnemyFactory(player));\n';
        setup+=`${get('player','Health')}.invulnerability=0.75;\n`;
        object('Enemy',300,100,[sprite('SLIME'),'CircleCollider2D(12)','Health(3,0)','CharacterController2D()','EnemyAI(player,40)']);setup+=`${get('enemy','CircleCollider2D')}.layer=2;\n`;
        object('Projectile',100,200,[sprite('FIREBALL',8,8),'ProjectileMotion(1,0,100,2)']);
        component('WaveSpawner','elapsed=0;next=1;onUpdate(delta) {this.elapsed+=delta;while(this.elapsed>=this.next) {this.next++;const p=this.game.find("Player");p.getComponent(EnemyFactory).create(new EnemySpec("Slime",GameLab.Assets.SLIME,2,40,12),400,200);}}','private double elapsed=0,next=1;@Override public void onUpdate(double delta) {elapsed+=delta;while(elapsed>=next) {next++;GameObject p=getGame().find("Player");p.getComponent(EnemyFactory.class).create(new EnemySpec("Slime",Assets.SLIME,2,40,12),400,200);}}');object('Spawner',0,0,['WaveSpawner()']);
        object('Coin',160,160,[sprite('COIN',16,16)]);setup+=`${java?'':'GameLab.'}Tweens.position(coin,160,100,1);\n`;
        component('ResumeAfter','constructor() {super();this.updateMode="UI";this.elapsed=0;this.finished=false;} onCreate() {this.game.pause();} onUpdate(delta) {this.elapsed+=delta;} onLateUpdate() {if(!this.finished && this.elapsed>=5-1e-9) {this.finished=true;this.game.resume();}}','private double elapsed=0;private boolean finished=false;public ResumeAfter() {updateMode="UI";} @Override public void onCreate() {getGame().pause();} @Override public void onUpdate(double delta) {elapsed+=delta;} @Override public void onLateUpdate(double delta) {if(!finished && elapsed>=5-1e-9) {finished=true;getGame().resume();}}');object('ResumeAfter',0,0,['ResumeAfter()']);break;
      }
      player(); object('Slime',250,100,[sprite('SLIME')]);
      component('PauseController','constructor() { super(); this.updateMode="UI"; } onUpdate() { if(this.game.input.isKeyPressed("Escape")) { if(this.game.isPaused())this.game.resume(); else this.game.pause(); } }','public PauseController() { updateMode="UI"; } @Override public void onUpdate(double delta) { if(getGame().input.isKeyPressed("Escape")) { if(getGame().isPaused())getGame().resume(); else getGame().pause(); } }');
      object('Pause',0,0,['PauseController()']);
      break;
    case 'upgrades':
      upgrades(mode!=='guided',mode==='independent');
      setup+=`${get('player','Experience')}.pendingChoices=1;\n`;
      if(mode==='independent')setup+=`${get('player','Wallet')}.gold=20;\n`;
      break;
    case 'feedback':
      if(mode==='guided') {object('Coin',160,160,[sprite('COIN',16,16)]);setup+=`${java?'':'GameLab.'}Tweens.position(coin,160,100,1);\n`;}
      else if(mode==='modified') {
        health();player();setup+='player.addComponent(new Health(5,0.75));\n';object('Camera',0,0,['Camera2D()']);
        component('HitFeedback','onCreate() {this.unsubscribe=this.requireComponent(Health).onDamage(()=>{GameLab.Tweens.shake(this.gameObject,8,0.3);const camera=this.game.find("Camera");if(camera)GameLab.Tweens.shake(camera,2,0.3);});} onDestroy() {this.unsubscribe?.();}','private Runnable unsubscribe;@Override public void onCreate() {unsubscribe=requireComponent(Health.class).onDamage(()->{Tweens.shake(gameObject,8,0.3);GameObject camera=getGame().find("Camera");if(camera!=null)Tweens.shake(camera,2,0.3);});} @Override public void onDestroy() {if(unsubscribe!=null)unsubscribe.run();}');
        setup+='player.addComponent(new HitFeedback());\n';
      } else {
        object('Coin',0,100,[sprite('COIN',16,16)]);setup+=`${java?'':'GameLab.'}Tweens.position(coin,100,100,1);\n${java?'':'GameLab.'}Tweens.scale(coin,2,2,0);\n`;
        component('ReplaceTween','elapsed=0;replaced=false;onUpdate(delta) {this.elapsed+=delta;if(!this.replaced && this.elapsed>=0.25-1e-9) {this.replaced=true;GameLab.Tweens.position(this.gameObject,200,100,0.5);}}','private double elapsed=0;private boolean replaced=false;@Override public void onUpdate(double delta) {elapsed+=delta;if(!replaced && elapsed>=0.25-1e-9) {replaced=true;Tweens.position(gameObject,200,100,0.5);}}');setup+='coin.addComponent(new ReplaceTween());\n';
        object('Pulse',100,200,['Button(160,44)']);setup+=`${declare('Tween','pulseTween',`${java?'':'GameLab.'}Tweens.scale(pulse,1.1,1.1,0.5)`)}\npulseTween.updateMode="UI";\n`;
      }
      break;
    case 'ui-flow': {
      upgrades();setup+=`${get('player','Experience')}.pendingChoices=1;\n`;
      object('Panel',0,0,['UITransform(360,220)',shape(360,220,'#16314a')]);
      setup+=`${get('panel','ShapeRenderer')}.space="screen";\n`;
      for(const [name,text,choice,y] of [['SpeedButton','Szybkość',1,-60],['DamageButton','Obrażenia',2,0],['TempoButton','Tempo',3,60]]) {
        const n=object(name,0,y,['UITransform(280,44)','Button(280,44)']);
        setup+=`${get(n,'Button')}.text="${text}";\n${get(n,'Button')}.onClick=${java?'()->':'()=>'}${get('player','UpgradeController')}.select(${choice});\n`;
      }
      component('MenuView','constructor(player) {super();this.player=player;this.updateMode="UI";this.wasOpen=false;} onLateUpdate() {const open=this.player.getComponent(UpgradeController).opened;this.gameObject.active=open;const panel=this.getComponent(GameLab.UITransform);panel.width=Math.min(360,this.game.getViewportWidth()-32);for(const name of ["SpeedButton","DamageButton","TempoButton"]) {const object=this.game.find(name);if(object)object.active=open;} }','private GameObject player;public MenuView(GameObject player) {this.player=player;updateMode="UI";} @Override public void onLateUpdate(double delta) {boolean open=player.getComponent(UpgradeController.class).opened;gameObject.active=open;getComponent(UITransform.class).width=Math.min(360,getGame().getViewportWidth()-32);for(String name:new String[]{"SpeedButton","DamageButton","TempoButton"}) {GameObject object=getGame().find(name);if(object!=null)object.active=open;}}');
      // The controller stays on a separate active object so it can reopen an inactive panel.
      object('MenuView',0,0,['MenuView(player)']);
      // MenuView controls Panel, not its own helper object.
      files[`MenuView.${java?'java':'js'}`]=files[`MenuView.${java?'java':'js'}`].replace(java?'gameObject.active=open;getComponent(UITransform.class).width':'this.gameObject.active=open;const panel=this.getComponent(GameLab.UITransform);',java?'getGame().find("Panel").active=open;getGame().find("Panel").getComponent(UITransform.class).width':'this.game.find("Panel").active=open;const panel=this.game.find("Panel").getComponent(GameLab.UITransform);');
      if(mode!=='guided') {
        object('HealthBar',12,12,['UITransform(200,18)','ProgressBar(200,18)']);object('XpBar',12,38,['UITransform(200,18)','ProgressBar(200,18)']);object('LevelText',12,64,['UITransform(200,18)','TextRenderer("Poziom: 1",18,"#ffffff")']);
        for(const n of ['healthBar','xpBar','levelText'])setup+=`${get(n,'UITransform')}.anchor="TOP_LEFT";\n`;
        component('HudView','constructor(player) {super();this.player=player;this.updateMode="UI";} onLateUpdate() {const hp=this.player.getComponent(Health),xp=this.player.getComponent(Experience);this.game.find("HealthBar").getComponent(GameLab.ProgressBar).setValue(hp.currentHealth,hp.maxHealth);this.game.find("XpBar").getComponent(GameLab.ProgressBar).setValue(xp.xp,5*xp.level);this.game.find("LevelText").getComponent(GameLab.TextRenderer).text="Poziom: "+xp.level;}','private GameObject player;public HudView(GameObject player) {this.player=player;updateMode="UI";} @Override public void onLateUpdate(double delta) {Health hp=player.getComponent(Health.class);Experience xp=player.getComponent(Experience.class);getGame().find("HealthBar").getComponent(ProgressBar.class).setValue(hp.currentHealth,hp.maxHealth);getGame().find("XpBar").getComponent(ProgressBar.class).setValue(xp.xp,5*xp.level);getGame().find("LevelText").getComponent(TextRenderer.class).text="Poziom: "+xp.level;}');object('HudView',0,0,['HudView(player)']);
      }
      if(mode==='independent') {
        setup+=`${get('speedButton','Button')}.focus();\n`;
        component('MenuFocus','constructor(player) {super();this.player=player;this.updateMode="UI";this.wasOpen=false;} onLateUpdate() {const open=this.player.getComponent(UpgradeController).opened;const buttons=["SpeedButton","DamageButton","TempoButton"].map(n=>this.game.find(n).getComponent(GameLab.Button));if(open && !this.wasOpen)buttons[0].focus();if(!open)for(const button of buttons)button.blur();this.wasOpen=open;}','private GameObject player;private boolean wasOpen=false;public MenuFocus(GameObject player) {this.player=player;updateMode="UI";} @Override public void onLateUpdate(double delta) {boolean open=player.getComponent(UpgradeController.class).opened;Button[] buttons=new Button[]{getGame().find("SpeedButton").getComponent(Button.class),getGame().find("DamageButton").getComponent(Button.class),getGame().find("TempoButton").getComponent(Button.class)};if(open&&!wasOpen)buttons[0].focus();if(!open)for(Button button:buttons)button.blur();wasOpen=open;}');object('MenuFocus',0,0,['MenuFocus(player)']);
      }
      break;
    }
    case 'composition':
      player();enemyFactory();setup+='player.addComponent(new RunStats());\nplayer.addComponent(new EnemyFactory(player));\n';
      setup+=`${get('player','EnemyFactory')}.create(new EnemySpec("Slime",Assets.SLIME,3,40,12),240,100);\n${get('player','EnemyFactory')}.create(new EnemySpec("Bat",Assets.BAT,2,80,10),320,160);\n`;
      if(mode==='modified')setup+=`${get('player','EnemyFactory')}.create(new EnemySpec("Ghost",Assets.GHOST,3,35,12),350,220);\n`;
      if(mode==='independent') {
        weapon();component('Loadout','constructor(dagger,orb) {super();this.dagger=dagger;this.orb=orb;}','public Weapon dagger,orb;public Loadout(Weapon dagger,Weapon orb) {this.dagger=dagger;this.orb=orb;}');
        setup+=`${declare('Weapon','dagger','player.addComponent(new Weapon())')}\n${declare('Weapon','orb','player.addComponent(new Weapon())')}\norb.cooldown=1;orb.timer=1;orb.damage=2;\nplayer.addComponent(new Loadout(dagger,orb));\n`;
      }
      break;
    case 'waves': {
      health();
      player(mode==='independent'?2000:320,mode==='independent'?2000:180);
      if(mode==='independent') {
        setup+='setWorldBounds(0,0,4000,4000);\n';
        object('Ground',0,0,['TileMap(Assets.GRASS,32)']);
        object('Camera',0,0,['Camera2D()']);
        setup+=`${get('camera','Camera2D')}.follow(player);\n`;
      }
      const schedule=mode==='guided'?'[1,2,3]':mode==='modified'?'[1,2,3,5.5,6,6.5,7]':'Array.from({length:120},(_,i)=>i+1)';
      const javaSchedule=mode==='guided'?'new double[]{1,2,3}':mode==='modified'?'new double[]{1,2,3,5.5,6,6.5,7}':'java.util.stream.IntStream.rangeClosed(1,120).mapToDouble(i->i).toArray()';
      component('WaveSpawner',`elapsed=0;next=0;seed=42; schedule=${schedule}; onUpdate(delta) { this.elapsed+=delta; while(this.next<this.schedule.length && this.elapsed+1e-9>=this.schedule[this.next]) { const index=this.next++; ${mode==='independent'?'if(this.game.getObjects().filter(o=>o.name==="Slime" && !o.destroyed).length>=100)continue;':''} const target=this.game.find("Player"); const radius=${mode==='independent'?'0.5*Math.hypot(this.game.getViewportWidth(),this.game.getViewportHeight())+40':'140'}; this.seed=(Math.imul(1664525,this.seed)+1013904223)>>>0;const angle=this.seed/4294967296*Math.PI*2; const enemy=this.game.createObject("Slime");enemy.setPosition(target.transform.x+Math.cos(angle)*radius,target.transform.y+Math.sin(angle)*radius);enemy.addComponent(new GameLab.Sprite(GameLab.Assets.SLIME,32,32));enemy.addComponent(new GameLab.CircleCollider2D(12));enemy.addComponent(new GameLab.CharacterController2D());enemy.addComponent(new Health(${mode==='modified'?'index<3?2:3':'2'},0));enemy.addComponent(new EnemyAI(target,${mode==='modified'?'index<3?40:60':'40'})); } }`,
      `private double elapsed=0;private int next=0;private long seed=42;private double[] schedule=${javaSchedule}; @Override public void onUpdate(double delta) { elapsed+=delta;while(next<schedule.length && elapsed+1e-9>=schedule[next]) {int index=next++;${mode==='independent'?'if(getGame().getObjects().stream().filter(o->o.name.equals("Slime")&&!o.destroyed).count()>=100)continue;':''} GameObject target=getGame().find("Player");double radius=${mode==='independent'?'0.5*Math.hypot(getGame().getViewportWidth(),getGame().getViewportHeight())+40':'140'};seed=(1664525L*seed+1013904223L)&0xffffffffL;double angle=seed/4294967296.0*Math.PI*2;GameObject enemy=getGame().createObject("Slime");enemy.setPosition(target.transform.x+Math.cos(angle)*radius,target.transform.y+Math.sin(angle)*radius);enemy.addComponent(new Sprite(Assets.SLIME,32,32));enemy.addComponent(new CircleCollider2D(12));enemy.addComponent(new CharacterController2D());enemy.addComponent(new Health(${mode==='modified'?'index<3?2:3':'2'},0));enemy.addComponent(new EnemyAI(target,${mode==='modified'?'index<3?40:60':'40'}));} }`);
      component('EnemyAI','constructor(target,speed) { super();this.target=target;this.speed=speed; } onUpdate() { if(!this.target || this.target.destroyed)return;this.requireComponent(GameLab.CharacterController2D).move(this.target.transform.x-this.transform.x,this.target.transform.y-this.transform.y,this.speed); }','public GameObject target;public double speed;public EnemyAI(GameObject target,double speed) {this.target=target;this.speed=speed;} @Override public void onUpdate(double delta) {if(target==null || target.destroyed)return;requireComponent(CharacterController2D.class).move(target.transform.x-transform.x,target.transform.y-transform.y,speed);}');
      object('Spawner',0,0,['WaveSpawner()']);break;
    }
    case 'run-state': runScene();break;
    case 'survivor': runScene(true);break;
    case 'performance':
      if(mode==='modified') {weapon();player();setup+='player.addComponent(new Weapon());\n';object('Enemy',200,100,[sprite('SLIME'),'CircleCollider2D(12)','Health(3,0)']);setup+=`${get('enemy','CircleCollider2D')}.layer=2;\n`;break;}
      projectile();health();component('XpOrb','constructor(value) {super();this.value=value;}','public int value;public XpOrb(int value) {this.value=value;}');
      component('LoadFixture',`elapsed=0;next=0.2;shots=0;reward=0;seed=42;onCreate() {${mode==='independent'?'for(let i=0;i<200;i++) {this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;const enemy=this.game.createObject("Enemy");enemy.setPosition(100+this.seed/4294967296*440,100+Math.floor(i/20)*20);enemy.addComponent(new GameLab.Sprite(GameLab.Assets.SLIME,32,32));enemy.addComponent(new GameLab.CircleCollider2D(12));enemy.addComponent(new Health(2,0));}':''}} onUpdate(delta) {this.elapsed+=delta;while(this.next<=Math.min(this.elapsed,${mode==='guided'?20:60})+1e-9) {this.next+=0.2;const live=this.game.getObjects().filter(o=>o.name==="Projectile");if(live.length<300) {const shot=this.game.createObject("Projectile");shot.setPosition(20,20);shot.addComponent(new GameLab.Sprite(GameLab.Assets.FIREBALL,8,8));shot.addComponent(new ProjectileMotion(1,0,200,${mode==='guided'?1:15}));this.shots++;}${mode==='independent'?'const orbs=this.game.getObjects().filter(o=>o.getComponent(XpOrb));this.reward++;if(orbs.length>=200)orbs[0].getComponent(XpOrb).value++;else {const orb=this.game.createObject("XpOrb");orb.setPosition(50+orbs.length%20*20,100+Math.floor(orbs.length/20)*20);orb.addComponent(new GameLab.Sprite(GameLab.Assets.GEM,16,16));orb.addComponent(new XpOrb(1));}':''}}}`,
      `public double elapsed=0,next=.2;public int shots=0,reward=0;private long seed=42;@Override public void onCreate() {${mode==='independent'?'for(int i=0;i<200;i++) {seed=(seed*1664525L+1013904223L)&0xffffffffL;GameObject enemy=getGame().createObject("Enemy");enemy.setPosition(100+seed/4294967296.0*440,100+(i/20)*20);enemy.addComponent(new Sprite(Assets.SLIME,32,32));enemy.addComponent(new CircleCollider2D(12));enemy.addComponent(new Health(2,0));}':''}} @Override public void onUpdate(double delta) {elapsed+=delta;while(next<=Math.min(elapsed,${mode==='guided'?20:60})+1e-9) {next+=.2;long live=getGame().getObjects().stream().filter(o->o.name.equals("Projectile")).count();if(live<300) {GameObject shot=getGame().createObject("Projectile");shot.setPosition(20,20);shot.addComponent(new Sprite(Assets.FIREBALL,8,8));shot.addComponent(new ProjectileMotion(1,0,200,${mode==='guided'?1:15}));shots++;}${mode==='independent'?'java.util.ArrayList<GameObject> orbs=new java.util.ArrayList<>();for(GameObject object:getGame().getObjects())if(object.hasComponent(XpOrb.class))orbs.add(object);reward++;if(orbs.size()>=200)orbs.get(0).getComponent(XpOrb.class).value++;else {GameObject orb=getGame().createObject("XpOrb");orb.setPosition(50+orbs.size()%20*20,100+(orbs.size()/20)*20);orb.addComponent(new Sprite(Assets.GEM,16,16));orb.addComponent(new XpOrb(1));}':''}}}`);object('LoadFixture',0,0,['LoadFixture()']);draw='canvas.drawText("Test obciazenia: pociski co 0.2 s",20,55,18,"#ffffff","left","middle");';break;
      
    case 'portability':
      if(mode==='guided') player();
      else if(mode==='modified') {health();projectile();player();setup+='player.addComponent(new Health(5,0.75));\n';object('HUD',12,12,['UITransform(200,18)','TextRenderer("HP: 5 / 5",18,"#ffffff")']);setup+=`${get('hUD','UITransform')}.anchor="TOP_LEFT";\n`;object('Enemy',200,100,[sprite('SLIME'),'CircleCollider2D(12)','Health(3,0)']);setup+=`${get('enemy','CircleCollider2D')}.layer=2;\n`;object('Projectile',100,100,[sprite('FIREBALL',8,8),'ProjectileMotion(1,0,200,2)','ProjectileHit(player,1)','Trigger2D(8,8)']);}
      else {runScene(true);files['CHECKPOINT.md']='Exportuj projekt przez przycisk eksportu Labu. Zaimportuj plik w świeżej sesji tego samego Labu. Scenariusz: seed=42; Enter start, 10 s po 0.1 s, bez ruchu. Porównaj czas WORLD, liczbę spawnów i pozycje. Następnie sprawdź menu oraz Restart.';}
      break;
    default: ready=false;
  }
  const ext=java?'java':'js';
  if(chapter==='loot-xp' && mode==='guided')files[`LootOnDeath.${ext}`]=files[`LootOnDeath.${ext}`].replace(java?'((GameMain)getGame()).kills++':'this.game.kills++',java?'((GameMain)getGame()).runStats.kills++':'this.game.runStats.kills++');
  let playerColliderSeen=false;
  setup=setup.replace(/player\.addComponent\(new CircleCollider2D\(12\)\);\n/g,match=>{if(playerColliderSeen)return '';playerColliderSeen=true;return match;});
  if(chapter==='loot-xp' && mode==='guided')files[`LootOnDeath.${ext}`]=files[`LootOnDeath.${ext}`].replace('orb.addComponent(new XpOrb(1));',`orb.addComponent(new XpOrb(1));${java?'gameObject':'this.gameObject'}.destroy();`);
  if(files[`HitFeedback.${ext}`])files[`HitFeedback.${ext}`]=files[`HitFeedback.${ext}`].replace(java?'Tweens.shake(camera,2,0.3);':'GameLab.Tweens.shake(camera,2,0.3);',java?'camera.getComponent(Camera2D.class).shake(2,0.3);':'camera.getComponent(GameLab.Camera2D).shake(2,0.3);');
  if(chapter==='performance' && mode==='independent') {
    experience();player(320,300);setup+='player.addComponent(new Experience());\nplayer.addComponent(new CircleCollider2D(12));\n';
    const code=files[`LoadFixture.${ext}`];
    files[`LoadFixture.${ext}`]=java?code.replace('reward++;','GameObject victim=null;for(GameObject o:getGame().getObjects())if(o.name.equals("Enemy")) {victim=o;break;}if(victim!=null) {victim.getComponent(Health.class).damage(2);double x=victim.transform.x,y=victim.transform.y;victim.destroy();GameObject replacement=getGame().createObject("Enemy");replacement.setPosition(x,y);replacement.addComponent(new Sprite(Assets.SLIME,32,32));replacement.addComponent(new CircleCollider2D(12));replacement.addComponent(new Health(2,0));}reward++;'):code.replace('this.reward++;','const victim=this.game.getObjects().find(o=>o.name==="Enemy");if(victim) {victim.getComponent(Health).damage(2);const x=victim.transform.x,y=victim.transform.y;victim.destroy();const replacement=this.game.createObject("Enemy");replacement.setPosition(x,y);replacement.addComponent(new GameLab.Sprite(GameLab.Assets.SLIME,32,32));replacement.addComponent(new GameLab.CircleCollider2D(12));replacement.addComponent(new Health(2,0));}this.reward++;');
    files[`LoadFixture.${ext}`]=files[`LoadFixture.${ext}`].replace('orb.addComponent(new XpOrb(1));',`orb.addComponent(new XpOrb(1));orb.addComponent(new ${java?'':'GameLab.'}Trigger2D(20,20));`);
    files['REPORT.md']='Profil wspólny Java/JS: seed=42, 60 s symulacji, 200 wrogów, strzał co 0.2 s, lifetime=15 s, limit 300 pocisków i 200 orbów. Każdy termin eliminuje jednego wroga i zastępuje go świeżą instancją; XP w świecie jest łączona przy limicie. Sprawdź reward=300, shots=300 oraz Experience.totalXp plus XP pozostające = reward. Po zakończeniu usuń wrogów, zbierz XP i wykonaj jeszcze 15.1 s. Raportuj liczby aktywnych obiektów i kandydatów fizyki. Urządzenie: uzupełnij. FPS/p95: zmierz na własnym urządzeniu; brak danych nie jest wynikiem pomiaru.';
  }
  if(files[`Experience.${ext}`])files[`Experience.${ext}`]=java?files[`Experience.${ext}`].replace('public int level=1,xp=0,pendingChoices=0;','public int totalXp=0,level=1,xp=0,pendingChoices=0;').replace('xp+=value;','totalXp+=value;xp+=value;'):files[`Experience.${ext}`].replace('level=1;','totalXp=0;level=1;').replace('this.xp+=value;','this.totalXp+=value;this.xp+=value;');
  if(files[`LootOnDeath.${ext}`])files[`LootOnDeath.${ext}`]=files[`LootOnDeath.${ext}`].replace(java?'GameObject orb=getGame().createObject("XpOrb");':'const orb=this.game.createObject("XpOrb");',java?'java.util.ArrayList<GameObject> orbs=new java.util.ArrayList<>();for(GameObject o:getGame().getObjects())if(o.hasComponent(XpOrb.class))orbs.add(o);if(orbs.size()>=200) {orbs.get(0).getComponent(XpOrb.class).value++;gameObject.destroy();return;}GameObject orb=getGame().createObject("XpOrb");':'const orbs=this.game.getObjects().filter(o=>o.getComponent(XpOrb));if(orbs.length>=200) {orbs[0].getComponent(XpOrb).value++;this.gameObject.destroy();return;}const orb=this.game.createObject("XpOrb");');
  if(files[`Weapon.${ext}`])files[`Weapon.${ext}`]=files[`Weapon.${ext}`].replace(java?'GameObject shot=getGame().createObject("Projectile");':'const shot=this.game.createObject("Projectile");',java?'if(getGame().getObjects().stream().filter(o->o.name.equals("Projectile")).count()>=300)return;GameObject shot=getGame().createObject("Projectile");':'if(this.game.getObjects().filter(o=>o.name==="Projectile").length>=300)return;const shot=this.game.createObject("Projectile");');
  if(chapter==='enemy-ai' && mode==='independent') {
    files[`FleeAI.${ext}`]=files[`EnemyAI.${ext}`].replaceAll('EnemyAI','FleeAI');delete files[`EnemyAI.${ext}`];setup=setup.replaceAll('EnemyAI','FleeAI');
  }
  if(chapter==='waves' && mode==='modified')files[`WaveSpawner.${ext}`]=java?files[`WaveSpawner.${ext}`].replace('private double elapsed=0;','public int wave=1;private double elapsed=0;').replace('elapsed+=delta;','elapsed+=delta;wave=elapsed>=5?2:1;'):files[`WaveSpawner.${ext}`].replace('elapsed=0;','wave=1;elapsed=0;').replace('this.elapsed+=delta;','this.elapsed+=delta;this.wave=this.elapsed>=5?2:1;');
  if (!solved || !ready) { setup = '// TODO: '+ (ready ? 'Zaimplementuj opis i kryteria zadania.' : 'Projekt zadania oczekuje na implementację przykładu.'); update=''; fields='';draw=''; for(const key of Object.keys(files)) delete files[key]; }
  if(java) files['GameMain.java']=`public class GameMain extends Game {\n${fields}\n@Override public void onCreate() {\n${setup}\n}\n@Override public void onUpdate(double delta) {\n${update}\n}\n${draw ? `@Override public void onDrawUI() {\n${draw}\n}`:''}\n}\n`;
  else {
    for(const [name,source] of Object.entries(files)) {
      if(!name.endsWith('.js'))continue;
      const dependencies=Object.keys(files).filter(other=>other.endsWith('.js') && other!==name && new RegExp(`\\b${other.slice(0,-3)}\\b`).test(source));
      files[name]=dependencies.map(other=>`import ${other.slice(0,-3)} from './${other}';`).join('\n')+'\n'+source;
    }
    const imports=Object.keys(files).filter(name=>name.endsWith('.js')).map(name=>`import ${name.slice(0,-3)} from './${name}';`).join('\n');
    // Only scene methods need the Game receiver. Local variables remain explicit.
    setup=setup.replace(/\b(createObject|setWorldBounds)\(/g,'this.$1(');
    setup=setup.replace(/\b(Sprite|ShapeRenderer|CharacterController2D|Collider2D|CircleCollider2D|Camera2D|TileMap|Projectile2D|UITransform|TextRenderer|Trigger2D|Button|ProgressBar)\(/g,'GameLab.$1(').replace(/\bAssets\./g,'GameLab.Assets.');
    update=update.replace(/getComponent\((Counter)\)/g,'getComponent($1)');
    files['game.js']=`${imports}\nclass MyGame extends GameLab.Game {\n${fields}\nonCreate() {\n${setup}\n}\nonUpdate(delta) {\n${update}\n}\n${draw ? `onDrawUI() {\n${draw.replace(/\bcanvas\./g,'this.canvas.')}\n}`:''}\n}\nGameLab.run(MyGame, { canvas: '#game' });\n`;
    files['index.html']='<!doctype html>\n<html lang="pl"><head><title>Lab Game 2D</title><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="styles.css"></head><body><canvas id="game" tabindex="0" aria-label="Gra"></canvas><script type="module" src="game.js"></script></body></html>';
    files['styles.css']='html,body {margin:0;width:100%;height:100%;background:#10263a} #game {display:block;width:100%;height:100%;outline:none}';
  }
  return {files, ready};
}













