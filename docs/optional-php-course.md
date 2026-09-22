# Opcjonalny moduł PHP — backlog, jeszcze niewdrożony

Uzgodniony kierunek: wprowadzenie do PHP uruchamianego lokalnie w przeglądarce przez WebAssembly. Tematy: echo, zmienne, typy, operatory, warunki, pętle, tablice, funkcje oraz generowanie HTML. Edytor index.php, podgląd wyniku i komunikaty błędów z plikiem/linią. Bez instalowania XAMPP przez ucznia.

Opcjonalny bonus: rzeczywiste SQLite oraz jawnie oznaczony, dydaktyczny adapter wybranych funkcji mysqli_* (np. połączenie, proste zapytania i pobieranie wierszy), aby wprowadzić nazewnictwo spotykane przy MySQL. Nie jest to MySQL, pełna implementacja mysqli ani środowisko egzaminacyjne INF.03. Wspierany podzbiór funkcji i SQL musi być opisany; nieobsługiwane operacje mają zgłaszać błąd zamiast udawać sukces. Różnice dialektów, typów, błędów i połączeń muszą być pokazane w lekcji przejścia do prawdziwego MySQL. PDO + SQLite pozostaje natywnym punktem odniesienia.

Przed wdrożeniem potrzebny osobny projekt i próba wybranego PHP.wasm: dostępne rozszerzenia SQLite/PDO, możliwość zdefiniowania funkcji adaptera bez kolizji z rozszerzeniem mysqli, zapis/reset bazy, limit czasu i przerwanie pętli w workerze. Bez automatycznego podłączania szkolnej ani produkcyjnej bazy. Nie dodajemy zależności PHP do bieżącej przebudowy sandboxa HTML/React.
