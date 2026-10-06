# Game Dev JS — API GameLab

Ten dokument opisuje API dostarczane przez `src/services/gameRuntime.js`. W kursie to samo API jest dostępne pod przyciskiem **Dokumentacja GameLab**, a Monaco podpowiada jego klasy, metody i właściwości w plikach JavaScript kursu Game Dev.

## Model gry

Silnik używa relacji scena → obiekty → komponenty. Scena przechowuje stan oraz tworzy obiekty; obiekt ma `Transform` i komponenty; komponent dodaje grafikę, kolizję albo zachowanie. HTML i CSS edytowane w pozostałych kartach określają stronę z canvasem, a JavaScript tworzy scenę gry.

```js
class MyGame extends GameLab.Game {
  onCreate() {
    const player = this.createObject('Player');
    player.setPosition(90, 70);
    player.addComponent(new GameLab.Sprite('player'));
    player.addComponent(new GameLab.CharacterController2D());
  }

  onUpdate(delta) {
    const player = this.find('Player');
    const movement = player.getComponent(GameLab.CharacterController2D);
    const x = Number(this.input.isKeyDown('d')) - Number(this.input.isKeyDown('a'));
    const y = Number(this.input.isKeyDown('s')) - Number(this.input.isKeyDown('w'));
    movement.move(x, y, 120);
  }
}

GameLab.run(MyGame);
```

`delta` jest czasem klatki w sekundach. Pozycje oraz prędkości są w pikselach i pikselach na sekundę. Początek układu znajduje się w lewym górnym rogu, a dodatnie `y` biegnie w dół.

## Publiczne klasy i metody

| API | Konstrukcja / ważne elementy | Zastosowanie |
| --- | --- | --- |
| `Game` | `createObject(name)`, `find(name)`, `onCreate()`, `onUpdate(delta)`, `onDrawUI()`, `onDestroy()` | Bazowa klasa sceny. |
| `GameObject` | `setPosition(x, y)`, `addComponent(component)`, `getComponent(Type)`, `removeComponent(component)`, `destroy()` | Obiekt o nazwie, pozycji i komponentach. |
| `Component` | `game`, `gameObject`, `transform`, `enabled`; hooki `onCreate`, `onUpdate`, `onDrawUI`, `onDestroy`, `onCollision(other)`, `onTrigger(other)` | Bazowa klasa zachowań ucznia. |
| `Transform` | `x`, `y`, `rotation`, `scale.x/y`, `visualOffset.x/y` | Pozycja, obrót w radianach, skala grafiki i przesunięcie wizualne. |
| `ShapeRenderer` | `new ShapeRenderer({ width, height, color })` | Prostokątny kształt z wypełnieniem; domyślnie 32×32 px. |
| `Sprite` | `new Sprite(texture, width?, height?)` | Tekstura: `player`, `slime`, `bat`, `ghost`, `gem`, `coin`, `chest`, `projectile`, `heart` lub `wall`. |
| `TextRenderer` | `new TextRenderer(text, x?, y?, color?)` | Napis HUD. Tekst lub funkcja zwracająca aktualny napis; `null` ukrywa komponent. |
| `ControlsHint` | `new ControlsHint(text?)` | Opcjonalny tekst instrukcji na dole canvasu, widoczny wyłącznie gdy plansza nie ma fokusu. |
| `Camera2D` | `offsetX`, `offsetY`, `follow(target)`, `stopFollowing()`, `shake(strength, seconds)`, `stopShake()` | Przesuwa widok świata, utrzymuje cel na środku i pozwala potrząsnąć obrazem. Pierwsza aktywna kamera steruje widokiem. |
| `TileMap` | `new TileMap('grass' \| 'sand', tileSize?)` | Tło z kafelków; nie tworzy colliderów. Minimalny kafelek ma 8 px. |
| `Input` | `isKeyDown(key)`, `isKeyPressed(key)` | Klawisze trzymane oraz nowe naciśnięcie w bieżącej klatce. W komponencie: `this.game.input`. |
| `Canvas` | `width`, `height`, `drawRect(x,y,w,h,color?)`, `drawText(text,x,y,color?)` | Rysowanie HUD w `onDrawUI()`. Dostęp przez `this.canvas` w scenie. |
| `CharacterController2D` | `move(x, y, speed?)`, `velocity`, `collideWorldBounds` | Ruch w px/s, normalizowany również po przekątnej. Wywołuj `move` w każdej klatce. |
| `Collider2D` | `new Collider2D()` | Prostokątna kolizja blokująca; rozmiar wynika z renderera albo domyślnie wynosi 32×32 px. |
| `Trigger2D` | `new Trigger2D()` | Prostokątny kontakt bez blokowania; obsłuż go w `onTrigger(other)`. |
| `Tweens` | `position(object,x,y,seconds)`, `scale(object,x,y,seconds)`, `rotation(object,radians,seconds)`, `shake(object,strength,seconds)` | Animacje właściwości `Transform`; zwracają `Tween`. |
| `Tween` | `cancel()`, `easing`, `completed`, `elapsed`, `duration` | Uchwyt animacji; `easing` przyjmuje `linear` lub `smooth`. |
| `GameLab` | `run(GameClass,{ canvas? })`, `dispose()` | Uruchomienie sceny i zakończenie gry. Domyślny canvas to `#game`. |

