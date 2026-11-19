# Uruchamianie gry z Playground na Orbit

Wymagany launcher Orbit 0.3.33 lub nowszy.

1. Na konsoli otwórz **Dev Server** i naciśnij **X**, aby włączyć tryb online.
2. W Playground wybierz **Uruchom na Orbit → Przygotuj grę do uruchomienia online**. Web Lab otworzy Nekko i przekaże prywatną paczkę `.orbit`.
3. W Nekko wybierz sposób dostępu przed wpisaniem kodu:
   - Dla nieprzypisanej konsoli wybierz **Rozpocznij tymczasową sesję**. Nie wymaga konta, działa przez pięć godzin i nie przypisuje konsoli do konta.
   - Aby trwale przypisać nieprzypisaną konsolę do konta, zaloguj się na konto, do którego chcesz ją przypisać, i użyj zwykłego parowania. Konsola już przypisana do konta wymaga zalogowania jej właściciela; sesja tymczasowa nie omija tego przypisania.
4. Wpisz osiem znaków z ekranu konsoli. Po otrzymaniu paczki wybierz **Zainstaluj i uruchom na konsoli**. Dla wcześniej sparowanej konsoli zaloguj się jako jej właściciel i wybierz ją z listy.
5. Jeśli przeglądarka blokuje nowe okno, pobierz plik `.orbit`, otwórz Nekko, rozpocznij sesję tymczasową dla nieprzypisanej konsoli albo zaloguj się jako jej właściciel, a następnie wczytaj plik w sekcji **Uruchom prywatną grę Playground**. Konsola i przeglądarka mogą być w różnych sieciach.

Bezpośrednie przekazanie z nowego okna jest ograniczone do zaufanego originu
Web Lab (domyślnie produkcyjnego). W środowisku testowym można ustawić
VITE_WEB_LAB_URL po stronie Nekko i VITE_NEKKO_ORIGIN po stronie Web Lab.
Do instalacji przez Wi-Fi dostępny jest także formularz LAN z adresem
konsoli i pięcioznakowym kodem.

Orbit uruchamia scenę z game.js przez GameLab.run(). Lokalne moduły JavaScript
są składane do jednej paczki przy eksporcie. Adapter
korzysta z logiki sceny i fizyki Web Lab, a prostokąty, koła, tekst i zgodne
sprite’y, kafelki i paski postępu rysuje z oryginalnych zasobów Web Lab przez
natywne API. Krzyżak obsługuje strzałki oraz WASD,
A zastępuje spację, Enter lub Z, a B zastępuje Escape lub X.
GameLab Audio przekłada nuty i utwory na natywny syntezator, do czterech
ścieżek utworu; więcej ścieżek kończy się czytelnym błędem. `audio.stop()` i
zastąpienie utworu zatrzymują poprzednie tony i ścieżki. Tekst używa czcionki
Orbit. Eksport pomija
HTML, CSS, własne zasoby, mysz i bezpośrednie użycie Web Audio. Zewnętrzne
importy i pełny Canvas 2D wymagają adaptacji.

Prywatny eksport Playground do `.orbit` zawiera obecnie `orbit.json` i jeden
`main.js`; korzysta z atlasu wbudowanego w Orbit i nie przenosi własnych plików
graficznych projektu. Limit tej prywatnej paczki to 8 MiB. Pełne paczki `.orbit`
obsługują kod i pliki zasobów z manifestem: do 256 plików, 8 MiB na plik i
64 MiB łącznie. Wysyłanie własnych zasobów z Playground wymaga rozszerzenia
eksportera i prywatnego instalatora.

Komponent `TileMap` z Lab v2 działa w tym profilu: dołączony runtime rozwija
widoczne kafelki w uporządkowane polecenia sprite'ów. Wewnętrzny znacznik
`tilemap` opisuje mapę i nie jest samodzielnym poleceniem rysowania.

Instalacja LAN weryfikuje parowanie, przesyła pliki do katalogu tymczasowego
launchera i prosi o uruchomienie po zatwierdzeniu kompletnej paczki.
Kod parowania jest używany w bieżącym formularzu i nie trafia do projektu.
