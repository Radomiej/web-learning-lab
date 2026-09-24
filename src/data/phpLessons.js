import { createLesson } from './lessonFactories.js';
import { phpTasks } from './phpTasks.js';

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
    order: 40,
    id: 'php-echo',
    title: 'Pierwszy skrypt PHP i echo',
    summary: 'Uruchom PHP.wasm i wygeneruj pierwszy fragment HTML.',
    focus: 'tag PHP, echo, tekst oraz HTML zwracany przez skrypt',
    file: 'index.php',
    token: 'echo',
    objectives: ['Rozpoznaj tag `<?php` i instrukcję `echo`.', 'Zobacz, że wynik PHP staje się HTML-em w podglądzie.'],
    theory: ['PHP wykonuje się w tym kursie w przeglądarce dzięki PHP.wasm. Przeglądarka nie wyświetla kodu PHP — wyświetla tekst, który skrypt wypisał.', 'Instrukcja `echo` może wypisać zwykły tekst albo fragment HTML. Zacznij od małego wyniku i sprawdzaj go po każdym uruchomieniu.'],
  },
  {
    order: 41,
    id: 'php-variables',
    title: 'Zmienne i typy danych',
    summary: 'Przechowuj tekst, liczby i wartości logiczne w zmiennych PHP.',
    focus: '$name, $age, string, int, bool i interpolacja',
    file: 'index.php',
    token: '$name',
    objectives: ['Zadeklaruj zmienne z prefiksem `$`.', 'Wstaw wartości zmiennych do wyjściowego HTML.'],
    theory: ['Każda zmienna PHP zaczyna się od znaku `$`, a przypisanie używa pojedynczego `=`.', 'Teksty możesz łączyć operatorem `.`, a w podwójnych cudzysłowach PHP potrafi wstawić prostą zmienną bez ręcznego łączenia.'],
  },
  {
    order: 42,
    id: 'php-conditions',
    title: 'Warunki if i else',
    summary: 'Podejmuj decyzję na podstawie wartości zmiennej.',
    focus: 'if, else, porównania i wynik warunku',
    file: 'index.php',
    token: 'if',
    objectives: ['Zapisz warunek `if` z porównaniem.', 'Obsłuż drugą możliwość przez `else`.'],
    theory: ['Warunek `if` uruchamia blok tylko wtedy, gdy wyrażenie jest prawdziwe.', 'Dobrze nazwany komunikat pośredni upraszcza późniejsze renderowanie HTML i ułatwia czytanie kodu.'],
  },
  {
    order: 43,
    id: 'php-loops',
    title: 'Pętle for i while',
    summary: 'Powtarzaj fragment HTML bez kopiowania tych samych linii.',
    focus: 'for, while, licznik i generowanie listy',
    file: 'index.php',
    token: 'for',
    objectives: ['Zbuduj listę przez `for`.', 'Rozpoznaj, kiedy przyda się `while`.'],
    theory: ['Pętla `for` pasuje do sytuacji, w której znasz licznik lub zakres powtórzeń.', '`while` wykonuje blok dopóty, dopóki warunek jest prawdziwy. Zmieniaj licznik w środku, aby zakończyć pętlę.'],
  },
  {
    order: 44,
    id: 'php-arrays-foreach',
    title: 'Tablice i foreach',
    summary: 'Przechowuj kolekcję danych i wyświetl każdy element.',
    focus: 'tablica, foreach, as i elementy li',
    file: 'index.php',
    token: 'foreach',
    objectives: ['Utwórz tablicę wartości.', 'Przejdź po niej przez `foreach` i wygeneruj listę.'],
    theory: ['Tablica przechowuje wiele wartości w jednej zmiennej.', '`foreach` pobiera kolejne elementy kolekcji i pozwala wyrenderować je bez ręcznego powtarzania markup-u.'],
  },
  {
    order: 45,
    id: 'php-functions',
    title: 'Funkcje i return',
    summary: 'Nadaj powtarzalnej logice nazwę i zwracaj jej wynik.',
    focus: 'function, parametr, return i wywołanie',
    file: 'index.php',
    token: 'function',
    objectives: ['Zdefiniuj funkcję z parametrem.', 'Zwróć wynik przez `return` i wykorzystaj go w HTML.'],
    theory: ['Funkcja grupuje instrukcje pod nazwą i może przyjąć parametry.', '`return` oddaje wartość wywołującemu kodowi. Dzięki temu funkcja opisuje dane, a `echo` decyduje, gdzie je wyświetlić.'],
  },
  {
    order: 46,
    id: 'php-post-forms',
    title: 'Formularz POST i bezpieczeństwo',
    summary: 'Odczytaj dane formularza, zabezpiecz je i zwróć HTML.',
    focus: '$_POST, htmlspecialchars, request mode i bezpieczne wyjście',
    file: 'index.php',
    token: 'htmlspecialchars',
    objectives: ['Odczytaj wartość z `$_POST`.', 'Zabezpiecz tekst przez `htmlspecialchars` przed wstawieniem do HTML.'],
    theory: ['Dane z formularza są wejściem użytkownika i mogą zawierać znaczniki HTML.', '`htmlspecialchars` zamienia znaki specjalne na bezpieczne encje. W tej lekcji przycisk Sprawdź wysyła do PHP kontrolowane żądanie POST.'],
  },
  {
    order: 47,
    id: 'php-profile-project',
    title: 'Projekt: karta profilu PHP',
    summary: 'Połącz zmienne, funkcję, tablicę i pętlę w mały projekt.',
    focus: 'kompozycja poznanych elementów, bezpieczny tekst i semantyczny HTML',
    file: 'index.php',
    token: 'foreach',
    objectives: ['Zaplanuj dane i funkcję pomocniczą.', 'Wyrenderuj kartę profilu z listą umiejętności.'],
    theory: ['Mały projekt składa się z tych samych klocków: dane, funkcje, pętla i HTML.', 'Najpierw spraw, aby wynik był poprawny, a potem uporządkuj kod tak, aby każda część miała jedną odpowiedzialność.'],
  },
];

export const phpLessons = definitions.map((definition) => {
  const starter = phpProject();
  return createLesson({
    ...definition,
    track: 'php',
    runtime: 'php-wasm',
    starter,
    solution: starter,
    tasks: phpTasks(definition, starter),
  });
});

