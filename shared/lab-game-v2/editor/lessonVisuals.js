// Shared teaching examples. Values illustrate rules, never the live scene or a task solution.
const flow = (title, text, nodes, note) => ({ title, text, visual: { kind: 'flow', nodes, note } });
const picture = (title, text, kind, variant = 0, note = '') => ({ title, text, visual: { kind, variant, note } });
export const gameExplanationPages = {
  scene: [
    flow('Z czego składa się scena?', 'Game przechowuje obiekty. GameObject ma pozycję i komponenty. Dopiero Sprite lub ShapeRenderer nadaje mu widoczny wygląd.', ['Game', 'GameObject', 'Transform + Sprite'], 'Obiekt bez renderera może istnieć, ale nie zobaczysz go na planszy.'),
    picture('Gdzie znajduje się obiekt?', 'Transform określa punkt obiektu w świecie. W tym silniku X rośnie w prawo, Y w dół. Przykład (100,150) oznacza 100 jednostek w prawo i 150 w dół od początku mapy.', 'position', 0, 'Czerwony X → w prawo. Niebieski Y ↓ w dół.'),
    picture('Pozycja, wygląd i collider', 'Sprite i collider umieszczamy względem pozycji obiektu. Ich wymiary oraz przesunięcia są osobne. Transform nie określa środka widocznych pikseli grafiki.', 'position', 1, 'Punkt obiektu ≠ rozmiar grafiki. Collider ma własny kształt.'),
  ],
  components: [
    flow('Właściciel i zachowanie', 'Komponent należy do GameObject. Klasa opisuje zachowanie, a każda nowa instancja przechowuje własne dane. gameObject wskazuje właściciela komponentu.', ['GameObject', 'new Counter()', 'własne counts'], 'Do dwóch właścicieli dodaj dwie instancje.'),
    picture('Osobny stan każdej instancji', 'Zmiana licznika komponentu A nie zmienia komponentu B. Pole instancji należy do jednego komponentu; static jest wspólne dla klasy.', 'instances', 0),
    flow('Cykl życia komponentu', 'onCreate inicjalizuje komponent raz. onUpdate(delta) aktualizuje go w kolejnych klatkach. onDestroy sprząta zasoby przy usuwaniu.', ['onCreate • raz', 'onUpdate • klatki', 'onDestroy • koniec'], 'Tworzenie i aktualizowanie to różne momenty.'),
  ],
  time: [
    picture('Prędkość razy czas', 'Przesunięcie = kierunek × prędkość × delta. Dla ruchu w prawo: 120 px/s × 0.5 s = 60 px. Z x=100 otrzymujemy x=160 niezależnie od liczby klatek.', 'motion', 0),
    picture('Dlaczego normalizujemy przekątną?', 'Kierunek (1,1) ma długość √2. Podziel obie składowe przez √2: około (0.707,0.707). Wtedy długość kierunku wynosi 1 i sprint po przekątnej ma tę samą prędkość.', 'motion', 1, 'Podpowiedź: długość = √(x²+y²); dzielimy tylko, gdy długość > 0.'),
    picture('Brak kierunku oznacza brak ruchu', 'Dla (0,0) długość jest zerowa. Nie dziel przez zero: pozostaw wektor zerowy. Gdy klawisze są zwolnione, gracz stoi.', 'motion', 2),
  ],
  input: [
    flow('Od klawisza do ruchu', 'PlayerController jest klasą ucznia. Odczytuje wejście i wybiera kierunek. CharacterController2D wykonuje ruch z uwzględnieniem czasu i przeszkód.', ['D / →', 'kierunek (1,0)', 'kontroler ruchu'], 'Kliknij planszę, aby skierować do niej klawiaturę.'),
    picture('Przytrzymanie czy nowe naciśnięcie?', 'Przytrzymanie służy do chodzenia. Nowe naciśnięcie wywołuje pojedynczą akcję. Trzy klatki przytrzymania nie powinny oznaczać trzech nowych naciśnięć.', 'input', 0),
    flow('Mysz w przestrzeni ekranu', 'Pozycja myszy jest ekranowa i może być null przed pierwszym zdarzeniem. Kamera przelicza ją na świat. Obsłużone kliknięcie UI nie powinno również uruchamiać akcji świata.', ['mysz: ekran', 'screenToWorld', 'punkt w świecie'], 'Najpierw sprawdź, czy pozycja wskaźnika istnieje.'),
  ],
  graphics: [
    picture('Warstwy układają obraz', 'TileMap rysuje tło, Sprite postać. Podaj jawne wymiary. Niższa warstwa layer znajduje się pod wyższą.', 'layers', 0),
    picture('flipX: porównaj obie strony', 'flipX odbija tę samą teksturę poziomo. Asymetryczny łucznik pozwala zobaczyć zmianę kierunku. To zmiana wyglądu, nie odbicie prędkości.', 'flip', 0),
    picture('Odbicie nie zmienia collidera', 'Pozycja i fizyczny kształt pozostają takie same. Włącz podgląd colliderów: koło nie zmienia rozmiaru ani położenia, kiedy odbijasz grafikę.', 'flip', 1),
  ],
  collisions: [
    picture('Obraz i fizyczny kształt', 'Sprite jest grafiką, collider opisuje obszar kontaktu. Koło może być mniejsze od sprite’a. Oba kształty mają własne wymiary.', 'contact', 0),
    picture('Ruch zatrzymuje się przy ścianie', 'CharacterController2D sprawdza przeszkodę podczas ruchu. Bezpośrednie setPosition zmienia pozycję, ale nie zastępuje ruchu z kolizjami.', 'contact', 1),
    picture('Ruch wzdłuż przeszkody', 'Przy kontakcie kontroler może zablokować składową skierowaną w ścianę i pozostawić ruch wzdłuż niej. Sprawdź kształty przez opcję Collidery.', 'contact', 2),
  ],
  triggers: [
    picture('Trigger nie blokuje przejścia', 'Trigger wykrywa nakładanie obiektów, ale przepuszcza gracza. Przydaje się do monet, skrzynek i stref.', 'pickup', 0),
    picture('Nagroda zmienia stan Wallet', 'Komponent sprawdza, kto wszedł w kontakt, a potem przyznaje nagrodę właściwemu graczowi. Przykładowa moneta dodaje jedno złoto.', 'pickup', 1),
    flow('Jedna moneta, jedna nagroda', 'Kontakt może trwać wiele aktualizacji. Oznacz monetę jako zebraną i usuń ją, aby nie dodawać nagrody w każdej klatce.', ['kontakt', 'zebrana = true', 'nagroda + usunięcie'], 'Kolejny kontakt z zużytą monetą nie daje złota.'),
  ],
  camera: [
    picture('Świat i ekran', 'Kamera wybiera fragment świata. Obiekt pozostaje w (80,180). Gdy początek widoku przesuniemy z (0,0) do (60,150), ekranowa pozycja zmieni się z (80,180) na (20,30).', 'camera', 0),
    picture('Śledzenie gracza i stały HUD', 'follow(player) przesuwa widok za graczem. Gdy gracz idzie 60 jednostek w prawo, kamera także przesuwa początek widoku o 60. Gracz pozostaje na ekranie w (85,82), a tło się przesuwa. HUD używa współrzędnych ekranu.', 'camera', 1),
    picture('Kliknięcie ekranu na mapie świata', 'screenToWorld odwraca przeliczenie. Ekran (20,30) + początek widoku (60,150) daje świat (80,180). Sprawdź null przed użyciem pozycji kursora.', 'camera', 2),
  ],
  'canvas-ui': [
    picture('Świat i interfejs', 'Obiekty gry należą do świata. UITransform umieszcza HUD względem ekranu. Kamera nie powinna zabierać napisu HP poza widok.', 'camera', 1),
    picture('Jawne rozmiary figur', 'GameCanvas pozwala wysyłać własne polecenia rysowania. Pozycja prostokąta w tym API oznacza jego środek; szerokość i wysokość podajemy osobno.', 'rectangle', 0),
    picture('Pasek pokazuje proporcję', 'ProgressBar zamienia wartość procentową na długość wypełnienia. setProgress(50) daje połowę paska. Używaj tej samej skali w danych i w UI.', 'bars', 0),
  ],
  health: [
    picture('Trafienie odejmuje HP', 'Health należy do konkretnej jednostki. Przykładowe damage(1) zmienia HP z 5/5 na 4/5. heal nie przekracza maksimum.', 'bars', 1),
    picture('Nietykalność odrzuca kolejny cios', 'Po przyjętym trafieniu odliczamy czas ochrony. Cios podczas ochrony pozostawia 4 HP. Timer należy do tej jednostki, nie do globalnego stanu gry.', 'timeline', 0),
    flow('Śmierć uruchamia się raz', 'Gdy zdrowie spadnie do zera, onDeath uruchamia reakcję. Usunięcie jednostki i utworzenie łupu to osobne decyzje. Nie przyznawaj łupu wielokrotnie.', ['HP = 0', 'onDeath • raz', 'łup / usunięcie'], 'Zdrowie jednostki nie jest stanem całej rundy.'),
  ],
  'enemy-ai': [
    picture('Wektor od przeciwnika do celu', 'Kierunek wyznaczamy jako pozycja celu minus pozycja przeciwnika. Dla przeciwnika (100,150) i celu (160,150) otrzymujemy (60,0), czyli w prawo.', 'motion', 3),
    picture('Stała prędkość pościgu', 'Znormalizuj różnicę pozycji, zanim pomnożysz ją przez prędkość. Dzięki temu odległy cel nie powoduje szybszego ruchu. Obsłuż brak celu i odległość zero.', 'motion', 1),
    flow('Decyzja i wykonanie ruchu', 'EnemyAI wybiera kierunek. Kontroler wykonuje ruch i uwzględnia przeszkody. Parametry pozwalają uzyskać różne zachowania tej samej klasy.', ['cel', 'EnemyAI: kierunek', 'kontroler: ruch'], 'Nie kopiuj całej klasy tylko po to, aby zmienić prędkość.'),
  ],
  projectiles: [
    flow('Pocisk to zestaw komponentów', 'GameObject pocisku łączy grafikę, collider, lot i reakcję na trafienie. Właściciel określa, kogo należy ignorować.', ['Sprite + collider', 'lot + właściciel', 'kontakt + obrażenia'], 'Lot i trafienie mają osobne odpowiedzialności.'),
    picture('Jedno trafienie zużywa pocisk', 'Poprawny cel otrzymuje obrażenia. Pocisk ignoruje właściciela i sojuszników. Flaga zużycia chroni przed drugim trafieniem tego samego pocisku.', 'projectile', 0),
    picture('Chybiony pocisk też znika', 'Odliczaj czas życia w czasie symulacji. Po jego upływie usuń pocisk, nawet jeśli nie trafił celu. To ogranicza liczbę obiektów w scenie.', 'timeline', 1),
  ],
  weapons: [
    flow('Najpierw wybierz poprawny cel', 'Automatyczna broń szuka żywego celu. Bez celu nie tworzy pocisku. Przy równej odległości stosuj stałą regułę, np. ID.', ['żywe cele', 'najbliższy + ID', 'jeden wybrany cel'], 'Wybór celu jest oddzielony od ruchu gracza.'),
    picture('Cooldown na osi czasu', 'Odejmuj delta od czasu oczekiwania. Po strzale ustaw cooldown ponownie. Przykład odstępu 0.5 s: strzał, oczekiwanie, następny strzał.', 'timeline', 2),
    picture('Broń tworzy pocisk', 'Gdy cel istnieje i cooldown się skończył, utwórz jeden pocisk i rozpocznij nowe oczekiwanie. Pocisk odpowiada za lot i trafienie.', 'projectile', 1),
  ],
  'loot-xp': [
    flow('Od śmierci do zebrania', 'Jednokrotny sygnał śmierci tworzy łup w miejscu przeciwnika. Zebranie przekazuje wartość do Experience gracza.', ['onDeath', 'orb XP w świecie', 'Experience gracza'], 'Po zebraniu orb znika.'),
    picture('Nadwyżka XP pozostaje', 'Przykład: próg 5 XP, zapas 4 XP, nagroda 2 XP. Po awansie odejmujemy próg: 4+2−5=1 XP na kolejnym poziomie.', 'bars', 2),
    flow('Duża nagroda może dać kilka awansów', 'Sprawdzaj próg w pętli. Dopóki XP wystarcza, odejmij aktualny próg i zwiększ poziom. Nie zeruj całego zapasu po pierwszym awansie.', ['dodaj XP', 'XP ≥ próg?', 'odejmij • awans • powtórz'], 'Pętla kończy się, gdy XP jest mniejsze od kolejnego progu.'),
  ],
  waves: [
    picture('Spawn według harmonogramu', 'Spawner odmierza czas symulacji. Zaplanowane momenty tworzenia jednostek nie zależą od liczby klatek. Duża delta może obejmować kilka momentów.', 'timeline', 3),
    flow('Dane fali i powtarzalność', 'Konfiguracja opisuje jednostki i momenty spawnu. Seed pozwala odtworzyć losowanie w tym samym scenariuszu.', ['dane + seed', 'fabryka jednostek', 'powtarzalna fala'], 'Te same dane wejściowe pomagają porównać Java i JS.'),
    picture('Limit żywych jednostek', 'Liczba utworzonych wrogów i liczba żywych to różne wartości. Limit dotyczy aktywnych jednostek; pokonani wrogowie zwalniają miejsce.', 'instances', 1),
  ],
  pause: [
    picture('Dwa zegary podczas pauzy', 'Pauza zatrzymuje WORLD: ruch, pociski, spawn i timery gry. Czas UI nadal rośnie, aby menu mogło obsłużyć wybór i wznowienie.', 'timeline', 4),
    flow('Menu może działać, gdy świat stoi', 'Interfejs korzysta z domeny UI. Nie omijaj pauzy osobnym zegarem przeglądarki dla rozgrywki.', ['WORLD: stop', 'UI: wybór', 'wznowienie świata'], 'Świat stoi, ale przycisk nadal odpowiada.'),
    flow('Kilka powodów pauzy', 'Menu i wybór ulepszenia mogą jednocześnie zatrzymywać świat. Zamknięcie jednego powodu nie powinno usuwać drugiego.', ['menu + awans', 'zamknięte menu', 'awans nadal pauzuje'], 'Wznów dopiero po usunięciu wszystkich powodów.'),
  ],
  upgrades: [
    flow('Awans otwiera wybór', 'Awans tworzy oczekującą nagrodę i zatrzymuje świat. Uczeń wybiera jedną opcję, która zmienia konkretny komponent.', ['awans', 'pauza + wybór', 'zmiana komponentu'], 'Zatwierdzenie zużywa jeden oczekujący wybór.'),
    picture('Parametr przed i po wyborze', 'Przykładowe ulepszenie dodaje 30 px/s. Prędkość zmienia się z 120 na 150 px/s. Zmień stan właściwej instancji kontrolera.', 'bars', 3),
    flow('Zakup jest warunkowy', 'Najpierw sprawdź Wallet. Przy udanym zakupie odejmij cenę i zmień statystykę. Brak pieniędzy pozostawia zarówno złoto, jak i statystykę bez zmian.', ['Wallet ≥ cena?', 'tak: zapłać + ulepsz', 'nie: bez zmiany'], 'Nie odejmuj pieniędzy za nieudany zakup.'),
  ],
  'ui-flow': [
    picture('Naciśnij, a potem zwolnij', 'Przycisk uzbraja się po naciśnięciu i uruchamia akcję przy poprawnym zwolnieniu. Sama obecność kursora nad przyciskiem nie jest kliknięciem.', 'input', 1),
    picture('Focus wskazuje jedną opcję', 'Klawiatura potrzebuje jednego aktywnego wyboru. Focus powinien być widoczny, a obsłużone wejście zużyte przez UI.', 'focus', 0),
    picture('Paski i rozciągane przyciski', 'ProgressBar rozdziela ramkę i wypełnienie. 9patch zachowuje narożniki przy rozciąganiu przycisku. Sprawdź układ po zmianie rozmiaru planszy.', 'ninepatch', 0),
  ],
  feedback: [
    picture('Tween między dwiema wartościami', 'Tween płynnie zmienia wybraną właściwość od początku do końca. Przykładowe zanikanie zmienia alpha z 1 do 0; nie przesuwa collidera.', 'fade', 0),
    picture('Shake ma początek i koniec', 'Krótki wstrząs kamery daje informację o trafieniu. Po czasie efekt wraca do spokoju. Wybierz świadomie domenę czasu podczas pauzy.', 'timeline', 5),
    flow('Nowy efekt tej samej właściwości', 'Określ, czy nowy tween zastępuje poprzedni. Dwa efekty zapisujące tę samą właściwość bez reguły mogą wzajemnie nadpisywać wynik.', ['efekt A: alpha', 'nowy efekt B', 'jedna reguła zastąpienia'], 'Wygląd i fizyka pozostają oddzielnymi odpowiedzialnościami.'),
  ],
  composition: [
    flow('Fabryka składa jednostkę', 'Dane wybierają wygląd, zdrowie i zachowanie. Fabryka tworzy GameObject i dodaje potrzebne komponenty.', ['konfiguracja', 'fabryka', 'Sprite + Health + AI'], 'Różne dane mogą korzystać z tych samych klas.'),
    picture('Wspólne klasy, osobne instancje', 'Dwie jednostki współdzielą definicję Health, lecz mają osobny stan. Nie dodawaj tej samej instancji komponentu do dwóch właścicieli.', 'instances', 2),
    flow('Referencja prowadzi do komponentu', 'Zachowaj referencję do potrzebnego komponentu. Pozwala zmienić parametr bez szukania obiektu w każdej klatce i bez dokładania wszystkich danych do Game.', ['kontroler gry', 'referencja do Weapon', 'parametr obrażeń'], 'Kompozycja rozdziela odpowiedzialności.'),
  ],
  performance: [
    picture('Sprawdzaj pobliskich kandydatów', 'Podział przestrzeni ogranicza kandydatów kontaktu. Nie trzeba porównywać każdej pary odległych obiektów. Gęste skupisko nadal wymaga sprawdzenia rzeczywistych kontaktów.', 'spatial', 0),
    picture('Sprzątanie ogranicza liczbę obiektów', 'Mierz aktywne pociski i łupy. Usuń pocisk po końcu życia. Limit kontroluje wzrost sceny, ale nie zastępuje pomiaru kosztu aktualizacji.', 'instances', 3),
    picture('Optymalizacja zachowuje nagrody', 'Łączenie orbów zmniejsza liczbę obiektów, lecz suma XP musi pozostać ta sama. Przykład: 2+3 XP staje się jednym orbem o wartości 5.', 'pickup', 2),
  ],
  'run-state': [
    picture('Stan całej rundy', 'READY czeka na start. RUNNING oznacza grę. LOST i WON kończą przebieg. Stan rundy jest oddzielony od zdrowia jednej jednostki.', 'run', 0),
    flow('Restart tworzy świeży przebieg', 'Sprzątnij obiekty, timery i reakcje poprzedniej rundy. Utwórz nową instancję gracza. Nie zostawiaj starego komponentu z poprzednim stanem.', ['stara runda', 'sprzątanie', 'nowy gracz + timery'], 'Nowa runda nie dziedziczy zużytych zasobów poprzedniej.'),
    flow('Jednoczesna śmierć i zwycięstwo', 'Ustal priorytet, gdy oba warunki zajdą w tej samej aktualizacji. Zatwierdź jeden wynik i nie uruchamiaj zakończenia ponownie.', ['warunki końca', 'jawny priorytet', 'jeden wynik rundy'], 'Reguła priorytetu należy do projektu gry.'),
  ],
  portability: [
    flow('Eksport obejmuje cały projekt', 'Przenieś wszystkie pliki, język i wersję API. Eksport samego GameMain gubi własne komponenty oraz pozostałe dane projektu.', ['pliki + język', 'format eksportu', 'wersja API'], 'JSON opisuje projekt; nie jest kodem Java ani JS.'),
    flow('Import najpierw sprawdza format', 'Zweryfikuj dane przed zastąpieniem projektu. Java i JS mają wspólne reguły silnika, ale ich pliki źródłowe nie są zamienne.', ['odczytaj', 'zweryfikuj', 'odtwórz projekt'], 'Błędny import nie powinien niszczyć obecnych plików.'),
    flow('Ten sam scenariusz zachowania', 'Porównuj wynik wspólnego scenariusza w obu językach. Przenośność oznacza zgodność reguł, a nie identyczną składnię źródeł.', ['scenariusz', 'Java / JS', 'porównanie wyniku'], 'Po imporcie sprawdź również planszę i sterowanie.'),
  ],
  survivor: [
    flow('Jedna pętla rozgrywki', 'Najpierw połącz ruch i jednego przeciwnika. Następnie dodaj pociski, łup oraz doświadczenie. Rozwijaj grę etapami.', ['ruch + wróg', 'walka + łup', 'XP + rozwój'], 'Każdy etap powinien dawać widoczny efekt.'),
    picture('Rozwój przerywa walkę na wybór', 'Fale, walka, awans i pauza tworzą wspólny przebieg. Wybór ulepszenia zmienia komponent, a potem świat może ruszyć dalej.', 'run', 1),
    flow('Sprawdź cały przebieg gry', 'Testy reguł nie zastępują ręcznej próby planszy. Sprawdź start, sterowanie, przeciwników, przegraną, restart i odtworzenie eksportu.', ['start + sterowanie', 'walka + koniec', 'restart + eksport'], 'W rozwiązaniu pierwsze Slime pojawiają się po 1.5 s.'),
  ],
};
