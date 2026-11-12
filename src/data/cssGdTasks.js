// Dane zadań ścieżki CSS GD — te same umiejętności co w ścieżce CSS,
// ale na odwrót: uczeń dostaje gotowy, semantyczny HTML interfejsu gry
// „Kroniki Smoka" i sam dopisuje arkusz w styles.css, aż strona wygląda
// jak ciemny panel z menu gry AAA. Komentarz /* TODO: ... */ zaznacza
// miejsce na własne reguły. checks: [type, label, fields].
import { gameUiFontFaceCss } from './gameUiTheme.js';

// Arkusz zaczyna się od gotowych fontów gry — komentarz TODO pokazuje,
// gdzie dopisać własne reguły. Rozwiązania dopisują reguły za znacznikiem.
const css = (rules) => `${gameUiFontFaceCss}\n${rules}`;
const todo = (text) => `${gameUiFontFaceCss}\n/* TODO: ${text} */\n`;

export const cssGdTasks = {
  1: {
    guided: {
      goal: 'Ekran tytułowy jest goły — HTML jest gotowy, a Ty piszesz pierwsze reguły CSS. W `styles.css` za komentarzem `TODO` dodaj regułę `body` z ciemnym tłem `background-color: #07090d;` i jasnym tekstem `color: #d8d2c4;`.',
      steps: [
        'Pracujesz w `styles.css` — `index.html` jest gotowy, nie trzeba go zmieniać.',
        'Za komentarzem `/* TODO: ... */` zacznij regułę selektorem `body`, potem otwórz klamrę `{`.',
        'W środku wpisz dwie deklaracje: `background-color: #07090d;` oraz `color: #d8d2c4;` i zamknij klamrę `}`.',
        'Kliknij ▶ Play — tło strony stanie się ciemne, a tekst kością.',
      ],
      html: '<main>\n  <h1>Kroniki Smoka</h1>\n  <p class="tagline">Mroczna przygoda prosto w przeglądarce</p>\n  <nav class="menu">\n    <a href="#gra">Graj</a>\n    <a href="#opcje">Opcje</a>\n    <a href="#autorzy">Autorzy</a>\n  </nav>\n</main>',
      cssStarter: todo('dodaj regułę body z background-color i color'),
      cssSolution: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}'),
      checks: [
        ['elementExists', 'Zachowaj gotowy HTML: `<main>` z nawigacją `.menu` i trzema linkami.', { selector: 'main > nav.menu > a:nth-child(3)' }],
        ['computedStyle', 'W `styles.css` ustaw `body` tło `background-color` na `#07090d` (obliczone `rgb(7, 9, 13)`).', { selector: 'body', property: 'background-color', expected: 'rgb(7, 9, 13)' }],
        ['computedStyle', 'W tej samej regule ustaw `color` na `#d8d2c4` (obliczone `rgb(216, 210, 196)`).', { selector: 'body', property: 'color', expected: 'rgb(216, 210, 196)' }],
      ],
    },
    modified: {
      title: 'Tytuł w złocie',
      goal: 'Strona jest już ciemna. Pod regułą `body` dodaj `h1` z kolorem złota `#e8c76a` oraz `.tagline` z przygaszonym kolorem `#a49b86`.',
      html: '<main>\n  <h1>Kroniki Smoka</h1>\n  <p class="tagline">Mroczna przygoda prosto w przeglądarce</p>\n  <nav class="menu">\n    <a href="#gra">Graj</a>\n    <a href="#opcje">Opcje</a>\n    <a href="#autorzy">Autorzy</a>\n  </nav>\n</main>',
      cssStarter: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n/* TODO: dodaj reguły h1 i .tagline */'),
      cssSolution: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  color: #e8c76a;\n}\n\n.tagline {\n  color: #a49b86;\n}'),
      checks: [
        ['elementExists', 'Zachowaj HTML: `.tagline` i `.menu` z trzema linkami.', { selector: 'main > p.tagline' }],
        ['computedStyle', 'Dodaj regułę `h1` z `color` na `#e8c76a` (obliczone `rgb(232, 199, 106)`).', { selector: 'h1', property: 'color', expected: 'rgb(232, 199, 106)' }],
        ['computedStyle', 'Dodaj regułę `.tagline` z `color` na `#a49b86` (obliczone `rgb(164, 155, 134)`).', { selector: '.tagline', property: 'color', expected: 'rgb(164, 155, 134)' }],
      ],
    },
    independent: {
      title: 'Pozycje menu',
      goal: 'Pozycje menu wciąż wyglądają jak zwykłe linki. Dodaj regułę `.menu a` z kolorem złota `#e8c76a` i ciemnym tłem przycisku `background-color: #1f2534` oraz dopełnieniem `padding: 10px`.',
      html: '<main>\n  <h1>Kroniki Smoka</h1>\n  <p class="tagline">Mroczna przygoda prosto w przeglądarce</p>\n  <nav class="menu">\n    <a href="#gra">Graj</a>\n    <a href="#opcje">Opcje</a>\n    <a href="#autorzy">Autorzy</a>\n  </nav>\n</main>',
      cssStarter: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  color: #e8c76a;\n}\n\n.tagline {\n  color: #a49b86;\n}\n\n/* TODO: dodaj regułę .menu a */'),
      cssSolution: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  color: #e8c76a;\n}\n\n.tagline {\n  color: #a49b86;\n}\n\n.menu a {\n  color: #e8c76a;\n  background-color: #1f2534;\n  padding: 10px;\n  text-decoration-line: none;\n}'),
      checks: [
        ['elementExists', 'Zachowaj HTML: trzy linki wewnątrz `.menu`.', { selector: 'nav.menu > a:nth-child(3)' }],
        ['computedStyle', 'W regule `.menu a` ustaw `color` na `#e8c76a` (obliczone `rgb(232, 199, 106)`).', { selector: '.menu a', property: 'color', expected: 'rgb(232, 199, 106)' }],
        ['computedStyle', 'W `.menu a` ustaw `background-color` na `#1f2534` (obliczone `rgb(31, 37, 52)`).', { selector: '.menu a', property: 'background-color', expected: 'rgb(31, 37, 52)' }],
        ['computedStyle', 'W `.menu a` ustaw `padding` na `10px` (sprawdzamy `padding-top`).', { selector: '.menu a', property: 'padding-top', expected: '10px' }],
      ],
    },
  },
  2: {
    guided: {
      goal: 'Ekwipunek czeka na style. Za `TODO` dodaj regułę `.item` z kolorem `#d8d2c4`, a pod nią `.rare` z niebieskim blaskiem `#8fb8ff` — klasa wybiera elementy niezależnie od znacznika.',
      steps: [
        'HTML jest gotowy: lista `.inventory` ma trzy `li.item`, z czego jeden ma dodatkowo klasę `rare`.',
        'Za `TODO` napisz `.item { color: #d8d2c4; }` — kropka to selektor klasy.',
        'Pod spodem dopisz `.rare { color: #8fb8ff; }` — trafia tylko w elementy z klasą `rare`.',
        '▶ Play: wszystkie przedmioty są jasne, a „Smocza łuska" świeci na niebiesko.',
      ],
      html: '<main>\n  <h1>Ekwipunek</h1>\n  <ul class="inventory">\n    <li class="item">Miecz krótki</li>\n    <li class="item rare" title="Rzadki przedmiot">Smocza łuska</li>\n    <li class="item" id="legendary">Kosa Świtu</li>\n  </ul>\n  <p class="hint">Kliknij przedmiot, by zobaczyć opis.</p>\n</main>',
      cssStarter: todo('dodaj reguły .item i .rare'),
      cssSolution: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.item {\n  color: #d8d2c4;\n}\n\n.rare {\n  color: #8fb8ff;\n}'),
      checks: [
        ['elementExists', 'Zachowaj HTML: `.inventory` z trzema `.item`.', { selector: 'ul.inventory > li.item:nth-child(3)' }],
        ['computedStyle', 'Dodaj regułę `.item` z `color` na `#d8d2c4` (obliczone `rgb(216, 210, 196)`).', { selector: '.item', property: 'color', expected: 'rgb(216, 210, 196)' }],
        ['computedStyle', 'Dodaj regułę `.rare` z `color` na `#8fb8ff` (obliczone `rgb(143, 184, 255)`).', { selector: '.rare', property: 'color', expected: 'rgb(143, 184, 255)' }],
      ],
    },
    modified: {
      title: 'Identyfikator bije klasę',
      goal: 'Przedmiot `id="legendary"` ma świecić mocniej niż reszta. Dodaj regułę `#legendary` z kolorem `#f6e3a1` i `font-weight: 700` — selektor id jest mocniejszy niż `.item`.',
      html: '<main>\n  <h1>Ekwipunek</h1>\n  <ul class="inventory">\n    <li class="item">Miecz krótki</li>\n    <li class="item rare" title="Rzadki przedmiot">Smocza łuska</li>\n    <li class="item" id="legendary">Kosa Świtu</li>\n  </ul>\n  <p class="hint">Kliknij przedmiot, by zobaczyć opis.</p>\n</main>',
      cssStarter: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.item {\n  color: #d8d2c4;\n}\n\n.rare {\n  color: #8fb8ff;\n}\n\n/* TODO: dodaj regułę #legendary */'),
      cssSolution: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.item {\n  color: #d8d2c4;\n}\n\n.rare {\n  color: #8fb8ff;\n}\n\n#legendary {\n  color: #f6e3a1;\n  font-weight: 700;\n}'),
      checks: [
        ['elementExists', 'Zachowaj HTML: element `id="legendary"` w `.inventory`.', { selector: 'ul.inventory > li#legendary' }],
        ['computedStyle', 'Dodaj regułę `#legendary` z `color` na `#f6e3a1` (obliczone `rgb(246, 227, 161)`).', { selector: '#legendary', property: 'color', expected: 'rgb(246, 227, 161)' }],
        ['computedStyle', 'W `#legendary` ustaw `font-weight` na `700`.', { selector: '#legendary', property: 'font-weight', expected: '700' }],
      ],
    },
    independent: {
      title: 'Atrybut i najechanie',
      goal: 'Dorzuć dwie sztuczki: regułę `.item[title]` z ramką `border: 2px solid #8fb8ff` (selektor atrybutu) oraz `.item:hover` z tłem `background-color: rgba(224, 176, 74, 0.15)`.',
      html: '<main>\n  <h1>Ekwipunek</h1>\n  <ul class="inventory">\n    <li class="item">Miecz krótki</li>\n    <li class="item rare" title="Rzadki przedmiot">Smocza łuska</li>\n    <li class="item" id="legendary">Kosa Świtu</li>\n  </ul>\n  <p class="hint">Kliknij przedmiot, by zobaczyć opis.</p>\n</main>',
      cssStarter: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.item {\n  color: #d8d2c4;\n}\n\n.rare {\n  color: #8fb8ff;\n}\n\n#legendary {\n  color: #f6e3a1;\n  font-weight: 700;\n}\n\n/* TODO: dodaj reguły .item[title] i .item:hover */'),
      cssSolution: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.item {\n  color: #d8d2c4;\n}\n\n.rare {\n  color: #8fb8ff;\n}\n\n#legendary {\n  color: #f6e3a1;\n  font-weight: 700;\n}\n\n.item[title] {\n  border: 2px solid #8fb8ff;\n}\n\n.item:hover {\n  background-color: rgba(224, 176, 74, 0.15);\n}'),
      checks: [
        ['elementExists', 'Zachowaj HTML: `.item` z atrybutem `title`.', { selector: '.item[title]' }],
        ['computedStyle', 'Dodaj regułę `.item[title]` z obramowaniem (sprawdzamy `border-top-width` = `2px` i `border-top-style` = `solid`).', { selector: '.item[title]', property: 'border-top-width', expected: '2px' }],
        ['computedStyle', 'W `.item[title]` obramowanie ma być pełne — `border-top-style` na `solid`.', { selector: '.item[title]', property: 'border-top-style', expected: 'solid' }],
        ['sourceMatches', 'Dodaj regułę `.item:hover` (pseudoklasa najechania kursorem).', { file: 'styles.css', pattern: '\\.item\\s*:\\s*hover\\s*\\{' }],
      ],
    },
  },
  3: {
    guided: {
      goal: 'Dziennik questów potrzebuje typografii. Za `TODO` dodaj regułę `h1` z `font-size: 40px` i `letter-spacing: 2px`, a pod nią `.desc` z `line-height: 24px`.',
      steps: [
        'HTML jest gotowy: sekcja `.quest` ma nagłówek `h2`, opis `.desc` i nagrodę `.reward`.',
        'Za `TODO` napisz regułę `h1` z `font-size: 40px;` i `letter-spacing: 2px;`.',
        'Dopisz `.desc { line-height: 24px; }` — opis oddechze.',
        '▶ Play: tytuł rośnie i rozstrzela się, a opis czyta się lżej.',
      ],
      html: '<main>\n  <h1>Dziennik questów</h1>\n  <section class="quest">\n    <h2>Bestia z moczarów</h2>\n    <p class="desc">Trop potwora wiedzie przez mgliste bagna. Szukaj śladów przy starym moście.</p>\n    <p class="reward">Nagroda: 250 sztuk złota</p>\n  </section>\n</main>',
      cssStarter: todo('dodaj reguły h1 i .desc'),
      cssSolution: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 40px;\n  letter-spacing: 2px;\n}\n\n.desc {\n  line-height: 24px;\n}'),
      checks: [
        ['elementExists', 'Zachowaj HTML: `.quest` z `h2`, `.desc` i `.reward`.', { selector: 'section.quest > p.reward' }],
        ['computedStyle', 'W regule `h1` ustaw `font-size` na `40px`.', { selector: 'h1', property: 'font-size', expected: '40px' }],
        ['computedStyle', 'W `h1` ustaw `letter-spacing` na `2px`.', { selector: 'h1', property: 'letter-spacing', expected: '2px' }],
        ['computedStyle', 'Dodaj regułę `.desc` z `line-height` na `24px`.', { selector: '.desc', property: 'line-height', expected: '24px' }],
      ],
    },
    modified: {
      title: 'Kapitaliki nagrody',
      goal: 'Nagroda ma wyglądać jak odznaka. Dodaj regułę `.reward` z `text-transform: uppercase` i `text-align: center`, a `h2` dopisz `font-family` z fontem „Cinzel”.',
      html: '<main>\n  <h1>Dziennik questów</h1>\n  <section class="quest">\n    <h2>Bestia z moczarów</h2>\n    <p class="desc">Trop potwora wiedzie przez mgliste bagna. Szukaj śladów przy starym moście.</p>\n    <p class="reward">Nagroda: 250 sztuk złota</p>\n  </section>\n</main>',
      cssStarter: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 40px;\n  letter-spacing: 2px;\n}\n\n.desc {\n  line-height: 24px;\n}\n\n/* TODO: dodaj reguły .reward i h2 */'),
      cssSolution: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 40px;\n  letter-spacing: 2px;\n}\n\nh2 {\n  font-family: \'Cinzel\', serif;\n}\n\n.desc {\n  line-height: 24px;\n}\n\n.reward {\n  text-transform: uppercase;\n  text-align: center;\n}'),
      checks: [
        ['computedStyle', 'Dodaj regułę `.reward` z `text-transform` na `uppercase`.', { selector: '.reward', property: 'text-transform', expected: 'uppercase' }],
        ['computedStyle', 'W `.reward` ustaw `text-align` na `center`.', { selector: '.reward', property: 'text-align', expected: 'center' }],
        ['sourceDeclaration', 'Dopisz w regule `h2` deklarację `font-family` z fontem `\'Cinzel\'`.', { file: 'styles.css', selector: 'h2', property: 'font-family' }],
      ],
    },
    independent: {
      title: 'Paleta w zmiennych',
      goal: 'Nazwij kolory raz i używaj ich wszędzie. Dodaj regułę `:root` ze zmienną `--gold: #e0b04a`, a potem `.reward` z `color: var(--gold)` i `h2` z tym samym `color: var(--gold)`.',
      html: '<main>\n  <h1>Dziennik questów</h1>\n  <section class="quest">\n    <h2>Bestia z moczarów</h2>\n    <p class="desc">Trop potwora wiedzie przez mgliste bagna. Szukaj śladów przy starym moście.</p>\n    <p class="reward">Nagroda: 250 sztuk złota</p>\n  </section>\n</main>',
      cssStarter: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 40px;\n  letter-spacing: 2px;\n}\n\nh2 {\n  font-family: \'Cinzel\', serif;\n}\n\n.desc {\n  line-height: 24px;\n}\n\n.reward {\n  text-transform: uppercase;\n  text-align: center;\n}\n\n/* TODO: dodaj :root z --gold i użyj var(--gold) */'),
      cssSolution: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n:root {\n  --gold: #e0b04a;\n}\n\nh1 {\n  font-size: 40px;\n  letter-spacing: 2px;\n}\n\nh2 {\n  font-family: \'Cinzel\', serif;\n  color: var(--gold);\n}\n\n.desc {\n  line-height: 24px;\n}\n\n.reward {\n  text-transform: uppercase;\n  text-align: center;\n  color: var(--gold);\n}'),
      checks: [
        ['sourceDeclaration', 'W regule `:root` zadeklaruj zmienną `--gold` z wartością `#e0b04a`.', { file: 'styles.css', selector: ':root', property: '--gold', expected: '#e0b04a' }],
        ['sourceMatches', 'W `.reward` ustaw `color` na `var(--gold)` — użyj zmiennej, nie literału.', { file: 'styles.css', pattern: '\\.reward\\s*\\{[^}]*color\\s*:\\s*var\\(--gold\\)' }],
        ['sourceMatches', 'W `h2` ustaw `color` na `var(--gold)`.', { file: 'styles.css', pattern: '(?:^|})\\s*h2\\s*\\{[^}]*color\\s*:\\s*var\\(--gold\\)' }],
      ],
    },
  },
  4: {
    guided: {
      goal: 'Karty karczmy zlewają się z tłem. Za `TODO` dodaj regułę `*` z `box-sizing: border-box` oraz `.card` z `padding: 18px` i ciemnym tłem `background-color: #12161f`.',
      steps: [
        'HTML jest gotowy: `.cards` trzyma trzy artykuły `.card` z `h2` i `p`.',
        'Za `TODO` napisz `* { box-sizing: border-box; }` — gwiazdka wybiera wszystko.',
        'Dopisz `.card` z `padding: 18px;` i `background-color: #12161f;`.',
        '▶ Play: karty dostają oddech i odcinają się od tła.',
      ],
      html: '<main>\n  <h1>Karczma</h1>\n  <section class="cards">\n    <article class="card"><h2>Odpoczynek</h2><p>10 sztuk złota</p></article>\n    <article class="card"><h2>Posiłek</h2><p>4 sztuki złota</p></article>\n    <article class="card"><h2>Stajnia</h2><p>2 sztuki złota</p></article>\n  </section>\n</main>',
      cssStarter: todo('dodaj reguły * i .card'),
      cssSolution: css('* {\n  box-sizing: border-box;\n}\n\nbody {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.card {\n  padding: 18px;\n  background-color: #12161f;\n}'),
      checks: [
        ['elementExists', 'Zachowaj HTML: `.cards` z trzema `.card`.', { selector: 'section.cards > article.card:nth-child(3)' }],
        ['computedStyle', 'Dodaj regułę `*` z `box-sizing` na `border-box`.', { selector: '.card', property: 'box-sizing', expected: 'border-box' }],
        ['computedStyle', 'W `.card` ustaw `padding` na `18px` (sprawdzamy `padding-top`).', { selector: '.card', property: 'padding-top', expected: '18px' }],
        ['computedStyle', 'W `.card` ustaw `background-color` na `#12161f` (obliczone `rgb(18, 22, 31)`).', { selector: '.card', property: 'background-color', expected: 'rgb(18, 22, 31)' }],
      ],
    },
    modified: {
      title: 'Rama i szerokość karty',
      goal: 'Karty potrzebują oprawy. W regule `.card` dopisz `border: 2px solid #6b5326` i `width: 200px` — padding i rama wliczają się w szerokość dzięki `border-box`.',
      html: '<main>\n  <h1>Karczma</h1>\n  <section class="cards">\n    <article class="card"><h2>Odpoczynek</h2><p>10 sztuk złota</p></article>\n    <article class="card"><h2>Posiłek</h2><p>4 sztuki złota</p></article>\n    <article class="card"><h2>Stajnia</h2><p>2 sztuki złota</p></article>\n  </section>\n</main>',
      cssStarter: css('* {\n  box-sizing: border-box;\n}\n\nbody {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.card {\n  padding: 18px;\n  background-color: #12161f;\n  /* TODO: dopisz border i width */\n}'),
      cssSolution: css('* {\n  box-sizing: border-box;\n}\n\nbody {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.card {\n  padding: 18px;\n  background-color: #12161f;\n  border: 2px solid #6b5326;\n  width: 200px;\n}'),
      checks: [
        ['computedStyle', 'W `.card` dopisz `border` — sprawdzamy `border-top-width` = `2px`.', { selector: '.card', property: 'border-top-width', expected: '2px' }],
        ['computedStyle', 'Rama `.card` ma być pełna — `border-top-style` na `solid`.', { selector: '.card', property: 'border-top-style', expected: 'solid' }],
        ['computedStyle', 'Kolor ramy `.card` to `#6b5326` — sprawdzamy `border-top-color` (obliczone `rgb(107, 83, 38)`).', { selector: '.card', property: 'border-top-color', expected: 'rgb(107, 83, 38)' }],
        ['computedStyle', 'W `.card` ustaw `width` na `200px`.', { selector: '.card', property: 'width', expected: '200px' }],
      ],
    },
    independent: {
      title: 'Rytm odstępów',
      goal: 'Karty przyklejone do siebie i nagłówka. Dodaj regułę `.card` z `margin: 16px` (zewnętrzny oddech) oraz `.cards` z `margin-top: 24px` i `height` karty `140px`.',
      html: '<main>\n  <h1>Karczma</h1>\n  <section class="cards">\n    <article class="card"><h2>Odpoczynek</h2><p>10 sztuk złota</p></article>\n    <article class="card"><h2>Posiłek</h2><p>4 sztuki złota</p></article>\n    <article class="card"><h2>Stajnia</h2><p>2 sztuki złota</p></article>\n  </section>\n</main>',
      cssStarter: css('* {\n  box-sizing: border-box;\n}\n\nbody {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.card {\n  padding: 18px;\n  background-color: #12161f;\n  border: 2px solid #6b5326;\n  width: 200px;\n}\n\n/* TODO: dopisz margin do .card, height do .card i margin-top do .cards */'),
      cssSolution: css('* {\n  box-sizing: border-box;\n}\n\nbody {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.card {\n  padding: 18px;\n  margin: 16px;\n  height: 140px;\n  background-color: #12161f;\n  border: 2px solid #6b5326;\n  width: 200px;\n}\n\n.cards {\n  margin-top: 24px;\n}'),
      checks: [
        ['computedStyle', 'W `.card` ustaw `margin` na `16px` (sprawdzamy `margin-top`).', { selector: '.card', property: 'margin-top', expected: '16px' }],
        ['computedStyle', 'W `.card` ustaw `height` na `140px`.', { selector: '.card', property: 'height', expected: '140px' }],
        ['computedStyle', 'Dodaj regułę `.cards` z `margin-top` na `24px`.', { selector: '.cards', property: 'margin-top', expected: '24px' }],
      ],
    },
  },
  5: {
    guided: {
      goal: 'Panel statystyk ma płaskie staty i plakietkę w złym miejscu. Za `TODO` dodaj regułę `.stat` z `display: inline-block` oraz `.panel` z `position: relative`.',
      steps: [
        'HTML jest gotowy: `.panel` trzyma `h2`, dwa `span.stat` i `span.badge`.',
        'Za `TODO` napisz `.stat { display: inline-block; }` — staty staną w rzędzie z własnymi wymiarami.',
        'Dopisz `.panel { position: relative; }` — panel stanie się punktem odniesienia dla plakietki (zadanie 2).',
        '▶ Play: staty układają się obok siebie.',
      ],
      html: '<main class="hud">\n  <h1>Panel gracza</h1>\n  <section class="panel">\n    <h2>Statystyki</h2>\n    <span class="stat">HP 120</span>\n    <span class="stat">MP 80</span>\n    <span class="badge">NOWY</span>\n  </section>\n  <aside class="feed">\n    <h2>Zdarzenia</h2>\n    <p>Smok uderzył cię za 12.</p>\n  </aside>\n</main>',
      cssStarter: todo('dodaj reguły .stat i .panel'),
      cssSolution: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.stat {\n  display: inline-block;\n  padding: 6px 10px;\n  background-color: #1f2534;\n}\n\n.panel {\n  position: relative;\n  padding: 18px;\n  background-color: #12161f;\n}'),
      checks: [
        ['elementExists', 'Zachowaj HTML: `.panel` z dwoma `.stat` i `.badge`.', { selector: 'section.panel > span.badge' }],
        ['computedStyle', 'Dodaj regułę `.stat` z `display` na `inline-block`.', { selector: '.stat', property: 'display', expected: 'inline-block' }],
        ['computedStyle', 'Dodaj regułę `.panel` z `position` na `relative`.', { selector: '.panel', property: 'position', expected: 'relative' }],
      ],
    },
    modified: {
      title: 'Plakietka w rogu',
      goal: 'Plakietka `.badge` ma przypiąć się do rogu panelu. Dodaj regułę `.badge` z `position: absolute`, `top: 12px`, `right: 12px`, `border-radius: 4px` i `z-index: 2`.',
      html: '<main class="hud">\n  <h1>Panel gracza</h1>\n  <section class="panel">\n    <h2>Statystyki</h2>\n    <span class="stat">HP 120</span>\n    <span class="stat">MP 80</span>\n    <span class="badge">NOWY</span>\n  </section>\n  <aside class="feed">\n    <h2>Zdarzenia</h2>\n    <p>Smok uderzył cię za 12.</p>\n  </aside>\n</main>',
      cssStarter: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.stat {\n  display: inline-block;\n  padding: 6px 10px;\n  background-color: #1f2534;\n}\n\n.panel {\n  position: relative;\n  padding: 18px;\n  background-color: #12161f;\n}\n\n/* TODO: dodaj regułę .badge */'),
      cssSolution: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.stat {\n  display: inline-block;\n  padding: 6px 10px;\n  background-color: #1f2534;\n}\n\n.panel {\n  position: relative;\n  padding: 18px;\n  background-color: #12161f;\n}\n\n.badge {\n  position: absolute;\n  top: 12px;\n  right: 12px;\n  z-index: 2;\n  padding: 4px 8px;\n  border-radius: 4px;\n  background-color: #a03a2c;\n}'),
      checks: [
        ['computedStyle', 'Dodaj regułę `.badge` z `position` na `absolute`.', { selector: '.badge', property: 'position', expected: 'absolute' }],
        ['computedStyle', 'W `.badge` ustaw `top` na `12px`.', { selector: '.badge', property: 'top', expected: '12px' }],
        ['computedStyle', 'W `.badge` ustaw `right` na `12px`.', { selector: '.badge', property: 'right', expected: '12px' }],
        ['computedStyle', 'W `.badge` ustaw `border-radius` na `4px`.', { selector: '.badge', property: 'border-radius', expected: '4px' }],
        ['computedStyle', 'W `.badge` ustaw `z-index` na `2`.', { selector: '.badge', property: 'z-index', expected: '2' }],
      ],
    },
    independent: {
      title: 'Ukryty feed i przycięty panel',
      goal: 'Dwa wykończenia: reguła `.panel` z `overflow: hidden` i `border-radius: 10px` (zaokrągli też plakietkę) oraz `.feed` z `display: none` — feed znika z widoku, ale zostaje w HTML.',
      html: '<main class="hud">\n  <h1>Panel gracza</h1>\n  <section class="panel">\n    <h2>Statystyki</h2>\n    <span class="stat">HP 120</span>\n    <span class="stat">MP 80</span>\n    <span class="badge">NOWY</span>\n  </section>\n  <aside class="feed">\n    <h2>Zdarzenia</h2>\n    <p>Smok uderzył cię za 12.</p>\n  </aside>\n</main>',
      cssStarter: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.stat {\n  display: inline-block;\n  padding: 6px 10px;\n  background-color: #1f2534;\n}\n\n.panel {\n  position: relative;\n  padding: 18px;\n  background-color: #12161f;\n}\n\n.badge {\n  position: absolute;\n  top: 12px;\n  right: 12px;\n  z-index: 2;\n  padding: 4px 8px;\n  border-radius: 4px;\n  background-color: #a03a2c;\n}\n\n/* TODO: dopisz overflow i border-radius do .panel oraz display do .feed */'),
      cssSolution: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.stat {\n  display: inline-block;\n  padding: 6px 10px;\n  background-color: #1f2534;\n}\n\n.panel {\n  position: relative;\n  padding: 18px;\n  border-radius: 10px;\n  overflow: hidden;\n  background-color: #12161f;\n}\n\n.badge {\n  position: absolute;\n  top: 12px;\n  right: 12px;\n  z-index: 2;\n  padding: 4px 8px;\n  border-radius: 4px;\n  background-color: #a03a2c;\n}\n\n.feed {\n  display: none;\n}'),
      checks: [
        ['elementExists', 'Zachowaj HTML: `.feed` zostaje w dokumencie (ukrywamy go w CSS).', { selector: 'aside.feed' }],
        ['computedStyle', 'W `.panel` ustaw `overflow` na `hidden`.', { selector: '.panel', property: 'overflow', expected: 'hidden' }],
        ['computedStyle', 'W `.panel` ustaw `border-radius` na `10px`.', { selector: '.panel', property: 'border-radius', expected: '10px' }],
        ['computedStyle', 'Dodaj regułę `.feed` z `display` na `none`.', { selector: '.feed', property: 'display', expected: 'none' }],
      ],
    },
  },
  6: {
    guided: {
      goal: 'Przyciski menu reagują skokowo. Za `TODO` dodaj regułę `.btn` z `transition-property: transform`, `transition-duration: 0.25s` i `transition-timing-function: ease-in-out`.',
      steps: [
        'HTML jest gotowy: trzy linki `.btn` w `.menu` i akapit `.loading`.',
        'Za `TODO` napisz regułę `.btn` z `transition-property: transform;`.',
        'Dopisz `transition-duration: 0.25s;` i `transition-timing-function: ease-in-out;`.',
        '▶ Play: przyciski mają przygotowane płynne przejście (użyjesz go w kolejnych zadaniach).',
      ],
      html: '<main>\n  <h1>Kroniki Smoka</h1>\n  <nav class="menu">\n    <a class="btn" href="#gra">Graj</a>\n    <a class="btn" href="#opcje">Opcje</a>\n    <a class="btn" href="#autorzy">Autorzy</a>\n  </nav>\n  <p class="loading">Ładowanie świata…</p>\n</main>',
      cssStarter: todo('dodaj regułę .btn z transition-*'),
      cssSolution: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.btn {\n  display: inline-block;\n  padding: 12px 24px;\n  color: #fff2cf;\n  background-color: #a03a2c;\n  transition-property: transform;\n  transition-duration: 0.25s;\n  transition-timing-function: ease-in-out;\n}'),
      checks: [
        ['elementExists', 'Zachowaj HTML: trzy `.btn` w `.menu` i `.loading`.', { selector: 'nav.menu > a.btn:nth-child(3)' }],
        ['computedStyle', 'W `.btn` ustaw `transition-property` na `transform`.', { selector: '.btn', property: 'transition-property', expected: 'transform' }],
        ['computedStyle', 'W `.btn` ustaw `transition-duration` na `0.25s`.', { selector: '.btn', property: 'transition-duration', expected: '0.25s' }],
        ['computedStyle', 'W `.btn` ustaw `transition-timing-function` na `ease-in-out`.', { selector: '.btn', property: 'transition-timing-function', expected: 'ease-in-out' }],
      ],
    },
    modified: {
      title: 'Puls ładowania',
      goal: 'Napis „Ładowanie świata…" ma pulsować. Dodaj `@keyframes pulse` z `opacity` od `1` do `0.4` oraz regułę `.loading` z `animation-name: pulse` i `animation-duration: 1.5s`.',
      html: '<main>\n  <h1>Kroniki Smoka</h1>\n  <nav class="menu">\n    <a class="btn" href="#gra">Graj</a>\n    <a class="btn" href="#opcje">Opcje</a>\n    <a class="btn" href="#autorzy">Autorzy</a>\n  </nav>\n  <p class="loading">Ładowanie świata…</p>\n</main>',
      cssStarter: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.btn {\n  display: inline-block;\n  padding: 12px 24px;\n  color: #fff2cf;\n  background-color: #a03a2c;\n  transition-property: transform;\n  transition-duration: 0.25s;\n  transition-timing-function: ease-in-out;\n}\n\n/* TODO: dodaj @keyframes pulse i regułę .loading */'),
      cssSolution: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.btn {\n  display: inline-block;\n  padding: 12px 24px;\n  color: #fff2cf;\n  background-color: #a03a2c;\n  transition-property: transform;\n  transition-duration: 0.25s;\n  transition-timing-function: ease-in-out;\n}\n\n@keyframes pulse {\n  from { opacity: 1; }\n  50% { opacity: 0.4; }\n  to { opacity: 1; }\n}\n\n.loading {\n  animation-name: pulse;\n  animation-duration: 1.5s;\n  animation-iteration-count: infinite;\n}'),
      checks: [
        ['sourceMatches', 'Dodaj blok `@keyframes pulse` opisujący zmianę krycia.', { file: 'styles.css', pattern: '@keyframes\\s+pulse\\s*\\{' }],
        ['computedStyle', 'W `.loading` ustaw `animation-name` na `pulse`.', { selector: '.loading', property: 'animation-name', expected: 'pulse' }],
        ['computedStyle', 'W `.loading` ustaw `animation-duration` na `1.5s`.', { selector: '.loading', property: 'animation-duration', expected: '1.5s' }],
      ],
    },
    independent: {
      title: 'Hover i mniej ruchu',
      goal: 'Dokończ menu: reguła `.btn:hover` z `transform: translateY(-2px)` oraz blok `@media (prefers-reduced-motion: reduce)`, który wyłącza `animation` i `transition` dla `.btn` i `.loading`.',
      html: '<main>\n  <h1>Kroniki Smoka</h1>\n  <nav class="menu">\n    <a class="btn" href="#gra">Graj</a>\n    <a class="btn" href="#opcje">Opcje</a>\n    <a class="btn" href="#autorzy">Autorzy</a>\n  </nav>\n  <p class="loading">Ładowanie świata…</p>\n</main>',
      cssStarter: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.btn {\n  display: inline-block;\n  padding: 12px 24px;\n  color: #fff2cf;\n  background-color: #a03a2c;\n  transition-property: transform;\n  transition-duration: 0.25s;\n  transition-timing-function: ease-in-out;\n}\n\n@keyframes pulse {\n  from { opacity: 1; }\n  50% { opacity: 0.4; }\n  to { opacity: 1; }\n}\n\n.loading {\n  animation-name: pulse;\n  animation-duration: 1.5s;\n  animation-iteration-count: infinite;\n}\n\n/* TODO: dodaj .btn:hover i @media prefers-reduced-motion */'),
      cssSolution: css('body {\n  background-color: #07090d;\n  color: #d8d2c4;\n  font-family: system-ui, sans-serif;\n}\n\n.btn {\n  display: inline-block;\n  padding: 12px 24px;\n  color: #fff2cf;\n  background-color: #a03a2c;\n  transition-property: transform;\n  transition-duration: 0.25s;\n  transition-timing-function: ease-in-out;\n}\n\n.btn:hover {\n  transform: translateY(-2px);\n}\n\n@keyframes pulse {\n  from { opacity: 1; }\n  50% { opacity: 0.4; }\n  to { opacity: 1; }\n}\n\n.loading {\n  animation-name: pulse;\n  animation-duration: 1.5s;\n  animation-iteration-count: infinite;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .btn {\n    transition: none;\n  }\n  .loading {\n    animation: none;\n  }\n}'),
      checks: [
        ['sourceMatches', 'Dodaj regułę `.btn:hover` z transformacją.', { file: 'styles.css', pattern: '\\.btn\\s*:\\s*hover\\s*\\{[^}]*transform' }],
        ['sourceMatches', 'Dodaj `@media (prefers-reduced-motion: reduce)` wyłączający animację `.loading`.', { file: 'styles.css', pattern: '@media\\s*\\(\\s*prefers-reduced-motion\\s*:\\s*reduce\\s*\\)[\\s\\S]*animation\\s*:\\s*none' }],
        ['sourceMatches', 'W bloku reduced-motion wyłącz też `transition` przycisków.', { file: 'styles.css', pattern: '@media\\s*\\(\\s*prefers-reduced-motion\\s*:\\s*reduce\\s*\\)[\\s\\S]*transition\\s*:\\s*none' }],
      ],
    },
  },
};

export const cssGdTaskHint = 'Reguły CSS wpisujesz w pliku `styles.css` — HTML jest gotowy i zostaje bez zmian. Reguła to selektor + klamry z deklaracjami `właściwość: wartość;`. Komentarz `/* TODO: … */` pokazuje miejsce dopisania — możesz go zostawić albo usunąć.';
