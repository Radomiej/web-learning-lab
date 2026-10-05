import { createLesson, createTask } from './lessonFactories.js';

const html = `<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Moja gra Canvas</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main>
    <canvas id="game" tabindex="0" aria-label="Plansza gry. Kliknij i używaj klawiatury."></canvas>
    <p class="controls">Kliknij planszę, aby sterować. Strzałki / WASD · Spacja · R</p>
  </main>
  <script type="module" src="game.js"></script>
</body>
</html>`;
const css = `* { box-sizing: border-box; }
html, body { margin: 0; width: 100%; height: 100%; }
body { background: #0b2033; color: #bed5df; font-family: system-ui, sans-serif; }
main { height: 100%; display: flex; flex-direction: column; }
#game { display: block; width: 100%; flex: 1; min-height: 200px; outline: none; }
#game:focus-visible { box-shadow: inset 0 0 0 2px #29c3b1; }
.controls { margin: 0; padding: 10px 12px; font-size: 12px; }
`;

function scene(create = '', update = '', imports = '') {
  return `${imports}${imports ? '\n' : ''}const { Game, Component, ShapeRenderer, Sprite, Collider2D, Trigger2D, CharacterController2D } = GameLab;

class MyGame extends Game {
  onCreate() {
${create.split('\n').map(l => `    ${l}`).join('\n')}
  }

  onUpdate(delta) {
${update.split('\n').map(l => `    ${l}`).join('\n')}
  }
}

GameLab.run(MyGame, { canvas: '#game' });
`;
}
const project = (source, extra = {}) => ({ entry: 'index.html', runtime: { kind: 'game-js' }, files: { 'index.html': html, 'styles.css': css, 'game.js': source, ...extra } });
const shape = (name, x, y, color = '#76b9f2', width = 32, height = 32) => `const ${name.toLowerCase()} = this.createObject('${name}').setPosition(${x}, ${y});
${name.toLowerCase()}.addComponent(new ShapeRenderer({ width: ${width}, height: ${height}, color: '${color}' }));`;
const check = (label, expected, scenario = {}) => ({ type: 'gameScenario', label, expected, scenario });
const position = (label, name, x, y, scenario = {}) => check(label, { 'objects.0.name': name, 'objects.0.x': x, 'objects.0.y': y }, scenario);

