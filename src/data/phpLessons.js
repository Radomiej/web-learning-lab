import { createLesson } from './lessonFactories.js';
import { phpTasks } from './phpTasks.js';
import { lessonNumber } from './lessonNumbers.js';

const phpStyles = `
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; color: #24233a; background: #f5f3fb; }
main { max-width: 760px; margin: 0 auto; padding: 32px 20px; }
.profile { padding: 24px; border: 1px solid #d9d2ef; border-radius: 16px; background: #fff; box-shadow: 0 10px 30px rgb(59 35 112 / 8%); }
ul { padding-left: 1.25rem; }
`;

function phpProject(source = '<?php\n// Napisz rozwiązanie w pliku index.php.\n') {
  return {
    entry: 'index.php',
    runtime: { kind: 'php-wasm', phpVersion: '8.4' },
    files: {
      'index.php': source,
      'styles.css': phpStyles,
    },
  };
}

const definitions = [
  {
    order: lessonNumber('php', 1),
    id: 'php-echo',
    taskPrefix: 'php-01',
    title: 'Pierwszy skrypt PHP i echo',
    summary: 'Uruchom PHP.wasm i wygeneruj pierwszy fragment HTML.',
    focus: 'tag PHP, echo, tekst oraz HTML zwracany przez skrypt',
    file: 'index.php',
    token: 'echo',
    objectives: ['Rozpoznaj tag `<?php` i instrukcję `echo`.', 'Zobacz, że wynik PHP staje się HTML-em w podglądzie.'],
    theory: ['PHP wykonuje się w tym kursie w przeglądarce dzięki PHP.wasm. Przeglądarka nie wyświetla kodu PHP — wyświetla tekst, który skrypt wypisał.', 'Instrukcja `echo` może wypisać zwykły tekst albo fragment HTML. Zacznij od małego wyniku i sprawdzaj go po każdym uruchomieniu.'],
  },
  {
    order: lessonNumber('php', 2),
    id: 'php-variables',
    taskPrefix: 'php-02',
    title: 'Zmienne i typy danych',
    summary: 'Przechowuj tekst, liczby i wartości logiczne w zmiennych PHP.',
    focus: '$name, $age, string, int, bool i interpolacja',
    file: 'index.php',
    token: '$name',
    objectives: ['Zadeklaruj zmienne z prefiksem `$`.', 'Wstaw wartości zmiennych do wyjściowego HTML.'],
    theory: ['Każda zmienna PHP zaczyna się od znaku `$`, a przypisanie używa pojedynczego `=`.', 'Teksty możesz łączyć operatorem `.`, a w podwójnych cudzysłowach PHP potrafi wstawić prostą zmienną bez ręcznego łączenia.'],
  },
  {
    order: lessonNumber('php', 3),
    id: 'php-html-template',
    title: 'Zwykły HTML z osadzonym PHP',
    summary: 'Wstaw dane PHP do szablonu strony — w treści znaczników i w atrybutach.',
    focus: 'HTML, <?= … ?>, e() i wartości w atrybutach',
    file: 'index.php',
    objectives: ['Wstaw wartość PHP do znacznika HTML przez `<?= … ?>`.', 'Zakoduj tekst przez `e()`/`htmlspecialchars` przed wypisaniem.', 'Wypisz wartość PHP w atrybucie elementu.'],
    theory: ['Plik index.php może zawierać zwykły HTML — tekst poza `<?php … ?>` trafia do przeglądarki bez zmian. Bloki PHP wstawiaj tam, gdzie potrzebna jest wartość.', '`<?= $x ?>` to skrót `<?php echo $x ?>` — wypisuje wartość w miejscu znacznika albo atrybutu.', 'Dane wstawiane do HTML koduj przez `htmlspecialchars` (lub pomocniczą `e()`), aby znaczniki w tekście nie psuły strony.'],
  },
  {
    order: lessonNumber('php', 4),
    id: 'php-conditions',
    taskPrefix: 'php-03',
    title: 'Warunki if i else',
    summary: 'Podejmuj decyzję na podstawie wartości zmiennej.',
    focus: 'if, else, porównania i wynik warunku',
    file: 'index.php',
    token: 'if',
    objectives: ['Zapisz warunek `if` z porównaniem.', 'Obsłuż drugą możliwość przez `else`.'],
    theory: ['Warunek `if` uruchamia blok tylko wtedy, gdy wyrażenie jest prawdziwe.', 'Dobrze nazwany komunikat pośredni upraszcza późniejsze renderowanie HTML i ułatwia czytanie kodu.'],
  },
  {
    order: lessonNumber('php', 5),
    id: 'php-loops',
    taskPrefix: 'php-04',
    title: 'Pętle for i while',
    summary: 'Powtarzaj fragment HTML bez kopiowania tych samych linii.',
    focus: 'for, while, licznik i generowanie listy',
    file: 'index.php',
    token: 'for',
    objectives: ['Zbuduj listę przez `for`.', 'Rozpoznaj, kiedy przyda się `while`.'],
    theory: ['Pętla `for` pasuje do sytuacji, w której znasz licznik lub zakres powtórzeń.', 'Znaczniki `<ul>`/`</ul>` piszesz raz jako zwykły HTML — pętla w `<?php … ?>` (albo `for … : ?> … <?php endfor; ?>`) powtarza tylko elementy `<li>` w środku.', '`while` wykonuje blok dopóty, dopóki warunek jest prawdziwy. Zmieniaj licznik w środku, aby zakończyć pętlę.'],
  },
  {
    order: lessonNumber('php', 6),
    id: 'php-arrays-foreach',
    taskPrefix: 'php-05',
    title: 'Tablice i foreach',
    summary: 'Przechowuj kolekcję danych i wyświetl każdy element.',
    focus: 'tablica, foreach, as i elementy li',
    file: 'index.php',
    token: 'foreach',
    objectives: ['Utwórz tablicę wartości.', 'Przejdź po niej przez `foreach` i wygeneruj listę.'],
    theory: ['Tablica przechowuje wiele wartości w jednej zmiennej.', '`foreach` pobiera kolejne elementy kolekcji i pozwala wyrenderować je bez ręcznego powtarzania markup-u.'],
  },
  {
    order: lessonNumber('php', 7),
    id: 'php-functions',
    taskPrefix: 'php-06',
    title: 'Funkcje i return',
    summary: 'Nadaj powtarzalnej logice nazwę i zwracaj jej wynik.',
    focus: 'function, parametr, return i wywołanie',
    file: 'index.php',
    token: 'function',
    objectives: ['Zdefiniuj funkcję z parametrem.', 'Zwróć wynik przez `return` i wykorzystaj go w HTML.'],
    theory: ['Funkcja grupuje instrukcje pod nazwą i może przyjąć parametry.', '`return` zwraca wartość wywołującemu kodowi. Dzięki temu funkcja opisuje dane, a `echo` decyduje, gdzie je wyświetlić.'],
  },
  {
    order: lessonNumber('php', 8),
    id: 'php-post-forms',
    taskPrefix: 'php-07',
    title: 'Formularz POST i bezpieczeństwo',
    summary: 'Zbuduj formularz, obsłuż żądanie POST i zwróć widok wyniku.',
    focus: 'formularz HTML, REQUEST_METHOD, $_POST, walidacja, htmlspecialchars',
    file: 'index.php',
    token: 'htmlspecialchars',
    objectives: ['Rozdziel widoki po `$_SERVER[\'REQUEST_METHOD\']` — GET pokazuje formularz, POST obsługuje dane.', 'Odczytaj, zweryfikuj i zabezpiecz pola `$_POST` przez `htmlspecialchars`.'],
    theory: [
      'Wejście na stronę to żądanie GET — pokazujesz formularz. Kliknięcie Wyślij przy `method="post"` to nowe żądanie POST — odczytujesz `$_POST` i zwracasz widok wyniku.',
      'Klucz pola w `$_POST` tworzy atrybut `name`, nie `id`. Dane z zewnątrz zawsze koduj `htmlspecialchars` przed wstawieniem do HTML.',
      '`required` w HTML nie zwalnia z walidacji w PHP — same spacje je przechodzą; `trim` + `is_string` sprawdzają dane na serwerze.',
      'W laboratorium formularz działa naprawdę — skrypt podglądu wysyła submit do PHP.wasm jak przeglądarka na hostingu.',
    ],
  },
  {
    order: lessonNumber('php', 9),
    id: 'php-profile-project',
    taskPrefix: 'php-08',
    title: 'Projekt: karta profilu PHP',
    summary: 'Formularz zbiera dane, a PHP buduje z nich kartę profilu — połączenie POST, walidacji, tablicy i pętli.',
    focus: 'kompozycja poznanych elementów, bezpieczny tekst i semantyczny HTML',
    file: 'index.php',
    token: 'foreach',
    objectives: ['Zbierz dane z formularza i zwaliduj je po stronie PHP.', 'Wyrenderuj kartę profilu z listą umiejętności.'],
    theory: ['Mały projekt składa się z tych samych klocków: formularz jako źródło danych, funkcje pomocnicze, pętla i HTML.', 'Najpierw spraw, aby wynik był poprawny, a potem uporządkuj kod tak, aby każda część miała jedną odpowiedzialność.'],
  },
  {
    order: lessonNumber('php', 10),
    id: 'php-javascript-data',
    title: 'Od PHP do JavaScript',
    summary: 'Przekaż dane karty profilu do skryptu w przeglądarce.',
    focus: 'data-*, dataset, kliknięcie i textContent',
    file: 'index.php',
    objectives: ['Umieść dane PHP w atrybucie HTML.', 'Odczytaj dane i zmień widok po kliknięciu.'],
    theory: [
      'Małe wartości przypisane do jednego elementu przekazuj atrybutami data-* i odczytuj w skrypcie przez dataset.',
      'Całe struktury (tablice, obiekty) osadź w <script> przez json_encode z flagami JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT — e()/htmlspecialchars nie chroni kontekstu JavaScriptu.',
      'Dane, które mają zmieniać się bez przeładowania strony, pobieraj przez fetch z endpointu PHP zwracającego JSON.',
      'Nie odczytuj danych z widocznego tekstu (np. h1.textContent) — prezentacja to nie dane.',
    ],
  },
  {
    order: lessonNumber('php', 11),
    id: 'php-json-data',
    title: 'Dane z PHP jako JSON w skrypcie',
    summary: 'Osadź całą strukturę PHP w kodzie JavaScript przez json_encode.',
    focus: 'json_encode, flagi JSON_HEX_* i kontekst skryptu',
    file: 'index.php',
    taskPrefix: 'php-json-data',
    objectives: ['Zamień tablicę PHP na JSON w <script> przez json_encode.', 'Użyj flag JSON_HEX_* zamiast e() w kontekście JavaScriptu.'],
    theory: [
      'json_encode z flagami JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT zapisuje tablicę PHP jako bezpieczny literał JS — e()/htmlspecialchars w tym miejscu jest błędem, bo chroni kontekst HTML, nie skryptu.',
      'Sam „<?= $name ?>" w cudzysłowach skryptu to luka XSS — cytat lub </script> w wartości zepsuje lub podmieni kod.',
      'Literał JSON w <script> jest czytany raz, przy ładowaniu strony — gdy dane mają być świeże, potrzebny jest fetch do endpointu PHP.',
      'Nie wpisuj struktur ręcznie w skrypt — ma je wyprodukować PHP, inaczej przestaną się aktualizować.',
    ],
  },
  {
    order: lessonNumber('php', 12),
    id: 'php-fetch-api',
    title: 'fetch do endpointu PHP — GET i POST',
    summary: 'Pobieraj i wysyłaj dane JSON do api.php bez przeładowania strony.',
    focus: 'fetch, $_GET, $_POST, REQUEST_METHOD i odpowiedź JSON',
    file: 'index.php',
    taskPrefix: 'php-fetch-api',
    objectives: ['Pobierz JSON z api.php przez GET z parametrem w adresie.', 'Wyślij dane metodą POST przez FormData i obsłuż status odpowiedzi.'],
    theory: [
      'GET czyta dane — parametry idą w adresie ($_GET), są widoczne w URL i nie powinny niczego zmieniać.',
      'POST wysyła dane w ciele żądania ($_POST z FormData, albo json_decode(file_get_contents("php://input"), true) dla JSON) i zmienia stan serwera.',
      'Endpoint ustawia header("Content-Type: application/json") i odpowiada json_encode; dla złej metody: http_response_code(405).',
      'W skrypcie sprawdzaj response.ok i pustą listę — nie każde żądanie kończy się danymi.',
    ],
  },
  {
    order: lessonNumber('php', 13),
    id: 'php-objects',
    title: 'Obiekty w PHP: class, new, -> i ::',
    summary: 'Zrozum obiekty zanim użyjesz PDO — klasa, instancja, właściwości, metody, $this i stałe klas.',
    focus: 'class, new, ->, $this, __construct, stałe klas i ::',
    file: 'index.php',
    taskPrefix: 'php-objects',
    objectives: ['Zdefiniuj klasę z konstruktorem i metodą.', 'Utwórz obiekt przez new i wywołuj jego metody przez ->.', 'Użyj stałej klasy przez :: jak w PDO::FETCH_ASSOC.'],
    theory: [
      'Klasa to plan, obiekt to konkret: `new Profile(...)` tworzy instancję z własnymi danymi.',
      'Właściwości czytasz przez `->` (`$profile->name`), metody wołasz tak samo (`$profile->label()`); wewnątrz metody `$this` wskazuje na bieżący obiekt.',
      'Konstruktor z promowanymi właściwościami (`public function __construct(public string $name, …)`) zapisuje argumenty od razu do pól obiektu.',
      'Stałe klasy wołasz przez `::` — `Profile::MAX_SKILLS`. Tak samo działa `PDO::FETCH_ASSOC` używane później z bazą.',
      'Obiekt przypomina tablicę asocjacyjną: `[\'name\' => \'Ala\']` ↔ `$profile->name` — ale obiekt ma też metody. `json_decode` bez drugiego argumentu `true` też zwraca obiekt (stdClass) — `$book->tytul`.',
    ],
  },
  {
    order: lessonNumber('php', 14),
    id: 'php-sqlite-pdo',
    title: 'PHP i SQLite przez PDO',
    summary: 'Połącz się z plikiem SQLite przez PDO i obsłuż prawdziwe zapytania na bazie Biblioteka.',
    focus: 'new PDO(\'sqlite:…\'), prepare, parametry zapytania, JOIN i pusty wynik',
    file: 'index.php',
    taskPrefix: 'php-611',
    objectives: ['Otwórz plik SQLite przez `new PDO(\'sqlite:…\')` i włącz ERRMODE_EXCEPTION.', 'Pobierz rekordy zapytaniem z parametrem — w tym przez formularz GET.', 'Połącz tabele przez JOIN i obsłuż brak wyników.'],
    theory: [
      'SQLite trzyma całą bazę w jednym pliku obok kodu — w labie to biblioteka.sqlite z danymi Biblioteka z Database Lab; przy pierwszym otwarciu db.php wczytuje do niego biblioteka.sql.',
      'Wartości trafiają do zapytania przez nazwane parametry (:rok) w execute — nigdy przez sklejanie tekstu SQL z $_GET.',
      'PDO działa tak samo dla SQLite i MySQL — zmienia się tylko DSN (`sqlite:ścieżka` ↔ `mysql:host=…;dbname=…`); prepare/execute/fetchAll zostają.',
    ],
  },
  {
    order: lessonNumber('php', 15),
    id: 'php-xampp-cinema',
    title: 'Prawdziwy projekt: portal kina na XAMPP',
    summary: 'Przewodnik krok po kroku: XAMPP, phpMyAdmin i kompletny portal filmowy do skopiowania — katalog, plakaty, formularze i obsada.',
    focus: 'XAMPP, htdocs, phpMyAdmin, osobne strony .php, plakat_url, INSERT/UPDATE/DELETE przez prepared statements',
    file: 'index.php',
    taskPrefix: 'php-xampp-cinema',
    objectives: ['Przejdź przewodnik: uruchom Apache i MySQL w XAMPP, utwórz katalog w htdocs i wklej schemat w phpMyAdmin.', 'Skopiuj kompletne pliki projektu — każda strona to osobny .php z własnym blokiem połączenia.', 'Kliknij podgląd: wyszukiwarka GET, dodawanie filmu/aktora przez POST, edycja i obsada w tabeli łączącej.'],
    theory: [
      'To lekcja przewodnikowa — nic nie uzupełniasz. Dostajesz kompletny projekt „Klatka” (osobne strony bez include) i instrukcję od instalacji XAMPP po działającą aplikację.',
      'Pliki są identyczne w labie i na XAMPP — zmieniasz tylko linię $dsn: sqlite:klatka.sqlite ↔ mysql:host=localhost;dbname=klatka. Schemat z baza.sql wklejasz raz w phpMyAdmin.',
      'Aplikacja pokazuje pełny cykl CRUD na relacji wiele-do-wielu: katalog GET z plakatami z bazy, POST dodawania i UPDATE edycji, INSERT/DELETE na tabeli obsada.',
    ],
  },
];

export const phpLessons = definitions.map((definition) => {
  const base = phpProject();
  const tasks = phpTasks(definition, base);
  const firstExercise = tasks.find(({ mode }) => mode === 'exercise');
  return createLesson({
    ...definition,
    track: 'php',
    runtime: 'php-wasm',
    starter: firstExercise?.starter ?? base,
    solution: firstExercise?.solution ?? base,
    tasks,
  });
});
