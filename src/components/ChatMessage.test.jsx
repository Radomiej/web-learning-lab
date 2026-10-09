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

test('renders escaped model headings, lists and nested inline formatting', () => {
  render(<ChatMessage text={'\\### Jak dodać kamerę\n\nOpis `Camera2D`.\n\n\\* **follow(target)** – śledzi gracza\n* *offset*\n  * podpunkt\n\n1. Utwórz kamerę\n2. Wywołaj follow'} />);
  expect(screen.getByRole('heading', { name: 'Jak dodać kamerę', level: 3 })).toBeInTheDocument();
  expect(screen.getAllByRole('list')).toHaveLength(3);
  expect(screen.getByText('follow(target)').tagName).toBe('STRONG');
  expect(screen.getByText('offset').tagName).toBe('EM');
});

test('supports tables and safe links without executing HTML', () => {
  render(<ChatMessage text={'| Metoda | Cel |\n| --- | --- |\n| follow | Gracz |\n\n[API](https://example.com/api)\n\n[Zły link](javascript:alert%281%29)\n\n<script>bad()</script>'} />);
  expect(screen.getByRole('table')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'API' })).toHaveAttribute('rel', 'noopener noreferrer');
  expect(screen.queryByRole('link', { name: 'Zły link' })).not.toBeInTheDocument();
  expect(document.querySelector('script')).toBeNull();
});

test('keeps escaped markers inside fenced code intact', async () => {
  let copied;
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { copied = value; } } });
  render(<ChatMessage text={'```text\n\\### literal\n\\* literal\n```'} />);
  expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Kopiuj kod' }));
  await screen.findByText('Skopiowano');
  expect(copied).toBe('\\### literal\n\\* literal');
});
