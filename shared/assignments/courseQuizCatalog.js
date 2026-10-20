import { htmlCssTeachingPages } from '../../src/data/htmlCssTeachingPages.js';
import { phpTeachingPages } from '../../src/data/phpTeachingPages.js';
import { reactTeachingPages } from '../../src/data/reactTeachingPages.js';

export const courseQuizPages = { ...htmlCssTeachingPages, ...phpTeachingPages, ...reactTeachingPages };
export const courseQuizTemplates = Object.keys(courseQuizPages).map(lessonId => ({
  id: `course-quiz-${lessonId}`, appId: 'www-lab', kind: 'quiz', lessonId,
  name: `Quiz · ${courseQuizPages[lessonId][0].title}`, topic: lessonId,
}));
