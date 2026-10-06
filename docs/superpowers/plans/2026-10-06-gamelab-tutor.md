# GameLab Tutor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dokumentacja w modalu i tutor Playground z kontrolowanymi propozycjami plików.

**Architecture:** Lokalny backend Node przechowuje klucz OpenRouter i dokłada kontekst API. React wyświetla rozmowę i propozycje; App zapisuje tylko zatwierdzone zmiany przez istniejący mechanizm projektu.

**Tech Stack:** React 18, Node HTTP/fetch, Vite 6, Vitest, Testing Library; bez nowego frameworka backendowego.

**Spec:** docs/superpowers/specs/2026-10-06-gamelab-tutor-design.md

## Global Constraints

- Klucz wyłącznie w OPENROUTER_API_KEY backendu, nigdy w VITE_* ani localStorage.
- Kontekst kodu domyślnie wyłączony; każda zmiana pliku wymaga zatwierdzenia.
- Brak autonomicznego uruchamiania kodu i komend.
- Serwer loopback; frontend pozostaje na 5181, backend na 5182 z strict binding.
- Testy sekwencyjne, jeden worker; wykonanie native bez agentów.
- Zachować istniejącą zmianę ikony AppShell i niepowiązany plan Monaco.

## Review Focus

- Model proponuje traversal lub duplikaty ścieżek: odrzucenie bez zmiany projektu.
- Uczeń edytuje plik podczas zapytania: blokada nieaktualnej propozycji.
- Import/reset podczas odpowiedzi: anulowanie i odrzucenie późnej odpowiedzi.
- Dostawca zwraca błędny JSON albo timeout: czytelny błąd, żadnych częściowych zmian.
- Zamknięcie modalu klawiaturą i mały ekran: dostęp do kontrolek i powrót fokusu.

### Task 1: Modal dokumentacji

**Files:** Modify src/components/GameApiGuide.jsx, src/components/AppShell.jsx, src/components/LessonWorkspace.jsx, src/App.jsx, src/styles/app.css; test src/components/GameApiGuide.test.jsx.

**Interfaces:** AppShell otrzymuje opcjonalne toolbarActions; GameApiGuide pozostaje bezargumentowym komponentem z przyciskiem otwierającym dialog.

- [ ] Dodać testy otwierania przyciskiem, wyszukiwania, Escape i powrotu fokusu; uruchomić i potwierdzić porażkę nowego kontraktu.
- [ ] Przenieść przycisk do górnego toolbaru dla game-js, zachować istniejące API i przykłady, dodać rozdział architektury.
- [ ] Uruchomić testy dokumentacji z jednym workerem; oczekiwane PASS.

### Task 2: Backend OpenRouter

**Files:** Create server/tutor.js, server/index.js, server/tutor.test.js, scripts/dev.mjs, .env.example; modify package.json, vite.config.js, .gitignore i README.md.

**Interfaces:** GET /api/ai/config -> {configured,model}; POST /api/ai/chat przyjmuje {messages,project?} i zwraca {message,proposals:[{path,content,reason}]}. createTutorHandler({apiKey,model,fetchImpl}) umożliwia testy bez sieci. Błędy mają {message}, bez sekretów.

- [ ] Potwierdzić aktualny kontrakt w oficjalnych dokumentach OpenRouter; przeczytać implementację databases jako referencję, nie kopiować jej SQL promptu.
- [ ] Napisać failing tests: brak klucza, walidacja, brak kodu bez zgody, kontekst API, timeout, uszkodzona odpowiedź i niewyciekający klucz.
- [ ] Implementować stały endpoint, systemowy prompt z gameLabApi, limity: body 256 KiB, 20 wiadomości, wiadomość 8000 znaków, kod 100000 znaków, 4096 tokenów odpowiedzi, timeout 45 s, 10 zapytań/min na adres oraz jednoczesność 2. Nie obiecywać darmowego modelu; model podaje konfiguracja serwera.
- [ ] Obsłużyć publiczną konfigurację, loopback, proxy i wspólne uruchamianie; dokumentować konfigurację oraz statyczny tryb bez AI.
- [ ] Uruchomić testy backendu z jednym workerem; oczekiwane PASS.

### Task 3: Walidacja i zastosowanie propozycji

**Files:** Create src/services/tutorProposals.js i src/services/tutorProposals.test.js; modify src/App.jsx.

**Interfaces:** validateProposals(proposals) zwraca zwalidowaną listę lub rzuca błąd; applyTutorProposal(currentProject,snapshot,proposal) zwraca nowy projekt lub konflikt. App utrzymuje projectRevision zwiększany przy imporcie, resecie i hard reset.

- [ ] Napisać failing tests traversal, duplikatów, niedozwolonych rozszerzeń, konfliktu edycji oraz zachowania wszystkich innych plików.
- [ ] Walidować maksymalnie 10 plików po 50000 znaków, wyłącznie html/css/js/jsx/json; ścieżki zgodne z istniejącym normalizeProject. Zastosowanie sprawdza wersję projektu i zgodność oryginalnego pliku ze snapshotem.
- [ ] Zapis przez updateFiles, bez wykonania kodu i bez automatycznego uruchomienia podglądu. Ustaw aktywną zakładkę zastosowanego pliku.
- [ ] Uruchomić testy walidacji i transferu; oczekiwane PASS i brak sekretów/historii w JSON.

### Task 4: Panel ucznia i integracja

**Files:** Create src/components/GameTutor.jsx, src/components/GameTutor.test.jsx, src/services/tutorApi.js; modify src/components/LessonWorkspace.jsx, src/App.jsx, src/styles/app.css.

**Interfaces:** GameTutor({project,projectRevision,onApply,sendMessage,loadConfig}) w Playground, key oparty o task i revision. sendMessage(payload,{signal}) wspiera anulowanie. onApply(proposal,snapshot) sprawdza aktualny projekt w App.

- [ ] Napisać failing tests zgody na kod, konfiguracji, loading/error, anulowania, resetu/importu, jawnego zatwierdzania i konfliktów.
- [ ] Panel otwierany na żądanie, informacja o prywatności i kosztach, checkbox Dołącz kod początkowo false, wiadomości i przykłady bez niebezpiecznego HTML. Historia w pamięci, żadnego zapisu klucza.
- [ ] Propozycje pokazują pełną treść, uzasadnienie i ostrzeżenie o nadpisaniu; Zastosuj dla każdego pliku. Aktualizacja snapshotu po zastosowaniu własnej propozycji nie pozwala nadpisać równoczesnej edycji ucznia.
- [ ] Uruchomić testy panelu, backendu, dokumentacji, projektu i dotkniętej integracji sekwencyjnie. Rozpoznać istniejące nieaktualne testy liczby lekcji i nazw przed ich zmianą, nie maskować regresji.

### Task 5: Weryfikacja końcowa

- [ ] Uruchomić npm run build i git diff --check; oczekiwane exit 0.
- [ ] Smoke desktop/mobile: modal, wyszukiwarka, Escape, panel bez klucza, przewijanie kodu i kontrolki. Użyć atrap dla odpowiedzi AI; bez płatnych zapytań.
- [ ] Zgłosić rzeczywiste wyniki, ograniczenia i pliki; nie pushować bez osobnego polecenia użytkownika.
