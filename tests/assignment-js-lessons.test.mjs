import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {JSDOM} from 'jsdom';
import {generateAssignment,publicAssignment} from '../shared/assignments/generator.js';
import {javascriptLessonTemplates} from '../shared/assignments/lessonCatalog.js';
const descriptor=(templateId,difficulty='standard',index=0)=>({generatorVersion:'2',templateId,difficulty,index,seed:'JS-LESSON-A'});

test('legacy version-one descriptors retain the original fetch case while version two enables the new pool',()=>{
 const legacyDescriptor={...descriptor('js-lesson-fetch'),generatorVersion:'1'};
 const legacy=generateAssignment(legacyDescriptor);
 assert.equal(legacy.generatorVersion,'1');
 assert.equal(legacy.params.recipeId,undefined);
 assert.equal(legacy.params.expected,'Błąd pobierania');
 assert.ok(decodeURIComponent(legacy.params.url).includes('{broken}'));
 assert.deepEqual(legacy,generateAssignment(legacyDescriptor));
 const current=generateAssignment({...legacyDescriptor,generatorVersion:'2'});
 assert.match(current.params.recipeId,/^fetch-standard-[123]$/);
 assert.notEqual(current.id,legacy.id);
});

test('lesson families reproduce complete assignments and keep reference code server-side',()=>{
  assert.equal(javascriptLessonTemplates.length,14);
  for(const template of javascriptLessonTemplates)for(const difficulty of ['easy','standard','challenge']){
    const task=generateAssignment(descriptor(template.id,difficulty));
    assert.deepEqual(task,generateAssignment(descriptor(template.id,difficulty)));
    assert.equal(task.params.lessonId,template.lessonId);
    assert.equal(task.params.consoleOnly,(template.order<404||['function-values','comparisons','error-handling'].includes(template.topic)));
    assert.notDeepEqual(task.starterFiles,task.referenceFiles);
    assert.equal('referenceFiles' in publicAssignment(task),false);
  }
});

test('foundation references execute without DOM and yield the required console line at every level',()=>{
  for(const template of javascriptLessonTemplates.filter(t=>t.order<404||['function-values','comparisons','error-handling'].includes(t.topic)))for(const difficulty of ['easy','standard','challenge'])for(let index=0;index<3;index++){
    const task=generateAssignment(descriptor(template.id,difficulty,index)),output=[];
    assert.doesNotMatch(task.referenceFiles['script.js'],/document|querySelector|textContent/);
    vm.runInNewContext(task.referenceFiles['script.js'],{console:{log:(...args)=>output.push(args.join(' '))}},{timeout:200});
    assert.deepEqual(output,[task.params.expected]);
  }
});

test('DOM references render and interactions produce the required result',()=>{
  for(const template of javascriptLessonTemplates.filter(t=>t.order>=404&&!['function-values','comparisons','error-handling','fetch'].includes(t.topic)))for(const difficulty of ['easy','standard','challenge']){
    const task=generateAssignment(descriptor(template.id,difficulty));
    const dom=new JSDOM(task.referenceFiles['index.html'],{runScripts:'outside-only'});
    try{
      dom.window.eval(task.referenceFiles['script.js']);
      if(task.params.action)dom.window.document.querySelector('#action').click();
      assert.equal(dom.window.document.querySelector('#result').textContent,task.params.expected);
    }finally{dom.window.close();}
  }
});

test('seed and index vary task data while keeping the curriculum topic',()=>{
  const base=descriptor('js-lesson-variables');
  assert.notDeepEqual(generateAssignment(base).params,generateAssignment({...base,seed:'JS-LESSON-B'}).params);
  assert.notDeepEqual(generateAssignment(base),generateAssignment({...base,index:1}));
  assert.equal(generateAssignment({...base,index:1}).params.lessonId,'js-browser');
});

test('fetch references use native data requests and handle HTTP rejection at every level',async()=>{
  for(const difficulty of ['easy','standard','challenge']){
    const task=generateAssignment(descriptor('js-lesson-fetch',difficulty));
    const dom=new JSDOM(task.referenceFiles['index.html'],{runScripts:'outside-only'});
    try{
      dom.window.fetch=(...args)=>fetch(...args);
      dom.window.eval(task.referenceFiles['script.js'].replace(/\nwczytaj\(\);\s*$/,''));
      const pending=dom.window.wczytaj();
      assert.equal(dom.window.document.querySelector('#result').textContent,'Ładowanie…');
      await pending;
      assert.equal(dom.window.document.querySelector('#result').textContent,task.params.expected);
      dom.window.fetch=async()=>({ok:false,status:500,json(){throw Error('Nie czytaj treści dla HTTP 500');}});
      await dom.window.wczytaj();
      assert.equal(dom.window.document.querySelector('#result').textContent,'Błąd pobierania');
    }finally{dom.window.close();}
  }
});

