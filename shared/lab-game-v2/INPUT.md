# InputManager — Java i JavaScript

Każda scena ma własny `game.input`. Komponent używa `getGame().input` w Javie oraz `this.game.input` w JavaScript.

| Wywołanie | Zachowanie |
| --- | --- |
| `isKeyDown("w")` | Klawisz jest przytrzymany. |
| `isKeyPressed("Space")` | Klawisz został naciśnięty w tej klatce. |
| `isKeyReleased("Space")` | Klawisz został zwolniony w tej klatce. |
| `consumeKey("Space")` | Kolejne komponenty nie obsłużą tego klawisza w tej klatce. |
| `getPointerPosition()` | Kopia pozycji kursora w pikselach logicznych canvas (600×600), `null` przed pierwszym ruchem. |
| `isMouseDown(button)` | Przycisk myszy jest przytrzymany. |
| `isMousePressed(button)` | Przycisk został naciśnięty w tej klatce. |
| `isMouseReleased(button)` | Przycisk został zwolniony w tej klatce. |
| `consumeMouse(button)` | UI przejmuje przycisk w tej klatce, zanim wejście obsłuży WORLD. |

Nazwy klawiszy mają stałe: `GameLab.Keys` w JavaScript i `engine.Keys` w Javie. Wartości to te same stringi — `isKeyDown(Keys.SPACE)` działa jak `isKeyDown("Space")`, ale stała broni przed literówką. Dostępne: strzałki (`UP`…`RIGHT`), `W/A/S/D`, `X/Y/Z`, `DIGIT_1`–`3`, `SPACE`, `ENTER`, `SHIFT`, `TAB`, `ESCAPE` oraz kody konsoli `ACTION_*`.

Przyciski: `InputManager.MOUSE_LEFT`, `MOUSE_MIDDLE`, `MOUSE_RIGHT`, `MOUSE_BACK`, `MOUSE_FORWARD`. W JavaScript klasa jest dostępna jako `GameLab.InputManager`. Wywołanie metod myszy bez argumentu oznacza lewy przycisk w obu językach.

Java:

```java
InputManager input = getGame().input;
if (input.isMousePressed(InputManager.MOUSE_LEFT)) {
    Vector2 screen = input.getPointerPosition();
    if (screen != null) {
        Vector2 world = camera.screenToWorld(screen);
        // Celowanie używa world; UI używa screen.
    }
}
```

JavaScript:

```js
const input = this.game.input;
if (input.isMousePressed(GameLab.InputManager.MOUSE_LEFT)) {
  const screen = input.getPointerPosition();
  if (screen) {
    const world = camera.screenToWorld(screen);
    // Celowanie używa world; UI używa screen.
  }
}
```

`Button` obsługuje kliknięcie po naciśnięciu i zwolnieniu w swoim prostokącie, także podczas pauzy. Tab/Shift+Tab zmienia fokus; Enter/Space aktywuje przycisk. Utrata fokusu canvas lub okna zwalnia wejście, a przechwycenie wskaźnika pozwala odebrać zwolnienie poza canvas.

Stan `Pressed` i `Released` jest czyszczony po klatce. Wielokrotne zdarzenia naciśnięcia przytrzymanego przycisku nie tworzą nowych przejść. DPR i letterbox nie zmieniają współrzędnych wejścia — pozycja wskaźnika jest zawsze w pikselach logicznych 600×600.

## Wirtualna konsola

Oba podglądy otaczają canvas konsolą: pasek statystyk (FPS, śr. ms z 3 s, max ms, wciśnięte klawisze) i pad sterowany myszą oraz dotykiem (multi-touch). Żadnej konfiguracji nie trzeba — pad emituje te same kody co klawiatura.

| Przycisk | Kod semantyczny | Odpowiednik klawiatury |
| --- | --- | --- |
| Krzyżak | — | `ArrowUp/Down/Left/Right`; przełącznik WASD mapuje na `w/a/s/d` |
| A | `ACTION_A` | `Space` |
| B | `ACTION_B` | `z` |
| X | `ACTION_X` | `x` |
| Y | `ACTION_Y` | `y` |
| Start | `ACTION_START` | `Enter` |
| Select | `ACTION_SELECT` | `Shift` |

Przycisk akcji emituje **oba kody naraz**: `isKeyDown("ACTION_A")` i `isKeyDown("Space")` są równocześnie prawdziwe. Dzięki temu starsze gry na `Space`/`z` działają bez zmian, a nowy kod może używać semantycznych `ACTION_*` (które nie kolidują z WASD). Fizyczna klawiatura podświetla odpowiadający przycisk, a pasek statystyk pokazuje etykiety konsoli (`A`, `START`, `↑` …).
