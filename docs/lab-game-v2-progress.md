# Lab Game v2 — wynik integracji, 2026-10-07

Zaimplementowano wspólny kontrakt Java/JavaScript, kolizje z indeksem przestrzennym, InputManager z myszką, indeksy komponentów i tagów, typowane kontakty, wspólny renderer, Assets, UI i równoległy kurs. Zgodnie z decyzją użytkownika nie utrzymujemy API v1.

## API i materiały

- Kontrakt: shared/lab-game-v2/API.md, INPUT.md, contract.json i render-protocol.json w obu projektach.
- 24 rozdziały i 72 pary zadań prowadzą do gry survival z falami, pociskami, XP, ulepszeniami, sklepem i restartem.
- 100 sprite'ów ImageGen w czterech atlasach, części pasków postępu i przyciski 9-patch. Python sprawdził przezroczystość, granice i wyśrodkowanie 110 klatek PNG.
- Assets.PLAYER01, Assets.FIREBALL, ProgressBar.setProgress(50), game.getObjectsWith(...) i collider.onContactEnter(...) mają odpowiedniki w obu językach.
- Mysz: współrzędne CSS, stan przycisków, pojedyncza klatka pressed/released, consumeMouse, przechwycenie kursora i reset po blur. Transport TeaVM odrzuca zdarzenia poprzedniej sceny.
- Kolizje: spatial hash, maski warstw, deduplikacja par, swept collision pocisków i ślizganie po przeszkodach. Testy 100/1000/5000 rozproszonych colliderów ograniczają liczbę testów dokładnych. Jeśli wszystkie obiekty rzeczywiście nachodzą na siebie, liczba par może nadal być kwadratowa.
- Java: preferuj setPosition/setActive/setEnabled. Po bezpośrednim zapisie publicznych pól pomiędzy zapytaniami fizyki w tej samej aktualizacji użyj physics.refresh(); szczegóły w API.md.

## Weryfikacja

- Pełny zestaw Web: 765/765 (lab-game-v2-full-test-report.json).
- Po końcowych poprawkach runtime: 76/76 (lab-game-v2-final-runtime-report.json); podpowiedzi edytora: 5/5.
- Pełny zestaw Java: 121/123; dwa nieaktualne testy UI poprawiono i sprawdzono ponownie: 8/8 (java-lab/docs/lab-game-v2-final-ui-report.json). Pełny raport zachowuje historyczny wynik sprzed tych dwóch napraw.
- Wszystkie 72 rozwiązania Java przeszły rzeczywistą kompilację JDK i sprawdzanie zachowania. Web sprawdza uruchomienie, rozwiązania i odrzucanie starterów.
- Wspólne scenariusze C01–C43 sprawdzają semantykę API. C38 porównuje niezależnie JS, JDK i rzeczywisty WebAssembly TeaVM.
- java-lab/tools/check-teavm-v2.mjs: rzeczywista kompilacja i uruchomienie TeaVM WebAssembly w hoście Node; C38, sprite/progress/button z myszką oraz pełna scena survival zaliczone. Wyniki: java-lab/artifacts/lab-game-*.json.
- Synchronizacja: node scripts/sync-lab-game-v2.mjs --check — 33 pliki i publikowany transport wejścia identyczne.
- Produkcyjny build Java zaliczony, także publikacja lokalnego input-transport.js. Końcowy build Web odnotowany po zakończeniu poniżej.
- git diff --check nie zgłasza błędów.

## Granica sprawdzenia wizualnego

Końcowy playtest przeglądarkowy pozostał niesprawdzony: kontroler przeglądarki przestał odpowiadać na odczyt, screenshot i nawigację. Testy Node/TeaVM nie zastępują kontroli wizualnej. Strona do ponowienia: java-lab/tools/lab-game-v2-playtest.html (C38 oraz sprite, pasek i przycisk). Wcześniejsze uruchomienie sceny Java w przeglądarce działało.

Zmiany pozostają w drzewach roboczych obu repozytoriów. Zachowano niezwiązane zmiany użytkownika.

Końcowy build Web: zaliczony (1m45s) z NODE_OPTIONS=--max-old-space-size=4096; domyślny limit 2 GB okazał się zbyt niski. Oba produkcyjne buildy są gotowe.

## Ponowiony test przeglądarkowy

Zaliczone: Java/TeaVM C38 (pozycja 160,80 i pięć aktualizacji), widoczne sprite PLAYER01/FIREBALL, progress bar i button 9-patch; kliknięcie myszy zwiększa HP 50→60 i wywołuje callback raz. Web: pierwsza lekcja Game Dev JS uruchomiona przez UI, podgląd renderuje prostokąt, ocena 2/2. Poprzednia blokada kontrolera przeglądarki ustąpiła; ten test obejmuje smoke test, nie pełne przejście gry survival.

Serwery pozostawiono: Web 127.0.0.1:5173 (backend 5183), Java 127.0.0.1:5182 (backend 5184). NODE_OPTIONS=--max-old-space-size=1024 ogranicza stertę każdego procesu Node, nie cały RAM procesu. Pomiar czterech procesów serwerów: początkowo ok.180 MB, po załadowaniu edytora ok.478 MB working set. Dowody: docs/lab-game-v2-browser-smoke.png oraz java-lab/artifacts/lab-game-v2-browser-ui.png. Pomiar dotyczy bieżącego testu, nie ciągłego monitoringu po zakończeniu rozmowy.
