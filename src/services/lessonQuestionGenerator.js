import { javascriptLessonTemplates } from '../../shared/assignments/lessonCatalog.js';
import { lessonSequence } from '../data/lessonNumbers.js';
import { courseQuizPages } from '../../shared/assignments/courseQuizCatalog.js';
import { jsCoursePages } from '../data/jsCoursePages.js';

const MAX_QUESTIONS = 6;

const TOPICS_BY_ID = { ...Object.fromEntries(javascriptLessonTemplates.map(({lessonId,topic}) => [lessonId,topic])), 'js-variables': 'variables' };
const TOPICS_IN_ORDER = javascriptLessonTemplates.map(template => template.topic);

// Each recipe has a prompt, optional code, correct answer, three misconceptions and feedback.
const recipes = {
  'error-handling': () => [
    ['Co robi catch(error)?', '', 'Przejmuje wyjątek z try i otrzymuje obiekt błędu.', 'Naprawia automatycznie wszystkie dane.', 'Wykonuje się tylko wtedy, gdy nic się nie zepsuło.', 'Zawsze ukrywa komunikat użytkownika.', 'catch dostaje zgłoszony problem. Autor programu musi zdecydować o komunikacie, przerwaniu lub bezpiecznym stanie zastępczym.'],
    ['Kiedy wykonuje się finally?', '', 'Po try/catch zarówno przy sukcesie, jak i błędzie.', 'Tylko gdy try zakończy się sukcesem.', 'Tylko gdy error.message jest pusty.', 'Przed wejściem do try.', 'finally służy do zakończenia próby, np. wyłączenia ładowania. Nie jest dowodem sukcesu.'],
    ['Czym różni się new Error od throw new Error?', '', 'Pierwsze tworzy obiekt; drugie tworzy go i zgłasza wyjątek.', 'Oba zawsze kończą całą stronę.', 'new Error wyświetla alert.', 'throw zamienia błąd na tekst JSON.', 'Samo utworzenie obiektu Error nie przerywa wykonania. throw uruchamia przekazywanie wyjątku do obsługi.'],
    ['Co dzieje się z instrukcjami po nieobsłużonym błędzie?', 'console.log("Przed");\nconsole.log(nieistniejacaZmienna);\nconsole.log("Po");', 'Wypisuje się Przed, potem występuje błąd; wpisu Po nie ma.', 'Wypisują się wszystkie trzy komunikaty.', 'Przeglądarka samoczynnie poprawia nazwę zmiennej.', 'Błąd pojawia się dopiero po wpisie Po.', 'Nieobsłużony wyjątek przerywa normalne wykonanie. Instrukcje po miejscu błędu nie są wykonywane.'],
    ['Kiedy warto zgłosić własny wyjątek przez throw?', 'function sprawdzWiek(wiek) {\n  if (typeof wiek !== "number") {\n    throw new Error("Podaj wiek jako liczbę");\n  }\n  return wiek;\n}', 'Gdy dane nie spełniają reguły funkcji, np. wiek nie jest liczbą.', 'Zawsze przy każdym wywołaniu funkcji.', 'Tylko po błędzie składni pliku.', 'Gdy chcemy pominąć walidację danych.', 'throw sygnalizuje naruszenie reguły programu. Komunikat w message trafia do catch, który może pokazać go użytkownikowi.'],
    ['Co dostaje catch do zmiennej error?', 'try {\n  JSON.parse("{broken}");\n} catch (error) {\n  console.log(error.message);\n}', 'Obiekt błędu z nazwą i komunikatem.', 'Zawsze tekst skryptu, który się nie udał.', 'Wartość zwróconą przez JSON.parse.', 'Nazwę zmiennej, która spowodowała błąd.', 'Obiekt error ma name, np. SyntaxError, oraz message z opisem. Catch nie naprawia danych — pozwala zdecydować o reakcji.'],
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
    ['Jakie są kolejno kroki bezpiecznego pobrania danych?', '', 'await fetch, sprawdzenie response.ok, await response.json.', 'await response.json, potem await fetch.', 'Sprawdzenie ok jeszcze przed wywołaniem fetch.', 'Najpierw odczyt danych, potem sprawdzenie sieci.', 'Najpierw obietnica odpowiedzi, potem weryfikacja statusu 200–299, a dopiero później asynchroniczny odczyt treści.'],
    ['Do czego służy if (!response.ok) throw w pobieraniu?', '', 'Kieruje statusy błędów HTTP do catch.', 'Usuwa niepoprawne dane z odpowiedzi.', 'Powtarza żądanie aż do sukcesu.', 'Zatrzymuje wykonanie całej strony.', 'fetch nie odrzuca obietnicy dla 404 czy 500. Własny throw traktuje zły status jak błąd do obsłużenia.'],
    ['Po co sprawdzać strukturę pobranych danych?', '', 'Sukces HTTP nie gwarantuje oczekiwanych pól.', 'Serwer zawsze zwraca tekst zamiast JSON.', 'fetch sam waliduje typy pól.', 'Bo await zamienia obiekt na tablicę.', 'Kod 200 z innym kształtem danych to nadal błąd dla aplikacji. Sprawdź np. typeof dane.title przed użyciem.'],
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
    ['Co zwróci getElementById dla id, którego nie ma w HTML?', 'document.getElementById("nie-ma");', 'null, bo nie znaleziono elementu.', 'Pusty element HTML.', 'Wyjątek przerywający skrypt.', 'Tekst "nie-ma".', 'Wyszukiwanie nieudanego id zwraca null. Odczyt textContent z null spowodowałby błąd — najpierw sprawdź id i kolejność ładowania.'],
    ['Czym różni się querySelector od getElementById?', '', 'querySelector przyjmuje selektor CSS, np. "#message" lub ".klasa".', 'querySelector wymaga id bez znaku #.', 'getElementById zwraca wszystkie dopasowania.', 'querySelector działa tylko dla przycisków.', 'querySelector używa składni selektorów CSS: # dla id, kropka dla klasy. Obie metody zwracają pierwszy element albo null.'],
    ['Co wykonuje ten fragment?', 'const link = document.createElement("a");\nlink.textContent = "Dokumentacja";\ndocument.getElementById("links").append(link);', 'Tworzy link w pamięci, nadaje mu tekst i wstawia do strony.', 'Tworzy link, który od razu sam się wyświetla.', 'Zamienia akapit links na element a.', 'Wypisuje tekst Dokumentacja w konsoli.', 'createElement tworzy element w pamięci; dopiero append dołącza go do dokumentu wskazanego rodzica.'],
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
    ['Gdzie rejestrować obsługę submit formularza?', 'const form = document.querySelector("#form");\nform.addEventListener("submit", (event) => {\n  event.preventDefault();\n});', 'Na formularzu przez addEventListener("submit", ...).', 'Na przycisku przez addEventListener("click", ...) zamiast submit.', 'Na dokumencie przez zdarzenie send.', 'W każdym polu input osobno.', 'submit jest zdarzeniem formularza — działa też dla Enter w polu. Nasłuch na samym przycisku ominąłby wysłanie klawiszem Enter.'],
    ['Co odczyta new FormData(form).get("student")?', '<form id="form"><input id="student" name="student" value="Ola"></form>', 'Wartość pola o atrybucie name="student", czyli tekst Ola.', 'Wartość pola o id="student", czyli undefined.', 'Cały obiekt formularza.', 'Liczę pól w formularzu.', 'FormData zbiera pola po atrybutach name. get("student") zwraca wpisany tekst; zamianę na liczbę robi Number().'],
    ['Dlaczego wartość z input wymaga czasem Number()?', '', 'input.value zawsze zwraca tekst, także dla cyfr.', 'Number usuwa spacje z tekstu.', 'Bo value przechowuje obiekt pola.', 'Bo porównanie tekstu zawsze daje błąd.', 'Wpisane "3" to tekst, nie liczba 3. Number(tekst) zamienia go na liczbę przed porównaniem lub działaniem arytmetycznym.'],
  ],
  state: () => [
    ['Co powinno robić render()?', '', 'Odtwarzać widok na podstawie aktualnych danych.', 'Losowo usuwać dane.', 'Zawsze rejestrować kolejną kopię obsługi kliknięcia.', 'Zastępować wszystkie funkcje w programie.', 'Stan przechowuje dane aplikacji. render odczytuje te dane i pokazuje wynik, dzięki czemu widok odpowiada aktualnemu stanowi.'],
    ['Co pokazać, gdy lista zadań jest pusta?', '', 'Czytelny komunikat, np. Brak zadań.', 'Nieprawdziwe przykładowe zadanie.', 'Zawsze błąd składni.', 'Sam napis undefined.', 'Stan pusty jest poprawnym stanem aplikacji. Komunikat wyjaśnia uczniowi, dlaczego lista jeszcze nie zawiera elementów.'],
    ['Jaka kolejność pasuje do przycisku Dodaj?', '', 'Zmień dane, potem odśwież widok.', 'Odśwież widok, a dane zmień po zamknięciu strony.', 'Usuń stan, potem odczytaj go.', 'Tylko zmień kolor przycisku.', 'Najpierw aktualizujemy stan, np. dodajemy zadanie do tablicy. Potem render pokazuje nową zawartość tablicy.'],
    ['Co robią metody push i pop na tablicy stanu?', '', 'push dopisuje element na końcu, a pop usuwa ostatni.', 'push usuwa pierwszy element, a pop dodaje nowy.', 'Obie metody tylko odczytują tablicę.', 'push sortuje tablicę, a pop ją odwraca.', 'push wydłuża tablicę o nowy element. pop zdejmuje ostatni element i go zwraca. Po zmianie trzeba wywołać render.'],
    ['Dlaczego po state.items.push("HTML") wywołujemy render()?', 'przycisk.addEventListener("click", () => {\n  state.items.push("HTML");\n  render();\n});', 'Bo sama zmiana tablicy nie aktualizuje widoku.', 'Bo push wymaga drugiego argumentu.', 'Bo inaczej kliknięcie zostanie zapomniane.', 'Bo render tworzy nowy element tablicy.', 'Zwykły JavaScript nie wiąże danych z ekranem. render odczytuje stan i aktualizuje #result — bez wywołania widok pokazuje stare dane.'],
    ['Ile razy rejestrujemy addEventListener dla tej samej akcji?', '', 'Raz — render wywołujemy przy każdej zmianie, ale nasłuch rejestrujemy jednokrotnie.', 'Za każdym razem, gdy zmienia się stan.', 'Raz na każdy element tablicy.', 'Przy każdym wywołaniu render.', 'Rejestracja nasłuchu w render mnożyłaby reakcje na jedno kliknięcie. Listener ustawiamy raz; render tylko odczytuje stan.'],
  ],
  storage: () => [
    ['Dlaczego JSON.parse może wymagać try/catch?', '', 'Niepoprawny tekst JSON powoduje wyjątek.', 'Każdy JSON jest funkcją.', 'JSON.parse zawsze zwraca element HTML.', 'try zmienia tekst w poprawny JSON.', 'JSON.parse wymaga poprawnej składni JSON. catch pozwala obsłużyć błąd, np. pokazać komunikat, zamiast przerwać obsługę aplikacji.'],
    ['Co przygotowuje obiekt do zapisania jako tekst?', '', 'JSON.stringify(dane)', 'JSON.parse(dane)', 'dane.addEventListener()', 'document.createElement(dane)', 'JSON.stringify zamienia obsługiwane dane na tekst JSON. JSON.parse wykonuje odwrotną operację dla poprawnego tekstu JSON.'],
    ['Jak traktować dane odczytane z pamięci?', '', 'Sprawdzić ich strukturę przed użyciem.', 'Zakładać, że zawsze są poprawne.', 'Wykonać je jako kod.', 'Zawsze zamienić je na element script.', 'Zapis może być nieobecny, stary lub zmieniony. Po odczycie i parsowaniu trzeba sprawdzić, czy dane mają oczekiwaną strukturę.'],
    ['Co zwróci JSON.parse dla poprawnego zapisu?', 'const dane = JSON.parse(\'{"name":"Ola"}\');\nconsole.log(dane.name);', 'Obiekt, którego pole name ma wartość Ola.', 'Tekst {"name":"Ola"} bez zmian.', 'Tablicę z napisami name i Ola.', 'Wartość undefined, bo JSON to tylko format.', 'Poprawny tekst JSON zamienia się na wartość JavaScript — tu obiekt. Dopiero wtedy dane.name daje Ola.'],
    ['Czy poprawny JSON gwarantuje poprawne dane?', 'const dane = JSON.parse(\'{"name":12}\');', 'Nie — składnia może być poprawna, a typy pól inne niż oczekiwane.', 'Tak — parse nie zwrócił błędu.', 'Tak — JSON sam waliduje typy.', 'Nie — parse zawsze zwraca null.', 'JSON.parse sprawdza składnię, nie sens danych. name: 12 przechodzi parsowanie; sprawdź np. typeof dane.name === "string".'],
    ['Po co try/catch wokół zapisu odczytanego z pamięci?', '', 'Zapis może być uszkodzony i JSON.parse rzuci wyjątek.', 'try przyspiesza odczyt danych.', 'Bez try localStorage odmówi odczytu.', 'catch naprawia uszkodzone dane automatycznie.', 'Niepoprawny tekst JSON przerywa skrypt wyjątkiem. catch pozwala użyć stanu zastępczego i pokazać komunikat.'],
  ],
  planner: () => [
    ['Gdzie przechowywać dane wydarzeń planera?', '', 'W tablicy obiektów opisujących wydarzenia.', 'Wyłącznie w kolorach przycisków.', 'W nazwie funkcji render.', 'Wyłącznie w komunikacie błędu.', 'Każde wydarzenie ma powiązane dane, np. tytuł i datę, więc pasuje do obiektu. Tablica przechowuje wiele takich obiektów.'],
    ['Co sprawdzić przed dodaniem wydarzenia?', '', 'Czy wymagane pola mają poprawne wartości.', 'Czy użytkownik zna nazwę zmiennej.', 'Czy tablica ma zawsze dokładnie 10 elementów.', 'Czy każde pole zawiera HTML.', 'Walidacja zapobiega dodaniu pustego lub błędnego wydarzenia. Komunikat powinien wskazać pole i wyjaśnić, jak je poprawić.'],
    ['Jak bezpiecznie pokazać tytuł wpisany przez użytkownika?', '', 'Przypisać tekst do textContent elementu.', 'Wkleić go do innerHTML jako kod.', 'Przekazać go do eval.', 'Użyć go jako treści skryptu.', 'textContent wyświetla dane jako tekst. Tytuł wydarzenia nie powinien być interpretowany jako HTML ani wykonywalny kod.'],
    ['Jak dodać punkt li z tytułem wydarzenia do listy?', 'const li = document.createElement("li");\nli.textContent = title;\nlista.append(li);', 'createElement tworzy li, textContent nadaje tekst, append wstawia do listy.', 'Wystarczy samo createElement — li pojawi się samo.', 'append tworzy nowy element od razu na stronie.', 'innerHTML += title buduje element bezpiecznie.', 'Nowy element istnieje najpierw w pamięci. Tekst ustawiamy przez textContent; dopiero append dołącza li do dokumentu.'],
    ['Jak pokazać tylko nieukończone wydarzenia?', '', 'events.filter(item => !item.done) i render z wyniku.', 'events.pop() aż zostaną same nieukończone.', 'Zmienić done wszystkich na true.', 'Usunąć filtr i pokazać wszystko.', 'filter tworzy nową tablicę bez zmiany oryginału. render(items) pokazuje przekazaną listę — dane i widok są osobne.'],
    ['Co robi lista.replaceChildren(...punkty)?', 'const punkty = events.map(title => {\n  const li = document.createElement("li");\n  li.textContent = title;\n  return li;\n});\nlista.replaceChildren(...punkty);', 'Zastępuje całą zawartość listy nowymi elementami li.', 'Dopisuje kolejne punkty do starej listy.', 'Usuwa samą listę z dokumentu.', 'Zamienia punkty na tekst HTML.', 'replaceChildren wymienia dzieci elementu na przekazane węzły — nie trzeba ręcznie kasować starych punktów.'],
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
 * lesson: { id, track: 'js', order: 401..413 }; options: { seed, count: 1..6, topic? }.
 * Default count follows the number of topics in the lesson (teaching pages), capped at 6.
 * Treat correctOptionId and explanation as teacher/feedback data; reveal them after submission.
 */
export function generateLessonQuestions(lesson, { seed = 0, count, topic: explicitTopic } = {}) {
  if (count !== undefined && (!Number.isInteger(count) || count < 1 || count > MAX_QUESTIONS)) throw new Error(`Liczba pytań musi mieścić się w zakresie 1–${MAX_QUESTIONS}.`);
  if (lesson?.track !== 'js') {
    const pages = courseQuizPages[lesson?.id];
    if (!pages) throw new Error('Brak pytań do tej lekcji.');
    const total = count ?? Math.min(pages.length, MAX_QUESTIONS);
    const random = randomFrom(`${lesson.id}:${seed}`);
    return shuffled(pages.map((page, index) => ({ page, index })), random).slice(0, total).map(({ page, index }) => {
      const id = `${lesson.id}:${String(seed)}:${index}`;
      const distractors = shuffled([...new Set(pages.filter(other => other.result !== page.result).map(other => other.result))], random).slice(0, 3);
      const options = shuffled([page.result, ...distractors].map((text, optionIndex) => ({ id: `${id}:option-${optionIndex}`, text })), random);
      return { id, topic: lesson.id, type: 'single-choice', prompt: `${page.title} — wybierz poprawne stwierdzenie.`, code: page.code, options, correctOptionId: `${id}:option-0`, explanation: page.text };
    });
  }
  const template = javascriptLessonTemplates[lessonSequence('js', lesson.order) - 1];
  const topic = explicitTopic || TOPICS_BY_ID[lesson.id] || template?.topic;
  if (!Object.hasOwn(recipes, topic)) throw new Error('Nieobsługiwany temat lekcji JavaScript.');
  const lessonId = lesson.id || template?.lessonId || `js-${lesson.order}`;
  const total = count ?? Math.min(jsCoursePages[lessonId]?.length ?? 3, MAX_QUESTIONS);
  const random = randomFrom(`${lessonId}:${topic}:${seed}`);
  const variantCount = recipes[topic](0).length;
  const seen = new Set();
  const questions = [];
  for (let index = 0, attempts = 0; index < total && attempts < total * variantCount + 10; attempts++) {
    const recipeIndex = Math.floor(random() * variantCount);
    const number = 2 + Math.floor(random() * 18);
    const [prompt, code, correct, ...rest] = recipes[topic](number)[recipeIndex];
    if (seen.has(`${prompt}\n${code}`)) continue;
    seen.add(`${prompt}\n${code}`);
    const explanation = rest.pop();
    const id = `${lessonId}:${topic}:${String(seed)}:${index + 1}`;
    const options = shuffled([correct, ...rest].map((text, optionIndex) => ({ id: `${id}:option-${optionIndex}`, text })), random);
    questions.push({ id, topic, type: 'single-choice', prompt, code, options, correctOptionId: `${id}:option-0`, explanation });
    index += 1;
  }
  return questions;
}

export function gradeLessonQuestion(question, selectedOptionId) {
  return {
    correct: question.options.some(option => option.id === selectedOptionId) && selectedOptionId === question.correctOptionId,
    explanation: question.explanation,
  };
}
