# InputManager — Java i JavaScript

Każda scena ma własny `game.input`. Komponent używa `getGame().input` w Javie oraz `this.game.input` w JavaScript.

| Wywołanie | Zachowanie |
| --- | --- |
| `isKeyDown("w")` | Klawisz jest przytrzymany. |
| `isKeyPressed("Space")` | Klawisz został naciśnięty w tej klatce. |
| `isKeyReleased("Space")` | Klawisz został zwolniony w tej klatce. |
| `consumeKey("Space")` | Kolejne komponenty nie obsłużą tego klawisza w tej klatce. |
| `getPointerPosition()` | Kopia pozycji kursora w pikselach CSS canvas, `null` przed pierwszym ruchem. |
| `isMouseDown(button)` | Przycisk myszy jest przytrzymany. |
| `isMousePressed(button)` | Przycisk został naciśnięty w tej klatce. |
| `isMouseReleased(button)` | Przycisk został zwolniony w tej klatce. |
| `consumeMouse(button)` | UI przejmuje przycisk w tej klatce, zanim wejście obsłuży WORLD. |

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

Stan `Pressed` i `Released` jest czyszczony po klatce. Wielokrotne zdarzenia naciśnięcia przytrzymanego przycisku nie tworzą nowych przejść. DPR nie zmienia współrzędnych wejścia.
