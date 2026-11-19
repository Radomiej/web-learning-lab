---
name: lesson-graphics
description: Zasady ilustracji i interaktywnych tablic lekcyjnych w web-learning-lab.
---

# Lesson graphics (web-learning-lab)

Sekcje specyficzne dla scen pojęciowych (algorytmy, Java, Game Dev) opisuje
wzorzec w `C:/Nauka/java-lab/.devin/skills/lesson-graphics/SKILL.md` —
poniżej wspólna część dotycząca pilota Game Dev.

## Interaktywne tablice w pilocie (Game Dev)

Zasada: gdy pojęcie ma zmienną, którą uczeń może zmienić, preferuj interaktywną
tablicę nad statycznym diagramem — kod i efekt pokazujemy obok siebie.

- pozycja → `CoordinateBoard` (przeciąganie/strzałki zmieniają transform.x/y),
- wektor/odległość/zasięg → `ChaseVectorBoard` (tryby move/normalize/range),
- obecność/nieobecność komponentu → `ComponentToggleBoard` (przełącznik
  widać/nie widać: kod przekreślony + podgląd z/bez komponentu; marker
  Transform widoczny zawsze).

Zawsze: affordance-hint (dymek/ikona) znikający po pierwszej interakcji,
obsługa klawiatury + role/aria (`role="switch"`, `aria-checked`, `role="status"`),
`prefers-reduced-motion` wyłącza animację hintu.

Kontrakt `board` w notatce (`extra` w `note()`):
- `{ board: { kind: 'chase', mode: 'move'|'normalize'|'range' } }`,
- `{ board: { kind: 'coordinates', start: { x, y }, ghost? } }`,
- `{ board: { kind: 'components', object: { name, x, y }, objectCode, components: [{ id, label, code, kind: 'sprite'|'shape'|'collider', on, object?, asset?, width?, height?, color?, radius? }] } }`
  — `objectCode` to dosłowne linie kodu startera (utworzenie i pozycjonowanie
  obiektu, składnia danego labu); komponent może nieść własne `object`
  ({name,x,y}) — tablica rysuje osobny marker Transform na każdy odrębny
  obiekt, a komponent bez `object` przypada bazowemu `object`.
- `{ board: { kind: 'keypress', code } }` — keycap + symulacja przytrzymania,
  kod wywołania przychodzi w `code`.
- `{ board: { kind: 'canvas', variant: 'button'|'bar', api } }` — interaktywne
  drawRect/drawText na suwakach; `api` to prefiks wywołania (`this.canvas.` w JS,
  `canvas.` w Javie). Wariant `bar` pokazuje pasek z przypiętym lewym brzegiem
  (x = krawędź + width/2, bo drawRect dostaje środek).
- `{ board: { kind: 'lifecycle', variant: 'counter'|'lifetime', life?, objectName? } }`
  — symulacja cyklu życia: przycisk tworzy obiekt (onCreate raz), ticki
  onUpdate(delta) lecą w tempie wybranego FPS (30/60/120); dziennik zdarzeń,
  oś ticków i status pokazują, że elapsed nie zależy od liczby klatek
  (delta = 1/FPS). Wariant `lifetime` niszczy obiekt po `life` sekundach
  (onDestroy), `counter` liczy ticki do ręcznego usunięcia.
- `{ board: { kind: 'sprint', code, base?, sprint? } }` — postać biegnie po torze
  (zawija się na krańcu), klawisz Shift (prawdziwy lub przełącznik role=switch)
  zamienia argument speed w move(x, y, speed) z `base` na `sprint`; duch
  pokazuje tempo bazowe, gap mierzy wyprzedzenie.
- `{ board: { kind: 'events', code } }` — gracz w centrum planszy (HP 100),
  pociski wystrzeliwane przyciskiem lecą w niego z prawej; trafienie zapisuje
  `onCollision(Projectile)` w dzienniku kamieni milowych i na kolorowej osi,
  schodzi 1 HP i wypuszcza unoszący się „-1". Przełącznik `active` usypia
  cały GameObject (onDisable, ticki i render stają), powrót woła onEnable
  i wznawia ten sam stan. Kod pod planszą pokazuje źródło zdarzeń.
- `{ board: { kind: 'vector-race', vx?, vy?, distance?, seconds? } }` — wyścig
  dwóch kulek z jednego punktu: „surowa" leci `|v|*distance` px i wylatuje
  poza pole, „znormalizowana" ląduje dokładnie po `distance` px. Surowy (0,0)
  jest blokowany z podpowiedzią o dzieleniu przez zero.



Te widżety są BAJTOWO identyczne w java-lab i web-learning-lab (kopiuj, nie
forkuj — precedens: ChaseVectorBoard, CoordinateBoard). Różnią się tylko
łańcuchy `code`/`api` w notatkach (`GameLab.`/`this.canvas.` w JS vs czysta
składnia Javy).

Testy: `src/components/<Board>.test.jsx` w obu labach + rozszerzony test
pokrycia `src/data/gameDevTaskLearning.test.js` (`board.kind` ∈ chase |
coordinates | components | keypress | canvas | lifecycle | sprint | vector-race | events | camera). Uruchom: `npx vitest run <pliki>
--maxWorkers=1 --minWorkers=1` sekwencyjnie w każdym labie.

### Tablica kamery (`board.kind === 'camera'`)

Kontrakt: `player: {name, x, y}`, `camera: {x, y}`, `world: {width, height}`, `view: {width, height}` oraz łańcuchy kodu `followCode`, `axisCode` (szablon z `{axis}`/`{value}`), `positionCode` (szablon z `{x}`/`{y}`) — te ostatnie w języku danego labu. Plansza pokazuje świat z góry, gracza (drag + strzałki), ramkę widoku wyśrodkowaną na pozycji GameObjectu kamery, przełączniki `followX`/`followY`, suwak ręcznego Y i przycisk wstrząsu (drga tylko ramka — status podkreśla, że pozycja kamery się nie zmienia). Użyta w `g2d.camera.modified`.