const movementComponent = `export default class PlayerController extends GameLab.Component {
  onUpdate() {
    const input = this.game.input;
    const x = Number(input.isKeyDown('ArrowRight')) - Number(input.isKeyDown('ArrowLeft'));
    const y = Number(input.isKeyDown('ArrowDown')) - Number(input.isKeyDown('ArrowUp'));
    this.getComponent(GameLab.CharacterController2D).move(x, y, 120);
  }
}
`;
const movable = `${shape('Player', 100, 100)}
player.addComponent(new CharacterController2D());
player.addComponent(new PlayerController());`;
const importController = "import PlayerController from './components/PlayerController.js';";
const controllerStub = `export default class PlayerController extends GameLab.Component {
  onUpdate(delta) {
    // Odczytaj input i ustaw ruch kontrolera.
  }
}
`;
const recipes = [
  {
    title: 'Canvas: pierwsza klatka', summary: 'Zobacz, jak JavaScript rysuje obraz na planszy.',
    objectives: ['Odróżniasz canvas od elementów DOM.', 'Rysujesz prostokąt i tekst we współrzędnych planszy.'],
    theory: ['Canvas jest powierzchnią rysowania. W tym kursie GameLab udostępnia this.canvas.drawRect(x, y, width, height, color). x i y oznaczają środek prostokąta; dodatnie y biegnie w dół.', 'Scena rozszerza GameLab.Game. onUpdate(delta) przygotowuje każdą klatkę, a GameLab.run(MyGame) uruchamia ją w gotowym elemencie canvas. Silnik czyści planszę przed klatką.'],
    guided: {
      title: 'Narysuj gracza', prompt: 'W onUpdate w game.js narysuj niebieski (#76b9f2) prostokąt: środek (80, 90), szerokość 40, wysokość 30. Pod nim napisz „Start” w (60, 140). Użyj this.canvas.drawRect oraz drawText.',
      solution: scene('', "this.canvas.drawRect(80, 90, 40, 30, '#76b9f2');\nthis.canvas.drawText('Start', 60, 140);"),
      checks: [check('Na planszy jest niebieski prostokąt 40 × 30 w (80, 90).', { 'commands.1.op': 'rect', 'commands.1.x': 80, 'commands.1.y': 90, 'commands.1.width': 40, 'commands.1.height': 30, 'commands.1.color': '#76b9f2' }), check('Pod prostokątem w (60, 140) widnieje tekst Start.', { 'commands.2.text': 'Start', 'commands.2.x': 60, 'commands.2.y': 140 })],
    },
    independent: {
      title: 'Dwie platformy', prompt: 'Narysuj dwa prostokąty, w tej kolejności: zielony #70c994 o środku (120, 180), rozmiar 100 × 20; następnie złoty #ffd166 o środku (300, 120), rozmiar 80 × 20. To platformy, nie elementy HTML.',
      solution: scene('', "this.canvas.drawRect(120, 180, 100, 20, '#70c994');\nthis.canvas.drawRect(300, 120, 80, 20, '#ffd166');"),
      checks: [check('Pierwsza platforma jest zielona, 100 × 20, w (120, 180).', { 'commands.1.x': 120, 'commands.1.y': 180, 'commands.1.width': 100, 'commands.1.height': 20, 'commands.1.color': '#70c994' }), check('Druga platforma jest złota, 80 × 20, w (300, 120).', { 'commands.2.x': 300, 'commands.2.y': 120, 'commands.2.width': 80, 'commands.2.height': 20, 'commands.2.color': '#ffd166' })],
    },
  },
  {
    title: 'Pętla gry i czas', summary: 'Poruszaj obiektami w pikselach na sekundę.',
    objectives: ['Wyjaśniasz rolę delta w onUpdate.', 'Utrzymujesz jednakową prędkość przy różnych krokach czasu.'],
    theory: ['Przeglądarka wywołuje requestAnimationFrame; silnik oblicza delta w sekundach. Przesunięcie = prędkość × delta. Dodawanie stałego kroku co klatkę uzależnia ruch od szybkości komputera.', 'Stan początkowy ustaw w onCreate. W onUpdate aktualizuj go i rysuj wynik. this.time.elapsed przechowuje łączny czas gry; this.time.deltaTime oznacza czas ostatniej klatki.'],
    guided: {
      title: 'Ruch w prawo', prompt: 'W onCreate ustaw this.x = 100. W onUpdate zwiększaj x o 80 * delta i rysuj prostokąt 20 × 20 w (this.x, 80). Po 1 sekundzie ma być w x = 180, także przy 20 krokach po 0,05 s.',
      solution: scene('this.x = 100;', 'this.x += 80 * delta;\nthis.canvas.drawRect(this.x, 80, 20, 20);'),
      checks: [check('Po sekundzie ruchu środek jest w (180, 80).', { 'commands.1.x': 180, 'commands.1.y': 80 }, { steps: 10, delta: 0.1 }), check('Przy 20 klatkach po 0,05 s pozycja pozostaje taka sama.', { 'commands.1.x': 180 }, { steps: 20, delta: 0.05 })],
    },
    independent: {
      title: 'Opadanie', prompt: 'Zacznij od this.y = 40. Prostokąt 24 × 24 o środku x = 200 opada z prędkością 60 px/s. Po 0,5 s y = 70, po 1 s y = 100. Nie resetuj y w onUpdate.',
      solution: scene('this.y = 40;', 'this.y += 60 * delta;\nthis.canvas.drawRect(200, this.y, 24, 24);'),
      checks: [check('Po pół sekundy obiekt jest w (200, 70), rozmiar 24 × 24.', { 'commands.1.x': 200, 'commands.1.y': 70, 'commands.1.width': 24, 'commands.1.height': 24 }, { steps: 5 }), check('Po sekundzie obiekt jest w y = 100.', { 'commands.1.y': 100 }, { steps: 10 })],
    },
  },
  {
    title: 'Scena, obiekt i Transform', summary: 'Przenieś pozycję i wygląd do obiektów sceny.',
    objectives: ['Tworzysz GameObject i ustawiasz Transform.', 'Łączysz obiekt z rendererem i kontrolujesz jego aktywność.'],
    theory: ['this.createObject("Player").setPosition(100, 100) tworzy obiekt sceny. Transform ma x, y, rotation w radianach i scale.x/scale.y. Pozycja jest środkiem obiektu.', 'ShapeRenderer odpowiada za wygląd. object.addComponent(new ShapeRenderer({ width: 32, height: 32, color: "#76b9f2" })) pozwala silnikowi rysować obiekt automatycznie. active = false ukrywa i zatrzymuje obiekt.'],
    guided: {
      title: 'Gracz i skarb', prompt: 'W onCreate utwórz Player w (100, 80), niebieski 32 × 32, a potem Treasure w (240, 160), złoty #ffd166, 20 × 20. Dodaj ShapeRenderer do obu obiektów. onUpdate może pozostać puste.',
      solution: scene(`${shape('Player', 100, 80)}\n${shape('Treasure', 240, 160, '#ffd166', 20, 20)}`),
      checks: [position('Player ma środek w (100, 80).', 'Player', 100, 80), check('Treasure w (240, 160) jest złotym prostokątem 20 × 20.', { 'objects.1.name': 'Treasure', 'objects.1.x': 240, 'objects.1.y': 160, 'commands.2.color': '#ffd166', 'commands.2.width': 20, 'commands.2.height': 20 })],
    },
    independent: {
      title: 'Nieaktywny przeciwnik', prompt: 'Utwórz Enemy w (300, 120), z czerwonym #ee6666 ShapeRenderer 40 × 40. Ustaw enemy.active = false. Obiekt ma pozostać w scenie, ale nie może się rysować.',
      solution: scene(`${shape('Enemy', 300, 120, '#ee6666', 40, 40)}\nenemy.active = false;`),
      checks: [position('Obiekt Enemy pozostaje w scenie w (300, 120).', 'Enemy', 300, 120), check('Enemy jest nieaktywny i klatka zawiera tylko czyszczenie tła.', { 'objects.0.active': false, 'objects.0.components.0': 'ShapeRenderer', 'commands.length': 1 })],
    },
  },
  {
    title: 'Własne komponenty', summary: 'Zamknij zachowanie w osobnym module JavaScript.',
    objectives: ['Rozszerzasz Component we własnym pliku.', 'Rozumiesz onCreate, onUpdate i onDestroy komponentu.'],
    theory: ['Komponent to klasa extends GameLab.Component. this.gameObject to właściciel, this.transform jego pozycja, a this.game scena. onCreate uruchamia się raz; onUpdate(delta) działa co klatkę.', 'Eksportuj komponent przez export default i importuj go w game.js. Dodaj go do obiektu przez addComponent(new Mover()). Przy destroy() silnik wywołuje onDestroy i usuwa obiekt.'],
    guided: {
      title: 'Komponent Mover', prompt: 'Uzupełnij components/Mover.js. W onUpdate(delta) zwiększaj this.transform.x o 50 * delta. Gotowy game.js podpina Mover do Player w (100, 100). Po sekundzie gracz ma być w x = 150.',
      starter: scene(`${shape('Player', 100, 100)}\nplayer.addComponent(new Mover());`, '', "import Mover from './components/Mover.js';"),
      extraStarter: { 'components/Mover.js': 'export default class Mover extends GameLab.Component {\n  onUpdate(delta) {\n    // Przesuń właściciela komponentu.\n  }\n}\n' },
      solutionExtra: { 'components/Mover.js': 'export default class Mover extends GameLab.Component {\n  onUpdate(delta) { this.transform.x += 50 * delta; }\n}\n' },
      checks: [position('Mover przesuwa Player o 50 px w sekundę.', 'Player', 150, 100, { steps: 10 }), check('Do gracza podpięty jest własny komponent Mover.', { 'objects.0.components.1': 'Mover' })],
    },
    independent: {
      title: 'Komponent Spinner', prompt: 'W components/Spinner.js napisz komponent Spinner. W onUpdate(delta) obracaj właściciela o Math.PI * delta radianów. W game.js podepnij go do Rotor w (180, 120), renderowanego przez Sprite("gem", 40, 40). Po sekundzie obrót wynosi Math.PI.',
      solution: scene("const rotor = this.createObject('Rotor').setPosition(180, 120);\nrotor.addComponent(new Sprite('gem', 40, 40));\nrotor.addComponent(new Spinner());", '', "import Spinner from './components/Spinner.js';"),
      extraStarter: { 'components/Spinner.js': 'export default class Spinner extends GameLab.Component {\n  // Dodaj metodę onUpdate(delta).\n}\n' },
      solutionExtra: { 'components/Spinner.js': 'export default class Spinner extends GameLab.Component {\n  onUpdate(delta) { this.transform.rotation += Math.PI * delta; }\n}\n' },
      checks: [check('Rotor ma komponent Spinner i po sekundzie obrót π.', { 'objects.0.name': 'Rotor', 'objects.0.rotation': Math.PI, 'objects.0.components.1': 'Spinner' }, { steps: 10 }), check('Rotor jest rysowany teksturą gem, 40 × 40.', { 'commands.1.texture': 'gem', 'commands.1.width': 40, 'commands.1.height': 40 })],
    },
  },
  {
    title: 'Klawiatura i Input', summary: 'Reaguj na przytrzymanie i pojedyncze naciśnięcie.',
    objectives: ['Sterujesz po kliknięciu planszy.', 'Odróżniasz isKeyDown od isKeyPressed.'],
    theory: ['this.game.input.isKeyDown("ArrowRight") zwraca true przez cały czas trzymania klawisza. Na poziomie sceny użyj this.input. Ruch mnożysz przez delta; klawisze nie są stanem Reacta.', 'isKeyPressed("Space") jest true tylko w pierwszej klatce nowego naciśnięcia. Przytrzymanie nie powtarza akcji. Kliknij canvas, aby uzyskał fokus; opuszczenie planszy czyści klawisze.'],
    guided: {
      title: 'Cztery kierunki', prompt: 'Utwórz Player w (100, 100), z ShapeRenderer. W onUpdate steruj jego Transform czterema strzałkami z prędkością 120 px/s. Bez klawiszy ma stać. Tutaj ćwiczysz bezpośrednią zmianę pozycji, jeszcze bez kontrolera.',
      solution: scene(shape('Player', 100, 100), "const player = this.find('Player');\nconst x = Number(this.input.isKeyDown('ArrowRight')) - Number(this.input.isKeyDown('ArrowLeft'));\nconst y = Number(this.input.isKeyDown('ArrowDown')) - Number(this.input.isKeyDown('ArrowUp'));\nplayer.transform.x += x * 120 * delta;\nplayer.transform.y += y * 120 * delta;"),
      checks: [position('Bez wejścia gracz pozostaje w (100, 100).', 'Player', 100, 100, { steps: 5 }), ...[['ArrowRight', 112, 100], ['ArrowLeft', 88, 100], ['ArrowUp', 100, 88], ['ArrowDown', 100, 112]].map(([key, x, y]) => position(`Strzałka ${key} przesuwa gracza o 12 px w 0,1 s.`, 'Player', x, y, { keys: [key] }))],
    },
    independent: {
      title: 'Jedna akcja na spację', prompt: 'W onCreate ustaw this.jumps = 0. Każde NOWE naciśnięcie spacji zwiększa jumps o 1. Rysuj tekst „Skoki: liczba” w (10, 24). Trzymanie spacji przez 10 klatek ma dać jeden skok; puszczenie i ponowne naciśnięcie daje drugi.',
      solution: scene('this.jumps = 0;', "if (this.input.isKeyPressed('Space')) this.jumps++;\nthis.canvas.drawText(`Skoki: ${this.jumps}`, 10, 24);"),
      checks: [check('Początkowo widnieje Skoki: 0.', { 'commands.1.text': 'Skoki: 0' }), check('Przytrzymanie spacji daje tylko jeden skok.', { 'commands.1.text': 'Skoki: 1' }, { keys: ['Space'], steps: 10 }), check('Puszczenie i ponowne naciśnięcie daje drugi skok.', { 'commands.1.text': 'Skoki: 2' }, { phases: [{ keys: ['Space'], steps: 5 }, { keys: [], steps: 1 }, { keys: ['Space'], steps: 1 }] })],
    },
  },
  {
    title: 'Kontroler ruchu i granice', summary: 'Użyj CharacterController2D do przewidywalnego ruchu.',
    objectives: ['Ustawiasz kierunek oraz prędkość przez move.', 'Sprawdzasz cały obiekt przy granicy i ruch po przekątnej.'],
    theory: ['CharacterController2D.move(x, y, speed) zapisuje prędkość; silnik przesuwa obiekt po aktualizacji komponentów. Kierunek jest normalizowany, więc przekątna nie jest szybsza. Do kontrolera sięgasz przez this.getComponent(GameLab.CharacterController2D).', 'collideWorldBounds domyślnie zatrzymuje cały obiekt wewnątrz planszy. Dla obiektu 32 × 32 minimalne x to 16, a maksymalne x to szerokość planszy minus 16. Rozmiar planszy odczytasz z this.game.canvas.width i height.'],
    guided: {
      title: 'Kontroler strzałek', prompt: 'Uzupełnij components/PlayerController.js: oblicz kierunek z czterech strzałek i wywołaj move(x, y, 120) na CharacterController2D. game.js ma gotowego Player 32 × 32. Sprawdzenie obejmuje wszystkie krawędzie i przekątną.',
      starter: scene(movable, '', importController), solutionExtra: { 'components/PlayerController.js': movementComponent }, extraStarter: { 'components/PlayerController.js': controllerStub },
      checks: [position('Prawa krawędź planszy 320 px zatrzymuje środek w x = 304.', 'Player', 304, 100, { width: 320, keys: ['ArrowRight'], steps: 100 }), position('Lewa i górna krawędź zatrzymują środek w (16, 16).', 'Player', 16, 16, { keys: ['ArrowLeft', 'ArrowUp'], steps: 100 }), position('Dolna krawędź planszy 200 px zatrzymuje środek w y = 184.', 'Player', 100, 184, { height: 200, keys: ['ArrowDown'], steps: 100 }), position('Ruch po przekątnej ma tę samą prędkość całkowitą.', 'Player', 100 + 12 / Math.SQRT2, 100 + 12 / Math.SQRT2, { keys: ['ArrowRight', 'ArrowDown'] })],
    },
    independent: {
      title: 'Sprint z Shiftem', prompt: 'W PlayerController dodaj ruch WASD z prędkością 100 px/s, a z przytrzymanym Shift 200 px/s. Nadal korzystaj z CharacterController2D.move. Po przekątnej sprint nie może być szybszy niż 200 px/s.',
      starter: scene(movable, '', importController), extraStarter: { 'components/PlayerController.js': controllerStub },
      solutionExtra: { 'components/PlayerController.js': `export default class PlayerController extends GameLab.Component {
  onUpdate() {
    const input = this.game.input;
    const x = Number(input.isKeyDown('d')) - Number(input.isKeyDown('a'));
    const y = Number(input.isKeyDown('s')) - Number(input.isKeyDown('w'));
    this.getComponent(GameLab.CharacterController2D).move(x, y, input.isKeyDown('Shift') ? 200 : 100);
  }
}
` },
      checks: [position('D bez Shift przesuwa o 10 px w 0,1 s.', 'Player', 110, 100, { keys: ['d'] }), position('D + Shift przesuwa o 20 px w 0,1 s.', 'Player', 120, 100, { keys: ['d', 'Shift'] }), position('A + Shift działa w lewo.', 'Player', 80, 100, { keys: ['a', 'Shift'] }), position('W + Shift działa w górę.', 'Player', 100, 80, { keys: ['w', 'Shift'] }), position('Sprint po przekątnej jest znormalizowany.', 'Player', 100 + 20 / Math.SQRT2, 100 + 20 / Math.SQRT2, { keys: ['d', 's', 'Shift'] })],
    },
  },
  {
    title: 'Sprite i transformacje', summary: 'Nadaj obiektom teksturę, skalę i obrót.',
    objectives: ['Korzystasz ze stabilnych nazw tekstur.', 'Skalujesz i obracasz sprite wokół środka.'],
    theory: ['new GameLab.Sprite("player", 32, 32) jest komponentem wyglądu. Dostępne lokalne tekstury to player, slime, gem i wall. Są rysowane proceduralnie, więc działają od razu bez sieci ani plików graficznych.', 'transform.scale.x i scale.y domyślnie wynoszą 1; wartość 2 podwaja wymiar. rotation jest w radianach: Math.PI / 2 to ćwierć obrotu. Współrzędne i rozmiary pozostają częścią stanu gry.'],
    guided: {
      title: 'Duży gracz', prompt: 'Utwórz Player w (160, 100). Dodaj Sprite("player", 32, 32). Ustaw obie skale na 2 i obrót na Math.PI / 2. Sprawdzenie odczyta stan i rzeczywiście wyrenderowany sprite.',
      solution: scene("const player = this.createObject('Player').setPosition(160, 100);\nplayer.addComponent(new Sprite('player', 32, 32));\nplayer.transform.scale.x = 2;\nplayer.transform.scale.y = 2;\nplayer.transform.rotation = Math.PI / 2;"),
      checks: [check('Player ma teksturę player, skalę (2, 2) i obrót π/2.', { 'objects.0.name': 'Player', 'objects.0.scaleX': 2, 'objects.0.scaleY': 2, 'objects.0.rotation': Math.PI / 2, 'commands.1.texture': 'player', 'commands.1.x': 160, 'commands.1.y': 100 })],
    },
    independent: {
      title: 'Slime i klejnot', prompt: 'Utwórz najpierw Enemy w (80, 160) ze Sprite("slime", 48, 32) i scale.x = -1 (odbicie poziome). Potem Treasure w (280, 100) ze Sprite("gem", 24, 24). Pozostaw scale.y = 1; nie dodawaj player.',
      solution: scene("const enemy = this.createObject('Enemy').setPosition(80, 160);\nenemy.addComponent(new Sprite('slime', 48, 32));\nenemy.transform.scale.x = -1;\nthis.createObject('Treasure').setPosition(280, 100).addComponent(new Sprite('gem', 24, 24));"),
      checks: [check('Enemy jest odbitym poziomo slime 48 × 32 w (80, 160).', { 'objects.0.name': 'Enemy', 'objects.0.scaleX': -1, 'objects.0.scaleY': 1, 'commands.1.texture': 'slime', 'commands.1.width': 48, 'commands.1.height': 32, 'commands.1.x': 80, 'commands.1.y': 160 }), check('Treasure to gem 24 × 24 w (280, 100).', { 'objects.1.name': 'Treasure', 'commands.2.texture': 'gem', 'commands.2.x': 280, 'commands.2.y': 100, 'commands.2.width': 24, 'commands.2.height': 24 })],
    },
  },
  {
    title: 'Kolizje i triggery', summary: 'Zatrzymuj ruch na ścianie i zbieraj obiekty.',
    objectives: ['Odróżniasz collider od triggera.', 'Usuwasz zebraną monetę, aby nie naliczała kolejnych punktów.'],
    theory: ['Collider2D tworzy przeszkodę prostokątną; poruszający się CharacterController2D zatrzymuje się przed nią. Rozmiar kolizji pochodzi z renderera. Obrót jest wizualny: kolizje są osiowymi prostokątami (AABB).', 'Trigger2D wykrywa nałożenie, ale nie blokuje ruchu. Komponent otrzymuje onTrigger(other). W nim sprawdź nazwę obiektu, zwiększ stan gry i wywołaj other.destroy(), aby moneta znikała oraz dawała punkt tylko raz.'],
    guided: {
      title: 'Ściana blokuje gracza', prompt: 'Player 32 × 32 w (100, 100) ma gotowy kontroler strzałek. Dodaj Wall w (200, 100), ShapeRenderer 32 × 120, kolor #889aa9 i Collider2D. Ruch w prawo zatrzymuje Player w x = 168; ruch w lewo pozostaje swobodny.',
      starter: scene(movable, '', importController), extraStarter: { 'components/PlayerController.js': movementComponent },
      solution: scene(`${movable}\n${shape('Wall', 200, 100, '#889aa9', 32, 120)}\nwall.addComponent(new Collider2D());`, '', importController),
      checks: [position('Gracz zatrzymuje się na ścianie w (168, 100).', 'Player', 168, 100, { keys: ['ArrowRight'], steps: 20 }), check('Wall posiada Collider2D i rozmiar 32 × 120.', { 'objects.1.name': 'Wall', 'objects.1.components.1': 'Collider2D', 'commands.2.width': 32, 'commands.2.height': 120 }), position('Ściana nie blokuje ruchu w przeciwną stronę.', 'Player', 88, 100, { keys: ['ArrowLeft'] })],
    },
    independent: {
      title: 'Zbierz monetę', prompt: 'Dodaj Coin w (160, 100), złoty 20 × 20 z Trigger2D. W PlayerController dodaj onTrigger(other): jeśli nazwa to Coin, zwiększ this.game.points i zniszcz monetę. Zaczynaj z points = 0; w onUpdate rysuj „Punkty: liczba” w (10, 24). Player ma gotowy ruch strzałkami.',
      starter: scene(`this.points = 0;\n${movable}`, "this.canvas.drawText(`Punkty: ${this.points}`, 10, 24);", importController), extraStarter: { 'components/PlayerController.js': movementComponent },
      solution: scene(`this.points = 0;\n${movable}\n${shape('Coin', 160, 100, '#ffd166', 20, 20)}\ncoin.addComponent(new Trigger2D());`, "this.canvas.drawText(`Punkty: ${this.points}`, 10, 24);", importController),
      solutionExtra: { 'components/PlayerController.js': movementComponent.replace('\n}\n', "\n  onTrigger(other) {\n    if (other.name === 'Coin') { this.game.points++; other.destroy(); }\n  }\n}\n") },
      checks: [check('Przed wejściem w monetę punkty wynoszą 0 i moneta istnieje.', { 'commands.1.text': 'Punkty: 0', 'objects.1.name': 'Coin' }), check('Po zebraniu moneta znika i daje dokładnie jeden punkt.', { 'commands.1.text': 'Punkty: 1', 'objects.length': 1 }, { keys: ['ArrowRight'], steps: 20 }), check('Ominięcie monety nie daje punktu.', { 'commands.1.text': 'Punkty: 0', 'objects.length': 2 }, { keys: ['ArrowUp'], steps: 10 })],
    },
  },
  {
    title: 'Stan gry i HUD', summary: 'Przechowuj punkty, zdrowie i wyświetlaj aktualny wynik.',
    objectives: ['Oddzielasz dane gry od renderowania tekstu.', 'Obsługujesz granice stanu i powtarzane wejście.'],
    theory: ['Punkty i zdrowie są danymi sceny albo komponentu. HUD wyprowadzasz z tych danych, np. this.canvas.drawText(`Punkty: ${this.points}`, 10, 24). Menu i długie opisy lepiej pozostawić w HTML obok canvasu.', 'Reguły aktualizują stan; renderowanie go prezentuje. Dla jednorazowych akcji używaj isKeyPressed. Math.max(0, health - 1) chroni przed ujemnym zdrowiem. Reset może przywrócić wartości bez ponownego uruchamiania aplikacji.'],
    guided: {
      title: 'Wynik i reset', prompt: 'Zacznij od points = 0. Każde nowe naciśnięcie Space daje 5 punktów. Nowe R resetuje wynik do 0. Wyświetlaj „Wynik: liczba” w (10, 24). Trzymanie spacji nie nalicza kolejnych punktów.',
      solution: scene('this.points = 0;', "if (this.input.isKeyPressed('Space')) this.points += 5;\nif (this.input.isKeyPressed('r')) this.points = 0;\nthis.canvas.drawText(`Wynik: ${this.points}`, 10, 24);"),
      checks: [check('Na starcie Wynik: 0.', { 'commands.1.text': 'Wynik: 0' }), check('Trzymana spacja daje 5 punktów.', { 'commands.1.text': 'Wynik: 5' }, { keys: ['Space'], steps: 10 }), check('Dwa osobne naciśnięcia dają 10 punktów.', { 'commands.1.text': 'Wynik: 10' }, { phases: [{ keys: ['Space'] }, { keys: [] }, { keys: ['Space'] }] }), check('R zeruje zdobyty wynik.', { 'commands.1.text': 'Wynik: 0' }, { phases: [{ keys: ['Space'] }, { keys: ['r'] }] })],
    },
    independent: {
      title: 'Trzy serca', prompt: 'Zacznij od health = 3. Każde nowe H odbiera jedno serce, ale zdrowie nie może spaść poniżej 0. R przywraca 3. Rysuj „Zdrowie: liczba” w (10, 24); przy zerze dodatkowo „Koniec gry” w (10, 50).',
      solution: scene('this.health = 3;', "if (this.input.isKeyPressed('h')) this.health = Math.max(0, this.health - 1);\nif (this.input.isKeyPressed('r')) this.health = 3;\nthis.canvas.drawText(`Zdrowie: ${this.health}`, 10, 24);\nif (this.health === 0) this.canvas.drawText('Koniec gry', 10, 50);"),
      checks: [check('Początkowe zdrowie to 3.', { 'commands.1.text': 'Zdrowie: 3' }), check('Trzymane H odbiera tylko jedno serce.', { 'commands.1.text': 'Zdrowie: 2' }, { keys: ['h'], steps: 10 }), check('Cztery nowe H nie obniżają zdrowia poniżej 0; widać Koniec gry.', { 'commands.1.text': 'Zdrowie: 0', 'commands.2.text': 'Koniec gry' }, { phases: Array.from({ length: 8 }, (_, i) => ({ keys: i % 2 ? [] : ['h'] })) }), check('R przywraca trzy serca.', { 'commands.1.text': 'Zdrowie: 3', 'commands.length': 2 }, { phases: [{ keys: ['h'] }, { keys: ['r'] }] })],
    },
  },
];

