import { createEditorUri, getEditorLanguage } from './editorLanguage.js';

test.each([
  ['index.html', 'html'],
  ['styles.css', 'css'],
  ['script.js', 'javascript'],
  ['src/App.js', 'javascript'],
  ['src/App.jsx', 'javascript'],
  ['index.php', 'php'],
  ['notes.txt', 'plaintext'],
])('maps %s to Monaco language %s', (filePath, expected) => {
  expect(getEditorLanguage(filePath)).toBe(expected);
});

test('creates an isolated URI for a task and file', () => {
  expect(createEditorUri('react-32-guided', 'src/App.js')).toBe(
    'inmemory://web-learning-lab/react-32-guided/src%2FApp.js',
  );
});
