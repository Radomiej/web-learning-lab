import { createEditorActions, triggerEditorAction } from './monacoEditorCommands.js';

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
};

test('exposes the course editing actions with Monaco keybindings', () => {
  const actions = createEditorActions(monaco, { format: vi.fn(), save: vi.fn() });

  expect(actions.map((action) => action.id)).toEqual([
    'wll.format',
    'wll.save',
    'wll.delete-line',
    'wll.toggle-comment',
    'wll.move-line-up',
    'wll.move-line-down',
    'wll.duplicate-line-up',
    'wll.duplicate-line-down',
  ]);
    expect(actions[0].keybindings).toEqual([11]);
  expect(actions[1].keybindings).toEqual([20]);
});

test('format and save actions call the current callbacks', () => {
  const format = vi.fn();
  const save = vi.fn();
  const actions = createEditorActions(monaco, { format, save });
  const editor = {};

  actions.find((action) => action.id === 'wll.format').run(editor);
  actions.find((action) => action.id === 'wll.save').run(editor);

  expect(format).toHaveBeenCalledWith(editor);
  expect(save).toHaveBeenCalledWith(editor);
});

test('delegates built-in editor commands through Monaco trigger', () => {
  const editor = { trigger: vi.fn() };

  triggerEditorAction(editor, 'editor.action.deleteLines');

  expect(editor.trigger).toHaveBeenCalledWith(
    'web-learning-lab-command',
    'editor.action.deleteLines',
    null,
  );
});
