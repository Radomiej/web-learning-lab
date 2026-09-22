import { createTask } from './lessonFactories.js';

function reactExercise(order, word) {
  const recipes = {
    32: [`const App = () => <h1 id="result">${word}</h1>;`, 'Wyrenderuj komponent App z nagłówkiem h1#result.', '#result', word],
    33: [`function Card({name, children}) { return <article id="result"><h2>{name}</h2>{children}</article>; } const App = () => <Card name="${word}"><p>Opis karty</p></Card>;`, 'Utwórz komponent Card z props name i children. Wyrenderuj article#result z h2 i opisem.', '#result', word],
    34: [`function App() { const [count, setCount] = React.useState(0); return <button id="result" onClick={() => setCount(c => c + 1)}>{count}</button>; }`, 'Zbuduj licznik w button#result. Początkowo 0; każde kliknięcie zwiększa go o 1.', '#result', '1', true],
    35: [`function App() { const items = [{id: 1, name: "${word}"}, {id: 2, name: "CSS"}]; return <ul id="result">{items.length ? items.map(item => <li key={item.id}>{item.name}</li>) : <li>Brak wyników</li>}</ul>; }`, 'Wyrenderuj tablicę dwóch obiektów w ul#result przez map. Nadaj stabilne key i obsłuż pustą listę.', '#result li', word],
    36: [`function App() { const [name, setName] = React.useState(""); return <form onSubmit={e => e.preventDefault()}><label htmlFor="name">Imię</label><input id="name" value={name} onChange={e => setName(e.target.value)}/><output id="result">{name}</output></form>; }`, 'Połącz input#name ze stanem przez value i onChange. Pokazuj wpisaną wartość w output#result.', '#result', word, 'input'],
    37: [`function App() { const [ready, setReady] = React.useState(false); React.useEffect(() => { const timer = setTimeout(() => setReady(true), 20); return () => clearTimeout(timer); }, []); return <p id="result">{ready ? "${word}" : "Czekam"}</p>; }`, 'Użyj useEffect z timerem i cleanup. Po 20 ms pokaż wynik w p#result.', '#result', word],
    38: [`function useCounter() { const [count, setCount] = React.useState(0); return [count, () => setCount(c => c + 1)]; } function Counter({count, onAdd}) { return <button id="result" onClick={onAdd}>{count}</button>; } function App() { const [count, add] = useCounter(); return <Counter count={count} onAdd={add}/>; }`, 'Wydziel useCounter i komponent Counter przyjmujący count oraz onAdd. button#result zwiększa licznik z 0 do 1.', '#result', '1', true],
    39: [`function App() { const [tasks, setTasks] = React.useState([]); return <main><button id="add" onClick={() => setTasks(items => [...items, {id: items.length, title: "${word}"}])}>Dodaj zadanie</button><ul id="result">{tasks.map(task => <li key={task.id}>{task.title}</li>)}</ul></main>; }`, 'Zbuduj pierwszy etap tablicy zadań: przycisk #add dodaje obiekt do stanu, ul#result renderuje zadania z key.', '#result', word, 'add'],
  };
  return recipes[order];
}
function jsExercise(order, word) {
  const recipes = {
    24: [`const message = "${word}"; console.log(message); document.querySelector("#result").textContent = message;`, 'Zadeklaruj const message i pokaż jego wartość w #result. Wypisz ją też w konsoli.'],
    25: [`function describe(score) { if (score >= 50) return "${word}"; return "Spróbuj ponownie"; } document.querySelector("#result").textContent = describe(80);`, 'Napisz funkcję describe(score): dla wyniku >= 50 zwróć tekst sukcesu. Wywołaj ją z 80 i pokaż wynik w #result.'],
    26: [`const items = ["${word}", "CSS"]; document.querySelector("#result").textContent = items.map(item => item.toUpperCase()).join(", ");`, 'Przekształć tablicę [tekst zadania, "CSS"] przez map na wielkie litery i pokaż ją w #result.'],
    27: [`const result = document.querySelector("#result"); result.textContent = "${word}"; result.classList.add("ready");`, 'Znajdź #result przez querySelector, ustaw jego textContent i dodaj klasę ready.'],
    28: [`document.querySelector("#action").addEventListener("click", () => { document.querySelector("#result").textContent = "${word}"; });`, 'Podłącz click do #action. Dopiero po kliknięciu pokaż tekst w #result.', true],
    29: [`const state = { items: [] }; function render() { document.querySelector("#result").textContent = state.items.length ? state.items.join(", ") : "Brak zadań"; } document.querySelector("#action").addEventListener("click", () => { state.items.push("${word}"); render(); }); render();`, 'Utwórz state.items i render(). Pokaż stan pusty, a po kliknięciu #action dodaj zadanie i odśwież #result.', true],
    30: [`const raw = '{"name":"${word}"}'; try { const data = JSON.parse(raw); document.querySelector("#result").textContent = data.name; } catch { document.querySelector("#result").textContent = "Błędne dane"; }`, 'Przećwicz bezpieczny odczyt: parsuj JSON z polem name w try/catch i pokaż wynik w #result. Uwaga: izolowany iframe nie udostępnia localStorage.', false],
    31: [`const events = []; document.querySelector("#action").addEventListener("click", () => { events.push("${word}"); const list = document.querySelector("#result"); list.replaceChildren(...events.map(title => { const li = document.createElement("li"); li.textContent = title; return li; })); });`, 'Zbuduj pierwszy etap planera: #action dodaje wydarzenie do tablicy, a #result pokazuje je jako li.', true],
  };
  return recipes[order];
}
export function scriptTasks(definition, base) {
  return ['guided', 'independent'].map((mode, variant) => {
    const word = variant ? 'SAMODZIELNIE' : 'GOTOWE';
    const id = `${definition.track}-${String(definition.order).padStart(2, '0')}-${mode}`;
    const checks = [{ id: id + '-errors', type: 'runtimeError', label: 'Kod uruchamia się bez błędów' }];
    let starter, solution, prompt;
    if (definition.track === 'react') {
      const [code, instruction, selector, expected, action] = reactExercise(definition.order, word);
      starter = { ...base, html: '<div id="root"></div>', js: '// Napisz komponent i wyrenderuj go do #root.\n' };
      solution = { ...starter, js: code + '\nReactDOM.createRoot(document.getElementById("root")).render(<App />);' };
      prompt = instruction + ` Tekst zadania: „${word}”. React i ReactDOM są już dostępne — bez importów.`;
      checks.push({ id: id + '-root', type: 'reactRendered', selector: '#root', label: 'React renderuje zawartość #root' });
      checks.push(action
        ? { id: id + '-action', type: 'interaction', selector: action === 'input' ? '#name' : action === 'add' ? '#add' : selector, resultSelector: selector, action: action === 'input' ? 'input' : 'click', value: word, expected: { text: expected }, label: `Po ${action === 'input' ? 'wpisaniu tekstu' : 'kliknięciu'} ${selector} zawiera „${expected}”` }
        : { id: id + '-text', type: 'textContains', selector, expected, label: `${selector} zawiera „${expected}”` });
      if (variant && [34, 38].includes(definition.order)) {
        solution.js = solution.js.replace('c + 1', 'c + 2');
        prompt = prompt.replace('o 1', 'o 2').replace('z 0 do 1', 'z 0 do 2');
        checks.at(-1).expected = { text: '2' };
        checks.at(-1).label = 'Po kliknięciu licznik zwiększa się z 0 do 2';
      }
    } else {
      const [code, instruction, action] = jsExercise(definition.order, word);
      starter = { ...base, html: '<main><h1>Laboratorium JavaScript</h1><button id="action">Dodaj</button><ul id="result"></ul></main>', js: '// Napisz rozwiązanie tutaj.\n' };
      solution = { ...starter, js: code };
      prompt = instruction + ` Tekst zadania: „${word}”.`;
      checks.push(action
        ? { id: id + '-action', type: 'interaction', selector: '#action', resultSelector: '#result', expected: { text: word }, label: `Kliknięcie #action pokazuje „${word}” w #result` }
        : { id: id + '-text', type: 'textContains', selector: '#result', expected: word, label: `#result zawiera „${word}”` });
      if (definition.order === 27) checks.push({ id: id + '-class', type: 'elementExists', selector: '#result.ready', label: '#result ma klasę ready' });
      if (definition.order === 31) checks.push({ id: id + '-item', type: 'elementExists', selector: '#result > li', label: 'Wydarzenie jest elementem li' });
    }
    return createTask({ id, mode, title: `${variant ? 'Samodzielnie' : 'Prowadzone'}: ${definition.title}`, prompt, starter, solution, checks });
  });
}
