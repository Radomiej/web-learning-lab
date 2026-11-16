import librarySeed from './phpLibrarySeed.js';

const escapeText = `function e($text) {
  return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
}`;

function profilePage(setup, content, title = 'Karta profilu') {
  return `<?php
${setup}
?>
<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
</head>
<body>
  <main>
    <article class="profile">
${content}
    </article>
  </main>
</body>
</html>
`;
}

// Wariant z już zdefiniowaną funkcją e() — dla receptur wołających e($x) w treści.
const pageE = (setup, content, title) => profilePage(`${escapeText}\n${setup}`, content, title);

const source = (value, file = 'index.php') =>
  ['sourceIncludes', `Użyj ${value} w pliku ${file}.`, { file, value }];
const text = (selector, expected) =>
  ['textEquals', `Pokaż „${expected}” w ${selector}.`, { selector, expected }];
const click = (expected) => [
  'interaction', `Po kliknięciu pokaż „${expected}”.`,
  { selector: '#action', resultSelector: '#result', expected: { beforeText: 'Kliknij przycisk.', textEquals: expected } },
];
// Wartość atrybutu ma wypisać PHP przez e() — stały tekst w data-* nie przejdzie.
const phpAttribute = (attribute, variable) => {
  const escaped = `\\${variable}`;
  return [
    'sourceMatches', `W atrybucie wypisz wartość PHP: ${attribute}="<?= e(${variable}) ?>".`,
    { file: 'index.php', pattern: `${attribute}="\\s*<\\?=\\s*e\\(${escaped}\\)\\s*\\?>\\s*"` },
  ];
};
// Zapis ma wystąpić w linii kodu, nie w komentarzu //.
const codeLine = (needle, label, pattern = needle.replace(/\./g, '\\.')) => [
  'sourceMatches', label,
  { file: 'index.php', flags: 'm', pattern: `^[ \\t]*(?!//)[^\\n]*${pattern}` },
];

const nameSetup = "$name = 'Ala';";
const nameCard = '      <h1><?= e($name) ?></h1>';
const bioCard = nameCard + '\n      <p id="bio"><?= e($bio) ?></p>';
const bioSetup = `${nameSetup}
$bio = '<b>Uczę się PHP</b>';
${escapeText}`;

function jsProfile(setup, attributes, action, script = '') {
  return profilePage(`${setup}
${escapeText}`, `      <h1><?= e($name) ?></h1>
      <button type="button" id="action" ${attributes}>${action}</button>
      <p id="result" aria-live="polite">Kliknij przycisk.</p>
      <script>
${script || '        // Dodaj obsługę kliknięcia.'}
      </script>`);
}

const nameAttribute = 'data-name="<?= e($name) ?>"';
const roleAttribute = 'data-role="<?= e($role) ?>"';

// Strona lekcji JSON: PHP osadza strukturę literałem w <script>.
function jsonPage(setup, script, { button = 'Pokaż', result = '<p id="result" aria-live="polite">Kliknij przycisk.</p>' } = {}) {
  return profilePage(setup, `      <h1>Karta profilu</h1>
      <button type="button" id="action">${button}</button>
      ${result}
      <script>
${script || '        // Dodaj obsługę kliknięcia.'}
      </script>`);
}

// Skrypt podglądu symuluje natywne wysłanie formularza: submit → fetch do pliku
// PHP (most fetch→php.wasm) → podmiana <body> na odpowiedź, jak przeładowanie.
// Na zwykłym hostingu przeglądarka sama wyśle POST do action — skryptu nie trzeba.
const formSubmitScript = `    <script>
  // Mechanizm laboratorium — nie jest częścią kodu PHP do nauki.
  document.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const params = new URLSearchParams(new FormData(form));
    const method = String(form.getAttribute('method') || 'get').toUpperCase();
    const action = form.getAttribute('action') || 'index.php';
    const response = await fetch(
      method === 'GET' ? action + '?' + params : action,
      method === 'GET' ? {} : { method, body: params });
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    document.title = doc.title;
    document.body.replaceChildren(...doc.body.childNodes);
  });
    </script>`;

// Strona z prawdziwym formularzem — submit działa w podglądzie przez skrypt wyżej.
function formPage(setup, content, title) {
  return `<?php
${setup}
?>
<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
</head>
<body>
  <main>
    <article class="profile">
${content}
    </article>
  </main>
${formSubmitScript}
</body>
</html>
`;
}

// json_encode musi przepuścić wartość przez flagi HEX — to nie jest e() i nie
// wolno osadzać czystego <?= $zmienna ?> w skrypcie.
const jsonFlags = (variable) => {
  const escaped = `\\${variable}`;
  return [
    'sourceMatches', `Osadź ${variable} przez json_encode z flagami JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT.`,
    { file: 'index.php', pattern: `json_encode\\(\\s*${escaped}[^)]*JSON_HEX_TAG[^)]*JSON_HEX_AMP[^)]*JSON_HEX_APOS[^)]*JSON_HEX_QUOT` },
  ];
};
// Struktura ma pochodzić z PHP, a nie z ręcznie wpisanego literału w skrypcie.
const notHandLiteral = (pattern, label) => [
  'sourceNotMatches', label, { file: 'index.php', flags: 'm', pattern },
];
const clickContains = (selector, resultSelector, expected, opts = {}) => [
  'interaction', `Po kliknięciu pokaż w ${resultSelector} „${expected}”.`,
  { selector, resultSelector, expected: { beforeText: 'Kliknij przycisk.', text: expected, ...opts } },
];
const listItems = () => [
  'elementExists', 'W #result są elementy <li> wyrenderowane przez skrypt.',
  { selector: '#result li' },
];

const jsonClick = (code) => `        const button = document.querySelector('#action');
        const result = document.querySelector('#result');
        button.addEventListener('click', () => {
${code}
        });`;

const booksSetup = `$ksiazki = [
  ['tytul' => 'Pan Tadeusz', 'rok' => 1834],
  ['tytul' => 'Lalka', 'rok' => 1890],
  ['tytul' => 'Ferdydurke', 'rok' => 1937],
];`;

const apiBooks = `<?php
header('Content-Type: application/json');
$ksiazki = [
  ['tytul' => 'Pan Tadeusz', 'rok' => 1834],
  ['tytul' => 'Lalka', 'rok' => 1890],
  ['tytul' => 'Ferdydurke', 'rok' => 1937],
];
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
  $rok = isset($_GET['rok']) ? (int) $_GET['rok'] : 0;
  $wyniki = $rok === 0 ? $ksiazki : array_values(array_filter($ksiazki, fn($k) => $k['rok'] === $rok));
  echo json_encode($wyniki);
  exit;
}
if ($method === 'POST') {
  $tytul = trim($_POST['tytul'] ?? '');
  echo json_encode(['ok' => true, 'wiadomosc' => "Dodano: {$tytul}"]);
  exit;
}
http_response_code(405);
echo json_encode(['error' => 'Dozwolone metody: GET, POST']);
`;

function fetchPage(script) {
  return `<?php
// Ta strona to klient — dane serwuje api.php przez fetch.
?>
<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Biblioteka na żywo</title>
</head>
<body>
  <main>
    <h1>Biblioteka na żywo</h1>
    <button type="button" id="action">Pokaż książki z 1834</button>
    <button type="button" id="action-post">Wyślij tytuł</button>
    <div id="result" aria-live="polite">Kliknij przycisk.</div>
    <script>
${script || '      // Dodaj obsługę kliknięć.'}
    </script>
  </main>
</body>
</html>
`;
}
const roleSetup = `${nameSetup}
$role = 'uczeń';`;
const jsClick = (code) => `        const button = document.querySelector('#action');
        const result = document.querySelector('#result');
        button.addEventListener('click', () => {
${code}
        });`;


// Baza w labie to prawdziwy plik SQLite obok kodu — PDO otwiera go wprost
// (new PDO('sqlite:…')), a przy pierwszym starcie seed z biblioteka.sql.
const sqliteConnect = `$db = new PDO('sqlite:' . $path);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);`;

const sqliteDbFile = (connection) => `<?php
$path = __DIR__ . '/biblioteka.sqlite';
$initialize = !is_file($path);
${connection}
if (isset($db)) {
  $db->exec('PRAGMA foreign_keys = ON');
  if ($initialize) {
    $db->exec(file_get_contents(__DIR__ . '/biblioteka.sql'));
  }
}
return $db ?? null;
`;

const solvedDbFile = sqliteDbFile(sqliteConnect);
const sqliteFiles = (dbFile) => ({ 'db.php': dbFile, 'biblioteka.sql': librarySeed });
const openDb = "$db = require __DIR__ . '/db.php';";

const libraryCountPage = profilePage(`${openDb}
$count = $db ? $db->query('SELECT COUNT(*) FROM ksiazki')->fetchColumn() : null;`, `      <h1>Książki w bazie</h1>
      <p id="result"><?= $count === null ? 'Uzupełnij połączenie w db.php.' : 'Książek: ' . $count ?></p>`, 'Biblioteka');

// Strona wyszukiwania: formularz GET ?rok= działa w podglądzie jak na hostingu —
// submit przez skrypt mostka wysyła nowe żądanie GET do index.php.
function librarySearchPage(query, item) {
  return formPage(`${openDb}
$year = (int) ($_GET['rok'] ?? 1834);
${query}
${escapeText}`, `      <h1>Książki według roku</h1>
      <form id="search" method="get" action="index.php">
        <label for="rok">Rok wydania</label>
        <input id="rok" name="rok" type="number" value="1834" required>
        <button type="submit">Szukaj</button>
      </form>
      <?php if ($books === []): ?>
        <p id="result">Brak pasujących książek.</p>
      <?php else: ?>
        <ul id="books">
          <?php foreach ($books as $book): ?>
            ${item}
          <?php endforeach; ?>
        </ul>
      <?php endif; ?>`, 'Biblioteka');
}

const yearQuery = `$query = $db->prepare('SELECT tytul FROM ksiazki WHERE rok_wydania = :rok ORDER BY id');
$query->execute(['rok' => $year]);
$books = $query->fetchAll(PDO::FETCH_ASSOC);`;
const joinQuery = `$query = $db->prepare('SELECT k.tytul, a.imie, a.nazwisko FROM ksiazki AS k JOIN autorzy AS a ON a.id = k.autor_id WHERE k.rok_wydania = :rok ORDER BY k.id');
$query->execute(['rok' => $year]);
$books = $query->fetchAll(PDO::FETCH_ASSOC);`;
const bookItem = `<li><?= e($book['tytul']) ?></li>`;
const joinItem = `<li><?= e($book['tytul'] . ' — ' . $book['imie'] . ' ' . $book['nazwisko']) ?></li>`;

// ── Lekcja 615: portal „Klatka” — kompletny, wielostronicowy projekt ──
// Jedna strona = jeden samodzielny plik PHP, bez include — styl i układ
// wzorowane na prawdziwej aplikacji katalogowej. Blok połączenia powtarza
// się na górze każdej strony: w labie DSN wskazuje SQLite w klatka.sqlite
// (auto-import z baza.sqlite.sql), na XAMPP uczeń zamienia jedną linię
// na mysql:… i importuje baza.sql w phpMyAdmin.

const klatkaConnect = `// ── Połączenie z bazą ──
// LAB: SQLite w pliku klatka.sqlite — tabele i dane założą się same
// z pliku baza.sqlite.sql przy pierwszym żądaniu.
// XAMPP: podmień $dsn na 'mysql:host=localhost;dbname=klatka;charset=utf8mb4'
//        (schemat i dane wklejasz wtedy raz w phpMyAdmin — plik baza.sql).
$dsn = 'sqlite:' . __DIR__ . '/klatka.sqlite';
$db = new PDO($dsn, 'root', '');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
if (str_starts_with($dsn, 'sqlite:')) {
  $db->exec('PRAGMA foreign_keys = ON');
  $tables = $db->query("SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'filmy'");
  if ((int) $tables->fetchColumn() === 0) {
    $db->exec(file_get_contents(__DIR__ . '/baza.sqlite.sql'));
  }
}
function e($text) {
  return htmlspecialchars((string) $text, ENT_QUOTES, 'UTF-8');
}
function inicjal($text) {
  return preg_match('/^./us', (string) $text, $m) ? $m[0] : '?';
}`;

// Wspólny nagłówek i stopka — w prawdziwym projekcie trafiłyby do
// header.php/footer.php; tu każda strona jest kompletna, więc markup
// powtarza się w każdym pliku (ustaw $activePage przed renderem).
const klatkaTop = (title) => `<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
<header class="site-header">
  <a class="brand" href="index.php" aria-label="Klatka — strona główna"><span class="brand-mark">K</span><span>KLATKA<span class="brand-period">.</span></span></a>
  <nav class="main-nav" aria-label="Nawigacja główna">
    <a class="<?= $activePage === 'filmy' ? 'is-active' : '' ?>" href="index.php">Filmy</a>
    <a class="<?= $activePage === 'aktorzy' ? 'is-active' : '' ?>" href="aktor.php">Aktorzy</a>
    <a class="nav-add" href="dodaj_film.php">+ Film</a>
    <a class="nav-add" href="dodaj_aktora.php">+ Aktor</a>
  </nav>
</header>
<main>`;

const klatkaBottom = `</main>
<footer class="site-footer">
  <a class="brand footer-brand" href="index.php"><span class="brand-mark">K</span><span>KLATKA<span class="brand-period">.</span></span></a>
  <p>Małe kino. Wielkie rozmowy.</p>
  <span class="footer-year">Klatka · projekt PHP + baza</span>
</footer>
</body>
</html>
`;

const klatkaIndex = `<?php
${klatkaConnect}

$activePage = 'filmy';
$q = trim((string) ($_GET['q'] ?? ''));
if ($q !== '') {
  $stmt = $db->prepare(
    "SELECT id, tytul, rok, gatunek, opis, plakat_url FROM filmy
     WHERE tytul LIKE :q OR gatunek LIKE :q OR opis LIKE :q
     ORDER BY rok DESC, tytul"
  );
  $stmt->execute(['q' => '%' . $q . '%']);
  $filmy = $stmt->fetchAll(PDO::FETCH_ASSOC);
} else {
  $filmy = $db->query(
    'SELECT id, tytul, rok, gatunek, opis, plakat_url FROM filmy ORDER BY rok DESC, tytul'
  )->fetchAll(PDO::FETCH_ASSOC);
}
?>
${klatkaTop('Klatka | Odkryj następny ulubiony film')}
<section class="catalog-hero">
  <div class="hero-copy">
    <p class="eyebrow"><span class="eyebrow-line"></span> Twoje miejsce w pierwszym rzędzie</p>
    <h1>Filmy, które<br><em>zostają</em> po napisach.</h1>
    <p class="hero-description">Katalog na prawdziwej bazie: wyszukuj seanse, dodawaj własne filmy i aktorów, zarządzaj obsadą.</p>
    <a class="text-link" href="#katalog">Przeglądaj katalog <span aria-hidden="true">↘</span></a>
  </div>
  <div class="hero-art" aria-hidden="true">
    <div class="poster-placeholder hero-placeholder"><span>K</span><small>KLATKA / KATALOG</small></div>
    <span class="hero-stamp">KINO<br>NA<br>WŁASNYCH<br>ZASADACH</span>
  </div>
</section>
<section class="catalog-section" id="katalog">
  <div class="section-topline"><span>Katalog filmów</span><span><?= count($filmy) ?> pozycji</span></div>
  <div class="catalog-heading">
    <div>
      <p class="eyebrow">Selekcja dla ciekawych</p>
      <h2>Wybierz swój seans<span class="brand-period">.</span></h2>
    </div>
    <form class="search-form" action="index.php#katalog" method="get" role="search">
      <label class="visually-hidden" for="film-search">Szukaj filmów</label>
      <input id="film-search" type="search" name="q" value="<?= e($q) ?>" placeholder="Tytuł, gatunek, opis…">
      <button type="submit" aria-label="Szukaj">⌕</button>
    </form>
  </div>
  <?php if ($filmy === []): ?>
    <div class="empty-state">
      <span class="empty-mark">⌕</span>
      <h3>Nie znaleźliśmy takiego filmu.</h3>
      <p>Spróbuj innego tytułu albo dodaj własny film przez „+ Film” w menu.</p>
    </div>
  <?php else: ?>
    <div class="film-grid">
      <?php foreach ($filmy as $index => $film): ?>
        <article class="film-card" style="--card-index: <?= (int) $index ?>">
          <a class="poster-link" href="film.php?id=<?= (int) $film['id'] ?>" aria-label="Szczegóły: <?= e($film['tytul']) ?>">
            <div class="poster-frame">
              <?php if (!empty($film['plakat_url'])): ?>
                <img src="<?= e($film['plakat_url']) ?>" alt="Plakat: <?= e($film['tytul']) ?>" loading="lazy">
              <?php else: ?>
                <div class="poster-placeholder"><span><?= e(inicjal($film['tytul'])) ?></span><small>KLATKA / <?= (int) $film['rok'] ?></small></div>
              <?php endif; ?>
              <span class="poster-number"><?= str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) ?></span>
              <span class="poster-arrow" aria-hidden="true">↗</span>
            </div>
          </a>
          <div class="film-meta"><span><?= (int) $film['rok'] ?></span><span class="meta-dot"></span><span><?= e($film['gatunek']) ?></span></div>
          <h3><a href="film.php?id=<?= (int) $film['id'] ?>"><?= e($film['tytul']) ?></a></h3>
          <p class="film-description"><?= e($film['opis']) ?></p>
        </article>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</section>
${klatkaBottom}
`;

