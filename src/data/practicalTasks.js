import { createTask } from './lessonFactories.js';
import { htmlInstructions, htmlTaskIntro, htmlTaskHint } from './htmlInstructions.js';

const htmlExamples = {
  1: ['<main><h1>Moja strona</h1><section id="html"><h2>HTML</h2><p>Struktura</p></section><section id="css"><h2>CSS</h2><p>Wygląd</p></section><section id="js"><h2>JavaScript</h2><p>Zachowanie</p></section></main>', ['main > h1', '#html > p', '#css > p', '#js > p']],
  2: ['<!doctype html><html lang="pl"><head><meta charset="UTF-8"><title>Moja strona</title></head><body><main><h1>Witaj!</h1></main></body></html>', ['html[lang="pl"]', 'head > title', 'head > meta[charset="UTF-8"]', 'body > main > h1']],
  3: ['<main><h1>Poradnik</h1><section><h2>Pierwszy krok</h2><p><strong>Ważne:</strong> pracuj <em>uważnie</em>.</p><hr><p>H<sub>2</sub>O i m<sup>2</sup><br>Nowa linia</p></section></main>', ['main > h1', 'section > h2', 'p > strong', 'p > em', 'hr', 'sub', 'sup', 'br']],
  4: ['<main><h1>Plan nauki</h1><ul><li>HTML<ul><li>Semantyka</li></ul></li></ul><ol><li>Przeczytaj</li><li>Przećwicz</li></ol><dl><dt>DOM</dt><dd>Drzewo dokumentu</dd></dl></main>', ['ul > li', 'li > ul > li', 'ol > li', 'dl > dt', 'dl > dd']],
  5: ['<nav><ul><li><a href="#kontakt">Kontakt</a></li><li><a href="https://developer.mozilla.org/" target="_blank" rel="noopener">Dokumentacja</a></li></ul></nav><main><section id="kontakt"><h1>Kontakt</h1></section></main>', ['nav ul li a[href="#kontakt"]', '#kontakt', 'a[target="_blank"][rel~="noopener"]']],
  6: ['<main><figure><img src="/course-assets/04-flexbox-grid.svg" alt="Schemat układów Flexbox i Grid" width="240" height="160"><figcaption>Układy CSS</figcaption></figure><video controls><source src="film.mp4" type="video/mp4"></video><audio controls><source src="dzwiek.mp3" type="audio/mpeg"></audio></main>', ['figure > img[alt]:not([alt=""])[width][height]', 'figure > figcaption', 'video[controls] > source', 'audio[controls] > source']],
  7: ['<table><caption>Plan tygodnia</caption><thead><tr><th scope="col">Dzień</th><th scope="col">Godziny</th></tr></thead><tbody><tr><th scope="row">Poniedziałek</th><td>2</td></tr></tbody><tfoot><tr><th scope="row">Suma</th><td>2</td></tr></tfoot></table>', ['table > caption', 'thead th[scope="col"]', 'tbody th[scope="row"]', 'tbody td', 'tfoot td']],
  8: ['<form><fieldset><legend>Zgłoszenie</legend><label for="email">E-mail</label><input id="email" name="email" type="email" required><label for="topic">Temat</label><select id="topic" name="topic"><option>HTML</option></select><label for="message">Wiadomość</label><textarea id="message" name="message" required></textarea><button type="submit">Wyślij</button></fieldset></form>', ['form fieldset > legend', 'label[for="email"]', 'input#email[type="email"][name][required]', 'label[for="topic"]', 'select#topic > option', 'label[for="message"]', 'textarea#message[required]', 'button[type="submit"]']],
  9: ['<header><nav><a href="#main">Do treści</a></nav></header><main id="main"><h1>Aktualności</h1><section><h2>Wydarzenia</h2><article><h3>Warsztaty</h3><time datetime="2026-10-01">1 października</time><p>Zapraszamy!</p></article></section><aside><h2>Powiązane</h2></aside></main><footer>Kontakt</footer>', ['header > nav', 'a[href="#main"]', 'main#main > h1', 'section > h2', 'article > h3', 'time[datetime]', 'aside > h2', 'footer']],
};

