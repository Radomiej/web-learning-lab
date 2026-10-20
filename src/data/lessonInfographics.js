import { htmlCssTeachingPages } from './htmlCssTeachingPages.js';
import { phpTeachingPages } from './phpTeachingPages.js';
import { reactTeachingPages } from './reactTeachingPages.js';

export const lessonInfographics = Object.fromEntries(
  Object.entries({ ...htmlCssTeachingPages, ...phpTeachingPages, ...reactTeachingPages }).map(([id, pages]) => [id, {
    src: `/course-assets/lesson-infographics/${id}.png`,
    alt: `${pages[0].title}. ${pages[0].result}`,
  }]),
);
