# Monaco Editor Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Replace the shared Web Learning Lab textarea editor with Monaco while preserving the current course, sandbox, persistence, formatting, shortcuts, and fallback behavior.

**Architecture:** Add a pure file-language/URI mapping service, a small Monaco action service, and a lazy Monaco loader. `CodeEditor` owns one Monaco editor instance plus one model per file in the active task; `LessonWorkspace` supplies a stable task workspace key and no longer remounts the editor when a tab changes. The existing callbacks remain the integration boundary, so sandbox execution and lesson validation do not change.

**Tech Stack:** React 18, Vite 6, `monaco-editor` 0.55.x, Monaco editor worker, Vitest, Testing Library, existing Prettier formatter, current HTML/CSS/JavaScript/React/PHP runtime.

**Spec:** `docs/superpowers/specs/2026-09-24-monaco-editor-design.md`

## Global Constraints

- Use direct `monaco-editor`, not a React wrapper.
- Load Monaco and its worker asynchronously; never block the initial course screen.
- Map `.html` to `html`, `.css` to `css`, `.js`/`.jsx` to `javascript`, `.php` to `php`, and unknown files to `plaintext`.
- Keep `CodeEditor` callback props (`onChange`, `onRun`, `onSave`, `onReset`, `onCheck`, `onSolution`) compatible with current callers.
- Keep the `textarea` fallback usable when Monaco or its worker fails to load.
- Do not change sandbox execution, lesson validators, project storage, or runtime manifests.
- Keep the existing offline/local runtime; Monaco must not load a language server or external CDN asset.
- Run tests sequentially. Use no more than two agents; this plan uses native execution in the current session and no agents.

## Review Focus

- A `.js` React component and a normal JavaScript file must receive the same `javascript` Monaco language while their existing profile-aware icons and paths remain unchanged. Pin this in the language mapping test in Task 1.
- A task switch must dispose old models/listeners so undo and edits cannot leak from one task into another. Pin this in the workspace lifecycle test in Task 3.
- An external reset or solution update must update the active model without triggering a second `onChange`/localStorage write. Pin this in the model synchronization test in Task 3.
- If the dynamic Monaco/worker import rejects, the learner must still be able to edit and save through the textarea fallback. Pin this in the loader failure test in Task 3.
- `Ctrl/Cmd+S`, formatting, comment, delete-line, move-line, and duplicate-line commands must be attached to the current editor, not a stale model or callback. Pin command definitions in Task 2 and the real interaction in Task 3.

---

### Task 1: Add the Monaco dependency and pure language mapping

- [x] Complete Task 1 and its verification.

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/services/editorLanguage.js`
- Test: `src/services/editorLanguage.test.js`

**Interfaces:**
- Consumes: a project-relative file path string.
- Produces: `getEditorLanguage(filePath) => string` and `createEditorUri(workspaceKey, filePath) => string`.

- [ ] **Step 1: Write the failing language and URI tests**

Create `src/services/editorLanguage.test.js`:

```js
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
```

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run:

```powershell
npm test -- --run src/services/editorLanguage.test.js
```

Expected: FAIL because `src/services/editorLanguage.js` does not exist yet.

- [ ] **Step 3: Install the exact Monaco dependency**

Run:

```powershell
npm install monaco-editor@^0.55.1
```

Keep the lockfile change limited to the new direct dependency and its transitive package data.

- [ ] **Step 4: Implement the pure mapping module**

Create `src/services/editorLanguage.js`:

```js
const LANGUAGE_BY_EXTENSION = Object.freeze({
  html: 'html',
  css: 'css',
  js: 'javascript',
  jsx: 'javascript',
  php: 'php',
});

export function getEditorLanguage(filePath = '') {
  const extension = String(filePath).toLowerCase().split('.').pop();
  return LANGUAGE_BY_EXTENSION[extension] || 'plaintext';
}

