// Labelled relations for every non-game teaching chapter. No decorative game sprites.
// Each pair corresponds to the two main concepts, rather than a repeated chapter poster.
export const lessonConcepts = {
  'html-three-layers': [['HTML: struktura','CSS: wygląd','JS: zachowanie'],['plik HTML','osobny arkusz CSS','osobny skrypt JS']],
  'html-document': [['doctype: tryb HTML5','head: metadane','body: widoczna treść'],['html lang="pl"','rozpoznany język','czytnik: polska wymowa']],
  'html-text': [['h1: tytuł strony','h2: sekcja','h3: podsekcja'],['strong / em','znaczenie tekstu','CSS: osobna dekoracja']],
  'html-lists': [['ul: bez kolejności','ol: kroki po kolei','dl: pojęcie i opis'],['ul lub ol','bezpośrednie dziecko li','treść elementu listy']],
  'html-links': [['czytelna nazwa linku','href: adres lub #sekcja','nawigacja do celu'],['target="_blank"','rel="noopener"','nowa karta bez opener']],
  'html-media': [['obraz z informacją','alt: sens obrazu','dekoracja: alt=""'],['width + height','miejsce przed pobraniem','stabilny układ strony']],
  'html-tables': [['nagłówek kolumny','wiersz danych','komórka na przecięciu'],['th scope="col"','komórki tej kolumny','nagłówek czytnika ekranu']],
  'html-forms': [['label for="email"','input id="email"','etykieta wskazuje pole'],['type + required','walidacja przeglądarki','komunikat lub wysłanie']],
  'html-semantics': [['header / nav','main: główna treść','footer: zakończenie'],['natywny button','klawiatura i semantyka','ARIA tylko gdy potrzebna']],
  'css-intro': [['selektor .card','właściwość: color','wartość: blue'],['link do styles.css','reguły w kolejności','wynik kaskady']],
  'css-selectors': [['specyficzność reguł','kolejność przy remisie','styl wynikowy'],['class: wiele kart','wspólna reguła CSS','id: unikalny element']],
  'css-type-colors': [['root: 16 px','1.5 rem','rozmiar: 24 px'],['--accent: kolor','var(--accent)','wiele spójnych komponentów']],
  'css-box-model': [['content: 100 px','padding: 10 px na stronę','border: 2 px na stronę'],['width: 100 px','box-sizing: border-box','content: 76 px']],
  'css-display-position': [['display: sposób układu','position: punkt odniesienia','offset: przesunięcie'],['szersza treść','jawne overflow','przewijanie lub przycięcie']],
  'css-motion-project': [['stan początkowy','transition: zmiana','stan końcowy'],['@keyframes: sekwencja','prefers-reduced-motion','ograniczony ruch']],
  'flex-axis': [['kontener display:flex','bezpośrednie dzieci','jedna oś układu'],['flex-direction: row','justify-content: oś główna','align-items: oś poprzeczna']],
  'flex-wrap-gap': [['karta A','gap: 16 px','karta B'],['flex-wrap: wrap','kilka wierszy','align-content: całe wiersze']],
  'flex-sizing': [['flex-basis: baza','wolne miejsce','flex-grow: podział'],['flex-basis: baza','brakujące miejsce','flex-shrink: zmniejszenie']],
  'flex-exceptions': [['DOM: A → B → C','order: C → A → B','czytnik: nadal A → B → C'],['długi tekst','min-width: 0','zawijanie w dostępnym miejscu']],
  'flex-patterns': [['nawigacja: elementy','jedna oś + gap','czytelny toolbar'],['szeroko: wiersz kart','wąsko: kolumna kart','elastyczny układ']],
  'grid-basics': [['kolumny','wiersze','komórka siatki'],['minmax(180px,1fr)','minimum czytelności','podział wolnego miejsca']],
  'grid-areas': [['header: cała szerokość','nav obok main','footer: cała szerokość'],['Flex: jeden kierunek','Grid: dwie osie','wybierz według relacji']],
  'responsive-layouts': [['mały ekran','elastyczne szerokości','treść bez ucięcia'],['mobile: jedna kolumna','więcej przestrzeni','desktop: kilka kolumn']],
  'js-browser': [['semantyczny HTML','zdarzenie użytkownika','JS dodaje zachowanie'],['const: stałe przypisanie','let: zmienna wartość','czytelna intencja']],
  'js-conditions-functions': [['warunek','true: gałąź A','false: gałąź B'],['parametry funkcji','nazwana operacja','wartość return']],
  'js-data-loops': [['[1,2,3]','map: n × 2','[2,4,6]'],['obiekt: name + score','powiązane dane','czytelne nazwy właściwości']],
  'js-dom': [['dokument HTML','drzewo DOM','zmiana tekstu lub klasy'],['tekst: <b>Hej</b>','textContent','dosłowny tekst, bez HTML']],
  'js-events-forms': [['click / submit','handler zdarzenia','jedna reakcja'],['submit','preventDefault()','własna obsługa + komunikat']],
  'js-small-state': [['stan danych','render(state)','widok użytkownika'],['lista pusta','komunikat: brak danych','użytkownik zna następny krok']],
  'js-validation-storage': [['dane wejściowe','walidacja + obsługa błędu','poprawny stan'],['localStorage: tekst','JSON.parse + sprawdzenie','stan aplikacji']],
  'js-event-planner': [['dane wydarzenia','reguły i walidacja','wyrenderowany planer'],['dodanie wydarzenia','aktualizacja stanu','odświeżenie listy']],
  'react-jsx': [['JSX','drzewo elementów React','widok w sandboxie'],['wyrażenie {value}','wartość z JavaScript','tekst w komponencie']],
  'react-components-props': [['rodzic','props do dziecka','widok dziecka'],['jeden komponent Card','różne props','wiele kart']],
  'react-state-events': [['kliknięcie','setState','ponowny render'],['stan: 0','aktualizacja: +1','widok: 1']],
  'react-lists-conditions': [['tablica danych','map + stabilny key','lista komponentów'],['warunek: true','render elementu','false: alternatywa']],
  'react-controlled-forms': [['state','value pola','onChange → state'],['wpisany tekst','walidacja stanu','submit lub komunikat']],
  'react-effects-data': [['zmiana zależności','effect: synchronizacja','cleanup starego efektu'],['dane rodzica','props do dziecka','zdarzenie wraca callbackiem']],
  'react-composition-hooks': [['komponent rodzic','children','złożony interfejs'],['wspólna logika','własny hook','osobny stan wywołań']],
  'react-task-board': [['dane zadań','stan + komponenty','tablica zadań'],['akcja użytkownika','nowy stan','widok wynikający ze stanu']],
  'php-echo': [['kod PHP','wykonanie w PHP.wasm','echo: wynik tekstowy'],['echo: fragment HTML','wynik skryptu','przeglądarka renderuje HTML']],
  'php-variables': [['$name','przypisanie =','wartość zmiennej'],['"Hej " . $name','łączenie tekstu','jeden wynik tekstowy']],
  'php-conditions': [['warunek if','true: blok if','false: blok else'],['decyzja','zmienna komunikatu','echo: wynik HTML']],
  'php-loops': [['for: licznik','sprawdź warunek','krok licznika'],['while: warunek','instrukcje + zmiana','koniec po false']],
  'php-arrays-foreach': [['tablica wartości','kolejny element','foreach: operacja'],['kolekcja danych','foreach + HTML','lista bez kopiowania kodu']],
  'php-functions': [['parametry','funkcja','return: wartość'],['funkcja: dane','kod wywołujący','echo: miejsce wyświetlenia']],
  'php-post-forms': [['formularz POST','dane użytkownika','sprawdzenie wejścia'],['tekst z < i >','htmlspecialchars','encje zamiast znaczników']],
  'php-profile-project': [['dane + funkcje','pętla + HTML','karta profilu'],['poprawny wynik','porządek odpowiedzialności','czytelny kod projektu']],
  'fundamentals-01': [['klasa programu','main: punkt wejścia','System.out: wynik'],['plik .java','kompilacja','uruchomienie programu']],
  'fundamentals-02': [['typ: int','nazwa: score','wartość: 10'],['score = 10','score += 5','score = 15']],
  'fundamentals-03': [['warunek','true: wykonaj blok','false: pomiń blok'],['sprawdź warunek pętli','wykonaj + zmień stan','sprawdź ponownie']],
  'fundamentals-04': [['parametry metody','jedna odpowiedzialność','return: wynik'],['kod wywołujący','metoda z nazwą','czytelna operacja']],
  'objects-05': [['klasa: opis','new: instancja','obiekt: własny stan'],['obiekt A: score 1','obiekt B: score 0','zmiana A nie zmienia B']],
  'objects-06': [['parametry konstruktora','sprawdź poprawność','poprawny obiekt'],['private: dane','public: metoda','kontrolowana zmiana stanu']],
  'objects-07': [['Player','ma komponent Health','Health: własna reguła'],['obiekt właściciela','referencja do części','delegowanie operacji']],
  'objects-08': [['dane wejściowe','metoda obiektu','sprawdzalny wynik'],['przygotuj stan','wykonaj operację','porównaj oczekiwany wynik']],
  'inheritance-09': [['klasa bazowa','extends','klasa potomna'],['wspólne zachowanie','specjalizacja potomka','użycie odziedziczonej metody']],
  'inheritance-10': [['metoda bazowa','@Override w potomku','nowe zachowanie'],['wywołanie metody','rzeczywisty typ obiektu','implementacja potomka']],
  'inheritance-11': [['referencja typu bazowego','obiekt typu potomnego','właściwa metoda'],['wspólny interfejs','różne implementacje','jednakowy sposób wywołania']],
  'inheritance-12': [['niepoprawne dane','wyjątek','czytelna informacja'],['try: operacja','catch: obsługa','program odzyskuje kontrolę']],
};

