# Web Learning Lab — specyfikacja projektu

## Cel

Zbudować lokalne laboratorium do nauki tworzenia stron internetowych, wzorowane na `C:\\Nauka\\databases`, w którym uczeń może czytać krótką teorię, edytować kilka plików projektu, uruchamiać wynik w iframe i otrzymywać natychmiastową informację zwrotną.

Pierwsza wersja ma działać bez backendu i bez konta. Po jednorazowym `npm install` uruchamia się jednym skryptem, otwiera lokalny adres w przeglądarce i zachowuje postęp lokalnie.

## Kontekst i źródło programu

Głównym źródłem zakresu HTML/CSS jest autorski kurs znajdujący się w:

`C:\\Nauka\\web\\podstawy-html-css\\lekcje-html-css-klasa-1.md`

Z kursu należy zachować kolejność progresji, nacisk na semantykę, dostępność, responsywność oraz dobre praktyki zamiast samego efektu wizualnego. Materiał nie jest kopiowany jako cały dokument; aplikacja pokazuje skróconą teorię, przykłady i zadania osadzone w edytorze.

Istniejący wzorzec interfejsu to `C:\\Nauka\\databases`:

- ciemny panel boczny z wyborem ścieżki, lekcji i postępem;
- jasna przestrzeń lekcji z teorią i zadaniem;
- edytor kodu oraz wynik obok siebie na większym ekranie;
- układ mobilny z wysuwanym menu;
- lokalny zapis postępu i stanów sesji.

## Użytkownik i główny przepływ

Użytkownik jest początkującym uczniem, który chce przypomnieć sobie każdy ważny element HTML, nauczyć się najczęściej używanych właściwości CSS, a następnie przejść do podstaw JavaScriptu.

Przepływ jednej lekcji:

1. Uczeń wybiera ścieżkę i lekcję w panelu bocznym.
2. Widzi cel lekcji, krótkie objaśnienie, listę dobrych praktyk oraz przykłady.
3. Wybiera zadanie prowadzone albo samodzielne.
4. Edytuje pliki `index.html`, `base.css`, `theme.css` i opcjonalnie `script.js`.
5. Kliknięcie `Uruchom` składa pliki w dokument iframe.
6. Podgląd pokazuje wynik, a panel komunikatów pokazuje błędy runtime i logi.
7. Kliknięcie `Sprawdź` uruchamia deklaratywne testy lekcji na strukturze DOM, atrybutach, stylach obliczonych i zachowaniu po interakcji.
8. Po zaliczeniu lekcji postęp zapisuje się w `localStorage`, a uczeń może przejść dalej.

## Zakres programu nauki

### Ścieżka HTML — 9 lekcji

