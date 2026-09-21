import { renderHook, act } from '@testing-library/react';
import { useCourseProgress } from './useCourseProgress.js';
import { lessons } from '../data/lessons.js';

beforeEach(() => {
  window.localStorage.clear();
});

test('restores edited files for a selected task after remount', () => {
  const first = renderHook(() => useCourseProgress(lessons));
  act(() => first.result.current.updateFiles('html-02-guided', { html: '<h1>Nowy tytuł</h1>' }));
  first.unmount();

  const next = renderHook(() => useCourseProgress(lessons));
  expect(next.result.current.filesByTask['html-02-guided'].html).toBe('<h1>Nowy tytuł</h1>');
});

test('resetTask returns the task starter without clearing another task', () => {
  const { result } = renderHook(() => useCourseProgress(lessons));
  act(() => result.current.updateFiles('layout-15-guided', { html: '<div>zmiana</div>' }));
  act(() => result.current.updateFiles('layout-16-guided', { html: '<div>inna</div>' }));
  act(() => result.current.resetTask('layout-15-guided'));
  expect(result.current.filesByTask['layout-15-guided'].html).not.toBe('<div>zmiana</div>');
  expect(result.current.filesByTask['layout-16-guided'].html).toBe('<div>inna</div>');
});