const klatkaFilm = `<?php
${klatkaConnect}

$activePage = 'filmy';
$id = (int) ($_GET['id'] ?? 0);
$info = '';

// POST: przypnij albo odepnij aktora od tego filmu (tabela łącząca obsada).
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $id = (int) ($_POST['film_id'] ?? $id);
  $akcja = (string) ($_POST['akcja'] ?? '');
  $aktorId = (int) ($_POST['aktor_id'] ?? 0);
  if ($akcja === 'polacz' && $id > 0 && $aktorId > 0) {
    $rola = trim((string) ($_POST['rola'] ?? ''));
    $exists = $db->prepare('SELECT 1 FROM obsada WHERE film_id = :f AND aktor_id = :a');
    $exists->execute(['f' => $id, 'a' => $aktorId]);
    if ($exists->fetchColumn()) {
      $info = 'Ten aktor jest już w obsadzie.';
    } else {
      $db->prepare('INSERT INTO obsada (film_id, aktor_id, rola) VALUES (:f, :a, :r)')
        ->execute(['f' => $id, 'a' => $aktorId, 'r' => $rola !== '' ? $rola : null]);
      $info = 'Dopisano aktora do obsady.';
    }
  } elseif ($akcja === 'rozlacz' && $id > 0 && $aktorId > 0) {
    $db->prepare('DELETE FROM obsada WHERE film_id = :f AND aktor_id = :a')
      ->execute(['f' => $id, 'a' => $aktorId]);
    $info = 'Usunięto aktora z obsady.';
  }
}

$film = null;
$obsada = [];
$aktorzy = [];
if ($id > 0) {
  $query = $db->prepare('SELECT * FROM filmy WHERE id = :id');
  $query->execute(['id' => $id]);
  $film = $query->fetch(PDO::FETCH_ASSOC) ?: null;
  if ($film) {
    $cast = $db->prepare(
      'SELECT a.id, a.imie, a.nazwisko, o.rola
       FROM obsada AS o JOIN aktorzy AS a ON a.id = o.aktor_id
       WHERE o.film_id = :id ORDER BY a.nazwisko, a.imie'
    );
    $cast->execute(['id' => $id]);
    $obsada = $cast->fetchAll(PDO::FETCH_ASSOC);
    $aktorzy = $db->query('SELECT id, imie, nazwisko FROM aktorzy ORDER BY nazwisko, imie')
      ->fetchAll(PDO::FETCH_ASSOC);
  }
}
?>
${klatkaTop('Klatka | Film')}
<div class="detail-shell">
  <a class="back-link" href="index.php">← Wróć do katalogu</a>
  <?php if (!$film): ?>
    <div class="empty-state detail-empty">
      <span class="empty-mark">×</span>
      <h1>Nie znaleziono filmu.</h1>
      <p>Ten tytuł nie jest dostępny w katalogu.</p>
      <a class="button-link" href="index.php">Wróć do filmów</a>
    </div>
  <?php else: ?>
    <section class="film-detail">
      <div class="detail-poster">
        <?php if (!empty($film['plakat_url'])): ?>
          <img src="<?= e($film['plakat_url']) ?>" alt="Plakat: <?= e($film['tytul']) ?>">
        <?php else: ?>
          <div class="poster-placeholder detail-placeholder"><span><?= e(inicjal($film['tytul'])) ?></span><small>KLATKA / <?= (int) $film['rok'] ?></small></div>
        <?php endif; ?>
        <span class="poster-ribbon">KATALOG KLATKI</span>
      </div>
      <div class="detail-copy">
        <p class="eyebrow"><span class="eyebrow-line"></span> <?= e($film['gatunek']) ?> · <?= (int) $film['rok'] ?></p>
        <h1 id="film-title"><?= e($film['tytul']) ?><span class="brand-period">.</span></h1>
        <p class="detail-description"><?= nl2br(e($film['opis'])) ?></p>
        <a class="text-link" href="edytuj_film.php?id=<?= (int) $film['id'] ?>">Edytuj dane filmu <span aria-hidden="true">→</span></a>
        <div class="cast-block">
          <h2>Na ekranie</h2>
          <?php if ($info !== ''): ?>
            <p class="notice notice-success" id="info"><?= e($info) ?></p>
          <?php endif; ?>
          <?php if ($obsada === []): ?>
            <p class="muted-copy">Obsada nie została jeszcze dodana — przypisz pierwszego aktora poniżej.</p>
          <?php else: ?>
            <ul class="cast-list" id="obsada-list">
              <?php foreach ($obsada as $osoba): ?>
                <li>
                  <a href="aktor.php?id=<?= (int) $osoba['id'] ?>"><?= e($osoba['imie'] . ' ' . $osoba['nazwisko']) ?></a>
                  <span><?= e($osoba['rola'] ?: 'Obsada') ?></span>
                  <form method="post" action="film.php" class="inline-form">
                    <input type="hidden" name="akcja" value="rozlacz">
                    <input type="hidden" name="film_id" value="<?= (int) $id ?>">
                    <input type="hidden" name="aktor_id" value="<?= (int) $osoba['id'] ?>">
                    <button type="submit" class="link-button">usuń</button>
                  </form>
                </li>
              <?php endforeach; ?>
            </ul>
          <?php endif; ?>
          <form method="post" action="film.php" class="cast-add">
            <input type="hidden" name="akcja" value="polacz">
            <input type="hidden" name="film_id" value="<?= (int) $id ?>">
            <select name="aktor_id" aria-label="Aktor">
              <?php foreach ($aktorzy as $aktor): ?>
                <option value="<?= (int) $aktor['id'] ?>"><?= e($aktor['imie'] . ' ' . $aktor['nazwisko']) ?></option>
              <?php endforeach; ?>
            </select>
            <input name="rola" placeholder="Rola (opcjonalnie)">
            <button type="submit" class="submit-button">Dodaj do obsady</button>
          </form>
        </div>
      </div>
    </section>
  <?php endif; ?>
</div>
${klatkaBottom}
`;

const klatkaAktor = `<?php
${klatkaConnect}

$activePage = 'aktorzy';
$id = (int) ($_GET['id'] ?? 0);
$aktor = null;
$filmografia = [];
$aktorzy = [];
if ($id > 0) {
  $query = $db->prepare('SELECT * FROM aktorzy WHERE id = :id');
  $query->execute(['id' => $id]);
  $aktor = $query->fetch(PDO::FETCH_ASSOC) ?: null;
  if ($aktor) {
    $filmy = $db->prepare(
      'SELECT f.id, f.tytul, f.rok, f.gatunek, o.rola
       FROM obsada AS o JOIN filmy AS f ON f.id = o.film_id
       WHERE o.aktor_id = :id ORDER BY f.rok DESC'
    );
    $filmy->execute(['id' => $id]);
    $filmografia = $filmy->fetchAll(PDO::FETCH_ASSOC);
  }
} else {
  $aktorzy = $db->query(
    'SELECT a.id, a.imie, a.nazwisko, COUNT(o.film_id) AS ile
     FROM aktorzy AS a LEFT JOIN obsada AS o ON o.aktor_id = a.id
     GROUP BY a.id ORDER BY a.nazwisko, a.imie'
  )->fetchAll(PDO::FETCH_ASSOC);
}
?>
${klatkaTop('Klatka | Aktorzy')}
<section class="people-page">
  <div class="section-topline"><span>Indeks / Twórcy</span><span><?= $aktor ? 'Profil aktora' : 'Aktorzy' ?></span></div>
  <?php if ($id > 0 && !$aktor): ?>
    <div class="empty-state detail-empty">
      <span class="empty-mark">×</span>
      <h1>Nie znaleziono aktora.</h1>
      <p>Ta osoba nie jest dostępna w katalogu.</p>
      <a class="button-link" href="aktor.php">Wszyscy aktorzy</a>
    </div>
  <?php elseif ($aktor): ?>
    <a class="back-link" href="aktor.php">← Wszyscy aktorzy</a>
    <div class="person-profile">
      <div class="person-monogram"><?= e(inicjal($aktor['imie']) . inicjal($aktor['nazwisko'])) ?></div>
      <div>
        <p class="eyebrow">Osoba przed kamerą</p>
        <h1 id="actor-name"><?= e($aktor['imie'] . ' ' . $aktor['nazwisko']) ?><span class="brand-period">.</span></h1>
        <p class="person-bio"><?= $aktor['bio'] ? nl2br(e($aktor['bio'])) : 'Biografia tej osoby wkrótce pojawi się w katalogu.' ?></p>
      </div>
    </div>
    <div class="people-list-heading"><h2>Filmy w katalogu</h2><span><?= count($filmografia) ?> pozycji</span></div>
    <?php if ($filmografia === []): ?>
      <p class="muted-copy">Ta osoba nie ma jeszcze przypisanych filmów — dodaj ją do obsady na stronie filmu.</p>
    <?php else: ?>
      <div class="filmography">
        <?php foreach ($filmografia as $film): ?>
          <a class="filmography-row" href="film.php?id=<?= (int) $film['id'] ?>">
            <span class="filmography-year"><?= (int) $film['rok'] ?></span>
            <strong><?= e($film['tytul']) ?></strong>
            <span><?= e($film['rola'] ?: $film['gatunek']) ?></span>
            <span class="row-arrow">↗</span>
          </a>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  <?php else: ?>
    <div class="people-heading">
      <p class="eyebrow">Ludzie, których warto znać</p>
      <h1>Twarze opowieści<span class="brand-period">.</span></h1>
      <p>Aktorzy i aktorki, którzy zostają w pamięci na długo po seansie.</p>
    </div>
    <?php if ($aktorzy === []): ?>
      <div class="empty-state">
        <span class="empty-mark">✳</span>
        <h3>Indeks aktorów jest pusty.</h3>
        <p>Dodaj osoby przez „+ Aktor” w menu, by pojawiły się tutaj.</p>
      </div>
    <?php else: ?>
      <div class="actor-grid">
        <?php foreach ($aktorzy as $index => $osoba): ?>
          <a class="actor-card" style="--card-index: <?= (int) $index ?>" href="aktor.php?id=<?= (int) $osoba['id'] ?>">
            <span class="actor-initials"><?= e(inicjal($osoba['imie']) . inicjal($osoba['nazwisko'])) ?></span>
            <span class="actor-card-index"><?= str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) ?></span>
            <strong><?= e($osoba['imie'] . ' ' . $osoba['nazwisko']) ?></strong>
            <span><?= (int) $osoba['ile'] ?> filmów <i aria-hidden="true">↗</i></span>
          </a>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  <?php endif; ?>
</section>
${klatkaBottom}
`;

const klatkaDodajFilm = `<?php
${klatkaConnect}

$activePage = '';
$errors = [];
$added = '';
$addedId = 0;
$tytul = '';
$rok = '';
$gatunek = '';
$opis = '';
$plakat = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $tytul = trim((string) ($_POST['tytul'] ?? ''));
  $rok = (int) ($_POST['rok'] ?? 0);
  $gatunek = trim((string) ($_POST['gatunek'] ?? ''));
  $opis = trim((string) ($_POST['opis'] ?? ''));
  $plakat = trim((string) ($_POST['plakat_url'] ?? ''));
  if ($tytul === '') {
    $errors[] = 'Podaj tytuł filmu.';
  }
  if ($rok < 1888 || $rok > 2100) {
    $errors[] = 'Rok musi być liczbą z zakresu 1888–2100.';
  }
  if ($gatunek === '') {
    $errors[] = 'Podaj gatunek.';
  }
  if ($opis === '') {
    $errors[] = 'Napisz krótki opis filmu.';
  }
  if ($errors === []) {
    $stmt = $db->prepare(
      'INSERT INTO filmy (tytul, rok, gatunek, opis, plakat_url) VALUES (:t, :r, :g, :o, :p)'
    );
    $stmt->execute([
      't' => $tytul,
      'r' => $rok,
      'g' => $gatunek,
      'o' => $opis,
      'p' => $plakat !== '' ? $plakat : null,
    ]);
    $addedId = (int) $db->lastInsertId();
    $added = 'Dodano film „' . $tytul . '”.';
    $tytul = '';
    $rok = '';
    $gatunek = '';
    $opis = '';
    $plakat = '';
  }
}
?>
${klatkaTop('Klatka | Dodaj film')}
<div class="form-shell">
  <a class="back-link" href="index.php">← Wróć do katalogu</a>
  <div class="form-panel">
    <p class="eyebrow">Nowa pozycja w katalogu</p>
    <h1>Dodaj film<span class="brand-period">.</span></h1>
    <?php if ($added !== ''): ?>
      <p class="notice notice-success" id="added"><?= e($added) ?> <a href="film.php?id=<?= (int) $addedId ?>">Zobacz stronę filmu →</a></p>
    <?php endif; ?>
    <?php if ($errors !== []): ?>
      <div class="notice notice-error" id="errors"><ul><?php foreach ($errors as $blad): ?><li><?= e($blad) ?></li><?php endforeach; ?></ul></div>
    <?php endif; ?>
    <form class="film-form" method="post" action="dodaj_film.php">
      <label for="f-tytul">Tytuł</label>
      <input id="f-tytul" name="tytul" value="<?= e($tytul) ?>" required>
      <label for="f-rok">Rok <span class="label-hint">1888 — 2100</span></label>
      <input id="f-rok" name="rok" type="number" min="1888" max="2100" value="<?= e($rok) ?>" required>
      <label for="f-gatunek">Gatunek</label>
      <input id="f-gatunek" name="gatunek" value="<?= e($gatunek) ?>" placeholder="Dramat / Sci-fi…" required>
      <label for="f-plakat">Plakat <span class="label-hint">adres obrazka</span></label>
      <input id="f-plakat" name="plakat_url" value="<?= e($plakat) ?>" placeholder="https://images.unsplash.com/… albo img/plakat.jpg">
      <label for="f-opis">Opis</label>
      <textarea id="f-opis" name="opis" rows="5" required><?= e($opis) ?></textarea>
      <button class="submit-button" type="submit">Dodaj do katalogu <span aria-hidden="true">↗</span></button>
    </form>
    <p class="form-hint">Plakat to adres obrazka zapisany w bazie (kolumna plakat_url) — może być linkiem z portalu ze zdjęciami (Unsplash, Pexels) albo ścieżką do pliku w katalogu projektu, np. img/plakat.jpg. Strona renderuje go przez &lt;img&gt;.</p>
  </div>
</div>
${klatkaBottom}
`;

const klatkaDodajAktora = `<?php
${klatkaConnect}

$activePage = '';
$errors = [];
$added = '';
$addedId = 0;
$imie = '';
$nazwisko = '';
$bio = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $imie = trim((string) ($_POST['imie'] ?? ''));
  $nazwisko = trim((string) ($_POST['nazwisko'] ?? ''));
  $bio = trim((string) ($_POST['bio'] ?? ''));
  if ($imie === '' || $nazwisko === '') {
    $errors[] = 'Podaj imię i nazwisko aktora.';
  }
  if ($errors === []) {
    $stmt = $db->prepare('INSERT INTO aktorzy (imie, nazwisko, bio) VALUES (:i, :n, :b)');
    $stmt->execute(['i' => $imie, 'n' => $nazwisko, 'b' => $bio !== '' ? $bio : null]);
    $addedId = (int) $db->lastInsertId();
    $added = 'Dodano aktora: ' . $imie . ' ' . $nazwisko . '.';
    $imie = '';
    $nazwisko = '';
    $bio = '';
  }
}
?>
${klatkaTop('Klatka | Dodaj aktora')}
<div class="form-shell">
  <a class="back-link" href="aktor.php">← Wszyscy aktorzy</a>
  <div class="form-panel">
    <p class="eyebrow">Nowa osoba w indeksie</p>
    <h1>Dodaj aktora<span class="brand-period">.</span></h1>
    <?php if ($added !== ''): ?>
      <p class="notice notice-success" id="added"><?= e($added) ?> <a href="aktor.php?id=<?= (int) $addedId ?>">Zobacz profil →</a></p>
    <?php endif; ?>
    <?php if ($errors !== []): ?>
      <div class="notice notice-error" id="errors"><ul><?php foreach ($errors as $blad): ?><li><?= e($blad) ?></li><?php endforeach; ?></ul></div>
    <?php endif; ?>
    <form class="film-form" method="post" action="dodaj_aktora.php">
      <label for="a-imie">Imię</label>
      <input id="a-imie" name="imie" value="<?= e($imie) ?>" required>
      <label for="a-nazwisko">Nazwisko</label>
      <input id="a-nazwisko" name="nazwisko" value="<?= e($nazwisko) ?>" required>
      <label for="a-bio">Biografia <span class="label-hint">opcjonalnie</span></label>
      <textarea id="a-bio" name="bio" rows="4" placeholder="Kilka zdań o osobie…"><?= e($bio) ?></textarea>
      <button class="submit-button" type="submit">Dodaj do indeksu <span aria-hidden="true">↗</span></button>
    </form>
    <p class="form-hint">Nowa osoba trafia do tabeli aktorzy — od razu możesz przypisać ją do filmu na jego stronie (sekcja „Na ekranie”).</p>
  </div>
</div>
${klatkaBottom}
`;

const klatkaEdytujFilm = `<?php
${klatkaConnect}

$activePage = '';
$errors = [];
$added = '';
$id = (int) ($_POST['id'] ?? $_GET['id'] ?? 0);
$film = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $tytul = trim((string) ($_POST['tytul'] ?? ''));
  $rok = (int) ($_POST['rok'] ?? 0);
  $gatunek = trim((string) ($_POST['gatunek'] ?? ''));
  $opis = trim((string) ($_POST['opis'] ?? ''));
  $plakat = trim((string) ($_POST['plakat_url'] ?? ''));
  if ($tytul === '') {
    $errors[] = 'Podaj tytuł filmu.';
  }
  if ($rok < 1888 || $rok > 2100) {
    $errors[] = 'Rok musi być liczbą z zakresu 1888–2100.';
  }
  if ($gatunek === '') {
    $errors[] = 'Podaj gatunek.';
  }
  if ($errors === []) {
    $stmt = $db->prepare(
      'UPDATE filmy SET tytul = :t, rok = :r, gatunek = :g, opis = :o, plakat_url = :p WHERE id = :id'
    );
    $stmt->execute([
      't' => $tytul,
      'r' => $rok,
      'g' => $gatunek,
      'o' => $opis,
      'p' => $plakat !== '' ? $plakat : null,
      'id' => $id,
    ]);
    $added = 'Zapisano zmiany w filmie „' . $tytul . '”.';
  } else {
    $film = ['id' => $id, 'tytul' => $tytul, 'rok' => $rok, 'gatunek' => $gatunek, 'opis' => $opis, 'plakat_url' => $plakat];
  }
}
if (!$film && $id > 0) {
  $query = $db->prepare('SELECT * FROM filmy WHERE id = :id');
  $query->execute(['id' => $id]);
  $film = $query->fetch(PDO::FETCH_ASSOC) ?: null;
}
?>
${klatkaTop('Klatka | Edytuj film')}
<div class="form-shell">
  <a class="back-link" href="<?= $film ? 'film.php?id=' . (int) $film['id'] : 'index.php' ?>">← Wróć</a>
  <?php if (!$film): ?>
    <div class="empty-state detail-empty">
      <span class="empty-mark">×</span>
      <h1>Nie znaleziono filmu.</h1>
      <p>Wybierz film do edycji na jego stronie — link „Edytuj dane filmu”.</p>
      <a class="button-link" href="index.php">Wróć do katalogu</a>
    </div>
  <?php else: ?>
    <div class="form-panel">
      <p class="eyebrow">Edycja pozycji #<?= (int) $film['id'] ?></p>
      <h1>Edytuj film<span class="brand-period">.</span></h1>
      <?php if ($added !== ''): ?>
        <p class="notice notice-success" id="added"><?= e($added) ?> <a href="film.php?id=<?= (int) $id ?>">Zobacz stronę filmu →</a></p>
      <?php endif; ?>
      <?php if ($errors !== []): ?>
        <div class="notice notice-error" id="errors"><ul><?php foreach ($errors as $blad): ?><li><?= e($blad) ?></li><?php endforeach; ?></ul></div>
      <?php endif; ?>
      <form class="film-form" method="post" action="edytuj_film.php">
        <input type="hidden" name="id" value="<?= (int) $film['id'] ?>">
        <label for="e-tytul">Tytuł</label>
        <input id="e-tytul" name="tytul" value="<?= e($film['tytul']) ?>" required>
        <label for="e-rok">Rok <span class="label-hint">1888 — 2100</span></label>
        <input id="e-rok" name="rok" type="number" min="1888" max="2100" value="<?= (int) $film['rok'] ?>" required>
        <label for="e-gatunek">Gatunek</label>
        <input id="e-gatunek" name="gatunek" value="<?= e($film['gatunek']) ?>" required>
        <label for="e-plakat">Plakat <span class="label-hint">adres obrazka</span></label>
        <input id="e-plakat" name="plakat_url" value="<?= e($film['plakat_url']) ?>" placeholder="https://… albo img/plakat.jpg">
        <label for="e-opis">Opis</label>
        <textarea id="e-opis" name="opis" rows="6" required><?= e($film['opis']) ?></textarea>
        <button class="submit-button" type="submit">Zapisz zmiany <span aria-hidden="true">↗</span></button>
      </form>
      <p class="form-hint">Formularz jest wypełniony danymi z bazy — UPDATE podmienia rekord o kluczu id przesłanym w ukrytym polu.</p>
    </div>
  <?php endif; ?>
</div>
${klatkaBottom}
`;

