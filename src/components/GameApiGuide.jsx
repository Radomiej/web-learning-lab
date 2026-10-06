import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gameLabApi, gameLabMemberDocs, gameLabMembers } from '../data/gameLabApi.js';

const example = `class MyGame extends GameLab.Game {
  onCreate() {
    const player = this.createObject('Player');
    player.setPosition(90, 70);
    player.addComponent(new GameLab.Sprite('player'));
    player.addComponent(new GameLab.CharacterController2D());
  }

  onUpdate(delta) {
    const player = this.find('Player');
    const movement = player.getComponent(GameLab.CharacterController2D);
    if (this.input.isKeyDown('d')) {
      movement.move(1, 0, 120);
    }
  }
}
GameLab.run(MyGame);`;

const memberEntries = Object.entries(gameLabMembers).flatMap(([owner, names]) => names.map(name => ({
  name,
  category: gameLabApi.find(item => item.name === owner)?.category ?? owner,
  signature: `${owner}.${name}${['x', 'y', 'rotation', 'scale', 'visualOffset', 'velocity', 'collideWorldBounds', 'width', 'height', 'background', 'text', 'color', 'enabled', 'game', 'gameObject', 'transform', 'easing', 'completed', 'elapsed', 'duration', 'offsetX', 'offsetY', 'target', 'name', 'active', 'destroyed', 'canvas', 'input', 'time', 'objects'].includes(name) ? '' : '(...)'}`,
  description: gameLabMemberDocs[`${owner}.${name}`] ?? gameLabMemberDocs[name] ?? `Element API klasy ${owner}.`,
  example: '',
  kind: 'Method',
}))).filter(entry => !['drawTileMap', 'drawSprite'].includes(entry.name));

const categories = ['Wszystko', ...new Set(gameLabApi.map(item => item.category))];

export default function GameApiGuide() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (dialog.showModal) dialog.showModal();
    else dialog.setAttribute('open', '');
    dialog.querySelector('button')?.focus();
    return () => {
      dialog.close?.();
      document.body.style.overflow = overflow;
      triggerRef.current?.focus();
    };
  }, [open]);
  const [section, setSection] = useState('start');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Wszystko');
  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('pl');
    return [...gameLabApi, ...memberEntries].filter(item =>
      (category === 'Wszystko' || item.category === category)
      && `${item.name} ${item.category} ${item.signature} ${item.description}`.toLocaleLowerCase('pl').includes(needle),
    );
  }, [category, query]);

  return <>
    <button ref={triggerRef} className="button button--ghost" type="button" aria-label="Dokumentacja GameLab" aria-haspopup="dialog" onClick={() => setOpen(true)}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M12 5v15M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Z" /></svg>
      Dokumentacja GameLab
    </button>
    {open && createPortal(<dialog ref={dialogRef} className="game-guide-modal" aria-label="Dokumentacja GameLab" onCancel={event => { event.preventDefault(); setOpen(false); }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); setOpen(false); } }} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
    <header className="game-guide-heading"><div><p className="eyebrow">GameLab · Dokumentacja silnika</p><h2>Obiekty, komponenty i API</h2></div><button className="button button--ghost" type="button" onClick={() => setOpen(false)} aria-label="Zamknij dokumentację">Zamknij ×</button></header>
    <div className="game-api-body">
      <nav className="game-api-nav" aria-label="Rozdziały dokumentacji GameLab">
        <button type="button" className={section === 'start' ? 'is-active' : ''} aria-current={section === 'start' ? 'page' : undefined} onClick={() => setSection('start')}>Pierwsze kroki</button>
        <button type="button" className={section === 'reference' ? 'is-active' : ''} aria-current={section === 'reference' ? 'page' : undefined} onClick={() => setSection('reference')}>API silnika</button>
        <button type="button" className={section === 'architecture' ? 'is-active' : ''} aria-current={section === 'architecture' ? 'page' : undefined} onClick={() => setSection('architecture')}>Architektura</button>
      </nav>
      {section === 'start' ? <div className="game-api-start">
        <div className="game-api-intro">
          <p>W <code>game.js</code> piszesz scenę oraz komponenty. Gotowe API jest dostępne jako <code>GameLab</code>. HTML i CSS edytujesz w osobnych zakładkach, a podgląd korzysta z prawdziwego canvasu.</p>
          <ol><li>Rozszerz <code>GameLab.Game</code>.</li><li>W <code>onCreate()</code> utwórz obiekty i dodaj im komponenty.</li><li>W <code>onUpdate(delta)</code> aktualizuj grę; delta jest czasem w sekundach.</li><li>Uruchom <code>GameLab.run(MyGame)</code> lub kliknij Uruchom.</li></ol>
        </div>
        <pre tabIndex={0}><code>{example}</code></pre>
        <div className="game-api-callouts">
          <p><strong>Scena i komponenty</strong><br /><code>onCreate</code> wykonuje się raz, <code>onUpdate(delta)</code> co klatkę. W komponencie używaj <code>this.game</code>, <code>this.gameObject</code> i <code>this.transform</code>.</p>
          <p><strong>Współrzędne i sterowanie</strong><br />Pozycja oznacza środek obiektu w pikselach, dodatnie Y biegnie w dół. Ruch postaci w kursie: <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>.</p>
          <p><strong>Testy a podgląd</strong><br />„Sprawdź” tworzy świeżą scenę i symuluje klatki oraz klawisze. Podgląd na żywo ma własną, niezależną instancję gry.</p>
        </div>
      </div> : section === 'architecture' ? <div className="game-api-start"><h3>Obiekt + komponenty = zachowanie</h3><p>Scena dziedziczy po <code>GameLab.Game</code>. Obiekt przechowuje pozycję, a komponenty dodają wygląd, ruch, kolizje i reguły gry.</p><h3>Cykl życia</h3><p><code>onCreate()</code> przygotowuje stan raz. <code>onUpdate(delta)</code> aktualizuje go co klatkę. Czas podajemy w sekundach, prędkość w pikselach na sekundę.</p><h3>Kamera i HUD</h3><p><code>Camera2D</code> przesuwa widok świata, nie pozycje obiektów. Tekst interfejsu używa <code>TextRenderer</code> w przestrzeni ekranu.</p><h3>Twoje pliki</h3><p>W <code>game.js</code> uruchom scenę. Własne komponenty trzymaj w folderze <code>components/</code> i importuj jako moduły JavaScript. Canvas jest wynikiem pracy silnika, nie miejscem przechowywania reguł gry.</p></div> : <div className="game-api-reference">
        <div className="game-api-search-row">
          <label>Wyszukaj klasę lub metodę<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="np. Sprite, move, kolizje" /></label>
          <label>Kategoria<select value={category} onChange={event => setCategory(event.target.value)}>{categories.map(value => <option key={value}>{value}</option>)}</select></label>
        </div>
        <p className="game-api-count">{results.length} pozycji · API zgodne z podpowiedziami w edytorze</p>
        <div className="game-api-entries">
          {results.map((item, index) => <details className="game-api-entry" key={`${item.category}-${item.name}-${index}`}>
            <summary><code>{item.signature}</code><span>{item.category}</span></summary>
            <p>{item.description}</p>
            {item.example && <pre><code>{item.example}</code></pre>}
          </details>)}
          {!results.length && <p>Nie znaleziono pasującej klasy ani metody.</p>}
        </div>
      </div>}
    </div>
    </dialog>, document.body)}
  </>;
}
