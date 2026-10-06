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
`;

function scene(create = '', update = '', imports = '', ui = '') {
  if (ui) {
    create += "\nconst hud = this.find('Player') || this.createObject('HUD');";
    for (const line of ui.split('\n')) {
      const match = line.match(/^(?:if \((.+)\)\s*)?this\.canvas\.drawText\((.+),\s*(\d+),\s*(\d+)\);$/);
      if (!match) throw new Error(`Nieobsługiwany zapis HUD: ${line}`);
      const [, condition, text, x, y] = match;
      create += `\nhud.addComponent(new TextRenderer(() => ${condition ? `(${condition}) ? ${text} : null` : text}, ${x}, ${y}));`;
    }
  }
  return `${imports}${imports ? '\n' : ''}const { Game, Component, ShapeRenderer, Sprite, TextRenderer, ControlsHint, Camera2D, TileMap, Tweens, Collider2D, Trigger2D, CharacterController2D } = GameLab;

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
// Keep every student-facing file explicit, including older recipe strings.
function expandObjectCreation(source) {
  const indentAt = offset => source.slice(0, offset).split('\n').at(-1).match(/^\s*/)[0];
  source = source.replace(/\b(const|let)\s+(\w+)\s*=\s*(this(?:\.game)?)\.createObject\(([^;\n]+?)\)\.setPosition\(([^;\n]+?)\);/g,
    (match, declaration, variable, owner, name, position, offset) => `${declaration} ${variable} = ${owner}.createObject(${name});\n${indentAt(offset)}${variable}.setPosition(${position});`);
  source = source.replace(/\b(this(?:\.game)?)\.createObject\(['"](\w+)['"]\)\.setPosition\(([^;\n]+?)\)\.addComponent\(([^;\n]+?)\);/g,
    (match, owner, name, position, component, offset) => {
      const variable = name[0].toLowerCase() + name.slice(1), indent = indentAt(offset);
      return `const ${variable} = ${owner}.createObject('${name}');\n${indent}${variable}.setPosition(${position});\n${indent}${variable}.addComponent(${component});`;
    });
  source = source.replace(/\b(this|player)\.getComponent\(([^;\n]+?)\)\.move\(([^;\n]+?)\);/g,
    (match, owner, type, args, offset) => `const movement = ${owner}.getComponent(${type});\n${indentAt(offset)}movement.move(${args});`);
  return source;
}
const project = (source, extra = {}) => ({ entry: 'index.html', runtime: { kind: 'game-js' }, files: {
  'index.html': html, 'styles.css': css,
  ...Object.fromEntries(Object.entries({ 'game.js': source, ...extra }).map(([path, code]) => [path, path.endsWith('.js') ? expandObjectCreation(code) : code])),
} });
const shape = (name, x, y, color = '#76b9f2', width = 32, height = 32) => `const ${name.toLowerCase()} = this.createObject('${name}');
${name.toLowerCase()}.setPosition(${x}, ${y});
${name.toLowerCase()}.addComponent(new ShapeRenderer({ width: ${width}, height: ${height}, color: '${color}' }));`;
const check = (label, expected, scenario = {}) => ({ type: 'gameScenario', label, expected, scenario });
const position = (label, name, x, y, scenario = {}) => check(label, { 'objects.0.name': name, 'objects.0.x': x, 'objects.0.y': y }, scenario);

const movementComponent = `export default class PlayerController extends GameLab.Component {
  onUpdate() {
    const input = this.game.input;
    const x = Number(input.isKeyDown('d')) - Number(input.isKeyDown('a'));
    const y = Number(input.isKeyDown('s')) - Number(input.isKeyDown('w'));
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
    title: 'Pierwsze obiekty i komponenty', summary: 'Zbuduj scenę z obiektów; komponenty zajmą się ich wyglądem.',
    objectives: ['Tworzysz GameObject i osobno ustawiasz jego pozycję.', 'Dodajesz ShapeRenderer oraz TextRenderer zamiast ręcznie rysować klatki.'],
    theory: ['W onCreate najpierw utwórz obiekt: const player = this.createObject("Player");. W następnym wierszu ustaw player.setPosition(80, 90);. Każda linia ma jedno zadanie: utworzenie, ustawienie pozycji, dodanie komponentu.', 'ShapeRenderer określa rozmiar i kolor. TextRenderer wyświetla napis w położeniu ekranowym. Silnik rysuje je automatycznie w każdej klatce. Pozycja obiektu oznacza środek; dodatnie y biegnie w dół. Ręczne rysowanie poznasz dopiero w osobnej lekcji 712.'],
    guided: {
      title: 'Zbuduj gracza', prompt: 'W onCreate utwórz obiekt Player. W osobnej linii ustaw jego pozycję (80, 90). Dodaj ShapeRenderer o szerokości 40, wysokości 30 i kolorze #76b9f2. Następnie dodaj do niego TextRenderer("Start", 60, 140). Nie rysuj nic ręcznie w onUpdate — komponenty zrobią to za Ciebie.',
      solution: scene(`${shape('Player', 80, 90, '#76b9f2', 40, 30)}\nplayer.addComponent(new TextRenderer('Start', 60, 140));`),
      checks: [check('Na planszy jest niebieski prostokąt 40 × 30 w (80, 90).', { 'commands.1.op': 'rect', 'commands.1.x': 80, 'commands.1.y': 90, 'commands.1.width': 40, 'commands.1.height': 30, 'commands.1.color': '#76b9f2' }), check('Pod prostokątem w (60, 140) widnieje tekst Start.', { 'commands.2.text': 'Start', 'commands.2.x': 60, 'commands.2.y': 140 })],
    },
    independent: {
      title: 'Dwie platformy', prompt: 'Utwórz dwa obiekty: najpierw PlatformA w (120, 180) ze ShapeRenderer 100 × 20 i kolorem #70c994, potem PlatformB w (300, 120) ze ShapeRenderer 80 × 20 i kolorem #ffd166. Dla każdego obiektu wywołaj createObject, setPosition i addComponent w osobnych liniach.',
      solution: scene(`${shape('PlatformA', 120, 180, '#70c994', 100, 20)}\n${shape('PlatformB', 300, 120, '#ffd166', 80, 20)}`),
      checks: [check('Pierwsza platforma jest zielona, 100 × 20, w (120, 180).', { 'commands.1.x': 120, 'commands.1.y': 180, 'commands.1.width': 100, 'commands.1.height': 20, 'commands.1.color': '#70c994' }), check('Druga platforma jest złota, 80 × 20, w (300, 120).', { 'commands.2.x': 300, 'commands.2.y': 120, 'commands.2.width': 80, 'commands.2.height': 20, 'commands.2.color': '#ffd166' })],
    },
  },
  {
    title: 'Pętla gry i czas', summary: 'Poruszaj obiektami w pikselach na sekundę.',
    objectives: ['Wyjaśniasz rolę delta w onUpdate.', 'Utrzymujesz jednakową prędkość przy różnych krokach czasu.'],
    theory: ['Przeglądarka wywołuje requestAnimationFrame; silnik oblicza delta w sekundach. Przesunięcie = prędkość × delta. Dodawanie stałego kroku co klatkę uzależnia ruch od szybkości komputera.', 'Scena tworzy obiekty w onCreate. Komponent Mover w osobnym pliku zmienia this.transform w onUpdate(delta), a ShapeRenderer automatycznie pokazuje nową pozycję. Nie musisz rysować obrazu po każdej zmianie.'],
    guided: {
      title: 'Ruch w prawo', prompt: 'Player ma pozycję (100, 80), ShapeRenderer 20 × 20 i komponent Mover. Uzupełnij components/Mover.js: w onUpdate(delta) zwiększaj this.transform.x o 80 * delta. Po 1 sekundzie x ma wynosić 180, również przy 20 krokach po 0,05 s. Pozostaw wygląd w ShapeRenderer.',
      starter: scene(`${shape('Player', 100, 80, '#76b9f2', 20, 20)}\nplayer.addComponent(new Mover());`, '', "import Mover from './components/Mover.js';"),
      extraStarter: { 'components/Mover.js': 'export default class Mover extends GameLab.Component {\n  onUpdate(delta) {\n    // Zwiększ this.transform.x o prędkość razy delta.\n  }\n}\n' },
      solutionExtra: { 'components/Mover.js': 'export default class Mover extends GameLab.Component {\n  onUpdate(delta) {\n    this.transform.x += 80 * delta;\n  }\n}\n' },
      checks: [check('Po sekundzie ruchu środek jest w (180, 80).', { 'commands.1.x': 180, 'commands.1.y': 80 }, { steps: 10, delta: 0.1 }), check('Przy 20 klatkach po 0,05 s pozycja pozostaje taka sama.', { 'commands.1.x': 180 }, { steps: 20, delta: 0.05 })],
    },
    independent: {
      title: 'Opadanie', prompt: 'Utwórz obiekt Drop w (200, 40) ze ShapeRenderer 24 × 24. Dodaj Mover z pliku components/Mover.js i zaprogramuj opadanie: this.transform.y zwiększa się o 60 * delta w onUpdate(delta). Po 0,5 s y = 70, po 1 s y = 100. Nie resetuj pozycji w onUpdate.',
      extraStarter: { 'components/Mover.js': 'export default class Mover extends GameLab.Component {\n  onUpdate(delta) {\n    // Zaprogramuj opadanie.\n  }\n}\n' },
      solution: scene(`${shape('Drop', 200, 40, '#76b9f2', 24, 24)}\ndrop.addComponent(new Mover());`, '', "import Mover from './components/Mover.js';"),
      solutionExtra: { 'components/Mover.js': 'export default class Mover extends GameLab.Component {\n  onUpdate(delta) {\n    this.transform.y += 60 * delta;\n  }\n}\n' },
      checks: [check('Po pół sekundy obiekt jest w (200, 70), rozmiar 24 × 24.', { 'commands.1.x': 200, 'commands.1.y': 70, 'commands.1.width': 24, 'commands.1.height': 24 }, { steps: 5 }), check('Po sekundzie obiekt jest w y = 100.', { 'commands.1.y': 100 }, { steps: 10 })],
    },
  },
  {
    title: 'Mapa kafelkowa i monety', summary: 'Zbuduj arenę z TileMap, a potem dodaj zbierany przedmiot.',
    objectives: ['Tworzysz TileMap trawy i piasku pod obiektami.', 'Używasz triggera, by zebrać monetę i zmienić licznik złota.'],
    theory: ['TileMap to warstwa świata rysowana pod obiektami. Dodaj ją do pustego GameObject: ground.addComponent(new GameLab.TileMap("grass", 32)). Kafelki są generowane lokalnie, więc trawa działa bez pobierania obrazków.', 'Moneta ma Trigger2D, więc nie blokuje ruchu. W onTrigger(other) sprawdź nazwę i czy moneta nie została już zebrana, zwiększ złoto i zniszcz monetę. Tę samą pętlę wykorzystasz później do zbierania dropów po pokonanych wrogach. Dostępne TileMap: grass i sand.'],
    guided: {
      title: 'Pierwsza łąka', prompt: 'W onCreate utwórz pusty obiekt Ground i dodaj do niego GameLab.TileMap("grass", 32). Następnie utwórz Player w (100, 80) ze Sprite("player", 32, 32). Kafelki trawy mają wypełnić canvas, a postać być narysowana nad nimi.',
      solution: scene("const ground = this.createObject('Ground');\nground.addComponent(new TileMap('grass', 32));\nthis.createObject('Player').setPosition(100, 80).addComponent(new Sprite('player', 32, 32));"),
      checks: [check('Podłoga jest tilemapą trawy z kafelkami 32 px.', { 'objects.0.name': 'Ground', 'objects.0.components.0': 'TileMap', 'commands.1.op': 'tilemap', 'commands.1.texture': 'grass', 'commands.1.tileSize': 32 }), check('Na trawie znajduje się sprite Player w (100, 80).', { 'objects.1.name': 'Player', 'objects.1.x': 100, 'objects.1.y': 80, 'commands.2.texture': 'player', 'commands.2.x': 100, 'commands.2.y': 80 })],
    },
    independent: {
      title: 'Zbierz monetę na arenie', prompt: 'Zbuduj piaszczystą mapę TileMap("sand", 24). Player w (100, 100) ma gotowy kontroler WASD. Dodaj Coin ze Sprite("coin", 16, 16) i Trigger2D w (160, 100). W PlayerController zbierz monetę tylko raz, dodaj 1 do gold i usuń ją. Wyświetlaj „Złoto: liczba” przez gotowy komponent TextRenderer.',
      starter: scene(`this.gold = 0;\n${movable}`, '', importController, "this.canvas.drawText(`Złoto: ${this.gold}`, 10, 24);"), extraStarter: { 'components/PlayerController.js': movementComponent },
      solution: scene(`this.gold = 0;\nconst ground = this.createObject('Ground');\nground.addComponent(new TileMap('sand', 24));\n${movable}\nconst coin = this.createObject('Coin').setPosition(160, 100);\ncoin.addComponent(new Sprite('coin', 16, 16));\ncoin.addComponent(new Trigger2D());`, '', importController, "this.canvas.drawText(`Złoto: ${this.gold}`, 10, 24);"),
      solutionExtra: { 'components/PlayerController.js': movementComponent.replace('\n}\n', `
  onTrigger(other) {
    if (other.name === 'Coin' && !other.collected) { other.collected = true; this.game.gold++; other.destroy(); }
  }
}
`) },
      checks: [check('Piaskowa TileMap jest narysowana przed graczem i monetą.', { 'commands.1.texture': 'sand', 'commands.1.tileSize': 24, 'commands.2.op': 'rect', 'commands.3.texture': 'coin' }), check('HUD zaczyna od zera, a moneta czeka w (160, 100).', { 'commands.4.text': 'Złoto: 0', 'objects.2.x': 160, 'objects.2.y': 100, 'objects.2.components.1': 'Trigger2D' }), check('Dotknięcie monety zwiększa złoto o 1 i usuwa ją.', { 'commands.3.text': 'Złoto: 1', 'objects.length': 2 }, { keys: ['d'], steps: 8 }), check('Ruch w górę mija monetę i nie nalicza złota.', { 'commands.4.text': 'Złoto: 0', 'objects.length': 3 }, { keys: ['w'], steps: 8 })],
    },
  },
  {
    title: 'AI przeciwników', summary: 'Dodaj przeciwników, którzy ścigają gracza jako osobne komponenty.',
    objectives: ['Tworzysz komponent EnemyAI w osobnym pliku.', 'Normalizujesz kierunek, aby wróg poruszał się ze stałą prędkością.'],
    theory: ['Każdy wróg może mieć własny komponent AI, który co klatkę odczyta pozycję Playera. Różne sprite’y (slime i bat) pozwalają odróżnić typy przeciwników, a różne prędkości nadają im inne zachowanie.', 'Policz dx i dy do gracza, długość przez Math.hypot(dx, dy), a następnie dodaj dx / długość * speed * delta do this.transform.x (analogicznie y). delta zapewnia niezależność od FPS. Własne zachowania trzymaj np. w components/EnemyAI.js.'],
    guided: {
      title: 'Slime ściga gracza', prompt: 'Uzupełnij components/EnemyAI.js. Wróg ma znaleźć Player przez this.game.find("Player") i poruszać się w jego stronę z prędkością 60 px/s. Scena ma Player w (300, 100) oraz Slime w (100, 100) ze Sprite("slime", 32, 32). Po sekundzie slime powinien być w (160, 100).',
      starter: scene("this.createObject('Player').setPosition(300, 100).addComponent(new Sprite('player', 32, 32));\nconst slime = this.createObject('Slime').setPosition(100, 100);\nslime.addComponent(new Sprite('slime', 32, 32));\nslime.addComponent(new EnemyAI(60));", '', "import EnemyAI from './components/EnemyAI.js';"),
      extraStarter: { 'components/EnemyAI.js': 'export default class EnemyAI extends GameLab.Component {\n  constructor(speed = 60) { super(); this.speed = speed; }\n  onUpdate(delta) {\n    // Znajdź Player i przesuń wroga w jego stronę.\n  }\n}\n' },
      solutionExtra: { 'components/EnemyAI.js': 'export default class EnemyAI extends GameLab.Component {\n  constructor(speed = 60) { super(); this.speed = speed; }\n  onUpdate(delta) {\n    const target = this.game.find("Player");\n    if (!target) return;\n    const dx = target.transform.x - this.transform.x;\n    const dy = target.transform.y - this.transform.y;\n    const distance = Math.hypot(dx, dy) || 1;\n    this.transform.x += dx / distance * this.speed * delta;\n    this.transform.y += dy / distance * this.speed * delta;\n  }\n}\n' },
      checks: [check('Slime dołącza komponent EnemyAI.', { 'objects.1.components.0': 'Sprite', 'objects.1.components.1': 'EnemyAI' }), check('Po sekundzie slime przesuwa się w stronę gracza z prędkością 60 px/s.', { 'objects.1.name': 'Slime', 'objects.1.x': 160, 'objects.1.y': 100 }, { steps: 10 })],
    },
    independent: {
      title: 'Bat ściga gracza', prompt: 'W components/EnemyAI.js napisz ten sam komponent, ale wróg ma prędkość 80 px/s. Dodaj Player ze Sprite("player", 32, 32) w (200, 260), a Bat ze Sprite("bat", 28, 24) w (200, 60) i EnemyAI(80). Po 0,5 s bat ma zbliżyć się do gracza na y = 100. Zachowaj osobny plik komponentu.',
      solution: scene("this.createObject('Player').setPosition(200, 260).addComponent(new Sprite('player', 32, 32));\nconst bat = this.createObject('Bat').setPosition(200, 60);\nbat.addComponent(new Sprite('bat', 28, 24));\nbat.addComponent(new EnemyAI(80));", '', "import EnemyAI from './components/EnemyAI.js';"),
      extraStarter: { 'components/EnemyAI.js': 'export default class EnemyAI extends GameLab.Component {\n  constructor(speed = 80) { super(); this.speed = speed; }\n  onUpdate(delta) {\n    // Znajdź cel i znormalizuj wektor ruchu.\n  }\n}\n' },
      solutionExtra: { 'components/EnemyAI.js': 'export default class EnemyAI extends GameLab.Component {\n  constructor(speed = 80) { super(); this.speed = speed; }\n  onUpdate(delta) {\n    const target = this.game.find("Player");\n    if (!target) return;\n    const dx = target.transform.x - this.transform.x;\n    const dy = target.transform.y - this.transform.y;\n    const distance = Math.hypot(dx, dy) || 1;\n    this.transform.x += dx / distance * this.speed * delta;\n    this.transform.y += dy / distance * this.speed * delta;\n  }\n}\n' },
      checks: [check('Bat ma osobny sprite i komponent EnemyAI.', { 'objects.1.components.0': 'Sprite', 'objects.1.components.1': 'EnemyAI', 'commands.2.texture': 'bat' }), check('Po pół sekundy bat przeleciał 40 px w stronę gracza.', { 'objects.1.x': 200, 'objects.1.y': 100 }, { steps: 5 })],
    },
  },
  {
    title: 'Klawiatura i Input', summary: 'Reaguj na przytrzymanie i pojedyncze naciśnięcie.',
    objectives: ['Sterujesz po kliknięciu planszy.', 'Odróżniasz isKeyDown od isKeyPressed.'],
    theory: ['this.game.input.isKeyDown("d") zwraca true przez cały czas trzymania D. Do ruchu użyj WASD: W góra, A lewo, S dół, D prawo. Pobierz CharacterController2D do zmiennej i wywołaj move(x, y, speed) — kontroler sam uwzględni delta. Na poziomie sceny używaj this.input, a w komponencie this.game.input.', 'isKeyPressed("Space") jest true tylko w pierwszej klatce nowego naciśnięcia. Przytrzymanie nie powtarza akcji. Kliknij canvas, aby uzyskał fokus; opuszczenie planszy czyści klawisze.'],
    guided: {
      title: 'Ruch WASD', prompt: 'Player w (100, 100) ma ShapeRenderer i CharacterController2D. Uzupełnij components/PlayerController.js: odczytaj WASD, oblicz x i y, pobierz CharacterController2D i wywołaj move(x, y, 120). Kontroler uwzględnia delta i normalizuje przekątną. Bez klawiszy gracz stoi. ControlsHint pokazuje instrukcję tylko do kliknięcia planszy.',
      starter: scene(`${movable}\nplayer.addComponent(new ControlsHint('Kliknij planszę. WASD: ruch'));`, '', importController),
      extraStarter: { 'components/PlayerController.js': controllerStub },
      solutionExtra: { 'components/PlayerController.js': movementComponent },
      checks: [position('Bez wejścia gracz pozostaje w (100, 100).', 'Player', 100, 100, { steps: 5 }), ...[['d', 112, 100], ['a', 88, 100], ['w', 100, 88], ['s', 100, 112]].map(([key, x, y]) => position(`Klawisz ${key.toUpperCase()} przesuwa gracza o 12 px w 0,1 s.`, 'Player', x, y, { keys: [key] }))],
    },
    independent: {
      title: 'Jedna akcja na spację', prompt: 'W onCreate ustaw this.jumps = 0, utwórz obiekt HUD i dodaj TextRenderer(() => `Skoki: ${this.jumps}`, 10, 24). W onUpdate każde NOWE naciśnięcie spacji zwiększa jumps o 1. Trzymanie spacji przez 10 klatek ma dać jeden skok; puszczenie i ponowne naciśnięcie daje drugi. Wygląd licznika pozostaw komponentowi.',
      solution: scene('this.jumps = 0;', "if (this.input.isKeyPressed('Space')) this.jumps++;", '', "this.canvas.drawText(`Skoki: ${this.jumps}`, 10, 24);"),
      checks: [check('Początkowo widnieje Skoki: 0.', { 'commands.1.text': 'Skoki: 0' }), check('Przytrzymanie spacji daje tylko jeden skok.', { 'commands.1.text': 'Skoki: 1' }, { keys: ['Space'], steps: 10 }), check('Puszczenie i ponowne naciśnięcie daje drugi skok.', { 'commands.1.text': 'Skoki: 2' }, { phases: [{ keys: ['Space'], steps: 5 }, { keys: [], steps: 1 }, { keys: ['Space'], steps: 1 }] })],
    },
  },
  {
    title: 'Kontroler ruchu i granice', summary: 'Użyj CharacterController2D do przewidywalnego ruchu.',
    objectives: ['Ustawiasz kierunek oraz prędkość przez move.', 'Sprawdzasz cały obiekt przy granicy i ruch po przekątnej.'],
    theory: ['CharacterController2D.move(x, y, speed) zapisuje prędkość; silnik przesuwa obiekt po aktualizacji komponentów. Kierunek jest normalizowany, więc przekątna nie jest szybsza. Do kontrolera sięgasz przez this.getComponent(GameLab.CharacterController2D).', 'collideWorldBounds domyślnie zatrzymuje cały obiekt wewnątrz planszy. Dla obiektu 32 × 32 minimalne x to 16, a maksymalne x to szerokość planszy minus 16. Rozmiar planszy odczytasz z this.game.canvas.width i height.'],
    guided: {
      title: 'Kontroler WASD', prompt: 'Uzupełnij components/PlayerController.js: oblicz kierunek z klawiszy W, A, S, D i wywołaj move(x, y, 120) na CharacterController2D. game.js ma gotowego Player 32 × 32. Sprawdzenie obejmuje wszystkie krawędzie i przekątną.',
      starter: scene(movable, '', importController), solutionExtra: { 'components/PlayerController.js': movementComponent }, extraStarter: { 'components/PlayerController.js': controllerStub },
      checks: [position('Prawa krawędź planszy 320 px zatrzymuje środek w x = 304.', 'Player', 304, 100, { width: 320, keys: ['d'], steps: 100 }), position('Lewa i górna krawędź zatrzymują środek w (16, 16).', 'Player', 16, 16, { keys: ['a', 'w'], steps: 100 }), position('Dolna krawędź planszy 200 px zatrzymuje środek w y = 184.', 'Player', 100, 184, { height: 200, keys: ['s'], steps: 100 }), position('Ruch po przekątnej ma tę samą prędkość całkowitą.', 'Player', 100 + 12 / Math.SQRT2, 100 + 12 / Math.SQRT2, { keys: ['d', 's'] })],
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
    title: 'Sprite’y i tweeny', summary: 'Ożywiaj sprite’y płynnymi animacjami pozycji i skali.',
    objectives: ['Dobierasz teksturę do gracza, wroga, monety i skrzyni.', 'Animujesz Transform tweenem bez ręcznego liczenia każdej klatki.'],
    theory: ['Sprite’y proceduralne player, slime, bat, coin, chest, projectile, gem i wall są dostępne od razu, bez sieci. Dodaj je jak inne komponenty wyglądu.', 'Tween zmienia Transform przez określony czas: GameLab.Tweens.position(object, x, y, seconds), scale(object, x, y, seconds), rotation(object, radians, seconds) albo shake(object, sila, seconds). Animacja używa płynnego easing; kolejny tween tej samej właściwości zastępuje poprzedni.'],
    guided: {
      title: 'Moneta leci do gracza', prompt: 'Utwórz Player ze Sprite("player", 32, 32) w (160, 100), a Coin ze Sprite("coin", 16, 16) w (160, 160). Uruchom GameLab.Tweens.position(coin, 160, 100, 1), aby moneta płynnie poleciała do gracza w sekundę. Nie zmieniaj pozycji ręcznie w onUpdate.',
      solution: scene("this.createObject('Player').setPosition(160, 100).addComponent(new Sprite('player', 32, 32));\nconst coin = this.createObject('Coin').setPosition(160, 160);\ncoin.addComponent(new Sprite('coin', 16, 16));\nTweens.position(coin, 160, 100, 1);"),
      checks: [check('Tween zaczyna od monety na (160, 160).', { 'objects.1.x': 160, 'objects.1.y': 160, 'commands.2.texture': 'coin' }, { steps: 0 }), check('Po pół sekundy moneta jest w połowie płynnego ruchu (160, 130).', { 'objects.1.x': 160, 'objects.1.y': 130 }, { steps: 5 }), check('Po sekundzie tween kończy się przy graczu.', { 'objects.1.x': 160, 'objects.1.y': 100 }, { steps: 10 })],
    },
    independent: {
      title: 'Odbicie i animowana skala', prompt: 'Utwórz Enemy ze Sprite("slime", 32, 32) w (100, 100), odbij go przez scale.x = -1. Dodaj Gem ze Sprite("gem", 24, 24) w (240, 100). Uruchom tween skali gema do (1.5, 1.5) w 0,5 s.',
      solution: scene("const enemy = this.createObject('Enemy').setPosition(100, 100);\nenemy.addComponent(new Sprite('slime', 32, 32));\nenemy.transform.scale.x = -1;\nconst gem = this.createObject('Gem').setPosition(240, 100);\ngem.addComponent(new Sprite('gem', 24, 24));\nTweens.scale(gem, 1.5, 1.5, 0.5);"),
      checks: [check('Slime jest odbity, a gem zaczyna od skali 1.', { 'objects.0.scaleX': -1, 'objects.1.scaleX': 1, 'commands.1.texture': 'slime', 'commands.2.texture': 'gem' }, { steps: 0 }), check('Po 0,3 s płynny easing ustawia gem na skali około 1,32.', { 'objects.1.scaleX': 1.324, 'objects.1.scaleY': 1.324 }, { steps: 3, delta: 0.1 }), check('Po pół sekundy tween kończy się na skali 1,5.', { 'objects.1.scaleX': 1.5, 'objects.1.scaleY': 1.5 }, { steps: 5 })],
    },
  },
  {
    title: 'Skrzynie i nagrody', summary: 'Otwórz skrzynię po kontakcie, przyznaj nagrodę tylko raz i animuj otwarcie.',
    objectives: ['Wykrywasz wejście gracza w Trigger2D skrzyni.', 'Chronisz nagrodę przed wielokrotnym naliczaniem i animujesz skrzynię tweenem.'],
    theory: ['Trigger2D wykrywa kontakt, ale nie blokuje ruchu. W onTrigger(other) rozpoznaj skrzynię po nazwie i dodaj warunek !other.opened — bez niego gracz stojący przy skrzyni dostawałby nagrodę co klatkę.', 'Po otwarciu ustaw opened = true, dodaj złoto i użyj GameLab.Tweens.scale(other, 1.2, 1.2, 0.2), żeby skrzynia podskoczyła. TextRenderer wyświetla aktualny stan złota nad światem gry. Podaj mu funkcję () => `Złoto: ${this.gold}`.'],
    guided: {
      title: 'Otwórz skrzynię', prompt: 'Player (32 × 32) w (100, 100) ma gotowy kontroler WASD. Dodaj Chest w (160, 100) ze Sprite("chest", 28, 24) i Trigger2D. W PlayerController obsłuż onTrigger(other): gdy other.name === "Chest" i skrzynia nie jest otwarta, ustaw other.opened = true, dodaj 20 do this.game.gold i uruchom tween skali skrzyni do (1.2, 1.2) w 0,2 s. Złoto wyświetla gotowy TextRenderer; nie musisz ręcznie rysować napisu.',
      starter: scene('this.gold = 0;\n' + movable, '', importController, "this.canvas.drawText(`Złoto: ${this.gold}`, 10, 24);"), extraStarter: { 'components/PlayerController.js': movementComponent },
      solution: scene(`this.gold = 0;\n${movable}\nconst chest = this.createObject('Chest').setPosition(160, 100);\nchest.addComponent(new Sprite('chest', 28, 24));\nchest.addComponent(new Trigger2D());`, '', importController, "this.canvas.drawText(`Złoto: ${this.gold}`, 10, 24);"),
      solutionExtra: { 'components/PlayerController.js': movementComponent.replace('\n}\n', `
  onTrigger(other) {
    if (other.name === 'Chest' && !other.opened) {
      other.opened = true;
      this.game.gold += 20;
      GameLab.Tweens.scale(other, 1.2, 1.2, 0.2);
    }
  }
}
`) },
      checks: [check('Złoto zaczyna się od 0, skrzynia jest zamknięta i ma trigger.', { 'commands.3.text': 'Złoto: 0', 'objects.1.name': 'Chest', 'objects.1.renderer.texture': 'chest', 'objects.1.components.1': 'Trigger2D' }), check('Kontakt otwiera skrzynię i daje dokładnie 20 złota.', { 'commands.3.text': 'Złoto: 20', 'objects.1.scaleX': 1.2 }, { keys: ['d'], steps: 8 }), check('Pozostanie przy skrzyni nie przyznaje kolejnych monet.', { 'commands.3.text': 'Złoto: 20' }, { keys: ['d'], steps: 16 })],
    },
    independent: {
      title: 'Skrzynia i dwie nagrody', prompt: 'Player w (100, 100) ma gotowy ruch WASD. Dodaj dwie skrzynie ze Sprite("chest", 28, 24) i Trigger2D w (160, 100) oraz (240, 100). Każdą można otworzyć tylko raz: zwiększ złoto o 10, ustaw opened = true i uruchom GameLab.Tweens.scale(..., 1.2, 1.2, 0.2). HUD „Złoto: liczba” wyświetla gotowy TextRenderer.',
      starter: scene(`this.gold = 0;\n${movable}`, '', importController, "this.canvas.drawText(`Złoto: ${this.gold}`, 10, 24);"), extraStarter: { 'components/PlayerController.js': movementComponent },
      solution: scene(`this.gold = 0;\n${movable}\nconst chestA = this.createObject('ChestA').setPosition(160, 100);\nchestA.addComponent(new Sprite('chest', 28, 24));\nchestA.addComponent(new Trigger2D());\nconst chestB = this.createObject('ChestB').setPosition(240, 100);\nchestB.addComponent(new Sprite('chest', 28, 24));\nchestB.addComponent(new Trigger2D());`, '', importController, "this.canvas.drawText(`Złoto: ${this.gold}`, 10, 24);"),
      solutionExtra: { 'components/PlayerController.js': movementComponent.replace('\n}\n', `
  onTrigger(other) {
    if (other.name.startsWith('Chest') && !other.opened) {
      other.opened = true;
      this.game.gold += 10;
      GameLab.Tweens.scale(other, 1.2, 1.2, 0.2);
    }
  }
}
`) },
      checks: [check('Dwie skrzynie czekają na gracza, a licznik złota wynosi 0.', { 'commands.4.text': 'Złoto: 0', 'objects.1.renderer.texture': 'chest', 'objects.2.renderer.texture': 'chest' }), check('Pierwsza otwarta skrzynia daje 10 złota.', { 'commands.4.text': 'Złoto: 10', 'objects.1.scaleX': 1.2 }, { keys: ['d'], steps: 8 }), check('Dojście do drugiej skrzyni daje łącznie 20 złota.', { 'commands.4.text': 'Złoto: 20', 'objects.2.scaleX': 1.2 }, { keys: ['d'], steps: 18 })],
    },
  },
  {
    title: 'Pauza i ulepszenia', summary: 'Zatrzymaj akcję, wydaj złoto i wybierz rozwój postaci.',
    objectives: ['Otwierasz ekran wyboru podczas pauzy.', 'Kupujesz ulepszenia za walutę i aktualizujesz HUD.'],
    theory: ['Po wciśnięciu Escape wstrzymaj sterowanie i pokaż proste menu. W grze survival ulepszenia mogą zwiększyć szybkość, obrażenia lub tempo ataku. Sprawdzaj, czy gracz ma dość złota, zanim odejmiesz koszt.', 'Napisy interfejsu dodaj jako TextRenderer. Funkcja zwracająca null ukrywa napis, np. poza pauzą. Obsługuj wybory przez isKeyPressed, aby trzymanie klawisza nie kupiło ulepszenia kilka razy. Escape zamyka menu, jeśli jest otwarte.'],
    guided: {
      title: 'Pauza i pierwszy zakup', prompt: 'Zacznij z gold = 30, damage = 1 i paused = false. Escape przełącza pauzę. Gdy paused, naciśnięcie 1 i gold >= 20 kupuje +1 damage za 20 złota i zamyka pauzę. Dodaj trzy komponenty TextRenderer: złoto w (10, 24), obrażenia w (10, 48) i komunikat „Pauza: wybierz 1” w (10, 72). Dla komunikatu użyj funkcji zwracającej null poza pauzą.',
      solution: scene('this.gold = 30;\nthis.damage = 1;\nthis.paused = false;', "if (this.input.isKeyPressed('Escape')) this.paused = !this.paused;\nif (this.paused && this.input.isKeyPressed('1') && this.gold >= 20) { this.gold -= 20; this.damage++; this.paused = false; }", '', "this.canvas.drawText(`Złoto: ${this.gold}`, 10, 24);\nthis.canvas.drawText(`Obrażenia: ${this.damage}`, 10, 48);\nif (this.paused) this.canvas.drawText('Pauza: wybierz 1', 10, 72);"),
      checks: [check('Początkowy HUD pokazuje 30 złota i 1 obrażenie.', { 'commands.1.text': 'Złoto: 30', 'commands.2.text': 'Obrażenia: 1' }), check('Escape wstrzymuje grę i otwiera wybór ulepszenia.', { 'commands.3.text': 'Pauza: wybierz 1' }, { keys: ['Escape'] }), check('Wybór 1 wydaje 20 złota, zwiększa obrażenia i wznawia grę.', { 'commands.1.text': 'Złoto: 10', 'commands.2.text': 'Obrażenia: 2', 'commands.length': 3 }, { phases: [{ keys: ['Escape'] }, { keys: ['1'] }] }), check('Zakup nie działa, gdy brakuje złota.', { 'commands.1.text': 'Złoto: 10', 'commands.2.text': 'Obrażenia: 2', 'commands.3.text': 'Pauza: wybierz 1' }, { phases: [{ keys: ['Escape'] }, { keys: ['1'] }, { keys: ['Escape'] }, { keys: ['1'] }] })],
    },
    independent: {
      title: 'Trzy ulepszenia do wyboru', prompt: 'Zacznij z gold = 45, speed = 120, damage = 1 i cooldown = 1. Escape otwiera pauzę. Wybór 1 kosztuje 20 i dodaje 30 do speed; 2 kosztuje 25 i dodaje 1 do damage; 3 kosztuje 15 i zmniejsza cooldown o 0,2. Zakup zamyka pauzę; bez wystarczającego złota nic nie zmieniaj. Pokaż status przez TextRenderer: złoto w (10, 24), szybkość i obrażenia w (10, 48), tempo ataku w (10, 72), a wybory podczas pauzy w (10, 96).',
      solution: scene('this.gold = 45;\nthis.speed = 120;\nthis.damage = 1;\nthis.cooldown = 1;\nthis.paused = false;', "if (this.input.isKeyPressed('Escape')) this.paused = !this.paused;\nif (this.paused && this.input.isKeyPressed('1') && this.gold >= 20) { this.gold -= 20; this.speed += 30; this.paused = false; }\nif (this.paused && this.input.isKeyPressed('2') && this.gold >= 25) { this.gold -= 25; this.damage++; this.paused = false; }\nif (this.paused && this.input.isKeyPressed('3') && this.gold >= 15) { this.gold -= 15; this.cooldown = Math.max(0.2, this.cooldown - 0.2); this.paused = false; }", '', "this.canvas.drawText(`Złoto: ${this.gold}`, 10, 24);\nthis.canvas.drawText(`Szybkość: ${this.speed} Obrażenia: ${this.damage}`, 10, 48);\nthis.canvas.drawText(`Tempo ataku: ${this.cooldown}`, 10, 72);\nif (this.paused) this.canvas.drawText('1: Szybkość  2: Obrażenia  3: Tempo', 10, 96);"),
      checks: [check('Pokazuje wszystkie bazowe statystyki i 45 złota.', { 'commands.1.text': 'Złoto: 45', 'commands.2.text': 'Szybkość: 120 Obrażenia: 1', 'commands.3.text': 'Tempo ataku: 1' }), check('Opcja 2 kupuje obrażenia i odejmuje właściwy koszt.', { 'commands.1.text': 'Złoto: 20', 'commands.2.text': 'Szybkość: 120 Obrażenia: 2', 'commands.length': 4 }, { phases: [{ keys: ['Escape'] }, { keys: ['2'] }] }), check('Opcja 1 zwiększa szybkość o 30.', { 'commands.1.text': 'Złoto: 25', 'commands.2.text': 'Szybkość: 150 Obrażenia: 1' }, { phases: [{ keys: ['Escape'] }, { keys: ['1'] }] }), check('Dwa zakupy obniżają cooldown o 0,4 s.', { 'commands.3.text': 'Tempo ataku: 0.6000000000000001' }, { phases: [{ keys: ['Escape'] }, { keys: ['3'] }, { keys: ['Escape'] }, { keys: ['3'] }] })],
    },
  },
];

// Zachowujemy krótki fundament, a potem prowadzimy ucznia przez systemy w
// kolejności z Java Game Dev: sterowanie → mapa → AI → walka → tweeny →
// skrzynie → ulepszenia. Monety i pełna pętla nagrody są w finale 710.
const [canvasLesson, timeLesson, tileMapLesson, enemyAiLesson, inputLesson, controllerLesson, tweenLesson, chestLesson, upgradeLesson] = recipes;
recipes.splice(0, recipes.length,
  canvasLesson, timeLesson, inputLesson, tileMapLesson, enemyAiLesson,
  controllerLesson, tweenLesson, chestLesson, upgradeLesson,
);

// The Java course introduces weapons/projectiles after enemy steering.
controllerLesson.title = 'Broń automatyczna i pociski';
controllerLesson.summary = 'Zamień naciśnięcie lub timer w pocisk, obrażenia i pokonanego wroga.';
controllerLesson.objectives = ['Tworzysz pocisk jako GameObject ze sprite’em.', 'Używasz tweena do lotu i zadajesz obrażenia wybranemu wrogowi.'];
controllerLesson.theory = [
  'Broń oddziel od gracza w components/Weapon.js. W zadaniu prowadzonym spacja wystrzeli pocisk w kierunku najbliższego celu; w kolejnym zadaniu broń strzela automatycznie według cooldownu.',
  'Pocisk jest osobnym obiektem ze Sprite("projectile"). GameLab.Tweens.position animuje go do celu. Obrażenia odejmuj od hp, a pokonanego wroga usuń i zwiększ kills. W finale wrogowie zostawią monety.',
];
controllerLesson.guided = {
  title: 'Strzał w slime',
  prompt: 'Player ze Sprite("player") stoi w (100, 100), a Slime ze Sprite("slime") w (260, 100) ma hp = 1. W components/Weapon.js obsłuż nowe naciśnięcie Space: utwórz Projectile z Sprite("projectile"), uruchom tween do wroga na 0,2 s, zadaj 1 obrażenie, usuń przeciwnika po hp = 0 i zwiększ kills. HUD ma pokazać „Pokonani: 1”.',
  starter: scene("this.kills = 0;\nconst player = this.createObject('Player').setPosition(100, 100);\nplayer.addComponent(new Sprite('player', 32, 32));\nplayer.addComponent(new Weapon());\nconst slime = this.createObject('Slime').setPosition(260, 100);\nslime.hp = 1;\nslime.addComponent(new Sprite('slime', 32, 32));", '', "import Weapon from './components/Weapon.js';", "this.canvas.drawText(`Pokonani: ${this.kills}`, 10, 24);"),
  extraStarter: { 'components/Weapon.js': 'export default class Weapon extends GameLab.Component {\n  onUpdate() {\n    // Spacja wystrzeliwuje w kierunku Slime.\n  }\n}\n' },
  solution: scene("this.kills = 0;\nconst player = this.createObject('Player').setPosition(100, 100);\nplayer.addComponent(new Sprite('player', 32, 32));\nplayer.addComponent(new Weapon());\nconst slime = this.createObject('Slime').setPosition(260, 100);\nslime.hp = 1;\nslime.addComponent(new Sprite('slime', 32, 32));", '', "import Weapon from './components/Weapon.js';", "this.canvas.drawText(`Pokonani: ${this.kills}`, 10, 24);"),
  solutionExtra: { 'components/Weapon.js': `export default class Weapon extends GameLab.Component {
  onUpdate() {
    if (!this.game.input.isKeyPressed('Space')) return;
    const enemy = this.game.find('Slime');
    if (!enemy) return;
    const shot = this.game.createObject('Projectile').setPosition(this.transform.x, this.transform.y);
    shot.addComponent(new GameLab.Sprite('projectile', 10, 10));
    GameLab.Tweens.position(shot, enemy.transform.x, enemy.transform.y, 0.2);
    enemy.hp--;
    if (enemy.hp <= 0) { enemy.destroy(); this.game.kills++; }
  }
}
` },
  checks: [check('Na starcie jest gracz, slime z hp 1 i broń.', { 'objects.0.name': 'Player', 'objects.0.components.1': 'Weapon', 'objects.1.hp': 1, 'objects.1.renderer.texture': 'slime' }, { steps: 0 }), check('Spacja usuwa pokonanego slime’a i tworzy lecący pocisk.', { 'objects.length': 2, 'objects.1.name': 'Projectile', 'objects.1.renderer.texture': 'projectile', 'commands.2.text': 'Pokonani: 1' }, { keys: ['Space'] }), check('Ponowne naciśnięcie bez celu nie nalicza kolejnego pokonania.', { 'commands.3.text': 'Pokonani: 1' }, { phases: [{ keys: ['Space'] }, { keys: [] }, { keys: ['Space'] }] })],
};
controllerLesson.independent = {
  title: 'Autoatak z cooldownem',
  prompt: 'Player ma Weapon w (100, 100), Enemy ze Sprite("bat") w (240, 100) i hp = 2. Zaimplementuj automatyczne strzelanie co 0,5 s bez naciskania spacji. Wybierz wroga, utwórz i animuj pocisk, odejmij damage = 1; po pierwszym strzale Enemy powinien mieć hp = 1. Nie strzelaj ponownie przed upływem cooldownu.',
  starter: scene("this.damage = 1;\nconst player = this.createObject('Player').setPosition(100, 100);\nplayer.addComponent(new Sprite('player', 32, 32));\nplayer.addComponent(new Weapon());\nconst enemy = this.createObject('Enemy').setPosition(240, 100);\nenemy.hp = 2;\nenemy.addComponent(new Sprite('bat', 28, 24));", '', "import Weapon from './components/Weapon.js';"),
  extraStarter: { 'components/Weapon.js': 'export default class Weapon extends GameLab.Component {\n  constructor() { super(); this.timer = 0; }\n  onUpdate(delta) {\n    // Wybierz najbliższy cel i obsłuż cooldown.\n  }\n}\n' },
  solution: scene("this.damage = 1;\nconst player = this.createObject('Player').setPosition(100, 100);\nplayer.addComponent(new Sprite('player', 32, 32));\nplayer.addComponent(new Weapon());\nconst enemy = this.createObject('Enemy').setPosition(240, 100);\nenemy.hp = 2;\nenemy.addComponent(new Sprite('bat', 28, 24));", '', "import Weapon from './components/Weapon.js';"),
  solutionExtra: { 'components/Weapon.js': `export default class Weapon extends GameLab.Component {
  constructor() { super(); this.timer = 0; }
  onCreate() { this.timer = 0.5; }
  onUpdate(delta) {
    this.timer -= delta;
    if (this.timer > 0) return;
    const enemy = this.game.find('Enemy');
    if (!enemy) return;
    enemy.hp -= this.game.damage;
    const shot = this.game.createObject('Projectile').setPosition(this.transform.x, this.transform.y);
    shot.addComponent(new GameLab.Sprite('projectile', 10, 10));
    GameLab.Tweens.position(shot, enemy.transform.x, enemy.transform.y, 0.2);
    shot.addComponent(new class extends GameLab.Component { onUpdate(delta) { this.life = (this.life || 0) + delta; if (this.life >= 0.2) this.gameObject.destroy(); } });
    this.timer = 0.5;
  }
}
` },
  checks: [check('Enemy starts with 2 HP and the player has a Weapon.', { 'objects.1.hp': 2, 'objects.0.components.1': 'Weapon', 'objects.1.renderer.texture': 'bat' }, { steps: 0 }), check('Po 0,5 s automatyczny strzał zadaje 1 obrażenie.', { 'objects.1.hp': 1, 'objects.2.name': 'Projectile' }, { steps: 6 }), check('Przed upływem kolejnych 0,5 s broń czeka na cooldown.', { 'objects.1.hp': 1 }, { phases: [{ keys: [], steps: 6 }, { keys: [], steps: 4 }] })],
};

recipes.push({
  title: 'Projekt: survival na arenie', summary: 'Połącz trawiastą mapę, fale wrogów, automatyczny atak, skrzynię i ulepszenia.',
  objectives: ['Budujesz mały Vampire Survivors–inspirowany vertical slice z osobnych komponentów.', 'Przetrwasz fale, zbierasz nagrody i rozwijasz postać między starciami.'],
  theory: ['To mały, grywalny vertical slice, a nie pełna kopia gry: poruszaj się WASD, omijaj przeciwników, broń automatycznie wybiera najbliższy cel, a pokonani wrogowie zostawiają złoto. Mapa, bohater, AI i broń są oddzielnymi modułami.', 'Skrzynia daje jednorazową nagrodę. Escape otwiera pauzę, a klawisze 1/2/3 kupują szybkość, obrażenia lub tempo ataku. Zwiększaj stopniowo zakres: najpierw uruchom scenę, potem każdy komponent, a na końcu przejdź scenariusze z ruchem, atakiem i ulepszeniem.'],
  guided: {
    title: 'Zbuduj arenę i fale', prompt: 'Zbuduj scenę: Ground z TileMap("grass", 32), Player ze Sprite("player", 32, 32) w (100, 100), dwa różne typy przeciwników (slime i bat) z EnemyAI oraz Weapon, i Chest ze Sprite("chest", 28, 24) i Trigger2D. Sterowanie wyłącznie WASD. Broń automatycznie atakuje najbliższego wroga; wróg po pokonaniu zostawia Coin. Skrzynia daje 20 złota tylko raz. Escape otwiera pauzę, 1/2/3 kupuje trzy ulepszenia. Dodaj HUD z falą, zdrowiem, złotem i liczbą pokonanych wrogów. Trzymaj PlayerController, EnemyAI i Weapon w osobnych plikach components/.',
    starter: scene("this.wave = 1;\nthis.gold = 0;\nthis.kills = 0;\nthis.health = 3;\nthis.speed = 120;\nthis.damage = 1;\nthis.cooldown = 0.8;\nthis.paused = false;\n// Utwórz TileMap, obiekty i podepnij komponenty.", '', "import PlayerController from './components/PlayerController.js';\nimport EnemyAI from './components/EnemyAI.js';\nimport Weapon from './components/Weapon.js';", "this.canvas.drawText(`Fala: ${this.wave}  Zdrowie: ${this.health}`, 10, 24);\nthis.canvas.drawText(`Złoto: ${this.gold}  Pokonani: ${this.kills}`, 10, 48);\nif (this.paused) this.canvas.drawText('1: Szybkość  2: Obrażenia  3: Tempo ataku', 10, 72);"), extraStarter: {
      'components/PlayerController.js': controllerStub,
      'components/EnemyAI.js': 'export default class EnemyAI extends GameLab.Component {\n  onUpdate(delta) {\n    // Ścigaj Playera i obsłuż trafienie.\n  }\n}\n',
      'components/Weapon.js': 'export default class Weapon extends GameLab.Component {\n  onUpdate(delta) {\n    // Znajdź najbliższego wroga i wystrzel pocisk.\n  }\n}\n',
    },
    solution: scene(`this.wave = 1;\nthis.gold = 0;\nthis.kills = 0;\nthis.health = 3;\nthis.speed = 120;\nthis.damage = 1;\nthis.cooldown = 0.8;\nthis.paused = false;\nconst ground = this.createObject('Ground');\nground.addComponent(new TileMap('grass', 32));\nconst player = this.createObject('Player').setPosition(100, 100);\nplayer.addComponent(new Sprite('player', 32, 32));\nplayer.addComponent(new CharacterController2D());\nplayer.addComponent(new PlayerController());\nplayer.addComponent(new Weapon());\nconst slime = this.createObject('Slime').setPosition(260, 100);\nslime.hp = 2;\nslime.addComponent(new Sprite('slime', 32, 32));\nslime.addComponent(new Trigger2D());\nslime.addComponent(new EnemyAI(42));\nconst bat = this.createObject('Bat').setPosition(400, 220);\nbat.hp = 1;\nbat.addComponent(new Sprite('bat', 28, 24));\nbat.addComponent(new Trigger2D());\nbat.addComponent(new EnemyAI(65));\nconst chest = this.createObject('Chest').setPosition(160, 100);\nchest.addComponent(new Sprite('chest', 28, 24));\nchest.addComponent(new Trigger2D());`, "if (this.input.isKeyPressed('Escape')) this.paused = !this.paused;\nif (this.paused && this.input.isKeyPressed('1') && this.gold >= 20) { this.gold -= 20; this.speed += 30; this.paused = false; }\nif (this.paused && this.input.isKeyPressed('2') && this.gold >= 20) { this.gold -= 20; this.damage++; this.paused = false; }\nif (this.paused && this.input.isKeyPressed('3') && this.gold >= 20) { this.gold -= 20; this.cooldown = Math.max(0.2, this.cooldown - 0.2); this.paused = false; }", "import PlayerController from './components/PlayerController.js';\nimport EnemyAI from './components/EnemyAI.js';\nimport Weapon from './components/Weapon.js';", "this.canvas.drawText(`Fala: ${this.wave}  Zdrowie: ${this.health}`, 10, 24);\nthis.canvas.drawText(`Złoto: ${this.gold}  Pokonani: ${this.kills}`, 10, 48);\nif (this.paused) this.canvas.drawText('1: Szybkość  2: Obrażenia  3: Tempo ataku', 10, 72);"),
    solutionExtra: {
      'components/PlayerController.js': `export default class PlayerController extends GameLab.Component {
  onUpdate() {
    if (this.game.paused || this.game.health <= 0) return;
    const input = this.game.input;
    const x = Number(input.isKeyDown('d')) - Number(input.isKeyDown('a'));
    const y = Number(input.isKeyDown('s')) - Number(input.isKeyDown('w'));
    this.getComponent(GameLab.CharacterController2D).move(x, y, this.game.speed);
  }
  onTrigger(other) {
    if (other.name === 'Chest' && !other.opened) {
      other.opened = true; this.game.gold += 20;
      GameLab.Tweens.scale(other, 1.2, 1.2, 0.2);
    }
    if (other.name === 'Coin' && !other.collected) {
      other.collected = true; this.game.gold += 5; other.destroy();
    }
    if ((other.name === 'Slime' || other.name === 'Bat') && !this.game.invulnerable) {
      this.game.health = Math.max(0, this.game.health - 1); this.game.invulnerable = true;
      GameLab.Tweens.shake(this.gameObject, 5, 0.25);
    }
  }
}
`,
      'components/EnemyAI.js': `export default class EnemyAI extends GameLab.Component {
  constructor(speed = 50) { super(); this.speed = speed; this.hitTimer = 0; }
  onUpdate(delta) {
    if (this.game.paused) return;
    const target = this.game.find('Player');
    if (!target) return;
    if (this.gameObject.hp <= 0) {
      this.game.kills++;
      const coin = this.game.createObject('Coin').setPosition(this.transform.x, this.transform.y);
      coin.addComponent(new GameLab.Sprite('coin', 14, 14)); coin.addComponent(new GameLab.Trigger2D());
      this.gameObject.destroy(); return;
    }
    const dx = target.transform.x - this.transform.x, dy = target.transform.y - this.transform.y;
    const distance = Math.hypot(dx, dy) || 1;
    this.transform.x += dx / distance * this.speed * delta;
    this.transform.y += dy / distance * this.speed * delta;
  }
}
`,
      'components/Weapon.js': `export default class Weapon extends GameLab.Component {
  constructor() { super(); this.timer = 0; }
  onCreate() { this.timer = this.game.cooldown; }
  onUpdate(delta) {
    if (this.game.paused || this.game.health <= 0) return;
    this.timer -= delta;
    if (this.timer > 0) return;
    const targets = this.game.objects.filter(o => (o.name === 'Slime' || o.name === 'Bat') && !o.destroyed);
    targets.sort((a, b) => Math.hypot(a.transform.x - this.transform.x, a.transform.y - this.transform.y) - Math.hypot(b.transform.x - this.transform.x, b.transform.y - this.transform.y));
    const target = targets[0];
    if (!target) return;
    target.hp -= this.game.damage;
    const shot = this.game.createObject('Projectile').setPosition(this.transform.x, this.transform.y);
    shot.addComponent(new GameLab.Sprite('projectile', 10, 10));
    GameLab.Tweens.position(shot, target.transform.x, target.transform.y, 0.2);
    shot.addComponent(new class extends GameLab.Component { onUpdate(delta) { this.life = (this.life || 0) + delta; if (this.life >= 0.2) this.gameObject.destroy(); } });
    this.timer = this.game.cooldown;
  }
}
`,
    },
    checks: [check('Arena startuje z trawą, graczem, slime, batem i skrzynią.', { 'objects.0.components.0': 'TileMap', 'commands.1.op': 'tilemap', 'objects.1.name': 'Player', 'objects.2.renderer.texture': 'slime', 'objects.3.renderer.texture': 'bat', 'objects.4.renderer.texture': 'chest' }, { steps: 0 }), check('HUD pokazuje falę, zdrowie i złoto nad mapą.', { 'commands.6.text': 'Fala: 1  Zdrowie: 3', 'commands.7.text': 'Złoto: 0  Pokonani: 0' }), check('WASD porusza graczem po arenie.', { 'objects.1.x': 112, 'objects.1.y': 100 }, { keys: ['d'] }), check('Broń automatycznie namierza i trafia najbliższego wroga; widać pocisk.', { 'objects.2.hp': 1, 'objects.5.name': 'Projectile', 'commands.7.text': 'Fala: 1  Zdrowie: 3' }, { steps: 10 }), check('Dotknięcie skrzyni dodaje jednorazowo 20 złota.', { 'commands.7.text': 'Złoto: 20  Pokonani: 0', 'objects.4.scaleX': 1.2 }, { keys: ['d'], steps: 6 }), check('Escape pokazuje pauzę i opcje ulepszeń.', { 'commands.8.text': '1: Szybkość  2: Obrażenia  3: Tempo ataku' }, { keys: ['Escape'] }), check('Ulepszenie za złoto kupuje się i wznawia walkę.', { 'commands.7.text': 'Złoto: 0  Pokonani: 0', 'commands.6.text': 'Fala: 1  Zdrowie: 3' }, { phases: [{ keys: ['d'], steps: 6 }, { keys: ['Escape'] }, { keys: ['1'] }] })],
  },
  independent: {
    title: 'Własny typ przeciwnika i fala', prompt: 'Rozbuduj arenę o trzeciego wroga Ghost ze Sprite("ghost", 32, 32), prędkością 35 i trzema punktami zdrowia. Ustaw falę 2 i dodaj go razem ze slime i bat; pokaż na HUD numer fali oraz liczbę pokonanych przeciwników. Użyj komponentów PlayerController, EnemyAI i Weapon z zadania prowadzonego.',
    starter: scene('// Dodaj stan fali, mapę, gracza oraz trzy typy przeciwników.', '', "import PlayerController from './components/PlayerController.js';\nimport EnemyAI from './components/EnemyAI.js';\nimport Weapon from './components/Weapon.js';", "this.canvas.drawText(`Fala: ${this.wave}  Zdrowie: ${this.health}`, 10, 24);\nthis.canvas.drawText(`Złoto: ${this.gold}  Pokonani: ${this.kills}`, 10, 48);"),
    extraStarter: {
      'components/PlayerController.js': controllerStub,
      'components/EnemyAI.js': 'export default class EnemyAI extends GameLab.Component {\n  onUpdate(delta) { /* Ścigaj Playera. */ }\n}\n',
      'components/Weapon.js': 'export default class Weapon extends GameLab.Component {\n  onUpdate(delta) { /* Autoatakuj najbliższy cel. */ }\n}\n',
    },
    solution: scene(`this.wave = 2;\nthis.gold = 0;\nthis.kills = 0;\nthis.health = 3;\nthis.speed = 120;\nthis.damage = 1;\nthis.cooldown = 0.8;\nthis.paused = false;\nconst ground = this.createObject('Ground'); ground.addComponent(new TileMap('grass', 32));\nconst player = this.createObject('Player').setPosition(100, 100); player.addComponent(new Sprite('player', 32, 32)); player.addComponent(new CharacterController2D()); player.addComponent(new PlayerController()); player.addComponent(new Weapon());\nfor (const [name, texture, x, y, hp, speed] of [['Slime', 'slime', 260, 100, 2, 42], ['Bat', 'bat', 400, 220, 1, 65], ['Ghost', 'ghost', 500, 100, 3, 35]]) { const enemy = this.createObject(name).setPosition(x, y); enemy.hp = hp; enemy.addComponent(new Sprite(texture, 32, 32)); enemy.addComponent(new Trigger2D()); enemy.addComponent(new EnemyAI(speed)); }`, "if (this.input.isKeyPressed('Escape')) this.paused = !this.paused;", "import PlayerController from './components/PlayerController.js';\nimport EnemyAI from './components/EnemyAI.js';\nimport Weapon from './components/Weapon.js';", "this.canvas.drawText(`Fala: ${this.wave}  Zdrowie: ${this.health}`, 10, 24);\nthis.canvas.drawText(`Złoto: ${this.gold}  Pokonani: ${this.kills}`, 10, 48);"),
    solutionExtra: {
      'components/PlayerController.js': `export default class PlayerController extends GameLab.Component { onUpdate() { if (this.game.paused) return; const i = this.game.input; this.getComponent(GameLab.CharacterController2D).move(Number(i.isKeyDown('d'))-Number(i.isKeyDown('a')), Number(i.isKeyDown('s'))-Number(i.isKeyDown('w')), this.game.speed); } onTrigger(other) { if (other.name === 'Coin') { this.game.gold += 5; other.destroy(); } } }\n`,
      'components/EnemyAI.js': `export default class EnemyAI extends GameLab.Component { constructor(speed=50) { super(); this.speed=speed; } onUpdate(delta) { if (this.game.paused) return; const target=this.game.find('Player'); if (!target) return; if (this.gameObject.hp<=0) { this.game.kills++; const coin=this.game.createObject('Coin').setPosition(this.transform.x,this.transform.y); coin.addComponent(new GameLab.Sprite('coin',14,14)); coin.addComponent(new GameLab.Trigger2D()); this.gameObject.destroy(); return; } const dx=target.transform.x-this.transform.x, dy=target.transform.y-this.transform.y, d=Math.hypot(dx,dy)||1; this.transform.x+=dx/d*this.speed*delta; this.transform.y+=dy/d*this.speed*delta; } }\n`,
      'components/Weapon.js': `export default class Weapon extends GameLab.Component { constructor() { super(); this.timer=0; } onUpdate(delta) { if (this.game.paused) return; this.timer-=delta; if (this.timer>0) return; const enemies=this.game.objects.filter(o=>['Slime','Bat','Ghost'].includes(o.name)&&!o.destroyed).sort((a,b)=>Math.hypot(a.transform.x-this.transform.x,a.transform.y-this.transform.y)-Math.hypot(b.transform.x-this.transform.x,b.transform.y-this.transform.y)); const target=enemies[0]; if (!target) return; target.hp-=this.game.damage; this.timer=this.game.cooldown; } }\n`,
    },
    checks: [check('Fala 2 obejmuje trzy typy przeciwników na trawiastej mapie.', { 'objects.0.components.0': 'TileMap', 'objects.2.name': 'Slime', 'objects.3.name': 'Bat', 'objects.4.name': 'Ghost', 'commands.1.op': 'tilemap' }, { steps: 0 }), check('Wszystkie typy wrogów mają AI, a Ghost ma 3 punkty zdrowia.', { 'objects.2.components.2': 'EnemyAI', 'objects.3.components.2': 'EnemyAI', 'objects.4.components.2': 'EnemyAI', 'objects.4.hp': 3 }), check('Gracz nadal steruje postacią klawiszami WASD.', { 'objects.1.x': 112, 'objects.1.y': 100 }, { keys: ['d'] }), check('HUD wyświetla numer drugiej fali.', { 'commands.6.text': 'Fala: 2  Zdrowie: 3' })],
  },
});

recipes.push({
  title: 'Kamera i współrzędne świata', summary: 'Przesuwaj widok i podążaj za graczem bez zmiany fizyki.',
  objectives: ['Odróżniasz pozycję w świecie od położenia na ekranie.', 'Dodajesz Camera2D, która śledzi gracza, a HUD pozostaje nieruchomy.'],
  theory: ['Camera2D jest komponentem pustego obiektu Camera. offsetX i offsetY wskazują przesunięcie widoku: punkt świata (100, 100) przy offset (80, 40) zobaczysz na ekranie w (20, 60). Obiekty, kolizje i AI nadal korzystają ze współrzędnych świata.', 'camera.follow(player) utrzymuje cel na środku aktualnego canvasu. W dużym świecie ustaw controller.collideWorldBounds = false, bo domyślna granica kontrolera to rozmiar canvasu. TextRenderer pozostaje w przestrzeni ekranu. Kamera śledzi tylko widok; shake(4, 0.2) trzęsie obrazem, nie graczem.'],
  guided: {
    title: 'Przesuń widok', prompt: 'Utwórz Player w (100, 100) ze Sprite("player"). Utwórz osobny obiekt Camera, dodaj Camera2D i ustaw offsetX = 80, offsetY = 40. Dodaj graczowi TextRenderer("HUD", 10, 24). Postać ma być widoczna w (20, 60), ale jej pozycja świata nadal wynosi (100, 100).',
    solution: scene("const player = this.createObject('Player');\nplayer.setPosition(100, 100);\nplayer.addComponent(new Sprite('player'));\nplayer.addComponent(new TextRenderer('HUD', 10, 24));\nconst cameraObject = this.createObject('Camera');\nconst camera = cameraObject.addComponent(new Camera2D());\ncamera.offsetX = 80;\ncamera.offsetY = 40;"),
    checks: [check('Camera ma komponent Camera2D i przesunięcie (80, 40).', { 'objects.1.name': 'Camera', 'objects.1.components.0': 'Camera2D', 'camera.x': 80, 'camera.y': 40 }), check('Obraz przesuwa się, ale pozycja świata i HUD nie.', { 'objects.0.x': 100, 'objects.0.y': 100, 'commands.1.screenX': 20, 'commands.1.screenY': 60, 'commands.2.text': 'HUD', 'commands.2.x': 10, 'commands.2.y': 24 })],
  },
  independent: {
    title: 'Kamera podąża za graczem', prompt: 'Player ma gotowe WASD i Sprite. Wyłącz collideWorldBounds na jego CharacterController2D. Dodaj obiekt Camera z Camera2D i wywołaj camera.follow(player). Dodaj TextRenderer("HUD", 10, 24) do gracza. Podczas ruchu i po zmianie rozmiaru planszy Player ma pozostać na środku ekranu. Jego współrzędne świata muszą nadal się zmieniać.',
    starter: scene("const player = this.createObject('Player');\nplayer.setPosition(100, 100);\nplayer.addComponent(new Sprite('player'));\nplayer.addComponent(new CharacterController2D());\nplayer.addComponent(new PlayerController());", '', importController),
    extraStarter: { 'components/PlayerController.js': movementComponent },
    solution: scene("const player = this.createObject('Player');\nplayer.setPosition(100, 100);\nplayer.addComponent(new Sprite('player'));\nconst movement = player.addComponent(new CharacterController2D());\nmovement.collideWorldBounds = false;\nplayer.addComponent(new PlayerController());\nplayer.addComponent(new TextRenderer('HUD', 10, 24));\nconst cameraObject = this.createObject('Camera');\nconst camera = cameraObject.addComponent(new Camera2D());\ncamera.follow(player);", '', importController),
    checks: [check('Na planszy 320 × 200 gracz po sekundzie ruchu jest wycentrowany.', { 'objects.0.x': 220, 'commands.1.screenX': 160, 'commands.1.screenY': 100, 'camera.x': 60, 'commands.2.text': 'HUD', 'commands.2.x': 10 }, { width: 320, height: 200, keys: ['d'], steps: 10 }), check('Kamera działa też przy zmianie rozmiaru viewportu.', { 'commands.1.screenX': 250, 'commands.1.screenY': 150 }, { width: 500, height: 300, keys: ['s'], steps: 5 }), check('Gracz może wyjść poza ekranowe granice świata.', { 'objects.0.x': 700, 'commands.1.screenX': 160 }, { width: 320, height: 200, keys: ['d'], steps: 50 })],
  },
});
recipes.push({
  title: 'Canvas ręcznie — własne rysowanie', summary: 'Zajrzyj pod komponenty: samodzielnie narysuj klatkę i wizualizację czasu.',
  objectives: ['Wiesz, kiedy wykorzystać komponent, a kiedy własne komendy rysowania.', 'Rozumiesz, że ręczny rysunek nie tworzy obiektu, kolizji ani zachowania.'],
  theory: ['Do postaci i przedmiotów używaj Sprite albo ShapeRenderer, a do napisów TextRenderer. Gdy potrzebujesz własnego wykresu, efektu lub grafiki, możesz ręcznie wywołać this.canvas.drawRect i drawText. Silnik czyści canvas przed każdą klatką, dlatego takie rysowanie musisz powtarzać.', 'Rysuj świat komponentami, a ręczny HUD w onDrawUI(). Prostokąt drawRect jest centrowany; drawText zaczyna napis w podanym punkcie. this.canvas.context udostępnia też natywne CanvasRenderingContext2D — własne zmiany stylu otaczaj save()/restore().'],
  guided: {
    title: 'Rysunek bez GameObject', prompt: 'W onUpdate narysuj prostokąt o środku (80, 90), wymiarach 40 × 30 i kolorze #76b9f2, używając this.canvas.drawRect. Następnie wyświetl napis Start w (60, 140) przez drawText. W tym zadaniu celowo nie tworzysz GameObject ani rendererów.',
    solution: scene('', "this.canvas.drawRect(80, 90, 40, 30, '#76b9f2');\nthis.canvas.drawText('Start', 60, 140);"),
    checks: [check('Ręczna klatka zawiera prostokąt i tekst, ale nie obiekty.', { 'objects.length': 0, 'commands.1.op': 'rect', 'commands.1.x': 80, 'commands.1.y': 90, 'commands.1.width': 40, 'commands.1.height': 30, 'commands.1.color': '#76b9f2', 'commands.2.text': 'Start', 'commands.2.x': 60, 'commands.2.y': 140 })],
  },
  independent: {
    title: 'Pasek upływu czasu', prompt: 'Bez tworzenia obiektów rysuj w onUpdate pasek postępu. Szerokość = Math.min(100, this.time.elapsed * 100), wysokość 12, kolor #70c994, środek x = 20 + szerokość / 2, y = 40. Lewy brzeg pozostaje w x = 20, po 0,5 s szerokość to 50, po sekundzie 100 i nie rośnie dalej.',
    solution: scene('', "const width = Math.min(100, this.time.elapsed * 100);\nthis.canvas.drawRect(20 + width / 2, 40, width, 12, '#70c994');"),
    checks: [check('Po pół sekundy pasek ma szerokość 50 i stały lewy brzeg.', { 'objects.length': 0, 'commands.1.width': 50, 'commands.1.x': 45, 'commands.1.y': 40, 'commands.1.height': 12, 'commands.1.color': '#70c994' }, { steps: 5 }), check('Po dwóch sekundach pasek kończy na szerokości 100.', { 'commands.1.width': 100, 'commands.1.x': 70 }, { steps: 20 })],
  },
});

// Initial-state checks complement the time/input scenarios. They also verify
// appearance on inactive objects, which correctly issue no draw commands.
const initialSceneChecks = {
  '701-guided': check('Player ma komponent wyglądu i tekstu.', { 'objects.0.name': 'Player', 'objects.0.components.0': 'ShapeRenderer', 'objects.0.components.1': 'TextRenderer' }),
  '701-independent': check('Dwie platformy są osobnymi obiektami z rendererami.', { 'objects.0.name': 'PlatformA', 'objects.0.components.0': 'ShapeRenderer', 'objects.1.name': 'PlatformB', 'objects.1.components.0': 'ShapeRenderer' }),
  '702-guided': check('Ruch obsługuje Mover, a wygląd ShapeRenderer.', { 'objects.0.components.0': 'ShapeRenderer', 'objects.0.components.1': 'Mover', 'objects.0.x': 180 }, { steps: 10 }),
  '702-independent': check('Drop opada jako obiekt z komponentem Mover.', { 'objects.0.name': 'Drop', 'objects.0.components.0': 'ShapeRenderer', 'objects.0.components.1': 'Mover', 'objects.0.y': 100 }, { steps: 10 }),
  '703-guided': check('Player ma ShapeRenderer i rzeczywiście jest rysowany na planszy.', { 'objects.0.renderer.kind': 'ShapeRenderer', 'commands.1.op': 'rect' }),
  '704-guided': check('Player jest renderowany nad TileMap trawy.', { 'objects.0.components.0': 'TileMap', 'commands.1.texture': 'grass', 'commands.2.texture': 'player' }),
  '704-independent': check('Moneta jest renderowana nad TileMap piasku i HUD pokazuje złoto.', { 'commands.1.texture': 'sand', 'commands.3.texture': 'coin', 'commands.4.text': 'Złoto: 0' }),
  '705-guided': check('Slime ma komponent AI podążający za graczem.', { 'objects.1.components.1': 'EnemyAI', 'commands.2.texture': 'slime' }),
  '705-independent': check('Bat zaczyna w (200, 60) i ma właściwy sprite oraz EnemyAI.', { 'objects.1.x': 200, 'objects.1.y': 60, 'objects.1.components.1': 'EnemyAI', 'commands.2.texture': 'bat' }, { steps: 0 }),
  '706-guided': check('Player ma Weapon i na arenie jest wróg slime.', { 'objects.0.components.1': 'Weapon', 'objects.1.renderer.texture': 'slime' }),
  '706-independent': check('Bat ma 2 HP, a Weapon jest gotowy do automatycznego strzału.', { 'objects.0.components.1': 'Weapon', 'objects.1.hp': 2, 'objects.1.renderer.texture': 'bat' }),
  '708-guided': check('Skrzynia jest w (160, 100) i wykrywa kontakt Trigger2D.', { 'objects.1.x': 160, 'objects.1.y': 100, 'objects.1.renderer.texture': 'chest', 'objects.1.components.1': 'Trigger2D' }),
  '708-independent': check('Są dwie oddzielne skrzynie z triggerem.', { 'objects.1.name': 'ChestA', 'objects.1.components.1': 'Trigger2D', 'objects.2.name': 'ChestB', 'objects.2.components.1': 'Trigger2D' }),
  '707-guided': check('Sprite gracza ma bazowy rozmiar 32 × 32.', { 'commands.1.op': 'sprite', 'commands.1.width': 32, 'commands.1.height': 32 }),
  '707-independent': check('Slime jest odbity, a Gem ma własną teksturę.', { 'objects.0.scaleX': -1, 'objects.1.scaleX': 1, 'objects.1.renderer.texture': 'gem', 'commands.2.texture': 'gem' }, { steps: 0 }),
  '710-guided': check('Arena ma podłoże, gracza i trzy typy renderowanych sprite’ów.', { 'objects.0.components.0': 'TileMap', 'objects.1.renderer.texture': 'player', 'objects.2.renderer.texture': 'slime', 'objects.3.renderer.texture': 'bat' }, { steps: 0 }),
  '710-independent': check('Fala druga tworzy trzy różne typy wrogów na trawie.', { 'objects.2.name': 'Slime', 'objects.3.name': 'Bat', 'objects.4.name': 'Ghost', 'objects.4.renderer.texture': 'ghost' }, { steps: 0 }),
};

export const gameLessons = recipes.map((recipe, index) => {
  const order = 701 + index;
  const tasks = ['guided', 'independent'].map(mode => {
    const exercise = recipe[mode];
    const id = `game-dev-${order}-${mode}${order <= 703 ? '-components-v2' : ''}`;
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
