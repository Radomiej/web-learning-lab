# Multi-file Sandbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Działający lokalny sandbox z dodawaniem HTML/CSS/JS/JSX, modułami React, jednym domyślnym CSS i pomocą edytora w tooltipie, bez utraty prac ucznia.

**Architecture:** Projekty zawierają mapę nazw plików i dokument wejściowy. Osobne moduły odpowiadają za migrację, rozwiązywanie zależności, kompilację i składanie iframe; edytor oraz lekcje przechodzą na wspólny kontrakt. Istniejący mostek sprawdza wynik działania, nie tylko źródła.

**Tech Stack:** React 18, Vite 6, lokalny @babel/standalone i React/ReactDOM, Prettier 3.9.8, Vitest, Testing Library, JSDOM, PowerShell.

**Spec:** `docs/superpowers/specs/2026-09-22-multifile-sandbox-design.md` — zatwierdzona przez użytkownika 2026-09-22.

## Global Constraints

- „Zachowujemy lokalne uruchamianie aplikacji na porcie 5181” — nie zmieniać aplikacji SQL na 5180.
- „rozwiązania dostępne wyłącznie w zadaniach prowadzonych.”
- „Jeden CSS oznacza jeden plik startowy, a nie zakaz dodawania kolejnych.”
- „Nowy zapis używa osobnego klucza wersji v3. Stare v2 pozostaje nietknięte jako kopia”
- „Zachowujemy `sandbox="allow-scripts"` bez allow-same-origin”
- „Nie dodajemy instalatora npm, backendu ani zewnętrznej usługi sandboxa.”
- „Zmiana nazw i usuwanie plików nie należą do tego zakresu.”
- Każdy etap: najpierw test wykazujący brak zachowania, potem kod, ponowienie testu i przegląd diffu. Nie zmieniać oczekiwań zaliczeń dla wygody implementacji.
- Tryb wykonania: native, wcześniej wskazany przez użytkownika. Pracować w istniejącym repozytorium, zachowywać cudze zmiany. Commitować tylko wymienione pliki własnych zmian po zielonych testach etapu.

## Review Focus

1. Zepsute v3, działające v2 lub wyczerpane localStorage: nie nadpisywać żadnej kopii i pokazać ostrzeżenie (zadanie 4).
2. Nazwy `__proto__`, ścieżki z backslash, URL i wyjście ponad katalog: odrzucenie, bez dostępu do serwera hosta (zadanie 1).
3. Wspólny import kilku komponentów: jednokrotne wykonanie modułu, cykl daje błąd z nazwą pliku (zadanie 2).
4. Edycja/zmiana zadania podczas kompilacji albo stare wiadomości iframe: brak zaliczenia z nieaktualnej rewizji (zadanie 3).
5. Długie nazwy, Escape w tooltipie i fokus po dodaniu/resetowaniu: dostępna obsługa bez poziomego overflow strony (zadanie 5).

## Mapa plików i kontrakt

Nowe jednostki: `src/services/projectFiles.js` (model, nazwy, legacy), `projectStorage.js` (odczyt i zapis v3), `moduleCompiler.js` (graf JS/JSX), `localResources.js` (podłączone zasoby HTML/CSS), `src/components/AddFileDialog.jsx`, `EditorHelp.jsx`, `src/data/reactProjects.js` (startery/rozwiązania React). Testy obok modułów. Istniejące App, factories, previewDocument, hooki i komponenty integrują te jednostki; nie powstaje alternatywny sandbox.

```js
// Kontrakt projektu, używany wszędzie po migracji:
const project = {
  entry: 'index.html',
  files: { 'index.html': '<!doctype html>...', 'styles.css': '', 'script.js': '' },
};
// Podgląd innego HTML jest stanem UI, nie zmienia entry ani celu walidacji.
```

## Zadanie 1: Model projektu, bezpieczne nazwy i konwersja legacy

**Files:** Create `src/services/projectFiles.js`, `src/services/projectFiles.test.js`. Istniejący interfejs aplikacji na razie pozostaje bez zmian.

