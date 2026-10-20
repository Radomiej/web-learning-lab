import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {JSDOM} from 'jsdom';
import {generateAssignment} from '../shared/assignments/generator.js';
test('JS references handle thresholds, empty lists, duplicates and preserve input',()=>{
  for(const templateId of ['js-sum','js-filter'])for(const difficulty of ['easy','standard','challenge'])for(let index=0;index<5;index++){
    const task=generateAssignment({templateId,difficulty,seed:'JS-REFERENCE',index,generatorVersion:'1'});
    const context=vm.createContext({document:{querySelector:()=>({textContent:''})}});
    vm.runInContext(task.referenceFiles['script.js'],context,{timeout:1000});
    for(const input of [[],[-1,0,1],[task.params.threshold-1,task.params.threshold,task.params.threshold+1,task.params.threshold]]){
      const copy=[...input],selection=input.filter(v=>task.params.selection===0||v>=task.params.threshold&&(task.params.selection!==2||v%2===0));
      const actual=vm.runInContext(`solve(${JSON.stringify(input)})`,context,{timeout:1000});
      assert.deepEqual(JSON.parse(JSON.stringify(actual)),templateId==='js-filter'?selection:selection.reduce((a,b)=>a+b,0));
      context.input=copy;vm.runInContext('solve(input)',context,{timeout:1000});assert.deepEqual(copy,input);
    }
  }
});
test('HTML references have linked labels and CSS references retain specified responsive layout',()=>{
  for(const difficulty of ['easy','standard','challenge']){
    const html=generateAssignment({templateId:'html-card',difficulty,seed:'HTML',index:0,generatorVersion:'1'});
    const dom=new JSDOM(html.referenceFiles['index.html']);
    try{const document=dom.window.document;assert.equal(document.title,html.params.name);assert.equal(document.querySelectorAll('#project ul li').length,html.params.items.length);if(difficulty==='challenge')assert.equal(document.querySelector('label').htmlFor,document.querySelector('input').id);}finally{dom.window.close();}
    const css=generateAssignment({templateId:'css-grid',difficulty,seed:'CSS',index:0,generatorVersion:'1'});
    assert.match(css.referenceFiles['style.css'],new RegExp(`repeat\\(${css.params.columns}, minmax\\(0, 1fr\\)\\)`));
    if(difficulty!=='easy')assert.match(css.referenceFiles['style.css'],/@media \(max-width: 600px\)/);
  }
});
