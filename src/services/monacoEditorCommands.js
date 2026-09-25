export function triggerEditorAction(editor, actionId) {
  editor.trigger('web-learning-lab-command', actionId, null);
}

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
