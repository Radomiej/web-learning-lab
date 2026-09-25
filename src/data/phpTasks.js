import { createTask } from './lessonFactories.js';
import { lessonSequence } from './lessonNumbers.js';

function projectWithSource(base, source) {
  return {
    entry: base.entry,
    runtime: { ...base.runtime },
    files: { ...base.files, [base.entry]: source },
  };
}

const recipes = {
  40: {
    guided: {
      prompt: 'Użyj echo, aby wyrenderować w PHP nagłówek i komunikat w elemencie #result. Uruchom podgląd, aby zobaczyć HTML wygenerowany po stronie PHP.',
      starter: '<?php\n// Użyj echo i wyświetl tutaj swój pierwszy komunikat.\n',
      solution: '<?php\necho \'<main><h1>Pierwszy skrypt PHP</h1><p id="result">Witaj w PHP!</p></main>\';\n',
      checks: [
        ['sourceIncludes', 'Użyj instrukcji echo w pliku index.php.', { file: 'index.php', value: 'echo' }],
        ['textContains', 'W podglądzie pokaż tekst „Witaj w PHP!”.', { expected: 'Witaj w PHP!' }],
      ],
    },
    independent: {
      prompt: 'Zbuduj małą stronę powitalną. Zapisz komunikat w zmiennej $message i wyświetl go przez echo w elemencie #result.',
      starter: '<?php\n// Utwórz zmienną $message i wyświetl ją w HTML.\n',
      solution: '<?php\n$message = "PHP działa w przeglądarce";\necho "<main><h1>Witaj!</h1><p id=\\"result\\">$message</p></main>";\n',
      checks: [
        ['sourceIncludes', 'Zadeklaruj zmienną $message.', { file: 'index.php', value: '$message' }],
        ['sourceIncludes', 'Wyświetl wynik przez echo.', { file: 'index.php', value: 'echo' }],
        ['textContains', 'Podgląd zawiera komunikat „PHP działa w przeglądarce”.', { expected: 'PHP działa w przeglądarce' }],
      ],
    },
  },
  41: {
    guided: {
      prompt: 'Zadeklaruj imię i wiek jako zmienne, a potem wyświetl je w karcie profilu. Ćwicz interpolację oraz łączenie tekstu z wartościami.',
      starter: '<?php\n$name = "";\n$age = 0;\n// Pokaż imię i wiek w elemencie #result.\n',
      solution: '<?php\n$name = "Ada";\n$age = 21;\necho "<main><h1 id=\\"result\\">$name</h1><p>Wiek: $age</p></main>";\n',
      checks: [
        ['sourceIncludes', 'Użyj zmiennej $name.', { file: 'index.php', value: '$name' }],
        ['sourceIncludes', 'Użyj zmiennej $age.', { file: 'index.php', value: '$age' }],
        ['textContains', 'Podgląd pokazuje imię Ada.', { expected: 'Ada' }],
        ['textContains', 'Podgląd pokazuje wiek 21.', { expected: '21' }],
      ],
    },
    independent: {
      prompt: 'Utwórz wizytówkę kursu z trzema wartościami: nazwą, numerem modułu i informacją true/false o ukończeniu. Pokaż je w HTML.',
      starter: '<?php\n// Przygotuj kilka zmiennych różnych typów i pokaż je w #result.\n',
      solution: '<?php\n$course = "Podstawy PHP";\n$module = 2;\n$finished = true;\n$status = $finished ? "ukończony" : "w toku";\necho "<main><h1 id=\\"result\\">$course</h1><p>Moduł $module: $status</p></main>";\n',
      checks: [
        ['sourceIncludes', 'Zadeklaruj zmienną tekstową $course.', { file: 'index.php', value: '$course' }],
        ['sourceIncludes', 'Zadeklaruj zmienną liczbową $module.', { file: 'index.php', value: '$module' }],
        ['textContains', 'Podgląd zawiera nazwę „Podstawy PHP”.', { expected: 'Podstawy PHP' }],
        ['textContains', 'Podgląd opisuje moduł 2.', { expected: 'Moduł 2' }],
      ],
    },
  },
  42: {
    guided: {
      prompt: 'Napisz warunek if/else, który pokaże tekst „Możesz wejść” dla zmiennej $age równej 18. Wynik umieść w #result.',
      starter: '<?php\n$age = 18;\n// Dodaj if/else i wyrenderuj komunikat.\n',
      solution: '<?php\n$age = 18;\nif ($age >= 18) {\n  $message = "Możesz wejść";\n} else {\n  $message = "Jeszcze poczekaj";\n}\necho "<main><p id=\\"result\\">$message</p></main>";\n',
      checks: [
        ['sourceIncludes', 'Użyj instrukcji if.', { file: 'index.php', value: 'if' }],
        ['sourceIncludes', 'Dodaj gałąź else.', { file: 'index.php', value: 'else' }],
        ['textContains', 'Dla wieku 18 pokaż „Możesz wejść”.', { expected: 'Możesz wejść' }],
      ],
    },
    independent: {
      prompt: 'Zbuduj ocenę wyniku: dla $score równego 80 pokaż „Zaliczone”, a dla niższego wyniku „Spróbuj ponownie”.',
      starter: '<?php\n$score = 80;\n// Napisz warunek i pokaż wynik w #result.\n',
      solution: '<?php\n$score = 80;\nif ($score >= 50) {\n  $message = "Zaliczone";\n} else {\n  $message = "Spróbuj ponownie";\n}\necho "<main><p id=\\"result\\">$message</p></main>";\n',
      checks: [
        ['sourceIncludes', 'Porównaj wynik przez if.', { file: 'index.php', value: 'if' }],
        ['sourceIncludes', 'Obsłuż drugą ścieżkę przez else.', { file: 'index.php', value: 'else' }],
        ['textContains', 'Podgląd pokazuje „Zaliczone”.', { expected: 'Zaliczone' }],
      ],
    },
  },
  43: {
    guided: {
      prompt: 'Użyj pętli for, aby wygenerować trzy elementy li z tekstem „Krok 1”, „Krok 2” i „Krok 3” w #result.',
      starter: '<?php\n// Wygeneruj listę trzech kroków pętlą for.\n',
      solution: '<?php\necho \'<main><h1>Plan</h1><ul id="result">\';\nfor ($i = 1; $i <= 3; $i++) {\n  echo "<li>Krok $i</li>";\n}\necho \'</ul></main>\';\n',
      checks: [
        ['sourceIncludes', 'Użyj pętli for.', { file: 'index.php', value: 'for' }],
        ['elementExists', 'Wygeneruj trzeci element listy.', { selector: '#result > li:nth-child(3)' }],
        ['textContains', 'Podgląd zawiera tekst „Krok 3”.', { expected: 'Krok 3' }],
      ],
    },
    independent: {
      prompt: 'Wygeneruj tabelę mnożenia dla liczby 2. Użyj pętli while i pokaż co najmniej trzy wiersze w #result.',
      starter: '<?php\n$number = 2;\n// Użyj while, aby wygenerować trzy wyniki mnożenia.\n',
      solution: '<?php\n$number = 2;\n$i = 1;\necho \'<main><ul id="result">\';\nwhile ($i <= 3) {\n  echo "<li>$number × $i = " . ($number * $i) . "</li>";\n  $i++;\n}\necho \'</ul></main>\';\n',
      checks: [
        ['sourceIncludes', 'Użyj pętli while.', { file: 'index.php', value: 'while' }],
        ['elementExists', 'Wygeneruj trzeci wiersz listy.', { selector: '#result > li:nth-child(3)' }],
        ['textContains', 'Podgląd pokazuje wynik 2 × 3 = 6.', { expected: '2 × 3 = 6' }],
      ],
    },
  },
  44: {
    guided: {
      prompt: 'Zapisz trzy technologie w tablicy i użyj foreach, aby wyrenderować je jako elementy li w #result.',
      starter: '<?php\n$skills = [];\n// Uzupełnij tablicę i przejdź po niej przez foreach.\n',
      solution: '<?php\n$skills = ["HTML", "CSS", "PHP"];\necho \'<main><ul id="result">\';\nforeach ($skills as $skill) {\n  echo "<li>$skill</li>";\n}\necho \'</ul></main>\';\n',
      checks: [
        ['sourceIncludes', 'Zdefiniuj tablicę $skills.', { file: 'index.php', value: '$skills' }],
        ['sourceIncludes', 'Użyj pętli foreach.', { file: 'index.php', value: 'foreach' }],
        ['elementExists', 'Wygeneruj element listy dla PHP.', { selector: '#result > li:nth-child(3)' }],
        ['textContains', 'Podgląd zawiera tekst PHP.', { expected: 'PHP' }],
      ],
    },
    independent: {
      prompt: 'Utwórz tablicę produktów z cenami i przez foreach wypisz trzy elementy listy. Pokaż nazwę produktu i znak zł.',
      starter: '<?php\n$products = [];\n// Dodaj produkty i wyrenderuj je w #result.\n',
      solution: '<?php\n$products = ["Książka", "Notes", "Kubek"];\necho \'<main><ul id="result">\';\nforeach ($products as $product) {\n  echo "<li>$product — 10 zł</li>";\n}\necho \'</ul></main>\';\n',
      checks: [
        ['sourceIncludes', 'Zdefiniuj tablicę $products.', { file: 'index.php', value: '$products' }],
        ['sourceIncludes', 'Przejdź po tablicy przez foreach.', { file: 'index.php', value: 'foreach' }],
        ['elementExists', 'Wygeneruj trzy produkty.', { selector: '#result > li:nth-child(3)' }],
        ['textContains', 'Podgląd zawiera cenę produktu.', { expected: '10 zł' }],
      ],
    },
  },
  45: {
    guided: {
      prompt: 'Napisz funkcję greet($name), która zwraca powitanie. Wywołaj ją dla Oli i pokaż wynik w #result.',
      starter: '<?php\n// Napisz funkcję greet i użyj jej w wyniku HTML.\n',
      solution: '<?php\nfunction greet($name) {\n  return "Cześć, " . $name . "!";\n}\necho \'<main><p id="result">\' . greet("Ola") . \'</p></main>\';\n',
      checks: [
        ['sourceIncludes', 'Zdefiniuj funkcję greet.', { file: 'index.php', value: 'function greet' }],
        ['sourceIncludes', 'Funkcja zwraca wartość przez return.', { file: 'index.php', value: 'return' }],
        ['textContains', 'Podgląd zawiera „Cześć, Ola!”.', { expected: 'Cześć, Ola!' }],
      ],
    },
    independent: {
      prompt: 'Utwórz funkcję formatPrice($price), która zwraca cenę z dopiskiem „zł”. Wywołaj ją w karcie produktu.',
      starter: '<?php\n// Zdefiniuj funkcję formatPrice i użyj jej w HTML.\n',
      solution: '<?php\nfunction formatPrice($price) {\n  return $price . " zł";\n}\necho \'<main><p id="result">Cena: \' . formatPrice(25) . \'</p></main>\';\n',
      checks: [
        ['sourceIncludes', 'Zdefiniuj funkcję formatPrice.', { file: 'index.php', value: 'function formatPrice' }],
        ['sourceIncludes', 'Zwróć sformatowaną cenę przez return.', { file: 'index.php', value: 'return' }],
        ['textContains', 'Podgląd pokazuje „25 zł”.', { expected: '25 zł' }],
      ],
    },
  },
  46: {
    guided: {
      prompt: 'Odczytaj imię z tablicy $_POST, zabezpiecz je przez htmlspecialchars i wyświetl w odpowiedzi. Sprawdzenie wyśle formularz POST z imieniem Ala.',
      starter: '<?php\n// Odczytaj $_POST["name"], użyj htmlspecialchars i pokaż wynik.\n',
      solution: '<?php\n$name = htmlspecialchars($_POST["name"] ?? "Gościu", ENT_QUOTES, "UTF-8");\necho "<main><p id=\\"result\\">Witaj, $name!</p></main>";\n',
      checks: [
        ['sourceIncludes', 'Odczytaj dane z $_POST.', { file: 'index.php', value: '$_POST' }],
        ['sourceIncludes', 'Zabezpiecz dane przez htmlspecialchars.', { file: 'index.php', value: 'htmlspecialchars' }],
        ['phpRequest', 'Dla żądania POST z imieniem Ala pokaż bezpieczne powitanie.', { request: { method: 'POST', form: { name: 'Ala' } }, selector: '#result', expected: 'Witaj, Ala!' }],
      ],
    },
    independent: {
      prompt: 'Zbuduj prosty formularz wiadomości po stronie PHP: odczytaj pole message z POST, zabezpiecz je i pokaż w #result. Sprawdzimy wartość „Cześć!”.',
      starter: '<?php\n// Odczytaj $_POST["message"] i bezpiecznie wyrenderuj odpowiedź.\n',
      solution: '<?php\n$message = htmlspecialchars($_POST["message"] ?? "Brak wiadomości", ENT_QUOTES, "UTF-8");\necho "<main><p id=\\"result\\">Wiadomość: $message</p></main>";\n',
      checks: [
        ['sourceIncludes', 'Odczytaj pole z $_POST.', { file: 'index.php', value: '$_POST' }],
        ['sourceIncludes', 'Wywołaj htmlspecialchars przed wyświetleniem.', { file: 'index.php', value: 'htmlspecialchars' }],
        ['phpRequest', 'Odpowiedź POST zawiera bezpiecznie wyświetloną wiadomość.', { request: { method: 'POST', form: { message: 'Cześć!' } }, selector: '#result', expected: 'Wiadomość: Cześć!' }],
      ],
    },
  },
  47: {
    guided: {
      prompt: 'Połącz zmienne, funkcję i tablicę w małą kartę profilu. Wyrenderuj imię, rolę oraz listę dwóch umiejętności.',
      starter: '<?php\n// Zbuduj kartę profilu z danymi i pętlą foreach.\n',
      solution: '<?php\n$name = "Maja";\n$role = "Frontend developer";\n$skills = ["PHP", "CSS"];\nfunction label($value) { return htmlspecialchars($value, ENT_QUOTES, "UTF-8"); }\necho "<main><article class=\\"profile\\"><h1 id=\\"result\\">" . label($name) . "</h1><p>" . label($role) . "</p><ul>";\nforeach ($skills as $skill) { echo "<li>" . label($skill) . "</li>"; }\necho "</ul></article></main>";\n',
      checks: [
        ['sourceIncludes', 'Zdefiniuj dane profilu w zmiennych.', { file: 'index.php', value: '$name' }],
        ['sourceIncludes', 'Użyj funkcji i foreach w projekcie.', { file: 'index.php', value: 'foreach' }],
        ['elementExists', 'Wyrenderuj kartę profilu.', { selector: '.profile' }],
        ['textContains', 'Podgląd zawiera rolę Frontend developer.', { expected: 'Frontend developer' }],
      ],
    },
    independent: {
      prompt: 'Zbuduj własną wizytówkę autora: zmienna z imieniem, zmienna z opisem, funkcja bezpiecznie zwracająca tekst oraz tablica zainteresowań renderowana przez foreach.',
      starter: '<?php\n// Połącz poznane elementy w jedną kartę autora.\n',
      solution: '<?php\n$author = "Kamil";\n$bio = "Uczę się programowania webowego";\n$interests = ["HTML", "PHP"];\nfunction safeText($value) { return htmlspecialchars($value, ENT_QUOTES, "UTF-8"); }\necho "<main><article class=\\"profile\\"><h1 id=\\"result\\">" . safeText($author) . "</h1><p>" . safeText($bio) . "</p><ul>";\nforeach ($interests as $interest) { echo "<li>" . safeText($interest) . "</li>"; }\necho "</ul></article></main>";\n',
      checks: [
        ['sourceIncludes', 'Zdefiniuj zmienną $author.', { file: 'index.php', value: '$author' }],
        ['sourceIncludes', 'Wykorzystaj funkcję safeText.', { file: 'index.php', value: 'function safeText' }],
        ['sourceIncludes', 'Wyrenderuj zainteresowania przez foreach.', { file: 'index.php', value: 'foreach' }],
        ['elementExists', 'Wyrenderuj element .profile.', { selector: '.profile' }],
        ['textContains', 'Podgląd zawiera opis autora.', { expected: 'Uczę się programowania webowego' }],
      ],
    },
  },
};

