# Integracja Lab Game v2 — plan wykonania

Źródło: C:/Users/rados/Downloads/Lab_Game_v2_specyfikacja_i_kurs.md.
Zmiany zakresu zatwierdzone przez użytkownika: Assets w liczbie mnogiej; 100 sprite plus UI; bez utrzymywania v1; mysz w InputManager; tagi, indeksy komponentów i onContactEnter; API jako najwyższy priorytet.

1. Wspólny pakiet contract.json, render-protocol.json, renderer, manifesty kursu/assetów i synchroniczna kopia Java z SHA-256/provenance.
2. Ujednolicony cykl GameObject/Component, Vector2/Transform, WORLD/UI, pauza i dwa zegary, snapshoty kolekcji, stabilne ID, lokalny input.
3. Spatial hash 64 px, limit dużych brył, lokalne kandydaty, sweep koło/prostokąt, ruch X następnie Y, warstwy i sensory, pociski.
4. Assets: enum Java i zamrożone stałe JS; cztery atlasy ImageGen po 25 obrazów; Python crop/center/alpha; osobne frame/track/fill, ninepatch.
5. Wspólne UITransform/ProgressBar/Button, kamera, owned Tweens, mysz, fokus i konsumowanie inputu; guard sceny w transporcie TeaVM.
6. 24 rozdziały, 72 sparowane zadania, gotowe rozwiązania, celowo niepełne startery i kryteria wykonania. Survival: HP, bronie, XP, fale, upgrade, pauza, HUD, restart.
7. Wspólne dodatki steering, top-down/platformer i callbacki klawiatury; dokumentacja i completion zgodne z runtime.
8. Tagi i getObjectsWith(Type...), onContactEnter(Type,callback), snapshoty i natychmiastowe wykluczenie usuniętych obiektów.
9. Weryfikacja: 43 scenariusze JS/JDK; niezależny C38 TeaVM WebAssembly; testy kursów i regresji; obrazki Python; sync --check; build obu projektów. Wyniki przechowujemy w docs i artifacts, a stan w docs/lab-game-v2-progress.md.

Różnica językowa: publiczne pola Java nie przechwytują przypisań. setPosition/setActive/setEnabled unieważniają indeks automatycznie; po bezpośredniej zmianie pól podczas WORLD trzeba physics.refresh przed kolejnym zapytaniem. JS ma accessors. Nie wykonujemy pełnego skanu sceny przy każdym zapytaniu.
