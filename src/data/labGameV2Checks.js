// The same public behavior assertions drive sandbox scoring and real JVM scoring.
const state=(name,type,field)=>`objectsByName.${name}.componentState.${type}.${field}`;
const object=(name,field)=>`objectsByName.${name}.${field}`;
const action=(name,type,method,...args)=>({object:name,component:type,method,args});
const phase=(steps=0,keys=[],actions=[],delta=.1)=>({steps,keys,actions,delta});
export function courseScenario(chapter,mode) {
  let expected={},phases=[phase(0)],sourceToken;
  const expect=(path,value)=>{expected[path]=value;};
  const call=(...actions)=>{phases=[phase(0,[],actions)];};
  switch(chapter) {
    case 'scene':
      if(mode==='guided') {expect('objects.length',1);expect(object('Player','x'),80);expect(object('Player','y'),90);expect(state('Player','ShapeRenderer','width'),40);}
      else if(mode==='modified') {expect('objects.length',2);expect(object('PlatformA','x'),120);expect(object('PlatformB','x'),340);}
      else {expect('objects.length',3);expect(state('Player','Sprite','texture'),'player');expect(state('Enemy','Sprite','texture'),'slime');expect(state('Coin','Sprite','width'),16);}
      break;
    case 'components':
      phases=[phase(5)];
      if(mode==='guided') {expect(state('Player','Counter','counts'),6);expect(state('Player','Counter','creates'),1);}
      else if(mode==='modified') {expect(state('PlayerA','Counter','counts'),6);expect(state('PlayerB','Counter','counts'),2);}
      else expect('objects.length',0);
      break;
    case 'time':
      phases=[phase(10)];
      if(mode==='guided')expect(object('MoverObject','x'),180);
      else if(mode==='modified') {expect(object('Drop','y'),100);expect(object('Spark','x'),-20);expect(object('Spark','y'),50);}
      else {expect(object('MoverObject','x'),160);expect(object('MoverObject','y'),160);}
      break;
    case 'input':
      phases=[phase(10,mode==='modified'?['d','s','Shift']:mode==='independent'?['d','Space']:['d'])];
      expect(object('Player','x'),mode==='modified'?100+200/Math.sqrt(2):220);
      if(mode==='modified')expect(object('Player','y'),100+200/Math.sqrt(2));
      if(mode==='independent')expect(state('Player','ActionCounter','actions'),1);
      break;
    case 'graphics':
      expect(state('Ground','TileMap','texture'),mode==='modified'?'sand':'grass');expect(state('Ground','TileMap','tileSize'),mode==='modified'?48:32);
      if(mode==='modified') {phases=[phase(1,['a'])];expect(state('Player','Sprite','flipX'),true);}
      if(mode==='independent') {expect(state('Ground','TileMap','layer'),-10);expect(state('Path','ShapeRenderer','layer'),-5);expect(state('Decoration','Sprite','layer'),5);}
      break;
    case 'collisions':
      phases=[phase(10,mode==='independent'?['d']:[])];expect(object('Player','x'),mode==='guided'?174:mode==='modified'?178:268);
      if(mode!=='guided')expect(state('Player','CircleCollider2D','radius'),12);
      if(mode==='modified')expect(object('Player','scaleX'),2);
      break;
    case 'triggers':
      phases=[phase(10,['d'])];expect(state('Player','Wallet','gold'),mode==='guided'?1:mode==='modified'?15:20);
      if(mode==='independent')expect(state('Chest','Chest','opened'),true);
      break;
    case 'camera':
      if(mode==='modified') {phases=[phase(10,['d'])];expect(object('Player','x'),520);expect('camera.x',200);expect('camera.y',120);}
      else {expect('camera.x',mode==='guided'?80:60);expect('camera.y',mode==='guided'?40:150);expect(object('Player','x'),100);if(mode==='independent') {phases=[phase(1,[],[action(null,'input','setPointer',20,30)])];expect(object('Marker','x'),80);expect(object('Marker','y'),180);sourceToken='screenToWorld';}}
      break;
    case 'canvas-ui':
      if(mode==='guided') {expect(object('HUD','x'),12);expect(state('HUD','TextRenderer','text'),'Złoto: 0');expect(state('HUD','UITransform','anchor'),'TOP_LEFT');}
      else {sourceToken=mode==='modified'?'drawRect(80,90,40,30':'drawRect(20+width/2,40,width,12';expect('objects.length',0);}
      break;
    case 'health':
      if(mode==='guided') {call(action('Player','Health','damage',2),action('Player','Health','heal',10),action('Player','Health','damage',2));expect(state('Player','Health','currentHealth'),3);sourceToken='onDeath';}
      else if(mode==='modified') {phases=[phase(5,[],[action('Player','Health','damage',1)]),phase(0,[],[action('Player','Health','damage',1)])];expect(state('Player','Health','currentHealth'),4);expect(state('Player','Health','invulnerability'),.25);}
      else {call(action('Player','Health','damage',1),action('Player','Health','damage',1),action('PlayerB','Health','damage',1));expect(state('Player','Health','currentHealth'),2);expect(state('PlayerB','Health','currentHealth'),2);}
      break;
    case 'enemy-ai':
      phases=[phase(10)];expect(object('Slime','x'),mode==='guided'?160:mode==='modified'?140:180);
      if(mode==='modified')expect(state('Bat','EnemyAI','speed'),80);
      break;
    case 'projectiles':
      if(mode==='independent') {phases=[phase(1)];expect(state('Enemy','Health','currentHealth'),2);expect(state('EnemyB','Health','currentHealth'),3);expect(state('Ally','Health','currentHealth'),3);}
      else {phases=[phase(6)];expect(state('Enemy','Health','currentHealth'),2);expect('objects.length',2);sourceToken='spent';}
      break;
    case 'weapons':
      phases=[phase(mode==='guided'?1:5,mode==='guided'?['Space']:[])];expect('objects.length',mode==='independent'?4:3);expect(state('Player','Weapon','timer'),mode==='guided'?.6:.5);sourceToken=mode==='independent'?'candidate.id<target.id':undefined;
      break;
    case 'loot-xp':
      if(mode==='guided') {call(action('Enemy','Health','damage',2));expect('objects.length',1);expect(object('XpOrb','x'),220);expect(state('XpOrb','XpOrb','value'),1);}
      else if(mode==='modified') {phases=[phase(15,['d'])];expect(state('Player','Experience','xp'),7);expect('objects.length',1);}
      else {call(action('Player','Experience','add',16));expect(state('Player','Experience','level'),3);expect(state('Player','Experience','xp'),1);expect(state('Player','Experience','pendingChoices'),2);}
      break;
    case 'waves':
      phases=[phase(mode==='modified'?70:mode==='guided'?30:20)];expect('objects.length',mode==='modified'?9:mode==='guided'?5:6);
      if(mode==='modified')expect(state('Spawner','WaveSpawner','wave'),2);
      if(mode==='independent')sourceToken='100';
      break;
    case 'pause':
      if(mode==='guided') {phases=[phase(1,['Escape'])];expect('paused',true);}
      else if(mode==='modified') {phases=[phase(51)];expect('paused',false);expect(state('Player','Health','invulnerability'),.65);expect(object('Coin','y'),154);expect(state('Projectile','ProjectileMotion','remaining'),1.9);}
      else {call(action('Player','PauseController','request','manual'),action('Player','PauseController','request','upgrade'),action('Player','PauseController','release','upgrade'));expect('paused',true);sourceToken='consumeKey';}
      break;
    case 'upgrades':
      if(mode==='guided') {phases=[phase(1,[],[]),phase(1,['1'])];expect(state('Player','PlayerController','speed'),150);expect(state('Player','Experience','pendingChoices'),0);expect('paused',false);}
      else if(mode==='modified') {phases=[phase(1),phase(1,['2'])];expect(state('Player','Weapon','damage'),2);expect(state('Player','Experience','pendingChoices'),0);}
      else {call(action('Player','UpgradeController','onUpdate',0),action('Player','UpgradeController','select',2));expect(state('Player','Weapon','damage'),2);expect(state('Player','Wallet','gold'),20);sourceToken='wallet.gold-=20';}
      break;
    case 'ui-flow':
      phases=[phase(1),phase(1,['2'])];expect(state('Player','Weapon','damage'),2);expect(object('DamageButton','active'),false);if(mode==='modified')sourceToken='onLateUpdate';if(mode==='independent')sourceToken='focus';
      break;
    case 'feedback':
      if(mode==='guided') {phases=[phase(5)];expect(object('Coin','y'),130);}
      else if(mode==='modified') {phases=[phase(4,[],[action('Player','Health','damage',1)])];expect(object('Player','x'),100);expect(object('Player','visualOffsetX'),0);sourceToken='Tweens.shake';}
      else {phases=[phase(10,[],[],.05)];expect(object('Coin','x'),112.5);expect(object('Coin','scaleX'),2);}
      break;
    case 'composition':
      expect(state('Slime','Health','maxHealth'),3);expect(state('Bat','EnemyAI','speed'),80);
      if(mode==='modified')expect(state('Ghost','EnemyAI','speed'),35);
      if(mode==='independent') {phases=[phase(5)];expect('objects.length',4);sourceToken='Loadout';}
      break;
    case 'performance':
      if(mode==='guided') {phases=[phase(211)];expect('objects.length',1);expect(state('LoadFixture','LoadFixture','shots'),100);}
      else if(mode==='modified') {phases=[phase(5)];expect(state('Player','Weapon','evaluations'),1);sourceToken='candidate.id<target.id';}
      else {phases=[phase(300),phase(300)];expect(state('LoadFixture','LoadFixture','shots'),300);expect(state('LoadFixture','LoadFixture','reward'),300);sourceToken='orbs.size()>=200|orbs.length>=200';}
      break;
    case 'run-state':
      if(mode==='guided') {phases=[phase(50),phase(1,[],[action('Run','RunController','start')])];expect('elapsed',.1);expect(state('Run','RunController','state'),'RUNNING');}
      else {phases=[phase(0,[],[action('Run','RunController','start')]),phase(0,[],[action('Player','Health','damage',99)])];expect(state('Run','RunController','state'),'LOST');expect('paused',true);if(mode==='independent')sourceToken='elapsed>=120';}
      break;
    case 'portability':
      if(mode==='guided') {phases=[phase(10,['d'])];expect(object('Player','x'),220);}
      else if(mode==='modified') {call(action('Player','Health','damage',1),action('Player','Health','damage',1));expect(state('Player','Health','currentHealth'),4);sourceToken='invulnerabilityAfterHit';}
      else {phases=[phase(0,[],[action('Run','RunController','start')]),phase(10)];expect(state('Run','RunController','state'),'RUNNING');expect(state('Player','RunClock','elapsed'),1);sourceToken='seed=42|Random(42)';}
      break;
    case 'survivor':
      phases=[phase(0,[],[action('Run','RunController','start')]),phase(10)];expect(state('Player','PlayerController','speed'),120);expect(state('Player','Health','maxHealth'),5);expect(state('Player','Weapon','range'),240);expect(state('Player','RunClock','elapsed'),1);expect(state('Run','RunController','state'),'RUNNING');sourceToken=mode==='independent'?'projectileSpeed=220':mode==='modified'?'wave*30':'SurvivorSpawner';
      break;
  }
  return {phases,expected,tolerance:.02,sourceToken};
}

