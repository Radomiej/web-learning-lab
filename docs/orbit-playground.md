# Uruchamianie gry z Playground na Orbit

Wymagany launcher Orbit 0.3.33 lub nowszy.

1. Na konsoli otwórz **Dev Server** i naciśnij **X**, aby włączyć tryb online.
2. W Playground wybierz **Uruchom na Orbit → Przygotuj grę do uruchomienia online**. Web Lab otworzy Nekko. Zaloguj się, jeśli pojawi się formularz logowania.
3. Wpisz osiem znaków z konsoli. Po udanym parowaniu Nekko zainstaluje i uruchomi oczekującą grę. Dla wcześniej sparowanej konsoli wybierz **Zainstaluj i uruchom online**.
4. Jeśli przeglądarka blokuje nowe okno, pobierz plik .orbit i wczytaj go w Nekko w sekcji **Uruchom prywatną grę Playground**. Konsola i przeglądarka mogą być w różnych sieciach.

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
ścieżek utworu. Tekst używa czcionki Orbit. Eksport pomija
HTML, CSS, własne zasoby, mysz i bezpośrednie użycie Web Audio. Zewnętrzne
importy i pełny Canvas 2D wymagają adaptacji.

Instalacja LAN weryfikuje parowanie, przesyła pliki do katalogu tymczasowego
launchera i prosi o uruchomienie po zatwierdzeniu kompletnej paczki.
Kod parowania jest używany w bieżącym formularzu i nie trafia do projektu.
