# Dokumentacja GameLab i tutor Playground

## Cel i uzgodniony zakres

Uczeń ma łatwo znaleźć dokumentację silnika i otrzymać pomoc ze składnią oraz budową własnej gry. Dokumentacja wzoruje się na modalu Java Lab. Tutor tłumaczy krok po kroku; na wyraźną prośbę może przygotować bardziej skomplikowany komponent lub system, ale nie nadpisuje samodzielnie plików.

## Dokumentacja

Przycisk Dokumentacja w górnym pasku otwiera natywny dialog renderowany przez portal. Treść bazuje na istniejącym gameLabApi, wspólnym z podpowiedziami Monaco. Rozdziały: pierwsze kroki, architektura i API. API zachowuje wyszukiwarkę, kategorie oraz przykłady. Dialog ma własne przewijanie, responsywny rozmiar, zamknięcie Escape i przywracanie fokusu. Usuwamy dotychczasowy rozwijany blok z treści zadania, bez utraty informacji.

## Backend i konfiguracja

Lokalny serwer Node udostępnia endpointy konfiguracji publicznej i chatu przez proxy Vite. Klucz OPENROUTER_API_KEY jest wyłącznie zmienną środowiskową backendu; model OPENROUTER_MODEL jest konfiguracją serwera. Nie umieszczamy klucza w VITE_*, localStorage, odpowiedziach HTTP, logach ani eksporcie gry. Serwer domyślnie nasłuchuje tylko na loopback. Jeden skrypt uruchamia frontend i backend; statyczny kurs bez backendu nadal działa, a chat informuje o braku konfiguracji.

Backend ma stały adres OpenRouter, waliduje rozmiar i strukturę żądania, ogranicza długość historii i kontekstu, używa limitu odpowiedzi, timeoutu i ograniczenia częstotliwości. Odpowiedzi dostawcy nie są wykonywane jako kod serwera. Aktualny kontrakt API należy potwierdzić w oficjalnej dokumentacji przed implementacją.

## Kontekst i sposób nauczania

Backend dokłada systemowy kontekst zgodny z faktycznym API GameLab: klasy, komponenty, cykl życia, jednostki, kamera i ograniczenia silnika. Tutor odpowiada po polsku, rozdziela tworzenie obiektu od ustawiania pozycji i zaczyna od wyjaśnień oraz małych przykładów. Nie wymyśla metod spoza kontekstu. Dane projektu i wiadomości ucznia są materiałem wejściowym, nie instrukcjami zmieniającymi uprawnienia tutora.

Przed pierwszą wiadomością panel wyjaśnia, że pytania trafiają do OpenRouter i operatora modelu oraz mogą powodować koszty. Opcja Dołącz kod jest początkowo wyłączona; po jej zaznaczeniu dołączamy aktualny snapshot plików projektu, nie sekrety konfiguracji. Historia rozmowy pozostaje w pamięci bieżącego projektu/karty, nie w eksporcie JSON. Zmiana projektu usuwa historię i propozycje, aby nie pomylić kontekstów.

## Propozycje plików

Odpowiedź ma tekst wyjaśnienia oraz opcjonalną listę proponowanych plików: ścieżka, pełna treść i uzasadnienie. Walidacja odrzuca ścieżki absolutne, traversal, niedozwolone typy, duplikaty i nadmierne rozmiary. Panel pokazuje podgląd propozycji i jawnie oznacza nadpisanie istniejącego pliku. Każdy plik wymaga kliknięcia Zastosuj. Zastosowanie działa przez istniejący mechanizm aktualizacji i zapisu projektu, nie przez bezpośredni zapis na dysku. Jeżeli plik zmienił się od wysłania pytania, automatyczne zastosowanie zostaje zablokowane i uczeń musi ponownie uzgodnić zmianę. Import, zmiana projektu i hard reset unieważniają oczekujące propozycje. AI nie uruchamia samodzielnie kodu ani komend.

## Interfejs

Panel Pomoc AI jest dostępny w Playground, otwierany na żądanie, nie zasłania stale podglądu ani edytora. Ustawienia i informacja o konfiguracji są oddzielone od rozmowy. Wiadomości i kod są renderowane bez niebezpiecznego HTML. Stany: brak klucza, pusta rozmowa, oczekiwanie, anulowanie, błąd i odpowiedź z propozycją. Długi tekst i kod przewijają się bez rozszerzania całego układu; mobile zachowuje dostęp do zamknięcia i wysłania pytania.

## Weryfikacja

Testy backendu używają atrap HTTP: konfiguracja, sekrety, walidacja, błędy dostawcy, timeout i kontekst. Testy UI obejmują dialog, zgodę na kod, rozmowę, zatwierdzanie plików i konflikt edycji. Testy transferu projektu potwierdzają brak klucza i historii. Testy uruchamiamy sekwencyjnie z jednym workerem, następnie build oraz smoke desktop/mobile, jeśli przeglądarka jest dostępna. Żaden test nie wysyła płatnego zapytania do dostawcy.

## Poza zakresem

Brak autonomicznego agenta, wykonywania poleceń, automatycznej edycji, kont użytkowników i centralnego szkolnego hostingu. Udostępnienie backendu innym komputerom wymaga osobnego projektu uwierzytelnienia i limitów kosztów.
