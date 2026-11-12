import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import FlexItemBoard from './FlexItemBoard.jsx';

afterEach(cleanup);

const getCode = (container) => container.querySelector('.pilot-lb-code').textContent;
const getStatus = (container) => container.querySelector('[role="status"]').textContent;

describe('FlexItemBoard', () => {
  it('selects an item and writes its rule with the matching selector', () => {
    const { container } = render(<FlexItemBoard scope="each" controls={['grow']} />);
    const third = screen.getByRole('radio', { name: 'Element 3' });
    fireEvent.click(third);
    expect(third).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('radio', { name: '2' }));
    expect(getCode(container)).toContain('.item:last-child {');
    expect(getCode(container)).toContain('flex-grow: 2;');
    expect(getStatus(container)).toContain('udziałem 2');
  });

  it('shows non-default values as badges on the picked item', () => {
    const { container } = render(<FlexItemBoard scope="each" controls={['order']} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Element 1' }));
    fireEvent.click(screen.getByRole('radio', { name: '-1' }));
    expect(container.querySelector('.pilot-lb-badge')).toHaveTextContent('order: -1');
    expect(getCode(container)).toContain('.item:first-child {');
    expect(getStatus(container)).toContain('początek osi');
  });

  it('in scope "all" writes a single .item rule', () => {
    const { container } = render(<FlexItemBoard scope="all" controls={['basis', 'grow']} />);
    fireEvent.click(screen.getByRole('radio', { name: '80px' }));
    fireEvent.click(screen.getByRole('radio', { name: '1' }));
    expect(getCode(container)).toContain('.item {');
    expect(getCode(container)).toContain('flex-basis: 80px;');
    expect(getCode(container)).toContain('flex-grow: 1;');
    expect(getStatus(container)).toContain('Wszystkie elementy');
  });

  it('applies align-self to the chosen item only', () => {
    const { container } = render(<FlexItemBoard scope="each" controls={['alignSelf']} height={170} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Element 3' }));
    fireEvent.click(screen.getByRole('radio', { name: 'flex-end' }));
    const items = container.querySelectorAll('.pilot-lb-item');
    expect(items[2].style.alignSelf).toBe('flex-end');
    expect(items[0].style.alignSelf).toBe('auto');
    expect(getCode(container)).toContain('.item:last-child {\n  align-self: flex-end;\n}');
  });

  it('hides the hint after the first interaction', () => {
    const { queryByTestId, getByTestId } = render(<FlexItemBoard />);
    expect(getByTestId('lb-hint')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Element 2' }));
    expect(queryByTestId('lb-hint')).toBeNull();
  });
});
