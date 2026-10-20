// SERVER ONLY: lesson references must not enter the public generator payload.
import {lessons} from '../../src/data/lessons.js';
import {courseTaskTemplates} from './courseTaskCatalog.js';

export function generateCourseTaskAssignment(descriptor,int) {
  const template=courseTaskTemplates.find(item=>item.id===descriptor.templateId);
  if(!template)return null;
  const lesson=lessons.find(item=>item.id===template.lessonId);
  const level=['easy','standard','challenge'].indexOf(descriptor.difficulty);
  const recipe=(descriptor.index+int(0,2))%3;
  const task=lesson.tasks[recipe===0?0:Math.min(1,lesson.tasks.length-1)];
  const name=['Lena','Janek','Ewa','Leon','Ada','Tomek'][int(0,5)];
  const plant=['Rozmaryn','Melisa','Tymianek','Szałwia'][int(0,3)];
  const theme=['Warsztaty','Pracownia','Biblioteka','Spotkanie'][int(0,3)];
  const substitutions={Ola:name,Ala:name,Jan:name,Mięta:plant,Bazylia:'Lawenda',GOTOWE:theme.toUpperCase(),Zielnik:`Zielnik ${name}`};
  const transform=value=>typeof value==='string'?value.replace(/(^|[^\p{L}\p{N}_])(Ola|Ala|Jan|Mięta|Bazylia|GOTOWE|Zielnik)(?![\p{L}\p{N}_])/gu,(_,prefix,word)=>prefix+substitutions[word]):Array.isArray(value)?value.map(transform):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,item])=>[key,transform(item)])):value;
  const reference=transform(task.solution);
  const starter=transform(task.starter);
  const target=lesson.track==='game-dev'?'game.js':lesson.track==='php'?Object.keys(reference.files).find(path=>path.endsWith('.php')):lesson.track==='react'?Object.keys(reference.files).find(path=>/App\.(jsx?|tsx?)$/.test(path))||reference.runtime?.module:['css','layout'].includes(lesson.track)?Object.keys(reference.files).find(path=>path.endsWith('.css')):reference.entry;
  const targetPath=Object.hasOwn(reference.files,target)?target:reference.entry;
  let starterFiles=starter.files;
  const kind=['Zbuduj widok','Zastosuj w nowym przykładzie','Uzupełnij brakujący plik'][recipe];
  let prompt=transform(task.prompt);
  if(recipe===2){starterFiles={...reference.files,[targetPath]:starter.files[targetPath]||''};prompt=`Uzupełnij plik ${targetPath}. Pozostałe pliki przykładu są przygotowane. ${prompt}`;}
  if(level===0&&task.hint)prompt+=` Wskazówka: ${transform(task.hint)}`;
  if(level===2){starterFiles={...starterFiles,[targetPath]:lesson.track==='php'?'<?php\n':lesson.track==='html'?'<!doctype html>\n':''};prompt+=` Samodzielnie odtwórz wymagany plik ${targetPath} zgodnie z poleceniem.`;}
  return {title:`${kind} · ${lesson.title}`,prompt,criteria:transform(task.checks.map(check=>check.label)),starterFiles,referenceFiles:reference.files,params:{lessonId:lesson.id,sourceTaskId:task.id,track:lesson.track,targetFile:targetPath,entry:reference.entry,runtime:reference.runtime||null,recipeId:`${lesson.id}-${descriptor.difficulty}-${recipe+1}`,taskKind:kind}};
}