// Each variant changes a concrete target, so copying the preceding solution
// does not complete the next exercise.
const stylePlans = {
  10: [['color', 'rgb(20, 80, 120)'], ['background-color', 'rgb(240, 248, 255)']],
  11: [['color', 'rgb(128, 0, 128)'], ['font-weight', '700']],
  12: [['font-size', '24px'], ['line-height', '36px'], ['text-align', 'center']],
  13: [['box-sizing', 'border-box'], ['padding-top', '24px'], ['border-top-width', '2px'], ['border-top-style', 'solid']],
  14: [['position', 'relative'], ['border-radius', '16px'], ['overflow-x', 'hidden']],
  23: [['transition-property', 'opacity'], ['transition-duration', '0.2s']],
};
const layoutPlans = {
  15: [
    [['display', 'flex'], ['flex-direction', 'row'], ['justify-content', 'center']],
    [['display', 'flex'], ['flex-direction', 'column'], ['align-items', 'center']],
    [['display', 'flex'], ['justify-content', 'space-between'], ['align-items', 'center']],
  ],
  16: [
    [['display', 'flex'], ['gap', '16px'], ['flex-wrap', 'wrap']],
    [['display', 'flex'], ['row-gap', '24px'], ['column-gap', '12px'], ['flex-wrap', 'wrap']],
    [['display', 'flex'], ['flex-wrap', 'wrap'], ['align-content', 'space-between'], ['height', '300px']],
  ],
  17: [
    [['display', 'flex'], ['flex-basis', '80px', '.item'], ['flex-grow', '1', '.item']],
    [['display', 'flex'], ['flex-grow', '2', '.item:first-child'], ['flex-shrink', '0', '.item:first-child']],
    [['display', 'flex'], ['flex-basis', '0%', '.item'], ['flex-grow', '1', '.item'], ['flex-shrink', '1', '.item']],
  ],
  18: [
    [['display', 'flex'], ['align-self', 'flex-end', '.item:last-child']],
    [['display', 'flex'], ['order', '-1', '.item:last-child']],
    [['display', 'flex'], ['min-width', '0px', '.item'], ['overflow-x', 'hidden', '.item']],
  ],
  19: [
    [['display', 'flex'], ['justify-content', 'space-between'], ['align-items', 'center']],
    [['display', 'flex'], ['flex-wrap', 'wrap'], ['gap', '20px']],
    [['display', 'flex'], ['flex-direction', 'column'], ['gap', '12px']],
  ],
  20: [
    [['display', 'grid'], ['grid-template-columns', '80px 80px'], ['gap', '12px']],
    [['display', 'grid'], ['grid-template-columns', '60px 60px 60px'], ['gap', '16px']],
    [['display', 'grid'], ['grid-template-columns', '100px 100px'], ['grid-template-rows', '80px 80px']],
  ],
  21: [
    [['display', 'grid'], ['grid-template-areas', '"header header" "side content"'], ['grid-area', 'header', '.item:first-child']],
    [['display', 'grid'], ['grid-column-start', '1', '.item:first-child'], ['grid-column-end', '3', '.item:first-child']],
    [['display', 'grid'], ['grid-row-start', '1', '.item:last-child'], ['grid-row-end', '3', '.item:last-child']],
  ],
  22: [
    [['display', 'flex'], ['flex-wrap', 'wrap'], ['gap', '8px']],
    [['display', 'flex'], ['flex-wrap', 'wrap'], ['gap', '16px']],
    [['display', 'grid'], ['grid-template-columns', '100px 100px'], ['gap', '12px']],
  ],
};
const labels = ['Prowadzone', 'Samodzielnie', 'Wyzwanie'];
const modes = ['guided', 'independent', 'challenge'];
const ruleText = (plans) => plans.map(([property, value, selector = '.practice']) => `${selector} { ${property}: ${value}; }`).join('\n');
const styleTarget = (selector) => ({
  '.practice': 'W kontenerze z class="practice"',
  '.item': 'W każdym elemencie z class="item"',
  '.item:first-child': 'W pierwszym elemencie z class="item"',
  '.item:last-child': 'W ostatnim elemencie z class="item"',
}[selector]);

