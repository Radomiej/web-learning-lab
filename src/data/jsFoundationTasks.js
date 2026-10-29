import { createTask } from './lessonFactories.js';

// No DOM prerequisites: the first lessons combine console output with runtime
// probes — jsProbe reads the student's actual variables and calls their
// functions, so console.log(5) alone no longer passes as "adding 3".
const recipes = {
  'js-browser': [
    { prompt: 'Zadeklaruj let punkty = 2. Dodaj do tej wartości 3 przez nowe przypisanie, a następnie wypisz punkty przez console.log. W konsoli ma pojawić się 5. Uruchom przycisk ▶ Play.', code: 'let punkty = 2;\npunkty = punkty + 3;\nconsole.log(punkty);', expected: '5', verify: [
      { type: 'jsProbe', expression: 'punkty', expected: 5, label: 'Zmienna punkty istnieje i przechowuje liczbę 5' },
      { type: 'sourceMatches', file: 'script.js', pattern: 'punkty\\s*(?:\\+=\\s*3\\b|=\\s*punkty\\s*\\+\\s*3\\b)', label: 'Wartość punkty wzrasta o 3 przez nowe przypisanie (np. punkty = punkty + 3)' },
    ] },
    { prompt: 'Zadeklaruj const imie z tekstem "Jan" i let poziom z liczbą 1. Zmień poziom na 2. Wypisz imie i poziom w jednym console.log, aby uzyskać Jan 2.', code: 'const imie = "Jan";\nlet poziom = 1;\npoziom = 2;\nconsole.log(imie, poziom);', expected: 'Jan 2', verify: [
      { type: 'jsProbe', expression: 'imie', expected: 'Jan', label: 'Stała imie przechowuje tekst „Jan”' },
      { type: 'jsProbe', expression: 'poziom', expected: 2, label: 'Zmienna poziom ma wartość 2' },
    ] },
  ],
  'js-objects': [
    { prompt: 'Utwórz obiekt uczen z właściwościami imie: "Ola" i punkty: 5. Odczytaj obie właściwości przez kropkę i wypisz je w jednym console.log. Oczekiwany wynik: Ola 5.', code: 'const uczen = { imie: "Ola", punkty: 5 };\nconsole.log(uczen.imie, uczen.punkty);', expected: 'Ola 5', verify: [
      { type: 'jsProbe', expression: 'uczen.imie', expected: 'Ola', label: 'uczen.imie zwraca „Ola”' },
      { type: 'jsProbe', expression: 'uczen.punkty', expected: 5, label: 'uczen.punkty ma wartość 5' },
    ] },
    { prompt: 'Utwórz const kurs z właściwościami nazwa: "JavaScript" i lekcje: 3. Zmień właściwość lekcje na 4. Odczytaj nazwę i liczbę lekcji przez kropkę i wypisz je w jednym console.log. Oczekiwany wynik: JavaScript 4.', code: 'const kurs = { nazwa: "JavaScript", lekcje: 3 };\nkurs.lekcje = 4;\nconsole.log(kurs.nazwa, kurs.lekcje);', expected: 'JavaScript 4', verify: [
      { type: 'jsProbe', expression: 'kurs.lekcje', expected: 4, label: 'kurs.lekcje ma wartość 4 po zmianie' },
    ] },
  ],
  'js-functions': [
    { prompt: 'Napisz funkcję podwoj(n), która zwraca n * 2 przez return. Wywołaj ją z argumentem 4 i wypisz zwrócony wynik przez console.log. Oczekiwany wynik: 8.', code: 'function podwoj(n) { return n * 2; }\nconsole.log(podwoj(4));', expected: '8', verify: [
      { type: 'jsProbe', expression: 'podwoj(7)', expected: 14, label: 'Sprawdzamy, czy funkcja zwraca poprawny wynik także dla innego argumentu: podwoj(7) powinno zwrócić 14' },
    ] },
    { prompt: 'Utwórz obiekt kalkulator z metodą dodaj(a, b), która zwraca sumę argumentów przez return. Wywołaj kalkulator.dodaj z argumentami 3 i 6, a wynik wypisz przez console.log. Oczekiwany wynik: 9.', code: 'const kalkulator = { dodaj(a, b) { return a + b; } };\nconsole.log(kalkulator.dodaj(3, 6));', expected: '9', verify: [
      { type: 'jsProbe', expression: 'kalkulator.dodaj(2, 5)', expected: 7, label: 'Sprawdzamy, czy metoda zwraca poprawny wynik także dla innych argumentów: kalkulator.dodaj(2, 5) powinno zwrócić 7' },
    ] },
  ],
};

export function jsFoundationTasks(definition, base) {
  return recipes[definition.id]?.map((recipe, index) => {
    const mode = index ? 'independent' : 'guided';
    const id = `${definition.id}-${mode}-foundations-v3`;
    const starter = { ...base, html: '<main><h1>Laboratorium JavaScript</h1><p>W tej lekcji wynik programu odczytasz w konsoli pod edytorem. Uruchom przycisk ▶ Play.</p></main>', js: '// Napisz program. Wynik wypisz przez console.log.\n' };
    return createTask({ id, mode, track: 'js', title: index ? 'Teraz samodzielnie' : 'Przećwicz krok po kroku', prompt: recipe.prompt, starter, solution: { ...starter, js: recipe.code }, hint: 'Wróć do kroków wyjaśnienia. Wynik pojawia się w konsoli po użyciu przycisku ▶ Play.', checks: [
      { id: `${id}-output`, type: 'consoleOutput', expected: recipe.expected, label: `Konsola wypisuje dokładnie: ${recipe.expected}` },
      ...(recipe.verify || []).map((check, verifyIndex) => ({ id: `${id}-verify-${verifyIndex}`, ...check })),
      { id: `${id}-errors`, type: 'runtimeError', label: 'Program wykonuje się bez błędów' },
    ] });
  });
}

export function legacyJsSequence(id) {
  return { 'js-dom': 4, 'js-conditions-functions': 2, 'js-data-loops': 3, 'js-events-forms': 5, 'js-small-state': 6, 'js-validation-storage': 7, 'js-event-planner': 8 }[id];
}