test('form references prevent submission, read fresh named fields and convert count to a number',()=>{
  for(const difficulty of ['standard','challenge']){
    const task=findRecipe('events',difficulty,1);
    const dom=new JSDOM(task.referenceFiles['index.html'],{runScripts:'outside-only'});
    try{
      const document=dom.window.document;
      dom.window.eval(task.referenceFiles['script.js']);
      assert.equal(document.querySelector('#result').textContent,'');
      document.querySelector('[name="student"]').value=difficulty==='challenge'?'  Ewa  ':'Ewa';
      document.querySelector('[name="count"]').value='07';
      const event=new dom.window.Event('submit',{bubbles:true,cancelable:true});
      assert.equal(document.querySelector('#form').dispatchEvent(event),false);
      assert.equal(event.defaultPrevented,true);
      assert.equal(document.querySelector('#result').textContent,'Ewa 7');
      assert.match(task.referenceFiles['script.js'],/FormData/);
      assert.match(task.referenceFiles['script.js'],/Number\(/);
    }finally{dom.window.close();}
  }
});

test('normal events lesson includes a form exercise checked through its submit button',async()=>{
  const {scriptTasks}=await import('../src/data/scriptTasks.js');
  const tasks=scriptTasks({id:'js-events-forms',track:'js',order:411,title:'Zdarzenia i formularze'},{});
  assert.equal(tasks.length,3);
  const task=tasks.find(item=>item.id==='js-events-forms-form-v1');
  assert.ok(task);
  const dom=new JSDOM(task.solution.files['index.html'],{runScripts:'outside-only'});
  try{
    dom.window.eval(task.solution.files['script.js']);
    const check=task.checks.find(item=>item.type==='interaction');
    dom.window.document.querySelector(check.selector).click();
    assert.equal(dom.window.document.querySelector(check.resultSelector).textContent,check.expected.text);
    dom.window.document.querySelector('[name="student"]').value='  Jan  ';
    dom.window.document.querySelector('[name="count"]').value='8';
    const event=new dom.window.Event('submit',{bubbles:true,cancelable:true});
    dom.window.document.querySelector('#form').dispatchEvent(event);
    assert.equal(event.defaultPrevented,true);
    assert.equal(dom.window.document.querySelector('#result').textContent,'Jan 8');
  }finally{dom.window.close();}
});



function findRecipe(topic,difficulty,recipe,scenario) {
  for(let seed=0;seed<200;seed++) {
    const task=generateAssignment({...descriptor(`js-lesson-${topic}`,difficulty),seed:`RECIPE-${seed}`});
    if(task.params.recipeId===`${topic}-${difficulty}-${recipe}`&&(scenario===undefined||task.params.dataScenario===scenario)) return task;
  }
  throw new Error(`Missing recipe ${topic}/${difficulty}/${recipe}/${scenario}`);
}

test('every lesson has three distinct operation recipes at every difficulty',()=>{
  for(const template of javascriptLessonTemplates)for(const difficulty of ['easy','standard','challenge']) {
    const tasks=[1,2,3].map(recipe=>findRecipe(template.topic,difficulty,recipe));
    assert.equal(new Set(tasks.map(task=>task.params.recipeId)).size,3);
    assert.equal(new Set(tasks.map(task=>task.params.taskKind)).size,3);
    assert.equal(new Set(tasks.map(task=>task.prompt)).size,3);
    for(const task of tasks) {
      assert.ok(task.params.taskKind.length>4);
      assert.ok(task.prompt.includes(task.params.expected),'prompt gives the exact expected result');
      assert.deepEqual(task,generateAssignment(task));
    }
  }
});

test('all operation recipes execute and match their console or interactive DOM contract',async()=>{
  for(const template of javascriptLessonTemplates)for(const difficulty of ['easy','standard','challenge'])for(const recipe of [1,2,3]) {
    const task=findRecipe(template.topic,difficulty,recipe);
    if(task.params.consoleOnly) {
      const output=[];
      assert.doesNotMatch(task.referenceFiles['script.js'],/document|querySelector|textContent/);
      vm.runInNewContext(task.referenceFiles['script.js'],{console:{log:(...args)=>output.push(args.join(' '))}},{timeout:200});
      assert.deepEqual(output,[task.params.expected],task.params.recipeId);
      continue;
    }
    const dom=new JSDOM(task.referenceFiles['index.html'],{runScripts:'outside-only'});
    try {
      dom.window.fetch=(...args)=>fetch(...args);
      if(task.params.async) {
        dom.window.eval(task.referenceFiles['script.js'].replace(/\nwczytaj\(\);\s*$/,''));
        const pending=dom.window.wczytaj();
        assert.equal(dom.window.document.querySelector('#result').textContent,'Ładowanie…');
        await pending;
      } else {
        dom.window.eval(task.referenceFiles['script.js']);
        if(task.params.action)dom.window.document.querySelector('#action').click();
      }
      assert.equal(dom.window.document.querySelector('#result').textContent,task.params.expected,task.params.recipeId);
    } finally {dom.window.close();}
  }
});

test('each fetch processing recipe handles native success, malformed JSON, invalid shape and HTTP failure at all levels',async()=>{
  for(const difficulty of ['easy','standard','challenge'])for(const recipe of [1,2,3])for(const scenario of ['success','bad-json','invalid-shape']) {
    const task=findRecipe('fetch',difficulty,recipe,scenario);
    const dom=new JSDOM(task.referenceFiles['index.html'],{runScripts:'outside-only'});
    try {
      assert.ok(task.params.url.startsWith('data:application/json,'));
      dom.window.fetch=(...args)=>fetch(...args);
      dom.window.eval(task.referenceFiles['script.js'].replace(/\nwczytaj\(\);\s*$/,''));
      await dom.window.wczytaj();
      assert.equal(dom.window.document.querySelector('#result').textContent,task.params.expected,`${task.params.recipeId}/${scenario}`);
      if(scenario!=='success')assert.equal(task.params.expected,'Błąd pobierania');
      dom.window.fetch=async()=>({ok:false,status:503,json(){throw new Error('Must not parse an HTTP failure');}});
      await dom.window.wczytaj();
      assert.equal(dom.window.document.querySelector('#result').textContent,'Błąd pobierania');
    }finally{dom.window.close();}
  }
});
