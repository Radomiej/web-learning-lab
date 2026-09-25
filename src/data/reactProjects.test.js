import { lessons } from './lessons.js';
import { reactProjectFor } from './reactProjects.js';

const reactLessons = lessons.filter((lesson) => lesson.track === 'react');

test('every exported starter and solution uses real project files', () => {
  for (const lesson of lessons) {
    for (const project of [
      lesson.starter,
      lesson.solution,
      ...lesson.tasks.flatMap((task) => [task.starter, task.solution]),
    ]) {
      if (lesson.track === 'react') {
        expect(project.entry).toBe('public/index.html');
        expect(project.files['public/index.html']).toMatch(/^<!doctype html>/i);
        expect(Object.keys(project.files).filter((path) => path.endsWith('.css'))).toEqual([
          'src/index.css',
          'src/App.css',
        ]);
        expect(project.files['public/index.html']).not.toMatch(/<script\b/i);
        expect(project.runtime).toEqual({
          kind: 'react-cra',
          module: 'src/index.js',
          root: '#root',
          bootstrap: true,
        });
      } else if (lesson.track === 'php') {
        expect(project.entry).toBe('index.php');
        expect(project.files['index.php']).toMatch(/^<\?php/);
        expect(Object.keys(project.files).filter((path) => path.endsWith('.css'))).toEqual(['styles.css']);
        expect(project.runtime).toEqual({ kind: 'php-wasm', phpVersion: '8.4' });
      } else {
        expect(project.entry).toBe('index.html');
        expect(project.files['index.html']).toMatch(/^<!doctype html>/i);
        expect(Object.keys(project.files).filter((path) => path.endsWith('.css'))).toEqual(['styles.css']);
        expect(project.files['index.html']).toContain('href="styles.css"');
      }
      expect(project).not.toHaveProperty('html');
      expect(project).not.toHaveProperty('baseCss');
      expect(project).not.toHaveProperty('themeCss');
      expect(project).not.toHaveProperty('js');
    }
  }
});

test('every source check refers to a file present in starter and solution', () => {
  for (const lesson of lessons) {
    for (const task of lesson.tasks) {
      for (const check of task.checks.filter((candidate) => candidate.file)) {
        expect(Object.hasOwn(task.starter.files, check.file), `${task.id}: starter ${check.file}`).toBe(true);
        expect(Object.hasOwn(task.solution.files, check.file), `${task.id}: solution ${check.file}`).toBe(true);
      }
    }
  }
});

test('React course projects use CRA entry and source paths by default', () => {
  for (const lesson of reactLessons) {
    for (const task of lesson.tasks) {
      for (const project of [task.starter, task.solution]) {
        expect(project.files['public/index.html']).toContain('id="root"');
        expect(project.files['src/index.js']).toContain("from './App'");
        expect(project.files['src/index.js']).toContain('bootstrap/dist/css/bootstrap.min.css');
        expect(project.files['src/App.js']).toContain("import './App.css'");
        expect(project.files['src/App.js']).toContain('export default');
        expect(Object.hasOwn(project.files, 'legacy.jsx')).toBe(false);
      }
    }
  }
});

test.each(['guided', 'independent'])('%s React projects teach dedicated component and hook files', (mode) => {
  const components = reactProjectFor(502, mode, 'solution');
  const hooks = reactProjectFor(507, mode, 'solution');
  const finalProject = reactProjectFor(508, mode, 'solution');

  expect(Object.keys(components.files).some((path) => path.startsWith('src/components/'))).toBe(true);
  expect(components.files['src/App.js']).toMatch(/from ['"]\.\/components\//);
  expect(Object.keys(hooks.files).some((path) => path.startsWith('src/hooks/'))).toBe(true);
  expect(hooks.files['src/App.js']).toMatch(/from ['"]\.\/hooks\//);
  expect(Object.keys(hooks.files).some((path) => path.startsWith('src/components/'))).toBe(true);
  expect(Object.keys(finalProject.files).some((path) => path.startsWith('src/components/'))).toBe(true);
});

test('CRA starter copy uses the visible App.js filename in its preview text', () => {
  const project = reactProjectFor(501, 'guided', 'starter');

  expect(project.files['src/App.js']).toContain('Uzupełnij rozwiązanie w App.js');
  expect(project.files['src/App.js']).not.toContain('App.jsx');
});

test('keeps the current Vite project shape when requested explicitly', () => {
  const project = reactProjectFor(502, 'guided', 'solution', 'react-vite');

  expect(project.entry).toBe('index.html');
  expect(project.runtime.kind).toBe('react-vite');
  expect(project.files['index.html']).toContain('src="main.jsx"');
  expect(project.files['main.jsx']).toContain("from './App.jsx'");
  expect(project.files['App.jsx']).toContain('export default');
  expect(project.files['components/Card.jsx']).toContain('export default');
});
