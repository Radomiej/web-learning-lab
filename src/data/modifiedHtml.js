// Modified variants for the HTML track (lessons 101–109). Each builds on the
// guided solution with one concrete extension that previews the independent
// task's theme. Starter = guided example + TODO marker; solution = full example.
export const modifiedHtml = {
  1: {
    title: 'Stopka strony',
    goal: 'Strona ma już trzy sekcje. Dodaj pod `</main>` stopkę `<footer>` z akapitem `<p>` z podpisem autora, np. „Autor: Ola”.',
    starter: '<main><h1>Moja strona</h1><section id="html"><h2>HTML</h2><p>Struktura</p></section><section id="css"><h2>CSS</h2><p>Wygląd</p></section><section id="js"><h2>JavaScript</h2><p>Zachowanie</p></section></main>\n<!-- TODO: dodaj <footer> z akapitem <p> z podpisem autora -->',
    solution: '<main><h1>Moja strona</h1><section id="html"><h2>HTML</h2><p>Struktura</p></section><section id="css"><h2>CSS</h2><p>Wygląd</p></section><section id="js"><h2>JavaScript</h2><p>Zachowanie</p></section></main><footer><p>Autor: Ola</p></footer>',
    requirements: [
      ['body > footer > p', 'Po zamknięciu `</main>` dodaj `<footer>`, a w nim `<p>` z podpisem.'],
      ['footer > p', 'W `<footer>` umieść `<p>` z tekstem „Autor: Ola”.'],
    ],
    textChecks: [['footer > p', 'Autor: Ola', 'Stopka ma zawierać podpis „Autor: Ola”.']],
  },
  2: {
    title: 'Opis strony dla wyszukiwarki',
    goal: 'Dokument ma już szkielet. W `<head>` dodaj `<meta name="description" content="Moja pierwsza strona">` — opis, który wyszukiwarki pokazują pod tytułem.',
    starter: '<!doctype html><html lang="pl"><head><meta charset="UTF-8"><title>Moja strona</title>\n<!-- TODO: dodaj <meta name="description" content="..."> -->\n</head><body><main><h1>Witaj!</h1></main></body></html>',
    solution: '<!doctype html><html lang="pl"><head><meta charset="UTF-8"><meta name="description" content="Moja pierwsza strona"><title>Moja strona</title></head><body><main><h1>Witaj!</h1></main></body></html>',
    requirements: [
      ['head > meta[name="description"][content]:not([content=""])', 'W `<head>` dodaj `<meta name="description" content="…">` z niepustym opisem strony.'],
      ['head > title', 'Zachowaj `<title>` z tytułem karty.'],
    ],
    textChecks: [],
  },
  3: {
    title: 'Fragment kodu w tekście',
    goal: 'Poradnik ma nagłówki i wyróżnienia. Dodaj akapit z inline fragmentem `<code>for</code>` oraz blok `<pre>` z `<code>` w środku — tak wygląda kod na stronie.',
    starter: '<main><h1>Poradnik</h1><section><h2>Pierwszy krok</h2><p><strong>Ważne:</strong> pracuj <em>uważnie</em>.</p><hr><p>H<sub>2</sub>O i m<sup>2</sup><br>Nowa linia</p><!-- TODO: dodaj <p> z <code>for</code> i blok <pre><code> --></section></main>',
    solution: '<main><h1>Poradnik</h1><section><h2>Pierwszy krok</h2><p><strong>Ważne:</strong> pracuj <em>uważnie</em>.</p><hr><p>H<sub>2</sub>O i m<sup>2</sup><br>Nowa linia</p><p>Użyj pętli <code>for</code> w JavaScript.</p><pre><code>for (let i = 0; i < 3; i++) {}</code></pre></section></main>',
    requirements: [
      ['section > p > code', 'W `<section>` dodaj `<p>` z fragmentem kodu w `<code>` (np. `for`).'],
      ['section > pre > code', 'Dodaj blok `<pre>` z `<code>` — dla wielowierszowego fragmentu kodu.'],
    ],
    textChecks: [['section > p > code', 'for', 'Inline `<code>` ma zawierać fragment kodu, np. „for”.']],
  },
  4: {
    title: 'Podlista w krokach',
    goal: 'Plan nauki ma listy trzech typów. W numerowanej liście `<ol>` dodaj w jednym kroku `<li>` podlistę `<ul>` z punktem `<li>` — krok z podzadaniem.',
    starter: '<main><h1>Plan nauki</h1><ul><li>HTML<ul><li>Semantyka</li></ul></li></ul><ol><li>Przeczytaj</li><li>Przećwicz<!-- TODO: dodaj <ul> z <li> w tym <li> --></li></ol><dl><dt>DOM</dt><dd>Drzewo dokumentu</dd></dl></main>',
    solution: '<main><h1>Plan nauki</h1><ul><li>HTML<ul><li>Semantyka</li></ul></li></ul><ol><li>Przeczytaj</li><li>Przećwicz<ul><li>Strona z kodem</li></ul></li></ol><dl><dt>DOM</dt><dd>Drzewo dokumentu</dd></dl></main>',
    requirements: [
      ['ol > li > ul > li', 'W jednym kroku `<ol>` umieść podlistę `<ul>` z punktem `<li>` — zagnieżdżona lista w elemencie listy.'],
    ],
    textChecks: [['ol > li > ul > li', 'Strona z kodem', 'Podlista ma zawierać punkt „Strona z kodem”.']],
  },
  5: {
    title: 'Link do sekcji o nas',
    goal: 'Nawigacja prowadzi już do „Kontakt”. Dodaj drugi link `<a href="#o-nas">O nas</a>` w `<nav>` oraz sekcję `<section id="o-nas">` — kotwica dołącza do tej samej strony.',
    starter: '<nav><ul><li><a href="#kontakt">Kontakt</a></li><li><a href="https://developer.mozilla.org/" target="_blank" rel="noopener">Dokumentacja</a></li></ul></nav><main><section id="kontakt"><h1>Kontakt</h1></section><!-- TODO: link #o-nas w nav i <section id="o-nas"> --></main>',
    solution: '<nav><ul><li><a href="#kontakt">Kontakt</a></li><li><a href="#o-nas">O nas</a></li><li><a href="https://developer.mozilla.org/" target="_blank" rel="noopener">Dokumentacja</a></li></ul></nav><main><section id="kontakt"><h1>Kontakt</h1></section><section id="o-nas"><h1>O nas</h1></section></main>',
    requirements: [
      ['nav a[href="#o-nas"]', 'W `<nav>` dodaj link `<a href="#o-nas">` prowadzący do nowej sekcji.'],
      ['main > section#o-nas', 'Dodaj `<section id="o-nas">` — element, do którego prowadzi link.'],
    ],
    textChecks: [['section#o-nas > h1', 'O nas', 'Sekcja `o-nas` ma mieć nagłówek „O nas”.']],
  },
  6: {
    title: 'Drugi obraz z lazy loading',
    goal: 'Galeria ma już obraz i multimedia. Dodaj drugi `<figure>` z `<img>` mającym `alt`, `width`, `height` i `loading="lazy"` — przeglądarka pobierze go dopiero przy potrzebie.',
    starter: '<main><figure><img src="/course-assets/04-flexbox-grid.svg" alt="Schemat układów Flexbox i Grid" width="240" height="160"><figcaption>Układy CSS</figcaption></figure><!-- TODO: drugi <figure> z <img loading="lazy"> --><video controls><source src="film.mp4" type="video/mp4"></video><audio controls><source src="dzwiek.mp3" type="audio/mpeg"></audio></main>',
    solution: '<main><figure><img src="/course-assets/04-flexbox-grid.svg" alt="Schemat układów Flexbox i Grid" width="240" height="160"><figcaption>Układy CSS</figcaption></figure><figure><img src="/course-assets/04-flexbox-grid.svg" alt="Drugi schemat" width="240" height="160" loading="lazy"><figcaption>Drugi schemat</figcaption></figure><video controls><source src="film.mp4" type="video/mp4"></video><audio controls><source src="dzwiek.mp3" type="audio/mpeg"></audio></main>',
    requirements: [
      ['main > figure:nth-of-type(2) > img[alt]:not([alt=""])[width][height][loading="lazy"]', 'Drugi `<figure>` ma zawierać `<img>` z `alt`, `width`, `height` i `loading="lazy"`.'],
      ['main > figure:nth-of-type(2) > figcaption', 'Pod drugim obrazem dodaj podpis w `<figcaption>`.'],
    ],
    textChecks: [],
  },
  7: {
    title: 'Nagłówek przez dwie kolumny',
    goal: 'Tabela ma już nagłówki i podsumowanie. W `<thead>` dodaj pierwszy wiersz z `<th colspan="2">` — nagłówek rozciągnięty na dwie kolumny (np. tytuł grupy).',
    starter: '<table><caption>Plan tygodnia</caption><thead><tr><th scope="col">Dzień</th><th scope="col">Godziny</th></tr></thead><tbody><tr><th scope="row">Poniedziałek</th><td>2</td></tr></tbody><tfoot><tr><th scope="row">Suma</th><td>2</td></tr></tfoot></table>\n<!-- TODO: dodaj w <thead> pierwszy wiersz z <th colspan="2"> -->',
    solution: '<table><caption>Plan tygodnia</caption><thead><tr><th colspan="2">Plan tygodnia</th></tr><tr><th scope="col">Dzień</th><th scope="col">Godziny</th></tr></thead><tbody><tr><th scope="row">Poniedziałek</th><td>2</td></tr></tbody><tfoot><tr><th scope="row">Suma</th><td>2</td></tr></tfoot></table>',
    requirements: [
      ['thead > tr:first-child > th[colspan="2"]', 'W pierwszym wierszu `<thead>` dodaj `<th colspan="2">` obejmujący dwie kolumny.'],
    ],
    textChecks: [['thead > tr:first-child > th[colspan="2"]', 'Plan tygodnia', 'Zgrupowany nagłówek ma tekst „Plan tygodnia”.']],
  },
  8: {
    title: 'Pole liczbowe z zakresem',
    goal: 'Formularz zgłoszeniowy działa. Dodaj pole liczby uczestników: `<label for="seats">Miejsca</label>` i `<input id="seats" name="seats" type="number" min="1" max="6" required>`.',
    starter: '<form><fieldset><legend>Zgłoszenie</legend><label for="email">E-mail</label><input id="email" name="email" type="email" required><label for="topic">Temat</label><select id="topic" name="topic"><option>HTML</option></select><label for="message">Wiadomość</label><textarea id="message" name="message" required></textarea><!-- TODO: label #seats + input type="number" min=1 max=6 required --><button type="submit">Wyślij</button></fieldset></form>',
    solution: '<form><fieldset><legend>Zgłoszenie</legend><label for="email">E-mail</label><input id="email" name="email" type="email" required><label for="topic">Temat</label><select id="topic" name="topic"><option>HTML</option></select><label for="seats">Miejsca</label><input id="seats" name="seats" type="number" min="1" max="6" required><label for="message">Wiadomość</label><textarea id="message" name="message" required></textarea><button type="submit">Wyślij</button></fieldset></form>',
    requirements: [
      ['label[for="seats"]', 'Dodaj etykietę `<label for="seats">Miejsca</label>`.'],
      ['input#seats[type="number"][name="seats"][min="1"][max="6"][required]', 'Dodaj `<input id="seats" name="seats" type="number" min="1" max="6" required>`.'],
    ],
    textChecks: [['label[for="seats"]', 'Miejsca', 'Etykieta pola ma czytać „Miejsca”.']],
  },
  9: {
    title: 'Rozwijana odpowiedź',
    goal: 'Strona ma już landmarks i sekcje. W sekcji „Wydarzenia” dodaj `<details>` z pytaniem w `<summary>` i odpowiedzią w `<p>` — natywny element rozwijany bez JavaScriptu.',
    starter: '<header><nav><a href="#main">Do treści</a></nav></header><main id="main"><h1>Aktualności</h1><section><h2>Wydarzenia</h2><article><h3>Warsztaty</h3><time datetime="2026-10-01">1 października</time><p>Zapraszamy!</p></article><!-- TODO: dodaj <details><summary>…</summary><p>…</p></details> --></section><aside><h2>Powiązane</h2></aside></main><footer>Kontakt</footer>',
    solution: '<header><nav><a href="#main">Do treści</a></nav></header><main id="main"><h1>Aktualności</h1><section><h2>Wydarzenia</h2><article><h3>Warsztaty</h3><time datetime="2026-10-01">1 października</time><p>Zapraszamy!</p></article><details><summary>Kiedy są warsztaty?</summary><p>W sobotę o 10:00.</p></details></section><aside><h2>Powiązane</h2></aside></main><footer>Kontakt</footer>',
    requirements: [
      ['section > details > summary', 'Dodaj `<details>` z pytaniem w `<summary>`.'],
      ['section > details > p', 'W `<details>` po `<summary>` dodaj odpowiedź w `<p>`.'],
    ],
    textChecks: [['details > summary', 'Kiedy są warsztaty?', 'Pytanie w `<summary>` ma czytać „Kiedy są warsztaty?”.']],
  },
};
