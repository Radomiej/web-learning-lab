# Integracja Lab Game v2 — projekt do zatwierdzenia

Data: 2026-10-07. Status: projekt zatwierdzony; implementacja i końcowa weryfikacja w toku.

## Cel i źródło wymagań

Java Lab i Web Learning Lab mają pozwalać uczniowi zbudować tę samą grę survival po zmianie składni języka. Podstawą jest `C:/Users/rados/Downloads/Lab_Game_v2_specyfikacja_i_kurs.md`: kontrakt v2, 24 rozdziały, 72 zadania podstawowe, rozszerzenia i 43 scenariusze zgodności. Unity oznacza model GameObject/Transform/Component i znajomy cykl życia, a nie zgodność binarną z Unity.

Docelowa gra obejmuje ruch gracza, kamerę, fale przeciwników, automatyczne bronie, szybkie pociski, lokalne HP i nietykalność, dropy XP i złota, awanse z wyborem ulepszeń, pauzę, HUD, koniec rundy oraz restart. Mechaniki implementowane przez ucznia pozostają częścią kursu; infrastruktura silnika nie ukrywa rozwiązań zadań.

## Stan zastany

- Web: `src/services/gameRuntime.js` jest samodzielną fabryką wykonywaną także w iframe. Ruch skanuje scenę, a kontakty używają pełnej pętli par. Rozmiar fizyczny zależy od renderera i jego skali. Grafika Sprite jest obecnie reprezentowana proceduralnie.
- Java: źródła silnika są generowane z `src/data/game*Runtime.js`. `Physics2D` w `gamePhysicsRuntime.js` skanuje wszystkie obiekty podczas ruchu i sweep pocisku; deduplikacja kontaktów również przegląda listę. Jest już geometria koła i prostokąta oraz sweep pocisków.
- Kursy są niezależne: Web `src/data/gameLessons.js`, Java `src/data/lessons/gameDevCourse.js`. Trzeba zachować integrację z obecnymi fabrykami zadań, uruchamianiem kodu i zapisami ucznia.
- Java ma atlas SVG i walidator `tools/check-game-art.py`; walidator obsługuje ograniczony zestaw figur SVG i nie zastępuje kontroli nowych PNG.
- Istnieją lokalne zmiany użytkownika w obu repozytoriach. Wdrożenie zachowuje je i nie resetuje katalogów.

## Decyzja architektoniczna

Zachować dwa runtime’y symulacji: Java/JDK/TeaVM i JavaScript. Wprowadzić `shared/lab-game-v2` w Web jako źródło kontraktu, protokołu renderowania, renderera, manifestu zasobów, treści kursu i scenariuszy. Java otrzymuje kontrolowaną kopię. Synchronizacja zapisuje wersję, commit źródłowy i SHA-256 plików; jeżeli źródło jest niecommitowane, zapis musi jawnie odzwierciedlać ten stan i hashe.

Alternatywy: silnik JS z fasadą Java ograniczyłby duplikację fizyki, ale zwiększa zależność od mostu i osłabia naukę Javy. Dwa niezależne silniki z podobną dokumentacją nie zapewnią trwałej zgodności. Zewnętrzny silnik fizyki nie jest wymagany: obecny kurs potrzebuje deterministycznego ruchu kinematycznego, sensorów i sweep, nie pełnej dynamiki brył.

Publiczne API i wartości domyślne wynikają ze specyfikacji. W szczególności: jawna geometria colliderów niezależna od grafiki, rotation w radianach, środek grafiki, Vector2, snapshoty kolekcji, null przy braku komponentu, stabilne ID, WORLD/UI, onLateUpdate, osobne zegary pauzy, wejście niekonsumujące i kontrolowane przechwycenie przez UI. Renderer współdzielony obsługuje protokół bez reguł gameplay; adapter Java serializuje polecenia z TeaVM, JS emituje te same polecenia.

## Wykrywanie kolizji

W obu językach zastosować spatial hash z początkową komórką 64 px. Indeks obejmuje AABB aktywnych, zainicjalizowanych colliderów we wszystkich przecinanych komórkach. Duże collidery wymagają limitu liczby komórek i osobnej ścieżki zapytań, aby ogromna ściana nie powodowała niekontrolowanej alokacji.

Indeks przebudować po aktualizacji WORLD, następnie aktualizować wpis po każdym rozstrzygniętym ruchu. Zapytania podczas aktualizacji i po teleportach muszą mieć określoną świeżość; nie wolno zwracać nieaktualnych pozycji. Wyniki deduplikować po ID, kontakty po kanonicznej parze ID. Utrzymać deterministyczną kolejność i natychmiastowe wykluczenie zniszczonych obiektów.

Broad phase wybiera kandydatów dla obszaru całego ruchu. Narrow phase sprawdza koło/koło, koło/prostokąt i prostokąt/prostokąt, z tolerancją 1e-6. Ruch rozstrzyga X, następnie Y, zatrzymuje się na najbliższym kontakcie i umożliwia odsuwanie od ściany. Pociski sortują trafienia po parametrze odcinka i ID, obsługują maxHits, maski, właściciela i częściowy ostatni krok życia. Callback trafienia następuje przed automatycznym zniszczeniem.

Nie obiecywać bezwarunkowego kosztu liniowego: przy wszystkich obiektach w jednym miejscu liczba kontaktów może być kwadratowa. Kryterium jest usunięcie globalnego sprawdzania wszystkich par dla rozproszonej sceny. queryRadius i findNearest korzystają z tego samego indeksu.

## Kurs i wersjonowanie

Wspólny manifest przechowuje ID, opis, zależności, kryteria i scenariusze. Każde zadanie ma osobne, równoważne startery i rozwiązania Java/JS. Dopuszczalne różnice to składnia, typy, importy, przekazywanie klasy i integracja testów. Wspólny opis wyjaśnia model komponentów, nie szczegóły Canvas/TeaVM.

