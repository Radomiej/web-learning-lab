# Podgląd kursu JS — 2026-10-20

Zmiany lokalne w web-learning-lab oraz zgodność odbiornika w lab-admin. Bez push/deploy.

## Ilustracje

Wbudowany ImageGen, 1536×1024, pliki public/course-assets/js-foundations/variables.png, objects.png, methods.png, dom.png. Wszystkie obejrzano przed podłączeniem. Poprawiono wygenerowane zdanie o const: zakaz ponownego przypisania do nazwy, nie zamrożenie obiektu.

Zestaw promptów: polskie infografiki dydaktyczne na białym tle, granatowa typografia, turkusowe strzałki, złote wyróżnienia, duży kod monospace. Każda ma pokazać operację i konkretny wynik, bez ogólnych dekoracji.
- variables: let punkty = 2; potem punkty = punkty + 3; ta sama nazwa i wynik 5; const imie = "Ola" oznacza stałe przypisanie. Korekta: „const nie pozwala ponownie przypisać wartości do tej samej nazwy.”
- objects: const uczen = { imie: "Ola", punkty: 5 }; właściwości i wartości; uczen.imie daje "Ola", uczen.punkty daje 5.
- methods: const kalkulator = { podwoj(n) { return n * 2; } }; rozłożenie kalkulator.podwoj(3) na obiekt, metodę i argument; przepływ 3 → ×2 → 6; nawiasy uruchamiają metodę.
- dom: <p id="message">Start</p>; document → html → body → p#message; const akapit = document.getElementById("message"); akapit.textContent = "Cześć!"; ten sam element, nowy widoczny tekst.

## Weryfikacja wizualna

W przeglądarce otwarto wszystkie 21 kroków czterech pierwszych lekcji, sprawdzono obrazki, nawigację i quiz rozwijany Enterem. Sprawdzono widok 1280×720, 1366×768 i 390×844; mobilny DOM bez przepełnienia poziomego. Infografiki mają pełny opis tekstowy i odnośnik do powiększenia. Zapisane podglądy: dom-mobile.png, quiz-laptop.png. Generator otwarty z kontekstem lekcji DOM, następnie rzeczywiście wygenerowano zadanie o zmiennych, wpisano kod i uruchomiono go w iframe: console.log wypisał 8.

Oddań testowych nie wysyłano do produkcyjnego RabbitMQ. Odtwarzanie klucza i akceptację przez panel nauczyciela sprawdzają testy z atrapą publikacji. Pełny build przy domyślnym limicie Node zakończył się brakiem pamięci, ponowienie z większą stertą przerwano po nadmiernym zużyciu zasobów podczas transformacji zależności całej aplikacji. Nie jest to dowód udanego pełnego buildu.


## Wyniki sprawdzeń

- Vitest: 47/47 (10 plików; jeden worker).
- Node: generator, quiz i API oddań — 13/13; odbiornik lab-admin — 2/2.
- Build lab-admin zakończony powodzeniem.
- Przegląd agenta: zgodność seeda, klucza, deskryptorów i resetowania stanu, bez problemów blokujących.
- Źródło API: https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById

Uruchomiony lokalny podgląd: http://127.0.0.1:5184/. Dla tej sesji procesu dozwolono wyłącznie ten lokalny Origin. Plików środowiska ani produkcyjnych dozwolonych źródeł nie zmieniano.
