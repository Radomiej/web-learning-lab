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

test('lists component types grouped by role', () => {
  render(<GameApiGuide />);
  fireEvent.click(screen.getByText('Dokumentacja GameLab'));
  fireEvent.click(screen.getByRole('button', { name: 'Komponenty' }));
  for (const label of ['Wygląd i tekst', 'Ruch postaci', 'Kolizje i pociski', 'AI przeciwników', 'Interfejs (UI)', 'Wejście']) {
    expect(screen.getByRole('heading', { name: label })).toBeInTheDocument();
  }
  expect(screen.getByText(/new Collider2D\(width\?, height\?\)/)).toBeInTheDocument();
  expect(screen.getByText(/Bez addComponent:/)).toBeInTheDocument();
});

test('explains fetching components and shows usage examples on demand', () => {
  render(<GameApiGuide />);
  fireEvent.click(screen.getByText('Dokumentacja GameLab'));
  fireEvent.click(screen.getByRole('button', { name: 'Komponenty' }));
  expect(screen.getByText(/this\.requireComponent\(GameLab\.X\)/)).toBeInTheDocument();
  expect(screen.getByText(/this\.game\.find/)).toBeInTheDocument();
  const toggles = screen.getAllByText('Pokaż użycie');
  expect(toggles.length).toBeGreaterThan(20);
  fireEvent.click(toggles[0]);
  expect(screen.getByText(/addComponent\(new GameLab\.Sprite/)).toBeInTheDocument();
});

test('shows the asset catalog with names, keys and sprite previews', async () => {
  render(<GameApiGuide />);
  fireEvent.click(screen.getByText('Dokumentacja GameLab'));
  fireEvent.click(screen.getByRole('button', { name: 'Assety' }));
  for (const label of ['Postacie i przeciwnicy', 'Walka', 'Świat i przedmioty', 'Kafelki terenu', 'Interfejs']) {
    expect(screen.getByRole('heading', { name: new RegExp(label) })).toBeInTheDocument();
  }
  const card = screen.getByRole('button', { name: 'slime — kopiuj GameLab.Assets.SLIME' });
  expect(card.querySelector('img')).toHaveAttribute('src', expect.stringContaining('survival-characters.png'));
  expect(screen.getByText('SLIME')).toBeInTheDocument();
  expect(screen.getByText('"slime"')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Znajdź grafikę'), { target: { value: 'slime' } });
  expect(screen.getAllByRole('button', { name: /kopiuj GameLab\.Assets\./ })).toHaveLength(4);
  fireEvent.change(screen.getByLabelText('Znajdź grafikę'), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'slime — kopiuj GameLab.Assets.SLIME' }));
  expect(await screen.findByText('✓ Skopiowano')).toBeInTheDocument();
});
