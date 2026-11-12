import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import ComponentToggleBoard from './ComponentToggleBoard.jsx';

afterEach(cleanup);

const BOARD = {
  kind: 'components',
  object: { name: 'Player', x: 80, y: 90 },
  objectCode: 'GameObject player = createObject("Player");\nplayer.setPosition(80, 90);',
  components: [
    { id: 'renderer', label: 'ShapeRenderer', code: 'player.addComponent(new ShapeRenderer(40, 30, "#76b9f2"));', kind: 'shape', width: 40, height: 30, color: '#76b9f2', on: false },
    { id: 'collider', label: 'CircleCollider2D(12)', code: 'player.addComponent(new CircleCollider2D(12));', kind: 'collider', radius: 12, on: true },
  ],
};

const TWO = {
  kind: 'components',
  object: { name: 'Enemy', x: 280, y: 100 },
  objectCode: 'GameObject enemy = createObject("Enemy");\nenemy.setPosition(280, 100);',
  components: [
    { id: 'enemy-sprite', label: 'Sprite · Enemy', code: 'enemy.addComponent(new Sprite(Assets.SLIME, 32, 32));', kind: 'sprite', asset: 'slime', width: 32, height: 32, on: true, object: { name: 'Enemy', x: 280, y: 100 } },
    { id: 'coin-sprite', label: 'Sprite · Coin', code: 'coin.addComponent(new Sprite(Assets.COIN, 16, 16));', kind: 'sprite', asset: 'coin', width: 16, height: 16, on: true, object: { name: 'Coin', x: 180, y: 180 } },
  ],
};

it('renders the object code, component code lines and a switch per component', () => {
  const { container, getByTestId } = render(<ComponentToggleBoard {...BOARD} />);
  expect(container.textContent).toContain('GameObject player = createObject("Player");');
  expect(container.textContent).toContain('player.addComponent(new ShapeRenderer(40, 30, "#76b9f2"));');
  const switchEl = getByTestId('ct-toggle-renderer');
  expect(switchEl).toHaveAttribute('role', 'switch');
  expect(switchEl).toHaveAttribute('aria-checked', 'false');
  expect(getByTestId('ct-toggle-collider')).toHaveAttribute('aria-checked', 'true');
  expect(getByTestId('ct-marker-Player')).toBeTruthy();
});

it('toggles a component: aria-checked, struck code line, shape and status update', () => {
  const { container, getByTestId, queryByTestId } = render(<ComponentToggleBoard {...BOARD} />);
  expect(queryByTestId('ct-shape-renderer')).toBeNull();
  expect(getByTestId('ct-status').textContent).toContain('wyłączony');
  expect(getByTestId('ct-status').textContent).toContain('(80, 90)');
  fireEvent.click(getByTestId('ct-toggle-renderer'));
  expect(getByTestId('ct-toggle-renderer')).toHaveAttribute('aria-checked', 'true');
  expect(getByTestId('ct-shape-renderer')).toBeTruthy();
  expect(getByTestId('ct-status').textContent).toContain('włączony');
  const line = [...container.querySelectorAll('.pilot-ct-code-line')].find((l) => l.textContent.includes('ShapeRenderer'));
  expect(line.className).not.toContain('--off');
  fireEvent.click(getByTestId('ct-toggle-renderer'));
  expect(queryByTestId('ct-shape-renderer')).toBeNull();
  const off = [...container.querySelectorAll('.pilot-ct-code-line')].find((l) => l.textContent.includes('ShapeRenderer'));
  expect(off.className).toContain('--off');
  expect(off.textContent).toContain('// wyłączony');
});

it('draws one transform marker per distinct object and toggles independently', () => {
  const { getByTestId, queryByTestId } = render(<ComponentToggleBoard {...TWO} />);
  expect(getByTestId('ct-marker-Enemy')).toBeTruthy();
  expect(getByTestId('ct-marker-Coin')).toBeTruthy();
  expect(getByTestId('ct-shape-enemy-sprite')).toBeTruthy();
  expect(getByTestId('ct-shape-coin-sprite')).toBeTruthy();
  fireEvent.click(getByTestId('ct-toggle-coin-sprite'));
  expect(queryByTestId('ct-shape-coin-sprite')).toBeNull();
  expect(getByTestId('ct-shape-enemy-sprite')).toBeTruthy();
});

it('hides the hint after the first toggle and keeps the transform marker', () => {
  const { getByTestId, queryByTestId } = render(<ComponentToggleBoard {...BOARD} />);
  expect(getByTestId('ct-hint')).toBeTruthy();
  fireEvent.click(getByTestId('ct-toggle-collider'));
  expect(queryByTestId('ct-hint')).toBeNull();
  expect(getByTestId('ct-marker-Player')).toBeTruthy();
});
