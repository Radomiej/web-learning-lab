// Public metadata only. Reference implementations live in generator.js (server only).
import {javascriptLessonTemplates} from './lessonCatalog.js';
import {courseQuizTemplates} from './courseQuizCatalog.js';
import {courseTaskTemplates} from './courseTaskCatalog.js';
export const GENERATOR_VERSION = '2';
export const templates = [
  ...courseTaskTemplates,
  ...courseQuizTemplates,
  ...javascriptLessonTemplates,
  ...javascriptLessonTemplates.map(({topic,name,lessonId,order})=>({id:`js-quiz-${topic}`,appId:'www-lab',name:`Quiz ${name}`,lessonId,order,topic})),
  {id:'html-card',appId:'www-lab',name:'HTML · semantyczna karta'},
  {id:'css-grid',appId:'www-lab',name:'CSS · siatka kart'},
  {id:'js-sum',appId:'www-lab',name:'JavaScript · obliczenia na tablicy'},
  {id:'js-filter',appId:'www-lab',name:'JavaScript · filtrowanie tablicy'},
  {id:'java-reward',appId:'java-lab',name:'Java · metoda obliczająca nagrodę'},
  {id:'java-array',appId:'java-lab',name:'Java · algorytm na tablicy'},
  {id:'sql-select',appId:'databases',name:'SQL · wybieranie i sortowanie'},
  {id:'sql-group',appId:'databases',name:'SQL · grupowanie i agregacja'},
];