function javaValue(value) {return JSON.stringify(value);}
function javaExpression(path) {
  if(path==='objects.length')return 'game.getObjects().stream().filter(o->!o.destroyed).count()';
  if(path==='paused')return 'game.isPaused()';
  if(path==='elapsed')return 'game.time.elapsed';
  if(path.startsWith('camera.'))return `game.getCameraView().${path.split('.')[1]}`;
  const [,name,kind,type,field]=path.split('.');
  const receiver=`object(game,${JSON.stringify(name)})`;
  if(kind==='componentState')return `component(game,${JSON.stringify(name)},${type}.class).${type==='ProgressBar' && field==='progress'?'getProgress()':field}`;
  const transform={x:'x',y:'y',scaleX:'scale.x',scaleY:'scale.y',visualOffsetX:'visualOffset.x',visualOffsetY:'visualOffset.y'};
  return transform[kind]?`${receiver}.transform.${transform[kind]}`:`${receiver}.${kind}`;
}
export function courseJavaTest(chapter,mode) {
  const scenario=courseScenario(chapter,mode);
  let body='GameCanvas.setSize(640,360);game.start();game.step(0);\n';
  if(chapter==='feedback' && mode==='modified')body+='game.find("Player").getComponent(Health.class).damage(1);game.step(.1);check(Math.abs(game.find("Player").transform.visualOffset.x)>0,"accepted damage starts visual shake");\n';
  for(const phase of scenario.phases) {
    body+='game.input.clear();\n';
    for(const key of phase.keys)body+=`game.input.setKey(${JSON.stringify(key)},true);\n`;
    for(const action of phase.actions) {
      const owner=action.object===null?'game':`object(game,${JSON.stringify(action.object)})`;
      const receiver=action.component==='input'?`${owner}.input`:action.component?`component(game,${JSON.stringify(action.object)},${action.component}.class)`:owner;
      body+=`${receiver}.${action.method}(${action.args.map(javaValue).join(',')});\n`;
    }
    body+=`for(int i=0;i<${phase.steps};i++)game.step(${phase.delta});\n`;
  }
  for(const [path,value] of Object.entries(scenario.expected)) {
    const expression=javaExpression(path);
    const condition=typeof value==='number'?`Math.abs((${expression})-(${value}))<=0.02`:typeof value==='string'?`${javaValue(value)}.equals(${expression})`:`(${expression})==${value}`;
    const label = path.replace('objectsByName.','').replace('.componentState.',' → ');
    body+=`check(${condition},${JSON.stringify(label+': oczekiwano '+String(value)+', otrzymano ')}+(${expression}));\n`;
  }
  if(chapter==='camera' && mode==='independent')body+=`
Camera2D camera=game.find("Camera").getComponent(Camera2D.class);
GameObject marker=game.find("Marker"),player=game.find("Player");
double playerX=player.transform.x,playerY=player.transform.y;
game.input.setPointer(220,100);game.step(.1);
check(Math.abs(marker.transform.x-280)<1e-6 && Math.abs(marker.transform.y-250)<1e-6,"Ekran (220,100) powinien wskazać świat (280,250).");
check(Math.abs(game.getCameraView().x-60)<1e-6 && Math.abs(game.getCameraView().y-150)<1e-6,"Marker nie może przesuwać kamery.");
camera.offsetX=100;camera.offsetY=200;game.step(.1);
check(Math.abs(marker.transform.x-320)<1e-6 && Math.abs(marker.transform.y-300)<1e-6,"Po zmianie widoku wskaźnik powinien wskazać świat (320,300).");
Vector2 screen=camera.worldToScreen(new Vector2(marker.transform.x,marker.transform.y));
check(Math.abs(screen.x-220)<1e-6 && Math.abs(screen.y-100)<1e-6,"worldToScreen powinno odtworzyć punkt (220,100).");
check(player.transform.x==playerX && player.transform.y==playerY,"Marker nie może przesuwać gracza.");
`;
  if(chapter==='canvas-ui' && mode==='modified')body+='check(GameCanvas.frame().contains("rect|80.0|90.0|40.0|30.0|#76b9f2"),"centered rectangle");check(GameCanvas.frame().contains("text|Start|80.0|140.0"),"centered text");\n';
  if(chapter==='canvas-ui' && mode==='independent')body+='check(GameCanvas.frame().contains("rect|80.0|40.0|120.0|12.0"),"progress left edge and width");check(GameCanvas.frame().contains("|left|"),"paragraph alignment");\n';
  return `import engine.*;\npublic class JavaTest {
static void check(boolean value,String label) {if(!value){System.out.println("LAB_CHECK_FAILED:"+label);throw new AssertionError(label);}}
static GameObject object(Game game,String name) {GameObject value=game.find(name);check(value!=null,"Brakuje obiektu „"+name+"”. Utwórz go przed sprawdzaniem zadania. Jeśli gra ma przycisk Start, uzupełnij RunController.start().");return value;}
static <T extends Component> T component(Game game,String name,Class<T> type) {T value=object(game,name).getComponent(type);check(value!=null,"Obiekt „"+name+"” nie ma komponentu "+type.getSimpleName()+". Dodaj go przez addComponent().");return value;}
public static void main(String[] args) {GameMain game=new GameMain();try {${body}System.out.println("PASS");} finally {game.dispose();}}}\n`;
}
export function courseWebChecks(chapter,mode,id,files) {
  const {sourceToken,...scenario}=courseScenario(chapter,mode);
  const checks=[{type:'gameScenario',id:id+'.behavior',label:'Scenariusz zachowania zadania.',scenario:{phases:scenario.phases},expected:scenario.expected,tolerance:scenario.tolerance},{type:'runtimeError',id:id+'.runtime',label:'Scena uruchamia się bez błędów.'}];
  if(sourceToken) {
    for(const token of sourceToken.split('|')) {
      const file=Object.entries(files).find(([name,source])=>name.endsWith('.js') && source.includes(token))?.[0];
      if(file) {checks.push({type:'sourceIncludes',id:id+'.source',label:'Wymagane API i reguła zadania.',file,value:token});break;}
    }
  }
  return checks;
}
