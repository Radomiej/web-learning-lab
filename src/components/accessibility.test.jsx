import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

test('exposes landmarks and labels for the editor workflow', async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByRole('navigation', { name: 'Nawigacja kursu' })).toBeInTheDocument();
  expect(screen.getByRole('main')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Zadanie', exact: true }));
  expect(screen.getByLabelText('Edytor index.html')).toBeInTheDocument();
  await user.click(screen.getAllByRole('button', { name: 'Pokaż podgląd' })[0]);
  expect(screen.getByRole('complementary', { name: 'Podgląd i diagnostyka' })).toBeInTheDocument();
});