// Dwa dialekty tego samego schematu: baza.sql wklejasz w phpMyAdmin (MySQL),
// baza.sqlite.sql importuje się sama przy pierwszym żądaniu w labie.
const klatkaSchemaMysql = `-- KLATKA — schemat i dane startowe (MySQL)
-- Wklej całość w phpMyAdmin → zakładka SQL → Wykonaj.
CREATE DATABASE IF NOT EXISTS klatka CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci;
USE klatka;

CREATE TABLE IF NOT EXISTS filmy (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tytul VARCHAR(180) NOT NULL,
  rok SMALLINT UNSIGNED NOT NULL,
  gatunek VARCHAR(80) NOT NULL,
  opis TEXT NOT NULL,
  plakat_url VARCHAR(500) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS aktorzy (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  imie VARCHAR(80) NOT NULL,
  nazwisko VARCHAR(100) NOT NULL,
  bio TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS obsada (
  film_id INT UNSIGNED NOT NULL,
  aktor_id INT UNSIGNED NOT NULL,
  rola VARCHAR(120) NULL,
  PRIMARY KEY (film_id, aktor_id),
  CONSTRAINT fk_obsada_film FOREIGN KEY (film_id) REFERENCES filmy(id) ON DELETE CASCADE,
  CONSTRAINT fk_obsada_aktor FOREIGN KEY (aktor_id) REFERENCES aktorzy(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO filmy (id, tytul, rok, gatunek, opis, plakat_url) VALUES
(1, 'Wielki błękit', 1988, 'Dramat', 'Dwaj przyjaciele, których od dzieciństwa łączy pasja do nurkowania, stają naprzeciw własnym ambicjom i granicom ludzkich możliwości.', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=80'),
(2, 'Między słowami', 2003, 'Dramat / Romans', 'W Tokio spotykają się dwie zagubione osoby. Krótka znajomość staje się cichą opowieścią o bliskości, samotności i tym, czego nie umiemy powiedzieć.', 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80'),
(3, 'Amelia', 2001, 'Komedia / Romans', 'Nieśmiała paryżanka postanawia odmienić życie ludzi wokół siebie. Przy okazji odkrywa, że na własne szczęście też trzeba czasem zapracować.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80'),
(4, 'Na rauszu', 2020, 'Dramat / Komedia', 'Czterech nauczycieli testuje teorię o idealnym poziomie alkoholu we krwi. Eksperyment szybko zaczyna dotyczyć czegoś więcej niż szkolnych lekcji.', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80'),
(5, 'Wszystko wszędzie naraz', 2022, 'Sci-fi / Przygodowy', 'Właścicielka pralni trafia do wieloświata pełnego alternatywnych wersji własnego życia. Najważniejsza misja czeka jednak tu, w domu.', 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80'),
(6, 'Perfect Days', 2023, 'Dramat', 'Hirayama odnajduje sens w codziennym rytmie Tokio: muzyce, książkach, drzewach i drobnych spotkaniach, które składają się na pełne życie.', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80');

INSERT INTO aktorzy (id, imie, nazwisko, bio) VALUES
(1, 'Jean-Marc', 'Barr', 'Francusko-amerykański aktor i reżyser, znany z ról w europejskim kinie autorskim.'),
(2, 'Rosanna', 'Arquette', 'Amerykańska aktorka i reżyserka, która od dekad współpracuje z twórcami kina niezależnego.'),
(3, 'Bill', 'Murray', 'Amerykański aktor i komik, którego styl łączy subtelny humor z melancholią.'),
(4, 'Scarlett', 'Johansson', 'Amerykańska aktorka i reżyserka, laureatka nagród za role filmowe i teatralne.'),
(5, 'Audrey', 'Tautou', 'Francuska aktorka, rozpoznawalna dzięki rolom w kinie francuskim i międzynarodowym.'),
(6, 'Mads', 'Mikkelsen', 'Duński aktor filmowy i teatralny, występujący w produkcjach skandynawskich i międzynarodowych.'),
(7, 'Michelle', 'Yeoh', 'Malezyjska aktorka, znana z ról dramatycznych, kina akcji oraz produkcji międzynarodowych.'),
(8, 'Ke', 'Huy Quan', 'Amerykański aktor i kaskader, który powrócił do kina po kilkunastoletniej przerwie.'),
(9, 'Koji', 'Yakusho', 'Japoński aktor filmowy i teatralny, ceniony za role w kinie współczesnym.'),
(10, 'Miki', 'Nakatani', 'Japońska aktorka i piosenkarka, występująca w filmach i serialach telewizyjnych.');

INSERT INTO obsada (film_id, aktor_id, rola) VALUES
(1, 1, 'Jacques Mayol'), (1, 2, 'Johana Baker'),
(2, 3, 'Bob Harris'), (2, 4, 'Charlotte'),
(3, 5, 'Amélie Poulain'),
(4, 6, 'Martin'),
(5, 7, 'Evelyn Wang'), (5, 8, 'Waymond Wang'),
(6, 9, 'Hirayama'), (6, 10, 'Keiko');
`;

const klatkaSchemaSqlite = `CREATE TABLE IF NOT EXISTS filmy (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tytul TEXT NOT NULL,
  rok INTEGER NOT NULL CHECK (rok BETWEEN 1888 AND 2100),
  gatunek TEXT NOT NULL,
  opis TEXT NOT NULL,
  plakat_url TEXT
);
CREATE TABLE IF NOT EXISTS aktorzy (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  imie TEXT NOT NULL,
  nazwisko TEXT NOT NULL,
  bio TEXT
);
CREATE TABLE IF NOT EXISTS obsada (
  film_id INTEGER NOT NULL REFERENCES filmy(id) ON DELETE CASCADE,
  aktor_id INTEGER NOT NULL REFERENCES aktorzy(id) ON DELETE CASCADE,
  rola TEXT,
  PRIMARY KEY (film_id, aktor_id)
);
INSERT OR IGNORE INTO filmy (id, tytul, rok, gatunek, opis, plakat_url) VALUES
(1, 'Wielki błękit', 1988, 'Dramat', 'Dwaj przyjaciele, których od dzieciństwa łączy pasja do nurkowania, stają naprzeciw własnym ambicjom i granicom ludzkich możliwości.', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=80'),
(2, 'Między słowami', 2003, 'Dramat / Romans', 'W Tokio spotykają się dwie zagubione osoby. Krótka znajomość staje się cichą opowieścią o bliskości, samotności i tym, czego nie umiemy powiedzieć.', 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80'),
(3, 'Amelia', 2001, 'Komedia / Romans', 'Nieśmiała paryżanka postanawia odmienić życie ludzi wokół siebie. Przy okazji odkrywa, że na własne szczęście też trzeba czasem zapracować.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80'),
(4, 'Na rauszu', 2020, 'Dramat / Komedia', 'Czterech nauczycieli testuje teorię o idealnym poziomie alkoholu we krwi. Eksperyment szybko zaczyna dotyczyć czegoś więcej niż szkolnych lekcji.', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80'),
(5, 'Wszystko wszędzie naraz', 2022, 'Sci-fi / Przygodowy', 'Właścicielka pralni trafia do wieloświata pełnego alternatywnych wersji własnego życia. Najważniejsza misja czeka jednak tu, w domu.', 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80'),
(6, 'Perfect Days', 2023, 'Dramat', 'Hirayama odnajduje sens w codziennym rytmie Tokio: muzyce, książkach, drzewach i drobnych spotkaniach, które składają się na pełne życie.', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80');
INSERT OR IGNORE INTO aktorzy (id, imie, nazwisko, bio) VALUES
(1, 'Jean-Marc', 'Barr', 'Francusko-amerykański aktor i reżyser, znany z ról w europejskim kinie autorskim.'),
(2, 'Rosanna', 'Arquette', 'Amerykańska aktorka i reżyserka, która od dekad współpracuje z twórcami kina niezależnego.'),
(3, 'Bill', 'Murray', 'Amerykański aktor i komik, którego styl łączy subtelny humor z melancholią.'),
(4, 'Scarlett', 'Johansson', 'Amerykańska aktorka i reżyserka, laureatka nagród za role filmowe i teatralne.'),
(5, 'Audrey', 'Tautou', 'Francuska aktorka, rozpoznawalna dzięki rolom w kinie francuskim i międzynarodowym.'),
(6, 'Mads', 'Mikkelsen', 'Duński aktor filmowy i teatralny, występujący w produkcjach skandynawskich i międzynarodowych.'),
(7, 'Michelle', 'Yeoh', 'Malezyjska aktorka, znana z ról dramatycznych, kina akcji oraz produkcji międzynarodowych.'),
(8, 'Ke', 'Huy Quan', 'Amerykański aktor i kaskader, który powrócił do kina po kilkunastoletniej przerwie.'),
(9, 'Koji', 'Yakusho', 'Japoński aktor filmowy i teatralny, ceniony za role w kinie współczesnym.'),
(10, 'Miki', 'Nakatani', 'Japońska aktorka i piosenkarka, występująca w filmach i serialach telewizyjnych.');
INSERT OR IGNORE INTO obsada (film_id, aktor_id, rola) VALUES
(1, 1, 'Jacques Mayol'), (1, 2, 'Johana Baker'),
(2, 3, 'Bob Harris'), (2, 4, 'Charlotte'),
(3, 5, 'Amélie Poulain'),
(4, 6, 'Martin'),
(5, 7, 'Evelyn Wang'), (5, 8, 'Waymond Wang'),
(6, 9, 'Hirayama'), (6, 10, 'Keiko');
`;

// Ciemny, wydawniczy styl wzorowany na oryginalnej Klatce — ten sam plik
// kopiujesz do htdocs obok stron .php.
const klatkaStyles = `:root {
  --ink: #171a18;
  --ink-soft: #202522;
  --paper: #f0efe8;
  --paper-dim: #b7bbb1;
  --lime: #d8f56a;
  --coral: #ef8567;
  --line: rgba(240, 239, 232, .16);
  --font-body: 'Segoe UI', 'DM Sans', system-ui, sans-serif;
  --font-display: 'Segoe UI', 'Space Grotesk', system-ui, sans-serif;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--ink); color: var(--paper); font-family: var(--font-body); font-size: 15px; line-height: 1.55; }
a { color: inherit; text-decoration: none; }
a:hover { color: var(--lime); }
button, input, textarea, select { font: inherit; }
h1, h2, h3, p { margin-top: 0; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

/* ── Nagłówek i nawigacja ── */
.site-header { height: 82px; padding: 0 6.2%; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); position: relative; z-index: 2; }
.brand { display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-display); font-size: 16px; font-weight: 700; letter-spacing: 1.6px; }
.brand-mark { width: 28px; height: 28px; background: var(--lime); color: var(--ink); display: grid; place-items: center; font-size: 16px; font-weight: 700; }
.brand-period { color: var(--lime); }
.main-nav { display: flex; gap: 34px; height: 100%; align-items: center; }
.main-nav a { height: 100%; display: flex; align-items: center; color: #a6aaa2; font-size: 13px; border-bottom: 2px solid transparent; }
.main-nav a:hover, .main-nav a.is-active { color: var(--paper); border-color: var(--lime); }
.main-nav .nav-add { color: var(--lime); font-weight: 600; }

/* ── Hero i katalog ── */
.catalog-hero { min-height: 420px; padding: 60px 6.2% 64px; display: grid; grid-template-columns: 1fr 1.06fr; gap: 6.5%; align-items: center; }
.eyebrow { display: flex; align-items: center; gap: 10px; text-transform: uppercase; letter-spacing: 1.4px; font-size: 10px; color: var(--lime); font-weight: 600; margin: 0 0 20px; }
.eyebrow-line { height: 1px; width: 25px; background: var(--lime); }
.hero-copy h1 { font: 500 clamp(40px, 5vw, 66px)/1.02 var(--font-display); margin: 0 0 22px; }
.hero-copy h1 em { font-family: Georgia, serif; font-weight: 400; color: var(--lime); }
.hero-description { max-width: 380px; color: #afb3aa; font-size: 15px; line-height: 1.8; margin: 0 0 29px; }
.text-link { display: inline-flex; align-items: center; gap: 16px; padding-bottom: 7px; border-bottom: 1px solid var(--lime); font-size: 12px; font-weight: 600; }
.text-link span { font-size: 18px; color: var(--lime); }
.hero-art { height: 340px; position: relative; overflow: hidden; background: #343935; }
.hero-placeholder { height: 100%; }
.hero-stamp { position: absolute; top: 20px; right: 20px; border: 1px solid rgba(240,239,232,.7); padding: 10px 12px; color: #fff; font-size: 9px; line-height: 1.45; letter-spacing: 1.5px; text-align: center; transform: rotate(5deg); }
.catalog-section { padding: 36px 6.2% 80px; border-top: 1px solid var(--line); }
.section-topline { display: flex; justify-content: space-between; text-transform: uppercase; letter-spacing: 1.3px; font-size: 9px; color: #8f968d; padding-bottom: 20px; border-bottom: 1px solid var(--line); }
.catalog-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; padding: 40px 0 30px; flex-wrap: wrap; }
.catalog-heading .eyebrow, .people-heading .eyebrow { margin-bottom: 11px; }
.catalog-heading h2 { font: 500 36px/1.1 var(--font-display); margin: 0; }
.search-form { display: flex; align-items: center; border-bottom: 1px solid #6d746a; width: min(330px, 100%); }
.search-form input { width: 100%; border: 0; background: transparent; color: var(--paper); padding: 11px 5px; outline: none; font-size: 12px; }
.search-form input::placeholder { color: #858c82; }
.search-form button { width: 38px; height: 38px; border: 0; background: transparent; color: var(--lime); font-size: 28px; cursor: pointer; }
.film-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 44px 24px; }
.film-card { min-width: 0; animation: rise-in .5s both; animation-delay: calc(var(--card-index) * .07s); }
.poster-link { display: block; }
.poster-frame { position: relative; height: clamp(245px, 31vw, 400px); overflow: hidden; background: #292f2b; }
.poster-frame img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .65s cubic-bezier(.2,.7,.2,1), filter .4s; filter: saturate(.78); }
.poster-link:hover img { transform: scale(1.045); filter: saturate(1); }
.poster-number { position: absolute; top: 14px; left: 15px; font: 11px var(--font-display); color: #fff; text-shadow: 0 1px 5px #000; }
.poster-arrow { position: absolute; bottom: 14px; right: 14px; width: 34px; height: 34px; border-radius: 50%; background: var(--lime); color: var(--ink); display: grid; place-items: center; opacity: 0; transform: translateY(4px); transition: .2s; }
.poster-link:hover .poster-arrow { opacity: 1; transform: translateY(0); }
.poster-placeholder { height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background: radial-gradient(ellipse at 50% 70%, #575f45, #252b27 64%); color: var(--lime); }
.poster-placeholder > span { font: 300 108px/.9 Georgia, serif; }
.poster-placeholder small { margin-top: 18px; color: #d6d7cd; font-size: 8px; letter-spacing: 2px; }
.film-meta { display: flex; align-items: center; gap: 8px; color: #9da39a; font-size: 10px; margin-top: 16px; }
.meta-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--coral); }
.film-card h3 { font: 600 19px/1.3 var(--font-display); margin: 6px 0; }
.film-card h3 a:hover { color: var(--lime); }
.film-description { font-size: 12px; color: #9fa59c; line-height: 1.7; margin: 0; min-height: 41px; }

/* ── Strona filmu ── */
.detail-shell, .form-shell { padding: 35px 9% 80px; max-width: 1280px; margin: auto; }
.back-link { display: inline-flex; gap: 10px; color: #a8ada4; font-size: 12px; margin: 0 0 27px; }
.back-link:first-letter { color: var(--lime); }
.film-detail { display: grid; grid-template-columns: minmax(230px, .75fr) 1.5fr; gap: 8%; align-items: start; padding: 9px 0 60px; }
.detail-poster { height: 400px; position: relative; overflow: hidden; background: #292f2b; }
.detail-poster > img { width: 100%; height: 100%; object-fit: cover; filter: saturate(.8); }
.detail-placeholder > span { font-size: 140px; }
.poster-ribbon { position: absolute; bottom: 14px; left: 14px; background: var(--lime); color: var(--ink); font-size: 8px; letter-spacing: 1.2px; padding: 6px 9px; }
.detail-copy .eyebrow { margin-bottom: 17px; }
.detail-copy h1 { font: 500 clamp(36px, 5vw, 60px)/1.04 var(--font-display); margin: 0 0 17px; }
.detail-description { font-size: 14px; line-height: 1.9; color: #c0c4bb; margin: 24px 0 26px; max-width: 700px; }
.cast-block { margin-top: 40px; }
.cast-block h2, .people-list-heading h2 { font: 500 17px var(--font-display); margin-bottom: 13px; }
.cast-list { padding: 0; margin: 0 0 22px; list-style: none; border-top: 1px solid var(--line); }
.cast-list li { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--line); font-size: 12px; }
.cast-list li > span { color: #8f968d; font-size: 11px; margin-left: auto; }
.cast-add { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; padding: 16px; background: var(--ink-soft); border: 1px solid rgba(240,239,232,.08); }
.cast-add select, .cast-add input { color: var(--paper); background: var(--ink); border: 1px solid #414841; padding: 9px 10px; font-size: 12px; }
.cast-add input { flex: 1; min-width: 140px; }
.inline-form { display: inline; }
.link-button { background: none; border: 0; color: #b98d7e; font-size: 11px; cursor: pointer; padding: 4px 6px; text-decoration: underline; }
.link-button:hover { color: var(--coral); }

/* ── Aktorzy ── */
.people-page { padding: 35px 8% 90px; max-width: 1350px; margin: auto; }
.people-heading { padding: 60px 0 44px; }
.people-heading h1 { font: 500 clamp(40px, 5vw, 66px)/1.02 var(--font-display); margin-bottom: 14px; }
.people-heading > p:last-child { color: #a7ada3; max-width: 480px; }
.actor-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--line); border-left: 1px solid var(--line); }
.actor-card { min-height: 200px; padding: 22px; position: relative; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end; gap: 7px; animation: rise-in .45s both; animation-delay: calc(var(--card-index) * .05s); transition: background .2s; }
.actor-card:hover { background: var(--ink-soft); }
.actor-initials, .person-monogram { display: grid; place-items: center; background: #394239; color: var(--lime); font-family: var(--font-display); }
.actor-initials { width: 64px; height: 64px; font-size: 20px; margin-bottom: auto; }
.actor-card-index { position: absolute; right: 18px; top: 19px; color: #818980; font: 10px var(--font-display); }
.actor-card strong { font: 500 16px var(--font-display); }
.actor-card > span:last-child { color: #90988e; font-size: 10px; }
.actor-card i { font-style: normal; color: var(--lime); margin-left: 7px; }
.person-profile { display: grid; grid-template-columns: 180px 1fr; gap: 42px; padding: 56px 0 60px; align-items: center; }
.person-monogram { width: 180px; aspect-ratio: 1; font-size: 48px; background: radial-gradient(circle at 30% 25%, #66704e, #343a32 70%); }
.person-profile h1 { font: 500 clamp(34px, 4.4vw, 52px)/1.05 var(--font-display); margin-bottom: 13px; }
.person-bio { color: #aeb3a9; max-width: 650px; line-height: 1.8; }
.people-list-heading { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid var(--line); padding-bottom: 14px; }
.people-list-heading span { color: #929a90; font-size: 11px; }
.filmography-row { display: grid; grid-template-columns: 70px 1fr 1fr 25px; align-items: center; gap: 15px; padding: 17px 7px; border-bottom: 1px solid var(--line); font-size: 12px; }
.filmography-row:hover { background: var(--ink-soft); }
.filmography-year, .filmography-row > span:nth-child(3) { color: #969e93; }
.filmography-row strong { font: 500 16px var(--font-display); }
.row-arrow { color: var(--lime); text-align: right; }

/* ── Formularze dodawania i edycji ── */
.form-panel { max-width: 560px; padding: 28px; background: var(--ink-soft); border: 1px solid rgba(240,239,232,.08); }
.form-panel h1 { font: 500 34px/1.15 var(--font-display); margin-bottom: 22px; }
.form-panel .eyebrow { margin-bottom: 13px; }
.film-form { display: flex; flex-direction: column; }
.film-form label { font-size: 10px; color: #c2c7bd; margin: 0 0 6px; }
.label-hint { color: #8d958a; margin-left: 5px; }
.film-form input, .film-form select, .film-form textarea { width: 100%; color: var(--paper); background: var(--ink); border: 1px solid #414841; padding: 11px; margin-bottom: 16px; outline: none; font-size: 12px; }
.film-form input:focus, .film-form textarea:focus { border-color: var(--lime); }
.film-form textarea { resize: vertical; }
.film-form input::placeholder, .film-form textarea::placeholder { color: #737b72; }
.submit-button, .button-link { display: inline-flex; justify-content: space-between; align-items: center; gap: 16px; background: var(--lime); color: var(--ink); border: 0; padding: 13px 15px; font-size: 11px; font-weight: 700; cursor: pointer; }
.submit-button:hover, .button-link:hover { background: #e8ff9c; color: var(--ink); }
.submit-button span { font-size: 16px; }
.form-hint { margin: 18px 0 0; font-size: 11px; color: #8f968d; line-height: 1.7; }
.form-hint code { color: var(--lime); }

/* ── Komunikaty i stany ── */
.notice { padding: 15px 17px; margin: 0 0 22px; border-left: 2px solid var(--coral); background: #242521; font-size: 12px; }
.notice a { color: var(--lime); font-weight: 600; }
.notice-success { border-color: var(--lime); }
.notice-error ul { padding-left: 17px; margin: 0; }
.notice-error li { color: #e8b4a0; }
.empty-state { text-align: center; border: 1px solid var(--line); padding: 55px 20px; color: #a8afa5; }
.empty-state h3, .empty-state h1 { font: 500 21px var(--font-display); color: var(--paper); margin: 14px 0 7px; }
.empty-state p { font-size: 12px; margin: 0 0 10px; }
.empty-mark { font: 32px var(--font-display); color: var(--lime); }
.detail-empty { margin: 50px 0; }
.detail-empty .button-link { display: inline-flex; margin-top: 20px; }
.muted-copy { color: #929a90; font-size: 12px; }

/* ── Stopka ── */
.site-footer { min-height: 103px; padding: 25px 6.2%; display: flex; align-items: center; justify-content: space-between; color: #92988f; }
.footer-brand { color: var(--paper); font-size: 13px; }
.footer-brand .brand-mark { width: 24px; height: 24px; font-size: 13px; }
.site-footer p, .footer-year { margin: 0; font-size: 10px; }

@keyframes rise-in { from { opacity: 0; transform: translateY(13px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 850px) {
  .site-header { padding: 0 4%; height: 70px; }
  .main-nav { gap: 18px; }
  .main-nav a { font-size: 12px; }
  .catalog-hero { grid-template-columns: 1fr; gap: 30px; padding: 44px 5% 56px; }
  .hero-art { height: 240px; }
  .catalog-section, .detail-shell, .form-shell, .people-page { padding-left: 5%; padding-right: 5%; }
  .film-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 34px 18px; }
  .film-detail { grid-template-columns: 1fr; gap: 30px; }
  .detail-poster { height: 320px; max-width: 300px; }
  .actor-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .person-profile { grid-template-columns: 84px 1fr; gap: 20px; padding: 44px 0; }
  .person-monogram { width: 84px; font-size: 24px; }
  .person-bio { grid-column: 1 / -1; }
  .filmography-row { grid-template-columns: 46px 1fr 20px; }
  .filmography-row > span:nth-child(3) { display: none; }
  .form-panel { padding: 20px; }
}
`;

