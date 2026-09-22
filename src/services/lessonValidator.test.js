import { evaluateChecks } from './lessonValidator.js';

const baseContext = {
  files: { html: '<button id="save">Zapisz</button>', baseCss: '.card { display: flex; }', themeCss: '', js: '' },
  signals: {
    dom: { '#save': { exists: true, text: 'Zapisz', attrs: { type: 'button' } }, '#app': { exists: true, text: 'React' } },
    styles: { '.card|display': 'flex' },
    viewport: { scrollWidth: 390, clientWidth: 390 },
    interactions: {},
    runtimeErrors: [],
    react: { rootReady: true },
  },
};

test('passes source, element, attribute, style, overflow, and React checks', () => {
  const checks = [
    { id: 'html', type: 'sourceIncludes', file: 'html', needle: '<button', label: 'button' },
    { id: 'exists', type: 'elementExists', selector: '#save', label: 'save exists' },
    { id: 'attr', type: 'attributeEquals', selector: '#save', attribute: 'type', expected: 'button', label: 'type' },
    { id: 'style', type: 'computedStyle', selector: '.card', property: 'display', expected: 'flex', label: 'flex' },
    { id: 'width', type: 'noHorizontalOverflow', label: 'no overflow' },
    { id: 'react', type: 'reactRendered', selector: '#app', label: 'react' },
  ];
  const result = evaluateChecks(checks, baseContext);
  expect(result).toMatchObject({ passed: 6, total: 6 });
});

test('fails a missing interaction selector with its hint', () => {
  const result = evaluateChecks(
    [{ id: 'click', type: 'interaction', selector: '#missing', action: 'click', expected: { text: 'Gotowe' }, label: 'click', hint: 'Dodaj przycisk.' }],
    baseContext,
  );
  expect(result.results[0]).toMatchObject({ passed: false, hint: 'Dodaj przycisk.' });
  expect(result.results[0].message).toContain('missing');
});

test('fails unknown checks without throwing', () => {
  const result = evaluateChecks(
    [{ id: 'future', type: 'not-a-check', label: 'future' }],
    baseContext,
  );
  expect(result).toMatchObject({ passed: 0, total: 1 });
});

test('matches a real CSS declaration without accepting a commented-out copy', () => {
  const result = evaluateChecks([
    {
      id: 'declaration',
      type: 'sourceDeclaration',
      file: 'baseCss',
      selector: '.lesson-card',
      property: 'display',
      expected: 'flex',
      label: 'display flex',
    },
  ], {
    files: {
      baseCss: '/* .lesson-card { display: flex; } */ .lesson-card { display: grid; }',
    },
  });

  expect(result).toMatchObject({ passed: 0, total: 1 });
  expect(result.results[0].message).toContain('display');
});
test('reads exact filenames from a project and a flat filename map',()=>{
  const checks=[{id:'doctype',type:'sourceIncludes',file:'index.html',value:'<!doctype html>'}];
  for(const files of [{'index.html':'<!doctype html><p>Ok</p>'},{entry:'index.html',files:{'index.html':'<!doctype html><p>Ok</p>'}}]) {
    expect(evaluateChecks(checks,{files}).passed).toBe(1);
  }
  expect(evaluateChecks(checks,{files:{'index.html':'',html:'<!doctype html>'}}).passed).toBe(0);
});
