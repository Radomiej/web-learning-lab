import { evaluateChecks } from './lessonValidator.js';

test('exact output does not accept extra words and requires an existing element', () => {
  const check = { id: 'text', type: 'textEquals', selector: '#result', expected: 'CSS' };
  const run = signal => evaluateChecks([check], { signals: { dom: { '#result': signal } } }).passed;
  expect(run({ exists: true, text: 'CSS' })).toBe(1);
  expect(run({ exists: true, text: 'HTML, CSS' })).toBe(0);
  expect(run({ exists: false, text: 'CSS' })).toBe(0);
});

test('a static final message cannot pass a state-transition exercise', () => {
  const check = { id: 'toggle', type: 'interaction', expected: { beforeText: 'Dzień', textEquals: 'Noc' } };
  const run = interaction => evaluateChecks([check], { signals: { interactions: { toggle: interaction } } }).passed;
  expect(run({ ok: true, before: { text: 'Dzień' }, text: 'Noc' })).toBe(1);
  expect(run({ ok: true, before: { text: 'Noc' }, text: 'Noc' })).toBe(0);
  expect(run({ ok: true, before: { text: 'Dzień' }, text: 'Dzień Noc' })).toBe(0);
});