const klatkaFiles = {
  'film.php': klatkaFilm,
  'aktor.php': klatkaAktor,
  'dodaj_film.php': klatkaDodajFilm,
  'dodaj_aktora.php': klatkaDodajAktora,
  'edytuj_film.php': klatkaEdytujFilm,
  'baza.sql': klatkaSchemaMysql,
  'baza.sqlite.sql': klatkaSchemaSqlite,
  'styles.css': klatkaStyles,
};

export const phpProfileExercises = {
  603: [
    {
      title: 'Wstaw imię do nagłówka',
      prompt: 'W index.php wstaw zmienną $name do środka h1 za pomocą <?= … ?>. Pozostaw szkielet strony w zwykłym HTML.',
      starter: profilePage(nameSetup, '      <h1><!-- Wstaw tutaj imię --></h1>'),
      solution: profilePage(nameSetup, '      <h1><?= $name ?></h1>'),
      checks: [source('<?='), text('.profile h1', 'Ala')],
    },
    {
      title: 'Wyświetl opis jako tekst',
      prompt: 'Karta ma już nagłówek. W akapicie #bio wyświetl $bio przez e(), aby znaczniki <b> pojawiły się dosłownie jako część opisu.',
      starter: profilePage(bioSetup, nameCard + '\n      <p id="bio"></p>'),
      solution: profilePage(bioSetup, bioCard),
      checks: [source('e($bio)'), text('#bio', '<b>Uczę się PHP</b>')],
    },
    {
      title: 'Wstaw wartość do atrybutu',
      prompt: 'Szablon ma już nagłówek i opis. Dodaj pod nimi odnośnik <a id="link">Moja strona</a>, którego href wypisuje PHP: href="<?= e($link) ?>".',
      starter: profilePage(bioSetup + "\n$link = 'https://example.com';", bioCard + '\n      <!-- TODO: <a id="link"> z atrybutem href z $link -->'),
      solution: profilePage(bioSetup + "\n$link = 'https://example.com';", bioCard + '\n      <a id="link" href="<?= e($link) ?>">Moja strona</a>'),
      checks: [
        phpAttribute('href', '$link'),
        ['attributeEquals', 'Odnośnik #link ma href wygenerowany przez PHP.', { selector: '#link', attribute: 'href', expected: 'https://example.com' }],
        text('#link', 'Moja strona'),
      ],
    },
  ],
  610: [
    {
      title: 'Powitaj osobę po kliknięciu',
      prompt: 'W index.php ustaw data-name przycisku na bezpiecznie wypisane $name. W skrypcie obsłuż kliknięcie i ustaw textContent elementu #result na „Cześć, Ala!” używając dataset.name.',
      starter: jsProfile(nameSetup, 'data-name=""', 'Przywitaj'),
      solution: jsProfile(nameSetup, nameAttribute, 'Przywitaj', jsClick("          result.textContent = 'Cześć, ' + button.dataset.name + '!';")),
      steps: [
        'W atrybucie przycisku wypisz wartość PHP: data-name="<?= e($name) ?>".',
        'W skrypcie znajdź przycisk i #result przez document.querySelector i podepnij addEventListener("click", …).',
        'W obsłudze ustaw result.textContent na "Cześć, " + button.dataset.name + "!".',
        'Uruchom ▶ Play — sprawdzenie kliknie przycisk i przeczyta #result.',
      ],
      checks: [
        phpAttribute('data-name', '$name'),
        codeLine('dataset.name', 'W skrypcie odczytaj wartość przez button.dataset.name — nie przez textContent nagłówka ani w komentarzu.'),
        ['attributeEquals', 'Przycisk #action ma w HTML atrybut data-name="Ala" wygenerowany przez PHP.', { selector: '#action', attribute: 'data-name', expected: 'Ala' }],
        click('Cześć, Ala!'),
      ],
    },
    {
      title: 'Pokaż imię i rolę',
      prompt: 'Kod z zadania 1 działa — przycisk ma data-name i działające kliknięcie. Dodaj obok atrybut data-role z wartością $role przepuszczoną przez e() i zmień treść wyniku na „Ala — uczeń”.',
      starter: jsProfile(roleSetup, nameAttribute + ' data-role=""', 'Pokaż profil', jsClick("          result.textContent = 'Cześć, ' + button.dataset.name + '!';\n          // TODO: pokaż także rolę z data-role")),
      solution: jsProfile(roleSetup, nameAttribute + ' ' + roleAttribute, 'Pokaż profil', jsClick("          result.textContent = button.dataset.name + ' — ' + button.dataset.role;")),
      checks: [
        phpAttribute('data-role', '$role'),
        codeLine('dataset.role', 'Odczytaj rolę przez button.dataset.role w skrypcie (nie w komentarzu).'),
        ['attributeEquals', 'Przycisk #action ma w HTML atrybut data-role="uczeń" wygenerowany przez PHP.', { selector: '#action', attribute: 'data-role', expected: 'uczeń' }],
        click('Ala — uczeń'),
      ],
    },
    {
      title: 'Przełącz widoczność roli',
      prompt: 'Zmień działanie przycisku. Po pierwszym kliknięciu pokaż rolę z dataset.role w #result, po kolejnym przywróć „Kliknij przycisk.”. Ustawiaj aria-expanded na true lub false zgodnie ze stanem.',
      starter: jsProfile(roleSetup, roleAttribute + ' aria-expanded="false" aria-controls="result"', 'Pokaż lub ukryj rolę'),
      solution: jsProfile(roleSetup, roleAttribute + ' aria-expanded="false" aria-controls="result"', 'Pokaż lub ukryj rolę', jsClick(`          const expanded = button.getAttribute('aria-expanded') === 'true';
          button.setAttribute('aria-expanded', String(!expanded));
          result.textContent = expanded ? 'Kliknij przycisk.' : 'Rola: ' + button.dataset.role;`)),
      checks: [
        codeLine('dataset.role', 'Odczytaj rolę przez button.dataset.role w skrypcie (nie w komentarzu).'),
        codeLine('setAttribute(', 'Przełączaj stan przez setAttribute w skrypcie (nie w komentarzu).', 'setAttribute\\('),
        ['attributeEquals', 'Przycisk #action ma w HTML atrybut data-role="uczeń" wygenerowany przez PHP.', { selector: '#action', attribute: 'data-role', expected: 'uczeń' }],
        click('Rola: uczeń'), [
        'attributeEquals', 'Po rozwinięciu aria-expanded ma wartość true.',
        { selector: '#action', attribute: 'aria-expanded', expected: 'true' },
      ]],
    },
  ],
  611: [
    {
      title: 'Przekaż profil do skryptu',
      prompt: 'W skrypcie index.php zastąp `null` wywołaniem json_encode($profile, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT) — PHP musi wyprodukować literał JS. Po kliknięciu pokaż „Cześć, Ala!” z profile.imie.',
      starter: jsonPage("$profile = ['imie' => 'Ala', 'rola' => 'uczeń'];", `        const profile = null; // TODO: osadź tablicę przez json_encode z flagami JSON_HEX_*
        const button = document.querySelector('#action');
        const result = document.querySelector('#result');
        button.addEventListener('click', () => {
          result.textContent = 'Cześć, ' + profile.imie + '!';
        });`),
      solution: jsonPage("$profile = ['imie' => 'Ala', 'rola' => 'uczeń'];", `        const profile = <?= json_encode($profile, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT) ?>;
        const button = document.querySelector('#action');
        const result = document.querySelector('#result');
        button.addEventListener('click', () => {
          result.textContent = 'Cześć, ' + profile.imie + '!';
        });`),
      steps: [
        'W skrypcie zastąp `null` wywołaniem <?= json_encode($profile, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT) ?>.',
        'Flagi JSON_HEX_* zamieniają znaki specjalne na \\u sekwencje — e() tu nie chroni.',
        'Obsługa kliknięcia czyta profile.imie z gotowego literału.',
        'Uruchom ▶ Play — sprawdzenie kliknie przycisk i przeczyta #result.',
      ],
      checks: [
        jsonFlags('$profile'),
        notHandLiteral('const profile\\s*=\\s*[\\{\\[]', 'Nie wpisuj obiektu ręcznie — literał ma wyprodukować PHP przez json_encode.'),
        click('Cześć, Ala!'),
      ],
    },
    {
      title: 'Lista zainteresowań',
      prompt: 'Kod z zadania 1 działa — profil trafia do skryptu. Dodaj tablicę $interests = […] i osadź ją tak samo przez json_encode; po kliknięciu wyrenderuj elementy <li> w #result.',
      starter: jsonPage("$profile = ['imie' => 'Ala', 'rola' => 'uczeń'];\n$interests = ['muzyka', 'sport', 'książki'];", `        const profile = <?= json_encode($profile, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT) ?>;
        const button = document.querySelector('#action');
        const result = document.querySelector('#result');
        button.addEventListener('click', () => {
          result.textContent = 'Cześć, ' + profile.imie + '!';
          // TODO: osadź $interests przez json_encode i pokaż je jako <li>
        });`),
      solution: jsonPage("$profile = ['imie' => 'Ala', 'rola' => 'uczeń'];\n$interests = ['muzyka', 'sport', 'książki'];", `        const profile = <?= json_encode($profile, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT) ?>;
        const interests = <?= json_encode($interests, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT) ?>;
        const button = document.querySelector('#action');
        const result = document.querySelector('#result');
        button.addEventListener('click', () => {
          result.innerHTML = '<ul>' + interests.map(i => '<li>' + i + '</li>').join('') + '</ul>';
        });`),
      checks: [
        jsonFlags('$interests'),
        notHandLiteral('const interests\\s*=\\s*\\[', 'Nie wpisuj tablicy ręcznie — literał ma wyprodukować PHP przez json_encode.'),
        clickContains('#action', '#result', 'muzyka'),
        listItems(),
      ],
    },
    {
      title: 'Książki nowsze niż 1850',
      prompt: 'Tablica $ksiazki jest już osadzona w skrypcie przez json_encode. Po kliknięciu przefiltruj książki do rok > 1850 i wyrenderuj ich tytuły jako <li> w #result.',
      starter: jsonPage(booksSetup, `        const books = <?= json_encode($ksiazki, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT) ?>;
        const button = document.querySelector('#action');
        const result = document.querySelector('#result');
        button.addEventListener('click', () => {
          // Napisz filtrowanie i renderowanie listy.
        });`),
      solution: jsonPage(booksSetup, `        const books = <?= json_encode($ksiazki, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT) ?>;
        const button = document.querySelector('#action');
        const result = document.querySelector('#result');
        button.addEventListener('click', () => {
          const nowsze = books.filter(b => b.rok > 1850);
          result.innerHTML = '<ul>' + nowsze.map(b => '<li>' + b.tytul + '</li>').join('') + '</ul>';
        });`),
      checks: [
        jsonFlags('$ksiazki'),
        notHandLiteral('const books\\s*=\\s*\\[', 'Nie wpisuj tablicy ręcznie — literał ma wyprodukować PHP przez json_encode.'),
        clickContains('#action', '#result', 'Ferdydurke'),
        listItems(),
      ],
    },
  ],
  612: [
    {
      title: 'Pobierz książki po roku',
      prompt: 'api.php odpowiada JSON. W index.php obsłuż kliknięcie: fetch(\'api.php?rok=1834\').then(r => r.json()) i wyrenderuj tytuły jako <li> w #result.',
      starter: fetchPage(`      const button = document.querySelector('#action');
      const result = document.querySelector('#result');
      button.addEventListener('click', () => {
        // TODO: pobierz dane z api.php?rok=1834 przez fetch i wyrenderuj <li>
      });`),
      solution: fetchPage(`      const button = document.querySelector('#action');
      const result = document.querySelector('#result');
      button.addEventListener('click', () => {
        fetch('api.php?rok=1834')
          .then(r => r.json())
          .then(books => {
            result.innerHTML = '<ul>' + books.map(b => '<li>' + b.tytul + '</li>').join('') + '</ul>';
          });
      });`),
      starterFiles: { 'api.php': apiBooks },
      steps: [
        'W obsłudze kliknięcia wywołaj fetch(\'api.php?rok=1834\') — parametr w adresie trafia do $_GET.',
        'Odczytaj odpowiedź przez .then(r => r.json()).',
        'W kolejnym .then(books => …) wyrenderuj <li> z b.tytul w #result.',
        'Uruchom ▶ Play — sprawdzenie kliknie przycisk; fetch przejdzie przez shim do php-wasm.',
      ],
      checks: [
        codeLine('fetch(', 'Pobierz dane przez fetch(\'api.php?rok=…\') — parametr roku w adresie URL.', 'fetch\\(\\s*["\']api\\.php\\?rok='),
        codeLine('json()', 'Odczytaj odpowiedź przez r.json() w skrypcie (nie w komentarzu).', '\\.json\\(\\)'),
        clickContains('#action', '#result', 'Pan Tadeusz'),
        listItems(),
      ],
    },
    {
      title: 'Wyślij tytuł metodą POST',
      prompt: 'Pobieranie działa. Dodaj drugą obsługę: przycisk #action-post wysyła POST z FormData (pole tytul = „Wiedźmin”) do api.php i pokazuje wiadomość z odpowiedzi w #result.',
      starter: fetchPage(`      const button = document.querySelector('#action');
      const result = document.querySelector('#result');
      button.addEventListener('click', () => {
        fetch('api.php?rok=1834')
          .then(r => r.json())
          .then(books => {
            result.innerHTML = '<ul>' + books.map(b => '<li>' + b.tytul + '</li>').join('') + '</ul>';
          });
      });
      const postButton = document.querySelector('#action-post');
      postButton.addEventListener('click', () => {
        // TODO: wyślij POST z FormData (pole tytul) i pokaż odpowiedź
      });`),
      solution: fetchPage(`      const button = document.querySelector('#action');
      const result = document.querySelector('#result');
      button.addEventListener('click', () => {
        fetch('api.php?rok=1834')
          .then(r => r.json())
          .then(books => {
            result.innerHTML = '<ul>' + books.map(b => '<li>' + b.tytul + '</li>').join('') + '</ul>';
          });
      });
      const postButton = document.querySelector('#action-post');
      postButton.addEventListener('click', () => {
        const dane = new FormData();
        dane.append('tytul', 'Wiedźmin');
        fetch('api.php', { method: 'POST', body: dane })
          .then(r => r.json())
          .then(odpowiedz => {
            result.textContent = odpowiedz.wiadomosc;
          });
      });`),
      starterFiles: { 'api.php': apiBooks },
      checks: [
        codeLine('POST', 'Wyślij żądanie metodą POST: fetch(\'api.php\', { method: \'POST\', … }) — nie w komentarzu.', 'method\\s*:\\s*["\']POST'),
        codeLine('FormData', 'Zbuduj ciało żądania przez FormData (nie w komentarzu).'),
        clickContains('#action-post', '#result', 'Dodano: Wiedźmin'),
      ],
    },
    {
      title: 'Obsłuż pusty wynik i błąd',
      prompt: 'Zapytania działają, ale bez obsługi błędów. Rozszerz obie obsługi: dla pustej listy pokaż „Brak wyników”, a gdy !r.ok — „Błąd serwera: ” + r.status. Przycisk #action-post wysyła DELETE, na który api.php odpowiada 405.',
      starter: fetchPage(`      const button = document.querySelector('#action');
      const result = document.querySelector('#result');
      button.addEventListener('click', () => {
        fetch('api.php?rok=9999')
          .then(r => r.json())
          .then(books => {
            result.innerHTML = '<ul>' + books.map(b => '<li>' + b.tytul + '</li>').join('') + '</ul>';
          });
      });
      const postButton = document.querySelector('#action-post');
      postButton.addEventListener('click', () => {
        fetch('api.php', { method: 'DELETE' })
          .then(r => r.json())
          .then(odpowiedz => {
            result.textContent = odpowiedz.wiadomosc;
          });
      });`),
      solution: fetchPage(`      const button = document.querySelector('#action');
      const result = document.querySelector('#result');
      button.addEventListener('click', () => {
        fetch('api.php?rok=9999')
          .then(r => {
            if (!r.ok) { result.textContent = 'Błąd serwera: ' + r.status; return null; }
            return r.json();
          })
          .then(books => {
            if (books === null) return;
            if (!books.length) { result.textContent = 'Brak wyników'; return; }
            result.innerHTML = '<ul>' + books.map(b => '<li>' + b.tytul + '</li>').join('') + '</ul>';
          });
      });
      const postButton = document.querySelector('#action-post');
      postButton.addEventListener('click', () => {
        fetch('api.php', { method: 'DELETE' })
          .then(r => {
            if (!r.ok) { result.textContent = 'Błąd serwera: ' + r.status; return null; }
            return r.json();
          })
          .then(odpowiedz => {
            if (odpowiedz === null) return;
            result.textContent = odpowiedz.wiadomosc;
          });
      });`),
      starterFiles: { 'api.php': apiBooks },
      checks: [
        codeLine('.ok', 'Sprawdź r.ok przed odczytem JSON w skrypcie (nie w komentarzu).', '\\.ok\\b'),
        ['interaction', 'Dla pustej listy pokaż „Brak wyników”.', { selector: '#action', resultSelector: '#result', expected: { beforeText: 'Kliknij przycisk.', textEquals: 'Brak wyników' } }],
        ['interaction', 'Po nieudanym żądaniu pokaż „Błąd serwera: 405”.', { selector: '#action-post', resultSelector: '#result', expected: { textEquals: 'Błąd serwera: 405' } }],
      ],
    },
  ],
  601: [
    {
      suffix: 'guided',
      title: 'Pierwszy wynik echo',
      prompt: 'Wypisz przez `echo` nagłówek `h1` z „Pierwszy skrypt PHP” i akapit `#result` z „Witaj w PHP!”. PHP generuje HTML — nie wpisuj tekstu na sztywno w znacznikach.',
      starter: profilePage('// TODO: użyj echo — wypisz h1 i p#result', '      <h1><?php // TODO: echo "Pierwszy skrypt PHP" ?></h1>\n      <p id="result"><?php // TODO: echo "Witaj w PHP!" ?></p>'),
      solution: profilePage('// Pierwszy skrypt PHP', '      <h1><?php echo \'Pierwszy skrypt PHP\'; ?></h1>\n      <p id="result"><?php echo \'Witaj w PHP!\'; ?></p>'),
      steps: [
        'W h1 wpisz blok `<?php echo \'Pierwszy skrypt PHP\'; ?>`.',
        'W p#result wpisz blok `<?php echo \'Witaj w PHP!\'; ?>`.',
        'Uruchom ▶ Play — PHP zwraca gotowy HTML.',
      ],
      checks: [
        codeLine('echo', 'Wypisz tekst instrukcją echo (nie w komentarzu).', 'echo'),
        text('h1', 'Pierwszy skrypt PHP'),
        text('#result', 'Witaj w PHP!'),
        notHandLiteral('>Witaj w PHP!<', 'Komunikat ma wypisywać echo — nie stały tekst w HTML.'),
      ],
    },
    {
      suffix: 'modified',
      title: 'Drugi komunikat',
      prompt: 'Strona działa. Dodaj pod `#result` akapit `<p id="note">` z drugim `echo` — „Dzisiaj ćwiczę PHP”.',
      starter: profilePage('// Pierwszy skrypt PHP', '      <h1><?php echo \'Pierwszy skrypt PHP\'; ?></h1>\n      <p id="result"><?php echo \'Witaj w PHP!\'; ?></p>\n      <!-- TODO: <p id="note"> z echo "Dzisiaj ćwiczę PHP" -->'),
      solution: profilePage('// Pierwszy skrypt PHP', '      <h1><?php echo \'Pierwszy skrypt PHP\'; ?></h1>\n      <p id="result"><?php echo \'Witaj w PHP!\'; ?></p>\n      <p id="note"><?php echo \'Dzisiaj ćwiczę PHP\'; ?></p>'),
      checks: [
        codeLine('id="note"', 'Dodaj element <p id="note">.', 'id="note"'),
        text('#note', 'Dzisiaj ćwiczę PHP'),
        text('#result', 'Witaj w PHP!'),
        notHandLiteral('>Dzisiaj ćwiczę PHP<', 'Drugą treść też wypisz przez echo.'),
      ],
    },
    {
      suffix: 'independent',
      title: 'Własna strona powitalna',
      prompt: 'Zapisz komunikat „PHP działa w przeglądarce” w zmiennej `$message` i wypisz go przez `echo` w `#result`. Dodaj własny nagłówek `h1`.',
      starter: profilePage('// TODO: zmienna $message i echo', '      <h1><?php // TODO: własny nagłówek ?></h1>\n      <p id="result"><?php // TODO: echo $message ?></p>'),
      solution: profilePage('$message = \'PHP działa w przeglądarce\';', '      <h1><?php echo \'Witaj!\'; ?></h1>\n      <p id="result"><?php echo $message; ?></p>'),
      checks: [
        codeLine('$message', 'Zapisz komunikat w zmiennej `$message`.', '\\$message\\s*='),
        codeLine('echo $message', 'Wypisz zmienną przez echo.', 'echo\\s+\\$message'),
        text('#result', 'PHP działa w przeglądarce'),
      ],
    },
  ],
  602: [
    {
      suffix: 'guided',
      title: 'Zmienne w karcie',
      prompt: 'Zadeklaruj `$name = \'Ada\'` i `$age = 21`, a potem wypisz je w HTML: imię w `h1`, wiek jako „Wiek: 21” w `#age`.',
      starter: profilePage('$name = \'\';\n$age = 0;\n// TODO: dopisz wartości i wypisz zmienne', '      <h1><?= $name ?></h1>\n      <p id="age">Wiek: <?= $age ?></p>'),
      solution: profilePage('$name = \'Ada\';\n$age = 21;', '      <h1><?= $name ?></h1>\n      <p id="age">Wiek: <?= $age ?></p>'),
      steps: [
        'Ustaw `$name = \'Ada\'` i `$age = 21`.',
        '`<?= $name ?>` w h1 i `<?= $age ?>` w #age interpolują zmienne.',
        'Uruchom ▶ Play — PHP podstawia wartości w HTML.',
      ],
      checks: [
        codeLine('$name', 'Ustaw `$name` na „Ada”.', '\\$name\\s*=\\s*[\'"]Ada'),
        codeLine('$age', 'Ustaw `$age` na 21.', '\\$age\\s*=\\s*21'),
        text('h1', 'Ada'),
        text('#age', 'Wiek: 21'),
      ],
    },
    {
      suffix: 'modified',
      title: 'Trzecia zmienna',
      prompt: 'Karta pokazuje imię i wiek. Dodaj `$city = \'Warszawa\'` i wypisz „Miasto: Warszawa” w nowym akapicie `#extra`.',
      starter: profilePage('$name = \'Ada\';\n$age = 21;', '      <h1><?= $name ?></h1>\n      <p id="age">Wiek: <?= $age ?></p>\n      <!-- TODO: <p id="extra"> ze zmienną $city -->'),
      solution: profilePage('$name = \'Ada\';\n$age = 21;\n$city = \'Warszawa\';', '      <h1><?= $name ?></h1>\n      <p id="age">Wiek: <?= $age ?></p>\n      <p id="extra">Miasto: <?= $city ?></p>'),
      checks: [
        codeLine('$city', 'Zadeklaruj `$city`.', '\\$city\\s*='),
        codeLine('id="extra"', 'Dodaj akapit `#extra`.', 'id="extra"'),
        text('#extra', 'Miasto: Warszawa'),
        text('h1', 'Ada'),
      ],
    },
    {
      suffix: 'independent',
      title: 'Kalkulator BMI',
      prompt: 'Dla `$waga = 70` (kg) i `$wzrost = 1.80` (m) oblicz BMI = waga ÷ wzrost² — użyj `$wzrost * $wzrost` albo `** 2`. Wynik zaokrąglij `round(…, 1)` do zmiennej `$bmi` i wypisz „BMI: 21.6” w `#result`.',
      starter: profilePage('$waga = 70;\n$wzrost = 1.80;\n// TODO: $bmi = waga / wzrost², zaokrąglona round(…, 1)', '      <h1>Kalkulator BMI</h1>\n      <p id="result">BMI: <?php // TODO: wypisz $bmi ?></p>'),
      solution: profilePage('$waga = 70;\n$wzrost = 1.80;\n$bmi = round($waga / ($wzrost * $wzrost), 1);', '      <h1>Kalkulator BMI</h1>\n      <p id="result">BMI: <?= $bmi ?></p>'),
      checks: [
        codeLine('$bmi', 'Oblicz BMI do zmiennej `$bmi`.', '\\$bmi\\s*='),
        codeLine('round(', 'Zaokrąglij wynik przez `round(…, 1)`.', 'round\\('),
        text('#result', 'BMI: 21.6'),
        notHandLiteral('21\\.6', 'Wartość ma wyliczyć formuła — nie stały tekst.'),
      ],
    },
  ],
  604: [
    {
      suffix: 'guided',
      title: 'Warunek if/else',
      prompt: 'Dla `$age = 18` napisz `if`/`else`: „Możesz wejść” dla 18+, „Jeszcze poczekaj” poniżej. Wynik wypisz w `#result`.',
      starter: profilePage('$age = 18;\n$message = \'\';\n// TODO: if/else ustawia $message', '      <p id="result"><?= $message ?></p>'),
      solution: profilePage('$age = 18;\nif ($age >= 18) {\n  $message = \'Możesz wejść\';\n} else {\n  $message = \'Jeszcze poczekaj\';\n}', '      <p id="result"><?= $message ?></p>'),
      steps: [
        'Napisz `if ($age >= 18) { … } else { … }`.',
        'W gałęziach ustaw `$message`.',
        'Wypisz `#result` z `<?= $message ?>`.',
      ],
      checks: [
        codeLine('if', 'Użyj warunku `if` (nie w komentarzu).', 'if\\s*\\('),
        codeLine('else', 'Dodaj gałąź `else`.', 'else'),
        text('#result', 'Możesz wejść'),
        notHandLiteral('>Możesz wejść<', 'Wynik ma ustawiać warunek — nie stały tekst w HTML.'),
      ],
    },
    {
      suffix: 'modified',
      title: 'Cennik biletów',
      prompt: 'Wiek ustala cenę biletu: dzieci do 7 lat — „Bilet: 0 zł”, do 18 — „Bilet: 10 zł”, starsi — „Bilet: 20 zł”. Dla `$age = 10` ustaw `$message` łańcuchem `if/elseif/else` — kolejność progów ma znaczenie.',
      starter: profilePage('$age = 10;\n$message = \'\';\n// TODO: progi <7 → 0 zł, <18 → 10 zł, reszta → 20 zł', '      <p id="result"><?= $message ?></p>'),
      solution: profilePage('$age = 10;\nif ($age < 7) {\n  $message = \'Bilet: 0 zł\';\n} elseif ($age < 18) {\n  $message = \'Bilet: 10 zł\';\n} else {\n  $message = \'Bilet: 20 zł\';\n}', '      <p id="result"><?= $message ?></p>'),
      checks: [
        codeLine('elseif', 'Środkowy próg zrealizuj gałęzią `elseif`/`else if`.', 'else\\s*if|elseif'),
        codeLine('$age', 'Progi porównują `$age`.', '\\$age\\s*[<>=]'),
        text('#result', 'Bilet: 10 zł'),
        notHandLiteral('>Bilet: 10 zł<', 'Cenę ma wybrać warunek — nie stały tekst.'),
      ],
    },
    {
      suffix: 'independent',
      title: 'Skala ocen',
      prompt: 'Przelicz `$points = 87` na ocenę: `>= 90` → „bdb”, `>= 75` → „db”, `>= 50` → „dst”, `>= 30` → „dop”, mniej → „ndst”. Wypisz „Ocena: db” w `#result`. Progi sprawdzaj od najwyższego — `elseif` zatrzymuje się na pierwszym spełnionym.',
      starter: profilePage('$points = 87;\n// TODO: łańcuch if/elseif/else ustawia $grade', '      <p id="result">Ocena: <?php // TODO: $grade ?></p>'),
      solution: profilePage('$points = 87;\nif ($points >= 90) {\n  $grade = \'bdb\';\n} elseif ($points >= 75) {\n  $grade = \'db\';\n} elseif ($points >= 50) {\n  $grade = \'dst\';\n} elseif ($points >= 30) {\n  $grade = \'dop\';\n} else {\n  $grade = \'ndst\';\n}', '      <p id="result">Ocena: <?= $grade ?></p>'),
      checks: [
        codeLine('elseif', 'Skala potrzebuje kilku gałęzi `elseif`/`else if`.', 'else\\s*if|elseif'),
        codeLine('$points', 'Warunki porównują `$points`.', '\\$points\\s*>='),
        text('#result', 'Ocena: db'),
        notHandLiteral('>Ocena: db<', 'Ocenę ma wyliczyć skala — nie stały tekst.'),
      ],
    },
  ],
  605: [
    {
      suffix: 'guided',
      title: 'Pętla for',
      prompt: 'Pętlą `for` wygeneruj w `<ul id="result">` trzy `<li>`: „Krok 1”, „Krok 2”, „Krok 3” — tekst z `$i`, nie na sztywno.',
      starter: profilePage('// TODO: pętla for wypisuje <li>Krok $i</li>', '      <ul id="result">\n        <?php // TODO: for ($i = 1; …) echo "<li>Krok $i</li>" ?>\n      </ul>'),
      solution: profilePage('', '      <ul id="result">\n        <?php for ($i = 1; $i <= 3; $i++): ?>\n          <li>Krok <?= $i ?></li>\n        <?php endfor; ?>\n      </ul>'),
      steps: [
        'Otwórz `for ($i = 1; $i <= 3; $i++)` (wersja z `endfor`).',
        'W środku wypisz `<li>Krok <?= $i ?></li>`.',
        'Zamknij `<?php endfor; ?>`.',
      ],
      checks: [
        codeLine('for', 'Użyj pętli `for` (nie w komentarzu).', 'for\\s*\\('),
        ['elementExists', 'Lista ma trzeci element <li>.', { selector: '#result li:nth-child(3)' }],
        text('#result li:nth-child(3)', 'Krok 3'),
        notHandLiteral('<li>Krok 3<', 'Kroki mają pochodzić z pętli — nie ze stałych <li>.'),
      ],
    },
    {
      suffix: 'modified',
      title: 'Suma zakresu',
      prompt: 'Zamiast wypisywać każdy obrót, zsumuj go: pętla `for` od 1 do 10 dodaje `$i` do `$sum` (np. `$sum += $i`), a potem wypisz „Suma 1–10: 55” w `#result`.',
      starter: profilePage('$sum = 0;\n// TODO: for ($i = 1; $i <= 10; $i++) dodaje $i do $sum', '      <p id="result">Suma 1–10: <?= $sum ?></p>'),
      solution: profilePage('$sum = 0;\nfor ($i = 1; $i <= 10; $i++) {\n  $sum += $i;\n}', '      <p id="result">Suma 1–10: <?= $sum ?></p>'),
      checks: [
        codeLine('for', 'Użyj pętli `for` (nie w komentarzu).', 'for\\s*\\('),
        codeLine('$sum', 'Dodawaj licznik do `$sum` w każdej iteracji.', '\\$sum\\s*\\+=|\\$sum\\s*=\\s*\\$sum\\s*\\+'),
        text('#result', 'Suma 1–10: 55'),
        notHandLiteral('>Suma 1–10: 55<', 'Sumę ma wyliczyć pętla — nie stały tekst.'),
      ],
    },
    {
      suffix: 'independent',
      title: 'FizzBuzz',
      prompt: 'Pętla `for` od 1 do 15 wypisuje `<li>` w `<ul id="result">`: podzielne przez 15 → „FizzBuzz”, przez 3 → „Fizz”, przez 5 → „Buzz”, reszta → sam licznik. Podzielność sprawdź resztą `$i % 3 === 0` — właściwą kolejność warunków dobierz sam.',
      starter: profilePage('// TODO: for 1..15 + warunki %15 / %3 / %5', '      <ul id="result">\n        <?php // TODO ?>\n      </ul>'),
      solution: profilePage('', '      <ul id="result">\n        <?php for ($i = 1; $i <= 15; $i++): ?>\n          <?php if ($i % 15 === 0): ?>\n            <li>FizzBuzz</li>\n          <?php elseif ($i % 3 === 0): ?>\n            <li>Fizz</li>\n          <?php elseif ($i % 5 === 0): ?>\n            <li>Buzz</li>\n          <?php else: ?>\n            <li><?= $i ?></li>\n          <?php endif; ?>\n        <?php endfor; ?>\n      </ul>'),
      checks: [
        codeLine('%', 'Podzielność sprawdź resztą z dzielenia `%`.', '\\$i\\s*%'),
        codeLine('if', 'Wybór wypisanego tekstu robi warunek.', 'if\\s*\\('),
        codeLine('for', 'Wypisywanie robi pętla `for`.', 'for\\s*\\('),
        ['elementExists', 'Lista ma piętnaście elementów.', { selector: '#result li:nth-child(15)' }],
        text('#result li:nth-child(9)', 'Fizz'),
        text('#result li:nth-child(10)', 'Buzz'),
        text('#result li:nth-child(15)', 'FizzBuzz'),
      ],
    },
  ],
  606: [
    {
      suffix: 'guided',
      title: 'Tablica i foreach',
      prompt: 'Ustaw `$skills = [\'HTML\', \'CSS\', \'PHP\']` i pętlą `foreach` wypisz `<li>` dla każdej umiejętności w `<ul id="result">`.',
      starter: profilePage('$skills = [];\n// TODO: uzupełnij tablicę i przejdź po niej foreach', '      <ul id="result">\n        <?php // TODO: foreach ($skills as $skill) ?>\n      </ul>'),
      solution: pageE('$skills = [\'HTML\', \'CSS\', \'PHP\'];', '      <ul id="result">\n        <?php foreach ($skills as $skill): ?>\n          <li><?= e($skill) ?></li>\n        <?php endforeach; ?>\n      </ul>'),
      steps: [
        'Uzupełnij `$skills` trzema elementami.',
        'Napisz `foreach ($skills as $skill):` z `endforeach`.',
        'W środku `<li><?= e($skill) ?></li>`.',
      ],
      checks: [
        codeLine('$skills', 'Zdefiniuj tablicę `$skills` z 3 elementami.', '\\$skills\\s*=\\s*\\['),
        codeLine('foreach', 'Przejdź po tablicy przez `foreach`.', 'foreach\\s*\\('),
        ['elementExists', 'Lista ma trzeci element <li>.', { selector: '#result li:nth-child(3)' }],
        text('#result li:nth-child(2)', 'CSS'),
        notHandLiteral('<li>CSS<', 'Elementy mają pochodzić z foreach — nie ze stałych <li>.'),
      ],
    },
    {
      suffix: 'modified',
      title: 'Średnia ocen',
      prompt: 'Zamiast wypisywać każdą ocenę, policz średnią: `$scores = [4, 6, 8, 10]` — zsumuj elementy (akumulator albo `array_sum`) i podziel przez `count($scores)`. Wynik „Średnia: 7” wypisz w `#result`.',
      starter: pageE('$scores = [4, 6, 8, 10];\n// TODO: $avg = suma / count($scores)', '      <p id="result">Średnia: <?php // TODO: $avg ?></p>'),
      solution: pageE('$scores = [4, 6, 8, 10];\n$sum = 0;\nforeach ($scores as $score) {\n  $sum += $score;\n}\n$avg = $sum / count($scores);', '      <p id="result">Średnia: <?= e($avg) ?></p>'),
      checks: [
        codeLine('count(', 'Licznik dzielenia to `count($scores)`.', 'count\\('),
        codeLine('$sum', 'Zbierz sumę elementów (`+=` lub `array_sum`).', '\\+=|array_sum'),
        text('#result', 'Średnia: 7'),
        notHandLiteral('>Średnia: 7<', 'Średnią ma wyliczyć kod — nie stały tekst.'),
      ],
    },
    {
      suffix: 'independent',
      title: 'Najwyższy wynik',
      prompt: 'Dla `$scores = [4, 9, 7, 2]` znajdź najwyższy wynik **pętlą**: zacznij od `$max = $scores[0]`, a w `foreach` podbijaj go, gdy `$score > $max`. Wypisz „Najlepszy: 9” w `#result` — bez wbudowanego `max()`.',
      starter: pageE('$scores = [4, 9, 7, 2];\n// TODO: $max przez foreach i porównanie >', '      <p id="result">Najlepszy: <?php // TODO: $max ?></p>'),
      solution: pageE('$scores = [4, 9, 7, 2];\n$max = $scores[0];\nforeach ($scores as $score) {\n  if ($score > $max) {\n    $max = $score;\n  }\n}', '      <p id="result">Najlepszy: <?= e($max) ?></p>'),
      checks: [
        codeLine('foreach', 'Przejdź po wynikach pętlą `foreach`.', 'foreach\\s*\\('),
        codeLine('>', 'Podbijaj `$max` porównaniem `$score > $max`.', '\\$score\\s*>\\s*\\$max|\\$max\\s*<\\s*\\$score'),
        notHandLiteral('max\\s*\\(', 'Nie używaj wbudowanego `max()` — to zadanie o algorytmie.'),
        text('#result', 'Najlepszy: 9'),
        notHandLiteral('>Najlepszy: 9<', 'Wynik ma wyjść z porównań — nie ze stałego tekstu.'),
      ],
    },
  ],
  607: [
    {
      suffix: 'guided',
      title: 'Funkcja greet',
      prompt: 'Napisz `function greet($name)` zwracającą „Cześć, <imię>!” przez `return`. Wywołaj ją dla „Ola” i wypisz wynik w `#result`.',
      starter: profilePage('// TODO: function greet($name) { return …; }', '      <p id="result"><?php // TODO: echo greet(\'Ola\') ?></p>'),
      solution: pageE('function greet($name) {\n  return \'Cześć, \' . $name . \'!\';\n}', '      <p id="result"><?= e(greet(\'Ola\')) ?></p>'),
      steps: [
        'Zdefiniuj `function greet($name)`.',
        'Zwróć przez `return` napis „Cześć, ” . $name . „!”.',
        'Wypisz `e(greet(\'Ola\'))` w `#result`.',
      ],
      checks: [
        codeLine('function greet', 'Zdefiniuj `function greet($name)` (nie w komentarzu).', 'function\\s+greet'),
        codeLine('return', 'Funkcja zwraca wartość przez `return`.', 'return'),
        text('#result', 'Cześć, Ola!'),
        notHandLiteral('>Cześć, Ola!<', 'Wynik ma zwracać funkcja — nie stały tekst w HTML.'),
      ],
    },
    {
      suffix: 'modified',
      title: 'isAdult podejmuje decyzję',
      prompt: 'Funkcja może zwracać decyzję: napisz `function isAdult($age)` zwracającą `true`/`false` (`return $age >= 18;`). Dla `$age = 16` użyj jej w warunku i wypisz w `#result` „Osoba nieletnia” — a dla pełnoletnich „Osoba pełnoletnia”.',
      starter: profilePage('$age = 16;\n// TODO: function isAdult($age) { return …; } i warunek używający wyniku', '      <p id="result"><?php // TODO: $label z warunku ?></p>'),
      solution: pageE('$age = 16;\nfunction isAdult($age) {\n  return $age >= 18;\n}\n$label = isAdult($age) ? \'Osoba pełnoletnia\' : \'Osoba nieletnia\';', '      <p id="result"><?= e($label) ?></p>'),
      checks: [
        codeLine('function isAdult', 'Zdefiniuj `function isAdult($age)`.', 'function\\s+isAdult'),
        codeLine('return', 'Funkcja zwraca decyzję przez `return`.', 'return'),
        codeLine('isAdult(', 'Warunek używa wyniku `isAdult($age)`.', 'isAdult\\('),
        text('#result', 'Osoba nieletnia'),
        notHandLiteral('>Osoba nieletnia<', 'Wynik ma ustawiać funkcja i warunek.'),
      ],
    },
    {
      suffix: 'independent',
      title: 'Celsjusz na Fahrenheit',
      prompt: 'Napisz `function toFahrenheit($c)` zwracającą przeliczenie `$c * 9 / 5 + 32`. Dla `$tempC = 20` wypisz w `#result` „20 °C = 68 °F” — wartość °F ma pochodzić z wywołania funkcji.',
      starter: profilePage('$tempC = 20;\n// TODO: function toFahrenheit($c) zwraca $c * 9 / 5 + 32', '      <p id="result"><?= $tempC ?> °C = <?php // TODO: toFahrenheit($tempC) ?> °F</p>'),
      solution: pageE('$tempC = 20;\nfunction toFahrenheit($c) {\n  return $c * 9 / 5 + 32;\n}', '      <p id="result"><?= e($tempC) ?> °C = <?= e(toFahrenheit($tempC)) ?> °F</p>'),
      checks: [
        codeLine('function toFahrenheit', 'Zdefiniuj `function toFahrenheit($c)`.', 'function\\s+toFahrenheit'),
        codeLine('return', 'Funkcja zwraca wynik przez `return`.', 'return'),
        codeLine('toFahrenheit(', 'Wypisz wartość z wywołania `toFahrenheit($tempC)`.', 'toFahrenheit\\('),
        text('#result', '20 °C = 68 °F'),
        notHandLiteral('>68 °F<', 'Wartość °F ma wyliczyć funkcja — nie stały tekst.'),
      ],
    },
  ],
  608: [
    {
      suffix: 'guided',
      title: 'Formularz wita po imieniu',
      prompt: 'Strona ma prawdziwy formularz `method="post"` z polem `name="name"`. Rozdziel widok po metodzie żądania: dla POST ustaw `$message` na „Witaj, <imię>!” — imię z `$_POST[\'name\']` (domyślnie „Gościu”) zabezpieczone `htmlspecialchars`; dla innych metod zostaw zachętę „Wypełnij formularz i wyślij.”. W podglądzie możesz wpisać imię i kliknąć Wyślij — to prawdziwe żądanie POST do PHP.',
      starter: formPage('// TODO: dla POST ustaw powitanie z $_POST[\'name\'] (htmlspecialchars)\n$message = \'Wypełnij formularz i wyślij.\';', '      <h1>Powitanie</h1>\n      <p id="result"><?= $message ?></p>\n      <form id="hello" method="post" action="index.php">\n        <label for="person">Imię</label>\n        <input id="person" name="name" required>\n        <button type="submit">Wyślij</button>\n      </form>', 'Powitanie'),
      solution: formPage('if ($_SERVER[\'REQUEST_METHOD\'] === \'POST\') {\n  $name = htmlspecialchars($_POST[\'name\'] ?? \'Gościu\', ENT_QUOTES, \'UTF-8\');\n  $message = "Witaj, $name!";\n} else {\n  $message = \'Wypełnij formularz i wyślij.\';\n}', '      <h1>Powitanie</h1>\n      <p id="result"><?= $message ?></p>\n      <form id="hello" method="post" action="index.php">\n        <label for="person">Imię</label>\n        <input id="person" name="name" required>\n        <button type="submit">Wyślij</button>\n      </form>', 'Powitanie'),
      steps: [
        'Atrybut `name="name"` pola tworzy klucz w `$_POST` — to name, nie id.',
        'Rozdziel metody: `if ($_SERVER[\'REQUEST_METHOD\'] === \'POST\') { … } else { … }`.',
        'W gałęzi POST ustaw `$message = "Witaj, " . htmlspecialchars($_POST[\'name\'] ?? \'Gościu\', ENT_QUOTES, \'UTF-8\') . "!";`.',
        'W `else` zostaw `$message = \'Wypełnij formularz i wyślij.\';`.',
        '▶ Play pokazuje widok GET; wpisz imię i kliknij Wyślij — skrypt podglądu wyśle POST do tego samego pliku.',
      ],
      checks: [
        codeLine('REQUEST_METHOD', 'Rozdziel widok po `$_SERVER[\'REQUEST_METHOD\']`.', 'REQUEST_METHOD'),
        source('$_POST'),
        source('htmlspecialchars'),
        ['phpRequest', 'GET pokazuje zachętę „Wypełnij formularz i wyślij.”.', { request: { method: 'GET' }, selector: '#result', expected: 'Wypełnij formularz i wyślij.' }],
        ['phpRequest', 'POST z imieniem Ala pokazuje „Witaj, Ala!”.', { request: { method: 'POST', form: { name: 'Ala' } }, selector: '#result', expected: 'Witaj, Ala!' }],
        ['interaction', 'Wpisz imię „Zosia” w pole formularza.', { selector: '#person', action: 'input', value: 'Zosia', expected: {} }],
        ['interaction', 'Kliknięcie Wyślij wysyła POST i pokazuje „Witaj, Zosia!”.', { selector: '#hello button[type="submit"]', resultSelector: '#result', expected: { beforeText: 'Wypełnij formularz i wyślij.', textEquals: 'Witaj, Zosia!' } }],
      ],
    },
    {
      suffix: 'modified',
      title: 'Puste imię nie przejdzie',
      prompt: '`required` w HTML przepuszcza same spacje — walidację trzeba powtórzyć w PHP. W gałęzi POST odczytaj pole, sprawdź `is_string`, zrób `trim`: pusty wynik → „Podaj imię.”, poprawny → „Witaj, <imię>!” przez `htmlspecialchars` jak wcześniej.',
      starter: formPage('if ($_SERVER[\'REQUEST_METHOD\'] === \'POST\') {\n  $name = htmlspecialchars($_POST[\'name\'] ?? \'Gościu\', ENT_QUOTES, \'UTF-8\');\n  $message = "Witaj, $name!";\n} else {\n  $message = \'Wypełnij formularz i wyślij.\';\n}\n// TODO: puste/spacjowe imię w POST → „Podaj imię.”', '      <h1>Powitanie</h1>\n      <p id="result"><?= $message ?></p>\n      <form id="hello" method="post" action="index.php">\n        <label for="person">Imię</label>\n        <input id="person" name="name" required>\n        <button type="submit">Wyślij</button>\n      </form>', 'Powitanie'),
      solution: formPage('if ($_SERVER[\'REQUEST_METHOD\'] === \'POST\') {\n  $raw = $_POST[\'name\'] ?? \'\';\n  $name = is_string($raw) ? trim($raw) : \'\';\n  $message = $name === \'\'\n    ? \'Podaj imię.\'\n    : \'Witaj, \' . htmlspecialchars($name, ENT_QUOTES, \'UTF-8\') . \'!\';\n} else {\n  $message = \'Wypełnij formularz i wyślij.\';\n}', '      <h1>Powitanie</h1>\n      <p id="result"><?= $message ?></p>\n      <form id="hello" method="post" action="index.php">\n        <label for="person">Imię</label>\n        <input id="person" name="name" required>\n        <button type="submit">Wyślij</button>\n      </form>', 'Powitanie'),
      checks: [
        codeLine('is_string', 'Sprawdź `is_string`, zanim przyjmiesz wartość pola.', 'is_string'),
        codeLine('trim', 'Użyj `trim` — same spacje to puste imię.', 'trim\\s*\\('),
        ['phpRequest', 'GET nadal pokazuje zachętę.', { request: { method: 'GET' }, selector: '#result', expected: 'Wypełnij formularz i wyślij.' }],
        ['phpRequest', 'POST z imieniem Ola pokazuje „Witaj, Ola!”.', { request: { method: 'POST', form: { name: 'Ola' } }, selector: '#result', expected: 'Witaj, Ola!' }],
        ['phpRequest', 'POST z samymi spacjami pokazuje „Podaj imię.”.', { request: { method: 'POST', form: { name: '   ' } }, selector: '#result', expected: 'Podaj imię.' }],
        ['interaction', 'Wpisz same spacje — `required` je przepuści.', { selector: '#person', action: 'input', value: '   ', expected: {} }],
        ['interaction', 'Po wysłaniu spacji PHP odpowiada „Podaj imię.”.', { selector: '#hello button[type="submit"]', resultSelector: '#result', expected: { beforeText: 'Wypełnij formularz i wyślij.', textEquals: 'Podaj imię.' } }],
      ],
    },
    {
      suffix: 'independent',
      title: 'Ankieta: formularz i podziękowanie',
      prompt: 'Ta sama strona ma dwa widoki. GET pokazuje `#survey`: imię (`#person`, `name="name"`, required) i radiogrupę `name="przedmiot"` z wartościami matematyka/polski/angielski. Poprawny POST pokazuje `#thanks` z „Dziękujemy, <imię>!” i „Twój głos: <przedmiot>.” — oba przez `htmlspecialchars`. POST z błędnymi danymi wraca do formularza z `#error` „Wypełnij wszystkie pola ankiety.” — przedmiot sprawdź `in_array` wobec listy opcji.',
      starter: formPage('$view = \'form\';\n$error = \'\';\n// TODO: POST — odczytaj name i przedmiot; puste imię lub zły przedmiot → $error,\n// poprawne dane → $view = \'thanks\' i bezpieczne $safeName/$safeSubject', '      <?php if ($view === \'thanks\'): ?>\n        <section id="thanks">\n          <h1>Dziękujemy, <?= $safeName ?? \'\' ?>!</h1>\n          <p>Twój głos: <?= $safeSubject ?? \'\' ?>.</p>\n        </section>\n      <?php else: ?>\n        <h1>Ankieta</h1>\n        <form id="survey" method="post" action="index.php">\n          <p id="error"><?= $error ?></p>\n          <label for="person">Imię</label>\n          <input id="person" name="name" required>\n          <fieldset>\n            <legend>Ulubiony przedmiot</legend>\n            <label><input type="radio" name="przedmiot" id="r-mat" value="matematyka"> matematyka</label>\n            <label><input type="radio" name="przedmiot" id="r-pol" value="polski"> polski</label>\n            <label><input type="radio" name="przedmiot" id="r-ang" value="angielski"> angielski</label>\n          </fieldset>\n          <button type="submit">Wyślij ankietę</button>\n        </form>\n      <?php endif; ?>', 'Ankieta'),
      solution: formPage('$view = \'form\';\n$error = \'\';\nif ($_SERVER[\'REQUEST_METHOD\'] === \'POST\') {\n  $rawName = $_POST[\'name\'] ?? \'\';\n  $name = is_string($rawName) ? trim($rawName) : \'\';\n  $subject = $_POST[\'przedmiot\'] ?? \'\';\n  if ($name === \'\' || !in_array($subject, [\'matematyka\', \'polski\', \'angielski\'], true)) {\n    $error = \'Wypełnij wszystkie pola ankiety.\';\n  } else {\n    $view = \'thanks\';\n    $safeName = htmlspecialchars($name, ENT_QUOTES, \'UTF-8\');\n    $safeSubject = htmlspecialchars($subject, ENT_QUOTES, \'UTF-8\');\n  }\n}', '      <?php if ($view === \'thanks\'): ?>\n        <section id="thanks">\n          <h1>Dziękujemy, <?= $safeName ?? \'\' ?>!</h1>\n          <p>Twój głos: <?= $safeSubject ?? \'\' ?>.</p>\n        </section>\n      <?php else: ?>\n        <h1>Ankieta</h1>\n        <form id="survey" method="post" action="index.php">\n          <p id="error"><?= $error ?></p>\n          <label for="person">Imię</label>\n          <input id="person" name="name" required>\n          <fieldset>\n            <legend>Ulubiony przedmiot</legend>\n            <label><input type="radio" name="przedmiot" id="r-mat" value="matematyka"> matematyka</label>\n            <label><input type="radio" name="przedmiot" id="r-pol" value="polski"> polski</label>\n            <label><input type="radio" name="przedmiot" id="r-ang" value="angielski"> angielski</label>\n          </fieldset>\n          <button type="submit">Wyślij ankietę</button>\n        </form>\n      <?php endif; ?>', 'Ankieta'),
      checks: [
        codeLine('REQUEST_METHOD', 'Rozpoznaj metodę żądania.', 'REQUEST_METHOD'),
        source('$_POST'),
        codeLine('in_array', 'Przedmiot sprawdź przez `in_array` z listą dozwolonych wartości.', 'in_array'),
        source('htmlspecialchars'),
        ['phpRequest', 'GET pokazuje formularz ankiety.', { request: { method: 'GET' }, selector: '#survey', expected: 'Ulubiony przedmiot' }],
        ['phpRequest', 'Poprawny POST pokazuje „Dziękujemy, Ola!”.', { request: { method: 'POST', form: { name: 'Ola', przedmiot: 'matematyka' } }, selector: '#thanks h1', expected: 'Dziękujemy, Ola!' }],
        ['phpRequest', 'Poprawny POST powtarza wybrany głos.', { request: { method: 'POST', form: { name: 'Ola', przedmiot: 'matematyka' } }, selector: '#thanks p', expected: 'matematyka' }],
        ['phpRequest', 'POST bez przedmiotu pokazuje błąd w formularzu.', { request: { method: 'POST', form: { name: 'Ola' } }, selector: '#error', expected: 'Wypełnij wszystkie pola ankiety.' }],
        ['interaction', 'Wpisz imię „Ola” w ankietę.', { selector: '#person', action: 'input', value: 'Ola', expected: {} }],
        ['interaction', 'Zaznacz opcję „matematyka”.', { selector: '#r-mat', expected: {} }],
        ['interaction', 'Wysłanie ankiety pokazuje podziękowanie.', { selector: '#survey button[type="submit"]', resultSelector: '#thanks h1', expected: { textEquals: 'Dziękujemy, Ola!' } }],
      ],
    },
  ],
  609: [
    {
      suffix: 'guided',
      title: 'Formularz buduje kartę',
      prompt: 'Projekt łączy wszystko z poprzednich lekcji. GET pokazuje `#profile-form` z polami `author`, `bio` i `skills` (umiejętności po przecinku). POST zbiera dane: `$author` i `$bio` przez `is_string` + `trim`, `$skills` przez `explode(\',\', …)` + `array_map(\'trim\', …)` + `array_filter`. Gdy autor nie jest pusty, przełącz `$view` na `\'card\'` — widok karty wypisuje `h1`, `#bio` i `<li>` przez `foreach` z `e()`.',
      starter: formPage(`$view = 'form';
$author = ''; $bio = ''; $skills = [];
${escapeText}
// TODO: POST — odczytaj author/bio/skills z $_POST (is_string, trim, explode)
// i gdy $author nie jest pusty przełącz $view na 'card'`, `      <?php if ($view === 'card'): ?>
        <h1><?= e($author) ?></h1>
        <p id="bio"><?= e($bio) ?></p>
        <ul id="skills">
          <?php foreach ($skills as $skill): ?>
            <li><?= e($skill) ?></li>
          <?php endforeach; ?>
        </ul>
      <?php else: ?>
        <h1>Karta profilu</h1>
        <form id="profile-form" method="post" action="index.php">
          <label for="f-author">Autor</label>
          <input id="f-author" name="author" required>
          <label for="f-bio">Bio</label>
          <input id="f-bio" name="bio">
          <label for="f-skills">Umiejętności (po przecinku)</label>
          <input id="f-skills" name="skills" placeholder="HTML, PHP">
          <button type="submit">Generuj kartę</button>
        </form>
      <?php endif; ?>`, 'Karta profilu'),
      solution: formPage(`$view = 'form';
$author = ''; $bio = ''; $skills = [];
${escapeText}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $author = is_string($_POST['author'] ?? '') ? trim($_POST['author']) : '';
  $bio = is_string($_POST['bio'] ?? '') ? trim($_POST['bio']) : '';
  $skills = array_filter(array_map('trim', explode(',', (string)($_POST['skills'] ?? ''))));
  if ($author !== '') $view = 'card';
}`, `      <?php if ($view === 'card'): ?>
        <h1><?= e($author) ?></h1>
        <p id="bio"><?= e($bio) ?></p>
        <ul id="skills">
          <?php foreach ($skills as $skill): ?>
            <li><?= e($skill) ?></li>
          <?php endforeach; ?>
        </ul>
      <?php else: ?>
        <h1>Karta profilu</h1>
        <form id="profile-form" method="post" action="index.php">
          <label for="f-author">Autor</label>
          <input id="f-author" name="author" required>
          <label for="f-bio">Bio</label>
          <input id="f-bio" name="bio">
          <label for="f-skills">Umiejętności (po przecinku)</label>
          <input id="f-skills" name="skills" placeholder="HTML, PHP">
          <button type="submit">Generuj kartę</button>
        </form>
      <?php endif; ?>`, 'Karta profilu'),
      steps: [
        'Dane karty przychodzą z `$_POST` — najpierw `is_string`, potem `trim`.',
        'Pole `skills` to jeden tekst — `explode(\',\', …)` + `array_map(\'trim\', …)` + `array_filter` daje czystą tablicę.',
        'Niepusty `$author` przełącza `$view` na `\'card\'` — formularz znika, pojawia się karta.',
        'W widoku karty każdą wartość wypisuj przez `e()` — dane z formularza są niezaufane.',
        '▶ Play pokazuje formularz; wypełnij go i kliknij Generuj kartę — skrypt podglądu wyśle POST.',
      ],
      checks: [
        codeLine('REQUEST_METHOD', 'Rozdziel widok po `$_SERVER[\'REQUEST_METHOD\']`.', 'REQUEST_METHOD'),
        source('$_POST'),
        codeLine('explode', 'Pole skills rozbij przez `explode`.', 'explode\\s*\\('),
        source('foreach'),
        codeLine('e(', 'Wypisz wartości przez e()/htmlspecialchars (nie w komentarzu).', 'e\\(\\s*\\$'),
        ['phpRequest', 'GET pokazuje formularz profilu.', { request: { method: 'GET' }, selector: '#profile-form', expected: 'Generuj kartę' }],
        ['phpRequest', 'POST buduje kartę z autorem „Kamil”.', { request: { method: 'POST', form: { author: 'Kamil', bio: 'Uczę się programowania webowego', skills: 'HTML, PHP, <em>git</em>' } }, selector: 'h1', expected: 'Kamil' }],
        ['phpRequest', 'POST wypisuje bio z formularza.', { request: { method: 'POST', form: { author: 'Kamil', bio: 'Uczę się programowania webowego', skills: 'HTML, PHP, <em>git</em>' } }, selector: '#bio', expected: 'Uczę się programowania webowego' }],
        ['phpRequest', 'POST renderuje umiejętność „PHP”.', { request: { method: 'POST', form: { author: 'Kamil', bio: 'Uczę się programowania webowego', skills: 'HTML, PHP, <em>git</em>' } }, selector: '#skills li:nth-child(2)', expected: 'PHP' }],
        ['phpRequest', 'Umiejętność „<em>git</em>” wypisana jest dosłownie.', { request: { method: 'POST', form: { author: 'Kamil', bio: 'Uczę się programowania webowego', skills: 'HTML, PHP, <em>git</em>' } }, selector: '#skills li:nth-child(3)', expected: '<em>git</em>' }],
        ['interaction', 'Wpisz autora „Kamil”.', { selector: '#f-author', action: 'input', value: 'Kamil', expected: {} }],
        ['interaction', 'Wpisz umiejętności „HTML, PHP”.', { selector: '#f-skills', action: 'input', value: 'HTML, PHP', expected: {} }],
        ['interaction', 'Generuj kartę pokazuje h1 z autorem.', { selector: '#profile-form button[type="submit"]', resultSelector: 'h1', expected: { textEquals: 'Kamil' } }],
        notHandLiteral('>Kamil<', 'Nie wpisuj „Kamil” na sztywno w HTML — autor ma pochodzić z $_POST.'),
      ],
    },
    {
      suffix: 'modified',
      title: 'Komunikat przy pustej liście',
      prompt: 'Karta działa. Dodaj gałąź w widoku `card`: gdy `$skills` jest pustą tablicą, wypisz `<p class="empty">Brak umiejętności.</p>` zamiast pustego `<ul>`. Pełna lista ma nadal działać.',
      starter: formPage(`$view = 'form';
$author = ''; $bio = ''; $skills = [];
${escapeText}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $author = is_string($_POST['author'] ?? '') ? trim($_POST['author']) : '';
  $bio = is_string($_POST['bio'] ?? '') ? trim($_POST['bio']) : '';
  $skills = array_filter(array_map('trim', explode(',', (string)($_POST['skills'] ?? ''))));
  if ($author !== '') $view = 'card';
}`, `      <?php if ($view === 'card'): ?>
        <h1><?= e($author) ?></h1>
        <p id="bio"><?= e($bio) ?></p>
        <ul id="skills">
          <?php foreach ($skills as $skill): ?>
            <li><?= e($skill) ?></li>
          <?php endforeach; ?>
        </ul>
        <!-- TODO: gdy $skills jest puste, pokaż "Brak umiejętności." zamiast listy -->
      <?php else: ?>
        <h1>Karta profilu</h1>
        <form id="profile-form" method="post" action="index.php">
          <label for="f-author">Autor</label>
          <input id="f-author" name="author" required>
          <label for="f-bio">Bio</label>
          <input id="f-bio" name="bio">
          <label for="f-skills">Umiejętności (po przecinku)</label>
          <input id="f-skills" name="skills" placeholder="HTML, PHP">
          <button type="submit">Generuj kartę</button>
        </form>
      <?php endif; ?>`, 'Karta profilu'),
      solution: formPage(`$view = 'form';
$author = ''; $bio = ''; $skills = [];
${escapeText}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $author = is_string($_POST['author'] ?? '') ? trim($_POST['author']) : '';
  $bio = is_string($_POST['bio'] ?? '') ? trim($_POST['bio']) : '';
  $skills = array_filter(array_map('trim', explode(',', (string)($_POST['skills'] ?? ''))));
  if ($author !== '') $view = 'card';
}`, `      <?php if ($view === 'card'): ?>
        <h1><?= e($author) ?></h1>
        <p id="bio"><?= e($bio) ?></p>
        <?php if (count($skills) === 0): ?>
          <p class="empty">Brak umiejętności.</p>
        <?php else: ?>
          <ul id="skills">
            <?php foreach ($skills as $skill): ?>
              <li><?= e($skill) ?></li>
            <?php endforeach; ?>
          </ul>
        <?php endif; ?>
      <?php else: ?>
        <h1>Karta profilu</h1>
        <form id="profile-form" method="post" action="index.php">
          <label for="f-author">Autor</label>
          <input id="f-author" name="author" required>
          <label for="f-bio">Bio</label>
          <input id="f-bio" name="bio">
          <label for="f-skills">Umiejętności (po przecinku)</label>
          <input id="f-skills" name="skills" placeholder="HTML, PHP">
          <button type="submit">Generuj kartę</button>
        </form>
      <?php endif; ?>`, 'Karta profilu'),
      checks: [
        codeLine('count(', 'Sprawdź pustą listę przez count()/empty() lub porównanie z [].', '(count\\(\\$skills\\)|empty\\(\\$skills\\)|\\$skills\\s*===?\\s*\\[\\s*\\])'),
        source('Brak umiejętności.'),
        ['phpRequest', 'GET nadal pokazuje formularz.', { request: { method: 'GET' }, selector: '#profile-form', expected: 'Generuj kartę' }],
        ['phpRequest', 'POST bez umiejętności pokazuje komunikat.', { request: { method: 'POST', form: { author: 'Kamil', bio: 'Uczę się programowania webowego', skills: '' } }, selector: '.empty', expected: 'Brak umiejętności.' }],
        ['phpRequest', 'POST z listą nadal renderuje umiejętności.', { request: { method: 'POST', form: { author: 'Kamil', bio: 'Uczę się programowania webowego', skills: 'HTML, PHP, <em>git</em>' } }, selector: '#skills li:nth-child(2)', expected: 'PHP' }],
        ['phpRequest', 'Umiejętność „<em>git</em>” wypisana jest dosłownie.', { request: { method: 'POST', form: { author: 'Kamil', bio: 'Uczę się programowania webowego', skills: 'HTML, PHP, <em>git</em>' } }, selector: '#skills li:nth-child(3)', expected: '<em>git</em>' }],
        ['interaction', 'Wpisz autora „Kamil” bez umiejętności.', { selector: '#f-author', action: 'input', value: 'Kamil', expected: {} }],
        ['interaction', 'Generuj kartę pokazuje komunikat o pustej liście.', { selector: '#profile-form button[type="submit"]', resultSelector: '.empty', expected: { textEquals: 'Brak umiejętności.' } }],
      ],
    },
    {
      suffix: 'independent',
      title: 'Własna karta z walidacją',
      prompt: 'Zbuduj własną kartę od zera — Ty decydujesz o polach. Wymagania: GET pokazuje formularz `#profile-form` z polami `author` (`#f-author`) i `skills`; POST z pustym/spacjowym autorem wraca do formularza z `#error` „Podaj autora.”, a poprawny POST pokazuje kartę: `h1` z autorem, `#bio` (może być puste) i `#skills` z `<li>` przez `foreach` + `e()`. Jedna umiejętność w teście zawiera `a > b` — musi wypisać się dosłownie.',
      starter: formPage('// Napisz własną kartę: $view \'form\'/\'card\', walidacja autora, foreach + e().', `      <h1>Karta profilu</h1>
      <form id="profile-form" method="post" action="index.php">
        <p id="error"></p>
        <label for="f-author">Autor</label>
        <input id="f-author" name="author" required>
        <label for="f-bio">Bio</label>
        <input id="f-bio" name="bio">
        <label for="f-skills">Umiejętności (po przecinku)</label>
        <input id="f-skills" name="skills" placeholder="HTML, PHP">
        <button type="submit">Generuj kartę</button>
      </form>`, 'Karta profilu'),
      solution: formPage(`$view = 'form';
$author = ''; $bio = ''; $skills = []; $error = '';
${escapeText}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $author = is_string($_POST['author'] ?? '') ? trim($_POST['author']) : '';
  $bio = is_string($_POST['bio'] ?? '') ? trim($_POST['bio']) : '';
  $skills = array_filter(array_map('trim', explode(',', (string)($_POST['skills'] ?? ''))));
  if ($author === '') {
    $error = 'Podaj autora.';
  } else {
    $view = 'card';
  }
}`, `      <?php if ($view === 'card'): ?>
        <h1><?= e($author) ?></h1>
        <p id="bio"><?= e($bio) ?></p>
        <ul id="skills">
          <?php foreach ($skills as $skill): ?>
            <li><?= e($skill) ?></li>
          <?php endforeach; ?>
        </ul>
      <?php else: ?>
        <h1>Karta profilu</h1>
        <form id="profile-form" method="post" action="index.php">
          <p id="error"><?= $error ?></p>
          <label for="f-author">Autor</label>
          <input id="f-author" name="author" required>
          <label for="f-bio">Bio</label>
          <input id="f-bio" name="bio">
          <label for="f-skills">Umiejętności (po przecinku)</label>
          <input id="f-skills" name="skills" placeholder="HTML, PHP">
          <button type="submit">Generuj kartę</button>
        </form>
      <?php endif; ?>`, 'Karta profilu'),
      checks: [
        codeLine('REQUEST_METHOD', 'Rozpoznaj metodę żądania.', 'REQUEST_METHOD'),
        source('$_POST'),
        codeLine('trim', 'Autor przejdź przez `trim` — same spacje to puste pole.', 'trim\\s*\\('),
        codeLine('$error', 'Błąd walidacji zapisz do `$error` i wypisz go w `#error`.', '\\$error'),
        source('foreach'),
        codeLine('e(', 'Wypisz wartości przez e()/htmlspecialchars.', 'e\\(\\s*\\$'),
        ['phpRequest', 'GET pokazuje formularz.', { request: { method: 'GET' }, selector: '#profile-form', expected: 'Generuj kartę' }],
        ['phpRequest', 'POST pokazuje kartę „Ania”.', { request: { method: 'POST', form: { author: 'Ania', bio: 'Koduje w szkole i po szkole', skills: 'CSS, JavaScript, a > b' } }, selector: 'h1', expected: 'Ania' }],
        ['phpRequest', 'POST renderuje trzecią umiejętność.', { request: { method: 'POST', form: { author: 'Ania', bio: 'Koduje w szkole i po szkole', skills: 'CSS, JavaScript, a > b' } }, selector: '#skills li:nth-child(3)', expected: 'a > b' }],
        ['phpRequest', 'POST ze spacjowym autorem pokazuje błąd.', { request: { method: 'POST', form: { author: '   ', bio: '', skills: 'HTML' } }, selector: '#error', expected: 'Podaj autora.' }],
        ['interaction', 'Wpisz autora „Ania”.', { selector: '#f-author', action: 'input', value: 'Ania', expected: {} }],
        ['interaction', 'Wpisz umiejętności „CSS, a > b”.', { selector: '#f-skills', action: 'input', value: 'CSS, a > b', expected: {} }],
        ['interaction', 'Generuj kartę pokazuje h1 z autorem.', { selector: '#profile-form button[type="submit"]', resultSelector: 'h1', expected: { textEquals: 'Ania' } }],
      ],
    },
  ],
  613: [
    {
      title: 'Klasa Profile z metodą',
      prompt: 'Uzupełnij klasę `Profile`: konstruktor z promowanymi właściwościami `$name` i `$role` oraz metodę `label()` zwracającą `"{$this->name} — {$this->role}"`. Utwórz obiekt przez `new Profile` i wypisz `<?= e($profile->label()) ?>` w `h1`.',
      starter: `<?php
class Profile {
  public function __construct() {
    // TODO: promowane właściwości $name i $role
  }
  public function label(): string {
    // TODO: zwróć "{$this->name} — {$this->role}"
  }
}
${escapeText}
?>
<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Karta profilu</title>
</head>
<body>
  <main>
    <article class="profile">
      <h1><?= 'Tu ma trafić profil' ?></h1>
    </article>
  </main>
</body>
</html>
`,
      solution: `<?php
class Profile {
  public function __construct(
    public string $name,
    public string $role,
  ) {}
  public function label(): string {
    return "{$this->name} — {$this->role}";
  }
}
$profile = new Profile('Ala', 'uczeń');
${escapeText}
?>
<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Karta profilu</title>
</head>
<body>
  <main>
    <article class="profile">
      <h1><?= e($profile->label()) ?></h1>
    </article>
  </main>
</body>
</html>
`,
      steps: [
        'W konstruktorze dopisz promowane parametry: `public string $name, public string $role`.',
        'W `label()` zwróć `"{$this->name} — {$this->role}"`.',
        'Pod klasą utwórz obiekt: `$profile = new Profile(\'Ala\', \'uczeń\')`.',
        'W `h1` wypisz `<?= e($profile->label()) ?>` — przez `->` wołasz metodę obiektu.',
      ],
      checks: [
        ['sourceMatches', 'Zdefiniuj klasę Profile.', { file: 'index.php', pattern: 'class\\s+Profile' }],
        ['sourceMatches', 'Utwórz obiekt przez new Profile(...).', { file: 'index.php', pattern: 'new\\s+Profile\\s*\\(' }],
        ['sourceMatches', 'Wywołaj metodę przez $profile->label().', { file: 'index.php', pattern: '->label\\(\\)' }],
        ['textEquals', 'h1 pokazuje „Ala — uczeń” z metody obiektu.', { selector: 'h1', expected: 'Ala — uczeń' }],
        notHandLiteral('>Ala — uczeń<', 'Wynik ma pochodzić z metody obiektu — nie ze stałego tekstu w HTML.'),
      ],
    },
    {
      title: 'Właściwość z listą',
      prompt: 'Klasa działa. Dodaj promowaną właściwość `array $skills` (np. `[\'PHP\', \'HTML\', \'git\']`) i wypisz ją jako `<li>` przez `foreach` z `e()`. Pod listą pokaż liczbę umiejętności przez `$profile->skillsCount()`.',
      starter: `<?php
class Profile {
  public function __construct(
    public string $name,
    public string $role,
  ) {}
  public function label(): string {
    return "{$this->name} — {$this->role}";
  }
}
$profile = new Profile('Ala', 'uczeń');
${escapeText}
?>
<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Karta profilu</title>
</head>
<body>
  <main>
    <article class="profile">
      <h1><?= e($profile->label()) ?></h1>
      <!-- TODO: właściwość $skills, lista <li> i skillsCount() -->
    </article>
  </main>
</body>
</html>
`,
      solution: `<?php
class Profile {
  public function __construct(
    public string $name,
    public string $role,
    public array $skills,
  ) {}
  public function label(): string {
    return "{$this->name} — {$this->role}";
  }
  public function skillsCount(): int {
    return count($this->skills);
  }
}
$profile = new Profile('Ala', 'uczeń', ['PHP', 'HTML', 'git']);
${escapeText}
?>
<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Karta profilu</title>
</head>
<body>
  <main>
    <article class="profile">
      <h1><?= e($profile->label()) ?></h1>
      <ul id="skills">
        <?php foreach ($profile->skills as $skill): ?>
          <li><?= e($skill) ?></li>
        <?php endforeach; ?>
      </ul>
      <p id="count">Umiejętności: <?= e($profile->skillsCount()) ?></p>
    </article>
  </main>
</body>
</html>
`,
      checks: [
        ['sourceMatches', 'Właściwość $skills iterowana jest przez foreach (np. $profile->skills).', { file: 'index.php', pattern: '->skills' }],
        ['sourceMatches', 'Zdefiniuj i wywołaj metodę skillsCount().', { file: 'index.php', pattern: 'skillsCount' }],
        ['textEquals', 'Drugi <li> pokazuje „HTML”.', { selector: '#skills li:nth-child(2)', expected: 'HTML' }],
        ['textEquals', 'Licznik pokazuje „Umiejętności: 3”.', { selector: '#count', expected: 'Umiejętności: 3' }],
        notHandLiteral('<li>HTML</li>', 'Elementy <li> mają renderować się przez foreach — nie jako stały HTML.'),
      ],
    },
    {
      title: 'Stała klasy i filtr obiektów',
      prompt: 'Zdefiniuj klasę `Book` z promowanymi `$title` i `$year` oraz stałą `MIN_YEAR = 1900`. Utwórz tablicę obiektów `Book` i wypisz jako `<li>` tylko te, gdzie `$book->year >= Book::MIN_YEAR`.',
      starter: `<?php
// TODO: class Book { const MIN_YEAR = 1900; ... }
$books = [];
${escapeText}
?>
<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Biblioteka</title>
</head>
<body>
  <main>
    <ul id="books"></ul>
  </main>
</body>
</html>
`,
      solution: `<?php
class Book {
  const MIN_YEAR = 1900;
  public function __construct(
    public string $title,
    public int $year,
  ) {}
}
$books = [
  new Book('Pan Tadeusz', 1834),
  new Book('Lalka', 1890),
  new Book('Ferdydurke', 1937),
];
${escapeText}
?>
<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Biblioteka</title>
</head>
<body>
  <main>
    <ul id="books">
      <?php foreach ($books as $book): ?>
        <?php if ($book->year >= Book::MIN_YEAR): ?>
          <li><?= e($book->title) ?></li>
        <?php endif; ?>
      <?php endforeach; ?>
    </ul>
  </main>
</body>
</html>
`,
      checks: [
        ['sourceMatches', 'Zdefiniuj klasę Book.', { file: 'index.php', pattern: 'class\\s+Book' }],
        ['sourceMatches', 'Filtruj przez stałą Book::MIN_YEAR.', { file: 'index.php', pattern: 'Book::MIN_YEAR' }],
        ['sourceMatches', 'Twórz obiekty przez new Book(...).', { file: 'index.php', pattern: 'new\\s+Book\\s*\\(' }],
        ['textEquals', 'Lista pokazuje tylko „Ferdydurke” (1937 ≥ 1900).', { selector: '#books li:nth-child(1)', expected: 'Ferdydurke' }],
        ['textEquals', 'Cała lista to jeden tytuł — starsze książki są odfiltrowane.', { selector: '#books', expected: 'Ferdydurke' }],
        notHandLiteral('<li>Ferdydurke</li>', 'Wynik ma pochodzić z obiektów Book i filtru — nie ze stałego HTML.'),
      ],
    },
  ],
  614: [
    {
      title: 'Połącz się z bazą SQLite',
      prompt: 'W db.php utwórz połączenie: `$db = new PDO(\'sqlite:\' . $path);` i włącz tryb błędów `$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);`. Baza to plik biblioteka.sqlite obok kodu — przy pierwszym otwarciu db.php wczyta do niego dane z biblioteka.sql. Połączona baza pokaże w index.php liczbę książek.',
      starter: libraryCountPage,
      solution: libraryCountPage,
      starterFiles: sqliteFiles(sqliteDbFile(`// TODO: utwórz połączenie PDO ze sterownikiem sqlite
// i włącz tryb wyjątków (ERRMODE) — patrz kroki pod zadaniem.`)),
      solutionFiles: sqliteFiles(solvedDbFile),
      steps: [
        'W db.php dopisz `$db = new PDO(\'sqlite:\' . $path);` — baza to jeden plik obok kodu.',
        'Włącz wyjątki: `$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);` — błąd SQL rzuci PDOException zamiast milczeć.',
        'Blok `if (isset($db))` włącza klucze obce (PRAGMA) i przy pierwszym starcie wczytuje biblioteka.sql — nie zmieniaj go.',
        'Uruchom ▶ Play — index.php pokaże „Książek: 8”.',
      ],
      checks: [
        ['sourceMatches', 'Utwórz PDO przez `new PDO(\'sqlite:\' . $path)` w db.php.', { file: 'db.php', pattern: 'new\\s+PDO\\(\\s*[\'"]sqlite:' }],
        source('ERRMODE_EXCEPTION', 'db.php'),
        text('#result', 'Książek: 8'),
      ],
    },
    {
      title: 'Szukaj książki po roku',
      prompt: 'Formularz GET wysyła `?rok=` do tego samego index.php — możesz wpisać rok i kliknąć Szukaj. Zastąp pustą listę zapytaniem: `$db->prepare(\'SELECT tytul FROM ksiazki WHERE rok_wydania = :rok ORDER BY id\')`, `execute([\'rok\' => $year])` i `fetchAll(PDO::FETCH_ASSOC)`. Parametr `:rok` zostaje w SQL — nie wklejaj `$year` do zapytania.',
      starter: librarySearchPage('$books = []; // TODO: prepare → SELECT z :rok → execute → fetchAll', bookItem),
      solution: librarySearchPage(yearQuery, bookItem),
      starterFiles: sqliteFiles(solvedDbFile),
      solutionFiles: sqliteFiles(solvedDbFile),
      steps: [
        'Rok trafia do `$_GET[\'rok\']` przez formularz — `$year` już go rzutuje na int.',
        'Napisz `$query = $db->prepare(\'SELECT tytul FROM ksiazki WHERE rok_wydania = :rok ORDER BY id\');`.',
        'Wykonaj `$query->execute([\'rok\' => $year]);` — wartość idzie do parametru, nie do SQL.',
        'Pobierz `$books = $query->fetchAll(PDO::FETCH_ASSOC);`.',
        'Wpisz 1834 i kliknij Szukaj — „Pan Tadeusz” i „Kordian”; rok 2000 pokaże komunikat o braku wyników.',
      ],
      checks: [
        source('prepare'),
        source(':rok'),
        source('execute'),
        source('PDO::FETCH_ASSOC'),
        ['phpRequest', 'Dla ?rok=1834 pokazuje „Pan Tadeusz” jako pierwszą książkę.', { request: { method: 'GET', query: { rok: '1834' } }, selector: '#books li:nth-child(1)', expected: 'Pan Tadeusz' }],
        ['phpRequest', 'Dla ?rok=1834 pokazuje też „Kordian”.', { request: { method: 'GET', query: { rok: '1834' } }, selector: '#books li:nth-child(2)', expected: 'Kordian' }],
        ['phpRequest', 'Dla ?rok=2000 pokazuje „Brak pasujących książek.”.', { request: { method: 'GET', query: { rok: '2000' } }, selector: '#result', expected: 'Brak pasujących książek.' }],
        ['interaction', 'Wpisz rok 1890 w polu wyszukiwania.', { selector: '#rok', action: 'input', value: '1890', expected: {} }],
        ['interaction', 'Kliknięcie Szukaj pokazuje „Lalka” z roku 1890.', { selector: '#search button[type="submit"]', resultSelector: '#books li:nth-child(1)', expected: { beforeText: 'Pan Tadeusz', textEquals: 'Lalka' } }],
      ],
    },
    {
      title: 'Pokaż autorów przez JOIN',
      prompt: 'Wyszukiwanie działa, ale lista pokazuje same tytuły. Rozszerz zapytanie o autora: `SELECT k.tytul, a.imie, a.nazwisko FROM ksiazki AS k JOIN autorzy AS a ON a.id = k.autor_id WHERE k.rok_wydania = :rok ORDER BY k.id` — klucz `autor_id` z ksiazki wskazuje wiersz w autorzy. Każdy `<li>` ma pokazać „tytuł — imię i nazwisko”.',
      starter: librarySearchPage(yearQuery, bookItem),
      solution: librarySearchPage(joinQuery, joinItem),
      starterFiles: sqliteFiles(solvedDbFile),
      solutionFiles: sqliteFiles(solvedDbFile),
      steps: [
        'W SELECT zamień `tytul` na `k.tytul, a.imie, a.nazwisko` — `k` i `a` to aliasy (skróty) tabel.',
        'Dopisz `FROM ksiazki AS k JOIN autorzy AS a ON a.id = k.autor_id` — książka łączy się ze swoim autorem po kluczu.',
        'Warunek `k.rok_wydania = :rok` zostaje bez zmian.',
        'W `<li>` wypisz `e($book[\'tytul\'] . \' — \' . $book[\'imie\'] . \' \' . $book[\'nazwisko\'])`.',
        'Wpisz 1896 i kliknij Szukaj — „Quo vadis — Henryk Sienkiewicz”.',
      ],
      checks: [
        source('JOIN'),
        source('autor_id'),
        ['phpRequest', 'Dla ?rok=1834 pokazuje „Pan Tadeusz — Adam Mickiewicz”.', { request: { method: 'GET', query: { rok: '1834' } }, selector: '#books li:nth-child(1)', expected: 'Pan Tadeusz — Adam Mickiewicz' }],
        ['phpRequest', 'Dla ?rok=1834 pokazuje też „Kordian — Juliusz Słowacki”.', { request: { method: 'GET', query: { rok: '1834' } }, selector: '#books li:nth-child(2)', expected: 'Kordian — Juliusz Słowacki' }],
        ['phpRequest', 'Dla ?rok=2000 nadal pokazuje komunikat o braku wyników.', { request: { method: 'GET', query: { rok: '2000' } }, selector: '#result', expected: 'Brak pasujących książek.' }],
        ['interaction', 'Wpisz rok 1896 w polu wyszukiwania.', { selector: '#rok', action: 'input', value: '1896', expected: {} }],
        ['interaction', 'Kliknięcie Szukaj pokazuje „Quo vadis — Henryk Sienkiewicz”.', { selector: '#search button[type="submit"]', resultSelector: '#books li:nth-child(1)', expected: { beforeText: 'Pan Tadeusz — Adam Mickiewicz', textEquals: 'Quo vadis — Henryk Sienkiewicz' } }],
      ],
    },
  ],
  615: [
    {
      title: 'Klatka — kompletny portal filmowy',
      prompt: 'To jest gotowy projekt z przewodnika w zakładce Nauka: katalog filmów z plakatami, strony szczegółów, indeks aktorów i zarządzanie obsadą — każda strona to osobny plik PHP. Uruchom ▶ Play i poklikaj: wyszukaj film, wejdź w szczegóły, dodaj film przez „+ Film”, aktora przez „+ Aktor”, edytuj dane filmu i przypisuj aktorów do obsady. Potem skopiuj pliki do C:\\xampp\\htdocs\\klatka, wklej baza.sql w phpMyAdmin i podmień linię $dsn na mysql: — ta sama aplikacja zadziała na XAMPP.',
      starter: klatkaIndex,
      solution: klatkaIndex,
      starterFiles: klatkaFiles,
      checks: [
        source('new PDO'),
        source('plakat_url'),
        ['sourceIncludes', 'Strona dodawania zapisuje film przez INSERT.', { file: 'dodaj_film.php', value: 'INSERT INTO filmy' }],
        ['sourceIncludes', 'Strona edycji zapisuje zmiany przez UPDATE.', { file: 'edytuj_film.php', value: 'UPDATE filmy' }],
        ['phpRequest', 'Katalog index.php pokazuje siatkę kart z filmami.', { request: { path: 'index.php' }, selector: '.film-card h3 a', expected: 'Perfect Days' }],
        ['phpRequest', 'Katalog dla ?q=amelia pokazuje kartę „Amelia”.', { request: { path: 'index.php', query: { q: 'amelia' } }, selector: '.film-card h3 a', expected: 'Amelia' }],
        ['phpRequest', 'Strona film.php?id=2 pokazuje tytuł i obsadę.', { request: { path: 'film.php', query: { id: '2' } }, selector: '#film-title', expected: 'Między słowami' }],
        ['phpRequest', 'Profil aktor.php?id=3 pokazuje Billa Murraya.', { request: { path: 'aktor.php', query: { id: '3' } }, selector: '#actor-name', expected: 'Bill Murray' }],
        ['phpRequest', 'POST w dodaj_film.php zapisuje film i pokazuje sukces.', { request: { method: 'POST', path: 'dodaj_film.php', form: { tytul: 'Matrix', rok: '1999', gatunek: 'Sci-fi', opis: 'Klasyczna cyberopowieść o iluzji rzeczywistości.', plakat_url: '' } }, selector: '#added', expected: 'Dodano film „Matrix”' }],
        ['phpRequest', 'POST polacz w film.php dopisuje aktora do obsady.', { request: { method: 'POST', path: 'film.php', form: { akcja: 'polacz', film_id: '3', aktor_id: '3', rola: 'Étienne' } }, selector: '#obsada-list', expected: 'Bill Murray' }],
        ['phpRequest', 'POST w edytuj_film.php zapisuje zmiany przez UPDATE.', { request: { method: 'POST', path: 'edytuj_film.php', form: { id: '3', tytul: 'Amelia z Montmartre', rok: '2001', gatunek: 'Komedia', opis: 'Nowy opis filmu.', plakat_url: '' } }, selector: '#added', expected: 'Zapisano zmiany' }],
        ['interaction', 'Kliknięcie plakatu „Między słowami” otwiera stronę filmu.', { selector: 'a.poster-link[href="film.php?id=2"]', resultSelector: '#film-title', expected: { text: 'Między słowami' } }],
      ],
      steps: [
        '▶ Play otwiera index.php — katalog: wyszukiwarka GET `?q=`, siatka kart z plakatami z kolumny `plakat_url`.',
        'Kliknij plakat — przejdziesz do `film.php?id=…`: szczegóły, obsada z JOIN-a i formularze przypisywania aktorów.',
        '„+ Film” i „+ Aktor” w menu to osobne strony POST — INSERT z parametrami i walidacja pól.',
        '„Edytuj dane filmu” na stronie filmu otwiera formularz wypełniony danymi rekorda — submit robi UPDATE.',
        'Ten sam kod działa na XAMPP: skopiuj pliki do htdocs\\klatka, wklej `baza.sql` w phpMyAdmin, zamień `$dsn` na `mysql:host=localhost;dbname=klatka;charset=utf8mb4`.',
      ],
    },
  ],
};
