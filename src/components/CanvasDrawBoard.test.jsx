import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CanvasDrawBoard from './CanvasDrawBoard.jsx';

afterEach(cleanup);

it('renders the button variant with sliders, code and the hint', () => {
  render(<CanvasDrawBoard variant="button" api="canvas." />);
  expect(screen.getByRole('group', { name: 'Plansza prostokąta na canvas' })).toBeInTheDocument();
  expect(screen.getByText('Zmień suwaki!')).toBeInTheDocument();
  expect(screen.getByText(/drawRect\(80, 90, 40, 30/)).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('lewy brzeg wypada na 60, prawy na 100');
  expect(screen.getAllByRole('slider')).toHaveLength(4);
});

it('moving a slider updates the live code and the status', () => {
  render(<CanvasDrawBoard variant="button" api="this.canvas." />);
  fireEvent.change(screen.getByRole('slider', { name: /szerokość/ }), { target: { value: '100' } });
  expect(screen.getByText(/this\.canvas\.drawRect\(80, 90, 100, 30/)).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('lewy brzeg wypada na 30, prawy na 130');
  expect(screen.queryByText('Zmień suwaki!')).not.toBeInTheDocument();
});

it('the text toggle adds and removes drawText in the code', () => {
  render(<CanvasDrawBoard variant="button" api="canvas." />);
  expect(screen.getByText(/drawText\("Start"/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox', { name: /Napis „Start”/ }));
  expect(screen.queryByText(/drawText/)).not.toBeInTheDocument();
});

it('renders the bar variant pinned to the left edge', () => {
  render(<CanvasDrawBoard variant="bar" api="canvas." />);
  expect(screen.getByRole('group', { name: 'Plansza paska na canvas' })).toBeInTheDocument();
  expect(screen.getByText(/width = 200 \* 3 \/ 5/)).toBeInTheDocument();
  fireEvent.change(screen.getByRole('slider', { name: /current/ }), { target: { value: '5' } });
  expect(screen.getByText(/width = 200 \* 5 \/ 5; \/\/ 200/)).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('x = 20 + width/2');
});
