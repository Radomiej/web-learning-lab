import { provideGameLabCompletions,createGameLabSignatureProvider } from './gameLabCompletions.js';

const monaco = {
  Range: class Range {
    constructor(startLineNumber, startColumn, endLineNumber, endColumn) {
      Object.assign(this, { startLineNumber, startColumn, endLineNumber, endColumn });
    }
  },
  languages: {
    CompletionItemKind: Object.fromEntries(['Text', 'Class', 'Constructor', 'Function', 'Method', 'Property'].map((key, index) => [key, index + 1])),
    CompletionItemInsertTextRule: { InsertAsSnippet: 4 },
  },
};

function modelFor(value, workspace = 'game-dev-701-guided') {
  return {
    uri: { path: `/web-learning-lab/${workspace}/game.js` },
    getValue: () => value,
    getOffsetAt: ({ column }) => column - 1,
    getWordUntilPosition: ({ column }) => {
      const before = value.slice(0, column - 1);
      const word = before.match(/[\w$]*$/)?.[0] ?? '';
      return { word, startColumn: column - word.length, endColumn: column };
    },
  };
}

function labels(source, workspace) {
  const position = { lineNumber: 1, column: source.length + 1 };
  return provideGameLabCompletions(monaco, modelFor(source, workspace), position, 'game-dev-701-guided').suggestions;
}

test('suggests actual exported GameLab classes and run entrypoint', () => {
  const suggestions = labels('GameLab.');
  expect(suggestions.map(item => item.label)).toEqual(expect.arrayContaining([
    'Game', 'GameObject', 'Component', 'Sprite', 'TileMap', 'CharacterController2D', 'Tweens', 'run',
  ]));
  expect(suggestions.find(item => item.label === 'run')).toMatchObject({
    insertText: 'run($1)',
    detail: 'GameLab.run(GameClass, { canvas? })',
  });
});

test('suggests tween helpers and context-specific game/component members', () => {
  expect(labels('GameLab.Tweens.').map(item => item.label)).toEqual(['position', 'scale', 'rotation', 'shake']);
  expect(labels('class Mover extends GameLab.Component { onUpdate() { this.').map(item => item.label)).toEqual(expect.arrayContaining([
    'game', 'gameObject', 'transform', 'onUpdate', 'onTrigger',
  ]));
  expect(labels('class Scene extends GameLab.Game { onCreate() { this.').map(item => item.label)).toEqual(expect.arrayContaining([
    'canvas', 'input', 'time', 'createObject', 'find',
  ]));
});

test('does not leak GameLab completions into other lesson models', () => {
  expect(labels('GameLab.', 'react-24-guided')).toEqual([]);
});

test('infers the camera and controller variables used in course examples', () => {
  expect(labels('const camera = object.addComponent(new GameLab.Camera2D()); camera.').map(item => item.label))
    .toEqual(expect.arrayContaining(['follow', 'shake', 'offsetX']));
  expect(labels('const movement = this.getComponent(GameLab.CharacterController2D); movement.').map(item => item.label))
    .toContain('move');
  expect(labels('const player = this.createObject("Player"); player.').map(item => item.label))
    .toContain('setPosition');
  expect(labels('GameLab.Camera2D.')).toEqual([]);
});

test('exposes shared Assets constants, mouse input and scene queries', () => {
 expect(labels('GameLab.Assets.').map(item=>item.label)).toEqual(expect.arrayContaining(['PLAYER01','FIREBALL','UI_BUTTON_BLUE']));
 expect(labels('this.game.input.').map(item=>item.label)).toEqual(expect.arrayContaining(['getPointerPosition','isMousePressed','isMouseReleased']));
 expect(labels('GameLab.InputManager.').map(item=>item.label)).toContain('MOUSE_RIGHT');
 expect(labels('this.game.').map(item=>item.label)).toEqual(expect.arrayContaining(['getObjectsWith','getObjectsWithTag','pause','resume']));
});

test('inserts named arguments and shows the active API parameter',()=>{
 const source='const player = this.createObject("Player"); player.';
 expect(labels(source).find(item=>item.label==='setPosition').insertText).toBe('setPosition(${1:x}, ${2:y})');
 const call='const controller = new GameLab.CharacterController2D(); controller.move(1, 1,';
 const result=createGameLabSignatureProvider('game-dev-701-guided').provideSignatureHelp(modelFor(call),{lineNumber:1,column:call.length+1});
 expect(result.value.activeParameter).toBe(2);
 expect(result.value.signatures[result.value.activeSignature].label).toBe('move(x, y, speed)');
 const ctor='new GameLab.Sprite(GameLab.Assets.PLAYER01,';
 expect(createGameLabSignatureProvider('game-dev-701-guided').provideSignatureHelp(modelFor(ctor),{lineNumber:1,column:ctor.length+1}).value.signatures.length).toBeGreaterThan(0);
});
