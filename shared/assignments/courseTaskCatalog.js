import {courseQuizTemplates} from './courseQuizCatalog.js';
export const courseTaskTemplates = courseQuizTemplates.map(({lessonId,name}) => ({
  id: `course-task-${lessonId}`, appId:'www-lab', lessonId,
  name:name.replace(/^Quiz · /,`${lessonId.split('-')[0].toUpperCase()} · `),
}));