Użytkownik wyłączył wymóg utrzymywania v1 i legacy. Wdrożyć wyłącznie kurs v2; odrzucać eksporty starszego API bez zmiany ich kodu. Zapisy i eksporty przechowują engineApiVersion. Nie zaliczać automatycznie nowego zadania na podstawie starego ID i nie wstrzykiwać starterów innej wersji do zapisanej pracy.

## Zasoby i ImageGen

Utworzyć jeden manifest obejmujący sumę istniejących użytecznych kluczy, alias wall -> stone i ghost. Oba projekty muszą ładować te same pliki, nie tylko używać tych samych nazw.

Zatwierdzone uzupełnienie: publiczne klucze assetów w Javie to enum `Assets`, np. `Assets.FIREBALL` i `Assets.PLAYER01`; JavaScript udostępnia `Object.freeze` z identycznymi nazwami. Enum i stałe powstają z jednego manifestu, nie są osobnymi ręcznie utrzymywanymi katalogami. `PLAYER01` wskazuje bazowego gracza, a `FIREBALL` dedykowany obraz kuli ognia. Java `Sprite(Assets)` i `Sprite(Assets,width,height)` oraz `TileMap(Assets,tileSize)` rozwiązują klucz wewnętrznie. JS używa analogicznych konstruktorów. Klucze tekstowe identyfikują klatki atlasu; materiały i podpowiedzi używają Assets.

Po przeglądzie obecnego atlasu wygenerować przez ImageGen brakujące elementy survival: przeciwnika, boss, ikony broni/ulepszeń i dropów zgodne z istniejącą stylistyką. Domyślnie zachować czytelną grafikę 2D obecnego kursu; model komponentowy Unity nie narzuca stylu ilustracji. Sprite’y z prawdziwym kanałem alfa, centralnym punktem odniesienia, bez tekstu i watermarków.

Python sprawdza format, wymiary, alfa, niepustą zawartość, brak obcięcia na brzegach oraz środek bounding box alfa i centroid alfa. Asymetryczne postacie mogą mieć różny centroid; progi i wyjątki dokumentować. Obejrzeć atlas wizualnie i sprawdzić wyświetlenie w obu runtime’ach. Korekty obrazów wykonywać przez ImageGen; Python służy do kontroli oraz jawnie zleconego przygotowania assetów.

## Kolejność wdrożenia

1. Wspólny kontrakt i mechanizm synchronizacji, fixture testów oraz jawne odrzucenie projektów starszego API.
2. Parzyste API obiektów, czasu, wejścia, colliderów i ruchu; indeks przestrzenny, sweep i zapytania.
3. Wspólny renderer i assety, kamera, tweeny, UI i pauza.
4. Wspólny manifest kursu, sparowane startery/rozwiązania, gameplay survival i wersjonowanie.
5. Nowe assety ImageGen, kontrola Python, test gry końcowej i kompletna weryfikacja.

## Kryteria odbioru

- 43 scenariusze C01–C43 uruchomione na JS, Java/JDK i Java/TeaVM; porównanie stanu, kolejności zdarzeń i poleceń rysowania z tolerancją 1e-6.
- Test broad phase porównuje wynik z prostą implementacją referencyjną na scenach losowych oraz przypadkach: ujemne współrzędne, granice komórek, duże bryły, teleport, disable/destroy i sweep.
- Benchmark raportuje rzeczywistą liczbę kandydatów i testów narrow phase dla 100, 1000 i 5000 rozproszonych colliderów oraz czas kroku. Osobno dokumentuje scenę zatłoczoną. Wynik benchmarku nie jest gwarancją FPS na dowolnym sprzęcie.
- Każda para zadań ma wspólne kryteria i sprawdzony starter/rozwiązanie; końcowa gra obejmuje pełną pętlę rundy.
- Hashe wspólnych plików i assetów są zgodne; testy transferu odrzucają starsze API bez zmiany źródła.
- Testy i build obu repozytoriów uruchamiane kolejno; Vitest z jednym workerem zgodnie z AGENTS.md.
- Kontrola przeglądarkowa: desktop, niski laptop, mobile, klawiatura, pauza, resize, restart, assety i działający kod Java w TeaVM. Brak wykonanej kontroli raportować jawnie.

## Decyzja do zatwierdzenia

## Zastosowanie Game Studio i Product Design

Game Studio wspiera granice symulacji/renderera, manifest zasobów, pomiary wydajności i playtest. Ścieżka jest 2D ze wskazanym przez użytkownika istniejącym silnikiem Lab; domyślna rekomendacja Phaser nie zastępuje dwóch runtime’ów edukacyjnych. Canvas UI jest świadomym wymaganiem specyfikacji przenośnego API. Interfejs platformy kursowej pozostaje DOM/React.

Product Design wspiera spójność istniejących ekranów Java/Web: układ lekcji, dokumentację, sterowanie, HUD, wybór ulepszeń, pauzę i koniec rundy. Punktem wyjścia są istniejące komponenty i tokeny oraz instrukcje rodziny Lab. Zmiany wizualne mają być oceniane na zrzutach obu projektów przy tych samych wymiarach i stanach. Nie tworzyć osobnego prototypu produktu ani przeprojektowywać całej platformy w ramach integracji API.

## Zatwierdzenie projektu

Zatwierdzenie dotyczy dwóch runtime’ów ze wspólnymi plikami, własnego indeksu przestrzennego i pełnego zakresu kursu v2. Po zatwierdzeniu powstanie szczegółowy plan implementacji do wyboru sposobu wykonania. Ten dokument nie oznacza, że API, testy albo assety zostały już wdrożone.
