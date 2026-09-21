import { render, screen } from '@testing-library/react';
import App from './App.jsx';

test('renders the Web Learning Lab shell title', () => {
  render(<App />);
  expect(screen.getByText('Web Learning Lab')).toBeInTheDocument();
});
