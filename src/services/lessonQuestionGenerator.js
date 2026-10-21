import { javascriptLessonTemplates } from '../../shared/assignments/lessonCatalog.js';
import { lessonSequence } from '../data/lessonNumbers.js';
import { courseQuizPages } from '../../shared/assignments/courseQuizCatalog.js';

const TOPICS_BY_ID = { ...Object.fromEntries(javascriptLessonTemplates.map(({lessonId,topic}) => [lessonId,topic])), 'js-variables': 'variables' };
const TOPICS_IN_ORDER = javascriptLessonTemplates.map(template => template.topic);

// Each recipe has a prompt, optional code, correct answer, three misconceptions and feedback.
const recipes = {
  'error-handling': () => [
    ['Co robi catch(error)?', '', 'Przejmuje wyjątek z try i otrzymuje obiekt błędu.', 'Naprawia automatycznie wszystkie dane.', 'Wykonuje się tylko wtedy, gdy nic się nie zepsuło.', 'Zawsze ukrywa komunikat użytkownika.', 'catch dostaje zgłoszony problem. Autor programu musi zdecydować o komunikacie, przerwaniu lub bezpiecznym stanie zastępczym.'],
    ['Kiedy wykonuje się finally?', '', 'Po try/catch zarówno przy sukcesie, jak i błędzie.', 'Tylko gdy try zakończy się sukcesem.', 'Tylko gdy error.message jest pusty.', 'Przed wejściem do try.', 'finally służy do zakończenia próby, np. wyłączenia ładowania. Nie jest dowodem sukcesu.'],
    ['Czym różni się new Error od throw new Error?', '', 'Pierwsze tworzy obiekt; drugie tworzy go i zgłasza wyjątek.', 'Oba zawsze kończą całą stronę.', 'new Error wyświetla alert.', 'throw zamienia błąd na tekst JSON.', 'Samo utworzenie obiektu Error nie przerywa wykonania. throw uruchamia przekazywanie wyjątku do obsługi.'],
  ],
  'function-values': (n) => [
    ['Co zawiera zmienna operacja?', 'function podwoj(n) { return n * 2; }\nconst operacja = podwoj;', 'Funkcję, którą można później wywołać.', 'Liczbę 2.', 'Wynik ostatniego wywołania.', 'Tekst podwoj.', 'Nazwa funkcji bez nawiasów odczytuje funkcję. Dopiero operacja(3) ją uruchomi.'],
    ['Co wypisze kod?', `const podwoj = n => n * 2;\nconst f = podwoj;\nconsole.log(f(${n}));`, String(n * 2), String(n), 'undefined', 'function', 'f i podwoj wskazują tę samą funkcję; nawiasy przekazują argument i uruchamiają obliczenie.'],
    ['Po co używamy bind przy odłączaniu metody?', 'const f = profil.przedstaw.bind(profil);', 'Aby nowa funkcja zachowała this wskazujące profil.', 'Aby wykonać metodę natychmiast.', 'Aby zamienić funkcję na liczbę.', 'Aby usunąć właściwości profilu.', 'bind zwraca nową funkcję z ustalonym odbiorcą this. Sama operacja bind nie wywołuje ciała metody.'],
  ],
  comparisons: (n) => [
    ['Jaki wynik daje porównanie?', `${n} === "${n}"`, 'false', 'true', String(n), 'undefined', '=== porównuje typ i wartość. Liczba i tekst mają różne typy.'],
    ['Które porównanie obejmuje granicę?', `const prog = ${n};`, `prog >= ${n}`, `prog > ${n}`, `prog < ${n}`, `prog !== ${n}`, '>= oznacza większe lub równe, więc dla wartości dokładnie na progu daje true.'],
    ['Jaki jest wynik obu warunków razem?', 'true && false', 'false', 'true', 'undefined', '0', 'Dla wartości logicznych && wymaga prawdy po obu stronach. Jeden fałszywy warunek daje false.'],
  ],
  fetch: () => [
    ['Czy HTTP 404 samo uruchomi catch od fetch?', '', 'Nie; trzeba sprawdzić response.ok i rzucić błąd.', 'Tak, zawsze.', 'Tak, ale tylko gdy odpowiedź ma JSON.', 'Nie, bo fetch nie udostępnia statusu.', 'fetch spełnia obietnicę także dla 404. ok jest wtedy false; throw po sprawdzeniu kieruje wykonanie do catch.'],
    ['Co zwraca response.json()?', '', 'Obietnicę odczytania i sparsowania treści JSON.', 'Zawsze gotowy obiekt bez oczekiwania.', 'Status HTTP odpowiedzi.', 'Element HTML.', 'Odczyt treści jest asynchroniczny. Użyj await response.json() albo zwróć obietnicę do kolejnego then.'],
    ['Co powinno być widoczne podczas oczekiwania?', '', 'Stan ładowania, a następnie wynik albo komunikat błędu.', 'Zawsze gotowy wynik jeszcze przed odpowiedzią.', 'Tylko pusta strona bez wyjaśnienia.', 'Wynik z pominięciem sprawdzenia jego struktury.', 'Ładowanie wyjaśnia oczekiwanie. Po odpowiedzi sprawdź HTTP, odczytaj JSON i zweryfikuj wymagane dane; w catch pokaż błąd.'],
  ],
  variables: (n) => [
    ['Co wypisze program?', `let punkty = ${n};\npunkty = punkty + 2;\nconsole.log(punkty);`, `${n + 2}`, `${n}`, 'punkty', `${n}2`, 'Najpierw let zapamiętuje liczbę. Przypisanie oblicza starą wartość + 2 i zapisuje nową wartość w punkty.'],
    ['Która deklaracja przechowuje tekst?', '', 'const imie = "Ala";', 'const imie = Ala;', 'const imie = 12;', 'const imie;', 'Cudzysłowy oznaczają tekst. Bez cudzysłowów Ala byłoby nazwą zmiennej; const wymaga wartości przy deklaracji.'],
    ['Co oznacza znak = w przypisaniu?', `let wynik = ${n};`, 'Zapisz wartość po prawej pod nazwą po lewej.', 'Porównaj dwie wartości.', 'Wypisz wynik na ekranie.', 'Zamień liczbę na tekst.', 'Przypisanie zapisuje wartość w zmiennej. Samo przypisanie niczego nie wypisuje; porównanie to inne działanie.'],
  ],
  objects: (n) => [
    ['Co zwróci odczyt właściwości?', `const uczen = { imie: "Ala", punkty: ${n} };\nuczen.punkty`, `${n}`, 'Ala', 'uczen', 'undefined', 'Obiekt grupuje nazwane dane. Po kropce wskazujesz nazwę właściwości; punkty przechowuje podaną liczbę.'],
    ['Który zapis odczytuje imię?', 'const uczen = { imie: "Ala" };', 'uczen.imie', 'uczen()', 'imie.uczen', 'uczen.imie()', 'uczen to obiekt, a imie jest jego właściwością z tekstem. Odczyt właściwości nie potrzebuje nawiasów wywołania.'],
    ['Co zmieni ten kod?', `const uczen = { punkty: ${n} };\nuczen.punkty = ${n + 1};`, `Właściwość punkty będzie miała wartość ${n + 1}.`, 'Kod zawsze zgłosi błąd przez const.', 'Powstanie drugi obiekt uczen.', 'Nazwa punkty zmieni się w liczbę.', 'const chroni przypisanie zmiennej uczen do innego obiektu. Można jednak zmienić właściwość istniejącego obiektu.'],
  ],
  functions: (n) => [
    ['Jaki wynik zwróci wywołanie?', `function podwoj(liczba) {\n  return liczba * 2;\n}\npodwoj(${n});`, `${n * 2}`, `${n}`, 'liczba', 'undefined', 'Przy wywołaniu argument trafia do parametru liczba. return przekazuje obliczoną wartość do miejsca wywołania.'],
    ['Który fragment jest argumentem wywołania?', `function dodaj(a) { return a + 1; }\ndodaj(${n});`, `${n}`, 'a', 'return', 'function', 'Parametr a jest nazwą w definicji funkcji. Argument to konkretna wartość przekazana w nawiasach podczas wywołania.'],
    ['Czym jest metoda?', 'const licznik = { odczytaj() { return 3; } };\nlicznik.odczytaj();', 'Funkcją dostępną jako właściwość obiektu.', 'Każdą liczbą w obiekcie.', 'Nazwą zmiennej zadeklarowanej przez let.', 'Samym wynikiem funkcji.', 'Metoda to funkcja powiązana z obiektem. Kropka wybiera metodę, a nawiasy ją wywołują.'],
  ],
  dom: () => [
    ['Skąd pochodzi document?', '', 'Przeglądarka udostępnia obiekt reprezentujący dokument HTML.', 'Trzeba zawsze utworzyć go przez const document = {}.', 'To nazwa dowolnego elementu HTML.', 'To funkcja do wypisywania liczb.', 'W skrypcie strony document jest dostępny globalnie dzięki przeglądarce. Jego metody pozwalają szukać elementów dokumentu.'],
    ['Co oznacza argument "message"?', 'document.getElementById("message");', 'Wartość atrybutu id szukanego elementu.', 'Nowy tekst całej strony.', 'Nazwę zmiennej, którą należy zadeklarować.', 'Nazwę pliku HTML.', 'getElementById szuka elementu o podanym id. Argument jest tekstem bez #; metoda zwraca element albo null, gdy go nie znajdzie.'],
    ['Co zobaczy uczeń po wykonaniu kodu?', '<p id="message">Start</p>\n// JavaScript uruchomiony po utworzeniu elementu:\nconst opis = document.getElementById("message");\nopis.textContent = "Gotowe";', 'Akapit będzie zawierał tekst Gotowe.', 'Zniknie cały dokument.', 'Zmieni się id akapitu.', 'Powstanie nowy akapit obok starego.', 'Metoda znajduje istniejący element. Następnie przypisanie do jego właściwości textContent zmienia tekst tego elementu.'],
  ],
  conditions: (n) => [
    ['Jaki tekst zwróci funkcja?', `function ocen(punkty) {\n  if (punkty >= ${n}) return "Tak";\n  return "Nie";\n}\nocen(${n});`, 'Tak', 'Nie', 'undefined', 'true', 'Warunek >= obejmuje równość. Gdy warunek jest prawdziwy, wykonywany return kończy funkcję i zwraca tekst Tak.'],
    ['Co robi else?', '', 'Uruchamia drugą gałąź, gdy warunek if jest fałszywy.', 'Zawsze powtarza gałąź if.', 'Deklaruje obiekt.', 'Kończy cały skrypt bez warunku.', 'if wybiera działanie na podstawie warunku. else opisuje alternatywę wykonywaną, gdy ten warunek nie jest spełniony.'],
    ['Który operator porównuje wartości bez zmiany zmiennej?', '', '===', '=', '+=', '++', 'Operator === sprawdza zgodność wartości i typu. Pojedynczy = przypisuje wartość, a += i ++ zmieniają zmienną.'],
  ],
  arrays: (n) => [
    ['Jaką wartość odczyta kod?', `const punkty = [${n}, ${n + 1}, ${n + 2}];\npunkty[1];`, `${n + 1}`, `${n}`, `${n + 2}`, 'undefined', 'Indeksy tablicy zaczynają się od zera. Indeks 1 wskazuje drugi element, a length opisuje liczbę elementów.'],
    ['Co robi map?', 'const wynik = [1, 2].map(liczba => liczba * 2);', 'Tworzy nową tablicę [2, 4].', 'Usuwa tablicę wejściową.', 'Zwraca wyłącznie liczbę 4.', 'Zawsze sortuje elementy.', 'map wywołuje funkcję dla każdego elementu i zbiera wyniki w nowej tablicy. Ten przykład nie zmienia tablicy wejściowej.'],
    ['Co robi filter?', 'const wynik = [1, 4, 7].filter(liczba => liczba > 3);', 'Tworzy tablicę [4, 7].', 'Tworzy tablicę [false, true, true].', 'Zwraca 3.', 'Dodaje 3 do każdej liczby.', 'filter zachowuje elementy spełniające warunek. Wartości logiczne decydują o wyborze; nie stają się elementami wyniku.'],
  ],
  events: () => [
    ['Kiedy wykona się funkcja przekazana jako drugi argument?', 'przycisk.addEventListener("click", () => {\n  console.log("Start");\n});', 'Po kliknięciu przycisku.', 'Wyłącznie podczas deklarowania zmiennej.', 'W każdej klatce animacji.', 'Po zamknięciu karty.', 'addEventListener rejestruje funkcję obsługi. Przeglądarka wywoła ją po zdarzeniu click na tym przycisku.'],
    ['Po co wywołujemy preventDefault w obsłudze submit?', '', 'Aby zatrzymać domyślne wysłanie formularza.', 'Aby usunąć wszystkie pola formularza.', 'Aby zakazać uruchamiania funkcji.', 'Aby zmienić tekst przycisku.', 'Domyślne wysłanie formularza może przeładować lub opuścić stronę. preventDefault pozwala przejąć obsługę danych w JavaScript.'],
    ['Które zdarzenie pasuje do bieżącej edycji tekstu w polu?', '', 'input', 'submit', 'load', 'click', 'Zdarzenie input informuje o zmianie wartości pola przez użytkownika. Obsługa może wtedy odczytać value i odświeżyć wynik.'],
  ],
  state: () => [
    ['Co powinno robić render()?', '', 'Odtwarzać widok na podstawie aktualnych danych.', 'Losowo usuwać dane.', 'Zawsze rejestrować kolejną kopię obsługi kliknięcia.', 'Zastępować wszystkie funkcje w programie.', 'Stan przechowuje dane aplikacji. render odczytuje te dane i pokazuje wynik, dzięki czemu widok odpowiada aktualnemu stanowi.'],
    ['Co pokazać, gdy lista zadań jest pusta?', '', 'Czytelny komunikat, np. Brak zadań.', 'Nieprawdziwe przykładowe zadanie.', 'Zawsze błąd składni.', 'Sam napis undefined.', 'Stan pusty jest poprawnym stanem aplikacji. Komunikat wyjaśnia uczniowi, dlaczego lista jeszcze nie zawiera elementów.'],
    ['Jaka kolejność pasuje do przycisku Dodaj?', '', 'Zmień dane, potem odśwież widok.', 'Odśwież widok, a dane zmień po zamknięciu strony.', 'Usuń stan, potem odczytaj go.', 'Tylko zmień kolor przycisku.', 'Najpierw aktualizujemy stan, np. dodajemy zadanie do tablicy. Potem render pokazuje nową zawartość tablicy.'],
  ],
  storage: () => [
    ['Dlaczego JSON.parse może wymagać try/catch?', '', 'Niepoprawny tekst JSON powoduje wyjątek.', 'Każdy JSON jest funkcją.', 'JSON.parse zawsze zwraca element HTML.', 'try zmienia tekst w poprawny JSON.', 'JSON.parse wymaga poprawnej składni JSON. catch pozwala obsłużyć błąd, np. pokazać komunikat, zamiast przerwać obsługę aplikacji.'],
    ['Co przygotowuje obiekt do zapisania jako tekst?', '', 'JSON.stringify(dane)', 'JSON.parse(dane)', 'dane.addEventListener()', 'document.createElement(dane)', 'JSON.stringify zamienia obsługiwane dane na tekst JSON. JSON.parse wykonuje odwrotną operację dla poprawnego tekstu JSON.'],
    ['Jak traktować dane odczytane z pamięci?', '', 'Sprawdzić ich strukturę przed użyciem.', 'Zakładać, że zawsze są poprawne.', 'Wykonać je jako kod.', 'Zawsze zamienić je na element script.', 'Zapis może być nieobecny, stary lub zmieniony. Po odczycie i parsowaniu trzeba sprawdzić, czy dane mają oczekiwaną strukturę.'],
  ],
  planner: () => [
    ['Gdzie przechowywać dane wydarzeń planera?', '', 'W tablicy obiektów opisujących wydarzenia.', 'Wyłącznie w kolorach przycisków.', 'W nazwie funkcji render.', 'Wyłącznie w komunikacie błędu.', 'Każde wydarzenie ma powiązane dane, np. tytuł i datę, więc pasuje do obiektu. Tablica przechowuje wiele takich obiektów.'],
    ['Co sprawdzić przed dodaniem wydarzenia?', '', 'Czy wymagane pola mają poprawne wartości.', 'Czy użytkownik zna nazwę zmiennej.', 'Czy tablica ma zawsze dokładnie 10 elementów.', 'Czy każde pole zawiera HTML.', 'Walidacja zapobiega dodaniu pustego lub błędnego wydarzenia. Komunikat powinien wskazać pole i wyjaśnić, jak je poprawić.'],
    ['Jak bezpiecznie pokazać tytuł wpisany przez użytkownika?', '', 'Przypisać tekst do textContent elementu.', 'Wkleić go do innerHTML jako kod.', 'Przekazać go do eval.', 'Użyć go jako treści skryptu.', 'textContent wyświetla dane jako tekst. Tytuł wydarzenia nie powinien być interpretowany jako HTML ani wykonywalny kod.'],
  ],
};

