import { htmlCssTeachingPages } from './htmlCssTeachingPages.js';
import { phpTeachingPages } from './phpTeachingPages.js';
import { reactTeachingPages } from './reactTeachingPages.js';
export const lessonStepInfographics = Object.fromEntries(
  ['html-three-layers','html-document','html-text'].flatMap(id=>htmlCssTeachingPages[id].slice(1).map((page,index)=>[`${id}:${index+1}`,{
    src:`/course-assets/lesson-infographics/${id}-step-${index+2}.png`,alt:`${page.title}. ${page.result}`,
  }])),
);

export const lessonInfographics = Object.fromEntries(
  Object.entries({ ...htmlCssTeachingPages, ...phpTeachingPages, ...reactTeachingPages }).map(([id, pages]) => [id, {
    src: `/course-assets/lesson-infographics/${id}.png`,
    alt: `${pages[0].title}. ${pages[0].result}`,
  }]),
);
