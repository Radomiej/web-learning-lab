import { describe, expect, it, vi, afterEach } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import LifecycleBoard from './LifecycleBoard.jsx';

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('LifecycleBoard', () => {
  it('tworzy obiekt: onCreate raz, potem ticki onUpdate', () => {
    vi.useFakeTimers();
    render(<LifecycleBoard />);
    expect(screen.getByRole('status')).toHaveTextContent('Obiekt nie istnieje');
    fireEvent.click(screen.getByRole('button', { name: 'Utwórz obiekt' }));
    expect(screen.getByText('Spark')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('klatka 0');
    act(() => vi.advanceTimersByTime(100)); // 6 klatek przy 60 FPS
    expect(screen.getByRole('status')).toHaveTextContent('delta = 0.017 s');
    expect(screen.getByRole('status')).toHaveTextContent('klatka 6');
    const log = document.querySelector('.pilot-lifecycle-log');
    expect(log).toHaveTextContent('onCreate()');
    expect(log).toHaveTextContent('onUpdate(0.017)');
  });

  it('wariant lifetime: onDestroy po przekroczeniu czasu życia', () => {
    vi.useFakeTimers();
    render(<LifecycleBoard variant="lifetime" life={0.1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Utwórz obiekt' }));
    act(() => vi.advanceTimersByTime(120)); // elapsed > 0.1 s przy 60 FPS
    expect(screen.getByText('zniszczony')).toBeInTheDocument();
    const log = document.querySelector('.pilot-lifecycle-log');
    expect(log).toHaveTextContent('onDestroy()');
    expect(screen.getByRole('status')).toHaveTextContent('tyle samo czasu');
  });

  it('zmiana FPS zmienia delta; ręczne usunięcie wywołuje onDestroy', () => {
    vi.useFakeTimers();
    render(<LifecycleBoard />);
    fireEvent.click(screen.getByRole('button', { name: '30' }));
    fireEvent.click(screen.getByRole('button', { name: 'Utwórz obiekt' }));
    expect(screen.getByRole('status')).toHaveTextContent('delta = 0.033 s');
    fireEvent.click(screen.getByRole('button', { name: 'Usuń obiekt' }));
    expect(screen.getByText('zniszczony')).toBeInTheDocument();
    expect(document.querySelector('.pilot-lifecycle-log')).toHaveTextContent('onDestroy() — usunięcie obiektu');
    expect(screen.getByRole('button', { name: 'Utwórz ponownie' })).toBeInTheDocument();
  });
});
