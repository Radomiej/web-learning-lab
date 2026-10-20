import { createTask } from './lessonFactories.js';

export function jsExtraTasks(definition, base) {
  if (!['js-function-values', 'js-comparisons', 'js-error-handling', 'js-fetch'].includes(definition.id)) return null;
  return ['guided', 'independent'].map((mode, index) => {
    const id = `${definition.id}-${mode}-v1`;
    let prompt, code, expected, fixture = '', consoleOnly = true;
    if (definition.id === 'js-function-values') {
      prompt = index ? 'Utwórz obiekt profil z imie: "Ewa" i metodą przedstaw() zwracającą this.imie. Przypisz profil.przedstaw.bind(profil) do zmiennej reakcja, wywołaj reakcja() i wypisz wynik w konsoli.' : 'Napisz funkcję potroj(n) zwracającą n * 3. Przypisz samą funkcję potroj do const operacja (bez wywołania). Wywołaj operacja(4) i wypisz wynik w konsoli.';
      code = index ? 'const profil = { imie: "Ewa", przedstaw() { return this.imie; } };\nconst reakcja = profil.przedstaw.bind(profil);\nconsole.log(reakcja());' : 'function potroj(n) { return n * 3; }\nconst operacja = potroj;\nconsole.log(operacja(4));';
      expected = index ? 'Ewa' : '12';
    } else if (definition.id === 'js-comparisons') {
      prompt = index ? 'Przypisz tekst "12" do const tekst. W jednym console.log wypisz: tekst === 12 oraz Number(tekst) >= 12. Wynik ma brzmieć false true.' : 'Przypisz 10 do const punkty. W jednym console.log wypisz wyniki punkty > 10 i punkty >= 10. Oczekiwany wpis: false true.';
      code = index ? 'const tekst = "12";\nconsole.log(tekst === 12, Number(tekst) >= 12);' : 'const punkty = 10;\nconsole.log(punkty > 10, punkty >= 10);';
      expected = 'false true';
    } else if (definition.id === 'js-error-handling') {
      prompt = index ? 'Napisz funkcję sprawdz(wartosc), która rzuca new Error("Wymagana liczba"), gdy typeof wartosc nie jest "number". W try wywołaj sprawdz("12"), a w catch(error) wypisz error.message przez console.log.' : 'Zadeklaruj let komunikat = "" i let koniec = false. W try rzuć new Error("Brak pliku"). W catch(error) przypisz error.message do komunikat. W finally ustaw koniec na true. Po całym try/catch/finally wypisz komunikat i koniec w jednym console.log.';
      code = index ? 'function sprawdz(wartosc) { if (typeof wartosc !== "number") throw new Error("Wymagana liczba"); return wartosc; }\ntry { sprawdz("12"); } catch (error) { console.log(error.message); }' : 'let komunikat = "";\nlet koniec = false;\ntry { throw new Error("Brak pliku"); } catch (error) { komunikat = error.message; } finally { koniec = true; }\nconsole.log(komunikat, koniec);';
      expected = index ? 'Wymagana liczba' : 'Brak pliku true';
    } else {
      consoleOnly = false;
      fixture = index ? 'const url = "data:application/json,{broken}";\n' : 'const url = "data:application/json," + encodeURIComponent(JSON.stringify({ title: "Biblioteka" }));\n';
      expected = index ? 'Błąd pobierania' : 'Biblioteka';
      prompt = `Adres url jest przygotowany jako lokalne dane testowe data: — nie wymaga Internetu. Napisz async function wczytaj() z try/catch. Użyj await fetch(url), sprawdź response.ok (dla false rzuć Error), a następnie await response.json(). ${index ? 'Dane są celowo uszkodzonym JSON-em. W catch pokaż „Błąd pobierania” w #result.' : 'Sprawdź, że dane.title jest tekstem, i pokaż ten tytuł w #result. W catch pokaż „Błąd pobierania”.'} Wywołaj wczytaj().`;
      code = fixture + 'async function wczytaj() {\n  const wynik = document.getElementById("result");\n  wynik.textContent = "Ładowanie…";\n  try {\n    const response = await fetch(url);\n    if (!response.ok) throw new Error("HTTP " + response.status);\n    const dane = await response.json();\n    if (!dane || typeof dane.title !== "string") throw new Error("Brak tytułu");\n    wynik.textContent = dane.title;\n  } catch {\n    wynik.textContent = "Błąd pobierania";\n  }\n}\nwczytaj();';
    }
    const starter = { ...base, html: `<main><h1>${definition.title}</h1>${consoleOnly ? '<p>Wynik odczytasz w konsoli.</p>' : '<output id="result">Czeka</output>'}</main>`, js: fixture + '// Napisz rozwiązanie w script.js.\n' };
    const checks = [consoleOnly ? { type: 'consoleOutput', expected, label: `Konsola: ${expected}` } : { type: 'textEquals', selector: '#result', expected, pendingText: 'Ładowanie…', label: `Wynik: ${expected}` }, { type: 'runtimeError', label: 'Brak nieobsłużonych błędów' }].map((check, i) => ({ ...check, id: `${id}-${i}` }));
    return createTask({ id, mode, track: 'js', title: index ? 'Teraz samodzielnie' : 'Przećwicz krok po kroku', prompt, starter, solution: { ...starter, js: code }, checks });
  });
}
