import { createLesson } from './lessonFactories.js';

export const playgroundProject = {
  entry: 'index.html', runtime: { kind: 'game-js' },
  files: {
    'index.html': `<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Moja gra</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <canvas id="game" tabindex="0" aria-label="Plansza gry"></canvas>
  <script type="module" src="game.js"></script>
</body>
</html>`,
    'styles.css': `* { box-sizing: border-box; }
html, body { margin: 0; width: 100%; height: 100%; }
body { background: #0b2033; }
#game { display: block; width: 100%; height: 100vh; outline: none; }
#game:focus-visible { box-shadow: inset 0 0 0 2px #29c3b1; }
`,
    'game.js': `class MyGame extends GameLab.Game {
  onCreate() {
    // Tu utwórz obiekty i dodaj komponenty.
  }

  onUpdate(delta) {
    // Tu aktualizuj stan sceny. Zachowania możesz wydzielać do komponentów.
  }
}

GameLab.run(MyGame, { canvas: '#game' });
`,
  },
};

export const playgroundLesson = createLesson({
  id: 'playground-game', track: 'playground', order: 801,
  title: 'Własna gra', summary: 'Pusty projekt, pełne API GameLab i miejsce na Twoje pomysły.',
  runtime: 'game-js', starter: playgroundProject,
  tasks: [{ id: 'playground-game-project', mode: 'playground', title: 'Własny projekt', starter: playgroundProject, checks: [] }],
});
