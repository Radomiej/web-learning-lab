import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';
import { beforeEach, vi } from 'vitest';

beforeEach(() => { vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); });

test('renders the Web Learning Lab shell title', async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByText('Web Learning Lab')).toBeInTheDocument();
  await user.click(screen.getByLabelText('Wybierz ścieżkę'));
  await user.click(screen.getByRole('tab', { name: 'CSS 6' }));
  expect(screen.getByRole('region', {name:'Teoria i przykład'})).toBeVisible();
  expect(screen.getByRole('region', {name:'Krótka próba'})).toBeVisible();
  expect(screen.getByRole('region', {name:'Zadanie do wykonania'})).toBeVisible();
  expect(screen.getByRole('region', {name:'Zbuduj rozwiązanie'})).toBeVisible();
  expect(screen.queryByRole('button', {name:'Nauka',exact:true})).toBeNull();
  expect(screen.queryByRole('complementary',{name:'Podgląd i diagnostyka'})).toBeNull();
  expect(screen.getByRole('link',{name:'Generator zadań'})).toBeVisible();
  fireEvent.click(screen.getByRole('button',{name:'Uruchom',exact:true}));
  expect(screen.getByRole('complementary',{name:'Podgląd i diagnostyka'})).toBeVisible();
});
