import { lessonNumber } from './lessonNumbers.js';

export const jsLessons = [
  { order: lessonNumber('js', 1), requiredApis: ['script', 'console.log', 'const', 'let', 'typeof'] },
  { order: lessonNumber('js', 2), requiredApis: ['if', 'else', 'function', 'return', 'parameters'] },
  { order: lessonNumber('js', 3), requiredApis: ['Array', 'Object', 'for', 'for...of', 'map', 'filter'] },
  { order: lessonNumber('js', 4), requiredApis: ['querySelector', 'querySelectorAll', 'textContent', 'classList', 'setAttribute', 'createElement'] },
  { order: lessonNumber('js', 5), requiredApis: ['addEventListener', 'click', 'input', 'submit', 'preventDefault'] },
  { order: lessonNumber('js', 6), requiredApis: ['state', 'render', 'filter', 'empty state'] },
  { order: lessonNumber('js', 7), requiredApis: ['try/catch', 'JSON.stringify', 'JSON.parse', 'localStorage'] },
  { order: lessonNumber('js', 8), requiredApis: ['DOM', 'form', 'table', 'addEventListener', 'localStorage'], assets: ['/course-assets/07-formularz-tabela-wireframe.png'] },
];
