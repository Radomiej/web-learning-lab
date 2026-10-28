import {courseQuizTemplates} from './courseQuizCatalog.js';
import {extraCourseTemplates} from './extraCourseCatalog.js';
const extraLessonIds = new Set(extraCourseTemplates.map(({lessonId}) => lessonId));
export const courseTaskTemplates = courseQuizTemplates.filter(({lessonId}) => !extraLessonIds.has(lessonId)).map(({lessonId,name}) => ({
  id: `course-task-${lessonId}`, appId:'www-lab', lessonId,
  name:name.replace(/^Quiz · /,`${lessonId.split('-')[0].toUpperCase()} · `),
})).concat(extraCourseTemplates);
