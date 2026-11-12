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
  609: [
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
      title: 'Wygeneruj listę zainteresowań',
      prompt: 'Pod opisem dodaj listę #interests. Użyj foreach w szablonie i utwórz po jednym li na zainteresowanie. Wyświetl każdą nazwę przez e().',
      starter: profilePage(bioSetup + "\n$interests = ['Fotografia', 'Gry'];", bioCard + '\n      <ul id="interests"></ul>'),
      solution: profilePage(bioSetup + "\n$interests = ['Fotografia', 'Gry'];", bioCard + `
      <ul id="interests">
        <?php foreach ($interests as $interest): ?>
          <li><?= e($interest) ?></li>
        <?php endforeach; ?>
      </ul>`),
      checks: [source('foreach'), text('#interests li:nth-child(1)', 'Fotografia'), text('#interests li:nth-child(2)', 'Gry')],
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
      title: 'Wizytówka modułu',
      prompt: 'Zbuduj wizytówkę: `$course = \'Podstawy PHP\'`, `$module = 2`, `$finished = true` i `$status` wyliczony warunkiem (`?:` lub if). Wypisz kurs w `h1` i „Moduł 2: ukończony” w `#result`.',
      starter: profilePage('// TODO: $course, $module, $finished, $status', '      <h1><?php // TODO ?></h1>\n      <p id="result"><?php // TODO ?></p>'),
      solution: profilePage('$course = \'Podstawy PHP\';\n$module = 2;\n$finished = true;\n$status = $finished ? \'ukończony\' : \'w toku\';', '      <h1><?= $course ?></h1>\n      <p id="result">Moduł <?= $module ?>: <?= $status ?></p>'),
      checks: [
        codeLine('$course', 'Zadeklaruj `$course`.', '\\$course\\s*='),
        codeLine('$module', 'Zadeklaruj `$module`.', '\\$module\\s*='),
        text('h1', 'Podstawy PHP'),
        text('#result', 'Moduł 2: ukończony'),
        notHandLiteral('>Moduł 2: ukończony<', 'Wynik ma skleić się ze zmiennych — nie ze stałego tekstu.'),
      ],
    },
  ],
  603: [
    {
      suffix: 'guided',
      title: 'Warunek if/else',
      prompt: 'Dla `$age = 18` napisz `if`/`else`: „Możesz wejść” dla 18+, „Jeszcze poczekaj” poniżej. Wynik wypisz w `#result`.',
      starter: profilePage('$age = 18;\n// TODO: if/else ustawia $message', '      <p id="result"><?= $message ?></p>'),
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
      title: 'Trzecia gałąź',
      prompt: 'Warunek działa. Dodaj `elseif`: dla `$age = 17` pokaż „Prawie — jeszcze rok” (gałęzie: 18+, dokładnie 17, reszta).',
      starter: profilePage('$age = 17;\nif ($age >= 18) {\n  $message = \'Możesz wejść\';\n} else {\n  $message = \'Jeszcze poczekaj\';\n}\n// TODO: gałąź elseif dla dokładnie 17', '      <p id="result"><?= $message ?></p>'),
      solution: profilePage('$age = 17;\nif ($age >= 18) {\n  $message = \'Możesz wejść\';\n} elseif ($age === 17) {\n  $message = \'Prawie — jeszcze rok\';\n} else {\n  $message = \'Jeszcze poczekaj\';\n}', '      <p id="result"><?= $message ?></p>'),
      checks: [
        codeLine('elseif', 'Dodaj gałąź `elseif`.', 'else\\s*if|elseif'),
        text('#result', 'Prawie — jeszcze rok'),
        notHandLiteral('>Prawie — jeszcze rok<', 'Komunikat ma wybierać warunek — nie stały tekst.'),
      ],
    },
    {
      suffix: 'independent',
      title: 'Ocena wyniku',
      prompt: 'Dla `$score = 80` napisz warunek: `>= 50` → „Zaliczone”, inaczej „Spróbuj ponownie”. Wynik w `#result`.',
      starter: profilePage('$score = 80;\n// TODO: if/else i $message', '      <p id="result"><?= $message ?></p>'),
      solution: profilePage('$score = 80;\nif ($score >= 50) {\n  $message = \'Zaliczone\';\n} else {\n  $message = \'Spróbuj ponownie\';\n}', '      <p id="result"><?= $message ?></p>'),
      checks: [
        codeLine('$score', 'Użyj zmiennej `$score` w warunku.', '\\$score'),
        codeLine('if', 'Użyj `if` i `else`.', 'if\\s*\\('),
        text('#result', 'Zaliczone'),
        notHandLiteral('>Zaliczone<', 'Wynik ma ustawiać warunek.'),
      ],
    },
  ],
  604: [
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
      title: 'Odliczanie wstecz',
      prompt: 'Pętla działa. Zmień ją na odliczanie malejące: „Krok 3”, „Krok 2”, „Krok 1” (licznik od 3 do 1).',
      starter: profilePage('', '      <ul id="result">\n        <?php for ($i = 1; $i <= 3; $i++): ?>\n          <li>Krok <?= $i ?></li>\n        <?php endfor; ?>\n        <!-- TODO: zamień na liczenie wstecz -->\n      </ul>'),
      solution: profilePage('', '      <ul id="result">\n        <?php for ($i = 3; $i >= 1; $i--): ?>\n          <li>Krok <?= $i ?></li>\n        <?php endfor; ?>\n      </ul>'),
      checks: [
        codeLine('--', 'Licznik schodzi w dół (`$i--` lub odwrotny zakres).', '\\$i--|-\\s*\\$i|3\\s*;\\s*\\$i\\s*>='),
        text('#result li:nth-child(1)', 'Krok 3'),
        text('#result li:nth-child(3)', 'Krok 1'),
        notHandLiteral('<li>Krok 3<', 'Kroki mają pochodzić z pętli.'),
      ],
    },
    {
      suffix: 'independent',
      title: 'Tabela mnożenia',
      prompt: 'Pętlą `while` wypisz w `<ul id="result">` trzy `<li>` mnożenia dla 2: „2 × 1 = 2” … „2 × 3 = 6”.',
      starter: profilePage('$number = 2;\n$i = 1;\n// TODO: while ($i <= 3)', '      <ul id="result">\n        <?php // TODO: pętla while ?>\n      </ul>'),
      solution: profilePage('$number = 2;\n$i = 1;', '      <ul id="result">\n        <?php while ($i <= 3): ?>\n          <li><?= $number ?> × <?= $i ?> = <?= $number * $i ?></li>\n          <?php $i++; ?>\n        <?php endwhile; ?>\n      </ul>'),
      checks: [
        codeLine('while', 'Użyj pętli `while` (nie w komentarzu).', 'while\\s*\\('),
        ['elementExists', 'Lista ma trzeci wiersz.', { selector: '#result li:nth-child(3)' }],
        text('#result li:nth-child(3)', '2 × 3 = 6'),
      ],
    },
  ],
  605: [
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
      title: 'Czwarty element',
      prompt: 'Lista działa. Dodaj do `$skills` czwarty element `\'JavaScript\'` i pokaż licznik „Razem: 4” przez `count($skills)` w `#count`.',
      starter: pageE('$skills = [\'HTML\', \'CSS\', \'PHP\'];', '      <ul id="result">\n        <?php foreach ($skills as $skill): ?>\n          <li><?= e($skill) ?></li>\n        <?php endforeach; ?>\n      </ul>\n      <!-- TODO: dodaj \'JavaScript\' i <p id="count"> z count($skills) -->'),
      solution: pageE('$skills = [\'HTML\', \'CSS\', \'PHP\', \'JavaScript\'];', '      <ul id="result">\n        <?php foreach ($skills as $skill): ?>\n          <li><?= e($skill) ?></li>\n        <?php endforeach; ?>\n      </ul>\n      <p id="count">Razem: <?= e(count($skills)) ?></p>'),
      checks: [
        codeLine('JavaScript', 'Dopisz `\'JavaScript\'` do tablicy.', 'JavaScript'),
        codeLine('count(', 'Policz elementy przez `count()`.', 'count\\('),
        text('#result li:nth-child(4)', 'JavaScript'),
        text('#count', 'Razem: 4'),
      ],
    },
    {
      suffix: 'independent',
      title: 'Cennik produktów',
      prompt: 'Utwórz `$products = [\'Książka\', \'Notes\', \'Kubek\']` i przez `foreach` wypisz `<li>` „Nazwa — 10 zł” w `<ul id="result">`.',
      starter: profilePage('$products = [];\n// TODO: tablica + foreach', '      <ul id="result">\n        <?php // TODO ?>\n      </ul>'),
      solution: pageE('$products = [\'Książka\', \'Notes\', \'Kubek\'];', '      <ul id="result">\n        <?php foreach ($products as $product): ?>\n          <li><?= e($product) ?> — 10 zł</li>\n        <?php endforeach; ?>\n      </ul>'),
      checks: [
        codeLine('$products', 'Zdefiniuj tablicę `$products`.', '\\$products\\s*=\\s*\\['),
        codeLine('foreach', 'Użyj `foreach`.', 'foreach\\s*\\('),
        ['elementExists', 'Lista ma trzy produkty.', { selector: '#result li:nth-child(3)' }],
        text('#result li:nth-child(3)', 'Kubek — 10 zł'),
      ],
    },
  ],
  606: [
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
      title: 'Drugie wywołanie',
      prompt: 'Funkcja działa. Wywołaj `greet` drugi raz z argumentem `\'Ada\'` i pokaż wynik w `#second`.',
      starter: pageE('function greet($name) {\n  return \'Cześć, \' . $name . \'!\';\n}', '      <p id="result"><?= e(greet(\'Ola\')) ?></p>\n      <!-- TODO: <p id="second"> z greet(\'Ada\') -->'),
      solution: pageE('function greet($name) {\n  return \'Cześć, \' . $name . \'!\';\n}', '      <p id="result"><?= e(greet(\'Ola\')) ?></p>\n      <p id="second"><?= e(greet(\'Ada\')) ?></p>'),
      checks: [
        codeLine('greet(', 'Wywołaj `greet` także dla Ady.', 'greet\\([\'"]Ada'),
        text('#second', 'Cześć, Ada!'),
        text('#result', 'Cześć, Ola!'),
      ],
    },
    {
      suffix: 'independent',
      title: 'Funkcja formatPrice',
      prompt: 'Napisz `function formatPrice($price)` zwracającą „<cena> zł”. Wywołaj ją dla 25 i pokaż „Cena: 25 zł” w `#result`.',
      starter: profilePage('// TODO: function formatPrice($price)', '      <p id="result">Cena: <?php // TODO: echo formatPrice(25) ?></p>'),
      solution: pageE('function formatPrice($price) {\n  return $price . \' zł\';\n}', '      <p id="result">Cena: <?= e(formatPrice(25)) ?></p>'),
      checks: [
        codeLine('formatPrice', 'Zdefiniuj `function formatPrice($price)`.', 'function\\s+formatPrice'),
        codeLine('return', 'Zwróć wynik przez `return`.', 'return'),
        text('#result', 'Cena: 25 zł'),
        notHandLiteral('>Cena: 25 zł<', 'Wynik ma zwracać funkcja.'),
      ],
    },
  ],
  607: [
    {
      suffix: 'guided',
      title: 'Imię z formularza POST',
      prompt: 'Odczytaj `$_POST[\'name\']` (z domyślnym „Gościu” przez `??`), zabezpiecz przez `htmlspecialchars` i wypisz „Witaj, <imię>!” w `#result`. Test wyśle POST z imieniem Ala.',
      starter: profilePage('// TODO: $name = htmlspecialchars($_POST[\'name\'] ?? \'Gościu\', ENT_QUOTES, \'UTF-8\');', '      <p id="result">Witaj, <?= $name ?>!</p>'),
      solution: profilePage('$name = htmlspecialchars($_POST[\'name\'] ?? \'Gościu\', ENT_QUOTES, \'UTF-8\');', '      <p id="result">Witaj, <?= $name ?>!</p>'),
      steps: [
        'Przypisz `$name = htmlspecialchars($_POST[\'name\'] ?? \'Gościu\', ENT_QUOTES, \'UTF-8\');`.',
        'Wypisz ją w `#result` przez `<?=`.',
        'Uruchom — test wyśle POST z name=Ala.',
      ],
      checks: [
        source('$_POST'),
        source('htmlspecialchars'),
        ['phpRequest', 'Dla POST z imieniem Ala pokaż bezpieczne powitanie.', { request: { method: 'POST', form: { name: 'Ala' } }, selector: '#result', expected: 'Witaj, Ala!' }],
      ],
    },
    {
      suffix: 'modified',
      title: 'Tylko POST, nie GET',
      prompt: 'Odczyt działa. Sprawdź `$_SERVER[\'REQUEST_METHOD\'] === \'POST\'` — dla innych metod pokaż w `#result` „Wyślij formularz.”.',
      starter: profilePage('$name = htmlspecialchars($_POST[\'name\'] ?? \'Gościu\', ENT_QUOTES, \'UTF-8\');\n// TODO: gałąź na REQUEST_METHOD', '      <p id="result">Witaj, <?= $name ?>!</p>'),
      solution: profilePage('if ($_SERVER[\'REQUEST_METHOD\'] === \'POST\') {\n  $name = htmlspecialchars($_POST[\'name\'] ?? \'Gościu\', ENT_QUOTES, \'UTF-8\');\n  $message = "Witaj, $name!";\n} else {\n  $message = \'Wyślij formularz.\';\n}', '      <p id="result"><?= $message ?></p>'),
      checks: [
        codeLine('REQUEST_METHOD', 'Sprawdź `$_SERVER[\'REQUEST_METHOD\']`.', 'REQUEST_METHOD'),
        ['phpRequest', 'POST nadal pokazuje powitanie.', { request: { method: 'POST', form: { name: 'Ala' } }, selector: '#result', expected: 'Witaj, Ala!' }],
        ['phpRequest', 'GET pokazuje „Wyślij formularz.”.', { request: { method: 'GET' }, selector: '#result', expected: 'Wyślij formularz.' }],
      ],
    },
    {
      suffix: 'independent',
      title: 'Wiadomość z POST',
      prompt: 'Odczytaj `$_POST[\'message\']` (domyślne „Brak wiadomości”), zabezpiecz i wypisz „Wiadomość: <tekst>” w `#result`. Test wyśle POST z message=Cześć!.',
      starter: profilePage('// TODO: $message z $_POST[\'message\']', '      <p id="result">Wiadomość: <?= $message ?></p>'),
      solution: profilePage('$message = htmlspecialchars($_POST[\'message\'] ?? \'Brak wiadomości\', ENT_QUOTES, \'UTF-8\');', '      <p id="result">Wiadomość: <?= $message ?></p>'),
      checks: [
        source('$_POST'),
        source('htmlspecialchars'),
        codeLine('message', 'Odczytaj pole `message` z `$_POST`.', '\\$_POST\\[[^\\]]*message'),
        ['phpRequest', 'POST z „Cześć!” pokazuje wiadomość.', { request: { method: 'POST', form: { message: 'Cześć!' } }, selector: '#result', expected: 'Wiadomość: Cześć!' }],
      ],
    },
  ],
  608: [
    {
      suffix: 'guided',
      title: 'Karta profilu PHP',
      prompt: 'W `index.php` zbuduj kartę profilu: przypisz `$author`, `$bio` i `$skills` (tablica), zdefiniuj funkcję `e()` przez `htmlspecialchars` i wypisz nagłówek `h1` z autorem, akapit z bio i `<li>` dla każdej umiejętności przez `foreach`.',
      starter: profilePage(`// TODO: przypisz $author, $bio i $skills
// TODO: e() ma zwracać htmlspecialchars($text, ENT_QUOTES, 'UTF-8')
function e($text) { return $text; }`, '      <h1><?= e($author) ?></h1>\n      <p id="bio"><?= e($bio) ?></p>\n      <ul id="skills"></ul>'),
      solution: profilePage(`$author = 'Kamil';
$bio = 'Uczę się programowania webowego';
$skills = ['HTML', 'PHP', '<em>git</em>'];
${escapeText}`, `      <h1><?= e($author) ?></h1>
      <p id="bio"><?= e($bio) ?></p>
      <ul id="skills">
        <?php foreach ($skills as $skill): ?>
          <li><?= e($skill) ?></li>
        <?php endforeach; ?>
      </ul>`),
      steps: [
        'Przypisz zmienne `$author = \'Kamil\'`, `$bio` i `$skills = [\'HTML\', \'PHP\', \'<em>git</em>\']`.',
        'Zdefiniuj `function e($text)` zwracającą `htmlspecialchars($text, ENT_QUOTES, \'UTF-8\')`.',
        'Wypisz `h1` z `e($author)`, `#bio` z `e($bio)` i `<li>` przez `foreach` z `e($skill)`.',
        'Uruchom ▶ Play — `<em>git</em>` musi wyświetlić się dosłownie, nie kursywą.',
      ],
      checks: [
        codeLine('e(', 'Wypisz wartości przez e()/htmlspecialchars (nie w komentarzu).', 'e\\(\\s*\\$'),
        ['textEquals', 'h1 pokazuje autora „Kamil”.', { selector: 'h1', expected: 'Kamil' }],
        ['textEquals', '#bio pokazuje opis profilu.', { selector: '#bio', expected: 'Uczę się programowania webowego' }],
        ['textEquals', 'Drugi <li> pokazuje „PHP”.', { selector: '#skills li:nth-child(2)', expected: 'PHP' }],
        ['textEquals', 'Umiejętność „<em>git</em>” wypisana jest dosłownie (escapowana).', { selector: '#skills li:nth-child(3)', expected: '<em>git</em>' }],
        notHandLiteral('>Kamil<', 'Nie wpisuj „Kamil” na sztywno w HTML — ma go wypisać PHP z $author.'),
      ],
    },
    {
      suffix: 'modified',
      title: 'Komunikat przy pustej liście',
      prompt: 'Karta działa. Dodaj gałąź: gdy `$skills` jest pustą tablicą (`[]`), wypisz `<p class="empty">Brak umiejętności.</p>` zamiast pustej listy. Lista musi nadal działać, gdy umiejętności są.',
      starter: profilePage(`$author = 'Kamil';
$bio = 'Uczę się programowania webowego';
$skills = ['HTML', 'PHP', '<em>git</em>'];
${escapeText}`, `      <h1><?= e($author) ?></h1>
      <p id="bio"><?= e($bio) ?></p>
      <ul id="skills">
        <?php foreach ($skills as $skill): ?>
          <li><?= e($skill) ?></li>
        <?php endforeach; ?>
      </ul>
      <!-- TODO: gdy $skills jest puste, pokaż "Brak umiejętności." zamiast listy -->`),
      solution: profilePage(`$author = 'Kamil';
$bio = 'Uczę się programowania webowego';
$skills = ['HTML', 'PHP', '<em>git</em>'];
${escapeText}`, `      <h1><?= e($author) ?></h1>
      <p id="bio"><?= e($bio) ?></p>
      <?php if (count($skills) === 0): ?>
        <p class="empty">Brak umiejętności.</p>
      <?php else: ?>
        <ul id="skills">
          <?php foreach ($skills as $skill): ?>
            <li><?= e($skill) ?></li>
          <?php endforeach; ?>
        </ul>
      <?php endif; ?>`),
      checks: [
        codeLine('count(', 'Sprawdź pustą listę przez count()/empty() lub porównanie z [].', '(count\\(\\$skills\\)|empty\\(\\$skills\\)|\\$skills\\s*===?\\s*\\[\\s*\\])'),
        source('Brak umiejętności.'),
        ['textEquals', 'h1 pokazuje autora „Kamil”.', { selector: 'h1', expected: 'Kamil' }],
        ['textEquals', 'Drugi <li> pokazuje „PHP”.', { selector: '#skills li:nth-child(2)', expected: 'PHP' }],
        ['textEquals', 'Umiejętność „<em>git</em>” wypisana jest dosłownie.', { selector: '#skills li:nth-child(3)', expected: '<em>git</em>' }],
      ],
    },
    {
      suffix: 'independent',
      title: 'Własna karta autora',
      prompt: 'Zbuduj własną kartę autora od zera: inne imię, krótkie bio i co najmniej 3 umiejętności — jedna musi zawierać znak `<` lub `>`, żeby sprawdzić escapowanie. Wypisz `h1`, akapit z bio i `<li>` przez `foreach` z `e()`.',
      starter: profilePage('// Napisz własną kartę autora.', ''),
      solution: profilePage(`$author = 'Ania';
$bio = 'Koduje w szkole i po szkole';
$skills = ['CSS', 'JavaScript', 'a > b'];
${escapeText}`, `      <h1><?= e($author) ?></h1>
      <p id="bio"><?= e($bio) ?></p>
      <ul id="skills">
        <?php foreach ($skills as $skill): ?>
          <li><?= e($skill) ?></li>
        <?php endforeach; ?>
      </ul>`),
      checks: [
        codeLine('e(', 'Wypisz wartości przez e()/htmlspecialchars (nie w komentarzu).', 'e\\(\\s*\\$'),
        source('foreach'),
        notHandLiteral('Kamil', 'Użyj innego imienia niż „Kamil” — to ma być Twoja własna karta.'),
        ['elementExists', 'Strona ma nagłówek h1.', { selector: 'h1' }],
        ['elementExists', 'Lista #skills ma co najmniej 3 elementy <li>.', { selector: '#skills li:nth-child(3)' }],
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