export function createEditorUri(workspaceKey = 'lesson', filePath = 'untitled') {
  return `inmemory://web-learning-lab/${encodeURIComponent(workspaceKey)}/${encodeURIComponent(filePath)}`;
}
```

- [ ] **Step 5: Run the focused test and verify it passes**

Run the same command from Step 2. Expected: 2 tests pass.

- [ ] **Step 6: Commit the dependency and mapping boundary**

```powershell
git add package.json package-lock.json src/services/editorLanguage.js src/services/editorLanguage.test.js
git commit -m "feat: add Monaco language mapping"
```

### Task 2: Add the Monaco loader and editor command definitions

- [x] Complete Task 2 and its verification.

**Files:**
- Create: `src/services/monacoRuntime.js`
- Create: `src/services/monacoRuntime.test.js`
- Create: `src/services/monacoEditorCommands.js`
- Create: `src/services/monacoEditorCommands.test.js`

**Interfaces:**
- Consumes: the direct `monaco-editor` package and callbacks `{ format, save }`.
- Produces: `loadMonaco() => Promise<{ monaco, EditorWorker }>`; `registerPhpLanguage(monaco, phpLanguage)`; `createEditorActions(monaco, callbacks) => MonacoAction[]`; and `triggerEditorAction(editor, actionId) => void`.

- [ ] **Step 1: Write the failing command contract tests**

Create a minimal Monaco fake with `KeyMod`, `KeyCode`, and `languages` kinds. Assert that `createEditorActions` returns actions with these IDs and keybindings: `wll.format`, `wll.save`, `wll.delete-line`, `wll.toggle-comment`, `wll.move-line-up`, `wll.move-line-down`, `wll.duplicate-line-up`, and `wll.duplicate-line-down`. Assert that invoking `wll.format` calls `callbacks.format()` and invoking `wll.save` calls `callbacks.save()`.

The test must also assert that `triggerEditorAction(editor, 'editor.action.deleteLines')` calls `editor.trigger('web-learning-lab-command', 'editor.action.deleteLines', null)`.

- [ ] **Step 2: Run the command test to verify it fails**

```powershell
npm test -- --run src/services/monacoEditorCommands.test.js
```

Expected: FAIL because the command module does not exist.

- [ ] **Step 3: Implement the command definitions**

`createEditorActions` must use Monaco key constants rather than browser key strings:

```js
export function createEditorActions(monaco, { format, save }) {
  return [
    {
      id: 'wll.format',
      label: 'Web Learning Lab: Formatuj kod',
      keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
      run: format,
    },
    {
      id: 'wll.save',
      label: 'Web Learning Lab: Zapisz i odśwież podgląd',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: save,
    },
    {
      id: 'wll.delete-line',
      label: 'Web Learning Lab: Usuń linię',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK],
      run: (editor) => triggerEditorAction(editor, 'editor.action.deleteLines'),
    },
    {
      id: 'wll.toggle-comment',
      label: 'Web Learning Lab: Przełącz komentarz',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash],
      run: (editor) => triggerEditorAction(editor, 'editor.action.commentLine'),
    },
    {
      id: 'wll.move-line-up',
      label: 'Web Learning Lab: Przenieś linię wyżej',
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.UpArrow],
      run: (editor) => triggerEditorAction(editor, 'editor.action.moveLinesUpAction'),
    },
    {
      id: 'wll.move-line-down',
      label: 'Web Learning Lab: Przenieś linię niżej',
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.DownArrow],
      run: (editor) => triggerEditorAction(editor, 'editor.action.moveLinesDownAction'),
    },
    {
      id: 'wll.duplicate-line-up',
      label: 'Web Learning Lab: Duplikuj linię wyżej',
      keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.UpArrow],
      run: (editor) => triggerEditorAction(editor, 'editor.action.copyLinesUpAction'),
    },
    {
      id: 'wll.duplicate-line-down',
      label: 'Web Learning Lab: Duplikuj linię niżej',
      keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.DownArrow],
      run: (editor) => triggerEditorAction(editor, 'editor.action.copyLinesDownAction'),
    },
  ];
}
```

`wll.save` should call the current save callback and let Monaco keep its built-in browser-independent command semantics. The existing button remains available for keyboard fallback.

- [ ] **Step 4: Write the failing loader/configuration tests**

Test `registerPhpLanguage` with a fake Monaco object: it must register `php`, set the aliases/extensions, and install the imported `language` and `conf` exactly once. A second call must not register the same language twice.

- [ ] **Step 5: Implement the lazy loader and PHP registration**

`src/services/monacoRuntime.js` must contain a module-level promise cache and use these imports inside `loadMonaco`:

```js
const monacoPromise = import('monaco-editor');
const workerPromise = import('monaco-editor/esm/vs/editor/editor.worker?worker');
const phpPromise = import('monaco-editor/esm/vs/basic-languages/php/php.js');
```

Set `globalThis.MonacoEnvironment.getWorker` to construct the imported worker. Return the normalized Monaco default export and worker constructor. Do not create an editor inside this module.

- [ ] **Step 6: Run both focused service tests**

```powershell
npm test -- --run src/services/monacoEditorCommands.test.js src/services/monacoRuntime.test.js
```

Expected: all command and loader tests pass sequentially in one Vitest invocation.

- [ ] **Step 7: Commit the loader and commands**

```powershell
git add src/services/monacoRuntime.js src/services/monacoRuntime.test.js src/services/monacoEditorCommands.js src/services/monacoEditorCommands.test.js
git commit -m "feat: configure Monaco workers and shortcuts"
```

### Task 3: Refactor `CodeEditor` to Monaco with models and fallback

- [x] Complete Task 3 and its focused verification.

**Files:**
- Modify: `src/components/CodeEditor.jsx`
- Modify: `src/components/CodeEditor.test.jsx`
- Modify: `src/components/LessonWorkspace.jsx`

**Interfaces:**
- Consumes: `fileKey`, `fileLabel`, `value`, `workspaceKey`, existing callbacks, `loadMonaco`, `getEditorLanguage`, `createEditorUri`, and command definitions.
- Produces: the same visible editor actions plus a Monaco host with `data-testid="monaco-editor"`; a textarea fallback only when Monaco loading fails.

- [ ] **Step 1: Add a test harness and write failing lifecycle tests**

Extend `CodeEditor.test.jsx` with a fake `loadMonaco` injected through a test-only prop or module mock. The fake editor must expose `setModel`, `getModel`, `addAction`, `layout`, and `dispose`; the fake model must expose `getValue`, `setValue`, `onDidChangeContent`, `dispose`, and `getLanguageId`.

Add tests that assert:

```js
test('creates the active file model with the mapped language and URI', async () => {
  render(<Editor fileKey="src/App.jsx" workspaceKey="react-32-guided" />);
  await screen.findByTestId('monaco-editor');
  expect(fakeCreateModel).toHaveBeenCalledWith(
    expect.any(String),
    'javascript',
    expect.objectContaining({ path: 'inmemory://web-learning-lab/react-32-guided/src%2FApp.jsx' }),
  );
});

