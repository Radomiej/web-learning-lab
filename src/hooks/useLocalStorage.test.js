import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage.js';

beforeEach(() => {
  window.localStorage.clear();
});

test('uses the default when localStorage contains invalid JSON', () => {
  window.localStorage.setItem('test-key', '{broken');
  const { result } = renderHook(() => useLocalStorage('test-key', { count: 0 }));
  expect(result.current[0]).toEqual({ count: 0 });
});

test('persists functional updates in localStorage', () => {
  const { result } = renderHook(() => useLocalStorage('test-key', 1));
  act(() => result.current[1]((value) => value + 1));
  expect(result.current[0]).toBe(2);
  expect(JSON.parse(window.localStorage.getItem('test-key'))).toBe(2);
});
