# Telemetria sesji ucznia

Ten projekt wysyła appId=www-lab do kolejki java-lab.activity przez endpointy tego samego originu /api/telemetry/session i /api/telemetry/events. Serwer i klient korzystają z kontraktu shared/telemetry/schema.js zgodnego z Java Lab i Lab Admin.

Włącz VITE_TELEMETRY_ENABLED=true i uzupełnij serwerowe TELEMETRY_TOKEN_SECRET (min. 32 znaki), TELEMETRY_ALLOWED_ORIGINS (dokładny origin lokalny lub produkcyjny) oraz RABBITMQ_HTTP_URL, RABBITMQ_USERNAME i RABBITMQ_PASSWORD. Hasła nie mogą mieć prefiksu VITE_. Vite obsługuje lokalne endpointy przez server/telemetryPlugin.js; produkcja Vercel korzysta z api/telemetry/*.js. Lokalna konfiguracja jest w ignorowanym .env.local. Nie wdrożono tych zmian produkcyjnie w tej iteracji.

Snapshot: na starcie, zmianie zadania, uruchomieniu i co 30 s po zmianie kodu. Heartbeat co 15 s aktualizuje obecność. Bufor 20 zdarzeń w RAM; zamknięcie karty traci niewysłane dane. Przy przepełnieniu jest wpis o luce historii; błąd sieci nie blokuje edytora.

Pole nazwy ucznia jest opcjonalne, do 80 znaków, zapamiętywane lokalnie. ID identyfikuje instalację przeglądarki, a nie sprzęt. Kod i nazwa są udostępniane nauczycielowi, o czym informuje pasek boczny.

WWW zachowuje dokładne pliki uruchomionego projektu oraz konsolę, błędy i wyniki sprawdzenia. Wszystkie ścieżki uruchomienia korzystają z obserwatora runtime, także Ctrl+S i automatyczny podgląd.

Historia jest przechowywana w SQLite panelu 14 dni, z limitem 500 MiB treści. RabbitMQ potwierdza odbiór dopiero po zapisie. Panel musi mieć trwały dysk.
