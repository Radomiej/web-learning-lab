import test from 'node:test';
import assert from 'node:assert/strict';
import {courseTaskTemplates} from '../shared/assignments/courseTaskCatalog.js';
import {generateAssignment,publicAssignment} from '../shared/assignments/generator.js';

test('all 63 non-JS lessons select their own project, target file and three exercise formats at each level',()=>{
 assert.equal(courseTaskTemplates.length,63);
 for(const template of courseTaskTemplates)for(const difficulty of ['easy','standard','challenge']){
  const seen=new Set();
  for(let i=0;i<40&&seen.size<3;i++){
   const descriptor={generatorVersion:'2',templateId:template.id,difficulty,index:0,seed:`COURSE-${i}`};
   const task=generateAssignment(descriptor);
   seen.add(task.params.recipeId);
   assert.equal(task.params.lessonId,template.lessonId);
   assert.ok(Object.hasOwn(task.starterFiles,task.params.entry));
   assert.ok(Object.hasOwn(task.starterFiles,task.params.targetFile));
   assert.ok(task.referenceFiles[task.params.targetFile]);
   assert.ok(task.criteria.length);
   assert.deepEqual(task,generateAssignment(descriptor));
   assert.ok(!Object.hasOwn(publicAssignment(task),'referenceFiles'));
   if(template.lessonId.startsWith('react-'))assert.equal(task.params.runtime.kind,'react-cra');
   if(template.lessonId.startsWith('php-'))assert.equal(task.params.runtime.kind,'php-wasm');
  }
  assert.equal(seen.size,3,`${template.id}/${difficulty}`);
 }
});
