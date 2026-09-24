import { createTask } from './lessonFactories.js';
import { independentScriptTask } from './independentScripts.js';
import { reactProjectFor } from './reactProjects.js';
import { getReactPathSet, getReactProfile } from '../services/runtimeProfiles.js';

function reactExercise(order, word, paths) {
  const recipes = {
    32: [`W ${paths.app} wyrenderuj nagłówek h1#result.`, '#result', word],
    33: [`W ${paths.component('Card')} utwórz komponent Card z props name i children, a w ${paths.app} zaimportuj go i wyrenderuj article#result z h2 oraz opisem.`, '#result', word],
    34: [`W ${paths.app} zbuduj licznik w button#result. Początkowo 0; każde kliknięcie zwiększa go o 1.`, '#result', '1', true],
    35: [`W ${paths.app} wyrenderuj tablicę dwóch obiektów w ul#result przez map. Nadaj stabilne key i obsłuż pustą listę.`, '#result li', word],
    36: [`W ${paths.app} połącz input#name ze stanem przez value i onChange. Pokazuj wpisaną wartość w output#result.`, '#result', word, 'input'],
    37: [`W ${paths.app} użyj useEffect z timerem i cleanup. Po 20 ms pokaż wynik w p#result.`, '#result', word],
    38: [`W ${paths.hook('useCounter')} wydziel hook useCounter, w ${paths.component('Counter')} komponent Counter, a oba zaimportuj do ${paths.app}. button#result zwiększa licznik z 0 do 1.`, '#result', '1', true],
    39: [`W ${paths.component('TaskItem')} utwórz element listy i zaimportuj go do ${paths.app}. Przycisk #add ma dodać obiekt do stanu, a ul#result wyrenderować zadania ze stabilnym key.`, '#result', word, 'add'],
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
    if (variant) return independentScriptTask(definition, base);
    const word = 'GOTOWE';
    const id = `${definition.track}-${String(definition.order).padStart(2, '0')}-${mode}`;
    const checks = [{ id: id + '-errors', type: 'runtimeError', label: 'Kod uruchamia się bez błędów' }];
    let starter, solution, prompt;
    if (definition.track === 'react') {
      const profile = getReactProfile();
      const paths = getReactPathSet(profile.id);
      const [instruction, selector, expected, action] = reactExercise(definition.order, word, paths);
      starter = reactProjectFor(definition.order, 'guided', 'starter');
      solution = reactProjectFor(definition.order, 'guided', 'solution');
      prompt = `${instruction} Tekst zadania: „${word}”. Punkt wejścia ${profile.runtime.module} jest gotowy; pracuj w wymienionych plikach i zachowaj importy oraz eksporty.`;
      checks.push({ id: id + '-root', type: 'reactRendered', selector: '#root', label: 'React renderuje zawartość #root' });
      checks.push(action
        ? { id: id + '-action', type: 'interaction', selector: action === 'input' ? '#name' : action === 'add' ? '#add' : selector, resultSelector: selector, action: action === 'input' ? 'input' : 'click', value: word, expected: { text: expected }, label: `Po ${action === 'input' ? 'wpisaniu tekstu' : 'kliknięciu'} ${selector} zawiera „${expected}”` }
        : { id: id + '-text', type: 'textContains', selector, expected, label: `${selector} zawiera „${expected}”` });
    } else {
      const [code, instruction, action] = jsExercise(definition.order, word);
      starter = { ...base, html: `<main><h1>Laboratorium JavaScript</h1><button id="action">Dodaj</button>${definition.order === 31 ? '<ul id="result"></ul>' : '<output id="result"></output>'}</main>`, js: '// Napisz rozwiązanie tutaj.\n' };
      solution = { ...starter, js: code };
      prompt = instruction + ` Tekst zadania: „${word}”.`;
      checks.push(action
        ? { id: id + '-action', type: 'interaction', selector: '#action', resultSelector: '#result', expected: { text: word }, label: `Kliknięcie #action pokazuje „${word}” w #result` }
        : { id: id + '-text', type: 'textContains', selector: '#result', expected: word, label: `#result zawiera „${word}”` });
      if (definition.order === 27) checks.push({ id: id + '-class', type: 'elementExists', selector: '#result.ready', label: '#result ma klasę ready' });
      if (definition.order === 31) checks.push({ id: id + '-item', type: 'elementExists', selector: '#result > li', label: 'Wydarzenie jest elementem li' });
    }
    return createTask({ id, mode, track: definition.track, title: definition.title, prompt, starter, solution, checks });
  });
}
