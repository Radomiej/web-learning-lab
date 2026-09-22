# Sandbox wieloplikowy — projekt do zatwierdzenia

## Cel i zakres

Uczeń uczy się rzeczywistych plików HTML, CSS, JavaScript i komponentów React, widząc wynik w obecnym iframe. Zachowujemy lokalne uruchamianie aplikacji na porcie 5181, istniejące zadania, postęp, izolację iframe i zasadę: rozwiązania dostępne wyłącznie w zadaniach prowadzonych.

Użytkownik zatwierdził osobne komponenty React, jeden domyślny CSS i dyskretną pomoc edytora. Następnie rozszerzył przycisk „Dodaj komponent” na „Dodaj plik” z wyborem HTML/CSS/JS/React. Ten dokument uwzględnia tę zmianę; nie opisuje jeszcze wdrożonego kodu.

## Pliki i interfejs

- Standardowy zestaw: `index.html`, `styles.css`, `script.js`. Zadania React: `index.html`, `styles.css`, `main.jsx`, `App.jsx` i przygotowane komponenty lub hooki stosownie do lekcji.
- `index.html` pozostaje pełnym dokumentem z doctype, językiem, head, metadanymi i body. React korzysta z elementu root i modułowego punktu wejścia main.jsx.
- „Dodaj plik” otwiera mały formularz: typ HTML, CSS, JavaScript lub React (.jsx), nazwa i zatwierdzenie/anulowanie. Domyślne rozszerzenie odpowiada typowi; kolizje nazw, ścieżki bezwzględne, wyjście `..` poza projekt i niedopasowane rozszerzenie są odrzucane czytelnym komunikatem. Dopuszczamy katalogi, np. `components/Card.jsx`.
- Po utworzeniu plik jest aktywny i zapisany w bieżącym zadaniu. Nowy JSX ma prosty eksportowany komponent z poprawną nazwą; pozostałe typy dostają minimalny szablon. Nie dopisujemy automatycznie komponentu do App ani importów do kodu ucznia.
- Przy tworzeniu komunikat wyjaśnia podłączenie: CSS przez link w HTML lub import w module, JS przez script lub import, JSX przez import i użycie komponentu. Dodatkowy HTML jest osobnym dokumentem, nie fragmentem automatycznie doklejanym do index.html.
- Wybór „Strona podglądu” jest widoczny tylko przy więcej niż jednym pliku HTML. Domyślny index.html pozostaje stroną sprawdzaną przez zadania; sprawdzanie przełącza podgląd na niego z czytelną informacją. Dodatkowe dokumenty można oglądać niezależnie, bez implementowania routera całej witryny.
- Jeden CSS oznacza jeden plik startowy, a nie zakaz dodawania kolejnych. Zakładki obsługują zmienną liczbę plików i długie nazwy bez rozszerzania całej strony.
- Zmiana nazw i usuwanie plików nie należą do tego zakresu. Reset zadania odtwarza jego starter, również usuwając dodane w tym zadaniu pliki; interfejs uprzedza o tym przed potwierdzeniem resetu.

## Model i wykonanie

- Wspólny model projektu: mapa względnych nazw plików na tekst oraz nazwa dokumentu wejściowego. Startery, rozwiązania, zapis pracy, edytor i walidator korzystają z tego samego modelu.
- Osobny moduł normalizacji/migracji odpowiada za stare dane, resolver za lokalne ścieżki i zależności, kompilator React za JSX i moduły, a generator dokumentu za osadzenie wyniku i istniejącego mostka walidacji.
- Resolver podłącza rzeczywiste lokalne linki stylesheet i skrypty w wybranym HTML; nie wstrzykuje wszystkich plików bez względu na ich użycie. CSS zachowuje kolejność kaskady. Lokalne CSS `@import` są rozwijane z wykrywaniem cykli.
- Lokalne skrypty klasyczne zachowują kolejność i wspólny kontekst strony. Moduły JS/JSX obsługują import/export, zależności względne, rozszerzenia jawne lub pominięte (.js/.jsx) i import CSS. JSX kompiluje istniejący lokalny Babel, a moduły wykonuje izolowany rejestr zależności z cache. Cykle JS są zgłaszane jako nieobsługiwane, zamiast powodować zawieszenie.
- Importy `react` i `react-dom/client` wskazują lokalnie dostarczone biblioteki. Inne paczki i zdalne importy modułów nie są obsługiwane i powodują zrozumiały błąd. Nie dodajemy instalatora npm, backendu ani zewnętrznej usługi sandboxa.
- Błędy wskazują plik i przyczynę (np. brak importowanego pliku); błędy składni również lokalizację, jeżeli udostępnia ją kompilator. Nie mogą pozostawiać poprzedniego udanego wyniku jako bieżącego zaliczenia.
- Run, Check i reset odtwarzają iframe ze świeżego zestawu plików. Edycja unieważnia poprzednie wyniki sprawdzania. Zachowujemy `sandbox="allow-scripts"` bez allow-same-origin i istniejący mostek odczytujący DOM, computed styles, błędy i interakcje.

