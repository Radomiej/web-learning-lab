# Kursy Web — wykaz usprawnień, 20 października 2026

| Obszar | Zmiana |
| --- | --- |
| Nawigacja | Wspólny moduł Nauka → Quiz → Zadanie dla JS, HTML, CSS, PHP i React. Przejście do kolejnego zadania lub lekcji. |
| Podgląd | Sandbox nie jest montowany przy otwarciu lekcji. Otwiera się przyciskiem lub pierwszym Play, także na telefonie. |
| Profil | ID, opcjonalna nazwa i mała ikona edycji pod tytułem. Zielona/czerwona kropka stanu z opisem dostępnym dla czytnika i po najechaniu. |
| Quiz | Trzy pytania na lekcję, niezmienna kopia oddania. Po potwierdzeniu serwera: ✓ Wysłano. Odzyskiwanie kopii i ponawianie widoczne przy problemie. |
| Generator | Link pod wyborem lekcji. Domyślne zagadnienie i poziom z bieżącego zadania, suwak poziomu, szczegóły zwinięte, domyślnie trzy ćwiczenia. Powrót zachowuje adres zadania. |
| Różnorodność | Dla 14 lekcji JS: trzy odmienne operacje na każdym poziomie, 126 kombinacji. Osobne dane i scenariusze fetch. Dla pozostałych 31 lekcji: budowanie, nowy przykład lub uzupełnianie pliku, ze stopniowanym wsparciem. |
| Powtarzalność | Generator v2, indywidualny seed z ID, kontekstem zadania i losowym składnikiem. Własny seed w szczegółach odtwarza zestaw. Oryginalne deskryptory v1 nadal są obsługiwane. |
| JavaScript | Zmienne, obiekty, funkcje przed DOM; referencje funkcji, bind, porównania, formularze, Error przed catch, JSON i fetch. |
| HTML/CSS | Kod i widoczna zmiana, name a id, required, action/POST, box model, gap/padding. Hierarchia nagłówków: tabliczki i schodki; Mięta i Bazylia na równym poziomie H3. |
| PHP | Podstawy, cykl żądania, typy, $_POST, walidacja liczby z poprawnym zerem, kodowanie wyjścia i formularz INF.03. |
| React | Czym jest biblioteka, komponent i JSX, props, stan jako migawka, kolejka aktualizacji, tablice, formularze, useEffect, dependencies, cleanup, StrictMode i nieaktualne odpowiedzi fetch. map tworzy nową tablicę wyników; DOM tworzy dopiero React. |
| Ilustracje | 31 nowych grafik: ciepły styl HTML/CSS i spokojniejszy React/PHP, po jednej głównej idei. Dokładne schematy kodu są uzupełnieniem. Łącznie 99 powiązanych ilustracji. |

## Zakres materiału

| Kurs | Lekcje | Kroki |
| --- | ---: | ---: |
| JavaScript | 14 | 66 |
| HTML | 9 | 39 |
| CSS | 6 | 24 |
| PHP | 8 | 34 |
| React | 8 | 45 |
| Razem | 45 | 208 |

## Weryfikacja

Przeszło 81 testów Vitest kursów/UI/runtime oraz 26 testów Node silnika i oddawania prac; obejmują test powrotu do właściwego zadania po wyjściu z generatora. Sprawdzono wykonanie wszystkich 126 kombinacji JS i 27 scenariuszy fetch. Wszystkie 208 kroków przeszły przegląd nawigacji w przeglądarce; grafiki przejrzano osobno. Kontrola obejmuje desktop, laptop, telefon, klawiaturę, zachowanie szkicu oraz brak iframe przed uruchomieniem. Końcowe wyniki testów i status publikacji podane są w odpowiedzi do zadania.

Pełny build produkcyjny przeszedł z NODE_OPTIONS=--max-old-space-size=4096. Pozostają ostrzeżenia istniejących zależności PHP.wasm o eval i dużych chunkach; nie są błędami budowania.

## Screeny i źródła

- html-learning-final.png, php-learning-final.png, react-learning-final.png — materiał w module.
- generator-final.png — uproszczony generator.
- course-mobile-final.png — widok telefonu.
- course-browser-qa.json — odczyty kroków w przeglądarce.
- lesson-infographic-prompts.json — prompty i ścieżki końcowych obrazów, narzędzie built-in image_gen.
- php-teaching-sources.md — W3Schools i podręcznik PHP.
- reactTeachingSources w src/data/reactTeachingPages.js — oficjalne react.dev.

## Granice działania

Natywna nawigacja formularza PHP w iframe nie udaje pełnego serwera. Play/test phpRequest korzysta z istniejącego runtime PHP.wasm; wyjaśnienia jasno odróżniają go od hostingu. Fetch ćwiczy na kontrolowanych data: URL, a lekcja wyjaśnia też HTTP i prawdziwą sieć. Wysłano oznacza przyjęcie przez serwerową kolejkę; wynik pracy potwierdza nauczyciel. Panel lab-admin ma lokalnie zaktualizowany katalog, zgodność wersji 1/2 i rozpoznawanie quizów pozostałych kursów. Nie publikowano testowych prac do produkcyjnej kolejki.
