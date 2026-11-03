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

test('consoleOutput explains only values genuinely spread across separate lines', () => {
  const check = { id: 'out', type: 'consoleOutput', expected: 'false true', label: 'console' };
  const spread = evaluateChecks([check], { signals: { consoleOutput: ['false', 'true'] } });
  expect(spread.passed).toBe(0);
  expect(spread.results[0].message).toContain('jednym console.log');
  // Multi-word values split across lines get the same diagnosis.
  const multiWord = evaluateChecks([{ ...check, expected: 'Brak pliku true' }], { signals: { consoleOutput: ['Brak pliku', 'true'] } });
  expect(multiWord.results[0].message).toContain('jednym console.log');
  // A line holding only part of the expected output is a plain mismatch.
  const missing = evaluateChecks([{ ...check, expected: 'true true' }], { signals: { consoleOutput: ['true'] } });
  expect(missing.results[0].message).toContain('Oczekiwano wpisu');
  // Extra tokens inside one line do not count as separate entries.
  const sameLine = evaluateChecks([check], { signals: { consoleOutput: ['x false true'] } });
  expect(sameLine.results[0].message).toContain('Oczekiwano wpisu');
  expect(evaluateChecks([check], { signals: { consoleOutput: ['false true'] } }).passed).toBe(1);
});

test('interaction submitCanceled verifies preventDefault on form submit', () => {
  const check = {
    id: 'submit', type: 'interaction', selector: '#action', action: 'click', resultSelector: '#result',
    expected: { text: 'Ola 3', submitCanceled: true }, label: 'form submit',
  };
  const run = (formSubmit) => evaluateChecks([check], {
    signals: { interactions: { submit: { ok: true, text: 'Ola 3', ...(formSubmit ? { formSubmit } : {}) } } },
  });
  expect(run({ dispatched: true, canceled: true }).passed).toBe(1);
  expect(run({ dispatched: true, canceled: false }).results[0].message).toContain('preventDefault');
  expect(run({ dispatched: false, canceled: false, validationFailed: true }).results[0].message).toContain('walidacja');
  expect(run(null).results[0].message).toContain('nie uruchomiło wysłania');
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

test('accepts browser-rasterized border widths without relaxing ordinary width checks', () => {
  const borderResult = evaluateChecks([{
    id: 'border-width',
    type: 'computedStyle',
    selector: '.practice',
    property: 'border-top-width',
    expected: '2px',
    label: 'border width',
  }], {
    signals: { styles: { '.practice|border-top-width': '1.6px' } },
  });
  const ordinaryWidthResult = evaluateChecks([{
    id: 'width',
    type: 'computedStyle',
    selector: '.practice',
    property: 'width',
    expected: '200px',
    label: 'width',
  }], {
    signals: { styles: { '.practice|width': '199px' } },
  });

  expect(borderResult.passed).toBe(1);
  expect(ordinaryWidthResult.passed).toBe(0);
});

test('jsProbe compares the evaluated value and reports runtime errors', () => {
  const checks = [
    { id: 'ok', type: 'jsProbe', expression: 'punkty', expected: 5, label: 'punkty' },
    { id: 'bad', type: 'jsProbe', expression: 'podwoj(7)', expected: 14, label: 'podwoj' },
    { id: 'missing', type: 'jsProbe', expression: 'nieMa', expected: 1, label: 'nieMa' },
    { id: 'absent', type: 'jsProbe', expression: 'inna', expected: 1, label: 'bez sondy' },
  ];
  const result = evaluateChecks(checks, { signals: { probes: {
    ok: { ok: true, value: 5, text: '5' },
    bad: { ok: true, value: 10, text: '10' },
    missing: { ok: false, error: 'nieMa is not defined' },
  } } });
  expect(result.passed).toBe(1);
  expect(result.results[0].passed).toBe(true);
  expect(result.results[1].message).toContain('10');
  expect(result.results[2].message).toContain('nieMa is not defined');
  expect(result.results[3].passed).toBe(false);
});

test('sourceMatches accepts flexible reassignment forms and rejects constants', () => {
  const check = { id: 'add', type: 'sourceMatches', file: 'script.js', pattern: 'punkty\\s*(?:\\+=\\s*3\\b|=\\s*punkty\\s*\\+\\s*3\\b)', label: 'add 3' };
  const matching = 'let punkty = 2;\npunkty = punkty + 3;';
  const plusEquals = 'let punkty = 2;\npunkty += 3;';
  const hardcoded = 'let punkty = 5;';
  expect(evaluateChecks([check], { files: { 'script.js': matching } }).passed).toBe(1);
  expect(evaluateChecks([check], { files: { 'script.js': plusEquals } }).passed).toBe(1);
  expect(evaluateChecks([check], { files: { 'script.js': hardcoded } }).passed).toBe(0);
});

test('reads exact filenames from a project and a flat filename map',()=>{
  const checks=[{id:'doctype',type:'sourceIncludes',file:'index.html',value:'<!doctype html>'}];
  for(const files of [{'index.html':'<!doctype html><p>Ok</p>'},{entry:'index.html',files:{'index.html':'<!doctype html><p>Ok</p>'}}]) {
    expect(evaluateChecks(checks,{files}).passed).toBe(1);
  }
  expect(evaluateChecks(checks,{files:{'index.html':'',html:'<!doctype html>'}}).passed).toBe(0);
});
