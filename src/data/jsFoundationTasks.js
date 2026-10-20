import { createTask } from './lessonFactories.js';

// No DOM prerequisites: the first three lessons are checked using console output.
const recipes = {
  'js-browser': [
    { prompt: 'Zadeklaruj let punkty = 2. Dodaj do tej wartości 3 przez nowe przypisanie, a następnie wypisz punkty przez console.log. W konsoli ma pojawić się 5. Uruchom przycisk ▶ Play.', code: 'let punkty = 2;\npunkty = punkty + 3;\nconsole.log(punkty);', expected: '5' },
    { prompt: 'Zadeklaruj const imie z tekstem "Jan" i let poziom z liczbą 1. Zmień poziom na 2. Wypisz imie i poziom w jednym console.log, aby uzyskać Jan 2.', code: 'const imie = "Jan";\nlet poziom = 1;\npoziom = 2;\nconsole.log(imie, poziom);', expected: 'Jan 2' },
  ],
  'js-objects': [
    { prompt: 'Utwórz obiekt uczen z właściwościami imie: "Ola" i punkty: 5. Odczytaj obie właściwości przez kropkę i wypisz je w jednym console.log. Oczekiwany wynik: Ola 5.', code: 'const uczen = { imie: "Ola", punkty: 5 };\nconsole.log(uczen.imie, uczen.punkty);', expected: 'Ola 5' },
    { prompt: 'Utwórz const kurs z właściwościami nazwa: "JavaScript" i lekcje: 3. Zmień właściwość lekcje na 4. Odczytaj nazwę i liczbę lekcji przez kropkę i wypisz je w jednym console.log. Oczekiwany wynik: JavaScript 4.', code: 'const kurs = { nazwa: "JavaScript", lekcje: 3 };\nkurs.lekcje = 4;\nconsole.log(kurs.nazwa, kurs.lekcje);', expected: 'JavaScript 4' },
  ],
  'js-functions': [
    { prompt: 'Napisz funkcję podwoj(n), która zwraca n * 2 przez return. Wywołaj ją z argumentem 4 i wypisz zwrócony wynik przez console.log. Oczekiwany wynik: 8.', code: 'function podwoj(n) { return n * 2; }\nconsole.log(podwoj(4));', expected: '8' },
    { prompt: 'Utwórz obiekt kalkulator z metodą dodaj(a, b), która zwraca sumę argumentów przez return. Wywołaj kalkulator.dodaj z argumentami 3 i 6, a wynik wypisz przez console.log. Oczekiwany wynik: 9.', code: 'const kalkulator = { dodaj(a, b) { return a + b; } };\nconsole.log(kalkulator.dodaj(3, 6));', expected: '9' },
  ],
};

export function jsFoundationTasks(definition, base) {
  return recipes[definition.id]?.map((recipe, index) => {
    const mode = index ? 'independent' : 'guided';
    const id = `${definition.id}-${mode}-foundations-v3`;
    const starter = { ...base, html: '<main><h1>Laboratorium JavaScript</h1><p>W tej lekcji wynik programu odczytasz w konsoli pod edytorem. Uruchom przycisk ▶ Play.</p></main>', js: '// Napisz program. Wynik wypisz przez console.log.\n' };
    return createTask({ id, mode, track: 'js', title: index ? 'Teraz samodzielnie' : 'Przećwicz krok po kroku', prompt: recipe.prompt, starter, solution: { ...starter, js: recipe.code }, hint: 'Wróć do kroków wyjaśnienia. Wynik pojawia się w konsoli po użyciu przycisku ▶ Play.', checks: [
      { id: `${id}-output`, type: 'consoleOutput', expected: recipe.expected, label: `Konsola wypisuje dokładnie: ${recipe.expected}` },
      { id: `${id}-errors`, type: 'runtimeError', label: 'Program wykonuje się bez błędów' },
    ] });
  });
}

export function legacyJsSequence(id) {
  return { 'js-dom': 4, 'js-conditions-functions': 2, 'js-data-loops': 3, 'js-events-forms': 5, 'js-small-state': 6, 'js-validation-storage': 7, 'js-event-planner': 8 }[id];
}
