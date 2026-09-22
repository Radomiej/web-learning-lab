import { createTask } from './lessonFactories.js';

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
    title: 'Profil w JSX', prompt: 'W script.js zbuduj komponent App. W <article id="profile"> umieść <h1> z wartością zmiennej name = "Ola", akapit <p> z opisem oraz obraz <img> z niepustym alt. Użyj lokalnego obrazu /course-assets/04-flexbox-grid.svg.',
    code: 'const name = "Ola"; function App() { return <article id="profile"><h1>{name}</h1><p>Uczę się Reacta.</p><img src="/course-assets/04-flexbox-grid.svg" alt="Układy stron" /></article>; }',
    checks: [text('#profile > h1', 'Ola', 'Nagłówek profilu pokazuje imię Ola.'), exists('#profile > p', 'W profilu jest akapit opisu.'), exists('#profile > img[alt]:not([alt=""])', 'Obraz w profilu ma niepusty tekst alternatywny.')],
  },
  33: {
    title: 'Dwie karty z jednego komponentu', prompt: 'Utwórz komponent Course({title, children}) zwracający article z h2 i treścią children. W App wyrenderuj sekcję id="courses" z dwiema kartami: HTML z opisem „Struktura” i CSS z opisem „Wygląd”. Opisy przekazuj jako <p> w children.',
    code: 'function Course({title, children}) { return <article><h2>{title}</h2>{children}</article>; } function App() { return <section id="courses"><Course title="HTML"><p>Struktura</p></Course><Course title="CSS"><p>Wygląd</p></Course></section>; }',
    checks: [text('#courses > article:first-child > h2', 'HTML', 'Pierwsza karta ma nagłówek HTML.'), text('#courses > article:first-child > p', 'Struktura', 'Opis pierwszej karty brzmi „Struktura”.'), text('#courses > article:nth-child(2) > h2', 'CSS', 'Druga karta ma nagłówek CSS.'), text('#courses > article:nth-child(2) > p', 'Wygląd', 'Opis drugiej karty brzmi „Wygląd”.')],
  },
  34: {
    title: 'Przełącznik motywu', prompt: 'Użyj useState(false) do zbudowania przełącznika. Przycisk theme początkowo ma tekst „Dzień” i aria-pressed="false". Po kliknięciu ma pokazać „Noc” oraz aria-pressed="true". Kolejne kliknięcie odwraca stan.',
    code: 'function App() { const [dark, setDark] = React.useState(false); return <button id="theme" aria-pressed={dark} onClick={() => setDark(value => !value)}>{dark ? "Noc" : "Dzień"}</button>; }',
    checks: [{ ...click('#theme', '#theme', 'Dzień', 'Noc', 'Kliknięcie zmienia Dzień na Noc i włącza aria-pressed.'), expected: { beforeText: 'Dzień', textEquals: 'Noc', attribute: { name: 'aria-pressed', value: 'true' } } }],
  },
  35: {
    title: 'Lista bez ukończonych zadań', prompt: 'Z tablicy [{id: 1, title: "HTML", done: true}, {id: 2, title: "CSS", done: false}] wybierz nieukończone zadania przez filter. W ul z id="pending" wyrenderuj je przez map jako li ze stabilnym key. Nie pokazuj ukończonego HTML.',
    code: 'function App() { const tasks = [{id:1,title:"HTML",done:true},{id:2,title:"CSS",done:false}]; return <ul id="pending">{tasks.filter(task => !task.done).map(task => <li key={task.id}>{task.title}</li>)}</ul>; }',
    checks: [text('#pending', 'CSS', 'Lista pokazuje wyłącznie CSS.'), exists('ul#pending:has(> li):not(:has(> li:nth-child(2)))', 'Lista zawiera dokładnie jeden punkt li.')],
  },
  36: {
    title: 'Licznik znaków formularza', prompt: 'Zbuduj kontrolowane pole input z id="name", połączoną etykietę label i output z id="length". Pokazuj długość wartości po trim(): puste pole daje 0, a wpisanie „ Ola ” daje 3. Spacje na krańcach nie liczą się.',
    code: 'function App() { const [name, setName] = React.useState(""); return <form onSubmit={event => event.preventDefault()}><label htmlFor="name">Imię</label><input id="name" value={name} onChange={event => setName(event.target.value)} /><output id="length">{name.trim().length}</output></form>; }',
    checks: [exists('label[for="name"]', 'Pole imienia ma połączoną etykietę.'), { type: 'interaction', selector: '#name', resultSelector: '#length', action: 'input', value: ' Ola ', expected: { beforeText: '0', textEquals: '3' }, label: 'Po wpisaniu „ Ola ” licznik zmienia się z 0 na 3.' }],
  },
  37: {
    title: 'Synchronizacja tytułu dokumentu', prompt: 'W App utwórz licznik zaczynający od 0 i przycisk add. Użyj useEffect zależnego od licznika, aby ustawiać document.title na „Kliknięcia: 0”, potem „Kliknięcia: 1” po kliknięciu. Tytuł sprawdzamy w dokumencie iframe, nie w karcie całego kursu.',
    code: 'function App() { const [count, setCount] = React.useState(0); React.useEffect(() => { document.title = `Kliknięcia: ${count}`; }, [count]); return <button id="add" onClick={() => setCount(value => value + 1)}>Dodaj kliknięcie</button>; }',
    checks: [click('#add', 'head > title', 'Kliknięcia: 0', 'Kliknięcia: 1', 'Kliknięcie aktualizuje tytuł dokumentu z „Kliknięcia: 0” na „Kliknięcia: 1”.')],
  },
  38: {
    title: 'Własny hook przełączający opis', prompt: 'Napisz hook useToggle i komponent Details przyjmujący open oraz onToggle. App łączy je ze sobą. Przycisk toggle przełącza stan, a akapit details pokazuje początkowo „Zamknięte”, po kliknięciu „Opis kursu”.',
    code: 'function useToggle() { const [open, setOpen] = React.useState(false); return [open, () => setOpen(value => !value)]; } function Details({open, onToggle}) { return <section><button id="toggle" onClick={onToggle}>Przełącz opis</button><p id="details">{open ? "Opis kursu" : "Zamknięte"}</p></section>; } function App() { const [open, toggle] = useToggle(); return <Details open={open} onToggle={toggle} />; }',
    checks: [click('#toggle', '#details', 'Zamknięte', 'Opis kursu', 'Przycisk zmienia komunikat „Zamknięte” na „Opis kursu”.')],
  },
  39: {
    title: 'Usuwanie z tablicy zadań', prompt: 'Rozpocznij ze stanem [{id: 1, title: "HTML"}]. W ul z id="tasks" pokaż zadanie i przycisk remove. Kliknięcie usuwa obiekt przez filter, pozostawia pustą listę i zmienia akapit status z „1 zadanie” na „Brak zadań”.',
    code: 'function App() { const [tasks, setTasks] = React.useState([{id:1,title:"HTML"}]); return <main><ul id="tasks">{tasks.map(task => <li key={task.id}>{task.title}<button id="remove" onClick={() => setTasks(items => items.filter(item => item.id !== task.id))}>Usuń</button></li>)}</ul><p id="status">{tasks.length ? "1 zadanie" : "Brak zadań"}</p></main>; }',
    checks: [click('#remove', '#status', '1 zadanie', 'Brak zadań', 'Usunięcie ostatniego zadania zmienia status z „1 zadanie” na „Brak zadań”.'), exists('ul#tasks:not(:has(li))', 'Po usunięciu lista zadań nie zawiera punktów li.')],
  },
};

export function independentScriptTask(definition, base) {
  const react = definition.track === 'react';
  const recipe = (react ? reactRecipes : jsRecipes)[definition.order];
  const id = `${definition.track}-${String(definition.order).padStart(2, '0')}-independent-v2`;
  const starter = { ...base, html: react ? '<div id="root"></div>' : recipe.html, js: '// Napisz własne rozwiązanie.\n' };
  const checks = [...recipe.checks, { type: 'runtimeError', label: 'Kod działa bez błędów.' }];
  if (react) checks.unshift({ type: 'reactRendered', selector: '#root', label: 'Komponent React został zamontowany w elemencie root.' });
  return createTask({
    id, mode: 'independent', title: recipe.title,
    prompt: 'Pracuj w script.js. ' + recipe.prompt + (react ? ' React i ReactDOM są dostępne lokalnie, bez importów. Zamontuj App przez ReactDOM.createRoot w elemencie root.' : ' HTML jest przygotowany; zachowaj jego identyfikatory.'),
    starter, solution: { ...starter, js: recipe.code + (react ? '\nReactDOM.createRoot(document.getElementById("root")).render(<App />);' : '') },
    checks: checks.map((check, index) => ({ ...check, id: `${id}-${index}` })),
  });
}
