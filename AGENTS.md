# Spójność rodziny Lab

- Przy zmianie istniejącej funkcji najpierw sprawdź jej odpowiednik w innych projektach cyklu Lab. Nie kopiuj wyłącznie logiki: zachowaj także sposób otwierania, ikonę/avatar, hierarchię treści, stany i obsługę klawiatury.
- Korepetytor AI: wzorzec `C:/Nauka/databases/src/components/AiTutorPanel.jsx` i powiązane style. Pływający przycisk z robotem/avatar, panel z nagłówkiem i zamknięciem; nie zastępuj go zwykłym przyciskiem w treści lekcji.
- Dokumentacja silnika: wzorzec `C:/Nauka/java-lab/src/components/EngineGuide.jsx`. Przycisk w górnym pasku z ikoną książki i czytelny modal.
- Przyciski z ikonami: spójne SVG 20–24 px, flex-shrink: 0, wyrównanie inline-flex i odstęp od tekstu. Dekoracyjne SVG mają aria-hidden; przycisk bez tekstu wymaga aria-label i tooltipa. Zwijanie panelu pokazuje właściwy kierunek strzałki.
- Dopasowuj wzorce do lokalnych tokenów kolorów; nie przenoś zależności całego projektu tylko dla ikony. Zanotuj świadome odstępstwa od wzorca.
- Weryfikuj niski laptop, desktop i mobile, długi tekst, klawiaturę i przewijanie. Raportuj brak testu wizualnego zamiast twierdzić, że przeszedł.
- Maksymalnie dwóch agentów jednocześnie; testy i build uruchamiaj sekwencyjnie, testy z jednym workerem.
