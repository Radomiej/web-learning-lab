import { createTask } from './lessonFactories.js';
import { htmlInstructions, htmlTaskIntro, htmlTaskHint } from './htmlInstructions.js';
import { independentHtml } from './independentHtml.js';

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
const independentStyles = {
  10: ['Wyróżnienie komunikatu', 'Wyróżnij środkowy komunikat, nie zmieniając koloru pozostałych.', [['color', 'rgb(153, 27, 27)', '.item:nth-child(2)'], ['background-color', 'rgb(254, 226, 226)', '.item:nth-child(2)'], ['color', 'rgb(20, 80, 120)', '.item:first-child']]],
  11: ['Klasa kontra identyfikator', 'Nadaj wszystkim kartom wagę 400, ale ostatniej karcie (id="featured") wagę 700 i inny kolor. Przećwicz bardziej szczegółowy selektor.', [['font-weight', '400', '.item:first-child'], ['font-weight', '400', '.item:nth-child(2)'], ['font-weight', '700', '#featured'], ['color', 'rgb(180, 83, 9)', '#featured']]],
  12: ['Etykiety i tekst do czytania', 'Pierwszy element jest etykietą, a drugi opisem. Ustaw im różną typografię.', [['text-transform', 'uppercase', '.item:first-child'], ['letter-spacing', '2px', '.item:first-child'], ['font-size', '18px', '.item:nth-child(2)'], ['line-height', '27px', '.item:nth-child(2)'], ['text-align', 'left', '.item:nth-child(2)']]],
  13: ['Karta o stałej szerokości', 'Zmieść pierwszą kartę wraz z paddingiem i obramowaniem w 200 px. Drugiej dodaj odstęp zewnętrzny.', [['box-sizing', 'border-box', '.item:first-child'], ['width', '200px', '.item:first-child'], ['padding-left', '20px', '.item:first-child'], ['border-left-width', '4px', '.item:first-child'], ['margin-top', '16px', '.item:nth-child(2)']]],
  14: ['Znaczek w rogu karty', 'Kontener ma być punktem odniesienia, a ostatni element znaczkiem przypiętym do jego prawego górnego rogu.', [['position', 'relative'], ['position', 'absolute', '.item:last-child'], ['top', '8px', '.item:last-child'], ['right', '8px', '.item:last-child'], ['z-index', '2', '.item:last-child']]],
  23: ['Przejście transformacji', 'Przygotuj pierwszą kartę do płynnej zmiany transformacji: 300 ms, ease-in-out, bez opóźnienia. Tutaj oceniana jest konfiguracja przejścia, nie sam ruch.', [['transition-property', 'transform', '.item:first-child'], ['transition-duration', '0.3s', '.item:first-child'], ['transition-timing-function', 'ease-in-out', '.item:first-child'], ['transition-delay', '0s', '.item:first-child']]],
};
const layoutScenarios = {
  15: ['Wyśrodkowany rząd', 'Pionowy stos przycisków', 'Nawigacja na krańcach'],
  16: ['Zawijane etykiety', 'Odstępy w katalogu', 'Wiersze na pełnej wysokości'],
  17: ['Rosnące karty', 'Wyróżniona kolumna', 'Trzy równe udziały'],
  18: ['Przycisk przy dolnej krawędzi', 'Zmiana kolejności wizualnej', 'Długi tekst bez rozpychania'],
  19: ['Pasek narzędzi z odstępami', 'Kafelki z minimalną bazą', 'Pionowy panel akcji'],
  20: ['Siatka dwóch kolumn', 'Galeria trzech kolumn', 'Wiersze o ustalonej wysokości'],
  21: ['Nazwane obszary strony', 'Nagłówek przez dwie kolumny', 'Karta przez dwa wiersze'],
  22: ['Zawijane filtry', 'Elastyczne karty oferty', 'Kompaktowa siatka'],
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
    [['display', 'flex'], ['justify-content', 'flex-end'], ['align-items', 'center'], ['gap', '8px']],
    [['display', 'flex'], ['flex-wrap', 'wrap'], ['gap', '20px'], ['flex-basis', '120px', '.item']],
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
    [['display', 'flex'], ['flex-wrap', 'wrap'], ['gap', '16px'], ['flex-grow', '1', '.item'], ['flex-basis', '100px', '.item']],
    [['display', 'grid'], ['grid-template-columns', '100px 100px'], ['gap', '12px'], ['justify-content', 'center']],
  ],
};
const modes = ['guided', 'independent', 'challenge'];
const ruleText = (plans) => plans.map(([property, value, selector = '.practice']) => `${selector} { ${property}: ${value}; }`).join('\n');
const styleTarget = (selector) => ({
  '.practice': 'W kontenerze z class="practice"',
  '.item': 'W każdym elemencie z class="item"',
  '.item:first-child': 'W pierwszym elemencie z class="item"',
  '.item:last-child': 'W ostatnim elemencie z class="item"',
  '.item:nth-child(2)': 'W drugim elemencie z class="item"',
  '#featured': 'W elemencie z id="featured"',
}[selector]);

