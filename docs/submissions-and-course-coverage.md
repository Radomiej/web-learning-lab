# Zadania, quizy i odbiór prac — 20.10.2026

## Pokrycie

77 lekcji kursowych ma 187 zadań, w tym zadania samodzielne. Każde ma polecenie, kryteria, komplet startowy i rozwiązanie. Playground jest wolnym projektem. Generator ma teraz osobny szablon dla każdej z 77 lekcji: dodano brakujące 8 Layout i 24 GameDev. Test sprawdza trzy formaty ćwiczeń na trzech poziomach wszystkich 63 lekcji poza JS; 14 tematów JS ma własne rodziny generatora.

Generator pozostaje osobnym ekranem. Zakładki zadań są nad obszarem pracy, po lewej jest polecenie i ten sam Monaco z zakładkami plików co w lekcjach, po prawej ten sam podgląd. Podgląd startuje po RUN. W stopce lewego sidebara kursu widać wersję pakietu i rewizję wdrożenia.

Każdy z 39 kroków HTML ma wizualny przykład: dedykowaną ilustrację albo rzeczywisty, odizolowany widok kodu przykładowego. Dodano 9 wygenerowanych grafik dla kolejnych stron trzech pierwszych lekcji. Nie uruchamiają sandboxa ucznia. Zewnętrzne media przykładów nie są pobierane.

## Trwałość

- Dotychczas oddania dzieliły kolejkę `java-lab.activity` z telemetrią. Ma ona limit 50 MiB i może usuwać najstarszy backlog.
- Nowe oddania używają `lab.submissions.v1`: durable, wiadomości persistent (`delivery_mode: 2`), TTL 31536000000 ms (365 dni), limit 524288000 bajtów, overflow `reject-publish`.
- Pełna kolejka odrzuca nową publikację. Klient zachowuje niewysłany snapshot w IndexedDB i może ponowić wysyłkę. Test na izolowanej małej kolejce potwierdza, że publisher zgłasza odrzucenie, a wcześniejsza wiadomość pozostaje.
- Consumer zapisuje oddanie w transakcji SQLite, dopiero potem ACK. Starsza kolejka nadal jest odbierana dla zgodności z wcześniejszymi klientami.
- Po ACK wiadomość znika z RabbitMQ; archiwum pracy jest w SQLite lab-admin. Archiwum nie podlega 14-dniowej retencji telemetrii. Test z zegarem przesuniętym o 366 dni i ponownym otwarciem bazy potwierdza zachowanie odpowiedzi i oceny.
- Quizy mają osobny budżet archiwum 500 MiB treści z rezerwą maksymalnego komentarza nauczyciela dla każdej pracy. Po osiągnięciu limitu nowe quizy nie są potwierdzane przez consumer i czekają w brokerze. Istniejące prace nie są kasowane. Panel pokazuje wykorzystanie limitu. To limit logiczny archiwum quizów; indeksy SQLite, WAL, kodowe oddania i telemetria zajmują osobne miejsce.

## Test rzeczywisty

`submission-e2e.json` zawiera identyfikatory oznaczonych `TEST-SYSTEM-WWW` prac wysłanych przez publiczne API i odczytanych przez uwierzytelnione API lab-admin. Sprawdzono quiz HTML i zadanie fetch, dokładność plików i klucza nauczyciela, brak duplikatu przy ponowieniu oraz zachowanie po rzeczywistym restarcie procesu panelu. Nie zmieniano ocen prawdziwych uczniów.

Skrypty diagnostyczne nie wypisują haseł ani tokenów. Przed restartem panelu wykonano spójny backup SQLite. Źródła semantyki: [RabbitMQ publisher confirms](https://www.rabbitmq.com/docs/confirms) i [HTTP API](https://www.rabbitmq.com/docs/http-api-reference).

Java Lab przygotowana osobno lokalnie: 36 quizów, 108 prac, 12 nowych grafik i 97 stron nauki. Katalog odbiornika oraz przegląd quizów obejmują również Javę. Raport Java: `C:/Nauka/java-lab/docs/java-learning-modules-update.md`. Java nie została opublikowana w ramach zmian Web Laba.
