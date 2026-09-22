import { lessons } from './lessons.js';
import { htmlInstructions } from './htmlInstructions.js';

test('HTML requirements explain tags in words instead of exposing bare selectors', () => {
  for (const lesson of lessons.filter(lesson => lesson.track === 'html')) {
    expect(htmlInstructions[lesson.order].length).toBeGreaterThan(0);
    for (const task of lesson.tasks) {
      expect(task.prompt).toContain('index.html');
      expect(task.prompt).toContain('między <body> a </body>');
      for (const check of task.checks) {
        expect(check.label).toBeTruthy();
        expect(check.label).not.toContain('Dodaj element:');
      }
    }
  }
});

test('every exercise starts and ends with a complete HTML document', () => {
  for (const lesson of lessons) {
    for (const project of [lesson.starter, lesson.solution, ...lesson.tasks.flatMap(task => [task.starter, task.solution])]) {
      const html = project.files['index.html'];
      expect(html).toMatch(/^<!doctype html>/i);
      expect(html).toMatch(/<html lang="(?:pl|en)">/);
      expect(html).toContain('<head>');
      expect(html).toContain('<meta charset="UTF-8">');
      expect(html).toContain('name="viewport"');
      expect(html).toContain('<title>');
      expect(html).toContain('<body>');
      expect(html).toMatch(/<\/body>\s*<\/html>$/);
    }
  }
});

test('React instructions name real module files and require imports', () => {
  for (const lesson of lessons.filter((candidate) => candidate.track === 'react')) {
    expect(lesson.theory.join(' ')).not.toMatch(/bez import|globalne obiekty/i);
    for (const task of lesson.tasks) {
      expect(task.prompt).not.toMatch(/script\.js|bez import/i);
      const mentionedFiles = task.prompt.match(/[\w/-]+\.(?:jsx|js)/g) ?? [];
      expect(mentionedFiles.length).toBeGreaterThan(0);
      for (const path of mentionedFiles) {
        expect(
          Object.hasOwn(task.starter.files, path) || Object.hasOwn(task.solution.files, path),
          `${task.id}: ${path}`,
        ).toBe(true);
      }
      expect(task.prompt).toMatch(/import/i);
    }
  }
});
