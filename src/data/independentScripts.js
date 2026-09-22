import { createTask } from './lessonFactories.js';
import { reactProjectFor } from './reactProjects.js';

const exists = (selector, label) => ({ type: 'elementExists', selector, label });
const text = (selector, expected, label) => ({ type: 'textEquals', selector, expected, label });
const click = (selector, resultSelector, beforeText, textEquals, label) => ({ type: 'interaction', selector, resultSelector, expected: { beforeText, textEquals }, label });

const jsRecipes = {
  24: {
    title: 'Koszt zamówienia', prompt: 'W script.js zadeklaruj cenę 12 i liczbę sztuk 3. Oblicz ich iloczyn i wyświetl „36 zł” w elemencie output z id="total". Nie wpisuj wyniku bezpośrednio w HTML.',
    html: '<main><h1>Zamówienie</h1><output id="total"></output></main>',
    code: 'const price = 12; const quantity = 3; document.querySelector("#total").textContent = `${price * quantity} zł`;',
    checks: [text('output#total', '36 zł', 'W polu wyniku pokaż obliczony koszt: 36 zł.')],
  },
  25: {
    title: 'Próg zaliczenia', prompt: 'Napisz funkcję passed(score), która zwraca „Zaliczone” dla score >= 50, a „Poprawa” poniżej 50. Wywołaj ją dla 49 i 50; wyniki wpisz odpowiednio do akapitów z id="below" i id="boundary".',
    html: '<main><h1>Wyniki</h1><p id="below"></p><p id="boundary"></p></main>',
    code: 'function passed(score) { return score >= 50 ? "Zaliczone" : "Poprawa"; } document.querySelector("#below").textContent = passed(49); document.querySelector("#boundary").textContent = passed(50);',
    checks: [text('#below', 'Poprawa', 'Dla wyniku 49 pokaż „Poprawa” w akapicie below.'), text('#boundary', 'Zaliczone', 'Dla granicznego wyniku 50 pokaż „Zaliczone” w akapicie boundary.')],
  },
  26: {
    title: 'Filtrowanie liczb', prompt: 'Utwórz tablicę [2, 7, 4, 9]. Za pomocą filter wybierz liczby większe od 5 i połącz je przez join(", "). Wpisz wynik do elementu output z id="filtered".',
    html: '<main><h1>Liczby większe od 5</h1><output id="filtered"></output></main>',
    code: 'const numbers = [2, 7, 4, 9]; document.querySelector("#filtered").textContent = numbers.filter(n => n > 5).join(", ");',
    checks: [text('#filtered', '7, 9', 'Wynik filtrowania to dokładnie „7, 9”; nie pokazuj odrzuconych liczb.')],
  },
  27: {
    title: 'Link utworzony w DOM', prompt: 'W script.js utwórz przez createElement link <a>. Ustaw mu tekst „Dokumentacja”, href="https://developer.mozilla.org/", target="_blank" i rel="noopener". Dodaj go do akapitu z id="links".',
    html: '<main><h1>Przydatne materiały</h1><p id="links"></p></main>',
    code: 'const link = document.createElement("a"); link.textContent = "Dokumentacja"; link.href = "https://developer.mozilla.org/"; link.target = "_blank"; link.rel = "noopener"; document.querySelector("#links").append(link);',
    checks: [exists('#links > a[href="https://developer.mozilla.org/"][target="_blank"][rel~="noopener"]', 'W akapicie links ma pojawić się bezpieczny link do dokumentacji w nowej karcie.'), text('#links > a', 'Dokumentacja', 'Tekst linku ma brzmieć „Dokumentacja”.')],
  },
  28: {
    title: 'Przełącznik informacji', prompt: 'Przycisk z id="toggle" ma przełączać tekst akapitu status między „Ukryte” a „Widoczne”. Zacznij od „Ukryte”. Użyj addEventListener i zmiennej opisującej stan.',
    html: '<main><button id="toggle">Zmień widoczność</button><p id="status">Ukryte</p></main>',
    code: 'let visible = false; document.querySelector("#toggle").addEventListener("click", () => { visible = !visible; document.querySelector("#status").textContent = visible ? "Widoczne" : "Ukryte"; });',
    checks: [click('#toggle', '#status', 'Ukryte', 'Widoczne', 'Przed kliknięciem tekst brzmi „Ukryte”, po kliknięciu „Widoczne”.')],
  },
  29: {
    title: 'Usuwanie ze stanu', prompt: 'Zacznij od state.items = ["HTML", "CSS"]. Funkcja render() pokazuje je w output z id="remaining", rozdzielone przecinkiem i spacją. Przycisk remove usuwa ostatni element tablicy przez pop() i ponownie wywołuje render().',
    html: '<main><button id="remove">Usuń ostatni</button><output id="remaining"></output></main>',
    code: 'const state = {items: ["HTML", "CSS"]}; function render() { document.querySelector("#remaining").textContent = state.items.join(", "); } document.querySelector("#remove").addEventListener("click", () => { state.items.pop(); render(); }); render();',
    checks: [click('#remove', '#remaining', 'HTML, CSS', 'HTML', 'Lista początkowo pokazuje „HTML, CSS”; po usunięciu zostaje samo „HTML”.')],
  },
  30: {
    title: 'Odzyskiwanie po błędnym JSON', prompt: 'Przetwórz tekst "{broken}" przez JSON.parse w try/catch. W catch pokaż „Błędne dane” w akapicie error i ustaw pustą tablicę zastępczą. W output z id="count" pokaż jej długość, czyli 0. Nie pozwól, aby błąd zatrzymał skrypt.',
    html: '<main><p id="error"></p><output id="count"></output></main>',
    code: 'let items; try { items = JSON.parse("{broken}"); } catch { items = []; document.querySelector("#error").textContent = "Błędne dane"; } document.querySelector("#count").textContent = String(items.length);',
    checks: [text('#error', 'Błędne dane', 'Pokaż komunikat „Błędne dane” w akapicie error.'), text('#count', '0', 'Po obsłużeniu błędu pokaż 0 elementów danych.')],
  },
  31: {
    title: 'Filtr planera', prompt: 'Utwórz tablicę wydarzeń: HTML z done: true oraz CSS z done: false. Najpierw pokaż „HTML, CSS” w output z id="events". Kliknięcie przycisku upcoming ma odfiltrować ukończone wydarzenia i pokazać tylko „CSS”. Oddziel dane od funkcji render().',
    html: '<main><h1>Planer</h1><button id="upcoming">Tylko do zrobienia</button><output id="events"></output></main>',
    code: 'const events = [{title:"HTML", done:true}, {title:"CSS", done:false}]; function render(items) { document.querySelector("#events").textContent = items.map(item => item.title).join(", "); } document.querySelector("#upcoming").addEventListener("click", () => render(events.filter(item => !item.done))); render(events);',
    checks: [click('#upcoming', '#events', 'HTML, CSS', 'CSS', 'Filtr zmienia listę „HTML, CSS” na samo „CSS”.')],
  },
};

