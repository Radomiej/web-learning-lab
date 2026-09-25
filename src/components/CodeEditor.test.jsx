import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CodeEditor from './CodeEditor.jsx';

const fallbackMonacoLoader = async () => {
  throw new Error('Monaco disabled for textarea behavior tests');
};

let fakeCreateModel;
let fakeActiveModel;

function createFakeMonacoLoader() {
  const models = [];
  const editor = {
    model: null,
    setModel: vi.fn((model) => { editor.model = model; }),
    getModel: vi.fn(() => editor.model),
    addAction: vi.fn(() => ({ dispose: vi.fn() })),
    layout: vi.fn(),
    dispose: vi.fn(),
    pushUndoStop: vi.fn(),
    executeEdits: vi.fn(),
  };

  fakeCreateModel = vi.fn((source, language, uri) => {
    let current = source;
    let listener;
    const model = {
      getValue: vi.fn(() => current),
      setValue: vi.fn((next) => { current = next; }),
      onDidChangeContent: vi.fn((callback) => {
        listener = callback;
        return { dispose: vi.fn() };
      }),
      dispose: vi.fn(),
      getLanguageId: vi.fn(() => language),
      simulateUserEdit(next) {
        current = next;
        listener?.();
      },
      uri,
    };
    models.push(model);
    fakeActiveModel = model;
    return model;
  });

  const monaco = {
    KeyMod: { Shift: 1, Alt: 2, CtrlCmd: 4 },
    KeyCode: {
      KeyF: 8,
      KeyS: 16,
      KeyK: 32,
      Slash: 64,
      UpArrow: 128,
      DownArrow: 256,
    },
    Uri: { parse: vi.fn((path) => ({ path })) },
    editor: {
      create: vi.fn(() => editor),
      createModel: fakeCreateModel,
    },
    languages: {
      getLanguages: () => [],
      register: vi.fn(),
      setMonarchTokensProvider: vi.fn(),
      setLanguageConfiguration: vi.fn(),
    },
  };

  return async () => ({ monaco, EditorWorker: class FakeWorker {} });
}

function Editor({ initial = 'one\ntwo\nthree', fileKey = 'js', ...props }) {
  const [value, setValue] = useState(initial);
  return <CodeEditor fileKey={fileKey} fileLabel="script.js" value={value} onChange={setValue} monacoLoader={fallbackMonacoLoader} {...props} />;
}

test('Tab indents selected lines, Shift+Tab outdents and undo restores the edit', async () => {
  render(<Editor />);
  const input = await screen.findByRole('textbox');
  input.focus(); input.setSelectionRange(0, 8);
  fireEvent.keyDown(input, { key: 'Tab' });
  expect(input.value).toBe('  one\n  two\nthree');
  fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });
  expect(input.value).toBe('one\ntwo\nthree');
  fireEvent.keyDown(input, { key: 'z', ctrlKey: true });
  expect(input.value).toBe('  one\n  two\nthree');
});

test('Ctrl+Shift+K deletes the current line and undo restores it', async () => {
  render(<Editor />);
  const input = await screen.findByRole('textbox');
  input.focus(); input.setSelectionRange(5, 5);
  fireEvent.keyDown(input, { key: 'K', ctrlKey: true, shiftKey: true });
  expect(input.value).toBe('one\nthree');
  fireEvent.keyDown(input, { key: 'z', ctrlKey: true });
  expect(input.value).toBe('one\ntwo\nthree');
});

test('formats JSX and permits undo without changing its text content', async () => {
  render(<Editor initial={'const App=()=>{return <h1>Witaj</h1>}'} />);
  await screen.findByRole('textbox');
  fireEvent.click(screen.getByRole('button', { name: 'Formatuj kod' }));
  await waitFor(() => expect(screen.getByRole('textbox').value).toContain('  return <h1>Witaj</h1>;'));
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'z', ctrlKey: true });
  expect(screen.getByRole('textbox').value).toBe('const App=()=>{return <h1>Witaj</h1>}');
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
});

