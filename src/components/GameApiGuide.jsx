const example = `class MyGame extends GameLab.Game {
  onCreate() {
    const box = this.createObject('Box').setPosition(90, 70);
    box.addComponent(new GameLab.ShapeRenderer({
      width: 24, height: 24, color: '#70c994'
    }));
  }
  onUpdate(delta) {
    // Zmieniaj stan; delta to czas klatki w sekundach.
  }
}
GameLab.run(MyGame, { canvas: '#game' });`;

export default function GameApiGuide() {
  return <details className="game-api-guide">
    <summary>Pomoc GameLab — składnia i API silnika</summary>
    <div className="game-api-body">
      <p>Plik <code>game.js</code> jest modułem JavaScript. Silnik jest gotowy jako <code>GameLab</code>. Piszesz scenę i własne komponenty; pełny HTML oraz pojedynczy arkusz CSS pozostają w zakładkach edytora.</p>
      <pre tabIndex={0}>{example}</pre>
      <dl>
        <dt>Cykl sceny i komponentu</dt><dd><code>onCreate()</code> raz, <code>onUpdate(delta)</code> co klatkę, <code>onDestroy()</code> przy usunięciu.</dd>
        <dt>Obiekty</dt><dd><code>this.createObject(name)</code>, <code>this.find(name)</code>, <code>object.setPosition(x, y)</code>, <code>object.destroy()</code>, <code>object.active</code>.</dd>
        <dt>Komponenty</dt><dd><code>object.addComponent(new MyComponent())</code>, <code>object.getComponent(GameLab.Sprite)</code>. W komponencie: <code>this.game</code>, <code>this.gameObject</code>, <code>this.transform</code>.</dd>
        <dt>Pozycja i wygląd</dt><dd><code>transform.x/y</code> to środek. <code>rotation</code> jest w radianach. <code>scale.x/y</code> domyślnie 1. <code>ShapeRenderer({`{ width, height, color }`})</code>; <code>Sprite('player', 32, 32)</code>, tekstury player/slime/gem/wall.</dd>
        <dt>Canvas i czas</dt><dd><code>this.canvas.drawRect(x, y, width, height, color)</code>, <code>drawText(text, x, y, color)</code>, <code>canvas.width/height</code>, <code>this.time.deltaTime</code>, <code>this.time.elapsed</code>. Prostokąty są centrowane.</dd>
        <dt>Klawiatura</dt><dd><code>this.input.isKeyDown('ArrowRight')</code> przytrzymanie; <code>isKeyPressed('Space')</code> nowe naciśnięcie. W komponencie użyj <code>this.game.input</code>.</dd>
        <dt>Ruch i kontakty</dt><dd><code>CharacterController2D.move(x, y, speed)</code> normalizuje kierunek. <code>Collider2D</code> blokuje ruch, <code>Trigger2D</code> wykrywa kontakt. Komponent otrzymuje <code>onCollision(other)</code> lub <code>onTrigger(other)</code>. Kolizje są prostokątne i nie obracają się.</dd>
        <dt>Własny plik</dt><dd>Dodaj JavaScript, np. <code>components/Mover.js</code>, z <code>export default class Mover extends GameLab.Component</code>. W game.js: <code>import Mover from './components/Mover.js';</code></dd>
      </dl>
      <p>„Sprawdź” tworzy świeżą scenę dla każdego testu i symuluje czas oraz klawisze. Testowana plansza ma domyślnie 640 × 360, a testy krawędzi mogą podawać inny rozmiar. Aktualny podgląd kontynuuje swoją grę.</p>
    </div>
  </details>;
}
