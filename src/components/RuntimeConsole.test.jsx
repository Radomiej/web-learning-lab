import { render, screen } from '@testing-library/react';
import RuntimeConsole from './RuntimeConsole.jsx';

test('shows output and runtime errors together in a keyboard-scrollable terminal', () => {
  render(<RuntimeConsole status="error" messages={[{ level: 'log', args: ['Punkty:', '1'] }]} errors={['Brak canvas']} />);
  expect(screen.getByText('Błąd')).toBeInTheDocument();
  const output = screen.getByLabelText('Wynik programu i błędy');
  expect(output).toHaveTextContent('Punkty: 1');
  expect(output).toHaveTextContent('Brak canvas');
  expect(output).toHaveAttribute('tabindex', '0');
});