test('invalid syntax is reported without replacing student code', async () => {
  render(<Editor initial="const = ;" />);
  await screen.findByRole('textbox');
  fireEvent.click(screen.getByRole('button', { name: 'Formatuj kod' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Nie udało się'));
  expect(screen.getByRole('textbox').value).toBe('const = ;');
});

test('HTML and CSS filenames use their own formatter parsers while aliases remain compatible', async () => {
  const { rerender } = render(<Editor key="pages/index.html" fileKey="pages/index.html" initial="<main><h1>Tytuł</h1><p>Opis</p></main>" />);
  await screen.findByRole('textbox');
  fireEvent.click(screen.getByRole('button', { name: 'Formatuj kod' }));
  await waitFor(() => expect(screen.getByRole('textbox').value).toContain('\n  <h1>Tytuł</h1>'));
  for (const fileKey of ['styles/site.css', 'baseCss', 'themeCss']) {
    rerender(<Editor key={fileKey} fileKey={fileKey} initial=".card{display:flex;gap:16px}" />);
    await screen.findByRole('textbox');
    fireEvent.click(screen.getByRole('button', { name: 'Formatuj kod' }));
    await waitFor(() => expect(screen.getByRole('textbox').value).toBe('.card {\n  display: flex;\n  gap: 16px;\n}\n'));
  }
});

test('nested JSX and JavaScript filenames use the Babel formatter parser', async () => {
  const { rerender } = render(<Editor key="components/Card.jsx" fileKey="components/Card.jsx" initial={'const Card=()=>{return <p>Karta</p>}'} />);
  await screen.findByRole('textbox');
  fireEvent.click(screen.getByRole('button', { name: 'Formatuj kod' }));
  await waitFor(() => expect(screen.getByRole('textbox').value).toContain('  return <p>Karta</p>;'));
  rerender(<Editor key="scripts/app.js" fileKey="scripts/app.js" initial="const add=(left,right)=>left+right" />);
  await screen.findByRole('textbox');
  fireEvent.click(screen.getByRole('button', { name: 'Formatuj kod' }));
  await waitFor(() => expect(screen.getByRole('textbox').value).toContain('const add = (left, right) => left + right;'));
});

test('formatting never overwrites typing performed while formatting is pending', async () => {
  render(<Editor initial="const a=1" />);
  await screen.findByRole('textbox');
  fireEvent.click(screen.getByRole('button', { name: 'Formatuj kod' }));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'const a=2' } });
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Kod zmienił się'));
  expect(screen.getByRole('textbox').value).toBe('const a=2');
});

test('Escape then Tab releases keyboard focus instead of trapping it', async () => {
  render(<Editor />);
  const input = await screen.findByRole('textbox');
  input.focus();
  fireEvent.keyDown(input, { key: 'Escape' });
  expect(fireEvent.keyDown(input, { key: 'Tab' })).toBe(true);
  expect(input.value).toBe('one\ntwo\nthree');
});

test('Enter preserves indentation and deleting the last line removes its preceding newline', async () => {
  render(<Editor initial={'one\n  two'} />);
  const input = await screen.findByRole('textbox');
  input.focus(); input.setSelectionRange(9, 9);
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(input.value).toBe('one\n  two\n  ');
  fireEvent.keyDown(input, { key: 'k', ctrlKey: true, shiftKey: true });
  expect(input.value).toBe('one\n  two');
});

test('Ctrl+S saves the active file and prevents the browser save dialog', async () => {
  const onSave = vi.fn();
  render(
    <CodeEditor
      fileKey="script.js"
      fileLabel="script.js"
      value="const ready = true;"
      onChange={() => {}}
      onSave={onSave}
      monacoLoader={fallbackMonacoLoader}
    />,
  );
  const input = await screen.findByRole('textbox');

  fireEvent.keyDown(input, { key: 's', ctrlKey: true });

  expect(onSave).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('status')).toHaveTextContent('Zapisano plik');
});

test('creates the active file model with the mapped language and URI', async () => {
  const monacoLoader = createFakeMonacoLoader();
  render(
    <CodeEditor
      fileKey="src/App.jsx"
      fileLabel="src/App.jsx"
      workspaceKey="react-32-guided"
      value="export default function App() {}"
      onChange={() => {}}
      monacoLoader={monacoLoader}
    />,
  );

  await screen.findByTestId('monaco-editor');

  expect(fakeCreateModel).toHaveBeenCalledWith(
    expect.any(String),
    'javascript',
    expect.objectContaining({
      path: 'inmemory://web-learning-lab/react-32-guided/src%2FApp.jsx',
    }),
  );
});

test('external reset synchronizes the model without calling onChange', async () => {
  const monacoLoader = createFakeMonacoLoader();
  const onChange = vi.fn();
  const { rerender } = render(
    <CodeEditor
      fileKey="index.html"
      fileLabel="index.html"
      value="old"
      onChange={onChange}
      monacoLoader={monacoLoader}
    />,
  );

  await screen.findByTestId('monaco-editor');
  rerender(
    <CodeEditor
      fileKey="index.html"
      fileLabel="index.html"
      value="starter"
      onChange={onChange}
      monacoLoader={monacoLoader}
    />,
  );

  await waitFor(() => expect(fakeActiveModel.setValue).toHaveBeenCalledWith('starter'));
  expect(onChange).not.toHaveBeenCalled();
});

test('falls back to textarea when Monaco loading fails', async () => {
  render(
    <CodeEditor
      fileKey="index.html"
      fileLabel="index.html"
      value="<main />"
      onChange={() => {}}
      monacoLoader={async () => { throw new Error('worker failed'); }}
    />,
  );

  expect(await screen.findByRole('textbox')).toHaveClass('code-editor');
  expect(screen.getByRole('status')).toHaveTextContent('Monaco');
});
