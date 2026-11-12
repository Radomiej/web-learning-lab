import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import KeyPressBoard from './KeyPressBoard.jsx';

afterEach(cleanup);

const board = () => screen.getByRole('group', { name: 'Plansza naciśnięcia klawisza' });
const keycap = () => screen.getByRole('button', { name: 'Space' });
const holdSwitch = () => screen.getByRole('switch', { name: 'Przytrzymaj Space' });

it('renders the board with the hint and an empty counter', () => {
  render(<KeyPressBoard code="shooter.shoot();" />);
  expect(board()).toBeInTheDocument();
  expect(screen.getByText('Naciśnij Space!')).toBeInTheDocument();
  expect(screen.getByText('shots = 0')).toBeInTheDocument();
  expect(screen.getByText('pociski: 0')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Czekam na naciśnięcie Space.');
});

it('one press calls shoot() once and hides the hint', () => {
  render(<KeyPressBoard code="shooter.shoot();" />);
  fireEvent.keyDown(board(), { key: ' ' });
  fireEvent.keyUp(board(), { key: ' ' });
  expect(screen.getByText('shots = 1')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Space naciśnięty — BulletShooter.shoot() → pocisk nr 1.');
  expect(screen.queryByText('Naciśnij Space!')).not.toBeInTheDocument();
});

it('clicking the keycap fires a single projectile', () => {
  render(<KeyPressBoard code="shooter.shoot();" />);
  fireEvent.click(keycap());
  expect(screen.getByText('shots = 1')).toBeInTheDocument();
  expect(screen.getByText('pociski: 1')).toBeInTheDocument();
});

it('a held key keeps a single projectile while onUpdate ticks', () => {
  vi.useFakeTimers();
  try {
    render(<KeyPressBoard code="shooter.shoot();" />);
    fireEvent.click(holdSwitch());
    act(() => { vi.advanceTimersByTime(700); });
    expect(screen.getByText('shots = 1')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Klawisz trzymany — isKeyPressed odpala raz; nadal 1 pocisk.');
    fireEvent.click(holdSwitch());
    expect(screen.getByRole('status')).toHaveTextContent('pocisk nr 1');
  } finally {
    vi.useRealTimers();
  }
});

it('a fresh press after release fires a second projectile', () => {
  render(<KeyPressBoard code="shooter.shoot();" />);
  fireEvent.keyDown(board(), { key: ' ' });
  fireEvent.keyUp(board(), { key: ' ' });
  fireEvent.keyDown(board(), { key: ' ' });
  fireEvent.keyUp(board(), { key: ' ' });
  expect(screen.getByText('shots = 2')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('pocisk nr 2');
});
