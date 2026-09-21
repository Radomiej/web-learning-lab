# Web Learning Lab

Lokalny kurs HTML, CSS, layoutów, JavaScriptu i Reacta z edytorem kodu oraz podglądem uruchamianym w sandboxowanym iframe.

## Start jednym kliknięciem

Uruchom `start-course.cmd`. Launcher doinstaluje zależności przy pierwszym uruchomieniu i wystartuje Vite na `http://localhost:5181/`.

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

Kurs docelowo obejmuje 39 lekcji: 9 HTML, 14 CSS/layout, 8 JavaScript i 8 React. Lekcje layoutowe zawierają dokładnie 24 zadania Flexbox/Grid/RWD. Postęp i kod ucznia są przechowywane lokalnie w przeglądarce. Aby wyzerować postęp, wyczyść dane witryny dla `localhost:5181`.
