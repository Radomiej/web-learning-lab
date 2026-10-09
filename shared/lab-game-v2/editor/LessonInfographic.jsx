import { useState } from 'react';
import { assetManifest } from '../assets/Assets.js';
import './LessonInfographic.css';

// Each card explains a rule and its observable result, rather than supplying a task solution.
export const lessonDiagrams = {
 scene: ['player','Obiekt → pozycja w świecie → wygląd','Transform określa pozycję obiektu na mapie. Sprite określa jego wygląd.','player.setPosition(100, 150);','Gracz znajduje się na mapie w (100,150): X = 100, Y = 150. Renderer rysuje sprite względem pozycji obiektu.'],
 components: ['magic-orb','Komponent → własny stan → cykl życia','Dwie instancje Counter mają oddzielne liczniki.','counts++;','onCreate: raz. onUpdate: każda klatka. onDestroy: sprzątanie. Liczniki sprawdzisz w testach.'],
 time: ['player','Prędkość × czas → przesunięcie','Prędkość podajemy w px/s, delta w sekundach.','x += speed * delta;','120 px/s × 0.5 s = 60 px. Dla przekątnej najpierw normalizuj kierunek.'],
 input: ['knight','Klawisz → kierunek → ruch','Przytrzymanie oznacza ciągły ruch. Nowe naciśnięcie oznacza pojedynczą akcję.','movement.move(1, 0, 120);','Kliknij planszę. D lub → przesuwa gracza w prawo; kontroler uwzględnia delta.'],
 graphics: ['ranger','A / D → flipX → kierunek patrzenia','Lustrzane odbicie sprite’a zmienia stronę grafiki.','sprite.flipX = true;','Włącz Collidery: koło pozostaje takie samo. Asymetryczny łucznik pokazuje zmianę kierunku.'],
 collisions: ['rock','Ruch → kontakt → zatrzymanie','Dwa collidery tworzą przeszkodę dla kontrolera ruchu.','movement.move(1, 0, 120);','Ściana zatrzymuje postać. Włącz Collidery, aby zobaczyć krawędź kontaktu.'],
 triggers: ['coin','Wejście → nagroda → usunięcie','Trigger wykrywa kontakt, ale nie blokuje przejścia.','wallet.gold += 1;','Moneta znika, złoto rośnie tylko raz. Wartość Wallet sprawdzisz w wynikach testów.'],
 camera: ['player','Świat → kamera → ekran','Kamera przesuwa widok, a pozycja świata gracza pozostaje niezależna.','camera.follow(player);','Gracz zostaje przy środku ekranu, podłoże się przesuwa. Ekran + początek widoku = świat.'],
 'canvas-ui': ['ui-panel-blue','Pozycja ekranu → rysowanie → HUD','HUD korzysta ze współrzędnych ekranu.','canvas.drawText("HP", 20, 20);','Napis i pasek nie uciekają po przesunięciu kamery. Figury mają jawne wymiary.'],
 health: ['heart','Trafienie → Health → ochrona','Zdrowie i nietykalność należą do konkretnej jednostki.','health.damage(1);','Przyjęty cios odejmuje HP. Kolejny cios w czasie ochrony jest odrzucony; liczby pokazują testy.'],
 'enemy-ai': ['slime','Cel → kierunek → pościg','Kierunek to pozycja celu minus pozycja przeciwnika.','double dx = target.transform.x - transform.x;','Znormalizowany kierunek pozwala Slime gonić gracza ze stałą prędkością.'],
 projectiles: ['fireball','Pocisk → kontakt → obrażenia','Pocisk ma właściciela, kierunek i ograniczony czas życia.','health.damage(damage);','Trafienie zużywa pocisk raz. Właściciel i sojusznicy nie są celami.'],
 weapons: ['bow','Cel → cooldown → strzał','Broń czeka na cel i koniec swojego cooldownu.','timer = Math.max(0, timer - delta);','Automatyczny atak nie potrzebuje klawisza. Po strzale zaczyna się nowy odstęp.'],
 'loot-xp': ['gem','Śmierć → orb XP → poziom','Nagroda powstaje raz, a zebranie dodaje doświadczenie.','experience.add(value);','Orb znika. Po przekroczeniu progu rośnie poziom; nadwyżka XP pozostaje.'],
 waves: ['slime','Harmonogram → fabryka → fala','Spawn odmierzamy czasem symulacji.','elapsed += delta;','Nowi przeciwnicy pojawiają się zgodnie z harmonogramem, z limitem żywych jednostek.'],
 pause: ['ui-button-blue','Pauza → WORLD stoi → UI działa','Świat i interfejs mają oddzielne tryby aktualizacji.','game.pause();','Ruch, pociski i spawn stoją. UI może przyjąć wybór i wznowić grę.'],
 upgrades: ['spell-book','Awans → wybór → zmiana parametru','Jeden wybór zużywa jedną oczekującą nagrodę.','speed += 30;','Przykład: 120 → 150 px/s. Zamknięcie menu wznawia świat.'],
 'ui-flow': ['ui-button-red','Focus → przycisk → akcja','UI ma jeden aktywny wybór i reakcję na zwolnienie przycisku.','button.onClick = action;','Mysz i klawiatura uruchamiają akcję raz; paski pokazują aktualny postęp.'],
 feedback: ['impact','Trafienie → efekt → powrót','Efekt wizualny nie zmienia fizycznej pozycji collidera.','camera.shake(2, 0.3);','Shake trwa 0.3 s, po czym wraca do spokoju. Tween animuje wskazaną właściwość.'],
 composition: ['skeleton','Dane → fabryka → komponenty','Jedna fabryka składa różne jednostki z konfiguracji.','enemyFactory.create(spec, x, y);','HP, prędkość i wygląd mogą się różnić bez kopiowania całego kodu przeciwnika.'],
 performance: ['lightning-bolt','Pomiar → limit → sprzątanie','Mierz liczbę obiektów i koszt wykrywania kontaktów.','game.physics.queryRadius(x, y, range, 2);','Zapytanie przestrzenne ogranicza kandydatów. Testy sprawdzają limity i zachowanie XP.'],
 'run-state': ['knight','READY → RUNNING → LOST / WON','Stan rundy jest oddzielony od stanu zdrowia jednostki.','run.start();','Start tworzy świeżą rundę; restart sprząta poprzednią. Kliknij Start lub Enter.'],
 portability: ['chest','Projekt → eksport → odtworzenie','Eksport zawiera pliki i wersję API.','engineApiVersion: "2.0.0"','Odtworzony projekt powinien zachować zachowanie. Java i JS mają wspólny kontrakt, inne pliki.'],
 survivor: ['vampire','Ruch → walka → XP → rozwój','Końcowa gra łączy wcześniejsze komponenty.','runController.start();','Uzupełnij start rundy lub pokaż rozwiązanie. Start / Enter uruchamia grę; Slime pojawia się po 1.5 s.'],
};
function PixelIcon({ asset }) {
 const item=assetManifest.assets.find(value=>value.key===asset);
 if(!item)return null;
 return <span className="lesson-pixel-icon" aria-hidden="true" style={{backgroundImage:`url(${import.meta.env.BASE_URL}game-assets/${item.source})`,backgroundPosition:`-${item.frame.x}px -${item.frame.y}px`}} />;
}
// Illustrative values explain the rule; they are not live game state or task answers.
export const stateComparisons = {
 components: ['Oddzielne instancje', 'Counter A: 1 · Counter B: 0', 'Counter A: 2 · Counter B: 0', 'Zmiana A nie zmienia licznika B.'],
 time: ['Przesunięcie w czasie', 'x = 100 px', 'x = 160 px', '120 px/s × 0.5 s = 60 px przesunięcia.'],
 collisions: ['Kontakt ze ścianą', 'Gracz przed przeszkodą', 'Gracz zatrzymany przy ścianie', 'Kontroler sprawdza collider, zamiast przesuwać postać przez przeszkodę.'],
 triggers: ['Zebranie monety', 'Moneta obecna · złoto: 0', 'Moneta usunięta · złoto: 1', 'Jedna moneta daje jedną nagrodę; przejście nie jest blokowane.'],
 camera: ['Świat a ekran', 'Widok (0,0): ekran (80,180)', 'Widok (60,150): ekran (20,30)', 'Pozycja świata cały czas wynosi (80,180). Ekran = świat − początek widoku.'],
 health: ['Przyjęte obrażenia', 'HP: 5 / 5', 'HP: 4 / 5', 'damage(1) odejmuje 1 HP. Następny cios podczas ochrony pozostawia 4 HP.'],
 weapons: ['Odstęp między strzałami', 'timer: 0 s → strzał', 'timer: 0.5 s → oczekiwanie', 'Po strzale ustaw cooldown. Następny strzał dopiero po jego upływie i przy dostępnym celu.'],
 'loot-xp': ['Awans z nadwyżką XP', 'Poziom 1 · XP: 4 + nagroda 2', 'Poziom 2 · XP: 1', 'Próg poziomu 1 wynosi 5 XP. Z 6 XP odejmujemy 5; pozostaje 1 XP.'],
 pause: ['Świat zatrzymany, UI aktywne', 'Pauza: WORLD 1 s · UI 1 s', 'Po sekundzie: WORLD 1 s · UI 2 s', 'Czas świata nie rośnie podczas pauzy. Interfejs nadal może obsługiwać wybór.'],
 upgrades: ['Zmiana parametru', 'Prędkość: 120 px/s', 'Prędkość: 150 px/s', 'Jedno zatwierdzenie daje +30 px/s i zużywa jeden oczekujący wybór.'],
 'run-state': ['Start rundy', 'READY · oczekiwanie', 'RUNNING · rozgrywka', 'Start tworzy nową rundę. Restart sprząta poprzednią i tworzy świeżą postać.'],
};
export default function LessonInfographic({ lesson, language='java' }) {
 const [expanded,setExpanded]=useState(false);
 const key=lesson.id?.replace(/^g2d\./,'');
 const diagram=lessonDiagrams[key];
 const reference=language==='java'?({'fundamentals-01':'classes','fundamentals-02':'variables','fundamentals-03':'conditions','fundamentals-04':'methods'})[lesson.id]:null;
 const theory=lesson.theory?.[0];
 const title=diagram?.[1]||theory?.title||lesson.title;
 const input=diagram?.[2]||theory?.text||lesson.objective;
 const code=(diagram?.[3]||theory?.code||'Kod → działanie → wynik').replace(/^double /,language==='java'?'double ':'const ').replace(' - transform.x',language==='java'?' - transform.x':' - this.transform.x');
 const output=diagram?.[4]||lesson.tips?.[0]||lesson.objective;
 return <figure className="lesson-infographic">
  <figcaption><span className="lesson-infographic-number">{lesson.order}</span><div><strong>{title}</strong><small>KOD → DZIAŁANIE → EFEKT · {language==='java'?'JAVA LAB':'WEB LAB'}</small></div></figcaption>
  {reference?<><button type="button" className="lesson-reference-button" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded} title={expanded?'Zmniejsz ilustrację':'Powiększ ilustrację'}><img src={`${import.meta.env.BASE_URL}lesson-illustrations/${reference}.png`} alt={`Infografika: ${title}`} loading="lazy" className={expanded?'is-expanded':''}/></button>{reference==='conditions'&&<p className="lesson-diagram-note">Strzałka oznacza kierunek ruchu. Przesunięcie liczymy jako kierunek × prędkość × delta, np. 1 × 120 × 0.5 = 60 px.</p>}</>:null}
  <div className="lesson-infographic-flow">
   <article><span className="lesson-step-number">1</span><h3>Reguła</h3><p>{input}</p></article>
   <span className="lesson-flow-arrow" aria-hidden="true">→</span>
   <article><span className="lesson-step-number">2</span><h3>Kod / API</h3><pre><code>{code}</code></pre><small>Fragment ilustruje zasadę; nazwy zmiennych dopasuj do swojego komponentu.</small></article>
   <span className="lesson-flow-arrow" aria-hidden="true">→</span>
   <article><span className="lesson-step-number">3</span><h3>Co obserwować</h3><PixelIcon asset={diagram?.[0]||'knight'}/><p>{output}</p></article>
  </div>
  {key==='scene'&&<div className="lesson-position-example" role="group" aria-label="Gracz na mapie w pozycji 100, 150">
   <div className="lesson-coordinate-map" role="img" aria-label="Mapa świata od 0 do 200. Czerwona oś X rośnie w prawo, niebieska oś Y w dół. Gracz: X 100, Y 150.">
    <span className="lesson-map-axis-line lesson-map-axis-line--x" /><span className="lesson-map-axis-line lesson-map-axis-line--y" />
    <span className="lesson-map-origin">0 | 0</span><span className="lesson-map-axis-x">X → 200</span><span className="lesson-map-axis-y">Y ↓ 200</span>
    <span className="lesson-map-tick-x">X: 100</span><span className="lesson-map-tick-y">Y: 150</span>
    <span className="lesson-map-guide lesson-map-guide--x" /><span className="lesson-map-guide lesson-map-guide--y" />
    <span className="lesson-map-player"><PixelIcon asset="player" /></span><span className="lesson-map-coordinate"><b className="lesson-x-value">100</b> | <b className="lesson-y-value">150</b></span>
   </div>
   <div><h3>Pozycja obiektu na mapie</h3><code><span className="lesson-x-axis-text">transform.x = 100 → w prawo</span><br/><span className="lesson-y-axis-text">transform.y = 150 ↓ w dół</span></code><p>W tym silniku 2D X rośnie w prawo, a Y w dół. Od początku mapy (0,0) odliczamy 100 jednostek w prawo i 150 w dół.</p><p>Grafika i collider są umieszczane względem pozycji obiektu. Sprite domyślnie rysuje się wokół niej.</p><details className="lesson-axis-question"><summary>Sprawdź: dokąd ruszy gracz, gdy zwiększysz tylko X? A tylko Y?</summary><p>Większe X: w prawo. Większe Y: w dół. Mniejsze X: w lewo. Mniejsze Y: w górę.</p></details><small>Przykładowa mapa pokazuje zakres 0–200; to ilustracja współrzędnych, nie rozmiar całej gry.</small></div>
  </div>}
  {stateComparisons[key]&&<div className="lesson-state-comparison" role="group" aria-label={stateComparisons[key][0]}>
   <h3>{stateComparisons[key][0]} <small>Przykład zasady</small></h3>
   <div><span>PRZED</span><strong>{stateComparisons[key][1]}</strong>{key==='health'&&<progress value="5" max="5" aria-label="Zdrowie przed trafieniem" />}</div>
   <span className="lesson-state-arrow" aria-hidden="true">→</span>
   <div><span>PO</span><strong>{stateComparisons[key][2]}</strong>{key==='health'&&<progress value="4" max="5" aria-label="Zdrowie po trafieniu" />}</div>
   <p>{stateComparisons[key][3]}</p>
  </div>}
  {key==='graphics'&&<div className="lesson-flip-comparison" role="group" aria-label="Porównanie odbicia sprite’a">
   <div><code>flipX = false</code><span className="lesson-flip-sprite" role="img" aria-label="Łucznik bez odbicia, łuk po lewej"><PixelIcon asset="ranger" /></span><strong>← Kierunek oryginalny</strong></div>
   <div><code>flipX = true</code><span className="lesson-flip-sprite lesson-flip-sprite--mirrored" role="img" aria-label="Łucznik odbity poziomo, łuk po prawej"><PixelIcon asset="ranger" /></span><strong>Przeciwny kierunek →</strong></div>
   <p>Ta sama tekstura i pozycja. Zmienia się tylko odbicie grafiki; collider pozostaje taki sam.</p>
  </div>}
 </figure>;
}
