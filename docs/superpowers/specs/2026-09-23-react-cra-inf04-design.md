# Profil React CRA/INF.04 dla Web Learning Lab

## Status

Projekt specyfikacji po akceptacji kierunku architektonicznego. Implementacja
nie rozpoczyna się przed osobną akceptacją tego dokumentu.

## Cel

React ma być nauczany w układzie możliwie bliskim projektowi
`C:\projekty\react01` i typowemu zadaniu egzaminacyjnemu INF.04. Uczeń ma
ćwiczyć realny kontrakt plików Create React App, import Bootstrapa i podstawowe
wzorce Reacta, a jednocześnie korzystać z lokalnego, bezpiecznego sandboxa z
automatycznym sprawdzaniem.

## Stan obecny i problem

Obecny profil React używa uproszczonego układu Vite-like:

```text
index.html
main.jsx
App.jsx
styles.css
```

`C:\projekty\react01` używa natomiast:

```text
public/index.html
src/index.js
src/App.js
src/index.css
src/App.css
```

W `src/index.js` Bootstrap jest importowany jako
`bootstrap/dist/css/bootstrap.min.css`. Sama zmiana nazw plików nie wystarczy,
bo sandbox musi również wiedzieć, który moduł uruchomić, jak rozwiązać importy
CSS oraz jak dostarczyć Bootstrap bez sieci.

## Decyzja architektoniczna

Kurs React dostanie dwa profile projektu:

1. `react-cra-inf04` — profil bazowy i domyślny dla lekcji egzaminacyjnych.
2. `react-vite` — profil opcjonalny, zachowujący obecny układ z `main.jsx` dla
   porównania i późniejszej nauki nowoczesnego workflow.

Profil będzie częścią manifestu projektu, a nie osobnym trybem kompilacji
wybieranym przypadkowo przez nazwę pliku. Przykładowy manifest:

```js
{
  entry: 'public/index.html',
  runtime: {
    kind: 'react-cra',
    module: 'src/index.js',
    bootstrap: true,
  },
  files: { /* pliki projektu ucznia */ },
}
```

Stare zapisane projekty bez pola `runtime` pozostają obsługiwane przez
dotychczasową inferencję. Nie będzie automatycznego hard resetu ani cichego
przepisywania szkiców ucznia.

## Kontrakt profilu egzaminacyjnego

Starter React/CRA będzie pokazywał uczniowi strukturę:

```text
public/index.html
src/index.js
src/App.js
src/index.css
src/App.css
src/components/*.js
src/hooks/*.js
```

`src/index.js` będzie zawierał `createRoot`, import `App` oraz import arkuszy
stylów. `src/App.js` będzie głównym komponentem. Komponenty i hooki będą
domyślnie miały rozszerzenie `.js`, ponieważ ten wariant odpowiada
`react01` i pozwala uczniowi ćwiczyć JSX bez uzależniania podstaw od
rozszerzenia `.jsx`. Kompilator nadal będzie obsługiwał zarówno `.js`, jak i
`.jsx`.

`public/index.html` pozostanie dokumentem z `#root`. Sandbox doda podczas
budowania podglądu moduł `src/index.js` zgodnie z manifestem, więc uczeń nie
potrzebuje dopisywać ręcznie skryptu, którego w CRA normalnie nie ma w
źródłowym `public/index.html`.

## Bootstrap offline

W profilu `react-cra-inf04` import:

```js
import 'bootstrap/dist/css/bootstrap.min.css';
```

będzie mapowany przez sandbox na lokalny, wersjonowany zasób CSS. Nie będzie
CDN-u, pobierania z sieci ani instalowania npm wewnątrz iframe. Dzięki temu
uczeń pisze prawdziwy import używany w projekcie, a kurs działa out-of-box.

Wersja bazowa obejmuje klasy CSS Bootstrap używane w zadaniach, m.in.
`container`, `row`, `col-*`, `mt-*`, `p-*`, `text-*`, `btn` i warianty
przycisków. Obsługa bootstrapowego JavaScriptu i komponentów wymagających
poppera pozostaje poza pierwszym zakresem; można ją dodać jako osobny etap.

## Curriculum

Obecne osiem tematów React zostanie zachowanych, ale ich startery, rozwiązania
i instrukcje będą generowane dla profilu CRA/INF.04:

