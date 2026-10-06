import { fireEvent, render, screen } from '@testing-library/react';
import GameApiGuide from './GameApiGuide.jsx';

test('opens a modal and restores the trigger focus after Escape', () => {
  render(<GameApiGuide />);
  const trigger = screen.getByRole('button', { name: 'Dokumentacja GameLab' });
  trigger.focus();
  fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Dokumentacja GameLab' });
  fireEvent.keyDown(dialog, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test('opens the GameLab quick-start and browsable API reference', () => {
  render(<GameApiGuide />);
  fireEvent.click(screen.getByText('Dokumentacja GameLab'));
  expect(screen.getByText(/Rozszerz/)).toBeInTheDocument();
  expect(screen.getAllByText(/GameLab\.run\(MyGame\)/)).toHaveLength(2);

  fireEvent.click(screen.getByRole('button', { name: 'API silnika' }));
  expect(screen.getByLabelText('Wyszukaj klasę lub metodę')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Wyszukaj klasę lub metodę'), { target: { value: 'onTrigger' } });
  expect(screen.getByText(/onTrigger\(\.\.\.\)/)).toBeInTheDocument();
  expect(screen.getByText(/kontakt z obszarem Trigger2D/)).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Wyszukaj klasę lub metodę'), { target: { value: 'brakTakiejMetody' } });
  expect(screen.getByText('Nie znaleziono pasującej klasy ani metody.')).toBeInTheDocument();
});
