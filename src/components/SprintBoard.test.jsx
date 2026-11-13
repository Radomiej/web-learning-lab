import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import SprintBoard from './SprintBoard.jsx';

afterEach(cleanup);

const CODE = 'controller.move(x, y, input.isKeyDown(Keys.SHIFT) ? 200 : 100);';

describe('SprintBoard', () => {
  it('domyślnie speed=100, przełącznik Shift daje 200', () => {
    render(<SprintBoard code={CODE} />);
    expect(screen.getByRole('status')).toHaveTextContent('speed = 100');
    const keycap = screen.getByRole('switch', { name: 'Shift' });
    expect(keycap).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(keycap);
    expect(keycap).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('move(x, y, 200)');
    fireEvent.click(keycap);
    expect(screen.getByRole('status')).toHaveTextContent('speed = 100');
  });

  it('prawdziwy klawisz Shift włącza sprint tylko na czas przytrzymania', () => {
    render(<SprintBoard code={CODE} />);
    const board = screen.getByRole('group');
    fireEvent.keyDown(board, { key: 'Shift' });
    expect(screen.getByRole('switch', { name: 'Shift' })).toHaveAttribute('aria-checked', 'true');
    fireEvent.keyUp(board, { key: 'Shift' });
    expect(screen.getByRole('switch', { name: 'Shift' })).toHaveAttribute('aria-checked', 'false');
  });

  it('pokazuje kod wywołania i ducha tempa bazowego', () => {
    render(<SprintBoard code={CODE} />);
    expect(screen.getByText(CODE)).toBeInTheDocument();
    expect(screen.getByText('100', { selector: '.pilot-sprint-ghost-label' })).toBeInTheDocument();
    expect(document.querySelector('.pilot-sprint-hint')).toBeInTheDocument();
  });
});
