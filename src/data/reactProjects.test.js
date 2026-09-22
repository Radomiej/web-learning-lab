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
      expect(project.entry).toBe('index.html');
      expect(project.files['index.html']).toMatch(/^<!doctype html>/i);
      expect(Object.keys(project.files).filter((path) => path.endsWith('.css'))).toEqual(['styles.css']);
      expect(project.files['index.html']).toContain('href="styles.css"');
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

test('React projects use main.jsx, App.jsx, and no fresh legacy.jsx', () => {
  for (const lesson of reactLessons) {
    for (const task of lesson.tasks) {
      for (const project of [task.starter, task.solution]) {
        expect(project.files['index.html']).toContain('src="main.jsx"');
        expect(project.files['main.jsx']).toContain("from './App.jsx'");
        expect(project.files['App.jsx']).toContain('export default');
        expect(Object.hasOwn(project.files, 'legacy.jsx')).toBe(false);
      }
    }
  }
});

test.each(['guided', 'independent'])('%s React projects teach dedicated component and hook files', (mode) => {
  const components = reactProjectFor(33, mode, 'solution');
  const hooks = reactProjectFor(38, mode, 'solution');
  const finalProject = reactProjectFor(39, mode, 'solution');

  expect(Object.keys(components.files).some((path) => path.startsWith('components/'))).toBe(true);
  expect(components.files['App.jsx']).toMatch(/from ['"]\.\/components\//);
  expect(Object.keys(hooks.files).some((path) => path.startsWith('hooks/'))).toBe(true);
  expect(hooks.files['App.jsx']).toMatch(/from ['"]\.\/hooks\//);
  expect(Object.keys(hooks.files).some((path) => path.startsWith('components/'))).toBe(true);
  expect(Object.keys(finalProject.files).some((path) => path.startsWith('components/'))).toBe(true);
});
