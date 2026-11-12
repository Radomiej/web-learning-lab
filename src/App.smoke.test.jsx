import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';

test('renders the Web Learning Lab shell title', async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByText('Web Learning Lab')).toBeInTheDocument();
  await user.click(screen.getByLabelText('Wybierz ścieżkę'));
  await user.click(screen.getByRole('tab', { name: 'CSS 6' }));
  expect(screen.getByRole('button', {name:'Nauka',exact:true})).toHaveAttribute('aria-current','step');
  expect(screen.queryByRole('complementary',{name:'Podgląd i diagnostyka'})).toBeNull();
  expect(screen.queryByRole('region',{name:'Zbuduj rozwiązanie'})).toBeNull();
  expect(screen.getByRole('link',{name:'Generator zadań'})).toBeVisible();
  fireEvent.click(screen.getByRole('button',{name:'Zadanie',exact:true}));
  expect(screen.getByRole('region',{name:'Zbuduj rozwiązanie'})).toBeVisible();
  expect(screen.queryByRole('complementary',{name:'Podgląd i diagnostyka'})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Uruchom',exact:true}));
  expect(screen.getByRole('complementary',{name:'Podgląd i diagnostyka'})).toBeVisible();
});