test('external reset synchronizes the model without calling onChange', async () => {
  const onChange = vi.fn();
  const { rerender } = render(<Editor value="old" onChange={onChange} />);
  await screen.findByTestId('monaco-editor');
  rerender(<Editor value="starter" onChange={onChange} />);
  expect(fakeActiveModel.setValue).toHaveBeenCalledWith('starter');
  expect(onChange).not.toHaveBeenCalled();
});

test('falls back to textarea when Monaco loading fails', async () => {
  render(<Editor monacoLoader={async () => { throw new Error('worker failed'); }} />);
  expect(await screen.findByRole('textbox')).toHaveClass('code-editor');
  expect(screen.getByRole('status')).toHaveTextContent('Monaco');
});
```

The test fake must call the model content listener only for simulated user edits; `setValue` used by synchronization must not call it.

- [ ] **Step 2: Run the focused component test and verify failure**

```powershell
npm test -- --run src/components/CodeEditor.test.jsx
```

Expected: the new Monaco lifecycle tests fail because `CodeEditor` has no `workspaceKey`, Monaco host, or loader path.

- [ ] **Step 3: Implement the Monaco lifecycle**

Refactor `CodeEditor` using these refs:

```js
const editorHostRef = useRef(null);
const editorRef = useRef(null);
const monacoRef = useRef(null);
const modelsRef = useRef(new Map());
const listenersRef = useRef(new Map());
const sourceRef = useRef(value);
const onChangeRef = useRef(onChange);
const ignoreModelChangeRef = useRef(false);
```

Add `workspaceKey = 'lesson'` and optional `monacoLoader = loadMonaco` props. Mount Monaco once per workspace key, create `monaco.editor.create` with `automaticLayout`, `minimap: { enabled: false }`, `theme: 'vs-dark'`, `fontSize: 13`, `lineHeight: 21`, `tabSize: 2`, `scrollBeyondLastLine: false`, and the existing editor padding. Use `getEditorLanguage(fileKey)` and `createEditorUri(workspaceKey, fileKey)` when creating a model.

On model changes, call `onChangeRef.current(fileKey, model.getValue())` only when `ignoreModelChangeRef.current` is false. On external `value` changes, call `model.setValue(value)` inside the ignore guard. On file changes, create-or-reuse the model and call `editor.setModel(model)`. On unmount/workspace change, dispose listeners, models, actions, completion providers, editor, and clear refs.

Keep the current textarea editor path in a small fallback branch. The fallback must retain `formatCode`, undo/redo, `Ctrl/Cmd+S`, Tab/Shift+Tab, Enter indentation, delete line, and existing buttons. Show `Ładowanie edytora…` while the async loader is pending and an accessible status explaining that the fallback is active after failure.

- [ ] **Step 4: Add the stable workspace prop and remove path remounting**

In `LessonWorkspace.jsx`, pass `workspaceKey={activeTask.id}` to `CodeEditor` and remove the `key={`${activeTask.id}:${path}`}` remount key. Keep `fileKey={path}` and the existing `value={files.files[path] || ''}`. This lets Monaco preserve models across tabs while changing the workspace key when the task changes.

- [ ] **Step 5: Wire actions and format/save refs**

Register `createEditorActions(monaco, { format: handleFormat, save: onSave })` after creating the editor. `handleFormat` must read the active Monaco model, call the existing async `formatCode(model.getValue(), fileKey)`, and apply the result with `pushUndoStop`/`executeEdits`, preserving the existing stale-edit guard. The button should call the same handler. Register actions only once per editor instance and dispose every returned action during cleanup.

- [ ] **Step 6: Run the focused component tests and the existing editor tests**

```powershell
npm test -- --run src/components/CodeEditor.test.jsx src/components/components.test.jsx
```

Expected: all old textarea behavior tests that exercise the fallback and all new Monaco lifecycle tests pass.

- [ ] **Step 7: Commit the editor integration**

```powershell
git add src/components/CodeEditor.jsx src/components/CodeEditor.test.jsx src/components/LessonWorkspace.jsx
git commit -m "feat: replace course textarea with Monaco"
```

### Task 4: Add Monaco styling and language/status UI

- [x] Complete Task 4 and its focused verification.

**Files:**
- Modify: `src/styles/app.css`
- Modify: `src/components/CodeEditor.jsx`
- Modify: `src/components/EditorHelp.jsx` only if the existing shortcut tooltip needs the Monaco actions listed
- Test: `src/components/CodeEditor.test.jsx`

**Interfaces:**
- Consumes: the Monaco host and editor state from Task 3.
- Produces: a readable editor shell that fits the existing desktop/mobile layout and exposes the active language and loading/fallback status.

- [ ] **Step 1: Write the failing UI assertions**

Add assertions for a React file and PHP file:

```js
expect(screen.getByText('JavaScript / JSX · Monaco')).toBeInTheDocument();
expect(screen.getByText('PHP · Monaco')).toBeInTheDocument();
expect(screen.getByTestId('monaco-editor')).toHaveClass('monaco-editor-host');
```

Also assert that the fallback status is visible when the loader rejects and that the help tooltip still lists save, format, delete line, comment, move, and duplicate actions without clipping.

- [ ] **Step 2: Run the UI test to verify the new assertions fail**

```powershell
npm test -- --run src/components/CodeEditor.test.jsx
```

- [ ] **Step 3: Implement the UI and responsive styles**

Render the active language label from `getEditorLanguage(fileKey)` with these visible labels: `HTML · Monaco`, `CSS · Monaco`, `JavaScript / JSX · Monaco`, `PHP · Monaco`, and `Plik tekstowy · Monaco`. Add `.monaco-editor-wrap`, `.monaco-editor-host`, `.monaco-loading`, and fallback status styles. Keep the existing `editor-card` height and mobile behavior; Monaco must use `automaticLayout` and its host must have a non-zero minimum height.

Use the existing design tokens. Do not add a second toolbar or move sandbox controls into the editor.

- [ ] **Step 4: Run the UI test and the full component group**

```powershell
npm test -- --run src/components/CodeEditor.test.jsx src/components/EditorHelp.test.jsx src/components/components.test.jsx
```

Expected: all tests pass, including the pre-existing tooltip and layout behavior.

- [ ] **Step 5: Commit the visual integration**

```powershell
git add src/styles/app.css src/components/CodeEditor.jsx src/components/EditorHelp.jsx src/components/CodeEditor.test.jsx
git commit -m "feat: polish Monaco editor states"
```

### Task 5: Verify all course languages and the learner workflow

**Files:**
- Modify only files directly required by a failing verification from Tasks 1–4.
- Test: existing project, sandbox, and runtime test files plus browser smoke.

**Interfaces:**
- Consumes: the completed Monaco editor integration.
- Produces: evidence that every current course runtime still works with the new editor.

- [ ] **Step 1: Run all focused service and editor tests sequentially**

```powershell
npm test -- --run src/services/editorLanguage.test.js
npm test -- --run src/services/monacoEditorCommands.test.js src/services/monacoRuntime.test.js
npm test -- --run src/components/CodeEditor.test.jsx src/components/EditorHelp.test.jsx src/components/components.test.jsx
```

Stop and fix the nearest focused test if any command fails before continuing.

- [ ] **Step 2: Run the complete test suite**

```powershell
npm test -- --reporter=dot
```

Expected: every existing test plus the new Monaco tests passes with zero failures.

- [ ] **Step 3: Build the production bundle**

```powershell
npm run build
```

Expected: Vite resolves the dynamic Monaco and worker imports. A chunk-size warning is acceptable if it is the same known warning; unresolved worker or language imports are not.

- [ ] **Step 4: Start the requested dev server**

```powershell
npm run dev -- --host 127.0.0.1 --port 5181
```

Keep the process running and use `http://127.0.0.1:5181/` for browser verification.

