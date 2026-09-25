import { lessonNumber } from './lessonNumbers.js';

export const reactLessons = [
  { order: lessonNumber('react', 1), runtime: 'react', file: 'src/index.js', requiredApis: ['React.createElement', 'ReactDOM.createRoot', 'JSX', 'bootstrap CSS import'] },
  { order: lessonNumber('react', 2), runtime: 'react', file: 'src/components/Card.js', requiredApis: ['components', 'props', 'children'] },
  { order: lessonNumber('react', 3), runtime: 'react', file: 'src/App.js', requiredApis: ['React.useState', 'onClick', 'onChange', 'events'] },
  { order: lessonNumber('react', 4), runtime: 'react', file: 'src/App.js', requiredApis: ['map', 'key', 'filter', 'conditional rendering'] },
  { order: lessonNumber('react', 5), runtime: 'react', file: 'src/App.js', requiredApis: ['value', 'onChange', 'onSubmit', 'validation'] },
  { order: lessonNumber('react', 6), runtime: 'react', file: 'src/App.js', requiredApis: ['React.useEffect', 'dependencies', 'cleanup'] },
  { order: lessonNumber('react', 7), runtime: 'react', file: 'src/hooks/useCounter.js', requiredApis: ['lifting state up', 'callback', 'custom hook', 'use'] },
  { order: lessonNumber('react', 8), runtime: 'react', file: 'src/components/TaskItem.js', requiredApis: ['ReactDOM.createRoot', 'React.useState', 'props', 'onClick', 'onChange', 'responsive layout'] },
];