**Interfaces:** `normalizeProject(bundle, {track='html'}={}) -> Project`; `resolveLocalPath(from, specifier, files) -> string` (rzuca Error); `createProjectFile(project, {type, name}) -> {project, path}`. Typy: html, css, js, react. Mapa zawiera wyłącznie własne klucze tekstowe, nigdy dziedziczone właściwości.

- [ ] Dodaj testy konwersji pełnego dokumentu, kolejności CSS i zachowania dowolnego kodu ucznia. Przykład:

```js
test('scala kaskadę bez usuwania kodu ucznia', () => {
  const p = normalizeProject({html:'<main>Moja praca</main>', baseCss:'p{color:red}', themeCss:'p{color:blue}', js:'alert(1)'});
  expect(p.files['styles.css']).toBe('p{color:red}\np{color:blue}');
  expect(p.files['index.html']).toContain('Moja praca');
  expect(p.files['script.js']).toBe('alert(1)');
});
test.each(['../x.js', '/x.js', 'https://a/x.js', '__proto__', 'a\\x.js'])('odrzuca nazwę %s', name => {
  expect(() => createProjectFile({entry:'index.html', files:{}}, {type:'js', name})).toThrow();
});
```

- [ ] Uruchom `npm test -- src/services/projectFiles.test.js`; potwierdź czerwony wynik z powodu brakującego API.
- [ ] Zaimplementuj czystą konwersję: rozpoznane linki base/theme zastąp jednym styles.css w miejscu pierwszego; kod CSS łącz base, potem theme; nie dopisuj drugiego linku. Nowy model kopiuj bez modyfikacji. Dla starego React zachowaj js w legacy.jsx, a main.jsx importuje go. W legacy zachowaj dostęp do globalnego React/ReactDOM. Nie dodawaj rozwiązania ani nowych komponentów do pracy ucznia.

```js
const css = [bundle.baseCss ?? '', bundle.themeCss ?? ''].join('\n');
const main = "import './legacy.jsx';\n";
// Walidacja musi nastąpić PRZED przypisaniem nazwy do mapy:
if (Object.hasOwn(project.files, path)) throw new Error('Plik już istnieje.');
return { project: {...project, files: {...project.files, [path]: source}}, path };
```

- [ ] Dodaj testy: podwójna konwersja identyczna; lokalne `../` wewnątrz projektu działają, poza projekt nie; duplikaty nie zmieniają pliku; rozszerzenie nie pasuje do typu; JSX daje poprawny identyfikator komponentu; obcy HTML bez dawnych linków nie jest zastępowany.
- [ ] Ponów testy, `git diff --check`, commit `feat: add virtual project file model`.

## Zadanie 2: Lokalny graf modułów JS/JSX

**Files:** Create `src/services/moduleCompiler.js`, `src/services/moduleCompiler.test.js`; Modify `src/services/reactRuntimeAssets.js`, `src/services/reactRuntimeAssets.test.js`.

**Interfaces:** Consumes `resolveLocalPath`; produces `compileModules(files, entry) -> {code, cssPaths, errors}`. `errors` to lista komunikatów z nazwami plików; przy błędzie code jest pusty. `cssPaths` zawiera importy CSS w kolejności wykonania bez duplikatów. Istniejące `getReactRuntimeScripts()` zachowuje kontrakt.

- [ ] Dodaj test wykonujący wynik kompilacji z named/default importem, re-exportem oraz wspólną zależnością:

```js
test('wykonuje współdzieloną zależność raz', () => {
  const result = compileModules({
    'main.js': "import './a.js'; import './b.js';",
    'a.js': "import './shared.js';",
    'b.js': "import './shared.js';",
    'shared.js': 'globalThis.calls = (globalThis.calls || 0) + 1;',
  }, 'main.js');
  expect(result.errors).toEqual([]);
  const scope = {};
  new Function('globalThis', result.code)(scope);
  expect(scope.calls).toBe(1);
});
```

- [ ] Uruchom `npm test -- src/services/moduleCompiler.test.js` i zobacz brak implementacji.
- [ ] Użyj Babel z `sourceType:'module'`, presetem react i pluginem transform-modules-commonjs. Zbierz importy/re-exporty przez AST, nie regex. DFS buduje graf, wykrywa aktywny stos i wskazuje łańcuch cyklu. Runtime `require` korzysta z gotowej mapy zależności i cache; mapuje tylko react i react-dom/client na lokalne globals. Dynamiczny import i nierozwiązywalne require zgłaszają jawny błąd, bez pobierania z sieci.

