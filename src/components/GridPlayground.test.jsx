import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import GridPlayground from './GridPlayground.jsx';

afterEach(cleanup);

const getCode = (container) => container.querySelector('.pilot-lb-code').textContent;
const getStatus = (container) => container.querySelector('[role="status"]').textContent;
const getStage = (container) => container.querySelector('.pilot-lb-container');

const AREA = { name: 'nagłówek i dwie kolumny', value: '"header header" "side content"', assign: { A: 'header', B: 'side', C: 'content' } };

describe('GridPlayground', () => {
  it('switches grid-template-columns presets and updates code + status', () => {
    const { container } = render(<GridPlayground controls={['columns', 'gap']} />);
    fireEvent.click(screen.getByRole('radio', { name: 'repeat(3, 1fr)' }));
    expect(getStage(container).style.gridTemplateColumns).toBe('repeat(3, 1fr)');
    expect(getCode(container)).toContain('grid-template-columns: repeat(3, 1fr);');
    expect(getStatus(container)).toContain('repeat(3, 1fr)');
  });

  it('accepts a loosely valid custom columns value and rejects garbage', () => {
    const { container } = render(<GridPlayground controls={['columns']} />);
    const input = screen.getByRole('textbox', { name: 'własne kolumny' });
    fireEvent.change(input, { target: { value: '1fr 2fr' } });
    expect(getStage(container).style.gridTemplateColumns).toBe('1fr 2fr');
    fireEvent.change(input, { target: { value: '!!!' } });
    expect(getStatus(container)).toContain('Nie rozumiem zapisu');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(getStage(container).style.gridTemplateColumns).toBe('1fr 2fr');
  });

  it('lays items onto named areas and writes grid-area rules', () => {
    const { container } = render(
      <GridPlayground controls={['areas', 'gap']} items={['A', 'B', 'C']} areas={[AREA]} />,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'nazwane obszary' }));
    expect(getCode(container)).toContain('grid-template-areas:');
    expect(getCode(container)).toContain('"header header"');
    expect(getCode(container)).toContain('.item:first-child { grid-area: header; }');
    expect(getStatus(container)).toContain('Obszary');
  });

  it('spans the selected item across two columns via a switch', () => {
    const { container } = render(
      <GridPlayground controls={['columns', 'span']} items={['A', 'B', 'C']} spanAxes={['column']} />,
    );
    const toggle = screen.getByRole('switch', { name: 'przez 2 kolumny' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(getCode(container)).toContain('.item:first-child {');
    expect(getCode(container)).toContain('grid-column-start: 1;');
    expect(getCode(container)).toContain('grid-column-end: 3;');
  });

  it('keeps span rules on the item picked by radio', () => {
    const { container } = render(
      <GridPlayground controls={['span']} items={['A', 'B', 'C']} spanAxes={['row']} selected={2} />,
    );
    fireEvent.click(screen.getByRole('switch', { name: 'przez 2 wiersze' }));
    expect(getCode(container)).toContain('.item:last-child {');
    expect(getCode(container)).toContain('grid-row-start: 1;');
    expect(getCode(container)).toContain('grid-row-end: 3;');
  });

  it('centers the whole grid with justify-content', () => {
    const { container } = render(
      <GridPlayground controls={['columns', 'justify']} columns="100px 100px" columnPresets={['100px 100px']} />,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'center' }));
    expect(getStage(container).style.justifyContent).toBe('center');
    expect(getCode(container)).toContain('justify-content: center;');
  });
});