export function practicalTasks(definition, base) {
  const count = definition.track === 'layout' ? 3 : 2;
  return Array.from({ length: count }, (_, variant) => {
    const id = `${definition.track}-${String(definition.order).padStart(2, '0')}-${modes[variant]}`;
    const task = { id, mode: modes[variant], title: `${labels[variant]}: ${definition.title}`, starter: { ...base }, checks: [] };
    const add = (type, label, fields = {}) => task.checks.push({ id: `${id}-${task.checks.length}`, type, label, ...fields });
    if (definition.track === 'html') {
      const [example, selectors] = htmlExamples[definition.order];
      task.prompt = htmlTaskIntro;
      task.hint = htmlTaskHint;
      task.starter.html = '<!-- Tutaj, wewnątrz body, zbuduj treść strony według kroków zadania. -->';
      task.solution = { ...base, html: example };
      selectors.forEach((selector, index) => add('elementExists', htmlInstructions[definition.order][index], { selector }));
      if (definition.order === 2) add('sourceIncludes', 'Na początku pliku, przed <html>, umieść deklarację <!doctype html>.', { file: 'html', value: '<!doctype html>' });
      if (variant) {
        const extra = '<section id="podsumowanie"><h2>Podsumowanie</h2><p>Moje wnioski z ćwiczenia.</p></section>';
        task.solution.html = example.includes('</body>') ? example.replace('</body>', extra + '</body>') : example + extra;
        add('elementExists', 'Dodaj sekcję <section id="podsumowanie">. Wewnątrz niej umieść nagłówek <h2> „Podsumowanie” oraz akapit <p> z własnymi wnioskami.', { selector: '#podsumowanie:has(> h2):has(> p)' });
      }
    } else if (['css', 'layout'].includes(definition.track)) {
      let plan = definition.track === 'layout' ? layoutPlans[definition.order][variant] : stylePlans[definition.order];
      if (definition.track === 'css' && variant) plan = [...plan, ['letter-spacing', '2px']];
      task.prompt = `Pracuj w pliku theme.css. HTML jest już przygotowany: kontener ma class="practice", a trzy elementy w środku mają class="item". Zapis .practice w CSS wybiera kontener, a .item wybiera jego elementy — to nazwy klas, nie plików. Dodaj reguły według kroków poniżej, np. .practice { display: flex; }. Sprawdzamy rzeczywisty styl w podglądzie. ${definition.order === 23 ? 'Dodaj też stan :hover zmieniający opacity oraz wyłączenie przejść w prefers-reduced-motion.' : ''}`;
      task.starter = { ...base, html: '<main><h1>Laboratorium układu</h1><section class="practice"><div class="item">Jeden</div><div class="item">Dwa</div><div class="item">Trzy</div></section></main>', themeCss: '.practice { min-height: 180px; background: #e0edf5; }\n.item { padding: 12px; background: #fff; border: 1px solid #789; }' };
      task.solution = { ...task.starter, baseCss: base.baseCss + '\n' + ruleText(plan) };
      if (definition.track === 'css') task.solution = { ...task.starter, themeCss: task.starter.themeCss + '\n' + ruleText(plan) };
      if (definition.order === 23) task.solution.baseCss += '\n.practice:hover { opacity: .6; }\n@media (prefers-reduced-motion: reduce) { .practice { transition: none; } }';
      add('elementExists', 'W index.html zachowaj kontener z class="practice" i trzy elementy z class="item" bezpośrednio w jego wnętrzu.', { selector: '.practice:has(> .item:nth-child(3))' });
      plan.forEach(([property, expected, selector = '.practice']) => add('computedStyle', `${styleTarget(selector)} ustaw właściwość ${property} na ${expected}. Regułę zapisz dla ${selector}.`, { selector, property, expected }));
      if (definition.order === 22) add('noHorizontalOverflow', 'Unikaj poziomego przewijania w podglądzie');
    } else {
      return null;
    }
    add('runtimeError', 'Kod uruchamia się bez błędów');
    if (variant === 0 && !task.hint) task.hint = 'Realizuj po jednym wymaganiu. Kliknij Sprawdź, przeczytaj brakujące warunki i popraw kod.';
    return createTask(task);
  });
}