Scena renderuje kafelki przed obiektami, a `onDrawUI()` i `TextRenderer` po sprite'ach. `Collider2D` blokuje ruch kontrolera; `Trigger2D` jedynie raportuje kontakt. Geometria kolizji jest prostokątna i nie obraca się wraz z grafiką. Skala sprite’a wpływa na rozmiar prostokątnej kolizji; `visualOffset` nie przesuwa fizycznej bryły.

## Kamera i duży świat

```js
const cameraObject = this.createObject('Camera');
const camera = cameraObject.addComponent(new GameLab.Camera2D());
camera.follow(player);
// Dla świata większego od ekranu:
player.getComponent(GameLab.CharacterController2D).collideWorldBounds = false;
```

Kamera nie zmienia pozycji obiektów, kolizji ani celu AI. Kafelki, sprite’y i kształty są przesuwane w widoku; `TextRenderer` oraz `ControlsHint` pozostają w przestrzeni ekranu. Kamera podążająca uwzględnia aktualny rozmiar canvasu. `offsetX/Y` są dodatkowymi przesunięciami; `stopFollowing()` wraca do widoku wyznaczanego tymi polami.

## Kolejność kursu i Playground

Lekcje 701–710 prowadzą od obiektów i komponentów do gry survival. Lekcja 711 dodaje kamerę, a 712 uczy ręcznego rysowania. W przykładach tworzenie obiektu i ustawienie jego pozycji zawsze są osobnymi instrukcjami. Zmienione zadania 701–703 mają nowe identyfikatory, aby wczytywały aktualne startery; wcześniejsze szkice pozostają w lokalnym zapisie.

Ścieżka Playground (801) zaczyna od pustej sceny z pełnym API GameLab. Nie ma sprawdzania zadań. Import i eksport JSON obejmują manifest, HTML, CSS, JavaScript i dodatkowe pliki w folderach. Format eksportu ma `format: "web-learning-lab-game-project"` oraz `version: 1`. Import jest sprawdzany przed podmianą projektu, a pliki są zapisywane lokalnie tak jak szkice zadań.

## Cykl klatki

Silnik inicjalizuje nowe komponenty, czyści tło, aktualizuje tweeny, zeruje prędkość kontrolerów, wywołuje `onUpdate(delta)` sceny i aktywnych komponentów, przesuwa obiekty i sprawdza kontakty, rysuje świat oraz HUD, a na końcu czyści stan `isKeyPressed`. Czas pojedynczej klatki jest ograniczony do 0,1 s.

## Edytor i podgląd

W pliku `.js` wpisz `GameLab.` albo kropkę po wspieranym obiekcie, aby otworzyć podpowiedzi. Edytor uzupełnia klasy, hooki, metody i właściwości wraz z opisem oraz przykładem. Podpowiedzi są aktywne w Game Dev i Playground. „Sprawdź” uruchamia scenariusz na odizolowanej, świeżej scenie; nie resetuje bieżącego podglądu. Linie duplikujesz przez Shift+Alt+strzałkę albo alternatywnie Ctrl+Shift+D (w dół); skróty ruchu i duplikowania działają również w edytorze awaryjnym.
