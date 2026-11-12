import { lessons } from './lessons.js';
import { playgroundLesson } from './playground.js';

export const tracks = {
  playground: { id: 'playground', label: 'Playground', description: 'Własna gra, pusty projekt oraz import i eksport JSON.', accent: '#ffd166' },
  'game-dev': {
    id: 'game-dev', label: 'Game Dev JS',
    description: 'Canvas, obiekty, komponenty i własna gra 2D.',
    accent: '#70c994',
  },
  html: {
    id: 'html',
    label: 'HTML',
    description: 'Struktura, semantyka i dostępność stron.',
    accent: '#29c3b1',
  },
  'html-gd': {
    id: 'html-gd',
    label: 'HTML GD',
    description: 'Te same umiejętności HTML na przykładach interfejsu gry (wariant testowy).',
    accent: '#e0b04a',
  },
  css: {
    id: 'css',
    label: 'CSS',
    description: 'Selektory, typografia i wygląd elementów.',
    accent: '#64a6ff',
  },
  'css-gd': {
    id: 'css-gd',
    label: 'CSS GD',
    description: 'Gotowy HTML interfejsu gry ostylowany własnym arkuszem (wariant testowy).',
    accent: '#7fd4c9',
  },
  layout: {
    id: 'layout',
    label: 'Layout',
    description: 'Flexbox, Grid i responsywne układy.',
    accent: '#b18cff',
  },
  js: {
    id: 'js',
    label: 'JavaScript',
    description: 'Logika, DOM i interakcje w przeglądarce.',
    accent: '#f4c95d',
  },
  react: {
    id: 'react',
    label: 'React',
    description: 'Komponenty, stan i aplikacje w JSX.',
    accent: '#61dafb',
  },
  php: {
    id: 'php',
    label: 'PHP',
    description: 'Podstawy PHP uruchamiane lokalnie przez WebAssembly.',
    accent: '#8f7ad8',
  },
};

export const trackOrder = ['html', 'html-gd', 'css', 'css-gd', 'layout', 'js', 'react', 'php', 'game-dev', 'playground'];

export const allLessons = [...lessons, playgroundLesson].sort((a, b) => a.order - b.order);
