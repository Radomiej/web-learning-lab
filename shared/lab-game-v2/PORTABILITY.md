# Przenośność gier Lab Game 2D v2

## Jedno API ucznia

Java Lab i Web Lab uczą wspólnego modelu `Game → GameObject → Transform → Component` i kontraktu `engineApiVersion: 2.0.0`. Ten sam ruch, wejście, kolizja czy polecenie rysowania mają mieć to samo znaczenie w obu językach. Java i JavaScript zachowują własną składnię, a porównanie zgodności opiera się na wspólnych scenariuszach, nie na podobnych nazwach metod.

## Co dziś uruchamiają hosty

| Host | Wykonywanie gry | Stan |
| --- | --- | --- |
| Web Lab | JavaScriptowy runtime v2 w przeglądarce | Działa w podglądzie Web Lab. |
| Java Lab | Kod Java kompilowany przez TeaVM do WebAssembly; worker JavaScript przekazuje wejście, czas i klatki do Canvas 2D. | Działa w podglądzie Java Lab. |
| Orbit/Kalio — eksport Web Lab | Web Lab dołącza swój runtime JavaScript do paczki `.orbit`; QuickJS/LRP przekazuje mu D-pad, rysowanie i żądania dźwięku. | Częściowy adapter `kalio-portable/1`; nie oznacza pełnej zgodności wszystkich funkcji v2. |
| Orbit/Kalio — eksport Java Lab | Brak. Bieżący QuickJS/LRP nie wykonuje modułu TeaVM/Wasm. | Nieobsługiwane; wymaga osobnego hosta TeaVM/Wasm. |

Pełna różnica między kontraktem API a profilem Orbit jest opisana w dokumentacji adaptera `kalio-portable/1` w repo Web Lab. Profil adaptera może ograniczać host, ale nie zmienia ani nie usuwa wspólnego API ucznia.

## Co oznacza wsparcie Java na Orbit

Samo dołączenie pliku `.wasm` nie wystarczy. Próbny moduł kursu Java Lab „survivor”, wygenerowany przez aktualny TeaVM i sprawdzony z vendored `compiler.wasm-runtime.js`, miał 176 031 bajtów, 30 importów i 18 eksportów. Importy obejmowały przestrzenie TeaVM `teavmJso`, `teavmMath`, `teavm` oraz `wasm:js-string`. Jest to moduł zależny od ABI TeaVM/JS; generyczny silnik WebAssembly bez tych funkcji i pamięci nie uruchomi go poprawnie. Eksporty obejmowały między innymi `main`, `tick`, `frame`, `setKey`, `resize` i `dispose`.

Java→Orbit wymaga więc osobnego, jawnie wersjonowanego celu, na przykład `runtime: "teavm-wasm"` i adaptera `lab-game-wasm/1`, obok istniejącego `quickjs-lrp` dla eksportu Web Lab. Nie wolno zmieniać rozszerzenia ani przepakować modułu TeaVM jako paczki QuickJS. Przed uznaniem celu za działający trzeba:

1. Wygenerować reprezentatywną próbkę Java i zachować jej hash, importy, eksporty oraz wersję TeaVM.
2. Wybrać Rustowy runtime WebAssembly dopiero po sprawdzeniu, czy obsłuży wymagane importy i `wasm:js-string`, oraz czy mieści się w pamięci i czasie klatki urządzenia.
3. Zdefiniować wersjonowany most wejścia, `dt`, cyklu życia, renderowania, audio i błędów. Utrzymać te same reguły API v2, a funkcje spoza profilu odrzucać z czytelnym komunikatem przed instalacją.
4. Uruchomić te same nazwane scenariusze na Java/JDK, TeaVM w Java Lab, Web Lab i Orbit desktop; porównać stan, zdarzenia oraz polecenia renderowania/audio.
5. Dopiero po desktopowym przejściu sprawdzić paczkę na dokładnym KNULLI/Orbit urządzeniu: D-pad, 640×480, pamięć, FPS, dźwięk, stop/restart i powrót do launchera.

Na dziś wspólne API Java/Web oraz pojedynczy test semantyczny C38 w JDK, TeaVM i Web JS są potwierdzone. Nie stanowi to dowodu pełnej zgodności wszystkich scenariuszy ani uruchomienia Java na Orbit.
