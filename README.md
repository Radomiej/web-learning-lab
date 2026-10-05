# Web Learning Lab

Lokalny kurs HTML, CSS, layoutów, JavaScriptu, Reacta, PHP i Game Dev JS z edytorem kodu oraz podglądem uruchamianym w sandboxowanym iframe.

## Start jednym kliknięciem

Uruchom `start-course.cmd` z katalogu `C:\Nauka\web-learning-lab`. Launcher doinstaluje zależności przy pierwszym uruchomieniu i wystartuje Vite na `http://localhost:5181/`.

SQL Learning Lab działa niezależnie na `http://localhost:5180/`.

## Start ręczny

Wymagany jest Node.js 18 lub nowszy.

```text
npm install
npm run dev -- --port 5181
```

Testy i build:

```text
npm test
npm run build
```

Kurs obejmuje 57 lekcji: 9 HTML, 14 CSS/layout, 8 JavaScript, 8 React, 8 PHP i 10 Game Dev JS. Numeracja rezerwuje osobny zakres dla każdego typu: `1XX` HTML, `2XX` CSS, `3XX` layout, `4XX` JavaScript, `5XX` React, `6XX` PHP i `7XX` Game Dev. Lekcje layoutowe zawierają dokładnie 24 zadania Flexbox/Grid/RWD. Postęp i kod ucznia są przechowywane lokalnie w przeglądarce. Reset jest dostępny w ustawieniach kursu.

## Game Dev JS — Canvas i GameLab

Lekcje 701–710 zawierają 20 zadań: rysowanie, pętla i czas, obiekty/Transform, własne komponenty, klawiatura, kontroler i granice, sprite’y, kolizje/triggery, stan/HUD i projekt gry. Zadania samodzielne nie pokazują rozwiązania. Każdy projekt zawiera pełny `index.html`, pojedynczy `styles.css` i `game.js`; komponenty JS możesz dodawać w osobnych plikach i importować.

Silnik jest wstrzykiwany jako `GameLab` do iframe. Scena rozszerza `GameLab.Game` i definiuje `onCreate()`, `onUpdate(delta)` oraz opcjonalnie `onDestroy()`. Udostępnione są `GameObject`, `Component`, `Transform`, `Input`, `Canvas`, `ShapeRenderer`, `Sprite`, `Collider2D`, `Trigger2D`, `CharacterController2D`. Pozycja to środek obiektu; obrót jest w radianach. Tekstury player/slime/gem/wall są generowane lokalnie. Kolizje są prostokątne (AABB), bez fizyki obrotu/grawitacji. To małe edukacyjne API inspirowane komponentami Unity, a nie zgodność z Unity.

Kliknij planszę, aby przechwycić klawiaturę. Pełny ekran zachowuje tę samą scenę; Escape go zamyka. Auto-podgląd i Ctrl+S przeładowują projekt. Konsola znajduje się pod edytorem i pokazuje logi oraz błędy.

Walidator `gameScenario` tworzy świeżą scenę i wykonuje deterministyczne kroki z klawiszami, czasem i rozmiarem planszy. Odczytuje stan obiektów oraz polecenia renderowania, zamiast szukać fragmentu kodu. Testy wykonują każde rozwiązanie i starter w sandboxie JSDOM, z adapterem Canvas 2D. Rzeczywisty obraz wymaga dodatkowego sprawdzenia w przeglądarce.

W lekcjach HTML/CSS/JavaScript/React dostępne są pliki projektu takie jak `index.html`, arkusze stylów i skrypty. Ścieżka PHP używa `index.php` oraz `styles.css`; kod wykonuje lokalny runtime PHP 8.4 w WebAssembly, a jego wynik HTML trafia do tego samego sandboxowanego iframe. Ćwiczenie formularza uruchamia kontrolowane żądanie POST w pamięci. Sprawdzanie korzysta z deklaratywnych warunków DOM, CSS, interakcji, Reacta i odpowiedzi PHP. Runtime Reacta, kompilator JSX i PHP.wasm są dołączone lokalnie.