```js
const transformed = Babel.transform(source, {
  filename: path, sourceType: 'module', presets: ['react'],
  plugins: ['transform-modules-commonjs'],
});
// W wygenerowanym runtime cache musi powstać przed wywołaniem fabryki:
const module = {exports: {}};
cache[id] = module;
factories[id](localRequire, module, module.exports);
```

- [ ] Testy: JSX z useState renderowany w JSDOM z lokalnymi bibliotekami, brak pliku, nieznana paczka, cykl, błąd JSX zawierający filename, import CSS, import extensionless, plik zawierający `</script>` nie uszkadza osadzenia (ostatnie również w zadaniu 3).
- [ ] Testy modułów i istniejących reactRuntimeAssets zielone; commit `feat: compile local React module graphs`.

## Zadanie 3: Rzeczywiste zasoby dokumentu i świeży podgląd

**Files:** Create `src/services/localResources.js`, `src/services/localResources.test.js`; Modify `src/services/previewDocument.js`, `previewDocument.test.js`, `src/hooks/usePreviewRuntime.js`, `usePreviewRuntime.test.js`, `src/components/PreviewInspector.jsx`, `PreviewInspector.test.jsx`.

**Interfaces:** `resolveDocumentResources(project, documentPath) -> {headMarkup, bodyMarkup, htmlAttributes, doctype, errors}`; consumes compiler. `buildPreviewDocument(project, {track, requestedSignals, documentPath=project.entry, runId}) -> string`. Hook exposes `runPreview(project?, documentPath?)`, `checkPreview()` (always entry), `previewPath`, `setPreviewPath(path)`; existing returned fields remain.

- [ ] Testy wynikowego dokumentu w JSDOM: linked CSS stosuje kolor, niepodłączony CSS nie; skrypt zmienia DOM; drugie HTML ma odrębny tytuł i treść; Check po jego wyborze uruchamia index.html. CSS @import względny działa; cykl zwraca błąd. Wykorzystaj rzeczywisty dokument:

```js
const project = {entry:'index.html', files:{
  'index.html':'<!doctype html><html><head><link rel="stylesheet" href="styles.css"></head><body><p>Tekst</p><script src="script.js"></script></body></html>',
  'styles.css':'p{color:rgb(255, 0, 0)}',
  'unused.css':'p{color:blue !important}',
  'script.js':"document.querySelector('p').textContent='Działa';",
}};
const dom = new JSDOM(buildPreviewDocument(project), {runScripts:'dangerously'});
expect(dom.window.document.querySelector('p').textContent).toBe('Działa');
expect(dom.window.getComputedStyle(dom.window.document.querySelector('p')).color).toBe('rgb(255, 0, 0)');
dom.window.close();
```

- [ ] Uruchom `npm test -- src/services/localResources.test.js src/services/previewDocument.test.js src/hooks/usePreviewRuntime.test.js` i zanotuj oczekiwane nowe błędy.
- [ ] Przetwarzaj prawdziwe tagi i ich atrybuty parserem DOM dostępnym w przeglądarce oraz w środowisku testowym; nie dopasowuj HTML jednym regexem. Zachowaj style inline i kolejność linków, klasycznych skryptów i deferred/module scripts. Bridge i runtime bibliotek muszą działać przed kodem ucznia; defer/module wykonuj po sparsowaniu body. Zachowaj async jako asynchroniczne wykonanie bez gwarancji kolejności. Nie pobieraj brakujących lokalnych zasobów z Vite. Bezpiecznie serializuj zawartość script/style tak, aby tekst zamknięcia tagu nie wstrzykiwał dodatkowego HTML.
- [ ] Dodaj identyfikator uruchomienia do wiadomości mostka i odrzucaj stary runId; Check przechwytuje migawkę projektu do oceny, a edycja anuluje oczekującą ocenę. Zastosuj token również dla błędów i ready.

