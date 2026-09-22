import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CodeEditor from './CodeEditor.jsx';

function Editor({ initial = 'one\ntwo\nthree', fileKey = 'js' }) {
  const [value, setValue] = useState(initial);
  return <CodeEditor fileKey={fileKey} fileLabel="script.js" value={value} onChange={setValue} />;
}

test('Tab indents selected lines, Shift+Tab outdents and undo restores the edit', () => {
  render(<Editor />);
  const input = screen.getByRole('textbox');
  input.focus(); input.setSelectionRange(0, 8);
  fireEvent.keyDown(input, { key: 'Tab' });
  expect(input.value).toBe('  one\n  two\nthree');
  fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });
  expect(input.value).toBe('one\ntwo\nthree');
  fireEvent.keyDown(input, { key: 'z', ctrlKey: true });
  expect(input.value).toBe('  one\n  two\nthree');
});

test('Ctrl+Shift+K deletes the current line and undo restores it', () => {
  render(<Editor />);
  const input = screen.getByRole('textbox');
  input.focus(); input.setSelectionRange(5, 5);
  fireEvent.keyDown(input, { key: 'K', ctrlKey: true, shiftKey: true });
  expect(input.value).toBe('one\nthree');
  fireEvent.keyDown(input, { key: 'z', ctrlKey: true });
  expect(input.value).toBe('one\ntwo\nthree');
});

test('formats JSX and permits undo without changing its text content', async () => {
  render(<Editor initial={'const App=()=>{return <h1>Witaj</h1>}'} />);
  fireEvent.click(screen.getByRole('button', { name: 'Formatuj kod' }));
  await waitFor(() => expect(screen.getByRole('textbox').value).toContain('  return <h1>Witaj</h1>;'));
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'z', ctrlKey: true });
  expect(screen.getByRole('textbox').value).toBe('const App=()=>{return <h1>Witaj</h1>}');
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
});

test('invalid syntax is reported without replacing student code', async () => {
  render(<Editor initial="const = ;" />);
  fireEvent.click(screen.getByRole('button', { name: 'Formatuj kod' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Nie udało się'));
  expect(screen.getByRole('textbox').value).toBe('const = ;');
});

test('HTML and both CSS files use their own formatter parsers', async () => {
  const { rerender } = render(<Editor key="html" fileKey="html" initial="<main><h1>Tytuł</h1><p>Opis</p></main>" />);
  fireEvent.click(screen.getByRole('button', { name: 'Formatuj kod' }));
  await waitFor(() => expect(screen.getByRole('textbox').value).toContain('\n  <h1>Tytuł</h1>'));
  for (const fileKey of ['baseCss', 'themeCss']) {
    rerender(<Editor key={fileKey} fileKey={fileKey} initial=".card{display:flex;gap:16px}" />);
    fireEvent.click(screen.getByRole('button', { name: 'Formatuj kod' }));
    await waitFor(() => expect(screen.getByRole('textbox').value).toBe('.card {\n  display: flex;\n  gap: 16px;\n}\n'));
  }
});

test('formatting never overwrites typing performed while formatting is pending', async () => {
  render(<Editor initial="const a=1" />);
  fireEvent.click(screen.getByRole('button', { name: 'Formatuj kod' }));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'const a=2' } });
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Kod zmienił się'));
  expect(screen.getByRole('textbox').value).toBe('const a=2');
});

test('Escape then Tab releases keyboard focus instead of trapping it', () => {
  render(<Editor />);
  const input = screen.getByRole('textbox');
  input.focus();
  fireEvent.keyDown(input, { key: 'Escape' });
  expect(fireEvent.keyDown(input, { key: 'Tab' })).toBe(true);
  expect(input.value).toBe('one\ntwo\nthree');
});

test('Enter preserves indentation and deleting the last line removes its preceding newline', () => {
  render(<Editor initial={'one\n  two'} />);
  const input = screen.getByRole('textbox');
  input.focus(); input.setSelectionRange(9, 9);
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(input.value).toBe('one\n  two\n  ');
  fireEvent.keyDown(input, { key: 'k', ctrlKey: true, shiftKey: true });
  expect(input.value).toBe('one\n  two');
});