const collector = movementComponent.replace('\n}\n', `
  onTrigger(other) {
    if (other.name.startsWith('Coin')) { this.game.points++; other.destroy(); }
  }
}
`);
const finalCreate = `this.points = 0;
${movable}
${shape('CoinA', 160, 100, '#ffd166', 20, 20)}
coina.addComponent(new Trigger2D());
${shape('CoinB', 220, 100, '#ffd166', 20, 20)}
coinb.addComponent(new Trigger2D());`;
recipes.push({
  title: 'Projekt: mała gra 2D', summary: 'Połącz ruch, komponenty, interakcje i warunki zakończenia.',
  objectives: ['Budujesz grę z kilku współpracujących modułów.', 'Sprawdzasz wygraną, przegraną oraz restart.'],
  theory: ['Rozdziel scenę (tworzenie obiektów i HUD) od PlayerController (wejście i kontakt). Scena może przechowywać points/health, a komponent zmienia je po kolizji. onCreate ustala zawsze powtarzalny stan początkowy.', 'Przetestuj drogę sukcesu i porażki, brak wejścia oraz ponowny start. W grze końcowej sprawdzamy zachowanie kilku klatek, a nie tylko statyczny obraz. Ruch powinien kończyć się, gdy gra jest rozstrzygnięta.'],
  guided: {
    title: 'Zbierz dwa skarby', prompt: 'Player 32 × 32 startuje w (100, 100), porusza się strzałkami 120 px/s. Dodaj złote CoinA w (160, 100) i CoinB w (220, 100), po 20 × 20 z Trigger2D. Każda moneta daje 1 punkt i znika. Rysuj „Punkty: liczba”; po 2 punktach również „Wygrana” i zatrzymaj ruch.',
    starter: scene(`this.points = 0;\n${movable}`, "this.canvas.drawText(`Punkty: ${this.points}`, 10, 24);", importController), extraStarter: { 'components/PlayerController.js': controllerStub },
    solution: scene(finalCreate, "this.canvas.drawText(`Punkty: ${this.points}`, 10, 24);\nif (this.points === 2) this.canvas.drawText('Wygrana', 10, 50);", importController),
    solutionExtra: { 'components/PlayerController.js': collector.replace('const input =', 'if (this.game.points === 2) return;\n    const input =') },
    checks: [check('Na starcie są gracz i dwie monety; punkty = 0.', { 'objects.length': 3, 'commands.1.text': 'Punkty: 0' }), check('Pierwsza moneta daje jeden punkt.', { 'objects.length': 2, 'commands.1.text': 'Punkty: 1' }, { keys: ['ArrowRight'], steps: 5 }), check('Obie monety znikają, pojawia się Wygrana i gracz stoi w x = 196.', { 'objects.length': 1, 'commands.1.text': 'Punkty: 2', 'commands.2.text': 'Wygrana', 'objects.0.x': 196 }, { keys: ['ArrowRight'], steps: 30 }), check('Ruch w górę omija monety.', { 'objects.length': 3, 'commands.1.text': 'Punkty: 0' }, { keys: ['ArrowUp'], steps: 10 })],
  },
  independent: {
    title: 'Pułapka i nowa próba', prompt: 'Zbuduj własną grę: Player 32 × 32 startuje w (100, 100), strzałki 120 px/s. Enemy w (160, 100), czerwony 32 × 32 z Trigger2D. Wejście w Enemy ustawia health = 0 i zatrzymuje ruch. HUD: „Zdrowie: 1”, po trafieniu „Zdrowie: 0” i „Przegrana”. Nowe R przywraca health = 1 i pozycję (100, 100), umożliwiając kolejną próbę.',
    starter: scene('this.health = 1;', "this.canvas.drawText(`Zdrowie: ${this.health}`, 10, 24);"), extraStarter: { 'components/PlayerController.js': controllerStub },
    solution: scene(`this.health = 1;\n${movable}\n${shape('Enemy', 160, 100, '#ee6666')}\nenemy.addComponent(new Trigger2D());`, "if (this.input.isKeyPressed('r')) { this.health = 1; this.find('Player').setPosition(100, 100); }\nthis.canvas.drawText(`Zdrowie: ${this.health}`, 10, 24);\nif (this.health === 0) this.canvas.drawText('Przegrana', 10, 50);", importController),
    solutionExtra: { 'components/PlayerController.js': movementComponent.replace('const input =', 'if (this.game.health === 0) return;\n    const input =').replace('\n}\n', "\n  onTrigger(other) { if (other.name === 'Enemy') this.game.health = 0; }\n}\n") },
    checks: [check('Początkowo zdrowie = 1, Player i Enemy istnieją.', { 'commands.1.text': 'Zdrowie: 1', 'objects.0.name': 'Player', 'objects.1.name': 'Enemy' }), check('Trafienie w pułapkę kończy grę i zatrzymuje gracza.', { 'commands.1.text': 'Zdrowie: 0', 'commands.2.text': 'Przegrana', 'objects.0.x': 136 }, { keys: ['ArrowRight'], steps: 20 }), check('R przywraca pozycję i zdrowie bez usuwania przeciwnika.', { 'commands.1.text': 'Zdrowie: 1', 'objects.0.x': 100, 'objects.0.y': 100, 'objects.length': 2 }, { phases: [{ keys: ['ArrowRight'], steps: 10 }, { keys: ['r'] }] }), check('Po restarcie można ruszyć w lewo.', { 'commands.1.text': 'Zdrowie: 1', 'objects.0.x': 88 }, { phases: [{ keys: ['ArrowRight'], steps: 10 }, { keys: ['r'] }, { keys: ['ArrowLeft'] }] })],
  },
});