## Materiał i migracja

- Wszystkie nowe startery i rozwiązania mają jeden styles.css, scalony w kolejności dotychczasowego base.css, następnie theme.css. Aktualizujemy odwołania w HTML, instrukcjach, sprawdzaniu źródeł i testach.
- Wszystkie zadania React uczą import/export i rozdzielenia main.jsx (montowanie), App.jsx (kompozycja) oraz komponentów/hooków tam, gdzie wymaga tego temat. Instrukcje wskazują konkretny plik i działanie; nie wymagają pisania całej aplikacji w script.js.
- Nowy zapis używa osobnego klucza wersji v3. Stare v2 pozostaje nietknięte jako kopia; migracja jest jednokrotna i nie zastępuje istniejącej pracy v3. Zachowujemy również szkice wycofanych zadań.
- CSS ze starych szkiców łączymy bez zmiany kolejności. Własnego HTML nie zastępujemy szablonem: aktualizujemy jedynie rozpoznane odwołania do dawnych plików.
- Stary React nie jest automatycznie rozcinany na komponenty. Zachowujemy kod w legacy.jsx, uruchamianym przez main.jsx; kompatybilność zapewniają lokalne React/ReactDOM. Reset świadomie przełącza pracę na nowy starter wieloplikowy. Postęp pozostaje zachowany; migracja nie przyznaje nowych zaliczeń.
- Nieprawidłowy JSON lub nieudany zapis nie powoduje nadpisania kopii. Użytkownik otrzymuje informację o problemie, a pliki startowe pozostają dostępne.

## Pomoc edytora

Dyskretny przycisk „?” obok „Formatuj kod”, z dostępną nazwą „Skróty edytora”. Opis skrótów jest domyślnie schowany; dostępny po najechaniu, fokusie oraz kliknięciu/dotyku. Escape zamyka pomoc, fokus nie jest więziony, a popup nie wychodzi poza ekran. Zniknie obecny stale widoczny akapit skrótów. Formatowanie dobiera parser po rozszerzeniu, również dla dodanych plików.

## Kryteria odbioru

1. Każde rozwiązanie przechodzi swoje testy, startery nie zaliczają zadań; wcześniejsze rozwiązania nie wystarczają do kolejnych wariantów.
2. Nowy komponent importowany do App renderuje się i reaguje na zdarzenia; edycja zależnego JSX/CSS aktualizuje wynik po Run/Check.
3. Dodane CSS/JS działają dopiero po podłączeniu; dodatkowy HTML ma własny podgląd. Brakujące pliki, błędy składni i cykle dają komunikaty bez fałszywego zaliczenia.
4. Zapis, ponowne otwarcie, przełączanie zadań i reset izolują projekty; migracja chroni stare prace oraz kolejność CSS.
5. Pomoc działa klawiaturą i dotykiem; formatowanie, Tab, usuwanie linii i cofanie działają we wszystkich wspieranych plikach.
6. Pełny zestaw testów oraz build przechodzą. Ręczna weryfikacja w przeglądarce obejmuje React z kilkoma modułami, CSS, dodatkowy dokument i wąski ekran. JSDOM nie zastępuje sprawdzenia geometrii layoutu w przeglądarce.

## Poza zakresem

Nowy kurs, wideo Remotion, routing SPA, instalowanie paczek ucznia, upload zasobów, pełne IDE i zabezpieczenie egzaminacyjne. Rozwiązania pozostają w aplikacji klienckiej; ukrycie przycisku nie jest zabezpieczeniem przed analizą jej źródeł. Nie wykonujemy ogólnego redesignu ani nie deklarujemy automatycznego audytu Impeccable bez jego dostępnego narzędzia.
