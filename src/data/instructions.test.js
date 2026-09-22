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
    for (const bundle of [lesson.starter, lesson.solution, ...lesson.tasks.flatMap(task => [task.starter, task.solution])]) {
      expect(bundle.html).toMatch(/^<!doctype html>/i);
      expect(bundle.html).toContain('<html lang="pl">');
      expect(bundle.html).toContain('<head>');
      expect(bundle.html).toContain('<meta charset="UTF-8">');
      expect(bundle.html).toContain('name="viewport"');
      expect(bundle.html).toContain('<title>');
      expect(bundle.html).toContain('<body>');
      expect(bundle.html).toMatch(/<\/body>\s*<\/html>$/);
    }
  }
});
