import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import NormalizeRaceBoard from './NormalizeRaceBoard.jsx';

afterEach(cleanup);

const CODE = 'transform.x += direction.x / n * speed * delta;';

describe('NormalizeRaceBoard', () => {
  it('pokazuje długość wektora i jednostkowy dla (3, 4)', () => {
    render(<NormalizeRaceBoard code={CODE} />);
    expect(screen.getByRole('status')).toHaveTextContent('|v| = 5');
    expect(screen.getByRole('status')).toHaveTextContent('surowy: 500 px/s');
    expect(screen.getByRole('status')).toHaveTextContent('(0.6, 0.8)');
    expect(screen.getByRole('status')).toHaveTextContent('zawsze 100 px/s');
  });

  it('zmiana wektora przelicza status; (0, 0) wyłącza start', () => {
    render(<NormalizeRaceBoard code={CODE} />);
    fireEvent.click(screen.getByRole('button', { name: '(1, 0)' }));
    expect(screen.getByRole('status')).toHaveTextContent('surowy: 100 px/s');
    fireEvent.click(screen.getByRole('button', { name: '(0, 0)' }));
    expect(screen.getByRole('status')).toHaveTextContent('nie dzielisz przez zero');
    expect(screen.getByRole('button', { name: /Start/ })).toBeDisabled();
  });

  it('start chowa podpowiedź i rysuje tory obu kulek', () => {
    render(<NormalizeRaceBoard code={CODE} />);
    fireEvent.click(screen.getByRole('button', { name: /Start/ }));
    expect(document.querySelector('.pilot-race-hint')).not.toBeInTheDocument();
    expect(document.querySelector('.pilot-race-path-raw')).toBeInTheDocument();
    expect(document.querySelector('.pilot-race-path-norm')).toBeInTheDocument();
    expect(screen.getByText(CODE)).toBeInTheDocument();
  });
});
