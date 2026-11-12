// Powtórka teorii i próba krokowa dla ścieżki CSS GD — „na odwrót" względem
// HTML GD: tu HTML jest gotowy, a uczeń pisze reguły w styles.css.
// Wizualizacje pokazują fragment interfejsu gry z efektem docelowych reguł.
import { gameUiFontFaceCss } from './gameUiTheme.js';

const note = (title, text, visual, code, question, context, predictionCode, trial, trace, answer) => ({
  title, text, visual, code, question,
  prediction: { context, code: predictionCode }, trial, trace, answer,
});

// Kompaktowy motyw dla przykładów w notatkach — klasy z zadań CSS GD.
const noteTheme = `${gameUiFontFaceCss}
body { background: #0b0e14; color: #d8d2c4; font-family: system-ui, sans-serif; padding: 12px; }
h1 { color: #e8c76a; font-family: 'Cinzel', serif; letter-spacing: 2px; text-align: center; }
h2 { color: #e0b04a; font-family: 'Cinzel', serif; }
.tagline { color: #a49b86; text-align: center; }
.menu { text-align: center; }
.menu a, .btn { display: inline-block; margin: 4px; padding: 10px 18px; color: #e8c76a; background: #1f2534; border: 1px solid #6b5326; border-radius: 6px; text-decoration: none; }
.btn { color: #fff2cf; background: #a03a2c; }
.item { padding: 6px 10px; color: #d8d2c4; list-style: none; }
.rare { color: #8fb8ff; }
#legendary { color: #f6e3a1; font-weight: 700; }
.item[title] { border: 2px solid #8fb8ff; }
.item:hover { background: rgba(224, 176, 74, 0.15); }
.hint { color: #a49b86; font-size: 0.9rem; }
.quest { padding: 16px; border: 1px solid #6b5326; border-radius: 8px; background: #12161f; }
.reward { text-transform: uppercase; text-align: center; color: #e0b04a; font-weight: 700; }
.card { padding: 18px; margin: 10px 0; border: 2px solid #6b5326; border-radius: 8px; background: #12161f; }
.panel { position: relative; padding: 18px; border-radius: 10px; overflow: hidden; background: #12161f; }
.stat { display: inline-block; padding: 6px 10px; margin-right: 8px; background: #1f2534; border-radius: 4px; }
.badge { position: absolute; top: 12px; right: 12px; z-index: 2; padding: 4px 8px; border-radius: 4px; background: #a03a2c; color: #fff2cf; font-size: 0.75rem; }
.feed { display: none; }
.loading { text-align: center; color: #a49b86; animation: cssgd-pulse 1.5s infinite; }
@keyframes cssgd-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
`;

const themed = (code) => ({ kind: 'html', code, themeCss: noteTheme });

