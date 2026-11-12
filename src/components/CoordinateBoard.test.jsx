import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CoordinateBoard from './CoordinateBoard.jsx';

afterEach(cleanup);

const player = () => screen.getByRole('button', { name: /^Gracz — pozycja/ });

it('renders the start position', () => {
  render(<CoordinateBoard />);
  expect(screen.getByRole('group', { name: 'Plansza układu współrzędnych' })).toBeInTheDocument();
  expect(screen.getByText('transform.x = 100')).toBeInTheDocument();
  expect(screen.getByText('transform.y = 150')).toBeInTheDocument();
  expect(player()).toHaveAccessibleName(/x 100, y 150/);
});

it('moves by 5 with arrows and by 25 with Shift', () => {
  render(<CoordinateBoard start={{ x: 80, y: 90 }} />);
  fireEvent.keyDown(player(), { key: 'ArrowRight' });
  expect(screen.getByText('transform.x = 85')).toBeInTheDocument();
  fireEvent.keyDown(player(), { key: 'ArrowDown', shiftKey: true });
  expect(screen.getByText('transform.y = 115')).toBeInTheDocument();
  expect(screen.getByText('Przesunięcie: x +5, y +25')).toBeInTheDocument();
  expect(screen.getByText(/player\.transform\.x \+= 5;/)).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('x 85, y 115');
});

it('clamps inside the world', () => {
  render(<CoordinateBoard start={{ x: 10, y: 290 }} />);
  for (let i = 0; i < 3; i += 1) {
    fireEvent.keyDown(player(), { key: 'ArrowLeft', shiftKey: true });
    fireEvent.keyDown(player(), { key: 'ArrowDown', shiftKey: true });
  }
  expect(screen.getByText('transform.x = 0')).toBeInTheDocument();
  expect(screen.getByText('transform.y = 300')).toBeInTheDocument();
});

it('hides the drag hint after the first move and resets to start', () => {
  render(<CoordinateBoard />);
  expect(screen.getByText('Przeciągnij mnie!')).toBeInTheDocument();
  fireEvent.keyDown(player(), { key: 'ArrowUp' });
  expect(screen.queryByText('Przeciągnij mnie!')).not.toBeInTheDocument();
  expect(screen.getByText('transform.y = 145')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Wróć na start' }));
  expect(screen.getByText('transform.y = 150')).toBeInTheDocument();
  expect(screen.getByText('x rośnie w prawo, y rośnie w dół')).toBeInTheDocument();
});
