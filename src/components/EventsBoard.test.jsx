import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import EventsBoard from './EventsBoard.jsx';

const CODE = 'public void onCreate() { hp = 100; }';

it('starts with player onCreate event and ticking onUpdate line', () => {
  render(<EventsBoard code={CODE} />);
  expect(screen.getByText(/Player\.onCreate\(\) — hp = 100/)).toBeTruthy();
  expect(screen.getByText(/onUpdate\(0\.017\) — wywołanie #0/)).toBeTruthy();
  expect(screen.getByRole('status').textContent).toContain('hp 100');
  expect(screen.getByText(CODE)).toBeTruthy();
});

it('spawned bullet logs onCreate, then onCollision and -1 hp on hit', () => {
  vi.useFakeTimers();
  try {
    render(<EventsBoard code={CODE} />);
    fireEvent.click(screen.getByRole('button', { name: 'Spawn pocisk' }));
    expect(screen.getByText(/Bullet1\.onCreate\(\)/)).toBeTruthy();
    // pocisk leci ~2.1 s do gracza
    act(() => { vi.advanceTimersByTime(2400); });
    expect(screen.getByText(/Player\.onCollision\(Bullet1\)/)).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('hp 99');
  } finally { vi.useRealTimers(); }
});

it('switch off stops ticks, bullets fly through and logs onDisable/onEnable', () => {
  vi.useFakeTimers();
  try {
    render(<EventsBoard code={CODE} />);
    const toggle = screen.getByRole('switch');
    act(() => { vi.advanceTimersByTime(500); });
    const ticksBefore = Number(screen.getByRole('status').textContent.match(/klatka (\d+)/)[1]);
    expect(ticksBefore).toBeGreaterThan(0);
    fireEvent.click(toggle);
    expect(screen.getByText(/Player\.onDisable\(\)/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Spawn pocisk' }));
    act(() => { vi.advanceTimersByTime(3000); });
    const status = screen.getByRole('status').textContent;
    expect(status).toContain('uśpiony');
    expect(Number(status.match(/stanęły na (\d+)/)[1])).toBe(ticksBefore);
    expect(status).toContain('hp 100');
    expect(screen.queryByText(/Player\.onCollision\(/)).toBeNull();
    fireEvent.click(toggle);
    expect(screen.getByText(/Player\.onEnable\(\) — wznawia/)).toBeTruthy();
    act(() => { vi.advanceTimersByTime(500); });
    expect(Number(screen.getByRole('status').textContent.match(/klatka (\d+)/)[1])).toBeGreaterThan(ticksBefore);
  } finally { vi.useRealTimers(); }
});
