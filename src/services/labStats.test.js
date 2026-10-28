import { createFrameStats } from '../../shared/lab-game-v2/stats.js';

test('statystyki klatek liczą fps, średnią i max w oknie 3 s', () => {
  const stats = createFrameStats(3000);
  expect(stats.snapshot(0)).toEqual({ frames: 0, fps: 0, avgMs: 0, maxMs: 0 });
  stats.push(16, 1000);
  stats.push(20, 2000);
  stats.push(40, 3000);
  const s = stats.snapshot(3000);
  expect(s.frames).toBe(3);
  expect(s.avgMs).toBeCloseTo(76 / 3, 5);
  expect(s.maxMs).toBe(40);
  expect(s.fps).toBeCloseTo(1000 / (76 / 3), 5);
});

test('stare próbki wypadają z okna czasowego', () => {
  const stats = createFrameStats(3000);
  stats.push(100, 0);
  stats.push(10, 3100);
  stats.push(10, 3200);
  const s = stats.snapshot(3200);
  expect(s.frames).toBe(2);
  expect(s.avgMs).toBe(10);
  expect(s.maxMs).toBe(10);
});

test('reset czyści statystyki; błędne próbki są ignorowane', () => {
  const stats = createFrameStats();
  stats.push(-1, 100);
  stats.push(Number.NaN, 200);
  stats.push(Number.POSITIVE_INFINITY, 300);
  expect(stats.snapshot(400).frames).toBe(0);
  stats.push(16, 500);
  stats.reset();
  expect(stats.snapshot(600).frames).toBe(0);
});
