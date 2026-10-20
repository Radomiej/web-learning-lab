import { render, screen, fireEvent } from '@testing-library/react';
import App from './App.jsx';

test('renders the Web Learning Lab shell title', () => {
  render(<App />);
  expect(screen.getByText('Web Learning Lab')).toBeInTheDocument();
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
