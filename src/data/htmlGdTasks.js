// Dane zadań ścieżki HTML GD — te same umiejętności co w ścieżce HTML,
// ale na przykładach interfejsu gry „Kroniki Smoka". Każde zadanie zaczyna
// się od niemal kompletnej, już ostylowanej strony; uczeń wykonuje 1–3 małe,
// konkretne zmiany zaznaczone komentarzem <!-- TODO: ... -->.
// checks: [type, label, fields] — sprawdzamy wyłącznie to, co dopisuje uczeń.
export const htmlGdTasks = {
  1: {
    guided: {
      goal: 'Ekran tytułowy jest prawie gotowy. Dodaj w `<main>` główny nagłówek `<h1>` z tytułem gry „Kroniki Smoka”, nad sekcjami menu.',
      steps: [
        'Szkielet dokumentu (`<!doctype html>`, `html`, `head`, `body`) zostaje — treść wpisuj w `index.html` między `<body>` a `</body>`.',
        'Znajdź komentarz `TODO` tuż po znaczniku `<main>`.',
        'W jego miejsce wpisz `<h1>`Kroniki Smoka`</h1>` — tytuł pojawi się w motywie gry.',
      ],
      starter: '<main>\n  <!-- TODO: dodaj główny nagłówek <h1>Kroniki Smoka</h1> -->\n  <section id="play"><h2>Graj</h2><p>Rozpocznij nową przygodę.</p></section>\n  <section id="options"><h2>Opcje</h2><p>Dostrój dźwięk i sterowanie.</p></section>\n  <section id="credits"><h2>Autorzy</h2><p>Studio Smok.</p></section>\n</main>',
      solution: '<main>\n  <h1>Kroniki Smoka</h1>\n  <section id="play"><h2>Graj</h2><p>Rozpocznij nową przygodę.</p></section>\n  <section id="options"><h2>Opcje</h2><p>Dostrój dźwięk i sterowanie.</p></section>\n  <section id="credits"><h2>Autorzy</h2><p>Studio Smok.</p></section>\n</main>',
      checks: [
        ['elementExists', 'Bezpośrednio w `<main>` dodaj główny nagłówek `<h1>` z tytułem gry.', { selector: 'main > h1' }],
        ['textEquals', 'Nagłówek `<h1>` ma zawierać tekst „Kroniki Smoka”.', { selector: 'main > h1', expected: 'Kroniki Smoka' }],
      ],
    },
    modified: {
      title: 'Stopka i podpis w sekcji',
      goal: 'Dokończ ekran tytułowy: dodaj akapit `<p>` w sekcji `id="credits"` oraz stopkę `<footer>` z akapitem `<p>` „© Studio Smok · wersja 1.0” za `</main>`.',
      starter: '<main>\n  <h1>Kroniki Smoka</h1>\n  <section id="play"><h2>Graj</h2><p>Rozpocznij nową przygodę.</p></section>\n  <section id="options"><h2>Opcje</h2><p>Dostrój dźwięk i sterowanie.</p></section>\n  <section id="credits"><h2>Autorzy</h2><!-- TODO: dodaj <p> z podpisem twórców --></section>\n</main>\n<!-- TODO: dodaj <footer> z akapitem <p> „© Studio Smok · wersja 1.0” -->',
      solution: '<main>\n  <h1>Kroniki Smoka</h1>\n  <section id="play"><h2>Graj</h2><p>Rozpocznij nową przygodę.</p></section>\n  <section id="options"><h2>Opcje</h2><p>Dostrój dźwięk i sterowanie.</p></section>\n  <section id="credits"><h2>Autorzy</h2><p>Zespół: Lena, Marek, Ola.</p></section>\n</main>\n<footer><p>© Studio Smok · wersja 1.0</p></footer>',
      checks: [
        ['elementExists', 'W sekcji `id="credits"` dodaj akapit `<p>` z podpisem twórców.', { selector: 'section#credits > p' }],
        ['elementExists', 'Po zamknięciu `</main>` dodaj `<footer>`, a w nim akapit `<p>`.', { selector: 'footer > p' }],
        ['textEquals', 'Stopka ma zawierać tekst „© Studio Smok · wersja 1.0”.', { selector: 'footer > p', expected: '© Studio Smok · wersja 1.0' }],
      ],
    },
    independent: {
      title: 'Karta bohatera',
      goal: 'Uzupełnij kartę bohatera: dodaj w `<main>` akapit `<p id="bio">` z opisem bohatera, w sekcji `id="skills"` nagłówek `<h2>` „Umiejętności”, a w `<footer>` akapit `<p>` z podpisem.',
      starter: '<main>\n  <h1>Kael Żelazny</h1>\n  <!-- TODO: dodaj <p id="bio"> z opisem bohatera -->\n  <section id="skills">\n    <!-- TODO: dodaj nagłówek <h2>Umiejętności</h2> -->\n    <p>Władanie mieczem i tarczą.</p>\n  </section>\n</main>\n<footer>\n  <!-- TODO: dodaj akapit <p> z podpisem -->\n</footer>',
      solution: '<main>\n  <h1>Kael Żelazny</h1>\n  <p id="bio">Najemnik z Północy, który ściga smoki od dziesięciu lat.</p>\n  <section id="skills">\n    <h2>Umiejętności</h2>\n    <p>Władanie mieczem i tarczą.</p>\n  </section>\n</main>\n<footer>\n  <p>Karta postaci · Kroniki Smoka</p>\n</footer>',
      checks: [
        ['elementExists', 'Bezpośrednio w `<main>` dodaj akapit `<p id="bio">` z opisem bohatera.', { selector: 'main > p#bio' }],
        ['elementExists', 'W sekcji `id="skills"` dodaj nagłówek `<h2>` „Umiejętności”.', { selector: 'section#skills > h2' }],
        ['textEquals', 'Nagłówek sekcji umiejętności ma czytać „Umiejętności”.', { selector: 'section#skills > h2', expected: 'Umiejętności' }],
        ['elementExists', 'W `<footer>` umieść akapit `<p>` z podpisem.', { selector: 'footer > p' }],
      ],
    },
  },
  2: {
    guided: {
      goal: 'Dokument gry jest prawie gotowy, ale karta ma roboczy tytuł. W `<head>` zmień tekst w `<title>` na „Kroniki Smoka”.',
      steps: [
        'Znajdź `<title>` wewnątrz `<head>` — to nazwa karty przeglądarki.',
        'Zamień tekst „Strona gry” na `Kroniki Smoka`.',
        'Tytuł nie pojawi się na stronie — to nazwa karty i wyniku wyszukiwania.',
      ],
      starter: '<!doctype html>\n<html lang="pl">\n<head>\n  <meta charset="UTF-8">\n  <!-- TODO: zmień tekst w <title> na „Kroniki Smoka” -->\n  <title>Strona gry</title>\n</head>\n<body>\n  <main>\n    <h1>Kroniki Smoka</h1>\n    <p>Mroczna przygoda prosto w przeglądarce.</p>\n  </main>\n</body>\n</html>',
      solution: '<!doctype html>\n<html lang="pl">\n<head>\n  <meta charset="UTF-8">\n  <title>Kroniki Smoka</title>\n</head>\n<body>\n  <main>\n    <h1>Kroniki Smoka</h1>\n    <p>Mroczna przygoda prosto w przeglądarce.</p>\n  </main>\n</body>\n</html>',
      checks: [
        ['textEquals', 'Tekst w `<title>` ma brzmieć „Kroniki Smoka”.', { selector: 'head > title', expected: 'Kroniki Smoka' }],
      ],
    },
    modified: {
      title: 'Język i opis strony',
      goal: 'Strona jest po polsku, a dokument deklaruje `lang="en"`. Popraw `lang` na `"pl"` na znaczniku `<html>` i dodaj w `<head>` `<meta name="description" content="Zagraj w Kroniki Smoka w przeglądarce">`.',
      starter: '<!doctype html>\n<html lang="en"><!-- TODO: treść jest po polsku — popraw lang na "pl" -->\n<head>\n  <meta charset="UTF-8">\n  <title>Kroniki Smoka</title>\n  <!-- TODO: dodaj <meta name="description" content="Zagraj w Kroniki Smoka w przeglądarce"> -->\n</head>\n<body>\n  <main>\n    <h1>Kroniki Smoka</h1>\n    <p>Mroczna przygoda prosto w przeglądarce.</p>\n  </main>\n</body>\n</html>',
      solution: '<!doctype html>\n<html lang="pl">\n<head>\n  <meta charset="UTF-8">\n  <title>Kroniki Smoka</title>\n  <meta name="description" content="Zagraj w Kroniki Smoka w przeglądarce">\n</head>\n<body>\n  <main>\n    <h1>Kroniki Smoka</h1>\n    <p>Mroczna przygoda prosto w przeglądarce.</p>\n  </main>\n</body>\n</html>',
      checks: [
        ['attributeEquals', 'Treść jest po polsku — na znaczniku `<html>` ustaw `lang="pl"`.', { selector: 'html', attribute: 'lang', expected: 'pl' }],
        ['elementExists', 'W `<head>` dodaj `<meta name="description" content="…">` z niepustym opisem strony.', { selector: 'head > meta[name="description"][content]:not([content=""])' }],
      ],
    },
    independent: {
      title: 'Strona sklepu po angielsku',
      goal: 'Dopracuj anglojęzyczną stronę sklepu: dokument deklaruje `lang="pl"` — popraw na `"en"`, dodaj `<meta name="description">` z opisem po angielsku i akapit `<p>` pod nagłówkiem `<h1>`.',
      starter: '<!doctype html>\n<html lang="pl"><!-- TODO: treść jest po angielsku — popraw lang na "en" -->\n<head>\n  <meta charset="UTF-8">\n  <title>Dragon Chronicles</title>\n  <!-- TODO: dodaj <meta name="description" content="…"> po angielsku -->\n</head>\n<body>\n  <main>\n    <h1>Dragon Chronicles</h1>\n    <!-- TODO: dodaj akapit <p> z zachętą po angielsku -->\n  </main>\n</body>\n</html>',
      solution: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Dragon Chronicles</title>\n  <meta name="description" content="Play Dragon Chronicles in your browser">\n</head>\n<body>\n  <main>\n    <h1>Dragon Chronicles</h1>\n    <p>A dark fantasy adventure, free to play.</p>\n  </main>\n</body>\n</html>',
      checks: [
        ['attributeEquals', 'Treść jest po angielsku — na znaczniku `<html>` ustaw `lang="en"`.', { selector: 'html', attribute: 'lang', expected: 'en' }],
        ['elementExists', 'W `<head>` dodaj `<meta name="description" content="…">` z krótkim opisem strony po angielsku.', { selector: 'head > meta[name="description"][content]:not([content=""])' }],
        ['elementExists', 'W `<main>`, pod nagłówkiem `<h1>`, dodaj akapit `<p>` z zachętą po angielsku.', { selector: 'main > p' }],
      ],
    },
  },
  3: {
    guided: {
      goal: 'Dziennik questów czeka na wpis. W pierwszej sekcji dodaj akapit `<p>` opisu questa z ważnym fragmentem w `<strong>` i akcentem w `<em>`.',
      steps: [
        'Znajdź komentarz `TODO` w sekcji „Smok w Górach Mroźnych”.',
        'Wpisz tam akapit `<p><strong>Cel:</strong> pokonaj <em>smoka</em> w jego legowisku.</p>`.',
        '`<strong>` oznacza ważność, a `<em>` nacisk — oba renderują się w linii akapitu.',
      ],
      starter: '<main>\n  <h1>Dziennik questów</h1>\n  <section>\n    <h2>Smok w Górach Mroźnych</h2>\n    <!-- TODO: dodaj <p> z <strong> i <em> -->\n  </section>\n  <section>\n    <h2>Zaginiony wysłannik</h2>\n    <p>Znajdź gońca na starym trakcie.</p>\n  </section>\n</main>',
      solution: '<main>\n  <h1>Dziennik questów</h1>\n  <section>\n    <h2>Smok w Górach Mroźnych</h2>\n    <p><strong>Cel:</strong> pokonaj <em>smoka</em> w jego legowisku.</p>\n  </section>\n  <section>\n    <h2>Zaginiony wysłannik</h2>\n    <p>Znajdź gońca na starym trakcie.</p>\n  </section>\n</main>',
      checks: [
        ['elementExists', 'W sekcji dodaj akapit `<p>` z ważnym fragmentem w `<strong>`.', { selector: 'section > p > strong' }],
        ['elementExists', 'W tym samym akapicie oznacz akcentowany fragment znacznikiem `<em>`.', { selector: 'section > p > em' }],
      ],
    },
    modified: {
      title: 'Indeks dolny i podział',
      goal: 'Uporządkuj wpis: zapisz „Miksturę H2O” jako `H<sub>2</sub>O` i rozdziel dwa questy poziomą kreską `<hr>` między sekcjami.',
      starter: '<main>\n  <h1>Dziennik questów</h1>\n  <section>\n    <h2>Smok w Górach Mroźnych</h2>\n    <p><strong>Cel:</strong> pokonaj <em>smoka</em> w jego legowisku.</p>\n    <p>Nagroda: Mikstura H2O <!-- TODO: zamień „H2O” na H<sub>2</sub>O --></p>\n  </section>\n  <!-- TODO: dodaj <hr> -->\n  <section>\n    <h2>Zaginiony wysłannik</h2>\n    <p>Znajdź gońca na starym trakcie.</p>\n  </section>\n</main>',
      solution: '<main>\n  <h1>Dziennik questów</h1>\n  <section>\n    <h2>Smok w Górach Mroźnych</h2>\n    <p><strong>Cel:</strong> pokonaj <em>smoka</em> w jego legowisku.</p>\n    <p>Nagroda: Mikstura H<sub>2</sub>O</p>\n  </section>\n  <hr>\n  <section>\n    <h2>Zaginiony wysłannik</h2>\n    <p>Znajdź gońca na starym trakcie.</p>\n  </section>\n</main>',
      checks: [
        ['elementExists', 'W akapicie zapisz „H2O” jako `H<sub>2</sub>O` — cyfra 2 w indeksie dolnym.', { selector: 'p > sub' }],
        ['elementExists', 'Między sekcjami questów dodaj tematyczny podział `<hr>`.', { selector: 'hr' }],
      ],
    },
    independent: {
      title: 'Zapiska o runach i kodach',
      goal: 'Uzupełnij zapiskę: oznacz kod „IDDQD” znacznikiem `<code>`, dodaj blok `<pre>` z `<code>` dla wielowierszowego zaklęcia, a skrót „HP” rozwiń przez `<abbr title="Punkty życia">`.',
      starter: '<main>\n  <h1>Kroniki zaklęć</h1>\n  <p>Sekretny kod IDDQD odblokowuje nieśmiertelność. <!-- TODO: otocz „IDDQD” znacznikiem <code> --></p>\n  <!-- TODO: dodaj blok <pre><code> z zaklęciem -->\n  <blockquote>\n    <p>Ten, kto czyta runy, nie boi się ciemności.</p>\n  </blockquote>\n  <p>Postać ma 100 HP. <!-- TODO: oznacz „HP” przez <abbr title="Punkty życia"> --></p>\n</main>',
      solution: '<main>\n  <h1>Kroniki zaklęć</h1>\n  <p>Sekretny kod <code>IDDQD</code> odblokowuje nieśmiertelność.</p>\n  <pre><code>IGNIS · ARDERE\nVIDE · LUX</code></pre>\n  <blockquote>\n    <p>Ten, kto czyta runy, nie boi się ciemności.</p>\n  </blockquote>\n  <p>Postać ma 100 <abbr title="Punkty życia">HP</abbr>.</p>\n</main>',
      checks: [
        ['elementExists', 'W akapicie oznacz kod „IDDQD” znacznikiem `<code>`.', { selector: 'p > code' }],
        ['textEquals', 'Wewnątrz `<code>` ma być fragment kodu „IDDQD”.', { selector: 'p > code', expected: 'IDDQD' }],
        ['elementExists', 'Dodaj blok `<pre>`, a w nim `<code>` z wielowierszowym zaklęciem.', { selector: 'pre > code' }],
        ['elementExists', 'Skrót „HP” oznacz przez `<abbr>` i rozwiń go w atrybucie `title`.', { selector: 'abbr[title]:not([title=""])' }],
      ],
    },
  },
  4: {
    guided: {
      goal: 'Plecak pokazuje przedmioty jako zwykłe akapity. Zamień je na listę nieuporządkowaną: otocz je `<ul>` i każdy zapisz w `<li>`.',
      steps: [
        'Znajdź trzy akapity `<p>` z przedmiotami w sekcji „Plecak”.',
        'Przed pierwszym przedmiotem otwórz `<ul>`, a po ostatnim zamknij `</ul>`.',
        'Każdy `<p>` zamień na `<li>`: `<li>`Miecz`</li>` zamiast `<p>`Miecz`</p>`.',
      ],
      starter: '<main>\n  <h1>Ekwipunek</h1>\n  <section id="bag">\n    <h2>Plecak</h2>\n    <!-- TODO: otocz przedmioty znacznikiem <ul>, każdy zamień na <li> -->\n    <p>Miecz</p>\n    <p>Tarcza</p>\n    <p>Mikstura</p>\n  </section>\n  <section>\n    <h2>Questy</h2>\n    <ol>\n      <li>Znajdź zaginionego wysłannika</li>\n      <li>Pokonaj smoka</li>\n    </ol>\n  </section>\n</main>',
      solution: '<main>\n  <h1>Ekwipunek</h1>\n  <section id="bag">\n    <h2>Plecak</h2>\n    <ul>\n      <li>Miecz</li>\n      <li>Tarcza</li>\n      <li>Mikstura</li>\n    </ul>\n  </section>\n  <section>\n    <h2>Questy</h2>\n    <ol>\n      <li>Znajdź zaginionego wysłannika</li>\n      <li>Pokonaj smoka</li>\n    </ol>\n  </section>\n</main>',
      checks: [
        ['elementExists', 'W sekcji `id="bag"` otocz przedmioty listą `<ul>` z punktami `<li>`.', { selector: '#bag > ul > li' }],
        ['elementExists', 'Lista w plecaku ma mieć co najmniej trzy punkty `<li>`.', { selector: '#bag ul > li:nth-child(3)' }],
      ],
    },
    modified: {
      title: 'Statystyki i podzadanie',
      goal: 'Dodaj w nowej sekcji słowniczek `<dl>` z parą `<dt>` „Siła” i `<dd>` (opis), a w jednym kroku `<ol>` podlistę `<ul>` z punktem `<li>`.',
      starter: '<main>\n  <h1>Ekwipunek</h1>\n  <section id="bag">\n    <h2>Plecak</h2>\n    <ul>\n      <li>Miecz</li>\n      <li>Tarcza</li>\n      <li>Mikstura</li>\n    </ul>\n  </section>\n  <section>\n    <h2>Questy</h2>\n    <ol>\n      <li>Znajdź zaginionego wysłannika</li>\n      <li>Pokonaj smoka<!-- TODO: dodaj <ul> z <li> w tym <li> --></li>\n    </ol>\n  </section>\n  <section>\n    <h2>Statystyki</h2>\n    <!-- TODO: dodaj <dl> z <dt>Siła</dt> i <dd> -->\n  </section>\n</main>',
      solution: '<main>\n  <h1>Ekwipunek</h1>\n  <section id="bag">\n    <h2>Plecak</h2>\n    <ul>\n      <li>Miecz</li>\n      <li>Tarcza</li>\n      <li>Mikstura</li>\n    </ul>\n  </section>\n  <section>\n    <h2>Questy</h2>\n    <ol>\n      <li>Znajdź zaginionego wysłannika</li>\n      <li>Pokonaj smoka\n        <ul><li>Zbierz zioła na miksturę</li></ul>\n      </li>\n    </ol>\n  </section>\n  <section>\n    <h2>Statystyki</h2>\n    <dl><dt>Siła</dt><dd>18 — zadajesz mocne ciosy</dd></dl>\n  </section>\n</main>',
      checks: [
        ['elementExists', 'W jednym kroku `<ol>` umieść podlistę `<ul>` z punktem `<li>` — zagnieżdżona lista w elemencie listy.', { selector: 'ol > li > ul > li' }],
        ['elementExists', 'W sekcji statystyk utwórz `<dl>` z terminem w `<dt>`.', { selector: 'dl > dt' }],
        ['elementExists', 'Bezpośrednio w tym samym `<dl>` dodaj opis terminu w `<dd>`.', { selector: 'dl > dd' }],
      ],
    },
    independent: {
      title: 'Receptura rzemieślnika',
      goal: 'Zbuduj recepturę: w sekcji `id="ingredients"` dodaj `<ul>` z co najmniej trzema składnikami `<li>`, a w sekcji `id="steps"` `<ol>` z co najmniej dwoma krokami `<li>` — jeden z podlistą `<ul>`.',
      starter: '<main>\n  <h1>Warsztat rzemieślnika</h1>\n  <section id="ingredients">\n    <h2>Składniki</h2>\n    <!-- TODO: dodaj <ul> z co najmniej 3 <li> -->\n  </section>\n  <section id="steps">\n    <h2>Kroki</h2>\n    <!-- TODO: dodaj <ol> z co najmniej 2 <li>, w jednym podlista <ul> -->\n  </section>\n</main>',
      solution: '<main>\n  <h1>Warsztat rzemieślnika</h1>\n  <section id="ingredients">\n    <h2>Składniki</h2>\n    <ul>\n      <li>Żelazny pręt</li>\n      <li>Smocza łuska</li>\n      <li>Mocny sznur</li>\n    </ul>\n  </section>\n  <section id="steps">\n    <h2>Kroki</h2>\n    <ol>\n      <li>Rozpal kuźnię\n        <ul><li>Użyj magicznego węgla</li></ul>\n      </li>\n      <li>Wykuj ostrze</li>\n    </ol>\n  </section>\n</main>',
      checks: [
        ['elementExists', 'W sekcji `id="ingredients"` utwórz `<ul>` z co najmniej trzema punktami `<li>`.', { selector: '#ingredients > ul > li:nth-child(3)' }],
        ['elementExists', 'W sekcji `id="steps"` dodaj `<ol>` z co najmniej dwoma krokami `<li>`.', { selector: '#steps > ol > li:nth-child(2)' }],
        ['elementExists', 'W jednym kroku numerowanej listy umieść podlistę `<ul>` z punktem `<li>`.', { selector: '#steps ol > li > ul > li' }],
      ],
    },
  },
  5: {
    guided: {
      goal: 'W menu głównym brakuje jednej pozycji. W pustym `<li>` dodaj link `<a href="#opcje">`Opcje`</a>` prowadzący do sekcji `id="opcje"`.',
      steps: [
        'Znajdź pusty punkt `<li>` w `<nav>` — to miejsce na link „Opcje”.',
        'Wpisz w nim `<a href="#opcje">`Opcje`</a>`.',
        'Sekcja `id="opcje"` już istnieje niżej — kliknięcie przewinie do niej stronę.',
      ],
      starter: '<nav>\n  <ul>\n    <li><a href="#gra">Graj</a></li>\n    <li><!-- TODO: dodaj link <a href="#opcje">Opcje</a> --></li>\n  </ul>\n</nav>\n<main>\n  <h1>Menu główne</h1>\n  <section id="gra"><h2>Graj</h2><p>Wróć do ostatniego zapisu.</p></section>\n  <section id="opcje"><h2>Opcje</h2><p>Dostrój dźwięk i sterowanie.</p></section>\n</main>',
      solution: '<nav>\n  <ul>\n    <li><a href="#gra">Graj</a></li>\n    <li><a href="#opcje">Opcje</a></li>\n  </ul>\n</nav>\n<main>\n  <h1>Menu główne</h1>\n  <section id="gra"><h2>Graj</h2><p>Wróć do ostatniego zapisu.</p></section>\n  <section id="opcje"><h2>Opcje</h2><p>Dostrój dźwięk i sterowanie.</p></section>\n</main>',
      checks: [
        ['elementExists', 'W `<nav>` dodaj link `<a href="#opcje">` prowadzący do sekcji `id="opcje"`.', { selector: 'nav a[href="#opcje"]' }],
        ['textEquals', 'Link w menu ma czytać „Opcje”.', { selector: 'nav a[href="#opcje"]', expected: 'Opcje' }],
      ],
    },
    modified: {
      title: 'Nowa pozycja i jej cel',
      goal: 'Dodaj w `<nav>` punkt `<li>` z linkiem `<a href="#zapis">`Zapis gry`</a>` oraz sekcję `<section id="zapis">` z nagłówkiem `<h2>`, do której link przeskoczy.',
      starter: '<nav>\n  <ul>\n    <li><a href="#gra">Graj</a></li>\n    <li><a href="#opcje">Opcje</a></li>\n    <!-- TODO: dodaj <li> z <a href="#zapis">Zapis gry</a> -->\n  </ul>\n</nav>\n<main>\n  <h1>Menu główne</h1>\n  <section id="gra"><h2>Graj</h2><p>Wróć do ostatniego zapisu.</p></section>\n  <section id="opcje"><h2>Opcje</h2><p>Dostrój dźwięk i sterowanie.</p></section>\n  <!-- TODO: dodaj <section id="zapis"> z <h2> -->\n</main>',
      solution: '<nav>\n  <ul>\n    <li><a href="#gra">Graj</a></li>\n    <li><a href="#opcje">Opcje</a></li>\n    <li><a href="#zapis">Zapis gry</a></li>\n  </ul>\n</nav>\n<main>\n  <h1>Menu główne</h1>\n  <section id="gra"><h2>Graj</h2><p>Wróć do ostatniego zapisu.</p></section>\n  <section id="opcje"><h2>Opcje</h2><p>Dostrój dźwięk i sterowanie.</p></section>\n  <section id="zapis"><h2>Zapis gry</h2><p>Postęp zapisuje się automatycznie.</p></section>\n</main>',
      checks: [
        ['elementExists', 'W `<nav>` dodaj punkt `<li>` z linkiem `<a href="#zapis">`.', { selector: 'nav ul li a[href="#zapis"]' }],
        ['elementExists', 'Dodaj `<section id="zapis">` — element, do którego prowadzi link.', { selector: 'main > section#zapis' }],
        ['elementExists', 'W sekcji `id="zapis"` umieść nagłówek `<h2>`.', { selector: 'section#zapis > h2' }],
      ],
    },
    independent: {
      title: 'Kontakt ze studiem',
      goal: 'Uzupełnij kartę kontaktu: w `<address>` dodaj linki `<a href="mailto:studio@smok.example">` i `<a href="tel:+48111222333">`, a niżej link `<a>` z `download` do pliku `/course-assets/html-gd/key-art.svg`.',
      starter: '<main>\n  <h1>Kontakt ze studiem</h1>\n  <address>\n    <!-- TODO: dodaj linki mailto: i tel: -->\n  </address>\n  <!-- TODO: dodaj link <a> z atrybutem download do key-art.svg -->\n</main>',
      solution: '<main>\n  <h1>Kontakt ze studiem</h1>\n  <address>\n    <a href="mailto:studio@smok.example">Napisz do studia</a>\n    <a href="tel:+48111222333">Zadzwoń</a>\n  </address>\n  <a href="/course-assets/html-gd/key-art.svg" download>Pobierz grafikę promocyjną</a>\n</main>',
      checks: [
        ['elementExists', 'W `<address>` dodaj link `<a>` z `href="mailto:studio@smok.example"` i czytelnym tekstem.', { selector: 'address > a[href="mailto:studio@smok.example"]' }],
        ['elementExists', 'W tym samym `<address>` dodaj link z `href="tel:+48111222333"`.', { selector: 'address > a[href="tel:+48111222333"]' }],
        ['elementExists', 'Dodaj link do /course-assets/html-gd/key-art.svg z atrybutem `download` i tekstem opisującym pobierany plik.', { selector: 'a[download][href="/course-assets/html-gd/key-art.svg"]' }],
      ],
    },
  },
  6: {
    guided: {
      goal: 'Ilustracja w galerii nie ma podpisu. W `<figure>` dodaj `<figcaption>` „Kluczowy art gry” pod obrazem.',
      steps: [
        'Znajdź komentarz `TODO` w elemencie `<figure>`, pod `<img>`.',
        'Wpisz tam `<figcaption>`Kluczowy art gry`</figcaption>`.',
        '`<figcaption>` wiąże podpis z obrazem — czytniki czytają je razem.',
      ],
      starter: '<main>\n  <h1>Galeria i trailer</h1>\n  <figure>\n    <img src="/course-assets/html-gd/key-art.svg" alt="Kluczowy art gry" width="240" height="160">\n    <!-- TODO: dodaj <figcaption> z podpisem -->\n  </figure>\n  <video controls><source src="trailer.mp4" type="video/mp4"></video>\n  <audio controls><source src="soundtrack.mp3" type="audio/mpeg"></audio>\n</main>',
      solution: '<main>\n  <h1>Galeria i trailer</h1>\n  <figure>\n    <img src="/course-assets/html-gd/key-art.svg" alt="Kluczowy art gry" width="240" height="160">\n    <figcaption>Kluczowy art gry</figcaption>\n  </figure>\n  <video controls><source src="trailer.mp4" type="video/mp4"></video>\n  <audio controls><source src="soundtrack.mp3" type="audio/mpeg"></audio>\n</main>',
      checks: [
        ['elementExists', 'W `<figure>` dodaj podpis obrazu w `<figcaption>`.', { selector: 'figure > figcaption' }],
        ['textEquals', 'Podpis ma brzmieć „Kluczowy art gry”.', { selector: 'figure > figcaption', expected: 'Kluczowy art gry' }],
      ],
    },
    modified: {
      title: 'Opis obrazu i soundtrack',
      goal: 'Dodaj niepusty `alt` do portreta rycerza oraz odtwarzacz `<audio controls>` z `<source src="soundtrack.mp3" type="audio/mpeg">`.',
      starter: '<main>\n  <h1>Galeria i trailer</h1>\n  <figure>\n    <img src="/course-assets/html-gd/key-art.svg" alt="Kluczowy art gry" width="240" height="160">\n    <figcaption>Kluczowy art gry</figcaption>\n  </figure>\n  <figure>\n    <img src="/course-assets/html-gd/hero-knight.svg" width="240" height="160"><!-- TODO: dodaj niepusty alt -->\n    <figcaption>Kael, rycerz Północy</figcaption>\n  </figure>\n  <video controls><source src="trailer.mp4" type="video/mp4"></video>\n  <!-- TODO: dodaj <audio controls> z <source src="soundtrack.mp3" type="audio/mpeg"> -->\n</main>',
      solution: '<main>\n  <h1>Galeria i trailer</h1>\n  <figure>\n    <img src="/course-assets/html-gd/key-art.svg" alt="Kluczowy art gry" width="240" height="160">\n    <figcaption>Kluczowy art gry</figcaption>\n  </figure>\n  <figure>\n    <img src="/course-assets/html-gd/hero-knight.svg" alt="Portret rycerza Kała" width="240" height="160">\n    <figcaption>Kael, rycerz Północy</figcaption>\n  </figure>\n  <video controls><source src="trailer.mp4" type="video/mp4"></video>\n  <audio controls><source src="soundtrack.mp3" type="audio/mpeg"></audio>\n</main>',
      checks: [
        ['elementExists', 'Drugi obraz ma mieć niepusty `alt` opisujący, co przedstawia.', { selector: 'figure:nth-of-type(2) > img[alt]:not([alt=""])' }],
        ['elementExists', 'Dodaj `<audio controls>` z `<source>` wskazującym plik ścieżki dźwiękowej.', { selector: 'audio[controls] > source' }],
      ],
    },
    independent: {
      title: 'Portrety bohaterów',
      goal: 'Dodaj drugą ilustrację: `<figure>` z portretem maga (`/course-assets/html-gd/hero-mage.svg`, `alt`, `width`, `height`, `loading="lazy"`) oraz jego `<figcaption>`.',
      starter: '<main>\n  <h1>Bohaterowie</h1>\n  <figure>\n    <img src="/course-assets/html-gd/hero-knight.svg" alt="Portret rycerza Kała" width="240" height="160">\n    <figcaption>Kael, rycerz Północy</figcaption>\n  </figure>\n  <!-- TODO: dodaj drugi <figure> z hero-mage.svg, loading="lazy" i <figcaption> -->\n</main>',
      solution: '<main>\n  <h1>Bohaterowie</h1>\n  <figure>\n    <img src="/course-assets/html-gd/hero-knight.svg" alt="Portret rycerza Kała" width="240" height="160">\n    <figcaption>Kael, rycerz Północy</figcaption>\n  </figure>\n  <figure>\n    <img src="/course-assets/html-gd/hero-mage.svg" alt="Portret czarodziejki Lyrii" width="240" height="160" loading="lazy">\n    <figcaption>Lyria, czarodziejka Łuku</figcaption>\n  </figure>\n</main>',
      checks: [
        ['elementExists', 'Drugi `<figure>` ma zawierać `<img>` z `alt`, `width`, `height` i `loading="lazy"`.', { selector: 'main > figure:nth-of-type(2) > img[alt]:not([alt=""])[width][height][loading="lazy"]' }],
        ['elementExists', 'Pod drugim portretem dodaj podpis w `<figcaption>`.', { selector: 'main > figure:nth-of-type(2) > figcaption' }],
      ],
    },
  },
  7: {
    guided: {
      goal: 'Ranking graczy nie ma tytułu. Jako pierwszy element `<table>` dodaj `<caption>` „Ranking graczy”.',
      steps: [
        'Znajdź komentarz `TODO` tuż po znaczniku `<table>`.',
        'Wpisz tam `<caption>`Ranking graczy`</caption>`.',
        '`<caption>` jest zawsze pierwszym dzieckiem tabeli — przed `<thead>`.',
      ],
      starter: '<table>\n  <!-- TODO: dodaj <caption>Ranking graczy</caption> -->\n  <thead><tr><th scope="col">Gracz</th><th scope="col">Punkty</th></tr></thead>\n  <tbody>\n    <tr><th scope="row">Wojownik77</th><td>4200</td></tr>\n    <tr><th scope="row">MagPL</th><td>3800</td></tr>\n    <tr><th scope="row">Łuczniczka</th><td>3100</td></tr>\n  </tbody>\n  <tfoot><tr><td colspan="2">Sezon 3</td></tr></tfoot>\n</table>',
      solution: '<table>\n  <caption>Ranking graczy</caption>\n  <thead><tr><th scope="col">Gracz</th><th scope="col">Punkty</th></tr></thead>\n  <tbody>\n    <tr><th scope="row">Wojownik77</th><td>4200</td></tr>\n    <tr><th scope="row">MagPL</th><td>3800</td></tr>\n    <tr><th scope="row">Łuczniczka</th><td>3100</td></tr>\n  </tbody>\n  <tfoot><tr><td colspan="2">Sezon 3</td></tr></tfoot>\n</table>',
      checks: [
        ['elementExists', 'W tabeli `<table>` dodaj tytuł w `<caption>`.', { selector: 'table > caption' }],
        ['textEquals', 'Tytuł tabeli ma brzmieć „Ranking graczy”.', { selector: 'table > caption', expected: 'Ranking graczy' }],
      ],
    },
    modified: {
      title: 'Nowy gracz w rankingu',
      goal: 'Druid_PL dołącza do rankingu: na końcu `<tbody>` dodaj wiersz `<tr>` z nagłówkiem `<th scope="row">Druid_PL</th>` i komórką `<td>2900</td>`.',
      starter: '<table>\n  <caption>Ranking graczy</caption>\n  <thead><tr><th scope="col">Gracz</th><th scope="col">Punkty</th></tr></thead>\n  <tbody>\n    <tr><th scope="row">Wojownik77</th><td>4200</td></tr>\n    <tr><th scope="row">MagPL</th><td>3800</td></tr>\n    <tr><th scope="row">Łuczniczka</th><td>3100</td></tr>\n    <!-- TODO: dodaj <tr> z <th scope="row">Druid_PL</th> i <td>2900</td> -->\n  </tbody>\n  <tfoot><tr><td colspan="2">Sezon 3</td></tr></tfoot>\n</table>',
      solution: '<table>\n  <caption>Ranking graczy</caption>\n  <thead><tr><th scope="col">Gracz</th><th scope="col">Punkty</th></tr></thead>\n  <tbody>\n    <tr><th scope="row">Wojownik77</th><td>4200</td></tr>\n    <tr><th scope="row">MagPL</th><td>3800</td></tr>\n    <tr><th scope="row">Łuczniczka</th><td>3100</td></tr>\n    <tr><th scope="row">Druid_PL</th><td>2900</td></tr>\n  </tbody>\n  <tfoot><tr><td colspan="2">Sezon 3</td></tr></tfoot>\n</table>',
      checks: [
        ['elementExists', 'Dodaj czwarty wiersz `<tr>` na końcu `<tbody>` — przed `</tbody>`.', { selector: 'tbody tr:nth-child(4)' }],
        ['elementExists', 'Wiersz zaczyna się od nagłówka `<th scope="row">` z pseudonimem gracza.', { selector: 'tbody tr:nth-child(4) > th[scope="row"]' }],
        ['elementExists', 'Po nagłówku dodaj komórkę `<td>` z punktami gracza.', { selector: 'tbody tr:nth-child(4) > td' }],
      ],
    },
    independent: {
      title: 'Porównanie broni',
      goal: 'Dokończ tabelę porównania broni: rozciągniętemu `<th colspan="2">` dodaj `scope="colgroup"`, a na końcu tabeli dodaj `<tfoot>` z komórką `<td colspan="2">` podsumowującą.',
      starter: '<table>\n  <caption>Porównanie broni</caption>\n  <thead>\n    <tr><th colspan="2">Broń <!-- TODO: dodaj scope="colgroup" --></th></tr>\n    <tr><th scope="col">Nazwa</th><th scope="col">Obrażenia</th></tr>\n  </thead>\n  <tbody>\n    <tr><th scope="row">Miecz smoka</th><td>90</td></tr>\n    <tr><th scope="row">Łuk runiczny</th><td>75</td></tr>\n  </tbody>\n  <!-- TODO: dodaj <tfoot> z <td colspan="2"> -->\n</table>',
      solution: '<table>\n  <caption>Porównanie broni</caption>\n  <thead>\n    <tr><th colspan="2" scope="colgroup">Broń</th></tr>\n    <tr><th scope="col">Nazwa</th><th scope="col">Obrażenia</th></tr>\n  </thead>\n  <tbody>\n    <tr><th scope="row">Miecz smoka</th><td>90</td></tr>\n    <tr><th scope="row">Łuk runiczny</th><td>75</td></tr>\n  </tbody>\n  <tfoot><tr><td colspan="2">Najlepszy wybór: Miecz smoka</td></tr></tfoot>\n</table>',
      checks: [
        ['elementExists', 'Nagłówkowi `<th colspan="2">` w `<thead>` dodaj `scope="colgroup"` — opisuje grupę kolumn.', { selector: 'thead th[colspan="2"][scope="colgroup"]' }],
        ['elementExists', 'Dodaj `<tfoot>` z wierszem zawierającym `<td colspan="2">` podsumowującą dane.', { selector: 'tfoot td[colspan="2"]' }],
      ],
    },
  },
  8: {
    guided: {
      goal: 'Pole e-mail nie ma etykiety. Nad `<input id="email">` dodaj `<label for="email">`E-mail konta`</label>`.',
      steps: [
        'Znajdź komentarz `TODO` nad `<input id="email">` w formularzu.',
        'Wpisz tam `<label for="email">`E-mail konta`</label>`.',
        'Wartość `for` musi odpowiadać `id` pola — kliknięcie etykiety aktywuje pole.',
      ],
      starter: '<form>\n  <fieldset>\n    <legend>Nowa postać</legend>\n    <label for="nick">Pseudonim</label>\n    <input id="nick" name="nick" type="text" required>\n    <!-- TODO: dodaj <label for="email">E-mail konta</label> -->\n    <input id="email" name="email" type="email" required>\n    <label for="klasa">Klasa</label>\n    <select id="klasa" name="klasa">\n      <option>Wojownik</option>\n      <option>Mag</option>\n      <option>Łucznik</option>\n    </select>\n    <label for="bio">Historia postaci</label>\n    <textarea id="bio" name="bio" required></textarea>\n    <button type="submit">Rozpocznij przygodę</button>\n  </fieldset>\n</form>',
      solution: '<form>\n  <fieldset>\n    <legend>Nowa postać</legend>\n    <label for="nick">Pseudonim</label>\n    <input id="nick" name="nick" type="text" required>\n    <label for="email">E-mail konta</label>\n    <input id="email" name="email" type="email" required>\n    <label for="klasa">Klasa</label>\n    <select id="klasa" name="klasa">\n      <option>Wojownik</option>\n      <option>Mag</option>\n      <option>Łucznik</option>\n    </select>\n    <label for="bio">Historia postaci</label>\n    <textarea id="bio" name="bio" required></textarea>\n    <button type="submit">Rozpocznij przygodę</button>\n  </fieldset>\n</form>',
      checks: [
        ['elementExists', 'Dodaj etykietę `<label for="email">` opisującą pole e-mail.', { selector: 'label[for="email"]' }],
        ['textEquals', 'Etykieta pola e-mail ma czytać „E-mail konta”.', { selector: 'label[for="email"]', expected: 'E-mail konta' }],
      ],
    },
    modified: {
      title: 'Poziom startowy',
      goal: 'Formularz ma dostać wybór poziomu: przed `<button>` dodaj `<label for="poziom">`Poziom startowy`</label>` i `<input id="poziom" name="poziom" type="number" min="1" max="20" required>`.',
      starter: '<form>\n  <fieldset>\n    <legend>Nowa postać</legend>\n    <label for="nick">Pseudonim</label>\n    <input id="nick" name="nick" type="text" required>\n    <label for="email">E-mail konta</label>\n    <input id="email" name="email" type="email" required>\n    <label for="klasa">Klasa</label>\n    <select id="klasa" name="klasa">\n      <option>Wojownik</option>\n      <option>Mag</option>\n      <option>Łucznik</option>\n    </select>\n    <label for="bio">Historia postaci</label>\n    <textarea id="bio" name="bio" required></textarea>\n    <!-- TODO: dodaj <label for="poziom">Poziom startowy</label> i <input id="poziom" name="poziom" type="number" min="1" max="20" required> -->\n    <button type="submit">Rozpocznij przygodę</button>\n  </fieldset>\n</form>',
      solution: '<form>\n  <fieldset>\n    <legend>Nowa postać</legend>\n    <label for="nick">Pseudonim</label>\n    <input id="nick" name="nick" type="text" required>\n    <label for="email">E-mail konta</label>\n    <input id="email" name="email" type="email" required>\n    <label for="klasa">Klasa</label>\n    <select id="klasa" name="klasa">\n      <option>Wojownik</option>\n      <option>Mag</option>\n      <option>Łucznik</option>\n    </select>\n    <label for="bio">Historia postaci</label>\n    <textarea id="bio" name="bio" required></textarea>\n    <label for="poziom">Poziom startowy</label>\n    <input id="poziom" name="poziom" type="number" min="1" max="20" required>\n    <button type="submit">Rozpocznij przygodę</button>\n  </fieldset>\n</form>',
      checks: [
        ['elementExists', 'Dodaj etykietę `<label for="poziom">` opisującą nowe pole.', { selector: 'label[for="poziom"]' }],
        ['textEquals', 'Etykieta ma czytać „Poziom startowy”.', { selector: 'label[for="poziom"]', expected: 'Poziom startowy' }],
        ['elementExists', 'Pole to liczba 1–20 i wymagana: `<input id="poziom" name="poziom" type="number" min="1" max="20" required>`.', { selector: 'input#poziom[type="number"][min="1"][max="20"][required]' }],
      ],
    },
    independent: {
      title: 'Ustawienia gry',
      goal: 'Dokończ formularz ustawień: dodaj `<label for="diff">`Poziom trudności`</label>` do pola liczbowego, `required` do checkboxa zgody i `<button type="submit">`Zapisz ustawienia`</button>`.',
      starter: '<form>\n  <fieldset>\n    <legend>Ustawienia gry</legend>\n    <label for="start">Start sezonu</label>\n    <input id="start" name="start" type="date" required>\n    <!-- TODO: dodaj <label for="diff">Poziom trudności</label> -->\n    <input id="diff" name="diff" type="number" min="1" max="6" required>\n    <label for="rules">Akceptuję regulamin</label>\n    <input id="rules" name="rules" type="checkbox"><!-- TODO: dodaj required -->\n    <!-- TODO: dodaj <button type="submit">Zapisz ustawienia</button> -->\n  </fieldset>\n</form>',
      solution: '<form>\n  <fieldset>\n    <legend>Ustawienia gry</legend>\n    <label for="start">Start sezonu</label>\n    <input id="start" name="start" type="date" required>\n    <label for="diff">Poziom trudności</label>\n    <input id="diff" name="diff" type="number" min="1" max="6" required>\n    <label for="rules">Akceptuję regulamin</label>\n    <input id="rules" name="rules" type="checkbox" required>\n    <button type="submit">Zapisz ustawienia</button>\n  </fieldset>\n</form>',
      checks: [
        ['elementExists', 'Dodaj etykietę `<label for="diff">` opisującą pole poziomu trudności.', { selector: 'label[for="diff"]' }],
        ['elementExists', 'Checkbox zgody ma być wymagany — dodaj `required` do `<input id="rules">`.', { selector: 'input#rules[required]' }],
        ['elementExists', 'Dodaj przycisk `<button type="submit">`Zapisz ustawienia`</button>`.', { selector: 'form button[type="submit"]' }],
        ['textEquals', 'Przycisk wysyłania ma czytać „Zapisz ustawienia”.', { selector: 'form button[type="submit"]', expected: 'Zapisz ustawienia' }],
      ],
    },
  },
  9: {
    guided: {
      goal: 'Link „Do treści” prowadzi do `id="main"`, ale główna treść jest w zwykłym `<div>`. Zamień `<div id="main">` na `<main id="main">` (razem ze znacznikiem zamykającym).',
      steps: [
        'Znajdź `<div id="main">` otaczający główną treść strony.',
        'Zamień znacznik otwierający na `<main id="main">`, a `</div>` na `</main>`.',
        'Teraz link `#main` i czytniki ekranu widzą prawdziwy obszar głównej treści.',
      ],
      starter: '<header>\n  <nav><a href="#main">Do treści</a></nav>\n</header>\n<!-- TODO: zamień <div id="main"> na <main id="main"> -->\n<div id="main">\n  <h1>Kroniki Smoka — premiera</h1>\n  <section><h2>Zapowiedź</h2><p>Gra dostępna już wkrótce.</p></section>\n</div>\n<footer><p>Studio Smok</p></footer>',
      solution: '<header>\n  <nav><a href="#main">Do treści</a></nav>\n</header>\n<main id="main">\n  <h1>Kroniki Smoka — premiera</h1>\n  <section><h2>Zapowiedź</h2><p>Gra dostępna już wkrótce.</p></section>\n</main>\n<footer><p>Studio Smok</p></footer>',
      checks: [
        ['elementExists', 'Zamień `<div id="main">` na `<main id="main">` — prawdziwy obszar głównej treści.', { selector: 'main#main' }],
        ['elementExists', 'Wewnątrz `<main>` zachowaj nagłówek `<h1>` i sekcję z treścią.', { selector: 'main#main > h1' }],
      ],
    },
    modified: {
      title: 'Data premiery i panel boczny',
      goal: 'W artykule z listą zmian oznacz datę przez `<time datetime="2026-11-14">`14 listopada 2026`</time>`, a za sekcją dodaj `<aside>` z nagłówkiem `<h2>` „Wymagania”.',
      starter: '<header>\n  <nav><a href="#main">Do treści</a></nav>\n</header>\n<main id="main">\n  <h1>Kroniki Smoka — premiera</h1>\n  <section>\n    <h2>Lista zmian</h2>\n    <article>\n      <h3>Poprawka 1.0.2</h3>\n      <!-- TODO: oznacz datę przez <time datetime="2026-11-14"> -->\n      <p>Naprawiono zapis w lochach.</p>\n    </article>\n  </section>\n  <!-- TODO: dodaj <aside> z <h2>Wymagania</h2> -->\n</main>\n<footer><p>Studio Smok</p></footer>',
      solution: '<header>\n  <nav><a href="#main">Do treści</a></nav>\n</header>\n<main id="main">\n  <h1>Kroniki Smoka — premiera</h1>\n  <section>\n    <h2>Lista zmian</h2>\n    <article>\n      <h3>Poprawka 1.0.2</h3>\n      <time datetime="2026-11-14">14 listopada 2026</time>\n      <p>Naprawiono zapis w lochach.</p>\n    </article>\n  </section>\n  <aside><h2>Wymagania</h2><p>Dowolna aktualna przeglądarka.</p></aside>\n</main>\n<footer><p>Studio Smok</p></footer>',
      checks: [
        ['elementExists', 'Oznacz datę poprawki znacznikiem `<time>` z atrybutem `datetime`.', { selector: 'article time[datetime]' }],
        ['elementExists', 'Za sekcją dodaj `<aside>` z nagłówkiem `<h2>` — treść poboczna.', { selector: 'aside > h2' }],
      ],
    },
    independent: {
      title: 'FAQ premiery',
      goal: 'Powiąż sekcję FAQ z jej nagłówkiem przez `aria-labelledby="faq-title"` i dodaj drugi element `<details>` z pytaniem w `<summary>` i odpowiedzią w `<p>`.',
      starter: '<header><h1>Kroniki Smoka — FAQ</h1></header>\n<main>\n  <section><!-- TODO: dodaj aria-labelledby="faq-title" -->\n    <h2 id="faq-title">FAQ</h2>\n    <details>\n      <summary>Jak zapisać grę?</summary>\n      <p>Naciśnij F5 — zapis jest automatyczny.</p>\n    </details>\n    <!-- TODO: dodaj drugi <details> z <summary> i <p> -->\n  </section>\n</main>\n<footer><p>Kontakt: studio@smok.example</p></footer>',
      solution: '<header><h1>Kroniki Smoka — FAQ</h1></header>\n<main>\n  <section aria-labelledby="faq-title">\n    <h2 id="faq-title">FAQ</h2>\n    <details>\n      <summary>Jak zapisać grę?</summary>\n      <p>Naciśnij F5 — zapis jest automatyczny.</p>\n    </details>\n    <details>\n      <summary>Czy gra działa offline?</summary>\n      <p>Tak — po pierwszym załadowaniu działa bez sieci.</p>\n    </details>\n  </section>\n</main>\n<footer><p>Kontakt: studio@smok.example</p></footer>',
      checks: [
        ['elementExists', 'Sekcję FAQ powiąż z nagłówkiem przez `aria-labelledby="faq-title"`.', { selector: 'main > section[aria-labelledby="faq-title"]' }],
        ['elementExists', 'Dodaj drugi element `<details>` z innym pytaniem w `<summary>`.', { selector: 'section > details:nth-of-type(2) > summary' }],
        ['elementExists', 'W drugim `<details>`, po `<summary>`, dodaj odpowiedź w `<p>`.', { selector: 'section > details:nth-of-type(2) > p' }],
      ],
    },
  },
};

export const htmlGdTaskHint = 'Znaczniki, np. `<main>` i `<p>`, wpisujesz jako kod HTML, a własny tekst między nimi: `<p>`Mój opis`</p>`. Komentarz `<!-- TODO: … -->` pokazuje miejsce zmiany — zamień go na właściwy kod. „Wewnątrz” oznacza między znacznikiem otwierającym i zamykającym.';
