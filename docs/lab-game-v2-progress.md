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

## Wspólny kontrakt i adapter Orbit — 2026-11-18

- Sol 6.2 zalecił utrzymać pełny Game Lab 2D v2 jako wspólny model ucznia, a Orbit/Kalio opisać osobnym profilem możliwości. „To samo API” oznacza tu te same pojęcia i obserwowalne reguły; składnia Java/JavaScript oraz transport mogą się różnić. Rdzeń v2 jest najbardziej Unity-podobny dla ucznia dzięki `Game → GameObject → Transform → Component`, cyklowi życia, rendererom, kamerze, kolizjom i kontrolerom. Natywne ECS/Rapier Orbit pozostaje osobną warstwą implementacji.
- Web Lab: C01–C43 conformance suite 47/47; `gameRuntime` + `labGameV2` 32/32; `kalio-portable/1` 3/3. Wyniki dotyczą bieżącego kodu Web Lab. `npm run test:assignments` nadal ma dwie niezwiązane niezgodności liczników kursu/quizu (70 vs 63 i 3 vs 4).
- Synchronizacja Java/Web: `node scripts/sync-lab-game-v2.mjs --check` zweryfikował 115 plików. Niezależny C38 w Java/JDK, rzeczywistym TeaVM/Wasm i Web JS zwrócił (160,80), 40×20, jedno `create` i pięć `update`.
- Profil `kalio-portable/1` deklaruje tylko granicę adaptera Web JS → QuickJS/LRP. Orbit 0.3.38 raportował `weblab-atlas`; nie uruchamia artefaktu Java TeaVM/Wasm. Nie ma jeszcze dowodu produkcyjnej sesji relay przez różne sieci; browser flow w Nekko używało mocka.
- To nie jest pełna kwalifikacja Java↔Web dla wszystkich C01–C43 ani pełna zgodność renderowania/audio na konsoli. Java→Orbit, mysz/pointer na profilu konsoli i parity z natywnym ECS/Rapier pozostają nieobsługiwane lub niezweryfikowane.

## Orbit desktopowy i plan Java/Wasm — 2026-11-18

- Paczka testowa wygenerowana przez `buildPlaygroundOrbit` została uruchomiona bieżącym `orbit-run` z worktree Orbit 0.3.38. Natywny SDL, rozmiar logiczny 640×480, `--seed 2026`, `--dt 16` ms. Plik wejścia `1:59 right` utrzymywał D-pad w prawo przez 59 klatek. Środek gracza 28×28 zmienił się z `(79.5,239.5)` na `(192.5,239.5)`, co zgadza się z `120 px/s × 0.944 s` w granicach rasteryzacji. Nie podłączono gamepada fizycznego.
- Oryginały, porównanie i kopia z oznaczeniami: `out/online-orbit-evidence/web-lab-before.png`, `web-lab-after.png`, `web-lab-before-after.png`, `web-lab-annotated.png`. Ślad wejścia: `right.inputs`; eksport: `web-lab-movement.orbit`; hashe i komenda zapisane w `desktop-replay.md`.
- W fixture jest żądanie tonu A4. `orbit-run` zrzuca kolejkę audio bez otwierania urządzenia, więc desktopowy test obrazu nie weryfikuje słyszalności. Osobny test adaptera sprawdza mapowanie tonu i sekwencji.
- Konsola pozostaje po stronie użytkownika do uruchomienia przez ADB. Bieżące logowanie do Nekko nie było aktywne i konsola raportowała stronę Home, więc nie przeprowadzono live relay ani instalacji paczki.
- Follow-on Java: proponowany host `teavm-wasm` i ABI `lab-game-wasm/1`, odrębne od Web `quickjs-lrp`/LRP. Próbka TeaVM „survivor” (176 031 B) miała 30 importów i 18 eksportów, w tym TeaVM JSO/math i `wasm:js-string`; wynik instancjowano przez JavaScriptowy runtime TeaVM, nie Orbit. Raport modułu: `out/online-orbit-evidence/java-teavm-module-probe.json`. Zwykłe wsparcie dla WebAssembly nie wystarczy bez tych importów i mapowania wejścia, grafiki, audio oraz cyklu życia.
