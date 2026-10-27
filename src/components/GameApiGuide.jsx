import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gameLabApi, gameLabAssetGroups, gameLabAssets, gameLabComponentGroups, gameLabMemberDocs, gameLabMembers } from '../data/gameLabApi.js';
import { callableMembers } from '../services/gameLabCompletions.js';

const example = `class MyGame extends GameLab.Game {
  onCreate() {
    const player = this.createObject('Player');
    player.setPosition(90, 70);
    player.addComponent(new GameLab.Sprite(GameLab.Assets.PLAYER01));
    player.addComponent(new GameLab.CircleCollider2D(12));
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
  signature: `${owner}.${name}${callableMembers.has(name) && !(['rotation','scale'].includes(name) && owner === 'Transform') ? '(...)' : ''}`,
  description: gameLabMemberDocs[`${owner}.${name}`] ?? gameLabMemberDocs[name] ?? `Element API klasy ${owner}.`,
  example: '',
  kind: 'Method',
}))).filter(entry => !['drawTileMap', 'drawSprite'].includes(entry.name));

const categories = ['Wszystko', ...new Set(gameLabApi.map(item => item.category))];

const apiByName = new Map(gameLabApi.map(item => [item.name, item]));
// Zero-width space after '_' lets long constant names wrap at underscores.
const softWrap = value => value.replaceAll('_', '_\u200B');
const assetsByCategory = gameLabAssetGroups.map(group => ({
  ...group,
  assets: gameLabAssets.filter(asset => asset.category === group.id),
}));

function AssetIcon({ asset }) {
  const frame = asset.draw.frame;
  const scale = Math.min(56 / frame.w, 56 / frame.h);
  return <span className="game-asset-slot" aria-hidden="true"><span className="game-asset-icon" style={{ width: Math.round(frame.w * scale), height: Math.round(frame.h * scale) }}>
    <img src={`${import.meta.env.BASE_URL}game-assets/${asset.draw.source}`} alt="" loading="lazy" style={{ transform: `translate(${-frame.x * scale}px, ${-frame.y * scale}px) scale(${scale})` }} />
  </span></span>;
}

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
  const [assetQuery, setAssetQuery] = useState('');
  const [copied, setCopied] = useState('');
  const copyTimer = useRef(null);
  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('pl');
    return [...gameLabApi, ...memberEntries].filter(item =>
      (category === 'Wszystko' || item.category === category)
      && `${item.name} ${item.category} ${item.signature} ${item.description}`.toLocaleLowerCase('pl').includes(needle),
    );
  }, [category, query]);
  const assetGroups = useMemo(() => {
    const needle = assetQuery.trim().toLocaleLowerCase('pl');
    return assetsByCategory
      .map(group => ({ ...group, assets: needle ? group.assets.filter(asset => `${asset.key} ${asset.constant}`.toLocaleLowerCase('pl').includes(needle)) : group.assets }))
      .filter(group => group.assets.length);
  }, [assetQuery]);
  async function copyAsset(asset) {
    const code = `GameLab.Assets.${asset.constant}`;
    try { await navigator.clipboard.writeText(code); } catch { /* clipboard can be unavailable; selection still visible */ }
    clearTimeout(copyTimer.current);
    setCopied(asset.constant);
    copyTimer.current = setTimeout(() => setCopied(''), 1600);
  }

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
        <button type="button" className={section === 'components' ? 'is-active' : ''} aria-current={section === 'components' ? 'page' : undefined} onClick={() => setSection('components')}>Komponenty</button>
        <button type="button" className={section === 'assets' ? 'is-active' : ''} aria-current={section === 'assets' ? 'page' : undefined} onClick={() => setSection('assets')}>Assety</button>
        <button type="button" className={section === 'reference' ? 'is-active' : ''} aria-current={section === 'reference' ? 'page' : undefined} onClick={() => setSection('reference')}>API silnika</button>
        <button type="button" className={section === 'architecture' ? 'is-active' : ''} aria-current={section === 'architecture' ? 'page' : undefined} onClick={() => setSection('architecture')}>Architektura</button>
      </nav>
      {section === 'start' ? <div className="game-api-start">
        <div className="game-api-intro">
          <p>W <code>game.js</code> piszesz scenę oraz komponenty. Gotowe API jest dostępne jako <code>GameLab</code>. HTML i CSS edytujesz w osobnych zakładkach, a podgląd korzysta z prawdziwego canvasu.</p>
          <ol><li>Rozszerz <code>GameLab.Game</code>.</li><li>W <code>onCreate()</code> utwórz obiekty i dodaj im komponenty.</li><li>W <code>onUpdate(delta)</code> aktualizuj grę; delta jest czasem w sekundach.</li><li>Na końcu pliku dodaj <code>GameLab.run(MyGame)</code>. Kliknij przycisk ▶ Play, aby uruchomić grę i sprawdzić zadanie.</li></ol>
        </div>
        <pre tabIndex={0}><code>{example}</code></pre>
        <div className="game-api-callouts">
          <p><strong>Scena i komponenty</strong><br /><code>onCreate</code> wykonuje się raz, <code>onUpdate(delta)</code> co klatkę. W komponencie używaj <code>this.game</code>, <code>this.gameObject</code> i <code>this.transform</code>.</p>
          <p><strong>Współrzędne i sterowanie</strong><br />Pozycja oznacza środek obiektu w pikselach, dodatnie Y biegnie w dół. Ruch postaci w kursie: <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>.</p>
          <p><strong>Play i wynik zadania</strong><br />Przycisk ▶ Play uruchamia podgląd i sprawdza zadanie. Test tworzy osobną scenę i symuluje klatki oraz klawisze. W playgroundzie Play tylko uruchamia projekt.</p>
        </div>
      </div> : section === 'components' ? <div className="game-api-start">
        <p className="game-api-intro">Komponent to gotowa cecha, którą podpinasz do obiektu przez <code>addComponent(new GameLab.X())</code>. Jeden obiekt może mieć wiele komponentów; każdy typ pełni inną rolę. Komponent innego typu pobierasz przez <code>this.requireComponent(GameLab.X)</code> (zgłasza błąd, gdy go brakuje) albo <code>this.getComponent(GameLab.X)</code> (zwraca komponent lub null). Cudzy obiekt znajdziesz przez <code>this.game.find(&quot;Nazwa&quot;)</code>, a komponent uczestnika kontaktu przez <code>other.getComponent(...)</code> w onTrigger.</p>
        <div className="game-component-groups">
          {gameLabComponentGroups.map(group => <section className="game-component-group" key={group.label}>
            <h3>{group.label}</h3>
            <p className="game-component-hint">{group.hint}</p>
            <ul>
              {group.names.map(name => { const item = apiByName.get(name); return <li key={name}>
                <code>{item?.signature ?? name}</code>
                <span>{item?.description}</span>
                {item?.example && <details className="game-component-example"><summary>Pokaż użycie</summary><pre><code>{item.example}</code></pre></details>}
              </li>; })}
            </ul>
          </section>)}
        </div>
        <p className="game-api-note"><strong>Bez addComponent:</strong> <code>GameLab.Game</code> i <code>GameLab.GameObject</code> to scena i obiekty, <code>Transform</code> jest wbudowany w każdy obiekt, <code>this.input</code> i <code>this.canvas</code> pochodzą ze sceny, a <code>Tweens</code>, <code>Assets</code>, <code>UIAnchor</code>, <code>Vector2</code> i <code>Random</code> to narzędzia. Własny komponent piszesz jako <code>class X extends GameLab.Component</code>.</p>
      </div> : section === 'assets' ? <div className="game-api-start">
        <p className="game-api-intro">Wszystkie grafiki pochodzą ze wspólnego katalogu. W kodzie wpisujesz stałą <code>GameLab.Assets.NAZWA</code> — kliknij kartę, aby ją skopiować. Klucz w cudzysłowie to nazwa tekstury przyjmowana też przez <code>new GameLab.TileMap(&quot;klucz&quot;)</code>.</p>
        <div className="game-api-search-row">
          <label>Znajdź grafikę<input type="search" value={assetQuery} onChange={event => setAssetQuery(event.target.value)} placeholder="np. slime, coin, UI_BUTTON…" /></label>
        </div>
        <p className="game-api-count">{assetGroups.reduce((total, group) => total + group.assets.length, 0)} grafik · podgląd pokazuje to, co narysuje silnik</p>
        <div className="game-asset-groups">
          {assetGroups.map(group => <section className="game-asset-group" key={group.id}>
            <h3>{group.label} <span>{group.assets.length}</span></h3>
            <p className="game-component-hint">{group.hint}</p>
            <div className="game-asset-grid">
              {group.assets.map(asset => <button type="button" className="game-asset-card" key={asset.key} title={`Kopiuj GameLab.Assets.${asset.constant}`} aria-label={`${asset.key} — kopiuj GameLab.Assets.${asset.constant}`} onClick={() => copyAsset(asset)}>
                <AssetIcon asset={asset} />
                <code className="game-asset-name">{copied === asset.constant ? '✓ Skopiowano' : softWrap(asset.constant)}</code>
                <span className="game-asset-key">&quot;{asset.key}&quot;{asset.draw.key !== asset.key ? ` → ${asset.draw.key}` : ''}{asset.aliases.length ? ` · także Assets.${asset.aliases.join(', ')}` : ''}</span>
              </button>)}
            </div>
          </section>)}
          {!assetGroups.length && <p>Nie znaleziono grafiki pasującej do filtra.</p>}
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
