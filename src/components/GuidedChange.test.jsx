import {test,expect} from 'vitest';
import {render,screen} from '@testing-library/react';
import GuidedChange from '../../shared/lab-game-v2/editor/GuidedChange.jsx';
import {changedRange} from '../../shared/lab-game-v2/editor/guidedChanges.js';
test('points to the changed statement instead of the surrounding scaffolding',()=>{
 const before='createPlayer();\n// TODO: show\nready();',after='createPlayer();\naddSprite();\nready();';
 const change=changedRange(before,after);expect(change.text).toBe('addSprite();');expect(change.from).toEqual({line:2,column:1});
 render(<GuidedChange starter={{'game.js':before}} solution={{'game.js':after}} explanation="Sprite nadaje widoczny wygląd."/>);
 expect(screen.getByLabelText('Wyjaśnienie zmiany')).toHaveTextContent('Sprite nadaje widoczny wygląd.');
 expect(document.querySelector('mark')).toHaveTextContent('addSprite();');
});
