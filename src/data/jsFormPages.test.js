import { jsFormPages } from './jsFormPages.js';
import { afterEach } from 'vitest';

afterEach(() => { document.body.innerHTML = ''; });

test('the submit example prevents default navigation and reads name rather than id', () => {
  const page = jsFormPages.find(page => page.title === 'FormData zbiera dane według name');
  document.body.innerHTML = page.markup;
  new Function('document', 'FormData', page.code)(document, FormData);
  document.getElementById('name').value = 'Ola';
  const event = new Event('submit', { bubbles: true, cancelable: true });
  document.getElementById('form').dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
  expect(document.getElementById('result').textContent).toBe('Ola');
  const data = new FormData(document.getElementById('form'));
  expect(data.get('student')).toBe('Ola');
  expect(data.get('name')).toBeNull();
});

test('the form lesson validates whitespace and prints user input as text', () => {
  const page = jsFormPages.find(page => page.title === 'Sprawdź dane po ich odczytaniu');
  document.body.innerHTML = page.markup;
  new Function('document', 'FormData', page.code)(document, FormData);
  const form = document.getElementById('form');
  const input = document.getElementById('name');
  input.value = '   ';
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  expect(document.getElementById('result').textContent).toBe('Podaj imię');
  input.value = ' <b>Ola</b> ';
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  expect(document.getElementById('result').textContent).toBe('Witaj, <b>Ola</b>');
  expect(document.getElementById('result').querySelector('b')).toBeNull();
});

test('FormData omits unchecked checkboxes and keeps number values as text', () => {
  document.body.innerHTML = jsFormPages.find(page => page.title === 'Liczby, checkbox i pola pominięte').markup;
  document.querySelector('[name=count]').value = '3';
  let data = new FormData(document.getElementById('form'));
  expect(data.get('count')).toBe('3');
  expect(data.has('consent')).toBe(false);
  document.querySelector('[name=consent]').checked = true;
  data = new FormData(document.getElementById('form'));
  expect(data.has('consent')).toBe(true);
});