export function withConceptVisuals(lesson, pages) {
  const concepts = lessonConcepts[lesson.id];
  if (!concepts) return pages;
  return pages.map((page, i) => {
    const objective = page.title === 'Czego się nauczysz' || page.title === 'Cel lekcji';
    const recap = page.title === 'Zapamiętaj';
    const conceptIndex = Math.max(0, i - (pages[0].title === 'Czego się nauczysz' ? 1 : 0)) % concepts.length;
    const nodes = objective ? [concepts[0][0], concepts[0][1], concepts[1][2]] : recap ? [concepts[0][2], 'połącz obie zasady', concepts[1][2]] : concepts[conceptIndex];
    const kind = !objective && !recap && lesson.id==='css-box-model' ? 'box-model'
      : !objective && !recap && /^(flex-axis|flex-wrap-gap|flex-patterns|grid-basics|responsive-layouts)$/.test(lesson.id) ? 'layout' : 'flow';
    const parallel = !objective && !recap && conceptIndex===0 && ['html-three-layers','html-document','html-lists','html-semantics','css-display-position'].includes(lesson.id);
    const decision = /^(true|tak):/i.test(nodes[1]) && /^(false|nie):/i.test(nodes[2]);
    return { ...page, visual: { kind, variant: conceptIndex, nodes, relation: parallel ? 'parallel' : 'sequence', note: objective ? 'Mapa pojęć tej lekcji.' : recap ? 'Te reguły stosujemy razem w zadaniu.' : nodes.join(parallel || decision ? ' • ' : ' → ') } };
  });
}