function randomFrom(seed) {
  let value = 2166136261;
  for (const char of String(seed)) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return () => {
    value += 0x6d2b79f5;
    let next = Math.imul(value ^ value >>> 15, 1 | value);
    next ^= next + Math.imul(next ^ next >>> 7, 61 | next);
    return ((next ^ next >>> 14) >>> 0) / 4294967296;
  };
}
function shuffled(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

/** Returns fresh, reproducible multiple-choice questions. No learner code is executed.
 * lesson: { id, track: 'js', order: 401..413 }; options: { seed, count: 1..3, topic? }.
 * Treat correctOptionId and explanation as teacher/feedback data; reveal them after submission.
 */
export function generateLessonQuestions(lesson, { seed = 0, count = 3, topic: explicitTopic } = {}) {
  if (!Number.isInteger(count) || count < 1 || count > 3) throw new Error('Liczba pytań musi mieścić się w zakresie 1–3.');
  if (lesson?.track !== 'js') {
    const pages = courseQuizPages[lesson?.id];
    if (!pages) throw new Error('Brak pytań do tej lekcji.');
    const random = randomFrom(`${lesson.id}:${seed}`);
    return shuffled(pages.map((page, index) => ({ page, index })), random).slice(0, count).map(({ page, index }) => {
      const id = `${lesson.id}:${String(seed)}:${index}`;
      const distractors = shuffled([...new Set(pages.filter(other => other.result !== page.result).map(other => other.result))], random).slice(0, 3);
      const options = shuffled([page.result, ...distractors].map((text, optionIndex) => ({ id: `${id}:option-${optionIndex}`, text })), random);
      return { id, topic: lesson.id, type: 'single-choice', prompt: `${page.title} — wybierz poprawne stwierdzenie.`, code: page.code, options, correctOptionId: `${id}:option-0`, explanation: page.text };
    });
  }
  const topic = explicitTopic || TOPICS_BY_ID[lesson.id] || TOPICS_IN_ORDER[lessonSequence('js', lesson.order) - 1];
  if (!Object.hasOwn(recipes, topic)) throw new Error('Nieobsługiwany temat lekcji JavaScript.');
  const lessonId = lesson.id || `js-${lesson.order}`;
  const random = randomFrom(`${lessonId}:${topic}:${seed}`);
  const indices = shuffled([0, 1, 2], random);
  return Array.from({ length: count }, (_, index) => {
    const recipeIndex = indices[index % indices.length];
    const number = 2 + Math.floor(random() * 18);
    const [prompt, code, correct, ...rest] = recipes[topic](number)[recipeIndex];
    const explanation = rest.pop();
    const id = `${lessonId}:${topic}:${String(seed)}:${index + 1}`;
    const options = shuffled([correct, ...rest].map((text, optionIndex) => ({ id: `${id}:option-${optionIndex}`, text })), random);
    return { id, topic, type: 'single-choice', prompt, code, options, correctOptionId: `${id}:option-0`, explanation };
  });
}

export function gradeLessonQuestion(question, selectedOptionId) {
  return {
    correct: question.options.some(option => option.id === selectedOptionId) && selectedOptionId === question.correctOptionId,
    explanation: question.explanation,
  };
}
