import { fireEvent, render, screen } from '@testing-library/react';
import ChatMessage from './ChatMessage.jsx';
test('renders code safely and copies only its exact content', async () => {
  let copied;
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { copied = value; } } });
  render(<ChatMessage text={'Użyj `move` i **komponentu**.\n```javascript\nconst x = "<script>";\n```'} />);
  expect(screen.getByText('javascript')).toBeInTheDocument();
  expect(document.querySelector('script')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Kopiuj kod' }));
  await screen.findByText('Skopiowano');
  expect(copied).toBe('const x = "<script>";');
});