const reactRecipes = {
  32: {
    title: 'Profil w JSX', prompt: 'W App.jsx zbuduj komponent App. W <article id="profile"> umieść <h1> z wartością zmiennej name = "Ola", akapit <p> z opisem oraz obraz <img> z niepustym alt. Użyj lokalnego obrazu /course-assets/04-flexbox-grid.svg.',
    checks: [text('#profile > h1', 'Ola', 'Nagłówek profilu pokazuje imię Ola.'), exists('#profile > p', 'W profilu jest akapit opisu.'), exists('#profile > img[alt]:not([alt=""])', 'Obraz w profilu ma niepusty tekst alternatywny.')],
  },
  33: {
    title: 'Dwie karty z jednego komponentu', prompt: 'Uzupełnij eksportowany komponent Course({title, children}) w components/Course.jsx. W App.jsx zaimportuj go i wyrenderuj sekcję id="courses" z dwiema kartami: HTML z opisem „Struktura” i CSS z opisem „Wygląd”. Opisy przekazuj jako <p> w children.',
    checks: [text('#courses > article:first-child > h2', 'HTML', 'Pierwsza karta ma nagłówek HTML.'), text('#courses > article:first-child > p', 'Struktura', 'Opis pierwszej karty brzmi „Struktura”.'), text('#courses > article:nth-child(2) > h2', 'CSS', 'Druga karta ma nagłówek CSS.'), text('#courses > article:nth-child(2) > p', 'Wygląd', 'Opis drugiej karty brzmi „Wygląd”.')],
  },
  34: {
    title: 'Przełącznik motywu', prompt: 'W App.jsx zaimportuj useState z react i użyj useState(false) do zbudowania przełącznika. Przycisk theme początkowo ma tekst „Dzień” i aria-pressed="false". Po kliknięciu ma pokazać „Noc” oraz aria-pressed="true". Kolejne kliknięcie odwraca stan.',
    checks: [{ ...click('#theme', '#theme', 'Dzień', 'Noc', 'Kliknięcie zmienia Dzień na Noc i włącza aria-pressed.'), expected: { beforeText: 'Dzień', textEquals: 'Noc', attribute: { name: 'aria-pressed', value: 'true' } } }],
  },
  35: {
    title: 'Lista bez ukończonych zadań', prompt: 'W App.jsx z tablicy [{id: 1, title: "HTML", done: true}, {id: 2, title: "CSS", done: false}] wybierz nieukończone zadania przez filter. W ul z id="pending" wyrenderuj je przez map jako li ze stabilnym key. Nie pokazuj ukończonego HTML.',
    checks: [text('#pending', 'CSS', 'Lista pokazuje wyłącznie CSS.'), exists('ul#pending:has(> li):not(:has(> li:nth-child(2)))', 'Lista zawiera dokładnie jeden punkt li.')],
  },
  36: {
    title: 'Licznik znaków formularza', prompt: 'W App.jsx zbuduj kontrolowane pole input z id="name", połączoną etykietę label i output z id="length". Pokazuj długość wartości po trim(): puste pole daje 0, a wpisanie „ Ola ” daje 3. Spacje na krańcach nie liczą się.',
    checks: [exists('label[for="name"]', 'Pole imienia ma połączoną etykietę.'), { type: 'interaction', selector: '#name', resultSelector: '#length', action: 'input', value: ' Ola ', expected: { beforeText: '0', textEquals: '3' }, label: 'Po wpisaniu „ Ola ” licznik zmienia się z 0 na 3.' }],
  },
  37: {
    title: 'Synchronizacja tytułu dokumentu', prompt: 'W App.jsx utwórz licznik zaczynający od 0 i przycisk add. Zaimportuj useEffect i useState z react. Użyj efektu zależnego od licznika, aby ustawiać document.title na „Kliknięcia: 0”, potem „Kliknięcia: 1” po kliknięciu. Tytuł sprawdzamy w dokumencie iframe, nie w karcie całego kursu.',
    checks: [click('#add', 'head > title', 'Kliknięcia: 0', 'Kliknięcia: 1', 'Kliknięcie aktualizuje tytuł dokumentu z „Kliknięcia: 0” na „Kliknięcia: 1”.')],
  },
  38: {
    title: 'Własny hook przełączający opis', prompt: 'Napisz hook useToggle w hooks/useToggle.js i komponent Details w components/Details.jsx przyjmujący open oraz onToggle. Zaimportuj oba do App.jsx. Przycisk toggle przełącza stan, a akapit details pokazuje początkowo „Zamknięte”, po kliknięciu „Opis kursu”.',
    checks: [click('#toggle', '#details', 'Zamknięte', 'Opis kursu', 'Przycisk zmienia komunikat „Zamknięte” na „Opis kursu”.')],
  },
  39: {
    title: 'Usuwanie z tablicy zadań', prompt: 'W App.jsx rozpocznij ze stanem [{id: 1, title: "HTML"}]. W components/TaskItem.jsx wyrenderuj zadanie i przycisk remove, a komponent zaimportuj do App.jsx. Kliknięcie usuwa obiekt przez filter, pozostawia pustą listę i zmienia akapit status z „1 zadanie” na „Brak zadań”.',
    checks: [click('#remove', '#status', '1 zadanie', 'Brak zadań', 'Usunięcie ostatniego zadania zmienia status z „1 zadanie” na „Brak zadań”.'), exists('ul#tasks:not(:has(li))', 'Po usunięciu lista zadań nie zawiera punktów li.')],
  },
};

