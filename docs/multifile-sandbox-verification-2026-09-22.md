# Wieloplikowy sandbox — weryfikacja 2026-09-22

## Zakres

- Projekty HTML/CSS/JS/JSX z przyciskiem „Dodaj plik”, lokalnymi ścieżkami, importami i eksportami.
- Jeden domyślny `styles.css`; dodatkowy CSS działa po podłączeniu, nie automatycznie.
- React: `main.jsx`, `App.jsx`, dedykowane komponenty i hooki; 39 lekcji i 86 zadań zachowuje identyfikatory.
- Pełne dokumenty startowe HTML, wybór dodatkowej strony, „Sprawdź” zawsze używa dokumentu wejściowego.
- Migracja v2 → v3 zachowuje nietkniętą kopię v2. Uszkodzone dane nie są nadpisywane; edycja zostaje w pamięci z ostrzeżeniem.
- Pomoc edytora w tooltipie, formatowanie według rozszerzenia, reset z potwierdzeniem.
- PHP pozostaje opcjonalnym backlogiem: `optional-php-course.md`, bez nowego silnika ani zależności.

## Sprawdzone w przeglądarce na localhost:5181

- Nowy komponent importowany do App: licznik reaguje na kliknięcie (0 → 1).
- Zmiana CSS po „Uruchom”: odczytany styl przycisku `rgb(255, 220, 120)`, padding 24px.
- Dodanie osobnego HTML, jego podgląd i powrót „Sprawdź” do index.html.
- Brakujący import wskazuje nazwę pliku, daje błąd i nie zalicza zadania (0/3).
- Nowe pliki są widoczne po przeładowaniu strony.
- Widok desktop w panelu przeglądarki (1266×712) oraz mobile 390×844; tooltip po poprawce mieści się w ekranie (prawa krawędź 344px), dokument nie ma poziomego overflow dla sprawdzonego scenariusza.
- Ostatnie logi błędów dotyczyły wcześniejszego hot-reload podczas przebudowy hooków oraz celowo brakującego importu; po odtworzeniu kodu i przeładowaniu aplikacja pokazuje gotowy podgląd.

Testy UI dodatkowo obejmują reset, duplikaty plików, powrót fokusu oraz brak rozwiązania w zadaniach samodzielnych. Nie są one dowodem układu pikselowego ani pełnym audytem dostępności.

## Przegląd i regresje

Niezależny reviewer (Sol) wykonał odczyt kodu bez testów/buildów. Wszystkie cztery istotne uwagi otrzymały poprawki i testy regresyjne:

1. Późny błąd runtime usuwa zielony wynik i cofa zaliczenie nadane przez ten sam run, zachowując wcześniejsze zaliczenia.
2. Wspólna zależność dwóch skryptów modułowych wykonuje się raz na dokument.
3. `@import url(plik.css)` bez cudzysłowów podlega lokalnemu rozwiązywaniu ścieżek.
4. Klasy, id, style i data-atrybuty body są zachowane.

Poprawiono też drobną uwagę: Escape po otwarciu tooltipa myszą nie otwiera go ponownie przy oddaniu fokusu.

## Decyzje i ograniczenia

- Zgodnie z prośbą użytkownika najwyżej dwóch agentów; po wprowadzeniu ograniczenia testy/buildy uruchamia tylko główny agent, kolejno. Vitest ma jeden worker i wyłączoną równoległość plików.
- Praca w istniejącym master zgodnie z zatwierdzonym planem; bez dodatkowego worktree. SQL na 5180 bez zmian.
- Stare fragmenty HTML podczas migracji dostają brakujące połączenia CSS/script, żeby zachować dawny efekt automatycznego dołączania zasobów. Nie zastępujemy treści ucznia szablonem.
- Zachowano starszą ścieżkę generowania podglądu dla testów zgodności; aktywny kurs korzysta z nowych projektów.
- Importy cykliczne, dynamiczny import i dowolne pakiety npm nie są obsługiwane; błędy są jawne. To edukacyjny lokalny bundler, nie pełny Vite w iframe.
- Bez zmiany nazw/usuwania pojedynczych plików i bez obsługi dowolnych assetów/routingu stron.
- iframe pozostaje `sandbox="allow-scripts"`, bez `allow-same-origin`; nie jest to izolowany backend do uruchamiania niezaufanego PHP/MySQL.
- Build zgłasza duży bundle (lokalne Babel/React); nie ukrywano ostrzeżenia ani nie podnoszono progu.
- Impeccable wpłynął na dyskretną pomoc i korektę mobilnego popupu, bez przebudowy całej identyfikacji wizualnej kursu.

## Wynik końcowy

- `npm test`: 331/331 testów, 24/24 plików; jeden worker, 81,93 s.
- `npm run build`: sukces, 80 modułów, 7,26 s. Główny JS 4509,56 kB (gzip 1037,48 kB); ostrzeżenie o rozmiarze opisane wyżej.
- `git diff --check`: bez błędów białych znaków (Git przypomina o konwersji LF/CRLF na Windows).
- Ostatni reload localhost:5181 po zmianach zachował działającą aplikację. SQL nie był modyfikowany.
