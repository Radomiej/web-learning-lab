# Uruchamianie gry z Playground na Orbit

1. Połącz komputer i konsolę z tym samym Wi-Fi.
2. Na konsoli otwórz **Dev Server**. W Playground wybierz **Uruchom na Orbit**.
3. Wpisz adres konsoli i pięcioznakowy kod LAN. Wybierz **Połącz i uruchom**.
4. Jeśli przeglądarka prosi o dostęp do sieci lokalnej, zezwól na niego. Gdy połączenie jest blokowane, wyeksportuj plik .orbit do Nekko Launcher. Parowanie online w Nekko używa ośmiu znaków i wymaga konta z dostępem do instalacji paczek.

Orbit uruchamia scenę z pojedynczego game.js przez GameLab.run(). Adapter
korzysta z logiki sceny i fizyki Web Lab, a prostokąty, koła, tekst i zgodne
sprite’y rysuje przez natywne API. Krzyżak obsługuje strzałki oraz WASD,
A zastępuje spację, Enter lub Z, a B zastępuje Escape lub X.
Eksport pomija HTML, CSS, własne zasoby, mysz i dźwięk przeglądarki.
Importy modułów oraz część efektów Canvas 2D, w tym kafelki i panele
dziewięcioczęściowe, wymagają adaptacji.

Instalacja LAN weryfikuje parowanie, przesyła pliki do katalogu tymczasowego
launchera i prosi o uruchomienie po zatwierdzeniu kompletnej paczki.
Kod parowania jest używany w bieżącym formularzu i nie trafia do projektu.
