# Web Learning Lab

Lokalny kurs HTML, CSS, layoutów, JavaScriptu, Reacta i PHP z edytorem kodu oraz podglądem uruchamianym w sandboxowanym iframe.

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

Kurs obejmuje 47 lekcji: 9 HTML, 14 CSS/layout, 8 JavaScript, 8 React i 8 PHP. Lekcje layoutowe zawierają dokładnie 24 zadania Flexbox/Grid/RWD. Postęp i kod ucznia są przechowywane lokalnie w przeglądarce. Aby wyzerować postęp, wyczyść dane witryny dla `localhost:5181`.

W lekcjach HTML/CSS/JavaScript/React dostępne są pliki projektu takie jak `index.html`, arkusze stylów i skrypty. Ścieżka PHP używa `index.php` oraz `styles.css`; kod wykonuje lokalny runtime PHP 8.4 w WebAssembly, a jego wynik HTML trafia do tego samego sandboxowanego iframe. Ćwiczenie formularza uruchamia kontrolowane żądanie POST w pamięci. Sprawdzanie korzysta z deklaratywnych warunków DOM, CSS, interakcji, Reacta i odpowiedzi PHP. Runtime Reacta, kompilator JSX i PHP.wasm są dołączone lokalnie.
