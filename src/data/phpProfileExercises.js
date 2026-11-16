import librarySeed from './phpLibrarySeed.js';
import { createMysqlDatabaseFile, mysqlAdapterFile, shellDatabaseFile } from './phpMysqlSimulator.js';

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


const databaseFiles = {
  'db.php': shellDatabaseFile,
  'mysql-adapter.php': mysqlAdapterFile,
  'biblioteka.sql': librarySeed,
};
const openDatabase = "$db = require __DIR__ . '/db.php';";
const countPage = profilePage(`${openDatabase}
$count = $db ? $db->query('SELECT COUNT(*) FROM ksiazki')->fetchColumn() : null;`, `      <h1>Książki w bazie</h1>
      <p id="result"><?= $count ?? 'Uzupełnij połączenie w db.php.' ?></p>`, 'Biblioteka');

function searchPage(query, render) {
  return profilePage(`${openDatabase}
$year = (int) ($_GET['rok'] ?? 1834);
${query}
${escapeText}`, `      <h1>Książki według roku wydania</h1>
      <p>Wybrany rok: <?= $year ?></p>
${render}`, 'Biblioteka');
}

const filteredQuery = `$query = $db->prepare('SELECT tytul FROM ksiazki WHERE rok_wydania = :rok ORDER BY id');
$query->execute(['rok' => $year]);
$books = $query->fetchAll(PDO::FETCH_ASSOC);`;
const bookList = `      <ul id="books">
        <?php foreach ($books as $book): ?>
          <li><?= e($book['tytul']) ?></li>
        <?php endforeach; ?>
      </ul>`;

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
      title: 'Otwórz bazę biblioteki',
      prompt: 'W db.php połącz się z lokalną bazą Biblioteka przez mysqlowy adapter. Utwórz $dsn w formacie mysql:host=localhost;dbname=biblioteka;charset=utf8mb4 i otwórz połączenie przez connectMysqlStyle($dsn, $path). Adapter mapuje nazwę bazy na plik SQLite. Kod startowy wczyta dane Database Lab, a index.php pokaże liczbę książek.',
      starter: countPage,
      solution: countPage,
      starterFiles: { ...databaseFiles, 'db.php': createMysqlDatabaseFile('// Utwórz tu połączenie i zapisz je w $db.') },
      solutionFiles: databaseFiles,
      checks: [source("mysql:host=localhost;dbname=", 'db.php'), source('connectMysqlStyle($dsn, $path)', 'db.php'),
        source("new PDO('sqlite:'", 'mysql-adapter.php'), source('dbname=', 'mysql-adapter.php'), text('#result', '8')],
    },
    {
      title: 'Filtruj książki według roku',
      prompt: 'W index.php przygotuj SELECT z WHERE rok_wydania = :rok, przekaż $year do execute i odczytaj wyniki przez fetchAll(PDO::FETCH_ASSOC). Lista pokaże książki z 1834 roku w kolejności id.',
      starter: searchPage('$books = []; // Zastąp pustą listę wynikiem zapytania.', bookList),
      solution: searchPage(filteredQuery, bookList),
      starterFiles: databaseFiles,
      checks: [source('prepare'), source(':rok'), source('execute'), source('PDO::FETCH_ASSOC'),
        text('#books li:nth-child(1)', 'Pan Tadeusz'), text('#books li:nth-child(2):last-child', 'Kordian')],
    },
    {
      title: 'Obsłuż pusty wynik',
      prompt: 'Zachowaj filtrowanie książek. Gdy $books jest pustą tablicą, pokaż „Brak pasujących książek.” w #result. W przeciwnym razie pokaż listę. Play sprawdzi rok 2000, dla którego w bazie nie ma książek.',
      starter: searchPage(filteredQuery, bookList),
      solution: searchPage(filteredQuery, `      <?php if ($books === []): ?>
        <p id="result">Brak pasujących książek.</p>
      <?php else: ?>
${bookList}
      <?php endif; ?>`),
      starterFiles: databaseFiles,
      checks: [source('if ('), [
        'phpRequest', 'Dla roku 2000 pokaż komunikat o braku wyników.',
        { request: { method: 'GET', query: { rok: '2000' } }, selector: '#result', expected: 'Brak pasujących książek.' },
      ], text('#result', 'Brak pasujących książek.')],
    },
  ],
};