function makeChecks(id, recipe) {
  return [
    ...recipe.checks.map(([type, label, fields], index) => ({
      id: `${id}-${index}`,
      type,
      label,
      ...fields,
    })),
    { id: `${id}-runtime`, type: 'runtimeError', label: 'Kod PHP uruchamia się bez błędów' },
  ];
}

export function phpTasks(definition, base) {
  const localOrder = lessonSequence(definition.track ?? 'php', definition.order);
  return ['guided', 'independent'].map((mode) => {
    const recipe = recipes[localOrder + 39]?.[mode];
    if (!recipe) return null;
    const id = `php-${String(definition.order).padStart(2, '0')}-${mode}`;
    return createTask({
      id,
      mode,
      track: 'php',
      title: mode === 'guided' ? definition.title : `${definition.title} — własny przykład`,
      prompt: recipe.prompt,
      starter: projectWithSource(base, recipe.starter),
      solution: projectWithSource(base, recipe.solution),
      checks: makeChecks(id, recipe),
      hint: mode === 'guided'
        ? 'Wykonuj jedno wymaganie naraz. Kliknij Sprawdź, aby zobaczyć wynik PHP i listę brakujących warunków.'
        : 'Zacznij od działającego echo, a potem dodawaj zmienne, warunki lub pętle. Uruchamiaj kod po małej zmianie.',
    });
  }).filter(Boolean);
}
