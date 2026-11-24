# Animacje mobów w Game Lab — projekt

## Cel

Nadać animacje 15 istniejącym mobom w Game Lab Java i Web. Dla każdego moba powstanie sześć klipów: `idle`, `walk`, `run`, `attack`, `takeHit`, `death`. Grafiki mają zachować styl, sylwetkę, paletę i kierunek obecnych sprite’ów.

## Zakres

Moby: `slime`, `slime-blue`, `slime-red`, `slime-purple`, `bat`, `ghost`, `skeleton`, `zombie`, `goblin`, `orc`, `spider`, `wolf`, `mushroom-monster`, `floating-eye`, `boss-demon`.

| Klip | Klatki | FPS | Odtwarzanie |
| --- | ---: | ---: | --- |
| idle | 6 | 6 | pętla |
| walk | 8 | 10 | pętla |
| run | 8 | 12 | pętla |
| attack | 6 | 12 | jednorazowo |
| takeHit | 4 | 12 | jednorazowo |
| death | 8 | 8 | jednorazowo |

Łącznie: 90 klipów i 600 klatek. Domyślny format to 128×128 px na klatkę, przezroczyste tło, jeden atlas PNG 8×6 na moba (1024×768 px). Puste pola uzupełniają krótsze klipy. Kompozycja i kotwica pozostają wyśrodkowane tak jak w obecnych sprite’ach; grafiki zachowują pojedynczy kierunek, z użyciem istniejącego `flipX`.

## Stan obecny i ograniczenia

- Java i Web mają już `SpriteAnimator`. JavaScript oraz Java odtwarzają tablicę klatek, obsługują FPS, pętlę, `play()` i `stop()`; `loop=false` zatrzymuje klip na ostatniej klatce.
- Brakuje animowanych grafik i wygodnego katalogu nazwanych klipów. Renderer rozpoznaje obecnie klucze z `assetManifest.assets` i ładuje źródła wymienione w tej liście.
- Web lab jest źródłem wspólnych danych `shared/lab-game-v2`; `scripts/sync-lab-game-v2.mjs` kopiuje je i grafiki do Java lab. Java i Web mają oddzielne wykonanie JS/Java, które trzeba podłączyć do tych samych metadanych.
- W repozytoriach są niezapisane zmiany użytkownika poza zakresem tej pracy. Należy ich nie nadpisywać ani nie cofać. `lab-core` nie jest częścią zmian: oba wskazane laby używają własnych runtime’ów i wspólnego katalogu `lab-game-v2`.

## Podejścia

1. Dodać każdą klatkę do zwykłego katalogu assetów. Zadziała z obecnym rendererem, ale dodałoby do galerii i podpowiedzi setki technicznych kluczy.
2. Trzymać atlasy oraz klipy w osobnych metadanych animacji i udostępnić 90 nazwanych klipów przez wspólny katalog Java/JS. Renderer rozwiązuje klucze klatek wewnętrznie; galeria zwykłych assetów pozostaje bez zmian. **Wybrane:** wykorzystuje istniejący `SpriteAnimator`, nie wymaga zmiany formatu komend rysowania i utrzymuje manifest czytelny dla ucznia.
3. Dostarczyć same obrazy i wymagać ręcznego składania tablic klatek przez autorów gier. To nie zapewni wygodnego odtwarzania z wybraną prędkością i trybem pętli w obu językach.

## Projekt rozwiązania

- Wygenerować osobny przezroczysty pasek dla każdej pary mob/stan, z istniejącym sprite’em jako referencją. Każdy klip rozpoczyna się pozą bazową, gdy pasuje do ruchu. Nie zmieniać istniejących statycznych sprite’ów.
- Użyć procesu `game-studio:sprite-pipeline`: edycja całego paska w jednym wywołaniu, normalizacja wspólną skalą do 128×128, podgląd kontaktowy. Normalizacja w projekcie zachowuje centralną kotwicę bieżących assetów. Python przygotowuje płótna, składa atlas 8×6, sprawdza przezroczystość/granice i tworzy podglądy; porównanie pikselowe służy głównie potwierdzeniu zgodności klatki bazowej.
- Zapisać atlasy w `public/game-assets/animations/mobs/` i dodać do manifestu osobne metadane `animations`. Każdy klip opisuje źródłowy atlas, pozycje i liczbę klatek, FPS oraz `loop`.
- Wygenerować wspólny katalog `Animations` dla JavaScript i enum `Animations` dla Javy. Każda stała zawiera opis klipu: klucze klatek, FPS i tryb pętli. Rozszerzyć istniejący `SpriteAnimator`, aby przyjmował taki opis obok obecnych tablic; zachować dotychczasowe konstruktory i `play(frames, fps)`.
- Rozszerzyć wspólny renderer o wewnętrzne wyszukiwanie klatek w atlasach animacji i ładowanie tych źródeł. Nie dodawać klatek do widocznej galerii ani do zwykłego enumu `Assets`.
- Zaktualizować przewodnik API i podpowiedzi, a potem zsynchronizować wspólne pliki i PNG do Java lab przez istniejący skrypt synchronizacji.
- Kody gry wybierają stan przez `SpriteAnimator.play(...)`. Automatyczne wykrywanie ataku, obrażeń i śmierci w AI/Health nie wchodzi w zakres; API dostarcza klipy do odtwarzania.

## Poza zakresem

Animacje postaci grywalnych, skrzyń, monet, pocisków, efektów, otoczenia i UI pozostają na osobnej liście potrzeb. Nie zmieniamy zachowania istniejących gier ani fizyki.

## Przegląd jakości

Przed użyciem klipów sprawdzić kompletność 90 sekwencji, liczbę i granice komórek atlasów, przezroczystość, stabilną skalę/kotwicę, zgodność pozy bazowej i czytelność animacji w podglądach oraz w obu rendererach. Sprawdzić synchronizację plików przez `scripts/sync-lab-game-v2.mjs --check`. Dla widocznej zmiany w Java lab zaktualizować screenshoty i `artifacts/CHANGELOG.md` zgodnie z jego `AGENTS.md`.

## Decyzje do zatwierdzenia

Zakres 15 mobów i sześciu klipów oraz ręczny wybór stanu przez istniejące `SpriteAnimator.play(...)` zostały potwierdzone przez użytkownika. Automatyczne przełączanie przez AI/Health pozostaje poza zakresem. Liczby klatek/FPS, centralna kotwica i osobne atlasy na moba są decyzjami implementacyjnymi zaproponowanymi w tym projekcie. Cały dokument wymaga akceptacji przed generowaniem grafik i zmianami runtime’u.
