import { createTask } from './lessonFactories.js';
import { independentScriptTask } from './independentScripts.js';
import { reactProjectFor } from './reactProjects.js';
import { getReactPathSet, getReactProfile } from '../services/runtimeProfiles.js';
import { lessonSequence } from './lessonNumbers.js';
import { jsFoundationTasks, legacyJsSequence } from './jsFoundationTasks.js';
import { jsExtraTasks } from './jsExtraTasks.js';

function reactExercise(order, word, paths) {
  const recipes = {
    1: [`W ${paths.app} wyrenderuj nagłówek h1#result.`, '#result', word],
    2: [`W ${paths.component('Card')} utwórz komponent Card z props name i children, a w ${paths.app} zaimportuj go i wyrenderuj article#result z h2 oraz opisem.`, '#result', word],
    3: [`W ${paths.app} zbuduj licznik w button#result. Początkowo 0; każde kliknięcie zwiększa go o 1.`, '#result', '1', true],
    4: [`W ${paths.app} wyrenderuj tablicę dwóch obiektów w ul#result przez map. Nadaj stabilne key i obsłuż pustą listę.`, '#result li', word],
    5: [`W ${paths.app} połącz input#name ze stanem przez value i onChange. Pokazuj wpisaną wartość w output#result.`, '#result', word, 'input'],
    6: [`W ${paths.app} użyj useEffect z timerem i cleanup. Po 20 ms pokaż wynik w p#result.`, '#result', word],
    7: [`W ${paths.hook('useCounter')} wydziel hook useCounter, w ${paths.component('Counter')} komponent Counter, a oba zaimportuj do ${paths.app}. button#result zwiększa licznik z 0 do 1.`, '#result', '1', true],
    8: [`W ${paths.component('TaskItem')} utwórz element listy i zaimportuj go do ${paths.app}. Przycisk #add ma dodać obiekt do stanu, a ul#result wyrenderować zadania ze stabilnym key.`, '#result', word, 'add'],
  };
  return recipes[order];
}
function jsExercise(order, word) {
  const recipes = {
    1: [`const message = "${word}"; console.log(message); document.querySelector("#result").textContent = message;`, `Zadeklaruj stałą const message = "${word}", wypisz jej wartość w konsoli i wpisz ją do elementu #result.`],
    2: [`function describe(score) { if (score >= 50) return "${word}"; return "Spróbuj ponownie"; } document.querySelector("#result").textContent = describe(80);`, `Napisz funkcję describe(score), która dla wyniku >= 50 zwraca tekst "${word}", a w przeciwnym razie "Spróbuj ponownie". Wywołaj describe(80) i wpisz wynik do elementu #result.`],
    3: [`const items = ["${word}", "CSS"]; document.querySelector("#result").textContent = items.map(item => item.toUpperCase()).join(", ");`, `Utwórz tablicę ["${word}", "CSS"], przekształć jej elementy metodą map na wielkie litery, połącz metodą join(", ") i wpisz wynik do elementu #result.`],
    4: [`const result = document.querySelector("#result"); result.textContent = "${word}"; result.classList.add("ready");`, `Znajdź element #result przez querySelector, ustaw jego textContent na "${word}" i dodaj mu klasę "ready" przez classList.add. Reguła #result.ready jest już przygotowana w arkuszu stylów — porównaj wygląd elementu przed i po uruchomieniu.`],
    5: [`document.querySelector("#action").addEventListener("click", () => { document.querySelector("#result").textContent = "${word}"; });`, `Dodaj obsługę zdarzenia click na przycisku #action tak, aby dopiero po kliknięciu w elemencie #result pojawił się tekst "${word}".`, true],
    6: [`const state = { items: [] }; function render() { document.querySelector("#result").textContent = state.items.length ? state.items.join(", ") : "Brak zadań"; } document.querySelector("#action").addEventListener("click", () => { state.items.push("${word}"); render(); }); render();`, `Utwórz obiekt state z pustą tablicą items oraz funkcję render(), która dla pustej tablicy wpisuje w #result tekst "Brak zadań", a dla niepustej — elementy połączone przez join(", "). Po kliknięciu przycisku #action dodaj "${word}" do state.items i odśwież widok wywołaniem render().`, true],
    7: [`const raw = '{"name":"${word}"}'; try { const data = JSON.parse(raw); document.querySelector("#result").textContent = data.name; } catch { document.querySelector("#result").textContent = "Błędne dane"; }`, `Odczytaj w bloku try/catch tekst JSON '{"name":"${word}"}' za pomocą JSON.parse i wpisz wartość pola name do elementu #result (a w bloku catch wpisz "Błędne dane"). W tym ćwiczeniu odczytujesz napis JSON ze zmiennej, bez użycia localStorage.`, false],
    8: [`const events = []; document.querySelector("#action").addEventListener("click", () => { events.push("${word}"); const list = document.querySelector("#result"); list.replaceChildren(...events.map(title => { const li = document.createElement("li"); li.textContent = title; return li; })); });`, `Zbuduj pierwszy etap planera: kliknięcie przycisku #action dopisuje "${word}" do tablicy events i odświeża listę #result, tworząc dla każdego wpisu element <li>.`, true],
  };
  return recipes[order];
}
export function scriptTasks(definition, base) {
  if (definition.track === 'js') {
    const extra = jsExtraTasks(definition, base);
    if (extra) return extra;
    const foundations = jsFoundationTasks(definition, base);
    if (foundations) return foundations;
  }
  const localOrder = definition.track === 'js' ? legacyJsSequence(definition.id) : lessonSequence(definition.track, definition.order);
  const tasks = ['guided', 'independent'].map((mode, variant) => {
    if (variant) return independentScriptTask(definition, base);
    const word = 'GOTOWE';
    const id = definition.track === 'js' ? `${definition.id}-${mode}-v3` : `${definition.track}-${String(definition.order).padStart(2, '0')}-${mode}`;
    const checks = [{ id: id + '-errors', type: 'runtimeError', label: 'Kod uruchamia się bez błędów' }];
    let starter, solution, prompt;
    if (definition.track === 'react') {
      const profile = getReactProfile();
      const paths = getReactPathSet(profile.id);
      const [instruction, selector, expected, action] = reactExercise(localOrder, word, paths);
      starter = reactProjectFor(definition.order, 'guided', 'starter');
      solution = reactProjectFor(definition.order, 'guided', 'solution');
      prompt = `${instruction} Tekst zadania: „${word}”. Punkt wejścia ${profile.runtime.module} jest gotowy; pracuj w wymienionych plikach i zachowaj importy oraz eksporty.`;
      checks.push({ id: id + '-root', type: 'reactRendered', selector: '#root', label: 'React renderuje zawartość #root' });
      checks.push(action
        ? { id: id + '-action', type: 'interaction', selector: action === 'input' ? '#name' : action === 'add' ? '#add' : selector, resultSelector: selector, action: action === 'input' ? 'input' : 'click', value: word, expected: { text: expected }, label: `Po ${action === 'input' ? 'wpisaniu tekstu' : 'kliknięciu'} ${selector} zawiera „${expected}”` }
        : { id: id + '-text', type: 'textContains', selector, expected, label: `${selector} zawiera „${expected}”` });
    } else {
      const [code, instruction, action] = jsExercise(localOrder, word);
      starter = { ...base, html: `<main><h1>Laboratorium JavaScript</h1><button id="action">Dodaj</button>${localOrder === 8 ? '<ul id="result"></ul>' : '<output id="result"></output>'}</main>`, js: '// Napisz rozwiązanie tutaj.\n' };
      if (localOrder === 4) starter.themeCss = `${base.themeCss}\n#result { display: inline-block; padding: 10px 16px; border: 2px dashed #93aabf; border-radius: 10px; color: #54708a; background: #fff; }\n#result.ready { border-style: solid; border-width: 4px; border-color: #17803a; background-color: #dcf2e3; color: #0f5c28; font-weight: 700; }`;
      solution = { ...starter, js: code };
      prompt = instruction;
      checks.push(action
        ? { id: id + '-action', type: 'interaction', selector: '#action', resultSelector: '#result', expected: { text: word }, label: `Po kliknięciu przycisku #action w elemencie #result pojawia się „${word}”` }
        : { id: id + '-text', type: 'textContains', selector: '#result', expected: word, label: `Element #result zawiera tekst „${word}”` });
      if (localOrder === 4) {
        checks.push({ id: id + '-class', type: 'elementExists', selector: '#result.ready', label: '#result ma klasę ready' });
        checks.push({ id: id + '-api', type: 'sourceMatches', file: 'script.js', pattern: 'classList\\s*\\.\\s*add\\s*\\(\\s*["\']ready["\']', label: 'W script.js dodaj klasę przez classList.add("ready")' });
        checks.push({ id: id + '-look', type: 'computedStyle', selector: '#result', property: 'border-top-style', expected: 'solid', label: 'Reguła #result.ready zmienia przerywaną ramkę na pełną — klasa realnie zmienia wygląd' });
        checks.push({ id: id + '-bg', type: 'computedStyle', selector: '#result', property: 'background-color', expected: 'rgb(220, 242, 227)', label: 'Reguła #result.ready nadaje zielone tło — klasa realnie zmienia wygląd' });
      }
      if (localOrder === 8) checks.push({ id: id + '-item', type: 'elementExists', selector: '#result > li', label: 'Wydarzenie jest elementem li' });
    }
    return createTask({ id, mode, track: definition.track, title: definition.title, prompt, starter, solution, checks });
  });
  if (definition.track === 'js' && definition.id === 'js-events-forms') {
    const id = 'js-events-forms-form-v1';
    const starter = { ...base, html: '<main><h1>Formularz zgłoszenia</h1><form id="form"><label for="student">Imię</label><input id="student" name="student" value="Ola"><label for="count">Liczba</label><input id="count" name="count" type="number" value="3" required><button id="action" type="submit">Wyślij</button></form><output id="result"></output></main>', js: '// TODO: obsłuż submit formularza.\n' };
    const code = 'const form = document.querySelector("#form");\nform.addEventListener("submit", (event) => {\n  event.preventDefault();\n  const data = new FormData(form);\n  const student = String(data.get("student")).trim();\n  const count = Number(data.get("count"));\n  document.querySelector("#result").textContent = student + " " + count;\n});';
    tasks.push(createTask({ id, mode: 'independent', track: 'js', title: 'Formularz: submit, FormData i liczba',
      prompt: 'W gotowym form#form obsłuż submit przez addEventListener. Wywołaj event.preventDefault(), aby zatrzymać domyślne wysłanie strony. Utwórz new FormData(form), odczytaj pole name="student" przez get("student") i usuń skrajne spacje przez trim(). Odczytaj get("count") i zamień tekst na liczbę przez Number(). Pokaż imię i liczbę oddzielone spacją w #result. Dla gotowych pól po kliknięciu Wyślij wynik to Ola 3. Zmień pola i sprawdź, czy kolejne wysłanie odczytuje nowe wartości; klawisz Enter także powinien wysyłać formularz.',
      starter, solution: { ...starter, js: code },
      hint: 'Nasłuchuj submit na formularzu, a nie click na przycisku. FormData odczytuje pola według atrybutów name, a ich wartości są tekstem.',
      checks: [
        { id: `${id}-errors`, type: 'runtimeError', label: 'Formularz działa bez błędów' },
        { id: `${id}-submit`, type: 'interaction', selector: '#action', action: 'click', resultSelector: '#result', expected: { text: 'Ola 3' }, label: 'Wysłanie formularza pokazuje Ola 3' },
      ],
    }));
  }
  return tasks;
}
