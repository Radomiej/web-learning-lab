# Wspólne API Lab Game 2D v2

Scena dziedziczy po `Game`, zachowanie po `Component`. Java importuje `engine.*`; JavaScript używa przestrzeni `GameLab`. Kod lekcji różni się składnią, typami i przekazywaniem klasy: `Player.class` w Javie, `Player` w JavaScript.

| API | Kontrakt |
| --- | --- |
| `game.createObject(name)` | Nowy GameObject ze stabilnym ID w scenie. |
| `object.setPosition(x,y)` | Środek obiektu w pikselach świata; zwraca obiekt. |
| `object.addComponent(instance)` | Dodaje nowy komponent; zwraca komponent. |
| `getComponent(Type)` | Pierwszy zgodny typ lub `null`. |
| `getComponents(Type)` | Kopia listy zgodnych komponentów; uwzględnia dziedziczenie. |
| `requireComponent(Type)` | Komponent lub błąd konfiguracji. |
| `removeComponent(instance/Type)`, `removeComponents(Type)` | Usunięcie pojedynczego komponentu lub wszystkich zgodnego typu. |
| `game.getObjectsWith(Type...)` | Przecięcie indeksów komponentów; kopia wyników w kolejności ID. Pierwsze zapytanie o typ buduje jego indeks; zmiany aktualizują go na bieżąco. |
| `addTag(tag)`, `removeTag(tag)`, `hasTag(tag)`, `getTags()` | Tagi obiektu; `game.getObjectsWithTag(tag)` zwraca kopię wyników indeksu. |
| `collider.onContactEnter(Type, callback)` | Raz przy rozpoczęciu kontaktu z obiektem mającym dany komponent. Zwraca funkcję odpięcia (`Runnable` w Javie). Po rozdzieleniu kolejny kontakt wywołuje callback ponownie. |
| `game.pause()/resume()/isPaused()` | Pauza WORLD; UI i unscaled time pozostają aktywne. |
| `time.deltaTime/elapsed` | Sekundy WORLD. Krok jest ograniczony do 0,1 s. |
| `time.unscaledDeltaTime/unscaledElapsed` | Sekundy niezależne od pauzy, z tym samym limitem kroku. |

Zapytania komponentów i tagów obejmują także nieaktywne obiekty i wyłączone komponenty; usunięte obiekty nie występują w wynikach. Rejestry należą do konkretnej sceny.

`component.setEnabled(false)` i `object.setActive(false)` natychmiast unieważniają indeks fizyki oraz resetują fokus i rozpoczęte naciśnięcia przycisków. Używaj tych metod przy zmianie stanu w obu językach. Java udostępnia także pola publiczne; bezpośrednie zmiany `enabled`/`active` wymagają `physics.refresh()` przed kolejnym zapytaniem w tej samej aktualizacji. Reset UI dla nieaktywnych przycisków odbywa się również na początku klatki.

Grafika:

```java
player.addComponent(new Sprite(Assets.PLAYER01));
player.addComponent(new CircleCollider2D(12));
ProgressBar hp = hud.addComponent(new ProgressBar(200,20));
hp.setProgress(50);
```

```js
player.addComponent(new GameLab.Sprite(GameLab.Assets.PLAYER01));
player.addComponent(new GameLab.CircleCollider2D(12));
const hp = hud.addComponent(new GameLab.ProgressBar(200,20));
hp.setProgress(50);
```

`Sprite` i `ShapeRenderer` mają `space`, `layer`, `order`. Domyślne `space="world"`; `"screen"` oraz aktywny UITransform tworzą UI. Kolejność jest stabilna: świat, ekran, layer, order, kolejność utworzenia i dodania. `rotation` jest liczbą w radianach; `scale` i `visualOffset` zmieniają grafikę bez zmiany bryły kolizji.

Collider2D(width,height), CircleCollider2D(radius) i Trigger2D(width,height) mają jawne rozmiary. `layer` i `mask` filtrują obie strony kontaktu. Spatial hash wybiera lokalne pary; analityczne sprawdzanie całego odcinka ruchu zapobiega przechodzeniu przez cienkie ściany. Gęsty obszar może mieć wiele rzeczywistych kontaktów; koszt zależy od lokalnych kandydatów.

`physics.queryRadius` i `findNearest` korzystają z indeksu przestrzeni. Java współdzieli jego snapshot w danej klatce; `setPosition` i zmiany komponentów unieważniają cache. Po bezpośrednim przestawieniu pól Transform lub wymiarów bryły podczas fazy aktualizacji wywołaj `physics.refresh()` przed kolejnym zapytaniem. Faza fizyki sama odświeża indeks po aktualizacji WORLD. JavaScript śledzi także zmiany pól pozycji i wymiarów.

`CharacterController2D.move(x,y,speed)` normalizuje kierunek i sam uwzględnia czas. Granice ustawia `game.setWorldBounds(x,y,width,height)`. Canvas nie tworzy granic świata.

`UITransform(width,height)` ma `anchor`, opcjonalny `pivot`, `getBounds()` i `getCenter()`. `ProgressBar.setValue(value,max)` przelicza procent; max=0 daje 0%. `Button` korzysta z dziewięciu części grafiki i zachowuje narożniki przy zmianie rozmiaru. Kliknięcie i Enter/Space aktywują przycisk po zwolnieniu.

Tween jest komponentem obiektu. `Tweens.position/scale/rotation/shake` zwracają uchwyt z `cancel()` oraz `onComplete(callback)`. Zakończenie naturalne wywołuje callback raz; anulowanie i zniszczenie nie wywołują go. Rejestracja po zakończeniu, także po czasie zero, wywołuje nowy callback od razu. Shake usuwa tylko swój wkład do visualOffset.

Wejście: [InputManager](INPUT.md). Katalog: [manifest assetów](assets/manifest.json). Definicje kursu i scenariuszy są danymi; ich obecność nie oznacza wykonania wszystkich testów zgodności.
