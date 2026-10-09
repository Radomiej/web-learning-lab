import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,expect,it} from 'vitest';
import MovementHint from '../../shared/lab-game-v2/editor/MovementHint.jsx';
afterEach(cleanup);
it('explains diagonal sprint with ready-to-use code in each language',()=>{
  const view=render(<MovementHint taskId="g2d.input.modified" language="java"/>);
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('tooltip')).toHaveTextContent('141,4');
  expect(screen.getByRole('tooltip')).toHaveTextContent('new Vector2(dx, dy).normalized()');
  view.rerender(<MovementHint taskId="g2d.input.modified" language="js"/>);
  expect(screen.getByRole('tooltip')).toHaveTextContent('new GameLab.Vector2');
  expect(screen.getByRole('button')).toHaveAttribute('aria-expanded','true');
  fireEvent.click(screen.getByRole('button'));
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.click(screen.getByRole('button'));
  fireEvent.keyDown(screen.getByRole('button'),{key:'Escape'});
  expect(screen.queryByRole('tooltip')).toBeNull();
});
