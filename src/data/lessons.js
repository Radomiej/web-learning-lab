import { createLesson, createTask } from './lessonFactories.js';
import { cssLessons } from './cssLessons.js';
import { htmlLessons } from './htmlLessons.js';
import { jsLessons } from './jsLessons.js';
import { layoutLessons } from './layoutLessons.js';
import { reactLessons } from './reactLessons.js';

const bundle = (html, baseCss = '', themeCss = '', js = '') => ({
  html,
  baseCss,
  themeCss,
  js,
});

const commonCss = `
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; color: #17324d; background: #f3f7fa; }
main { max-width: 760px; margin: 0 auto; padding: 32px 20px; }
`;

const standardStarter = (track, order, title) => {
  if (track === 'react') {
    return bundle(
      '<div id="root"></div>',
      commonCss,
      '.panel { padding: 24px; border: 1px solid #cfe0e8; border-radius: 12px; background: white; }',
      `const App = () => (
  <main>
    <section className="panel">
      <h1>${title}</h1>
      <p>To jest punkt startowy lekcji React.</p>
    </section>
  </main>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
    );
  }

  const html = track === 'js'
    ? `<main>
  <h1>${title}</h1>
  <p id="message">Przygotuj stronę do ćwiczeń.</p>
  <button id="action" type="button">Uruchom akcję</button>
</main>`
    : `<main>
  <h1>${title}</h1>
  <p>Przygotuj semantyczny przykład do ćwiczeń.</p>
</main>`;

  return bundle(
    html,
    commonCss,
    '.card { padding: 24px; border: 1px solid #cfe0e8; border-radius: 12px; background: white; }',
    track === 'js' ? "console.log('Lekcja gotowa');" : '',
  );
};

const check = (id, type, label, hint, fields = {}) => ({
  id,
  type,
  label,
  hint,
  ...fields,
});

const standardTasks = (definition, starter) => [
  createTask({
    id: `${definition.track}-${String(definition.order).padStart(2, '0')}-guided`,
    mode: 'guided',
    title: `Prowadzone: ${definition.focus}`,
    prompt: `Wykonaj pierwszy krok lekcji „${definition.title}”. Skorzystaj z podpowiedzi i sprawdź wynik.`,
    starter,
    solution: starter,
    checks: [check(`${definition.id}-guided-structure`, 'sourceIncludes', 'Kod zawiera element lekcji', 'Dodaj wymagany fragment do odpowiedniego pliku.', { file: definition.file, value: definition.token })],
    hint: `Zacznij od małej, poprawnej zmiany związanej z: ${definition.focus}.`,
  }),
  createTask({
    id: `${definition.track}-${String(definition.order).padStart(2, '0')}-independent`,
    mode: 'independent',
    title: `Samodzielnie: ${definition.focus}`,
    prompt: `Zbuduj własny mały przykład pokazujący temat: ${definition.focus}. Zadbaj o czytelne nazwy i semantykę.`,
    starter,
    solution: starter,
    checks: [check(`${definition.id}-independent-structure`, 'sourceIncludes', 'Kod używa właściwego rozwiązania', 'Wróć do teorii i sprawdź, czy używasz właściwego elementu lub property.', { file: definition.file, value: definition.token })],
  }),
];

const layoutTopics = [
  {
    order: 15,
    id: 'flex-axis',
    title: 'Flexbox: pierwsza oś',
    summary: 'Ustawiaj elementy na osi głównej i poprzecznej.',
    focus: 'display: flex, kierunek osi, justify-content i align-items',
    token: 'display: flex',
    tokenFile: 'baseCss',
    objectives: ['Rozpoznaj oś główną i poprzeczną.', 'Dobierz kierunek oraz sposób wyrównania elementów.'],
    theory: ['Flexbox zaczyna się od kontenera: `display: flex` zmienia sposób układania jego bezpośrednich dzieci.', 'Najpierw nazwij osie, potem ustaw `flex-direction`, `justify-content` i `align-items`.'],
  },
  {
    order: 16,
    id: 'flex-wrap-gap',
    title: 'Flexbox: odstępy i zawijanie',
    summary: 'Buduj przewidywalne rzędy elementów z gap i wrap.',
    focus: 'gap, flex-wrap, row-gap, column-gap i align-content',
    token: 'flex-wrap',
    tokenFile: 'baseCss',
    objectives: ['Używaj `gap` zamiast przypadkowych marginów.', 'Zawijaj elementy wtedy, gdy szerokość kontenera jest ograniczona.'],
    theory: ['`gap` opisuje odległość między elementami bez wpływania na zewnętrzny margines.', 'Przy wielu wierszach `align-content` steruje rozłożeniem całych linii flexa.'],
  },
  {
    order: 17,
    id: 'flex-sizing',
    title: 'Flexbox: rozmiar elementów',
    summary: 'Kontroluj bazę, wzrost i kurczenie się elementów.',
    focus: 'flex-basis, flex-grow, flex-shrink i skrót flex',
    token: 'flex-grow',
    tokenFile: 'baseCss',
    objectives: ['Odróżniaj rozmiar bazowy od wolnego miejsca.', 'Dobieraj skrót `flex` bez zgadywania.'],
    theory: ['`flex-basis` jest punktem wyjścia, a `flex-grow` i `flex-shrink` rozdzielają wolne lub brakujące miejsce.', 'Najpierw ustaw bazę, potem dopiero decyduj, które elementy mogą rosnąć.'],
  },
  {
    order: 18,
    id: 'flex-exceptions',
    title: 'Flexbox: elementy wyjątkowe',
    summary: 'Pracuj z kolejnością, align-self i ograniczeniami szerokości.',
    focus: 'order, align-self, min-width, max-width i overflow',
    token: 'align-self',
    tokenFile: 'baseCss',
    objectives: ['Zmień pozycję wizualną bez łamania kolejności DOM.', 'Zapobiegaj przepełnieniu długich treści.'],
    theory: ['`order` zmienia kolejność wizualną, ale nie powinien zastępować logicznej kolejności HTML.', 'Długie teksty i szerokie dzieci wymagają świadomego `min-width: 0`, `max-width` albo zawijania.'],
  },
  {
    order: 19,
    id: 'flex-patterns',
    title: 'Flexbox w praktyce',
    summary: 'Przenieś Flexbox do nawigacji, kart i paneli.',
    focus: 'nawigacja, rząd przycisków, karty, media-object i panel boczny',
    token: 'justify-content',
    tokenFile: 'baseCss',
    objectives: ['Rozpoznaj powtarzalne wzorce układu.', 'Łącz Flexbox z semantycznym HTML.'],
    theory: ['Nawigacja, toolbar i media-object często potrzebują jednej osi oraz kontrolowanego odstępu.', 'Karty mogą tworzyć wiersz, który po zmniejszeniu ekranu przechodzi w kolumnę.'],
  },
  {
    order: 20,
    id: 'grid-basics',
    title: 'Grid: siatka od podstaw',
    summary: 'Twórz kolumny i wiersze z fr, repeat i minmax.',
    focus: 'grid-template-columns, rows, fr, repeat, minmax i gap',
    token: 'display: grid',
    tokenFile: 'baseCss',
    objectives: ['Opisz siatkę kolumnami i wierszami.', 'Dobierz `fr`, `repeat()` i `minmax()` do treści.'],
    theory: ['Grid opisuje dwuwymiarową siatkę: możesz kontrolować jednocześnie kolumny i wiersze.', '`minmax()` pomaga zachować minimalną czytelność przy elastycznej szerokości.'],
  },
  {
    order: 21,
    id: 'grid-areas',
    title: 'Grid: obszary i złożone layouty',
    summary: 'Buduj layouty nazwane i świadomie wybieraj Grid albo Flexbox.',
    focus: 'grid-template-areas, grid-area, grid-column i grid-row',
    token: 'grid-template-areas',
    tokenFile: 'baseCss',
    objectives: ['Nazywaj obszary layoutu.', 'Rozpoznaj, kiedy dwuwymiarowy Grid jest czytelniejszy od Flexboxa.'],
    theory: ['`grid-template-areas` pozwala czytać większy layout jak mapę.', 'Flexbox pasuje do jednego kierunku, a Grid do relacji wiersz–kolumna.'],
  },
  {
    order: 22,
    id: 'responsive-layouts',
    title: 'Responsywne layouty',
    summary: 'Projektuj od małego ekranu i pilnuj braku poziomego overflow.',
    focus: '@media, mobile-first, elastyczne obrazy i breakpoint wynikający z treści',
    token: '@media',
    tokenFile: 'baseCss',
    objectives: ['Zaczynaj od układu mobilnego.', 'Sprawdzaj overflow oraz czytelność przy szerokości 390px.'],
    theory: ['Responsywność to nie tylko breakpointy — to również elastyczne szerokości, media i treści.', 'Najpierw zaprojektuj prosty układ dla małego ekranu, potem dodaj reguły dla większej przestrzeni.'],
  },
].map((topic) => ({ track: 'layout', ...topic }));

const layoutTasks = (definition, starter) => {
  const modes = [
    ['guided', 'Prowadzone'],
    ['independent', 'Samodzielnie'],
    ['challenge', 'Wyzwanie'],
  ];

  return modes.map(([mode, label], index) => createTask({
    id: `${definition.track}-${String(definition.order).padStart(2, '0')}-${mode}`,
    mode,
    title: `${label}: ${definition.focus}`,
    prompt: index === 0
      ? `Ustaw podstawy dla tematu „${definition.focus}”, a następnie uruchom podgląd.`
      : index === 1
        ? `Zbuduj własny układ ćwiczący ${definition.focus}. Zadbaj o logiczny DOM i brak przypadkowych marginów.`
        : `Rozwiąż problem layoutowy bez zmiany HTML: popraw ${definition.focus} tak, aby układ pozostał czytelny na wąskim ekranie.`,
    starter,
    solution: starter,
    checks: [
      check(`${definition.id}-${mode}-css`, 'sourceIncludes', 'Użyto właściwości layoutu', 'Wprowadź właściwość wskazaną w celu zadania.', { file: definition.tokenFile, value: definition.token }),
      ...(definition.order >= 22 ? [check(`${definition.id}-${mode}-overflow`, 'noHorizontalOverflow', 'Układ nie wychodzi poza viewport', 'Sprawdź szerokości dzieci, flex-wrap i obrazy.', { viewportWidth: 390 })] : []),
    ],
    hint: index === 2 ? 'Zmień jedną rzecz naraz i obserwuj, która reguła odpowiada za efekt.' : undefined,
  }));
};

const definitions = [
  {
    order: 1, id: 'html-three-layers', track: 'html', title: 'Internet, strona i trzy warstwy',
    summary: 'Zrozum rolę klienta, serwera, URL-a oraz HTML, CSS i JavaScriptu.',
    focus: 'trzy warstwy strony i nazwy plików', file: 'html', token: '<main',
    objectives: ['Rozróżniaj HTML, CSS i JavaScript.', 'Nazywaj pliki i opisz ich rolę w projekcie.'],
    theory: ['Przeglądarka pobiera dokument od serwera i interpretuje go jako strukturę, wygląd oraz zachowanie.', 'Dobre nazwy plików i rozdzielenie odpowiedzialności ułatwiają pracę całego zespołu.'],
  },
  {
    order: 2, id: 'html-document', track: 'html', title: 'Pierwszy dokument HTML5',
    summary: 'Zbuduj poprawny szkielet dokumentu HTML5.',
    focus: 'doctype, html, head, body, lang, meta i title', file: 'html', token: '<!doctype html',
    objectives: ['Utwórz pełny dokument HTML5.', 'Ustaw język, kodowanie i tytuł strony.'],
    theory: ['`<!doctype html>` uruchamia współczesny tryb renderowania. Element `head` zawiera metadane, a `body` treść dla użytkownika.', 'Atrybut `lang` pomaga technologiom asystującym i narzędziom rozpoznać język strony.'],
  },
  {
    order: 3, id: 'html-text', track: 'html', title: 'Tekst i hierarchia',
    summary: 'Używaj nagłówków, akapitów i semantycznego wyróżniania tekstu.',
    focus: 'h1–h6, p, strong, em, br, hr, sup i sub', file: 'html', token: '<h1',
    objectives: ['Buduj hierarchię nagłówków.', 'Odróżniaj znaczenie `strong` i `em` od samego wyglądu.'],
    theory: ['Nagłówki tworzą mapę dokumentu — zazwyczaj jedna strona ma jedno główne `h1`, a niższe poziomy opisują sekcje.', '`strong` i `em` niosą znaczenie; do dekoracji służy CSS, nie przypadkowe tagi tekstowe.'],
  },
  {
    order: 4, id: 'html-lists', track: 'html', title: 'Listy i zagnieżdżanie',
    summary: 'Twórz listy punktowane, numerowane i definicyjne.',
    focus: 'ul, ol, li, dl, dt, dd i poprawne zagnieżdżanie', file: 'html', token: '<ul',
    objectives: ['Dobierz typ listy do znaczenia danych.', 'Zagnieżdżaj listy bez łamania struktury HTML.'],
    theory: ['`ul` opisuje kolejność nieważną, `ol` — kolejność znaczącą, a `dl` — pary pojęcie–opis.', 'Element `li` powinien być bezpośrednim dzieckiem `ul` albo `ol`; taka konsekwencja pomaga czytnikom ekranu.'],
  },
  {
    order: 5, id: 'html-links', track: 'html', title: 'Linki i nawigacja',
    summary: 'Łącz dokumenty, sekcje i zewnętrzne zasoby.',
    focus: 'a, href, ścieżki, fragmenty, nav, target i rel', file: 'html', token: 'href=',
    objectives: ['Twórz linki wewnętrzne i zewnętrzne.', 'Dodaj bezpieczny `rel` przy nowej karcie.'],
    theory: ['Link powinien mieć zrozumiałą nazwę, a `href` wskazywać konkretny zasób lub fragment dokumentu.', '`target="_blank"` wymaga zwykle `rel="noreferrer"` albo `noopener`, aby ograniczyć dostęp otwieranej strony do okna źródłowego.'],
  },
  {
    order: 6, id: 'html-media', track: 'html', title: 'Obrazy i multimedia',
    summary: 'Dodawaj media z tekstem alternatywnym i kontrolkami.',
    focus: 'img, alt, figure, figcaption, audio, video i source', file: 'html', token: 'alt=',
    objectives: ['Dodaj opis alternatywny obrazka.', 'Zachowaj proporcje i kontrolki multimediów.'],
    theory: ['`alt` opisuje sens obrazu, a pusty `alt=""` jest poprawny dla dekoracji.', 'Atrybuty `width` i `height` pomagają zarezerwować miejsce przed załadowaniem mediów i ograniczają przesunięcia layoutu.'],
  },
  {
    order: 7, id: 'html-tables', track: 'html', title: 'Tabele i dane',
    summary: 'Oznaczaj nagłówki, zakresy i grupy danych tabelarycznych.',
    focus: 'table, caption, thead, tbody, th, td i scope', file: 'html', token: '<table',
    objectives: ['Używaj tabel tylko do danych tabelarycznych.', 'Dodaj `caption` oraz `scope` do nagłówków.'],
    theory: ['Tabela opisuje relacje między wierszami i kolumnami, nie służy do budowania ogólnego layoutu strony.', '`scope="col"` i `scope="row"` pomagają połączyć komórkę nagłówka z właściwymi danymi.'],
  },
  {
    order: 8, id: 'html-forms', track: 'html', title: 'Formularze i walidacja',
    summary: 'Zbieraj dane przez label, input, select, textarea i button.',
    focus: 'form, label, input, select, textarea, button i required', file: 'html', token: '<label',
    objectives: ['Połącz etykietę z kontrolką.', 'Włącz natywną walidację tam, gdzie ma sens.'],
    theory: ['Każda kontrolka powinna mieć widoczną lub programowo powiązaną etykietę.', 'Atrybuty `type`, `name`, `required`, `minlength` i `pattern` pozwalają przeglądarce pomóc użytkownikowi jeszcze przed kodem JavaScript.'],
  },
  {
    order: 9, id: 'html-semantics', track: 'html', title: 'Semantyka i dostępność',
    summary: 'Układaj stronę z header, main, section, article, aside i footer.',
    focus: 'semantyczne landmarks, focus, kontrast i natywne kontrolki', file: 'html', token: '<main',
    objectives: ['Dobierz semantyczny element do roli treści.', 'Zadbaj o klawiaturę, fokus i kontrast.'],
    theory: ['Semantyka daje przeglądarce i technologii asystującej mapę strony bez dodatkowych atrybutów.', 'Najpierw korzystaj z natywnych elementów, a ARIA dodawaj wtedy, gdy natywna semantyka nie wystarcza.'],
  },
  {
    order: 10, id: 'css-intro', track: 'css', title: 'CSS i dołączanie arkuszy',
    summary: 'Poznaj selektor, właściwość, wartość i kolejność arkuszy.',
    focus: 'link, selektor, właściwość, wartość i komentarz CSS', file: 'baseCss', token: 'color:',
    objectives: ['Rozdziel strukturę HTML od wyglądu CSS.', 'Rozumiej, który arkusz wygrywa w kaskadzie.'],
    theory: ['Reguła CSS łączy selektor z deklaracjami właściwości i wartości.', 'Dwa arkusze w laboratorium mają cel dydaktyczny: `base.css` trzyma fundamenty, a `theme.css` pozwala ćwiczyć warstwę wizualną.'],
  },
  {
    order: 11, id: 'css-selectors', track: 'css', title: 'Selektory i kaskada',
    summary: 'Wybieraj elementy i przewiduj wynik kaskady.',
    focus: 'element, class, id, atrybuty, potomkowie i pseudoklasy', file: 'baseCss', token: '.',
    objectives: ['Dobieraj selektor o najmniejszej potrzebnej specyficzności.', 'Unikaj `!important` jako pierwszego rozwiązania.'],
    theory: ['Specyficzność, kolejność reguł i dziedziczenie wspólnie decydują o finalnym stylu.', 'Klasa jest zwykle dobrym narzędziem do wielokrotnego stylowania komponentów; `id` zostaw dla unikalnej tożsamości lub kotwic.'],
  },
  {
    order: 12, id: 'css-type-colors', track: 'css', title: 'Jednostki, kolory i typografia',
    summary: 'Dobieraj jednostki, kolory, fonty i custom properties.',
    focus: 'rem, %, vw, font-size, line-height, text-align i zmienne CSS', file: 'themeCss', token: '--',
    objectives: ['Odróżniaj jednostki zależne od rodzica i viewportu.', 'Zbuduj mały zestaw custom properties.'],
    theory: ['`rem` daje skalowalny rytm względem rozmiaru root, a `%`, `vw` i `vh` odnoszą się do kontekstu elementu lub viewportu.', 'Zmienne CSS opisują decyzję projektową raz i pozwalają użyć jej w wielu komponentach.'],
  },
  {
    order: 13, id: 'css-box-model', track: 'css', title: 'Model pudełkowy',
    summary: 'Zrozum content, padding, border, margin i box-sizing.',
    focus: 'content, padding, border, margin, width, height i box-sizing', file: 'baseCss', token: 'box-sizing',
    objectives: ['Policz rzeczywistą szerokość pudełka.', 'Stosuj `border-box` dla przewidywalnych wymiarów.'],
    theory: ['Rozmiar elementu składa się z content, paddingu i obramowania, a margin tworzy przestrzeń na zewnątrz.', 'Globalne `box-sizing: border-box` sprawia, że width obejmuje padding i border.'],
  },
  {
    order: 14, id: 'css-display-position', track: 'css', title: 'Wyświetlanie, pozycjonowanie i powierzchnie',
    summary: 'Steruj display, position, tłem, obramowaniem i overflow.',
    focus: 'display, position, z-index, background, border-radius i overflow', file: 'baseCss', token: 'display:',
    objectives: ['Odróżniaj normal flow od pozycjonowania.', 'Użyj overflow świadomie, nie do maskowania błędu.'],
    theory: ['`display` definiuje sposób uczestnictwa elementu w layoutcie, a `position` zmienia punkt odniesienia dla przesunięć.', '`overflow` powinno wynikać z decyzji projektowej, a nie ukrywać przypadkowo szeroką treść.'],
  },
  ...layoutTopics,
  {
    order: 23, id: 'css-motion-project', track: 'css', title: 'Przejścia, animacje i projekt końcowy',
    summary: 'Dodaj spokojny ruch, stany interakcji i checklistę jakości.',
    focus: 'transition, hover, focus, keyframes i prefers-reduced-motion', file: 'themeCss', token: 'transition:',
    objectives: ['Animuj zmianę stanu, nie dekoruj wszystkiego ruchem.', 'Uszanuj `prefers-reduced-motion`.'],
    theory: ['`transition` wygładza zmianę wartości, a `@keyframes` opisuje sekwencję animacji.', 'Ruch powinien wspierać orientację i informację zwrotną; użytkownik może poprosić o ograniczenie animacji.'],
  },
  {
    order: 24, id: 'js-browser', track: 'js', title: 'JavaScript w przeglądarce',
    summary: 'Uruchamiaj skrypt, loguj bezpiecznie i deklaruj dane.',
    focus: 'script, console, const, let i podstawowe typy', file: 'js', token: 'const',
    objectives: ['Rozróżniaj dane stałe i zmienne.', 'Loguj wartości bez ujawniania przypadkowych obiektów.'],
    theory: ['JavaScript dodaje zachowanie po stronie przeglądarki, ale nie powinien zastępować semantycznego HTML.', 'Zaczynaj od `const`, a po `let` sięgaj wtedy, gdy wartość naprawdę będzie zmieniana.'],
  },
  {
    order: 25, id: 'js-conditions-functions', track: 'js', title: 'Warunki i funkcje',
    summary: 'Podejmuj decyzje i zamykaj powtarzalną logikę w funkcjach.',
    focus: 'if, else, operatory, parametry i return', file: 'js', token: 'function',
    objectives: ['Rozbij logikę na małe funkcje.', 'Zwracaj wynik zamiast polegać na ukrytym stanie.'],
    theory: ['Warunek opisuje decyzję, a funkcja nadaje nazwę powtarzalnej operacji.', 'Czytelne parametry i wartości zwracane ułatwiają testowanie kodu.'],
  },
  {
    order: 26, id: 'js-data-loops', track: 'js', title: 'Tablice, obiekty i pętle',
    summary: 'Pracuj z danymi i przekształcaj je bez duplikacji.',
    focus: 'tablice, obiekty, for, for...of, map i filter', file: 'js', token: '.map(',
    objectives: ['Wybierz metodę pasującą do celu.', 'Nie mieszaj transformowania danych z renderowaniem.'],
    theory: ['`map` tworzy nową tablicę, `filter` wybiera elementy, a pętla może być dobrym wyborem dla efektów ubocznych.', 'Obiekt grupuje powiązane dane; nazwij właściwości tak, aby nie trzeba było komentować oczywistości.'],
  },
  {
    order: 27, id: 'js-dom', track: 'js', title: 'DOM i renderowanie',
    summary: 'Znajduj elementy i aktualizuj widok bez utraty semantyki.',
    focus: 'querySelector, textContent, classList i tworzenie elementów', file: 'js', token: 'querySelector',
    objectives: ['Wybieraj elementy przez stabilne selektory.', 'Preferuj `textContent` dla zwykłego tekstu.'],
    theory: ['DOM jest obiektem reprezentującym dokument; JavaScript może zmieniać jego tekst, klasy, atrybuty i dzieci.', '`innerHTML` jest wygodne, ale przy danych użytkownika wymaga ostrożności — zwykły tekst powinien trafiać do `textContent`.'],
  },
  {
    order: 28, id: 'js-events-forms', track: 'js', title: 'Zdarzenia i formularze',
    summary: 'Reaguj na click, input i submit oraz czytaj wartości pól.',
    focus: 'addEventListener, click, input, submit i preventDefault', file: 'js', token: 'addEventListener',
    objectives: ['Podłącz handler do właściwego zdarzenia.', 'Kontroluj zachowanie formularza bez blokowania klawiatury.'],
    theory: ['Zdarzenie opisuje coś, co zaszło w przeglądarce; handler powinien robić jedną, zrozumiałą rzecz.', '`preventDefault()` stosuj wtedy, gdy przejmujesz zachowanie formularza i zapewniasz równoważną informację zwrotną.'],
  },
  {
    order: 29, id: 'js-small-state', track: 'js', title: 'Stan małej aplikacji',
    summary: 'Zaprojektuj jeden obiekt stanu i funkcję render.',
    focus: 'obiekt stanu, render, filtrowanie listy i empty state', file: 'js', token: 'render',
    objectives: ['Trzymaj źródło prawdy w jednym miejscu.', 'Renderuj także stan pusty.'],
    theory: ['Stan to dane, które opisują aktualny widok; `render` powinien wyprowadzać UI ze stanu zamiast dopisywać przypadkowe fragmenty.', 'Stan pusty jest częścią przepływu, nie błędem do ukrycia.'],
  },
  {
    order: 30, id: 'js-validation-storage', track: 'js', title: 'Walidacja, błędy i localStorage',
    summary: 'Waliduj dane i bezpiecznie obsługuj zapis lokalny.',
    focus: 'try/catch, JSON.stringify, JSON.parse i localStorage', file: 'js', token: 'localStorage',
    objectives: ['Pokaż użytkownikowi zrozumiały błąd.', 'Nie zakładaj, że dane w localStorage są poprawne.'],
    theory: ['Dane z przeglądarki są wejściem zewnętrznym — mogą być puste, stare albo uszkodzone.', '`try/catch` powinien prowadzić do bezpiecznego stanu awaryjnego, a nie do cichego połknięcia problemu.'],
  },
  {
    order: 31, id: 'js-event-planner', track: 'js', title: 'Projekt końcowy: planer wydarzenia',
    summary: 'Połącz semantyczny HTML, dwa arkusze, formularz i interakcje.',
    focus: 'formularz wydarzenia, tabela zadań, responsywność i checklista jakości', file: 'js', token: 'addEventListener',
    objectives: ['Połącz strukturę, styl i zachowanie w małą aplikację.', 'Przejdź checklistę semantyki, klawiatury i responsywności.'],
    theory: ['Projekt końcowy nie wymaga biblioteki — wymaga dobrego podziału odpowiedzialności między plikami.', 'Najpierw zaplanuj dane i stany, potem implementuj najmniejszy działający przepływ.'],
  },
  {
    order: 32, id: 'react-jsx', track: 'react', title: 'React i JSX w sandboxie',
    summary: 'Uruchom komponent root i poznaj różnicę między HTML a JSX.',
    focus: 'React, JSX, ReactDOM.createRoot i renderowanie', file: 'js', token: 'ReactDOM.createRoot',
    objectives: ['Wyrenderuj komponent do elementu root.', 'Zapisuj atrybuty JSX zgodnie z regułami Reacta.'],
    theory: ['JSX jest składnią opisującą drzewo elementów, które React zamienia na DOM.', 'W tym sandboxie `React` i `ReactDOM` są dostępne lokalnie jako globalne obiekty — nie używamy importów npm w kodzie ucznia.'],
  },
  {
    order: 33, id: 'react-components-props', track: 'react', title: 'Komponenty i props',
    summary: 'Rozbij widok na funkcje i przekazuj dane przez props.',
    focus: 'komponenty funkcyjne, props, children i kompozycja', file: 'js', token: 'props',
    objectives: ['Wydziel komponent z jedną odpowiedzialnością.', 'Przekaż dane zamiast kopiować markup.'],
    theory: ['Komponent opisuje fragment interfejsu i może być używany ponownie.', 'Props płyną z rodzica do dziecka; dziecko nie powinno po cichu mutować danych rodzica.'],
  },
  {
    order: 34, id: 'react-state-events', track: 'react', title: 'Stan i zdarzenia',
    summary: 'Zmieniaj widok przez useState i zdarzenia użytkownika.',
    focus: 'useState, onClick, formularze i ponowne renderowanie', file: 'js', token: 'useState',
    objectives: ['Aktualizuj stan funkcją settera.', 'Pokaż użytkownikowi zmianę po akcji.'],
    theory: ['Stan opisuje wartości, które mogą się zmieniać, a setter informuje Reacta o potrzebie ponownego renderu.', 'Handler zdarzenia otrzymuje zdarzenie i może wywołać zmianę stanu bez ręcznej manipulacji DOM.'],
  },
  {
    order: 35, id: 'react-lists-conditions', track: 'react', title: 'Listy i warunkowe renderowanie',
    summary: 'Mapuj dane, dodawaj key i projektuj empty state.',
    focus: 'map, key, filtrowanie i operator warunkowy', file: 'js', token: '.map(',
    objectives: ['Nadaj stabilne `key` elementom listy.', 'Obsłuż stan pusty i brak wyników.'],
    theory: ['`map` pozwala wyprowadzić listę elementów z danych; `key` pomaga Reactowi rozpoznać, co się zmieniło.', 'Warunkowy widok powinien być czytelny także wtedy, gdy lista nie ma elementów.'],
  },
  {
    order: 36, id: 'react-controlled-forms', track: 'react', title: 'Formularze kontrolowane',
    summary: 'Powiąż value, onChange, submit i walidację ze stanem.',
    focus: 'value, onChange, onSubmit, walidacja i reset', file: 'js', token: 'onChange',
    objectives: ['Trzymaj wartość kontrolki w stanie.', 'Pokaż błąd i wyczyść formularz po sukcesie.'],
    theory: ['Kontrolowany input ma jedno źródło prawdy — stan Reacta.', 'Walidacja powinna być informacją dla użytkownika, nie tylko warunkiem blokującym wysłanie.'],
  },
  {
    order: 37, id: 'react-effects-data', track: 'react', title: 'Efekty i przepływ danych',
    summary: 'Używaj useEffect do synchronizacji i sprzątania.',
    focus: 'useEffect, zależności, cleanup i unikanie pętli renderowania', file: 'js', token: 'useEffect',
    objectives: ['Rozróżniaj render od efektu ubocznego.', 'Dobierz zależności i funkcję cleanup.'],
    theory: ['Efekt służy do synchronizacji z czymś poza samym renderem, np. timerem lub API przeglądarki.', 'Jeśli efekt ustawia stan, sprawdź zależności, aby nie stworzyć nieskończonej pętli.'],
  },
  {
    order: 38, id: 'react-composition-hooks', track: 'react', title: 'Kompozycja i własne hooki',
    summary: 'Podnoś stan, przekazuj callbacki i wyciągaj powtarzalną logikę.',
    focus: 'lifting state up, callbacki, children i custom hook', file: 'js', token: 'use',
    objectives: ['Przenieś stan do wspólnego rodzica.', 'Wydziel custom hook bez ukrywania kontraktu.'],
    theory: ['Lifting state up pozwala dwóm komponentom korzystać z jednej wartości źródłowej.', 'Własny hook powinien mieć jasną nazwę `use...` i zwracać mały, przewidywalny interfejs.'],
  },
  {
    order: 39, id: 'react-task-board', track: 'react', title: 'Projekt końcowy: React task board',
    summary: 'Zbuduj tablicę zadań z komponentami, filtrowaniem i stanem.',
    focus: 'komponenty, stan, formularz, filtrowanie, RWD i prosty zapis', file: 'js', token: 'ReactDOM.createRoot',
    objectives: ['Zaplanuj przepływ danych całej aplikacji.', 'Połącz dobry layout z zachowaniem i dostępnością.'],
    theory: ['Projekt końcowy łączy wcześniejsze klocki: komponenty, stan, formularz, listę, warunki i CSS layout.', 'Najpierw zaprojektuj dane i interakcje, potem rozdziel UI na komponenty, które łatwo sprawdzić osobno.'],
  },
];

const contentMetadata = new Map([
  ...htmlLessons,
  ...cssLessons,
  ...layoutLessons,
  ...jsLessons,
  ...reactLessons,
].map((content) => [content.order, content]));

export const lessons = definitions.map((definition) => {
  const starter = standardStarter(definition.track, definition.order, definition.title);
  const tasks = definition.track === 'layout'
    ? layoutTasks(definition, starter)
    : standardTasks(definition, starter);
  const content = contentMetadata.get(definition.order) || {};

  return createLesson({
    ...definition,
    ...content,
    starter,
    solution: starter,
    tasks,
  });
});