- [ ] **Step 5: Perform the browser smoke flow**

The flow under test is: app loads → HTML lesson opens → React lesson opens → file tabs switch → Monaco edits code → Ctrl+S refreshes iframe → PHP file opens in PHP mode → reload preserves code.

Verify in the browser:

1. The page is not blank, has no framework error overlay, and the first viewport shows the course and editor.
2. `index.html` reports HTML/Monaco, a CSS tab reports CSS/Monaco, `script.js` reports JavaScript/JSX/Monaco, and `index.php` reports PHP/Monaco.
3. React lesson 32 opens the CRA tabs `public/index.html`, `src/index.css`, `src/App.css`, `src/index.js`, and `src/App.js` without losing content while switching tabs.
4. Edit `src/App.js`, press `Ctrl+S`, and observe the iframe update plus the existing save status; enable auto-preview and confirm a later edit refreshes after the debounce.
5. Use `Sprawdź`, `Pokaż rozwiązanie`, add a component, reload, and confirm the existing progress/project behavior is unchanged.
6. Open a PHP lesson/file and verify syntax highlighting loads; if the PHP runtime is already available, run the existing PHP preview smoke without changing its execution path.
7. Check the browser console for new Monaco/worker errors. A fresh page must not show errors caused by stale HMR chunks.

- [ ] **Step 6: Fix any browser regression with TDD**

For every discovered regression, first add the smallest failing focused test, run it red, apply the minimal fix, run it green, and rerun the full suite and build sequentially.

- [ ] **Step 7: Review final diff and commit verification fixes**

```powershell
git diff --check
git status --short
git diff --stat HEAD~4..HEAD
```

Confirm the untracked PHP design/plan artifacts and unrelated work are not staged accidentally. Commit only verification fixes using a focused message such as `fix: stabilize Monaco editor lifecycle`.

## Final acceptance checklist

- [ ] `monaco-editor` is installed and the worker is bundled locally.
- [ ] HTML, CSS, JavaScript/JSX, PHP, and plaintext modes are selected by file path.
- [ ] Models are isolated by task and preserved across file tabs.
- [ ] Reset/solution synchronization does not create feedback loops.
- [ ] Fallback textarea works when Monaco loading fails.
- [ ] Existing formatting, save, auto-preview, checking, reset, and solution actions work.
- [ ] Focused tests, full tests, build, and browser smoke pass.
- [ ] Final implementation is committed; no push is performed unless explicitly requested.