export const cssGdTaskLearning = {
  'css-gd-1001-guided': note(
    'Reguła to selektor + deklaracje',
    'Plik `styles.css` składa się z reguł: selektor (`body`) + klamry z deklaracjami `właściwość: wartość;`. Jedna reguła może zmienić tło i kolor całej strony naraz.',
    themed('<main><h1>Kroniki Smoka</h1><p class="tagline">Mroczna przygoda</p></main>'),
    'body {\n  background-color: #07090d;\n  color: #d8d2c4;\n}',
    'Co robi selektor `body`?',
    'Reguła trafia w element `<body>` — a tekst dziedziczy kolor.',
    'body {\n  background-color: #07090d;\n  color: #d8d2c4;\n}',
    'Przejdź krokami od reguły do podglądu.',
    { steps: [
      { caption: '`body` to selektor — wybiera całą stronę.', active: 'css', panels: { css: 'body {' } },
      { caption: '`background-color` maluje tło na ciemno.', active: 'css', panels: { css: '  background-color: #07090d;' } },
      { caption: '`color` rozświetla tekst na kość.', active: 'css', panels: { css: '  color: #d8d2c4;\n}' } },
      { caption: 'Podgląd: ciemne tło, jasny tekst — klimat gry.', active: 'dom', panels: { dom: 'KRONIKI SMOKA\n(ciemne tło)' } },
    ] },
    'body { tło + kolor } = jeden ruch, cały ekran.',
  ),
  'css-gd-1001-modified-v2': note(
    'Kolejna reguła, kolejny element',
    'Każdy element może dostać własną regułę. `h1` to selektor znacznika, `.tagline` — selektor klasy: trafia w każdy element z `class="tagline"`.',
    themed('<main><h1>Kroniki Smoka</h1><p class="tagline">Mroczna przygoda</p></main>'),
    'h1 { color: #e8c76a; }\n.tagline { color: #a49b86; }',
    'Czym różni się `.tagline` od `h1`?',
    'Kropka = klasa z HTML; bez kropki = nazwa znacznika.',
    'h1 { color: #e8c76a; }\n.tagline { color: #a49b86; }',
    'Przejdź krokami przez dwie reguły.',
    { steps: [
      { caption: '`h1` — złoto na głównym tytule.', active: 'css', panels: { css: 'h1 { color: #e8c76a; }' } },
      { caption: '`.tagline` — klasa dostaje przygaszony odcień.', active: 'css', panels: { css: '.tagline {\n  color: #a49b86;\n}' } },
      { caption: 'Podgląd: złoty tytuł, cichszy podpis.', active: 'dom', panels: { dom: 'KRONIKI SMOKA (złoto)\nMroczna przygoda (szarzy)' } },
    ] },
    'Selektor znacznika bez kropki, klasy z kropką.',
  ),
  'css-gd-1001-independent-v2': note(
    'Selektor z zagnieżdżeniem',
    '`.menu a` czytamy od prawej: „każdy `a` wewnątrz `.menu`". Odstęp między selektorami oznacza „w środku" — nie trzeba dopisywać klas do linków.',
    themed('<nav class="menu"><a href="#">Graj</a> <a href="#">Opcje</a></nav>'),
    '.menu a {\n  color: #e8c76a;\n  background-color: #1f2534;\n  padding: 10px;\n}',
    'Dlaczego `.menu a`, a nie `a`?',
    'Chcemy tylko linki menu — nie wszystkie linki strony.',
    '.menu a {\n  color: #e8c76a;\n  background-color: #1f2534;\n  padding: 10px;\n}',
    'Przejdź krokami przez selektor potomka.',
    { steps: [
      { caption: '`.menu a` — spacja znaczy „wewnątrz".', active: 'css', panels: { css: '.menu a {' } },
      { caption: 'Kolor + tło zamieniają link w przycisk.', active: 'css', panels: { css: '  color: #e8c76a;\n  background-color: #1f2534;' } },
      { caption: '`padding: 10px` daje powierzchnię kliknięcia.', active: 'css', panels: { css: '  padding: 10px;\n}' } },
      { caption: 'Podgląd: trzy przyciski zamiast linków.', active: 'dom', panels: { dom: '[ Graj ] [ Opcje ] [ Autorzy ]' } },
    ] },
    'Spacja w selektorze = „wewnątrz elementu".',
  ),
  'css-gd-1002-guided': note(
    'Klasa wybiera grupę',
    '`.item` trafia we wszystkie `class="item"` niezależnie od znacznika. Druga klasa `.rare` dopisuje odmianę — element może mieć obie klasy naraz (`class="item rare"`).',
    themed('<ul class="inventory"><li class="item">Miecz</li><li class="item rare">Łuska</li></ul>'),
    '.item { color: #d8d2c4; }\n.rare { color: #8fb8ff; }',
    'Co zrobi `class="item rare"`?',
    'Dostaje style obu klas — item i rare razem.',
    '.item { color: #d8d2c4; }\n.rare { color: #8fb8ff; }',
    'Przejdź krokami przez klasy.',
    { steps: [
      { caption: '`.item` — bazowy kolor każdego przedmiotu.', active: 'css', panels: { css: '.item { color: #d8d2c4; }' } },
      { caption: '`.rare` — niebieski blask tylko dla rzadkich.', active: 'css', panels: { css: '.rare { color: #8fb8ff; }' } },
      { caption: 'Podgląd: łuska świeci, miecz zwykły.', active: 'dom', panels: { dom: 'Miecz (jasny)\nŁuska (niebieska)' } },
    ] },
    'Klasy się nakładają: item + rare = obie reguły.',
  ),
  'css-gd-1002-modified-v2': note(
    'id jest mocniejszy niż klasa',
    '`#legendary` wybiera jeden unikalny element. Kiedy `#id` i `.class` kłócą się o tę samą właściwość, wygrywa `#id` — to zasada specyficzności.',
    themed('<ul><li class="item">Miecz</li><li class="item" id="legendary">Kosa Świtu</li></ul>'),
    '#legendary {\n  color: #f6e3a1;\n  font-weight: 700;\n}',
    'Dlaczego `#legendary` wygrywa z `.item`?',
    'id = 1 element na stronę — selektor bardziej szczegółowy.',
    '#legendary {\n  color: #f6e3a1;\n  font-weight: 700;\n}',
    'Przejdź krokami przez wygraną id.',
    { steps: [
      { caption: '`.item` nadal obowiązuje wszystkie.', active: 'css', panels: { css: '.item { color: #d8d2c4; }' } },
      { caption: '`#legendary` nadpisuje kolor i wagę.', active: 'css', panels: { css: '#legendary {\n  color: #f6e3a1;\n  font-weight: 700;\n}' } },
      { caption: 'Podgląd: Kosa jaśnieje i pogrubiała.', active: 'dom', panels: { dom: 'Miecz\nKOSA ŚWITU (złoto, bold)' } },
    ] },
    'Specyficzność: #id > .class > znacznik.',
  ),
  'css-gd-1002-independent-v2': note(
    'Atrybut i pseudoklasa',
    '`.item[title]` wybiera elementy z atrybutem `title`. `.item:hover` to pseudoklasa — reguła włącza się, gdy kursor najedzie na element.',
    themed('<ul><li class="item">Miecz</li><li class="item rare" title="Rzadki">Łuska</li></ul>'),
    '.item[title] { border: 2px solid #8fb8ff; }\n.item:hover { background-color: rgba(224,176,74,.15); }',
    'Kiedy działa `.item:hover`?',
    'Tylko podczas najechania — potem styl znika.',
    '.item[title] { border: 2px solid #8fb8ff; }\n.item:hover { background: rgba(224,176,74,.15); }',
    'Przejdź krokami przez atrybut i hover.',
    { steps: [
      { caption: '`.item[title]` — tylko z atrybutem title.', active: 'css', panels: { css: '.item[title] {\n  border: 2px solid #8fb8ff;\n}' } },
      { caption: '`.item:hover` — styl czasowy na kursor.', active: 'css', panels: { css: '.item:hover {\n  background: rgba(224,176,74,.15);\n}' } },
      { caption: 'Podgląd: rzadki ma ramkę; hover podświetla.', active: 'dom', panels: { dom: 'Miecz\nŁuska [ramka]\n(hover → złote tło)' } },
    ] },
    '[atrybut] filtruje elementy, :hover reaguje na kursor.',
  ),
  'css-gd-1003-guided': note(
    'Rozmiar i rozstrzelenie',
    '`font-size` steruje wielkością liter, `letter-spacing` odstępem między znakami, `line-height` wysokością linii tekstu. Wartości w px są przewidywalne i czytelne.',
    themed('<main><h1>Dziennik questów</h1><p class="desc">Trop wiedzie przez bagna.</p></main>'),
    'h1 {\n  font-size: 40px;\n  letter-spacing: 2px;\n}\n.desc { line-height: 24px; }',
    'Co robi `letter-spacing`?',
    'Rozsuwa znaki — tytuł wygląda epicko.',
    'h1 {\n  font-size: 40px;\n  letter-spacing: 2px;\n}\n.desc { line-height: 24px; }',
    'Przejdź krokami przez typografię.',
    { steps: [
      { caption: '`font-size: 40px` — tytuł rośnie.', active: 'css', panels: { css: 'h1 {\n  font-size: 40px;' } },
      { caption: '`letter-spacing: 2px` — znaki się rozjeżdżają.', active: 'css', panels: { css: '  letter-spacing: 2px;\n}' } },
      { caption: '`line-height: 24px` — luźniejsze wiersze.', active: 'css', panels: { css: '.desc {\n  line-height: 24px;\n}' } },
      { caption: 'Podgląd: epicki tytuł, luźny opis.', active: 'dom', panels: { dom: 'D Z I E N N I K\nTrop wiedzie…\n(luźne wiersze)' } },
    ] },
    'font-size = wielkość, letter-spacing = rozstrzel, line-height = luźno.',
  ),
  'css-gd-1003-modified-v2': note(
    'Transformacja i font',
    '`text-transform: uppercase` zamienia litery na wielkie bez zmiany HTML-u. `font-family` podmienia krój — gotowy font gry `\'Cinzel\'` jest już w projekcie.',
    themed('<section class="quest"><h2>Bestia z moczarów</h2><p class="reward">Nagroda: 250 złota</p></section>'),
    'h2 { font-family: \'Cinzel\', serif; }\n.reward {\n  text-transform: uppercase;\n  text-align: center;\n}',
    'Czy `uppercase` zmienia tekst w HTML?',
    'Nie — zmienia tylko wygląd; źródło zostaje.',
    'h2 { font-family: \'Cinzel\', serif; }\n.reward {\n  text-transform: uppercase;\n  text-align: center;\n}',
    'Przejdź krokami przez odznakę.',
    { steps: [
      { caption: '`font-family` — nagłówek w klimacie gry.', active: 'css', panels: { css: 'h2 {\n  font-family: \'Cinzel\', serif;\n}' } },
      { caption: '`uppercase` — nagroda jak odznaka.', active: 'css', panels: { css: '.reward {\n  text-transform: uppercase;' } },
      { caption: '`text-align: center` — wyśrodkowanie.', active: 'css', panels: { css: '  text-align: center;\n}' } },
      { caption: 'Podgląd: NAGRODA w kapitalikach.', active: 'dom', panels: { dom: 'Bestia z moczarów\nNAGRODA: 250 ZŁOTA' } },
    ] },
    'uppercase = tylko wygląd; font-family = krój pisma.',
  ),
  'css-gd-1003-independent-v2': note(
    'Zmienne CSS nazywają decyzje',
    '`:root` trzyma zmienne dla całej strony: `--gold: #e0b04a`. Reguły używają jej przez `var(--gold)` — zmiana w jednym miejscu przefarbuje wszystko.',
    themed('<section class="quest"><h2>Bestia</h2><p class="reward">Nagroda: 250 złota</p></section>'),
    ':root { --gold: #e0b04a; }\n.reward { color: var(--gold); }\nh2 { color: var(--gold); }',
    'Po co `var(--gold)` zamiast `#e0b04a`?',
    'Zmienna nazywa decyzję — edytujesz ją raz.',
    ':root { --gold: #e0b04a; }\n.reward { color: var(--gold); }\nh2 { color: var(--gold); }',
    'Przejdź krokami przez zmienną.',
    { steps: [
      { caption: '`:root` — paleta dla całej strony.', active: 'css', panels: { css: ':root {\n  --gold: #e0b04a;\n}' } },
      { caption: '`var(--gold)` wstawia wartość zmiennej.', active: 'css', panels: { css: '.reward {\n  color: var(--gold);\n}' } },
      { caption: 'Ta sama zmienna w `h2` — jeden kolor.', active: 'css', panels: { css: 'h2 {\n  color: var(--gold);\n}' } },
      { caption: 'Podgląd: nagłówek i nagroda w tym samym złocie.', active: 'dom', panels: { dom: 'Bestia (złoto)\nNAGRODA (złoto)' } },
    ] },
    ':root deklaruje --nazwa, var(--nazwa) jej używa.',
  ),
  'css-gd-1004-guided': note(
    'Pudełko: padding i border-box',
    'Każdy element to pudełko: treść + `padding` w środku. `box-sizing: border-box` sprawia, że `width` obejmuje też padding i ramę — wymiary przestają zaskakiwać.',
    themed('<section class="cards"><article class="card"><h2>Odpoczynek</h2><p>10 złota</p></article></section>'),
    '* { box-sizing: border-box; }\n.card {\n  padding: 18px;\n  background-color: #12161f;\n}',
    'Co wybiera selektor `*`?',
    'Wszystkie elementy — reguła globalna.',
    '* { box-sizing: border-box; }\n.card {\n  padding: 18px;\n  background-color: #12161f;\n}',
    'Przejdź krokami przez pudełko.',
    { steps: [
      { caption: '`*` — border-box dla wszystkiego.', active: 'css', panels: { css: '* {\n  box-sizing: border-box;\n}' } },
      { caption: '`padding: 18px` — oddech wewnątrz karty.', active: 'css', panels: { css: '.card {\n  padding: 18px;' } },
      { caption: '`background-color` — karta odcina się od tła.', active: 'css', panels: { css: '  background-color: #12161f;\n}' } },
      { caption: 'Podgląd: panel z oddechem.', active: 'dom', panels: { dom: '┌──────────┐\n│ Odpoczynek │\n│ 10 złota   │\n└──────────┘' } },
    ] },
    'padding = oddech w środku; border-box = uczciwe wymiary.',
  ),
  'css-gd-1004-modified-v2': note(
    'Rama i szerokość',
    '`border: 2px solid #6b5326` to skrót: grubość + styl + kolor. Przy `border-box` padding i rama mieszczą się w `width` — karta trzyma 200px.',
    themed('<section class="cards"><article class="card"><h2>Odpoczynek</h2><p>10 złota</p></article></section>'),
    '.card {\n  border: 2px solid #6b5326;\n  width: 200px;\n}',
    'Co zawiera `width: 200px` przy border-box?',
    'Treść + padding + ramę — całe pudełko.',
    '.card {\n  border: 2px solid #6b5326;\n  width: 200px;\n}',
    'Przejdź krokami przez ramę.',
    { steps: [
      { caption: '`border` — trzy wartości w jednej deklaracji.', active: 'css', panels: { css: '.card {\n  border: 2px solid #6b5326;' } },
      { caption: '`width: 200px` — stała szerokość karty.', active: 'css', panels: { css: '  width: 200px;\n}' } },
      { caption: 'Podgląd: oprawiona karta 200px.', active: 'dom', panels: { dom: '┏━━━━━━━━━━┓\n┃ Odpoczynek ┃\n┃ 10 złota   ┃\n┗━━━━━━━━━━┛' } },
    ] },
    'border = grubość styl kolor; border-box trzyma width.',
  ),
  'css-gd-1004-independent-v2': note(
    'margin — oddech na zewnątrz',
    '`padding` oddycha w środku pudełka, `margin` na zewnątrz — odsuwa sąsiadów. `height` ustala wysokość; `.cards` jako rodzic dostaje własny `margin-top`.',
    themed('<section class="cards"><article class="card"><h2>Odpoczynek</h2><p>10 złota</p></article><article class="card"><h2>Posiłek</h2><p>4 złota</p></article></section>'),
    '.card { margin: 16px; height: 140px; }\n.cards { margin-top: 24px; }',
    'margin czy padding?',
    'margin = odstęp na zewnątrz, padding = wewnątrz.',
    '.card { margin: 16px; height: 140px; }\n.cards { margin-top: 24px; }',
    'Przejdź krokami przez odstępy.',
    { steps: [
      { caption: '`margin: 16px` — karty się rozstępują.', active: 'css', panels: { css: '.card {\n  margin: 16px;' } },
      { caption: '`height: 140px` — wspólna wysokość.', active: 'css', panels: { css: '  height: 140px;\n}' } },
      { caption: '`.cards` — odstęp całego rzędu od nagłówka.', active: 'css', panels: { css: '.cards {\n  margin-top: 24px;\n}' } },
      { caption: 'Podgląd: rytm między kartami.', active: 'dom', panels: { dom: '[ Odpoczynek ]\n\n[ Posiłek ]' } },
    ] },
    'margin na zewnątrz, padding wewnątrz — to cały pudełkowy rytm.',
  ),
  'css-gd-1005-guided': note(
    'display i punkt odniesienia',
    '`span` jest domyślnie liniowy — `display: inline-block` daje mu wymiary bloku w linii. `position: relative` na `.panel` czyni go kotwicą dla dzieci z `absolute`.',
    themed('<section class="panel"><h2>Statystyki</h2><span class="stat">HP 120</span> <span class="stat">MP 80</span></section>'),
    '.stat { display: inline-block; }\n.panel { position: relative; }',
    'Po co `position: relative` na panelu?',
    'Żeby `absolute` dziecka liczył się od panelu.',
    '.stat { display: inline-block; }\n.panel { position: relative; }',
    'Przejdź krokami przez display i pozycję.',
    { steps: [
      { caption: '`.stat` — inline-block: blok w linii.', active: 'css', panels: { css: '.stat {\n  display: inline-block;\n}' } },
      { caption: '`.panel` — relative: sama się nie rusza.', active: 'css', panels: { css: '.panel {\n  position: relative;\n}' } },
      { caption: 'Podgląd: staty w rzędzie, panel jako kotwica.', active: 'dom', panels: { dom: '[ HP 120 ] [ MP 80 ]' } },
    ] },
    'inline-block = wymiary w linii; relative = kotwica dla dzieci.',
  ),
  'css-gd-1005-modified-v2': note(
    'absolute w rogu panelu',
    '`position: absolute` wyrywa element z układu i przykleja do najbliższego przodka z `relative`. `top`/`right` mierzą od krawędzi panelu, `z-index` układa warstwy.',
    themed('<section class="panel"><h2>Statystyki</h2><span class="stat">HP 120</span><span class="badge">NOWY</span></section>'),
    '.badge {\n  position: absolute;\n  top: 12px;\n  right: 12px;\n  z-index: 2;\n}',
    'Od czego mierzy `top: 12px`?',
    'Od górnej krawędzi `.panel` — on ma `relative`.',
    '.badge {\n  position: absolute;\n  top: 12px;\n  right: 12px;\n  z-index: 2;\n}',
    'Przejdź krokami przez przypięcie.',
    { steps: [
      { caption: '`absolute` — plakietka wyskakuje z rzędu.', active: 'css', panels: { css: '.badge {\n  position: absolute;' } },
      { caption: '`top` + `right` — do rogu panelu.', active: 'css', panels: { css: '  top: 12px;\n  right: 12px;' } },
      { caption: '`z-index: 2` — ponad treścią panelu.', active: 'css', panels: { css: '  z-index: 2;\n}' } },
      { caption: 'Podgląd: NOWY w prawym górnym rogu.', active: 'dom', panels: { dom: '┌──────────[NOWY]┐\n│ Statystyki     │\n│ HP 120  MP 80  │\n└────────────────┘' } },
    ] },
    'absolute + top/right + relative rodzic = przypięty róg.',
  ),
  'css-gd-1005-independent-v2': note(
    'overflow i display: none',
    '`overflow: hidden` obcina to, co wystaje poza zaokrąglony róg. `display: none` chowa element całkowicie — znika z układu, ale zostaje w HTML.',
    themed('<section class="panel"><h2>Statystyki</h2><span class="badge">NOWY</span></section>'),
    '.panel {\n  overflow: hidden;\n  border-radius: 10px;\n}\n.feed { display: none; }',
    'Czym różni się `display: none` od `visibility`?',
    'none usuwa z układu — nie zostawia dziury.',
    '.panel {\n  overflow: hidden;\n  border-radius: 10px;\n}\n.feed { display: none; }',
    'Przejdź krokami przez wykończenie.',
    { steps: [
      { caption: '`border-radius` — zaokrąglony panel.', active: 'css', panels: { css: '.panel {\n  border-radius: 10px;' } },
      { caption: '`overflow: hidden` — nic nie wystaje.', active: 'css', panels: { css: '  overflow: hidden;\n}' } },
      { caption: '`.feed` — display none: znika z widoku.', active: 'css', panels: { css: '.feed {\n  display: none;\n}' } },
      { caption: 'Podgląd: gładki panel, feed schowany.', active: 'dom', panels: { dom: '╭──────────╮\n│ Statystyki    │\n╰──────────╯' } },
    ] },
    'overflow hidden przycina, display none usuwa z układu.',
  ),
  'css-gd-1006-guided': note(
    'transition wygładza zmianę',
    '`transition-property` mówi, co ma płynąć, `transition-duration` jak długo, `timing-function` w jakim tempie. Bez transition hover skacze; z nim — płynie.',
    themed('<nav class="menu"><a class="btn" href="#">Graj</a></nav>'),
    '.btn {\n  transition-property: transform;\n  transition-duration: 0.25s;\n  transition-timing-function: ease-in-out;\n}',
    'Co robi `ease-in-out`?',
    'Wolny start, szybki środek, wolny koniec.',
    '.btn {\n  transition-property: transform;\n  transition-duration: 0.25s;\n  transition-timing-function: ease-in-out;\n}',
    'Przejdź krokami przez przejście.',
    { steps: [
      { caption: '`transition-property` — animujemy transform.', active: 'css', panels: { css: '.btn {\n  transition-property: transform;' } },
      { caption: '`0.25s` — trwa ćwierć sekundy.', active: 'css', panels: { css: '  transition-duration: 0.25s;' } },
      { caption: '`ease-in-out` — miękki rytm.', active: 'css', panels: { css: '  transition-timing-function:\n    ease-in-out;\n}' } },
      { caption: 'Gotowe: hover teraz płynie zamiast skakać.', active: 'dom', panels: { dom: '[ Graj ]\n(hover → unosi się)' } },
    ] },
    'transition = co + jak długo + jakim rytmem.',
  ),
  'css-gd-1006-modified-v2': note(
    '@keyframes opisuje sekwencję',
    '`@keyframes` nazywa choreografię: od czego (`from`), przez co (`50%`), do czego (`to`). Reguła `.loading` tylko ją odpala przez `animation-name` i `duration`.',
    themed('<p class="loading">Ładowanie świata…</p>'),
    '@keyframes pulse {\n  from { opacity: 1; }\n  50% { opacity: 0.4; }\n  to { opacity: 1; }\n}\n.loading {\n  animation-name: pulse;\n  animation-duration: 1.5s;\n}',
    'Co wybiera `animation-name: pulse`?',
    'Blok @keyframes o nazwie pulse.',
    '@keyframes pulse {\n  from { opacity: 1; }\n  50% { opacity: 0.4; }\n  to { opacity: 1; }\n}\n.loading {\n  animation-name: pulse;\n  animation-duration: 1.5s;\n}',
    'Przejdź krokami przez puls.',
    { steps: [
      { caption: '`@keyframes pulse` — nazwana sekwencja.', active: 'css', panels: { css: '@keyframes pulse {' } },
      { caption: '`from/50%/to` — klatki krycia.', active: 'css', panels: { css: '  from { opacity: 1; }\n  50% { opacity: 0.4; }\n  to { opacity: 1; }\n}' } },
      { caption: '`.loading` odpala animację na 1.5 s.', active: 'css', panels: { css: '.loading {\n  animation-name: pulse;\n  animation-duration: 1.5s;\n}' } },
      { caption: 'Podgląd: napis pulsuje w kółko.', active: 'dom', panels: { dom: 'Ładowanie świata…\n(oddycha)' } },
    ] },
    '@keyframes = choreografia; animation-* = odtwarzacz.',
  ),
  'css-gd-1006-independent-v2': note(
    'hover i szacunek do ruchu',
    '`.btn:hover` przypina styl do najechania — z transition unosi się płynnie. `@media (prefers-reduced-motion: reduce)` honoruje prośbę systemu o mniej ruchu.',
    themed('<nav class="menu"><a class="btn" href="#">Graj</a></nav>'),
    '.btn:hover { transform: translateY(-2px); }\n@media (prefers-reduced-motion: reduce) {\n  .btn { transition: none; }\n  .loading { animation: none; }\n}',
    'Co włącza regułę `.btn:hover`?',
    'Kursor nad przyciskiem — styl znika po zjechaniu.',
    '.btn:hover { transform: translateY(-2px); }\n@media (prefers-reduced-motion: reduce) {\n  .btn { transition: none; }\n  .loading { animation: none; }\n}',
    'Przejdź krokami przez ostatni polish.',
    { steps: [
      { caption: '`.btn:hover` — uniesienie o 2px.', active: 'css', panels: { css: '.btn:hover {\n  transform: translateY(-2px);\n}' } },
      { caption: '`@media reduce` — użytkownik prosi o ciszej.', active: 'css', panels: { css: '@media (prefers-reduced-motion:\n    reduce) {' } },
      { caption: 'W środku: transition i animation na none.', active: 'css', panels: { css: '  .btn { transition: none; }\n  .loading { animation: none; }\n}' } },
      { caption: 'Menu: ładne i dostępne — gotowe.', active: 'dom', panels: { dom: '[ Graj ] [ Opcje ] [ Autorzy ]\n(hover unosi; bez animacji dla reduce)' } },
    ] },
    ':hover = styl na kursor; reduced-motion = szacunek.',
  ),
};

