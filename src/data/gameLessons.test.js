import { gameLessons } from './gameLessons.js';
import { courseManifest } from '../../shared/lab-game-v2/course/manifest.js';
import { createGameLab } from '../services/gameRuntime.js';

test('v2 course keeps all 24 chapters and 72 exact source task contracts',()=>{
 expect(gameLessons).toHaveLength(24);
 expect(gameLessons.flatMap(l=>l.tasks)).toHaveLength(72);
 for(const [index,lesson] of gameLessons.entries()) {
  const chapter=courseManifest.chapters[index];
  expect(lesson.id).toBe(chapter.id);
  expect(lesson.objectives).toEqual(chapter.objectives);
  for(const [taskIndex,task] of lesson.tasks.entries()) {
   const source=chapter.tasks[taskIndex];
   for(const key of ['id','mode','title','prompt','objective','criteria'])expect(task[key]).toEqual(source[key]);
  }
 }
});
function execute(task,project=task.solution) {
 const context=new Proxy({},{get:(target,key)=>target[key]??(()=>{})});
 vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockImplementation(()=>context);
 const canvas=document.createElement('canvas');canvas.id='game';canvas.getBoundingClientRect=()=>({width:640,height:360});document.body.append(canvas);
 const lab=createGameLab({window,document,requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{},skipAssetLoading:true});
 const files=project.files;
 const source=Object.entries(files).filter(([path])=>path.endsWith('.js')&&path!=='game.js').map(([,code])=>code.replace(/^import .*;$/gm,'').replace('export default ','' )).join('\n')+'\n'+files['game.js'].replace(/^import .*;$/gm,'');
 new Function('GameLab',source)(lab);
 return lab;
}
afterEach(()=>{document.body.replaceChildren();vi.restoreAllMocks();});
for(const lesson of gameLessons)for(const task of lesson.tasks.filter(t=>t.solutionReady))test(task.id+' boots its actual example',()=>{
 const lab=execute(task);try { lab.current.step(0.01);expect(lab.snapshot().objects).toBeDefined(); }finally{lab.dispose();}
});
test('scene positions and platform independence match source criteria',()=>{
 const lab=execute(gameLessons[0].tasks[1]);try {
  const a=lab.current.find('PlatformA'),b=lab.current.find('PlatformB');expect(a.transform.x).toBe(120);expect(b.transform.x).toBe(340);b.transform.x=999;expect(a.transform.x).toBe(120);
 }finally{lab.dispose();}
});
test('normalized direction travels 100 px in one second and zero direction stops',()=>{
 const lab=execute(gameLessons[2].tasks[2]);try{
 const object=lab.current.find('MoverObject');for(let i=0;i<10;i++)lab.current.step(0.1);expect(object.transform.x).toBeCloseTo(160);expect(object.transform.y).toBeCloseTo(160);
 const mover=object.components.find(c=>c.constructor.name==='DirectionMover');mover.direction={x:0,y:0};for(let i=0;i<10;i++)lab.current.step(0.1);expect(object.transform.x).toBeCloseTo(160);
 }finally{lab.dispose();}
});
function task(id) {return gameLessons.flatMap(l=>l.tasks).find(t=>t.id===id);}
function namedComponent(object,name) {return object.components.find(c=>c.constructor.name===name);}
test('Health owns protection and emits only one death notification',()=>{
 const lab=execute(task('g2d.health.modified'));try{
  const hp=namedComponent(lab.current.find('Player'),'Health');let deaths=0;const unsubscribe=hp.onDeath(()=>deaths++);
  expect(hp.damage(1)).toBe(true);expect(hp.damage(1)).toBe(false);expect(hp.currentHealth).toBe(4);
  for(let i=0;i<8;i++)lab.current.step(0.1);expect(hp.damage(99)).toBe(true);expect(hp.currentHealth).toBe(0);expect(hp.damage(1)).toBe(false);expect(deaths).toBe(1);expect(lab.current.find('Player')).toBeDefined();unsubscribe();
 }finally{lab.dispose();}
});
test('sweep projectile skips owner and ally and hits only the first enemy',()=>{
 const lab=execute(task('g2d.projectiles.independent'));try{
  const enemy=lab.current.find('Enemy'),second=lab.current.find('EnemyB'),ally=lab.current.find('Ally');lab.current.step(0.1);
  expect(namedComponent(enemy,'Health').currentHealth).toBe(2);expect(namedComponent(second,'Health').currentHealth).toBe(3);expect(namedComponent(ally,'Health').currentHealth).toBe(3);
  expect(lab.current.getObjects().filter(o=>o.name==='Projectile')).toHaveLength(0);
 }finally{lab.dispose();}
});
test('two finite wave schedules emit exactly seven independent enemies',()=>{
 const lab=execute(task('g2d.waves.modified'));try{
  for(let i=0;i<80;i++)lab.current.step(0.1);expect(lab.current.getObjects().filter(o=>o.name==='Slime')).toHaveLength(7);
 }finally{lab.dispose();}
});
test('upgrade consumes exactly one choice and manual pause survives',()=>{
 const lab=execute(task('g2d.upgrades.modified'));try{
  lab.current.step(0.1);const player=lab.current.find('Player'),menu=namedComponent(player,'UpgradeController'),pause=namedComponent(player,'PauseController'),xp=namedComponent(player,'Experience');
  pause.request('manual');menu.select(1);expect(xp.pendingChoices).toBe(0);expect(namedComponent(player,'PlayerController').speed).toBe(150);expect(lab.current.isPaused()).toBe(true);menu.select(1);expect(namedComponent(player,'PlayerController').speed).toBe(150);pause.release('manual');expect(lab.current.isPaused()).toBe(false);
 }finally{lab.dispose();}
});
test('20-second firing fixture cleans every projectile after 1.1 seconds',()=>{
 const lab=execute(task('g2d.performance.guided'));try{
  for(let i=0;i<211;i++)lab.current.step(0.1);expect(namedComponent(lab.current.find('LoadFixture'),'LoadFixture').shots).toBe(100);expect(lab.current.getObjects().filter(o=>o.name==='Projectile')).toHaveLength(0);
 }finally{lab.dispose();}
});
test('restart resets run state and lethal damage takes priority over winning',()=>{
 const lab=execute(task('g2d.run-state.independent'));try{
  const run=namedComponent(lab.current.find('Run'),'RunController');expect(run.state).toBe('READY');run.start();lab.current.step(0);
  const old=run.player;namedComponent(old,'RunClock').elapsed=120;namedComponent(old,'Health').damage(99);lab.current.step(0);expect(run.state).toBe('LOST');run.start();lab.current.step(0);expect(run.state).toBe('RUNNING');expect(run.player).not.toBe(old);expect(namedComponent(run.player,'RunClock').elapsed).toBe(0);expect(namedComponent(run.player,'Experience').level).toBe(1);
 }finally{lab.dispose();}
});
for(const lesson of gameLessons)for(const task of lesson.tasks) test(task.id+' solution satisfies editor scoring scenario',()=>{
 const lab=execute(task);try {
  for(const check of task.checks) {
   if(check.type==='gameScenario') {
    const snapshot=lab.evaluateScenario(check.scenario);for(const [path,expected] of Object.entries(check.expected)) {
     const value=path.split('.').reduce((value,key)=>value?.[key],snapshot);if(typeof expected==='number')expect(value,path).toBeCloseTo(expected,1);else expect(value,path).toBe(expected);
    }
   }
   if(check.type==='sourceIncludes')expect(task.solution.files[check.file]).toContain(check.value);
  }
 }finally{lab.dispose();}
});

