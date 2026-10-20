import fs from 'node:fs';
import path from 'node:path';

const diagrams = {
  echo: ['PHP tworzy odpowiedź', ['1 · KOD PHP', '<?php', 'echo "<h2>Witaj</h2>";'], ['2 · TEKST ODPOWIEDZI', '<h2>Witaj</h2>', 'PHP zakończył pracę.'], ['3 · WIDOK PRZEGLĄDARKI', 'Witaj', 'HTML tworzy nagłówek h2.']],
  variables: ['Przypisanie zapisuje wartość', ['1 · INSTRUKCJA', '$name = "Ala";', '= zapisuje wartość po prawej.'], ['2 · PAMIĘĆ PROGRAMU', 'nazwa: $name   →   wartość: "Ala"', 'Typ wartości: string (tekst).'], ['3 · ODCZYT', 'echo $name;   →   Ala', 'Nazwa zmiennej pozwala wrócić do wartości.']],
  conditions: ['Porównanie wybiera drogę', ['1 · DANE I PYTANIE', '$points = 7;', '$points >= 5   →   true'], ['2 · TRUE: BLOK IF', 'echo "Zaliczone";', 'Ta instrukcja wykona się dla 7 punktów.'], ['3 · FALSE: BLOK ELSE', 'echo "Spróbuj ponownie";', 'Ta droga wykonałaby się np. dla 3 punktów.']],
  loops: ['Pętla zmienia licznik po obiegu', ['1 · START I WARUNEK', '$i = 1;   $i <= 3 → true', 'echo $i; wypisuje 1.'], ['2 · ZMIANA I KOLEJNE OBIEGI', '$i++ → 2 → wypisz 2', '$i++ → 3 → wypisz 3'], ['3 · ZATRZYMANIE', '$i++ → 4;   4 <= 3 → false', 'Wynik trzech obiegów: 1 2 3']],
  arrays: ['Indeks prowadzi do elementu', ['1 · KOLEKCJA', '$skills = ["HTML", "CSS", "PHP"];', 'Jedna zmienna, trzy wartości.'], ['2 · INDEKSY OD ZERA', '0 → "HTML"     1 → "CSS"     2 → "PHP"', '$skills[1] odczytuje drugi element.'], ['3 · WYNIK ODCZYTU', 'echo $skills[1];   →   CSS', 'foreach przechodzi po wszystkich elementach.']],
  functions: ['Argument wchodzi, wynik wraca', ['1 · WYWOŁANIE', '$result = doublePoints(4);', 'Argument 4 trafia do parametru $points.'], ['2 · CIAŁO FUNKCJI', 'return $points * 2;', '4 * 2 → 8; return kończy to wywołanie.'], ['3 · POWRÓT DO WYWOŁANIA', '$result = 8;   echo $result; → 8', 'return zwraca; dopiero echo wyświetla.']],
  forms: ['Formularz PHP: od pola do odpowiedzi', ['1 · HTML I ŻĄDANIE POST', '<input id="person" name="name" value="Ala">', 'name → klucz name; id → etykieta / CSS / JS'], ['2 · PHP: ODCZYT I SPRAWDZENIE', '$_POST["name"] → "Ala" → trim → walidacja', 'Brak lub zły typ → komunikat, bez powodzenia.'], ['3 · ODPOWIEDŹ HTML', 'htmlspecialchars → echo → Witaj, Ala!', 'Na serwerze nowy HTML zastępuje widok strony.']],
  project: ['Projekt łączy poznane kroki', ['1 · DANE', 'name → "Ala"', 'skills → ["HTML", "CSS", "PHP"]'], ['2 · PLAN (PSEUDOKOD)', 'zakoduj imię; dla każdej umiejętności: li', 'Dane tekstowe kodujemy przed wyjściem HTML.'], ['3 · EFEKT NA STRONIE', 'Ala', 'Lista: HTML · CSS · PHP']],
};
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const out = path.resolve('public/course-assets/php-teaching');
fs.mkdirSync(out, { recursive: true });
for (const [name, [title, ...steps]] of Object.entries(diagrams)) {
  const cards = steps.map(([label, code, note], i) => {
    const y = 100 + i * 184;
    const arrow = name === 'conditions'
      ? (i === 0 ? '<path d="M480 251v22m-7-7 7 7 7-7 M480 260H16V540H27m-7-7 7 7-7 7" fill="none" stroke="#6250a6" stroke-width="3"/>' : '')
      : (i < 2 ? `<path d="M480 ${y + 151}v22m-7-7 7 7 7-7" fill="none" stroke="#6250a6" stroke-width="3"/>` : '');
    return `<rect x="32" y="${y}" width="896" height="144" rx="16" fill="${(i === 2 && name !== 'conditions') || (i === 1 && name === 'conditions') ? '#edf9f3' : '#fff'}" stroke="#c8c8e0"/><text x="56" y="${y + 31}" fill="#6250a6" font-size="19" font-weight="700">${esc(label)}</text><text x="56" y="${y + 75}" fill="#202039" font-size="24" font-family="Consolas, monospace">${esc(code)}</text><text x="56" y="${y + 115}" fill="#42425b" font-size="21">${esc(note)}</text>${arrow}`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 676" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(steps.map(s => s.join('. ')).join(' Następnie: '))}</desc><rect width="960" height="676" rx="20" fill="#f5f3fb"/><g font-family="Arial, sans-serif"><text x="32" y="54" fill="#202039" font-size="31" font-weight="700">${esc(title)}</text><text x="32" y="82" fill="#5b5970" font-size="18">PHP · przykład edukacyjny · kod → działanie → efekt</text>${cards}</g></svg>`;
  fs.writeFileSync(path.join(out, `${name}.svg`), svg);
}
console.log(`Wygenerowano ${Object.keys(diagrams).length} diagramów PHP.`);
