import { describe, expect, it, vi, afterEach } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import LifecycleBoard from './LifecycleBoard.jsx';

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('LifecycleBoard', () => {
  it('tworzy obiekt: onCreate raz, onUpdate leci na żywo', () => {
    vi.useFakeTimers();
    render(<LifecycleBoard />);
    expect(screen.getByRole('status')).toHaveTextContent('Obiekt nie istnieje');
    fireEvent.click(screen.getByRole('button', { name: 'Utwórz obiekt' }));
    const log = document.querySelector('.pilot-lifecycle-log');
    expect(log).toHaveTextContent('onCreate()');
    act(() => vi.advanceTimersByTime(100)); // 6 klatek przy 60 FPS
    expect(document.querySelector('.pilot-lifecycle-live')).toHaveTextContent('onUpdate(0.017) — wywołanie #6');
    expect(log).not.toHaveTextContent('onUpdate'); // dziennik = tylko zdarzenia
    expect(screen.getByRole('status')).toHaveTextContent('klatka 6');
  });

  it('wariant lifetime: onCollision w locie, onDestroy na końcu życia', () => {
    vi.useFakeTimers();
    render(<LifecycleBoard variant="lifetime" life={0.1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Utwórz obiekt' }));
    act(() => vi.advanceTimersByTime(120));
    const log = document.querySelector('.pilot-lifecycle-log');
    expect(log).toHaveTextContent('onCollision(Wall)');
    expect(log).toHaveTextContent('onDestroy() — koniec czasu życia');
    expect(screen.getByText('zniszczony')).toBeInTheDocument();
  });

  it('zmiana FPS zmienia delta; ręczne usunięcie loguje onDestroy', () => {
    vi.useFakeTimers();
    render(<LifecycleBoard />);
    fireEvent.click(screen.getByRole('button', { name: '30' }));
    fireEvent.click(screen.getByRole('button', { name: 'Utwórz obiekt' }));
    expect(screen.getByRole('status')).toHaveTextContent('delta = 0.033 s');
    fireEvent.click(screen.getByRole('button', { name: 'Usuń obiekt' }));
    expect(document.querySelector('.pilot-lifecycle-log')).toHaveTextContent('onDestroy() — usunięcie obiektu');
    expect(screen.getByRole('button', { name: 'Utwórz ponownie' })).toBeInTheDocument();
  });

  it('tempo ×0.5 spowalnia odtwarzanie ticków', () => {
    vi.useFakeTimers();
    render(<LifecycleBoard />);
    fireEvent.click(screen.getByRole('button', { name: '×0.5' }));
    fireEvent.click(screen.getByRole('button', { name: 'Utwórz obiekt' }));
    act(() => vi.advanceTimersByTime(100)); // 100 ms realne = 3 klatki przy 60 FPS ×0.5
    expect(document.querySelector('.pilot-lifecycle-live')).toHaveTextContent('wywołanie #3');
  });
});