```js
// Wiadomości starego iframe nie mogą zakończyć nowego sprawdzania.
if (message.runId !== activeRunIdRef.current) return;
// W kodzie generowanego bridge:
window.parent.postMessage({source:'web-learning-lab', runId, type, payload}, '*');
```

- [ ] Dodaj regresje: zmiana CSS w tym samym pliku i ponowne Run; dwa identyczne Run; stary ready/signals po zmianie zadania ignorowane; błąd kompilacji kasuje wynik; classic JS ma wspólny kontekst; `</script>` w stringu i CSS nie tworzy dodatkowych elementów. Pełny dotychczasowy zestaw działa dzięki normalizacji legacy na granicy generatora.
- [ ] Zielone testy, diff check, commit `feat: preview connected virtual project resources`.

## Zadanie 4: Trwały zapis v3 i bezpieczna migracja

**Files:** Create `src/services/projectStorage.js`, `projectStorage.test.js`; Modify `src/hooks/useCourseProgress.js`, `useCourseProgress.test.js`, `src/App.jsx`. Nie zmieniać ogólnego useLocalStorage, jeśli obsługa projektu może raportować błędy osobno.

**Interfaces:** `loadProjects(storage, lessons) -> {projects, warning}`; `saveProjects(storage, projects) -> {warning}`. Klucz `web-learning-lab.files.v3`. Hook returns `filesByTask` z projektami, `storageWarning`; `updateFiles(taskId, changes)` przyjmuje mapę filename→text, `resetTask(taskId)` zastępuje cały projekt starterem. `entry` nigdy nie jest nadpisywane przez wybór strony podglądu.

- [ ] Dodaj testy migracji oraz niedostępnego magazynu:

```js
test('zachowuje oryginał v2', () => {
  const original = JSON.stringify({old:{html:'<p>Mój szkic</p>', baseCss:'a{}', themeCss:'b{}', js:''}});
  localStorage.setItem('web-learning-lab.files.v2', original);
  const result = loadProjects(localStorage, []);
  expect(result.projects.old.files['index.html']).toContain('Mój szkic');
  expect(localStorage.getItem('web-learning-lab.files.v2')).toBe(original);
});
test('raportuje nieudany zapis', () => {
  const storage = {setItem(){throw new Error('QuotaExceededError');}};
  expect(saveProjects(storage, {}).warning).toBeTruthy();
});
```

- [ ] Uruchom `npm test -- src/services/projectStorage.test.js src/hooks/useCourseProgress.test.js`; nowe testy czerwone.
- [ ] Odczytuj v3 tylko po walidacji struktury. Istniejącego, ale uszkodzonego v3 nie nadpisuj automatycznie: pracuj w pamięci i pokaż ostrzeżenie. Przy braku v3 migruj v2, zachowując nieznane task IDs; ustal track przez lessons, nieznany stary draft traktuj jako legacy JS bez niszczenia źródła. Nie zmieniaj klucza postępu ani zaliczeń.

```js
// Zapisywać tylko do nowego klucza, nigdy v2.
try {
  storage.setItem('web-learning-lab.files.v3', JSON.stringify(projects));
  return {warning: ''};
} catch {
  return {warning: 'Nie udało się zapisać pracy w przeglądarce. Zachowaj kopię kodu przed zamknięciem.'};
}
```

- [ ] Testy: v3 wygrywa nad v2, ponowna migracja nie zmienia pracy, pusty plik nie przywraca startera, dodany plik wraca po ponownym otwarciu, reset jednego zadania nie dotyka innych, uszkodzony JSON chroniony. App pokazuje warning jako status, a nie ukrywa go w konsoli.
- [ ] Zielone testy, commit `feat: preserve student projects in versioned storage`.

## Zadanie 5: Dodawanie plików i dyskretna pomoc

**Files:** Create `src/components/AddFileDialog.jsx`, `AddFileDialog.test.jsx`, `EditorHelp.jsx`, `EditorHelp.test.jsx`; Modify `EditorTabs.jsx`, `LessonWorkspace.jsx`, `CodeEditor.jsx`, `CodeEditor.test.jsx`, `components.test.jsx`, `accessibility.test.jsx`, `src/services/codeEditing.js`, `src/App.jsx`, `src/styles/app.css`.