- JSX i `createRoot`: `src/index.js` + `src/App.js`;
- komponenty i props: `src/components/Card.js`;
- stan i zdarzenia: `src/App.js`;
- listy, `key` i warunki: `src/App.js`;
- formularze kontrolowane: `src/App.js`;
- `useEffect`, zależności i cleanup: `src/App.js`;
- lifting state up i custom hook: `src/hooks/useCounter.js`;
- projekt końcowy: `src/components/TaskItem.js` oraz `src/App.js`.

Każda lekcja ma używać ścieżek widocznych w zakładkach edytora i w treści
zadania. Wymagania będą sprawdzać zarówno działanie aplikacji, jak i ważne
elementy kontraktu, np. `createRoot`, poprawne importy, `className`, `key`,
`onClick`, `onChange` oraz klasy Bootstrap.

## Runtime i kompatybilność

Runtime musi:

1. zachować lokalny React i ReactDOM bez zewnętrznych skryptów;
2. kompilować importy `.js` i `.jsx` oraz względne importy komponentów i CSS;
3. rozpoznać manifestowy moduł startowy zamiast zakładać `main.jsx`;
4. wstrzyknąć moduł startowy do dokumentu CRA tylko w podglądzie;
5. obsłużyć lokalne zasoby publiczne w podstawowym zakresie, bez otwierania
   dostępu do sieci;
6. przekazywać błędy składni, importów i runtime do istniejącej konsoli oraz
   panelu sprawdzania.

Boilerplate `reportWebVitals`, dynamiczny import `web-vitals` i logo z
generatora CRA nie będą wymagane w wersji bazowej. Mogą zostać pokazane w
krótkiej lekcji „co można usunąć z boilerplate’u”, ale nie powinny blokować
uruchomienia pierwszego zadania.

## Migracja i dane ucznia

- Aktualne projekty Vite-like zachowują się bez zmian.
- Nowe projekty React otrzymują profil `react-cra-inf04`.
- Funkcje resetu zadania i twardego resetu nadal działają na wersjonowanym
  modelu storage.
- Nie przenosimy istniejących plików ucznia automatycznie między profilami.
- Dodanie pliku React w profilu egzaminacyjnym proponuje ścieżkę `src/` i
  rozszerzenie `.js`.

## Poza zakresem pierwszej wersji

- uruchamianie pełnego `react-scripts` w iframe;
- instalowanie zależności npm przez ucznia;
- Bootstrap JavaScript i interaktywne komponenty wymagające Poppera;
- migracja istniejących szkiców do nowego układu;
- przebudowa całego edytora kodu.

## Kryteria akceptacji

Wersja bazowa będzie gotowa, gdy:

1. nowy projekt React otwiera `public/index.html` i uruchamia `src/index.js`;
2. przykład z `react01` w wersji bez opcjonalnego boilerplate’u renderuje
   `App` w sandboxie;
3. import Bootstrapa działa offline, a klasy Bootstrap mają widoczny efekt;
4. wszystkie osiem lekcji ma starter, rozwiązanie i checki zgodne z nowymi
   ścieżkami;
5. stary profil `main.jsx` przechodzi dotychczasowe testy regresji;
6. błędny import, JSX lub runtime pokazuje nazwę pliku i sensowny komunikat;
7. testy jednostkowe obejmują manifest, kompilację CRA, Bootstrap i migrację
   bez utraty zapisanych danych;
8. build i ręczny smoke test w działającym sandboxie przechodzą.

## Kolejność prac po akceptacji specyfikacji

1. Rozszerzyć model projektu o manifest runtime i zachować kompatybilność
   wsteczną.
2. Dodać adapter CRA w `previewDocument`/`localResources` oraz lokalny zasób
   Bootstrapa.
3. Dodać startery, rozwiązania i checki profilu `react-cra-inf04`.
4. Ustawić profil egzaminacyjny jako domyślny dla nowych lekcji React, a
   `react-vite` zostawić jako opcję.
5. Dostosować dialog dodawania plików, opisy lekcji i ikony ścieżek.
6. Napisać testy regresji, uruchomić pełny test/build i przejść ręcznie lekcje
   React jako uczeń.
