import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import definitions from '../../shared/lab-game-v2/conformance/scenarios.json';
import assets from '../../shared/lab-game-v2/assets/manifest.json';
import { createGameLab } from './gameRuntime.js';
import { buildCourseProject } from '../data/labGameV2Course.js';
import { parseGameProject, serializeGameProject } from './gameProjectTransfer.js';
import { courseClasses, runConformance } from './labGameConformanceFixture.js';
import { acceptsSceneInput } from '../../shared/lab-game-v2/inputTransport.js';

// Recursive comparison keeps the canonical tolerance explicit, including nested arrays.
function compare(actual, expected, path='result') {
  if(typeof expected==='number') {
    expect(Number.isFinite(actual),path).toBe(true);
    expect(Math.abs(actual-expected),path).toBeLessThanOrEqual(definitions.tolerance);
  } else if(Array.isArray(expected)) {
    expect(actual,path).toHaveLength(expected.length);
    expected.forEach((value,index)=>compare(actual[index],value,`${path}[${index}]`));
  } else if(expected && typeof expected==='object') {
    for(const [key,value] of Object.entries(expected))compare(actual?.[key],value,`${path}.${key}`);
  } else expect(actual,path).toEqual(expected);
}
function environment() {
  const context=new Proxy({},{get:(target,key)=>target[key]??(()=>{})});
  vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockImplementation(()=>context);
  return createGameLab({window,document,requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{},skipAssetLoading:true});
}
afterEach(()=>{document.body.replaceChildren();vi.restoreAllMocks();});
for(const definition of definitions.scenarios.filter(s=>!['C34','C36','C37','C38'].includes(s.id))) {
  test(`${definition.id}: ${definition.title}`,()=>{
    const lab=environment();
    try {
      const files=buildCourseProject('javascript','survivor','independent').files;
      // C31 specifies thresholds 10,20,30; the course uses 5,10,15.
      const configured=Object.fromEntries(Object.entries(files).map(([name,source])=>[name,definition.id==='C31'?source.replaceAll('5*this.level','10*this.level'):source]));
      compare(runConformance(lab,courseClasses(lab,configured),definition.id),definition.expected);
    } finally {lab.dispose();}
  });
}
test('C34: transport discards queued activation from a replaced scene with a reused object ID',()=>{
 let activations=0;const scene={gameId:2,objects:new Map([[7,{activate:()=>activations++}]])};
 const queued={gameId:1,objectId:7,action:'activate'};
 if(acceptsSceneInput(queued,scene.gameId))scene.objects.get(queued.objectId).activate();
 compare({activationCount:activations,newSceneState:activations===0?'unchanged':'changed'},definitions.scenarios.find(s=>s.id==='C34').expected);
});
test('C36: both packages contain the same actual sprite bytes and keys',()=>{
  const lab=environment();try{for(const asset of assets.assets)expect(lab.Assets[asset.constant]).toBe(assets.aliases[asset.constant]??asset.key);expect(lab.Assets.WALL).toBe('stone');expect(Object.isFrozen(lab.Assets)).toBe(true);}finally{lab.dispose();}
  const other=JSON.parse(readFileSync('C:/Nauka/java-lab/shared/lab-game-v2/assets/manifest.json','utf8'));
  const hash=(repo,source)=>createHash('sha256').update(readFileSync(`C:/Nauka/${repo}/public/game-assets/${source}`)).digest('hex');
  compare({keysEqual:JSON.stringify(assets.assets.map(a=>a.key))===JSON.stringify(other.assets.map(a=>a.key)),hashesEqual:assets.assets.every(a=>hash('web-learning-lab',a.source)===hash('java-lab',a.source)),wallResolvesTo:assets.aliases.WALL,ghostPresent:assets.assets.some(a=>a.key==='ghost')},definitions.scenarios.find(s=>s.id==='C36').expected);
});
test('C37: explicit user override rejects legacy API without mutating its source',()=>{
  const project={...buildCourseProject('javascript','scene','guided'),entry:'index.html',runtime:{kind:'game-js'},engineApiVersion:'2.0.0'};
  const legacy=JSON.stringify({...project,engineApiVersion:'1.0.0'}),before=legacy;
  expect(()=>parseGameProject(legacy)).toThrow(/2\.0\.0/);
  expect(legacy).toBe(before);
  const current=parseGameProject(serializeGameProject(project));
  expect(current.engineApiVersion).toBe('2.0.0');
  expect(current.files).toEqual(project.files);
});
// C38 requires independently executed JDK and TeaVM results. It must not be
// reported as executed merely by comparing a JS scene to a second JS scene.
test('C38: JavaScript matches independently executed JDK and TeaVM gameplay, events and geometry',()=>{
 const jdk=JSON.parse(readFileSync('C:/Nauka/java-lab/artifacts/lab-game-c38-jdk.json','utf8'));
 const teavm=JSON.parse(readFileSync('C:/Nauka/java-lab/artifacts/lab-game-c38-teavm.json','utf8'));
 const lab=environment();try {
  const actual=runConformance(lab,courseClasses(lab,buildCourseProject('javascript','survivor','independent').files),'C38');
  for(const [runtime,evidence]of[['JDK',jdk],['TeaVM',teavm]]){compare(actual.position,evidence.position,`${runtime} gameplay`);compare(actual.geometry,evidence.geometry,`${runtime} geometry`);expect(actual.events).toEqual(evidence.events);}
 }finally{lab.dispose();}
});
test('UI pointer release is consumed before a resumed WORLD action',()=>{
 const lab=environment();let worldActions=0;
 class WorldAction extends lab.Component {onUpdate(){if(this.game.input.isMouseReleased(0))worldActions++;}}
 class Scene extends lab.Game {onCreate(){const world=this.createObject('World');world.addComponent(new WorldAction());const ui=this.createObject('Button');ui.addComponent(new lab.UITransform(100,40));const button=ui.addComponent(new lab.Button(100,40));button.onClick=()=>this.resume();}}
 const game=new Scene();game.canvas=new lab.Canvas(document.createElement('canvas'));game.start();game.pause();
 try{game.input.setPointer(320,180);game.input.setMouseButton(0,true);game.step(.1);game.input.setMouseButton(0,false);game.step(.1);expect(game.isPaused()).toBe(false);expect(worldActions).toBe(0);}finally{game.dispose();lab.dispose();}
});
test('Button focus rejects an uninitialized owner and disabled arm cannot survive reenable',()=>{
 const lab=environment();const game=new lab.Game();game.canvas=new lab.Canvas(document.createElement('canvas'));const object=game.createObject('Button');object.addComponent(new lab.UITransform(100,40));const button=object.addComponent(new lab.Button(100,40));let clicks=0;button.onClick=()=>clicks++;
 try{expect(button.focus()).toBe(false);game.start();expect(button.focus()).toBe(true);game.input.setKey('Enter',true);game.step(.1);button.enabled=false;button.enabled=true;game.input.setKey('Enter',false);game.step(.1);expect(clicks).toBe(0);}finally{game.dispose();lab.dispose();}
});
test('course Health rejects invalid amounts and emits removable change listeners for damage and heal',()=>{
 const lab=environment();try{const {Health}=courseClasses(lab,buildCourseProject('javascript','survivor','independent').files),hp=new Health(5,0);let changes=0;const unsubscribe=hp.onChanged(()=>changes++);
 for(const amount of [-1,.5,NaN,Infinity]){expect(()=>hp.damage(amount)).toThrow();expect(()=>hp.heal(amount)).toThrow();expect(hp.currentHealth).toBe(5);}
 expect(hp.damage(0)).toBe(false);hp.heal(0);expect(changes).toBe(0);hp.damage(1);hp.heal(1);expect(changes).toBe(2);unsubscribe();hp.damage(1);expect(changes).toBe(2);hp.onChanged(()=>hp.heal(5));hp.damage(99);expect(hp.dead).toBe(true);expect(hp.currentHealth).toBe(0);
 }finally{lab.dispose();}
});
test('public queries reflect direct transforms changed twice within a WORLD update',()=>{
 const lab=environment();let target;
 class Probe extends lab.Component {onUpdate(){expect(this.game.physics.queryRadius(0,0,1,1)).toEqual([]);target.transform.x=0;expect(this.game.physics.queryRadius(0,0,1,1)).toContain(target);}}
 class Scene extends lab.Game {onCreate(){target=this.createObject('Target');target.setPosition(100,0);target.addComponent(new lab.CircleCollider2D(4));this.createObject('Probe').addComponent(new Probe());}}
 const game=new Scene();game.canvas=new lab.Canvas(document.createElement('canvas'));try{game.start();game.step(.1);}finally{game.dispose();lab.dispose();}
});

