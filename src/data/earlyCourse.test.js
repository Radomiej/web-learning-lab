// @vitest-environment node
import {test,expect} from 'vitest';
import {courseManifest} from '../../shared/lab-game-v2/course/manifest.js';
import {buildCourseProject} from './labGameV2Course.js';
test('first five lessons reach movement, collisions, enemies and a hit',()=>{
 expect(courseManifest.chapters.slice(0,5).map(c=>c.id)).toEqual(['g2d.scene','g2d.input','g2d.collisions','g2d.enemy-ai','g2d.projectiles']);
});
test('guided starters preserve a scene and remove only the small target change',()=>{
 for(const lang of ['java','js'])for(const chapter of ['scene','input','collisions','enemy-ai','projectiles']){
 const starter=buildCourseProject(lang,chapter,'guided',false).files,solution=buildCourseProject(lang,chapter,'guided').files;
 const main=lang==='java'?'GameMain.java':'game.js';expect(starter[main]).toContain('createObject(');
 const missing=Object.keys(solution).filter(k=>solution[k]!==starter[k]);expect(missing).toHaveLength(1);
 expect(starter[missing[0]]).toContain('TODO');expect(solution[missing[0]].split('\n').length-starter[missing[0]].split('\n').length).toBeLessThan(3);
 }
});
