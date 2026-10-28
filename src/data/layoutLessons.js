import { lessonNumber } from './lessonNumbers.js';

const modes = [{ mode: 'guided' }, { mode: 'independent' }, { mode: 'independent' }];

export const layoutLessons = [
  { order: lessonNumber('layout', 1), requiredProperties: ['display', 'flex-direction', 'justify-content', 'align-items'], tasks: modes, assets: ['/course-assets/04-flexbox-grid.svg'] },
  { order: lessonNumber('layout', 2), requiredProperties: ['gap', 'row-gap', 'column-gap', 'flex-wrap', 'align-content'], tasks: modes },
  { order: lessonNumber('layout', 3), requiredProperties: ['flex-basis', 'flex-grow', 'flex-shrink', 'flex'], tasks: modes },
  { order: lessonNumber('layout', 4), requiredProperties: ['order', 'align-self', 'min-width', 'max-width', 'overflow'], tasks: modes },
  { order: lessonNumber('layout', 5), requiredProperties: ['display', 'justify-content', 'align-items', 'gap', 'flex-direction'], tasks: modes },
  { order: lessonNumber('layout', 6), requiredProperties: ['display', 'grid-template-columns', 'grid-template-rows', 'fr', 'repeat', 'minmax', 'gap'], tasks: modes, assets: ['/course-assets/04-flexbox-grid.svg'] },
  { order: lessonNumber('layout', 7), requiredProperties: ['grid-template-areas', 'grid-area', 'grid-column', 'grid-row', 'display'], tasks: modes },
  { order: lessonNumber('layout', 8), requiredProperties: ['flex-wrap', 'gap', 'flex-grow', 'flex-basis', 'max-width', 'width', 'overflow'], tasks: modes, assets: ['/course-assets/04-flexbox-grid.svg'] },
];