// Initial-state checks complement the time/input scenarios. They also verify
// appearance on inactive objects, which correctly issue no draw commands.
const initialSceneChecks = {
  '703-guided': check('Player jest niebieski 32 × 32, a Treasure złoty 20 × 20; oba mają ShapeRenderer.', {
    'objects.length': 2, 'objects.0.renderer.kind': 'ShapeRenderer', 'objects.0.renderer.color': '#76b9f2', 'objects.0.renderer.width': 32, 'objects.0.renderer.height': 32,
    'objects.1.renderer.kind': 'ShapeRenderer', 'objects.1.renderer.color': '#ffd166', 'objects.1.renderer.width': 20, 'objects.1.renderer.height': 20,
  }),
  '703-independent': check('Nieaktywny Enemy ma czerwony ShapeRenderer 40 × 40.', {
    'objects.0.renderer.kind': 'ShapeRenderer', 'objects.0.renderer.color': '#ee6666', 'objects.0.renderer.width': 40, 'objects.0.renderer.height': 40,
  }),
  '704-independent': position('Rotor zaczyna w (180, 120).', 'Rotor', 180, 120, { steps: 0 }),
  '705-guided': check('Player ma ShapeRenderer i rzeczywiście jest rysowany na planszy.', { 'objects.0.renderer.kind': 'ShapeRenderer', 'commands.1.op': 'rect' }),
  '707-guided': check('Sprite gracza ma bazowy rozmiar 32 × 32.', { 'commands.1.op': 'sprite', 'commands.1.width': 32, 'commands.1.height': 32 }),
  '708-guided': check('Ściana jest szara, w (200, 100), z Collider2D.', {
    'objects.1.x': 200, 'objects.1.y': 100, 'objects.1.renderer.color': '#889aa9', 'objects.1.components.1': 'Collider2D',
  }),
  '708-independent': check('Coin to złoty obiekt 20 × 20 w (160, 100), z Trigger2D.', {
    'objects.1.name': 'Coin', 'objects.1.x': 160, 'objects.1.y': 100,
    'objects.1.renderer.width': 20, 'objects.1.renderer.height': 20, 'objects.1.renderer.color': '#ffd166', 'objects.1.components.1': 'Trigger2D',
  }),
  '710-guided': check('Monety CoinA i CoinB są złote, 20 × 20, w (160, 100) i (220, 100), z Trigger2D.', {
    'objects.0.renderer.width': 32, 'objects.0.renderer.height': 32,
    'objects.1.name': 'CoinA', 'objects.1.x': 160, 'objects.1.y': 100, 'objects.1.renderer.width': 20, 'objects.1.renderer.height': 20, 'objects.1.renderer.color': '#ffd166', 'objects.1.components.1': 'Trigger2D',
    'objects.2.name': 'CoinB', 'objects.2.x': 220, 'objects.2.y': 100, 'objects.2.renderer.width': 20, 'objects.2.renderer.height': 20, 'objects.2.renderer.color': '#ffd166', 'objects.2.components.1': 'Trigger2D',
  }, { steps: 0 }),
  '710-independent': check('Player zaczyna w (100, 100); Enemy to czerwona pułapka 32 × 32 w (160, 100).', {
    'objects.0.x': 100, 'objects.0.y': 100, 'objects.0.renderer.width': 32, 'objects.0.renderer.height': 32,
    'objects.1.x': 160, 'objects.1.y': 100, 'objects.1.renderer.width': 32, 'objects.1.renderer.height': 32, 'objects.1.renderer.color': '#ee6666', 'objects.1.components.1': 'Trigger2D',
  }, { steps: 0 }),
};

