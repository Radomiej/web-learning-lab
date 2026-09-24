# Integracja Monaco Editor w Web Learning Lab

## Cel

Zastąpić obecny oparty na `textarea` edytor wspólnym edytorem Monaco, aby uczniowie mogli pracować z plikami kursu w sposób zbliżony do `java-lab`: z kolorowaniem składni, automatycznym zamykaniem nawiasów i cudzysłowów, modelami per plik, skrótami edytora oraz przewidywalnym przełączaniem między kartami.

Zakres obejmuje istniejące ścieżki HTML, CSS, Layout, JavaScript, React i PHP. Monaco odpowiada wyłącznie za edycję kodu; sandbox, walidacja zadań, zapis projektów, auto-podgląd i wykonywanie PHP pozostają osobnymi warstwami.

## Stan obecny i wzorzec referencyjny

`web-learning-lab` używa `src/components/CodeEditor.jsx` z kontrolowanym `textarea` oraz `src/services/codeEditing.js` do prostych operacji na zaznaczeniu, undo/redo i formatowania Prettierem.

`C:\Nauka\java-lab` używa bezpośrednio `monaco-editor`: ładuje Monaco i worker dynamicznie, tworzy modele `monaco.editor.createModel` dla plików, przełącza aktywny model bez niszczenia edytora, rejestruje skróty przez `editor.addAction` i ma fallback do textarea, gdy ładowanie się nie powiedzie.

## Decyzja architektoniczna

Użyjemy bezpośredniego `monaco-editor` w wersji zgodnej z `java-lab`, bez dodatkowego wrappera React. Pozwoli to zachować kontrolę nad workerem, modelami, URI plików, cyklem życia i skrótami. Monaco będzie ładowane asynchronicznie, aby początkowy ekran kursu nie blokował się na dużym bundle'u edytora.

### Mapowanie języków

Nowy mały moduł usługowy będzie jedynym źródłem mapowania rozszerzenia na język Monaco:

| Plik | Język Monaco | Uwagi |
| --- | --- | --- |
| `.html` | `html` | pełne kolorowanie HTML i automatyczne zamykanie tagów |
| `.css` | `css` | kolorowanie selektorów, właściwości i wartości |
| `.js`, `.jsx` | `javascript` | JSX pozostaje edytowalny w tym samym trybie; nie zmieniamy rozszerzeń CRA |
| `.php` | `php` | podstawowe kolorowanie PHP z modułu `basic-languages` |
| pozostałe | `plaintext` | bezpieczny fallback dla nowych plików |

Rozpoznanie będzie zależne od ścieżki pliku, a nie od aktualnej ścieżki kursu. Dzięki temu dodany plik PHP, komponent React `.js` i zwykły skrypt `.js` dostaną poprawny tryb.

### Modele i synchronizacja

`CodeEditor` utrzyma jeden model Monaco na każdy plik aktywnego zadania. URI będą izolowane przez klucz zadania, np. `inmemory://web-learning-lab/<task>/<path>`, aby przełączanie lekcji nie dzieliło undo ani treści między projektami.

- Przy pierwszym użyciu pliku model otrzyma aktualną treść i język wynikający z rozszerzenia.
- `model.onDidChangeContent` wyśle zmiany do istniejącego `onChange`, więc zapis do localStorage i auto-podgląd pozostaną bez zmian.
- Zmiana wartości z zewnątrz, np. reset lub „Pokaż rozwiązanie”, zaktualizuje model tylko wtedy, gdy treść faktycznie się różni; unikniemy pętli zmian.
- Zmiana aktywnego pliku przełączy model przez `editor.setModel`, bez remountowania całego edytora.
- Przy zmianie zadania wszystkie modele i listenery poprzedniego workspace zostaną zwolnione.

### Worker i ładowanie

Monaco oraz `editor.worker` będą importowane dynamicznie. `globalThis.MonacoEnvironment.getWorker` wskaże bundlowany worker, podobnie jak w `java-lab`. Stan UI będzie rozróżniał:

- ładowanie: komunikat „Ładowanie edytora…”;
- gotowy edytor: Monaco z aktywnym językiem;
- błąd ładowania: działający obecny `textarea`, aby kurs pozostał używalny offline i przy problemie z workerem.

Fallback zachowa obecne skróty i formatowanie. Nie będzie drugiej ścieżki wykonywania kodu ani utraty treści, jeśli Monaco nie wystartuje.

## Funkcje edytora