// Szybkie pytania — jedna poprawna opcja, `why` tłumaczy każdą.
const quizzes = {
  'css-gd-1001-guided': [
    { label: 'wybiera element `<body>` — całą stronę', correct: true, why: 'Reguła `body` trafia w body; dzieci dziedziczą kolor tekstu.' },
    { label: 'tworzy nowy element body', correct: false, why: 'Selektor nie tworzy elementów — wybiera istniejące z HTML.' },
    { label: 'to nazwa klasy', correct: false, why: 'Klasa miałaby kropkę: `.body`. Bez kropki to znacznik.' },
  ],
  'css-gd-1001-modified-v2': [
    { label: 'kropka = klasa, bez kropki = znacznik', correct: true, why: '`.tagline` szuka `class="tagline"`; `h1` — znaczników h1.' },
    { label: 'kropka = znacznik', correct: false, why: 'Odwrotnie — znacznik piszemy bez kropki.' },
    { label: 'to synonimy', correct: false, why: 'Różne selektory — jeden po klasie, drugi po znaczniku.' },
  ],
  'css-gd-1001-independent-v2': [
    { label: 'linki tylko wewnątrz `.menu`', correct: true, why: 'Spacja ogranicza zasięg do potomków .menu.' },
    { label: 'wszystkie linki strony', correct: false, why: 'To dałoby `a` — .menu zawęża do menu.' },
    { label: 'elementy z klasą menu a', correct: false, why: 'Spacja to „wewnątrz", nie część nazwy klasy.' },
  ],
  'css-gd-1002-guided': [
    { label: 'dostaje style `.item` i `.rare` razem', correct: true, why: 'Obie klasy nakładają swoje reguły na element.' },
    { label: 'działa tylko `.item`', correct: false, why: 'Obie klasy działają — łuska jest i item, i rare.' },
    { label: 'działa tylko `.rare`', correct: false, why: 'Item też działa — klasy się nie wykluczają.' },
  ],
  'css-gd-1002-modified-v2': [
    { label: 'id jest bardziej szczegółowy — wygrywa', correct: true, why: 'Specyficzność: `#id` bije `.klasę` i znacznik.' },
    { label: 'wygrywa `.item`, bo pierwszy', correct: false, why: 'Kolejność nie ratuje — id ma wyższą specyficzność.' },
    { label: 'style się mieszają na pół', correct: false, why: 'Ta sama właściwość — wygrywa jedna wartość: ta z #id.' },
  ],
  'css-gd-1002-independent-v2': [
    { label: 'tylko gdy kursor jest nad elementem', correct: true, why: ':hover to pseudoklasa stanu najechania.' },
    { label: 'zawsze', correct: false, why: 'Wtedy nie potrzeba :hover — to byłby zwykły styl.' },
    { label: 'po kliknięciu', correct: false, why: 'Klik to inny stan — :active; hover to samo najechanie.' },
  ],
  'css-gd-1003-guided': [
    { label: 'rozstawia znaki — epicki tytuł', correct: true, why: 'letter-spacing dodaje przestrzeń między literami.' },
    { label: 'powiększa font', correct: false, why: 'Za rozmiar odpowiada font-size, nie letter-spacing.' },
    { label: 'zmienia krój', correct: false, why: 'Krój to font-family — spacing to tylko odstęp.' },
  ],
  'css-gd-1003-modified-v2': [
    { label: 'nie — zmienia tylko wygląd', correct: true, why: 'HTML zostaje; uppercase to deklaracja prezentacji.' },
    { label: 'tak, przepisuje tekst', correct: false, why: 'Źródło się nie zmienia — to styl, nie edycja.' },
    { label: 'tylko w tytułach', correct: false, why: 'Działa na każdym tekście — nie tylko nagłówki.' },
  ],
  'css-gd-1003-independent-v2': [
    { label: 'zmiana w jednym miejscu przefarbuje wszystko', correct: true, why: 'Edytujesz --gold w :root — wszystkie var() się podążą.' },
    { label: 'bo jest krótsza do pisania', correct: false, why: 'Nie o skrót chodzi — o jedno źródło decyzji.' },
    { label: 'bo działa szybciej', correct: false, why: 'To o czytelność i utrzymanie, nie o wydajność.' },
  ],
  'css-gd-1004-guided': [
    { label: 'wszystkie elementy', correct: true, why: '`*` to selektor uniwersalny — dotyka każdego pudełka.' },
    { label: 'elementy z klasą `*`', correct: false, why: 'Kropka byłaby klasą — `*` sam w sobie jest selektorem.' },
    { label: 'tylko elementy blokowe', correct: false, why: 'Gwiazdka nie filtruje — obejmuje także liniowe.' },
  ],
  'css-gd-1004-modified-v2': [
    { label: 'treść + padding + ramę', correct: true, why: 'border-box liczy width wraz z wnętrzem pudełka.' },
    { label: 'tylko treść', correct: false, why: 'To content-box — przy border-box dochodzi padding i rama.' },
    { label: 'treść + margin', correct: false, why: 'Margin zawsze jest poza width — nie wchodzi w pudełko.' },
  ],
  'css-gd-1004-independent-v2': [
    { label: 'margin na zewnątrz, padding wewnątrz', correct: true, why: 'Padding powiększa pudełko, margin odsuwa sąsiadów.' },
    { label: 'margin wewnątrz, padding na zewnątrz', correct: false, why: 'Odwrotnie — margin to przestrzeń poza ramką.' },
    { label: 'to synonimy', correct: false, why: 'Inne strony ramki: jeden przed, drugi za border.' },
  ],
  'css-gd-1005-guided': [
    { label: 'absolute dzieci liczyło się od panelu', correct: true, why: 'Najbliższy przodek z pozycją ≠ static staje się kotwicą.' },
    { label: 'żeby panel się przesunął', correct: false, why: 'Bez top/left relative nie przesuwa — ustala odniesienie.' },
    { label: 'żeby panel zniknął', correct: false, why: 'Znikanie to display:none — relative nie ukrywa.' },
  ],
  'css-gd-1005-modified-v2': [
    { label: 'od krawędzi `.panel` — ma `relative`', correct: true, why: 'Absolute szuka najbliższego przodka z pozycją.' },
    { label: 'od góry okna', correct: false, why: 'To by było bez relative w rodzicu — panel ją przejął.' },
    { label: 'od treści `h2`', correct: false, why: 'h2 nie ma pozycji — kotwica to .panel.' },
  ],
  'css-gd-1005-independent-v2': [
    { label: 'usuwa z układu — nie zostawia dziury', correct: true, why: 'display:none znika całkiem; visibility zostawia miejsce.' },
    { label: 'zostawia puste miejsce', correct: false, why: 'To visibility:hidden — none zwija przestrzeń.' },
    { label: 'przesuwa za ekran', correct: false, why: 'To trick offscreen — none nie renderuje wcale.' },
  ],
  'css-gd-1006-guided': [
    { label: 'miękki start i koniec, szybki środek', correct: true, why: 'ease-in-out przyspiesza w środku, hamuje na krańcach.' },
    { label: 'stałe tempo', correct: false, why: 'Stałe tempo to linear — ease ma przyspieszenie.' },
    { label: 'skok od razu', correct: false, why: 'Skok to brak transition albo step — ease płynie.' },
  ],
  'css-gd-1006-modified-v2': [
    { label: 'blok `@keyframes` o nazwie pulse', correct: true, why: 'animation-name łączy regułę z nazwaną sekwencją.' },
    { label: 'klasę `.pulse`', correct: false, why: 'Nazwa odnosi się do @keyframes, nie do klasy.' },
    { label: 'plik pulse.css', correct: false, why: 'To nie plik — to identyfikator sekwencji w arkuszu.' },
  ],
  'css-gd-1006-independent-v2': [
    { label: 'kursor nad przyciskiem — styl czasowy', correct: true, why: ':hover włącza się pod kursorem i znika po zjechaniu.' },
    { label: 'po kliknięciu na stałe', correct: false, why: 'Klik to :active — hover trwa tylko pod kursorem.' },
    { label: 'na urządzeniach dotykowych zawsze', correct: false, why: 'Dotyk nie ma hover w tym sensie — to stan kursora.' },
  ],
};
for (const [id, options] of Object.entries(quizzes)) {
  const entry = cssGdTaskLearning[id];
  if (entry?.prediction) entry.prediction.options = options;
}
