import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import FlexPlayground from './FlexPlayground.jsx';

afterEach(cleanup);

const getCode = (container) => container.querySelector('.pilot-lb-code').textContent;
const getStatus = (container) => container.querySelector('[role="status"]').textContent;
const getStage = (container) => container.querySelector('.pilot-lb-container');

describe('FlexPlayground', () => {
  it('flips flex-direction to column and updates CSS + status live', () => {
    const { container } = render(<FlexPlayground controls={['direction', 'justify']} />);
    const column = screen.getByRole('radio', { name: 'column' });
    expect(column).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(column);
    expect(column).toHaveAttribute('aria-checked', 'true');
    expect(getStage(container).style.flexDirection).toBe('column');
    expect(getCode(container)).toContain('flex-direction: column;');
    expect(getStatus(container)).toContain('kolumnie');
  });

  it('moves justify-content to space-between', () => {
    const { container } = render(<FlexPlayground controls={['justify']} />);
    fireEvent.click(screen.getByRole('radio', { name: 'space-between' }));
    expect(getStage(container).style.justifyContent).toBe('space-between');
    expect(getCode(container)).toContain('justify-content: space-between;');
    expect(getStatus(container)).toContain('krawędziami');
  });

  it('hides the hint after the first interaction', () => {
    const { queryByTestId, getByTestId } = render(<FlexPlayground />);
    expect(getByTestId('lb-hint')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'column' }));
    expect(queryByTestId('lb-hint')).toBeNull();
  });

  it('updates the gap rule from the slider', () => {
    const { container } = render(<FlexPlayground controls={['gap']} />);
    fireEvent.change(screen.getByRole('slider', { name: 'gap' }), { target: { value: '16' } });
    expect(getStage(container).style.rowGap).toBe('16px');
    expect(getCode(container)).toContain('gap: 16px;');
    expect(getStatus(container)).toContain('16px');
  });

  it('shrinks the container with the width slider to show wrapping', () => {
    const { container } = render(<FlexPlayground controls={['wrap', 'width']} />);
    fireEvent.change(screen.getByRole('slider', { name: 'szerokość kontenera' }), { target: { value: '45' } });
    expect(getStage(container).style.width).toBe('45%');
    fireEvent.click(screen.getByRole('radio', { name: 'wrap' }));
    expect(getCode(container)).toContain('flex-wrap: wrap;');
    expect(getStatus(container)).toContain('kolejnych wierszy');
  });

  it('moves the selection with arrow keys inside a radio group', () => {
    render(<FlexPlayground controls={['direction']} />);
    const row = screen.getByRole('radio', { name: 'row' });
    fireEvent.keyDown(row, { key: 'ArrowRight' });
    const column = screen.getByRole('radio', { name: 'column' });
    expect(column).toHaveAttribute('aria-checked', 'true');
    expect(document.activeElement).toBe(column);
  });
});
