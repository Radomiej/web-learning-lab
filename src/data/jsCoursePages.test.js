import { readFileSync, existsSync } from 'node:fs';
import { lessons } from './lessons.js';
import { jsCoursePages } from './jsCoursePages.js';
import { htmlCssTeachingPages } from './htmlCssTeachingPages.js';
import { phpTeachingPages } from './phpTeachingPages.js';
import { reactTeachingPages } from './reactTeachingPages.js';
import { lessonInfographics } from './lessonInfographics.js';
import { evaluateChecks } from '../services/lessonValidator.js';

test('every JS, HTML and CSS chapter has complete pages with an existing dedicated illustration', () => {
  expect(Object.keys(lessonInfographics)).toHaveLength(31);
  for(const illustration of Object.values(lessonInfographics)){
    expect(existsSync(`public${illustration.src}`),illustration.src).toBe(true);
    expect(illustration.alt.length).toBeGreaterThan(30);
  }
  const pagesById = { ...jsCoursePages, ...htmlCssTeachingPages, ...phpTeachingPages, ...reactTeachingPages };
  const targets = lessons.filter(lesson => ['js', 'html', 'css', 'php', 'react'].includes(lesson.track));
  expect(targets).toHaveLength(45);
  for (const lesson of targets) {
    const pages = pagesById[lesson.id];
    expect(pages.length, lesson.id).toBeGreaterThanOrEqual(3);
    expect(pages.filter(page => page.image).length).toBeGreaterThanOrEqual(1);
    for (const page of pages) {
      expect(page.text.length, `${lesson.id}/${page.title}`).toBeGreaterThan(50);
      expect(page.code).toBeTruthy(); expect(page.result).toBeTruthy();
      if (page.image) {
        const path = `public${page.image.startsWith('/') ? page.image : `/course-assets/js-foundations/${page.image}.png`}`;
        expect(existsSync(path), path).toBe(true);
        expect(page.alt.length).toBeGreaterThan(30);
        if (path.endsWith('.svg')) expect(readFileSync(path, 'utf8')).toContain('<svg');
      }
      if (lesson.track === 'js' && lesson.id !== 'js-dom') expect(() => new Function(page.code), `${lesson.id}/${page.title}`).not.toThrow();
    }
  }
});

test('reference and comparison examples produce the outcomes described in the lesson', () => {
  const run = code => { const values = []; new Function('console', code)({ log: (...args) => values.push(args.join(' ')) }); return values; };
  expect(run(jsCoursePages['js-function-values'][0].code)).toEqual(['6']);
  expect(run(jsCoursePages['js-function-values'][3].code)).toEqual(['Ola']);
  expect(run(jsCoursePages['js-comparisons'][0].code)).toEqual(['true', 'false']);
  expect(run(jsCoursePages['js-comparisons'][2].code)).toEqual(['false', 'true', 'true', 'false']);
  for (const lesson of lessons.filter(lesson => ['js-function-values', 'js-comparisons', 'js-error-handling'].includes(lesson.id))) {
    for (const task of lesson.tasks) {
      const output = run(task.solution.files['script.js']);
      const result = evaluateChecks(task.checks, { signals: { consoleOutput: output, runtimeErrors: [] } });
      expect(result.passed).toBe(result.total);
    }
  }
});

test('fetch exercise handles success, HTTP errors, network rejection, invalid JSON and invalid shape', async () => {
  const lesson = lessons.find(lesson => lesson.id === 'js-fetch');
  const source = lesson.tasks[0].solution.files['script.js'].replace(/\nwczytaj\(\);$/, '\nreturn wczytaj();');
  const cases = [
    [async () => ({ ok: true, status: 200, json: async () => ({ title: 'Biblioteka' }) }), 'Biblioteka'],
    [async () => ({ ok: false, status: 404, json: () => { throw Error('Nie odczytuj JSON przy 404'); } }), 'Błąd pobierania'],
    [async () => { throw new TypeError('Network'); }, 'Błąd pobierania'],
    [async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('JSON'); } }), 'Błąd pobierania'],
    [async () => ({ ok: true, status: 200, json: async () => ({ title: 12 }) }), 'Błąd pobierania'],
  ];
  for (const [fetchImpl, expected] of cases) {
    const result = { textContent: 'Czeka' };
    const pending = new Function('document', 'fetch', source)({ getElementById: () => result }, fetchImpl);
    expect(result.textContent).toBe('Ładowanie…');
    await pending;
    expect(result.textContent).toBe(expected);
  }
});
