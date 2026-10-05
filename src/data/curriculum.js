import { lessons } from './lessons.js';

export const tracks = {
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
  css: {
    id: 'css',
    label: 'CSS',
    description: 'Selektory, typografia i wygląd elementów.',
    accent: '#64a6ff',
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

export const trackOrder = ['html', 'css', 'layout', 'js', 'react', 'php', 'game-dev'];

export const allLessons = [...lessons].sort((a, b) => a.order - b.order);