**Interfaces:** `AddFileDialog({project,onCreate,onClose})`, onCreate receives `{project,path}` from createProjectFile. `EditorHelp()` owns visibility. `EditorTabs({files,activeFile,onFileChange})` receives filename→text map. CodeEditor receives actual filename in fileKey and fileLabel.

- [ ] Dodaj testy zachowania UI: otwarcie „Dodaj plik”, typ React, nazwa components/Card.jsx, utworzenie i aktywowanie pliku; błąd duplikatu nie zamyka formularza; anulowanie niczego nie zmienia. Pomoc domyślnie ukryta, hover/focus/click otwierają, Escape zamyka i fokus zostaje na przycisku.

```jsx
test('pomoc dostępna z klawiatury', async () => {
  const user = userEvent.setup();
  render(<EditorHelp />);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  await user.tab();
  expect(screen.getByRole('tooltip')).toHaveTextContent('Tab');
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  expect(screen.getByRole('button', {name:'Skróty edytora'})).toHaveFocus();
});
```

- [ ] Uruchom nowe testy UI, potwierdź czerwony wynik.
- [ ] Implementuj przycisk przy zakładkach oraz dostępny dialog z focus trap, Escape i przywróceniem fokusu. JSX szablon eksportuje komponent, ale nie modyfikuje App automatycznie; opis pokazuje przykład importu. HTML/CSS/JS opisują link/script. Reset wymaga potwierdzenia odtworzenia plików startera. W pomocniczym popupie brak elementów interaktywnych i pułapki fokusu; styl widoczny na wąskim ekranie.

```jsx
<button type="button" aria-label="Skróty edytora"
  aria-describedby={open ? helpId : undefined}
  onClick={() => setOpen(value => !value)}
  onKeyDown={event => {if (event.key === 'Escape') setOpen(false);}}>
  ?
</button>
{open && <div id={helpId} role="tooltip">{shortcutText}</div>}
```

- [ ] Dobieraj parser przez rozszerzenie, zachowując lazy import Prettier i ochronę przed formatowaniem nieaktualnej zawartości. Zakładki renderuj z Object.keys(files), activeFile resetuj do entry tylko przy zmianie zadania/resetowaniu; dodanie pliku aktywuje jego nazwę.

```js
const extension = fileKey.split('.').pop().toLowerCase();
const parser = extension === 'html' ? 'html' : extension === 'css' ? 'css' : 'babel';
```

- [ ] Testy obejmują dodatkowy HTML i wybór podglądu, formatowanie nowego JSX/CSS, undo, Tab, usuwanie linii, tooltip dotykowy, focus po dialogu i resecie, długą nazwę. Pełny akapit editor-help znika; nazwę skrótów i pomoc zachowaj dla czytnika.
- [ ] Testy zielone, commit `feat: add project files and compact editor help`.

## Zadanie 6: Materiał kursu w nowym modelu i walidacja końcowa

**Files:** Create `src/data/reactProjects.js`, `reactProjects.test.js`; Modify `src/data/lessonFactories.js`, `fullDocument.js`, `lessons.js`, `practicalTasks.js`, `scriptTasks.js`, `independentScripts.js`, `reactLessons.js`, `cssLessons.js`, `layoutLessons.js`, `htmlInstructions.js`, `src/services/lessonValidator.js`, jego testy, `src/data/solutions.test.js`, `instructions.test.js`, `contentCoverage.test.js`, `curriculum.test.js`, `src/App.smoke.test.jsx`; add `docs/multifile-sandbox-verification-2026-09-22.md`.

**Interfaces:** `reactProjectFor(order, mode, kind) -> Project`, kind starter/solution, mode guided/independent. Factory zwraca wyłącznie nowy model; nie łączy płytko zawartości projektu rozwiązania ze starterem. Validator czyta `project.files[check.file]`; legacy aliases istnieją wyłącznie na granicy migracji/testów kompatybilności.

- [ ] Dodaj testy nowego kontraktu, jednego startowego CSS i modułów React:

