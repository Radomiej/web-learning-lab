import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import CameraBoard from './CameraBoard.jsx';

afterEach(cleanup);

const BOARD = {
  kind: 'camera',
  player: { name: 'Player', x: 400, y: 300 },
  camera: { x: 400, y: 180 },
  world: { width: 1200, height: 700 },
  view: { width: 640, height: 360 },
  followCode: 'camera.getComponent(Camera2D.class).follow(player);',
  axisCode: 'camera.getComponent(Camera2D.class).{axis} = {value};',
  positionCode: 'camera.setPosition({x}, {y});',
};

it('renders code lines, view frame, switches, slider and shake button', () => {
  const { container, getByTestId } = render(<CameraBoard {...BOARD} />);
  expect(container.textContent).toContain('camera.getComponent(Camera2D.class).follow(player);');
  expect(container.textContent).toContain('followX = true');
  expect(container.textContent).toContain('followY = false');
  expect(getByTestId('cb-player')).toBeTruthy();
  expect(container.querySelector('.pilot-cb-frame')).toBeTruthy();
  expect(getByTestId('cb-followX')).toHaveAttribute('aria-checked', 'true');
  expect(getByTestId('cb-followY')).toHaveAttribute('aria-checked', 'false');
  expect(getByTestId('cb-cameraY')).not.toBeDisabled();
  expect(getByTestId('cb-hint')).toBeTruthy();
});

it('moving the player updates camera center and view origin in the status', () => {
  const { container, getByTestId, queryByTestId } = render(<CameraBoard {...BOARD} />);
  const svg = container.querySelector('svg');
  svg.getBoundingClientRect = () => ({ left: 0, top: 0, width: 552, height: 332, right: 552, bottom: 332 });
  expect(getByTestId('cb-status').textContent).toContain('Kamera w (400, 180)');
  expect(getByTestId('cb-status').textContent).toContain('początek widoku (80, 0)');
  fireEvent.keyDown(svg, { key: 'ArrowRight' });
  expect(getByTestId('cb-status').textContent).toContain('Gracz w (420, 300)');
  expect(getByTestId('cb-status').textContent).toContain('Kamera w (420, 180)');
  expect(queryByTestId('cb-hint')).toBeNull();
});

it('followY switch makes the camera track Y and disables the manual slider', () => {
  const { getByTestId, container } = render(<CameraBoard {...BOARD} />);
  fireEvent.click(getByTestId('cb-followY'));
  expect(getByTestId('cb-followY')).toHaveAttribute('aria-checked', 'true');
  expect(getByTestId('cb-cameraY')).toBeDisabled();
  expect(getByTestId('cb-status').textContent).toContain('Kamera w (400, 300)');
  expect(container.textContent).toContain('followY = true');
});

it('manual Y slider applies while followY is off', () => {
  const { getByTestId } = render(<CameraBoard {...BOARD} />);
  fireEvent.change(getByTestId('cb-cameraY'), { target: { value: '500' } });
  expect(getByTestId('cb-status').textContent).toContain('Kamera w (400, 500)');
  expect(getByTestId('cb-status').textContent).toContain('początek widoku (80, 320)');
});

it('shake button wiggles the frame but keeps the camera position in status', () => {
  vi.useFakeTimers();
  try {
    const { container, getByTestId } = render(<CameraBoard {...BOARD} />);
    fireEvent.click(getByTestId('cb-shake'));
    expect(container.querySelector('.pilot-cb-view--shake')).toBeTruthy();
    expect(getByTestId('cb-status').textContent).toContain('pozycja obiektu kamery zostaje (400, 180)');
    act(() => { vi.advanceTimersByTime(800); });
    expect(container.querySelector('.pilot-cb-view--shake')).toBeNull();
    expect(getByTestId('cb-status').textContent).toContain('Kamera w (400, 180)');
  } finally {
    vi.useRealTimers();
  }
});
