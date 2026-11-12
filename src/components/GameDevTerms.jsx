import { gameLabApi } from '../data/gameLabApi.js';

// Dokumentowane terminy → wpis w „Dokumentacja GameLab". Wartość `entry` to
// fraza wpisywana w wyszukiwarkę przewodnika; `Klasa.metoda` trafia w dokładny
// wpis składowej, sama `Klasa` w kartę klasy.
const documented = new Map(gameLabApi.map(({ name, description }) => [
  name, { entry: name, summary: description.split('. ', 1)[0].replace(/\.?$/, '.') },
]));
for (const [term, entry, summary] of [
  ['move', 'CharacterController2D.move', 'Ustawia kierunek i prędkość ruchu obiektu.'],
  ['isKeyDown', 'InputManager.isKeyDown', 'Sprawdza, czy klawisz jest przytrzymany.'],
  ['isKeyPressed', 'InputManager.isKeyPressed', 'Wykrywa początek naciśnięcia klawisza.'],
  ['onUpdate', 'Component.onUpdate', 'Silnik wywołuje tę metodę w każdej klatce.'],
  ['setWorldBounds', 'Game.setWorldBounds', 'Ustawia granice świata gry.'],
  ['hitLayers', 'Projectile2D.hitLayers', 'Wybiera warstwy, które pocisk może trafić.'],
  ['getDirection', 'CharacterController2D.getDirection', 'Zwraca ostatni niezerowy kierunek ruchu.'],
]) documented.set(term, { entry, summary });

// Nazwy z projektów ucznia — podświetlane bez linku do dokumentacji.
const projectTerms = new Set([
  'EnemyAI', 'FleeAI', 'PlayerController', 'BulletShooter', 'SpaceShooter',
  'ProjectileHit', 'ProjectileMotion', 'FireWeapon', 'CombatEnemy', 'Health',
  'MyGame', 'Player', 'Slime', 'Bat', 'Enemy', 'Coin', 'Ally', 'PlayerShot',
  'Wall', 'LeftWall', 'RightWall', 'PlatformA', 'PlatformB', 'Fireball',
  'dx', 'dy', 'speed', 'controller', 'owner', 'lifetime', 'remaining',
  'shoot', 'shots', 'hp', 'motion', 'target', 'Math.hypot', 'Number',
]);
const terms = [...new Set([...documented.keys(), ...projectTerms])]
  .sort((first, second) => second.length - first.length)
  .map(term => term.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&'));
const wordCharacter = '[\\p{L}\\p{M}\\p{N}_$]';
const pattern = new RegExp('(?<!' + wordCharacter + ')(' + terms.join('|') + ')(?!' + wordCharacter + ')', 'gu');

export default function GameDevTerms({ text }) {
  return String(text ?? '').split(pattern).map((part, index) => {
    const reference = documented.get(part);
    if (reference) return (
      <button key={index} type="button" className="pilot-term pilot-term--docs"
        aria-haspopup="dialog" aria-label={'Dokumentacja: ' + part}
        title={reference.summary} aria-description={reference.summary}
        data-summary={reference.summary}
        onKeyDown={event => {
          if (event.key === 'Escape') event.currentTarget.dataset.summaryDismissed = '';
        }}
        onBlur={event => delete event.currentTarget.dataset.summaryDismissed}
        onClick={event => window.dispatchEvent(new CustomEvent('web-lab-open-api-guide', {
          detail: { entry: reference.entry, trigger: event.currentTarget },
        }))}>
        {part}
      </button>
    );
    return projectTerms.has(part) ? <span key={index} className="pilot-term">{part}</span> : part;
  });
}
