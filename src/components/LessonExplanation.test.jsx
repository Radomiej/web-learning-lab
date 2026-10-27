import { test, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import LessonExplanation, { explanationPages } from '../../shared/lab-game-v2/editor/LessonExplanation.jsx';

test('g2d.scene shows the shared eleven-page introduction with JavaScript code', () => {
  const pages = explanationPages({ id: 'g2d.scene' });
  expect(pages).toHaveLength(11);
  expect(pages[0].introDiagram).toBe('loop');
  expect(pages[1].code.js).toContain('class MyGame extends GameLab.Game');
  expect(pages[5].code.js).toContain('new GameLab.ShapeRenderer(40, 24');

  render(<LessonExplanation lesson={{ id: 'g2d.scene' }} language="javascript" />);
  expect(screen.getByText('Gra działa w pętli')).toBeInTheDocument();
  expect(screen.getByRole('figure', { name: 'Schemat: Gra działa w pętli' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Następny krok' }));
  expect(screen.getByText('Game jest gospodarzem sceny')).toBeInTheDocument();
  expect(screen.getByText(/GameLab\.run\(MyGame\)/)).toBeInTheDocument();
  expect(screen.getByText('Plik game.js. Klasy silnika dostępne są jako GameLab.')).toBeInTheDocument();
});

test('g2d.input shows five intro pages then shared pages including component lookup', () => {
  const pages = explanationPages({ id: 'g2d.input' });
  expect(pages).toHaveLength(8);
  expect(pages.at(-1).title).toBe('Jak pobrać komponent z obiektu?');
  const controller = pages[4];
  expect(controller.code.js).toContain('this.requireComponent(GameLab.CharacterController2D)');
  expect(controller.code.java).toContain('requireComponent(CharacterController2D.class)');
  expect(controller.setupCode.js).toContain('new GameLab.CircleCollider2D(12)');

  render(<LessonExplanation lesson={{ id: 'g2d.input' }} language="javascript" />);
  for (let step = 0; step < 4; step++) fireEvent.click(screen.getByRole('button', { name: 'Następny krok' }));
  expect(screen.getByText('Kontroler gracza a komponent ruchu')).toBeInTheDocument();
  expect(screen.getByText(/this\.requireComponent\(GameLab\.CharacterController2D\)/)).toBeInTheDocument();
  expect(screen.getByText('game.js · onCreate(): dodaj do przygotowanego Player')).toBeInTheDocument();
});

test('lessons without an introduction keep their three shared diagram pages', () => {
  expect(explanationPages({ id: 'g2d.collisions' })).toHaveLength(3);
});