export function practicalTasks(definition, base) {
  const count = definition.track === 'layout' ? 3 : 2;
  return Array.from({ length: count }, (_, variant) => {
    const id = `${definition.track}-${String(definition.order).padStart(2, '0')}-${modes[variant]}${variant && definition.track !== 'layout' ? '-v2' : ''}`;
    const task = { id, mode: modes[variant], title: definition.title, starter: { ...base }, checks: [] };
    const add = (type, label, fields = {}) => task.checks.push({ id: `${id}-${task.checks.length}`, type, label, ...fields });
    if (definition.track === 'html') {
      const independent = variant ? independentHtml[definition.order] : null;
      const [example, selectors] = independent ? [independent.html, independent.requirements.map(([selector]) => selector)] : htmlExamples[definition.order];
      if (independent) task.title = independent.title;
      task.prompt = (independent ? independent.goal + ' ' : '') + htmlTaskIntro;
      task.hint = htmlTaskHint;
      task.starter.html = '<!-- Tutaj, wewnątrz body, zbuduj treść strony według kroków zadania. -->';
      task.solution = { ...base, html: example };
      selectors.forEach((selector, index) => add('elementExists', independent ? independent.requirements[index][1] : htmlInstructions[definition.order][index], { selector }));
      if (definition.order === 2) add('sourceIncludes', 'Na początku pliku index.html, przed <html>, umieść deklarację <!doctype html>.', { file: 'index.html', value: '<!doctype html>' });
    } else if (['css', 'layout'].includes(definition.track)) {
      let plan = definition.track === 'layout' ? layoutPlans[definition.order][variant] : stylePlans[definition.order];
      const independent = definition.track === 'css' && variant ? independentStyles[definition.order] : null;
      if (independent) { task.title = independent[0]; plan = independent[2]; }
      if (definition.track === 'layout') task.title = layoutScenarios[definition.order][variant];
      task.prompt = `Pracuj w pliku styles.css. HTML jest już przygotowany: kontener ma class="practice", a trzy elementy w środku mają class="item". Zapis .practice w CSS wybiera kontener, a .item wybiera jego elementy — to nazwy klas, nie plików. Dodaj reguły według kroków poniżej, np. .practice { display: flex; }. Sprawdzamy rzeczywisty styl w podglądzie. ${definition.order === 23 ? 'Dodaj też stan :hover zmieniający opacity oraz wyłączenie przejść w prefers-reduced-motion.' : ''}`;
      if (independent) task.prompt = independent[1] + ' ' + task.prompt;
      if (definition.order === 23) task.prompt = task.prompt.replace('Dodaj też stan :hover zmieniający opacity oraz wyłączenie przejść w prefers-reduced-motion.', '');
      task.starter = { ...base, html: `<main><h1>${task.title}</h1><section class="practice"><div class="item">Pierwszy element</div><div class="item">Drugi element</div><div class="item" id="featured">Trzeci element</div></section></main>`, themeCss: '.practice { min-height: 180px; background: #e0edf5; }\n.item { padding: 12px; background: #fff; border: 1px solid #789; }' };
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
    return createTask({ track: definition.track, ...task });
  });
}
