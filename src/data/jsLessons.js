import { extraJsDefinitions } from './jsCoursePages.js';
import { jsFoundationDefinitions } from './jsFoundations.js';
import { lessonNumber } from './lessonNumbers.js';

export const jsLessons = [
  ...extraJsDefinitions.map(({ order, requiredApis }) => ({ order, requiredApis })),
  ...jsFoundationDefinitions.map(({ order, requiredApis }) => ({ order, requiredApis })),
  { order: lessonNumber('js', 7), requiredApis: ['if', 'else', 'function', 'return', 'parameters'] },
  { order: lessonNumber('js', 8), requiredApis: ['Array', 'Object', 'for', 'for...of', 'map', 'filter'] },
  { order: lessonNumber('js', 9), requiredApis: ['addEventListener', 'click', 'input', 'submit', 'preventDefault'] },
  { order: lessonNumber('js', 10), requiredApis: ['state', 'render', 'filter', 'empty state'] },
  { order: lessonNumber('js', 12), requiredApis: ['try/catch', 'JSON.stringify', 'JSON.parse', 'localStorage'] },
  { order: lessonNumber('js', 14), requiredApis: ['DOM', 'form', 'table', 'addEventListener', 'localStorage'], assets: ['/course-assets/07-formularz-tabela-wireframe.png'] },
];