for(const lesson of gameLessons)for(const task of lesson.tasks) test(task.id+' scoring rejects its unfinished starter',()=>{
 const lab=execute(task,task.starter);try {
  let failed=false;
  for(const check of task.checks) {
   if(check.type==='gameScenario') {
    try {const snapshot=lab.evaluateScenario(check.scenario);for(const [path,expected] of Object.entries(check.expected)) {
     const value=path.split('.').reduce((value,key)=>value?.[key],snapshot);if(typeof expected==='number'?(typeof value!=='number'||Math.abs(value-expected)>.02):value!==expected)failed=true;
    }}catch {failed=true;}
   }
   if(check.type==='sourceIncludes'&&!task.starter.files[check.file]?.includes(check.value))failed=true;
  }
  expect(failed).toBe(true);
 }finally{lab.dispose();}
});
test('upgrade buttons use actual pointer release and focused Enter release',()=>{
 const lessonTask=task('g2d.ui-flow.independent'),lab=execute(lessonTask);try {
  const player=lab.current.find('Player'),xp=namedComponent(player,'Experience'),menu=namedComponent(player,'UpgradeController'),weapon=namedComponent(player,'Weapon');
  lab.current.step(.1);xp.pendingChoices=2;
  lab.current.input.setPointer(320,180);lab.current.input.setMouseButton(0,true);lab.current.step(.1);expect(weapon.damage).toBe(1);
  lab.current.input.setMouseButton(0,false);lab.current.step(.1);expect(weapon.damage).toBe(2);expect(xp.pendingChoices).toBe(1);expect(menu.opened).toBe(true);
  lab.current.input.setKey('Enter',true);lab.current.step(.1);expect(weapon.damage).toBe(2);
  lab.current.input.setKey('Enter',false);lab.current.step(.1);expect(weapon.damage).toBe(3);expect(xp.pendingChoices).toBe(0);expect(menu.opened).toBe(false);
 }finally{lab.dispose();}
});
test('XP conservation survives the bounded 60-second workload',()=>{
 const lab=execute(task('g2d.performance.independent'));try {
  for(let i=0;i<600;i++)lab.current.step(.1);
  const objects=lab.current.getObjects(),fixture=namedComponent(lab.current.find('LoadFixture'),'LoadFixture'),xp=namedComponent(lab.current.find('Player'),'Experience');
  const reward=objects.reduce((sum,object)=>sum+(namedComponent(object,'XpOrb')?.value??0),0);
  expect(objects.filter(o=>o.name==='Enemy').length).toBeLessThanOrEqual(200);expect(objects.filter(o=>o.name==='Projectile').length).toBeLessThanOrEqual(300);expect(objects.filter(o=>namedComponent(o,'XpOrb')).length).toBeLessThanOrEqual(200);expect(xp.totalXp+reward).toBe(fixture.reward);expect(fixture.reward).toBe(300);
 }finally{lab.dispose();}
});