export function independentScriptTask(definition, base) {
  const react = definition.track === 'react';
  const recipe = (react ? reactRecipes : jsRecipes)[definition.order];
  const id = `${definition.track}-${String(definition.order).padStart(2, '0')}-independent-v2`;
  const starter = react
    ? reactProjectFor(definition.order, 'independent', 'starter')
    : { ...base, html: recipe.html, js: '// Napisz własne rozwiązanie.\n' };
  const solution = react
    ? reactProjectFor(definition.order, 'independent', 'solution')
    : { ...starter, js: recipe.code };
  const checks = [...recipe.checks, { type: 'runtimeError', label: 'Kod działa bez błędów.' }];
  if (react) checks.unshift({ type: 'reactRendered', selector: '#root', label: 'Komponent React został zamontowany w elemencie root.' });
  return createTask({
    id, mode: 'independent', title: recipe.title,
    track: definition.track,
    prompt: react
      ? `${recipe.prompt} Punkt wejścia main.jsx jest gotowy; zachowaj istniejące importy i eksporty.`
      : `Pracuj w script.js. ${recipe.prompt} HTML jest przygotowany; zachowaj jego identyfikatory.`,
    starter, solution,
    checks: checks.map((check, index) => ({ ...check, id: `${id}-${index}` })),
  });
}