1. **Internet, strona i trzy warstwy** — klient, serwer, URL, role HTML/CSS/JS, nazwy plików.
2. **Pierwszy dokument HTML5** — `doctype`, `html`, `head`, `body`, `lang`, `meta`, `title`, komentarze i wcięcia.
3. **Tekst i hierarchia** — `h1`–`h6`, `p`, `br`, `hr`, `strong`, `em`, `b`, `i`, `u`, `s`, `sup`, `sub`, encje.
4. **Listy i zagnieżdżanie** — `ul`, `ol`, `li`, listy zagnieżdżone, `dl`, `dt`, `dd`.
5. **Linki i nawigacja** — `a`, `href`, ścieżki względne i bezwzględne, fragmenty `#id`, `nav`, `aria-label`, `target`, `rel`.
6. **Obrazy i multimedia** — `img`, `src`, `alt`, `width`, `height`, `figure`, `figcaption`, `audio`, `video`, `source`, `controls`, `poster`.
7. **Tabele i dane** — `table`, `caption`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`, `scope`, `colspan`, `rowspan`.
8. **Formularze i walidacja** — `form`, `label`, `input`, typy pól, `textarea`, `select`, `option`, `button`, `fieldset`, `legend`, `name`, `action`, `method`, `required`, `minlength`, `maxlength`, `min`, `max`, `pattern`.
9. **Semantyka i dostępność** — `header`, `main`, `section`, `article`, `aside`, `footer`, `time`, `div`, `span`, hierarchia nagłówków, `alt`, fokus, klawiatura, kontrast i natywne kontrolki.

### Ścieżka CSS — 7 lekcji

10. **CSS i dołączanie arkuszy** — `link`, `style`, style liniowe, selektor, właściwość, wartość, komentarze.
11. **Selektory i kaskada** — selektory elementu, klasy, `id`, atrybuty, potomkowie, dzieci, pseudoklasy, specyficzność, dziedziczenie, unikanie `!important`.
12. **Jednostki, kolory i typografia** — `px`, `%`, `rem`, `em`, `vw`, `vh`, HEX, `rgb`, `hsl`, `font-family`, `font-size`, `font-weight`, `font-style`, `line-height`, `text-align`, `text-decoration`, custom properties.
13. **Model pudełkowy** — `content`, `padding`, `border`, `margin`, `width`, `height`, `box-sizing`, `border-box`, `gap`.
14. **Wyświetlanie, pozycjonowanie i powierzchnie** — `display`, `block`, `inline`, `inline-block`, `none`, `visibility`, `position`, `top`, `right`, `bottom`, `left`, `z-index`, tła, gradienty, `border-radius`, `overflow`.
15. **Flexbox, Grid i RWD** — `display: flex`, `flex-direction`, `flex-wrap`, `justify-content`, `align-items`, `gap`, `display: grid`, `grid-template-columns`, `grid-template-areas`, `fr`, `repeat`, `@media`, obrazy elastyczne.
16. **Przejścia, animacje i projekt końcowy** — `transition`, `:hover`, `:focus`, `@keyframes`, `animation`, `prefers-reduced-motion`, checklista jakości i przygotowanie projektu.

### Ścieżka JavaScript — 8 lekcji

17. **JavaScript w przeglądarce** — `script`, `console`, `const`, `let`, typy i bezpieczne logowanie.
18. **Warunki i funkcje** — `if`, `else`, operatory, funkcje, parametry, wartości zwracane.
19. **Tablice, obiekty i pętle** — dane, `for`, `for...of`, `map`, `filter`, dostęp do właściwości.
20. **DOM i renderowanie** — `querySelector`, `querySelectorAll`, `textContent`, `innerHTML`, `classList`, `setAttribute`, tworzenie elementów.
21. **Zdarzenia i formularze** — `addEventListener`, `click`, `input`, `submit`, `preventDefault`, odczyt wartości i komunikaty.
22. **Stan małej aplikacji** — jeden obiekt stanu, funkcja `render`, filtrowanie listy i pusty stan.
23. **Walidacja, błędy i localStorage** — walidacja klienta, komunikaty, `try/catch`, `JSON.stringify`, `JSON.parse`, zapis i odczyt.
24. **Projekt końcowy: planer wydarzenia** — semantyczny HTML, dwa arkusze CSS, formularz, tabela zadań, interakcje JS, responsywność i checklista jakości.

## Model interfejsu

### App shell

- `Sidebar`: logo, trzy ścieżki, licznik ukończonych lekcji, lista lekcji, przyciski Pomoc/Ustawienia.
- `MobileHeader`: przycisk otwierający sidebar, nazwa aplikacji, status runtime.
- `LessonWorkspace`: breadcrumb, nagłówek lekcji, cele, teoria, przykłady, zadanie i edytor.
- `PreviewInspector`: iframe podglądu, status uruchomienia, logi i błędy.
- `EditorTabs`: zakładki czterech plików; `script.js` jest oznaczony jako opcjonalny, ale dostępny we wszystkich lekcjach.
- `LessonProgress`: stan bieżącego zadania, liczba testów zaliczonych, przejście do następnej lekcji.

### Układ responsywny

Na desktopie aplikacja ma trzy strefy: sidebar, główny panel lekcji/edytora i inspector z podglądem. Na mniejszym ekranie sidebar jest wysuwany, a edytor i podgląd ustawiają się pionowo. Podgląd iframe zachowuje proporcje i ma własny pasek stanu.

### Język wizualny

Należy zachować język `SQL Learning Lab`: granatowe menu, turkus aktywnego stanu, jasne powierzchnie, cienkie obramowania, zaokrąglenia 8–12 px, typografia Inter/Segoe UI/systemowa, kod w monospace i delikatne statusy zielony/żółty/czerwony. Interfejs ma być spokojny i czytelny, bez dekoracyjnego dashboardowego szumu.

## Edytor i runtime podglądu

Edytor przechowuje pliki jako stan aplikacji:

```js
{
  html: "...",
  baseCss: "...",
  themeCss: "...",
  js: "..."
}
```

Runtime składa `srcDoc` w tej kolejności:

1. bezpieczny szkielet HTML5;
2. `<style data-file="base.css">`;
3. `<style data-file="theme.css">`;
4. zawartość uczniowskiego HTML w `body` albo pełny dokument, jeśli uczeń dostarczył `doctype`;
5. mostek diagnostyczny;
6. `script.js`.

Iframe używa `sandbox="allow-scripts"`. Kod ucznia nie ma dostępu do aplikacji hosta ani jej `localStorage`. Mostek komunikacji obsługuje wyłącznie jawne komunikaty `postMessage`:

- `ready` — dokument gotowy;
- `console` — `log`, `warn`, `error` z argumentami jako tekst;
- `runtime-error` — błąd `window.onerror` albo `unhandledrejection`;
- `signals` — kontrolowany snapshot DOM i wybranych computed styles;
- `run-action` — kliknięcie lub wpisanie wartości w element wskazany przez test lekcji.

Przycisk `Uruchom` czyści poprzedni iframe i tworzy nową sesję. `Wyczyść` przywraca starter bieżącego zadania. `Rozwiązanie` jest jawnie oznaczone i wymaga kliknięcia.

## Walidacja lekcji

Walidacja jest deklaratywna i przechowywana przy lekcji. Nie polega wyłącznie na porównaniu całego tekstu kodu.

Obsługiwane typy testów:

- `sourceIncludes` — sprawdza obecność konkretnego fragmentu w wybranym pliku;
- `elementExists` — sprawdza selektor w DOM;
- `attributeEquals` — sprawdza atrybut elementu;
- `textContains` — sprawdza tekst widoczny/tekstowy;
- `computedStyle` — sprawdza wybraną właściwość computed style;
- `interaction` — wykonuje kliknięcie/wpisanie i sprawdza zmianę tekstu, klasy, atrybutu lub widoczności;
- `noHorizontalOverflow` — sprawdza podstawową responsywność przykładu.

Każdy test ma `id`, `label`, `hint` i oczekiwany rezultat. Wynik pokazuje, który warunek nie przeszedł, bez ujawniania rozwiązania. Rozwiązania pozostają w danych lekcji i są dostępne dopiero po świadomym kliknięciu.

## Dane i trwałość

Treść kursu jest data-driven i nie jest zaszyta w komponentach. Planowane moduły:

- `src/data/lessons.js` — metadane, cele, teoria, startery, zadania i rozwiązania;
- `src/data/curriculum.js` — kolejność ścieżek i grupowanie 24 lekcji;
- `src/services/lessonValidator.js` — normalizacja sygnałów i ewaluacja testów;
- `src/services/previewDocument.js` — składanie `srcDoc` i mostek runtime;
- `src/hooks/useCourseProgress.js` — postęp, bieżące pliki i historia sesji;
- `src/components/` — shell, sidebar, lesson view, editor, preview, feedback.

Stan przechowywany lokalnie obejmuje ukończone lekcje, wybrany track, wybraną lekcję i ostatnią wersję plików dla zadania. Nie zapisujemy danych poza przeglądarką i nie używamy backendu.

## Uruchamianie out-of-the-box

Projekt używa React + Vite. W katalogu głównym mają znaleźć się:

- `package.json` z `dev`, `build`, `test` i `preview`;
- `start-course.cmd`, który sprawdza obecność `node_modules`, uruchamia `npm install` tylko gdy trzeba, a następnie `npm run dev -- --open`;
- `README.md` z instrukcją dla Windows oraz krótką instrukcją ręcznego uruchomienia;
- brak zależności od serwera Express, MySQL, PHP lub zewnętrznego API.

## Testy i kryteria akceptacji

Testy jednostkowe i komponentowe mają pokryć:

- kolejność i kompletność 24 lekcji;
- obecność wszystkich tematów HTML z materiału źródłowego;
- składanie dokumentu preview z dwoma arkuszami CSS i opcjonalnym JS;
- bezpieczne przekazywanie logów i błędów z iframe;
- każdy typ walidatora, w tym interakcję;
- zapis i odczyt postępu;
- przełączanie plików i reset startera;
- mobilny sidebar i podstawową dostępność kontrolek.

Przed przekazaniem należy wykonać:

```powershell
npm test
npm run build
```

Oraz w przeglądarce sprawdzić pełny przepływ: otwarcie aplikacji ze skryptu, wybór lekcji HTML, edycję HTML/CSS, uruchomienie podglądu, celowy błąd JS, `Sprawdź`, zaliczenie zadania, zapis postępu, przejście do CSS i lekcji JavaScript, a także widok mobilny.

## Poza zakresem pierwszej wersji

- logowanie i synchronizacja postępu w chmurze;
- współdzielenie projektów między uczniami;
- import/export plików z dysku;
- pełny lint HTML/CSS/JS;
- backend, baza danych i uruchamianie serwerowych frameworków w iframe;
- edytor z zaawansowanym autocompletion jak VS Code.

Te funkcje mogą być późniejszymi rozszerzeniami, ale nie powinny opóźniać lokalnego kursu i pętli: teoria → kod → podgląd → sprawdzenie → postęp.