export const gameLessons = recipes.map((recipe, index) => {
  const order = 701 + index;
  const tasks = ['guided', 'independent'].map(mode => {
    const exercise = recipe[mode];
    const id = `game-dev-${order}-${mode}`;
    const starter = project(exercise.starter || scene('// Tutaj przygotuj stan początkowy.', '// Tutaj napisz zachowanie gry.'), exercise.extraStarter);
    const solution = project(exercise.solution || exercise.starter, { ...exercise.extraStarter, ...exercise.solutionExtra });
    return createTask({
      id, mode, track: 'game-dev', title: exercise.title,
      prompt: exercise.prompt,
      starter, solution,
      hint: mode === 'guided' ? 'Zachowaj GameLab.run(MyGame) na końcu game.js. Metody sceny używają this, metody komponentu — this.game i this.transform. Możesz obejrzeć rozwiązanie i porównać pliki.' : undefined,
      checks: [...exercise.checks, ...(initialSceneChecks[`${order}-${mode}`] ? [initialSceneChecks[`${order}-${mode}`]] : []), { type: 'runtimeError', label: 'Gra uruchamia się bez błędów JavaScript.' }].map((c, i) => ({ ...c, id: `${id}-${i}` })),
    });
  });
  return createLesson({ id: `game-dev-${order}`, track: 'game-dev', order, title: recipe.title, summary: recipe.summary, objectives: recipe.objectives, theory: recipe.theory, focus: recipe.title, file: 'game.js', runtime: 'game-js', starter: tasks[0].starter, tasks });
});