Konfiguracja Monaco powinna zachować dydaktyczny, spokojny wygląd obecnego kursu:

- motyw `vs-dark`, rozmiar pisma 13–14 px, line-height około 21 px;
- minimapa wyłączona, `automaticLayout: true`, brak przewijania poza ostatnią linię;
- tabulator 2 spacje i padding edytora;
- wbudowane sugestie językowe, auto-close brackets/quotes i bracket matching;
- `Ctrl/Cmd+S` wywołuje istniejące `onSave` i odświeża preview;
- `Shift+Alt+F` uruchamia istniejące formatowanie przez `formatCode`;
- `Ctrl/Cmd+D` oraz `Ctrl/Cmd+Shift+K` usuwają linię zgodnie z konwencją `java-lab`;
- `Ctrl/Cmd+/` przełącza komentarz;
- `Alt+↑/↓` przenosi linię, a `Shift+Alt+↑/↓` ją duplikuje;
- przycisk „Formatuj kod”, reset, sprawdzanie, rozwiązanie i auto-podgląd zachowują obecne działanie.

Skróty będą zarejestrowane przez `editor.addAction`, a callbacki będą korzystać z aktualnych refów, aby nie zamykać starej treści w klauzurze.

## Granice odpowiedzialności

- `CodeEditor` zarządza cyklem życia Monaco, modelami, językiem, skrótami i fallbackiem.
- Nowy moduł mapowania języków zawiera tylko funkcje czyste i testowalne.
- `codeEditing.js` nadal odpowiada za Prettier i fallbackowe operacje na textarea; Monaco wywołuje te same callbacki.
- `EditorTabs`, `LessonWorkspace`, `App`, localStorage i `usePreviewRuntime` pozostają kompatybilne z dotychczasowym API.
- Nie budujemy pełnego language servera, debuggera, uruchamiania PHP z edytora ani autouzupełniania semantycznego Reacta. Wbudowane sugestie Monaco wystarczą dla pierwszej wersji.

## Testowanie

Testy jednostkowe i komponentowe:

1. Mapowanie ścieżek `.html`, `.css`, `.js`, `.jsx`, `.php` i nieznanego rozszerzenia.
2. Tworzenie izolowanego URI oraz poprawnego modelu dla każdego pliku.
3. Zmiana modelu wywołuje `onChange` z właściwą ścieżką i treścią.
4. Zewnętrzna zmiana wartości synchronizuje model bez dodatkowego zapisu zwrotnego.
5. Przełączanie kart zachowuje modele, a zmiana zadania zwalnia poprzedni workspace.
6. `Ctrl/Cmd+S`, formatowanie, komentarz i usuwanie linii są podłączone do istniejących callbacków.
7. Błąd dynamicznego ładowania pokazuje fallback textarea i nie blokuje akcji kursu.
8. Istniejące testy `CodeEditor`, sandboxa, projektów, Reacta i PHP pozostają zielone.

Walidacja w przeglądarce na `http://127.0.0.1:5181/`:

- ekran kursu ładuje się bez overlayu błędu;
- lekcja HTML pokazuje tryb HTML, lekcja CSS tryb CSS, React `.js` tryb JavaScript/JSX, a PHP tryb PHP;
- przełączanie pięciu plików CRA nie gubi treści i undo;
- wpisanie kodu, `Ctrl+S`, auto-podgląd, „Sprawdź” i „Pokaż rozwiązanie” działają tak jak przed migracją;
- po odświeżeniu przeglądarki treść i postęp pozostają zapisane;
- przy niedostępnym workerze fallback textarea pozostaje edytowalny.

## Kryteria akceptacji

Zmiana jest gotowa, gdy:

- edytor Monaco jest używany w każdej ścieżce kursu, a fallback jest widoczny tylko przy błędzie ładowania;
- pliki kursu otrzymują poprawne tryby HTML, CSS, JavaScript/JSX, PHP lub plaintext;
- przełączanie plików i zadań nie miesza modeli, undo ani treści;
- wszystkie istniejące akcje edytora oraz sandboxa działają bez zmian w kontrakcie komponentów;
- testy i build przechodzą, a ręczny smoke test potwierdza realne zachowanie iframe.

## Poza zakresem

- Java jako nowa ścieżka w `web-learning-lab` — Java pozostaje w `java-lab`.
- pełne IntelliSense z analizą AST, npm/Composer i zewnętrznymi language serverami;
- zmiana formatu plików CRA, kursu lub walidatorów zadań;
- usuwanie obecnego fallbacku textarea;
