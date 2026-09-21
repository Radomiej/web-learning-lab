import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

test('shows the first lesson, four editor files, preview status, and track navigation', () => {
  render(<App />);
  expect(screen.getByText('Web Learning Lab')).toBeInTheDocument();
  expect(screen.getByText('Pierwszy dokument HTML5')).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'index.html' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'base.css' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'theme.css' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'script.js' })).toBeInTheDocument();
  expect(screen.getByText('Podgląd na żywo')).toBeInTheDocument();
  expect(screen.getByText('39 lekcji')).toBeInTheDocument();
});

test('changes the active editor file and opens the mobile sidebar', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('tab', { name: 'base.css' }));
  expect(screen.getByLabelText('Edytor base.css')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Otwórz menu' }));
  expect(screen.getByRole('navigation', { name: 'Nawigacja kursu' })).toHaveAttribute('data-open', 'true');
});