```js
for (const lesson of lessons) for (const task of lesson.tasks) {
  test(`${task.id}: prawdziwe pliki`, () => {
    expect(task.starter.entry).toBe('index.html');
    expect(Object.keys(task.starter.files).filter(p => p.endsWith('.css'))).toEqual(['styles.css']);
    if (lesson.track === 'react') {
      expect(task.solution.files['main.jsx']).toContain("from './App.jsx'");
      expect(task.solution.files['App.jsx']).toContain('export default');
    }
  });
}
```

- [ ] Uruchom `npm test -- src/data/reactProjects.test.js src/data/instructions.test.js`; nowe wymagania czerwone.
- [ ] Przepisz rozwiązania React zachowując cele i selektory: 32 App/profil; 33 components/Card.jsx albo Course.jsx; 34 stan/licznik lub motyw; 35 listy; 36 formularze kontrolowane; 37 efekt/timer lub document.title; 38 hooks/useCounter.js albo useToggle.js i komponent; 39 aplikacja z komponentem elementu listy. Każdy starter ma montowanie, import App i minimalny niewykonany szkielet, nie gotową odpowiedź.

```jsx
// main.jsx wspólny dla przygotowanych projektów React:
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.jsx';
createRoot(document.getElementById('root')).render(<App />);
```

- [ ] Scal CSS kursu, popraw polecenia na styles.css i jawne nazwy komponentów, pełne dokumenty mają link styles.css i odpowiedni script. Usuń martwe fabryki dawnych zadań tylko jeżeli utrzymują sprzeczny materiał. W tests solutions dostosuj kosmetyczne adaptacje do `files['index.html']`, `files['styles.css']` i wszystkich JS/JSX bez osłabiania sprawdzania.
- [ ] Uruchom `npm test` oraz `npm run build`; przejrzyj każde odrzucenie startera i przyjęcie rozwiązania. Wyszukaj `base.css|theme.css|script.js` w instrukcjach React: legacy nazwy dopuszczalne tylko w kodzie migracji, jej testach i historycznej dokumentacji. Nie obiecuj fizycznych wymiarów na bazie JSDOM.
- [ ] Zweryfikuj w przeglądarce na 5181: React importowany komponent zmienia stan; zmiana styles.css odświeża wynik po Run; dodany CSS nie działa przed linkiem; JS przez script działa; dodatkowy HTML i Check wracające do index; błąd importu usuwa stare zaliczenie; reload zachowuje nowy plik; reset odtwarza starter po potwierdzeniu; niezależne zadanie bez rozwiązania. Sprawdź desktop 1280×720 i mobile 390×844, tooltip/fokus i brak overflow dokumentu. SQL 5180 bez zmian.
- [ ] Dokumentuj rzeczywiste wyniki, ostrzeżenia builda i ograniczenia; nie deklaruj niezależnego audytu bez wykonania. Użyj dostępnego świeżego reviewera dla całego diffu; jeśli brak narzędzia subagentów, zgłoś brak niezależnego review i wykonaj jawnie własny przegląd zgodności ze specyfikacją.
- [ ] `git diff --check`, pełne testy po poprawkach, commit `feat: teach React with dedicated component files`. Wypchnij własne zweryfikowane commity na master zgodnie z prośbą użytkownika; sprawdź równość HEAD/origin/master. Nie pushuj przy błędach ani nie używaj force.

## Przegląd planu i przekazanie

Pokrycie: pliki/ścieżki (1,5), moduły (2), realny sandbox i check (3), zapis/migracja (4), tooltip i edytor (5), materiały i cały kurs (6). Wszystkie pięć klas Review Focus ma test w przypisanym zadaniu. Żaden etap nie wymaga nowej zależności produkcyjnej ani zmiany portu SQL.

Ten dokument jest planem, nie potwierdzeniem implementacji. Po akceptacji użytkownika wykonać native przez skill executing-plans; przed działaniami UI przeczytać obowiązujące instrukcje Impeccable i frontend-testing-debugging, przed kodem TDD, przed deklaracją sukcesu verification-before-completion. Jeżeli narzędzie niezależnego review jest niedostępne, nie zastępować go nowym wątkiem użytkownika bez prośby o taki wątek.
