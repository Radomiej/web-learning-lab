import { render, screen } from '@testing-library/react';
import App from '../App.jsx';

test('exposes landmarks and labels for the editor workflow', () => {
  render(<App />);
  expect(screen.getByRole('navigation', { name: 'Nawigacja kursu' })).toBeInTheDocument();
  expect(screen.getByRole('main')).toBeInTheDocument();
  expect(screen.getByRole('complementary', { name: 'Podgląd i diagnostyka' })).toBeInTheDocument();
  expect(screen.getByLabelText('Edytor index.html')).toBeInTheDocument();
});
