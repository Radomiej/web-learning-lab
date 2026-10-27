import {useId,useState} from 'react';
import {assetManifest} from '../assets/Assets.js';
import './GameIntroDiagram.css';
const green='#4b9483',orange='#d9973b';
const card=(label,detail)=>({label,detail});
function Cards({items}){return <div className="game-intro-cards">{items.map((item,index)=><div className="game-intro-card" key={item.label}><small>{index+1}</small><strong>{item.label}</strong><span>{item.detail}</span></div>)}</div>;}
function World({objects=[],label='Schemat świata',ghost,axes=true}){
 const marker=useId().replaceAll(':','');
 return <svg className="game-intro-world" viewBox="0 0 380 270" role="img" aria-label={label}>
  <defs><marker id={marker} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10" fill="#51666b"/></marker></defs>
  <rect x="1" y="1" width="378" height="268" rx="12" fill="#fbfaf4" stroke="#d8e3dc"/>
  <g transform="translate(38 30)">
   {[100,200,300].map(x=><line key={`x${x}`} x1={x} y1="0" x2={x} y2="200" stroke="#e2e8df"/>)}
   {[50,100,150,200].map(y=><line key={`y${y}`} x1="0" y1={y} x2="300" y2={y} stroke="#e2e8df"/>)}
   {axes&&<><path d="M0 210V0H313" fill="none" stroke="#51666b" markerEnd={`url(#${marker})`}/><path d="M0 0V212" stroke="#51666b" markerEnd={`url(#${marker})`}/><text x="-29" y="-10">(0,0)</text><text x="312" y="20" textAnchor="end">X →</text><text x="-28" y="232">Y ↓</text>{[100,200,300].map(x=><text key={x} x={x} y="-10" textAnchor="middle">{x}</text>)}{[50,100,150,200].map(y=><text key={y} x="-8" y={y+5} textAnchor="end">{y}</text>)}</>}
   {ghost&&<>{ghost.pointOnly?<circle cx={ghost.x} cy={ghost.y} r="5" fill="none" stroke="#a3b4ab"/>:<rect x={ghost.x-20} y={ghost.y-12} width="40" height="24" fill="none" stroke="#a3b4ab" strokeDasharray="4 3"/>}<line x1={ghost.x} y1={ghost.y-27} x2={objects[0].x} y2={objects[0].y-27} stroke={orange} strokeWidth="2" markerEnd={`url(#${marker})`}/></>}
   {objects.map((object,index)=><g key={index}>
    <path d={`M${object.x} 0V${object.y}H0`} fill="none" stroke={object.color||green} strokeDasharray="3 4"/>
    {object.visible!==false&&<g transform={`translate(${object.x} ${object.y}) rotate(${object.rotation||0}) scale(${object.scaleX||1} 1)`}><rect x="-20" y="-12" width="40" height="24" rx="2" fill={object.color||green}/></g>}
    <path d={`M${object.x-5} ${object.y}h10M${object.x} ${object.y-5}v10`} stroke="#163f48" strokeWidth="2"/>
    <text x={object.x} y={object.y+34} textAnchor="middle">{object.name?`${object.name} `:''}({object.x}, {object.y})</text>
   </g>)}
  </g>
 </svg>;
}
function Pair({before,after,beforeLabel='Przed',afterLabel='Po'}){return <div className="game-intro-pair"><div><strong>{beforeLabel}</strong>{before}</div><div><strong>{afterLabel}</strong>{after}</div></div>;}
function Owner({behavior=false}){return <div className="game-intro-owner"><strong>GameObject „Player”</strong><div className="game-intro-transform">Transform: x=100, y=150<small>Własne pole każdego obiektu</small></div><div className="game-intro-attachment"><strong>ShapeRenderer</strong><span>wygląd: 40×24, zielony</span></div>{behavior&&<div className="game-intro-attachment is-behavior"><strong>MoveRight</strong><span>zachowanie: zmień x</span></div>}</div>;}
export default function GameIntroDiagram({kind,title}){
 const [changed,setChanged]=useState(false);
 const at=(x=100,y=150,color=green)=>({x,y,color});
 const sprite=assetManifest.assets.find(asset=>asset.key==='player');
 let content,caption;
 switch(kind){
  case 'loop':content=<><Cards items={[card('Odczytaj wejście','Gracz przytrzymuje D'),card('Zmień stan','Pozycja: (100,150) → (120,150)'),card('Narysuj klatkę','Postać pojawia się w nowym miejscu')]}/><World objects={[at(120)]} ghost={at()} label="Przykład gry: poprzednia pozycja (100,150), nowy obraz w (120,150)"/></>;caption='Przerywany kształt pokazuje poprzednie położenie. Cykl powtarza się podczas gry; etykiety nie są nazwami metod API.';break;
  case 'game':content=<div className="game-intro-owner"><strong>GameMain extends Game</strong><p>Scena — kolekcja obiektów tego Game</p><div className="game-intro-empty">Jeszcze bez obiektów</div><span>onCreate() przygotowuje początek gry</span></div>;caption='Game jest gospodarzem obiektów i aktualizacji. Scena nie oznacza tutaj dodatkowej klasy.';break;
  case 'object':content=<Pair before={<div className="game-intro-owner"><strong>Player: GameObject</strong><span>Transform: (0,0)</span><span>Komponenty: brak</span></div>} after={<div className="game-intro-empty">Brak widocznego gracza</div>} beforeLabel="Dane sceny" afterLabel="Widok gry"/>;caption='Istnienie obiektu i wyświetlanie obiektu to dwie różne rzeczy.';break;
  case 'position':content=<World objects={[{...at(),visible:false}]} label="Osie świata: X w prawo, Y w dół; punkt Player w (100,150)"/>;caption='Krzyżyk i siatka są pomocą na schemacie. GameObject bez renderera nie rysuje takiego znacznika w grze.';break;
  case 'position-change':content=<><World objects={[{...at(changed?220:100),visible:false}]} ghost={changed?{...at(),pointOnly:true}:null} label={`Ten sam obiekt w (${changed?220:100},150)`}/><button type="button" onClick={()=>setChanged(value=>!value)}>{changed?'Pokaż przed zmianą':'Zmień tylko X: 100 → 220'}</button></>;caption='Y=150 w obu stanach. Krzyżyk jest znacznikiem na schemacie; Transform sam nie rysuje go w grze.';break;
  case 'renderer':content=<Pair before={<World objects={[{...at(),visible:false}]} label="Przed: punkt obiektu bez grafiki"/>} after={<World objects={[at()]} label="Po: prostokąt 40 na 24, środek w (100,150)"/>} beforeLabel="Bez renderera" afterLabel="Z ShapeRenderer"/>;caption='Pozycja jest ta sama. Pojawia się prostokąt 40×24. Krzyżyk i linie pomocnicze nie są częścią grafiki obiektu.';break;
  case 'renderer-types':content=<div className="game-intro-cards"><div className="game-intro-card"><strong>ShapeRenderer</strong><svg viewBox="0 0 120 70" role="img" aria-label="Prostokąt"><rect x="40" y="23" width="40" height="24" fill={green}/></svg><span>Kształt</span></div><div className="game-intro-card"><strong>Sprite</strong>{sprite&&<svg viewBox={`${sprite.frame.x} ${sprite.frame.y} ${sprite.frame.w} ${sprite.frame.h}`} role="img" aria-label="Grafika gracza"><image href={`${import.meta.env.BASE_URL}game-assets/${sprite.source}`} width="640" height="640"/></svg>}<span>Grafika z zasobów</span></div><div className="game-intro-card"><strong>TextRenderer</strong><div className="game-intro-text">Start</div><span>Tekst</span></div></div>;caption='Porównujemy role rendererów. Te przykłady nie dodają ruchu ani fizyki.';break;
  case 'scale':content=<Pair before={<World objects={[at()]} label="Skala (1,1): rysunek 40 na 24"/>} after={<World objects={[{...at(),scaleX:2}]} label="Skala (2,1): rysunek 80 na 24"/>} beforeLabel="scale = (1,1)" afterLabel="scale = (2,1)"/>;caption='Dwukrotnie większa szerokość, ta sama wysokość i środek. Liczby width i height renderera nie zostały nadpisane.';break;
  case 'rotation':content=<Pair before={<World objects={[at()]} label="Obrót zero: prostokąt poziomy"/>} after={<World objects={[{...at(),rotation:90}]} label="Obrót 90 stopni wokół punktu (100,150)"/>} beforeLabel="rotation = 0" afterLabel="rotation = π/2 (90°)"/>;caption='Zmienia się ustawienie grafiki. Pozycja obiektu pozostaje taka sama.';break;
  case 'component':content=<><Owner/><Pair before={<World objects={[at()]} label="Zielony prostokąt w (100,150)"/>} after={<World objects={[at(100,150,orange)]} label="Pomarańczowy prostokąt w tym samym miejscu"/>} beforeLabel="skin.color: zielony" afterLabel="skin.color: pomarańczowy"/></>;caption='Zmieniamy dane komponentu wyglądu. Nie zmieniamy Transform.';break;
  case 'instances':content=<><World objects={[{...at(140),name:'First'},{...at(220,100,orange),name:'Second'}]} ghost={at()} label="First przesunięty z (100,150) do (140,150); Second pozostaje (220,100)"/><Cards items={[card('First','własny Transform + własny ShapeRenderer'),card('Second','inny Transform + inny ShapeRenderer')]}/></>;caption='Przerywany prostokąt to poprzednia pozycja First. Second pozostaje bez zmian.';break;
  case 'behavior':content=<Cards items={[card('Klasa MoveRight','Opisuje zachowanie; sama klasa nie jest obiektem sceny'),card('onUpdate(delta)','Silnik wywołuje tę metodę w kolejnych klatkach'),card('gameObject','Właściciel podłączonego komponentu')]}/>;caption='Dopiero nowa instancja podłączona przez addComponent zaczyna aktualizować właściciela.';break;
  case 'attach':content=<><Owner behavior/><World objects={[at(120)]} ghost={at()} label="MoveRight przesuwa Player o 20 pikseli w jedną sekundę"/></>;caption='MoveRight aktualizuje Transform. ShapeRenderer odczytuje nową pozycję podczas rysowania.';break;
  case 'delta':content=<><div className="game-intro-equation"><span>20 px/s</span><b>×</b><span>0.05 s</span><b>=</b><strong>1 px</strong></div><World objects={[at(101)]} label="Po 0.05 sekundy Player ma x=101, y=150"/></>;caption='0.05 sekundy ruchu: x=100 → 101. Krzyżyk pokazuje pozycję, Y pozostaje 150.';break;
  case 'input':content=<Cards items={[card('D przytrzymane','isKeyDown("d") → true'),card('Warunek if','wykonuje zmianę x w tej klatce'),card('D zwolnione','false → pomija zmianę x')]}/>;caption='Odczyt klawisza nie przesuwa obiektu. Dopiero kod wewnątrz if zmienia pozycję.';break;
  case 'controller':content=<Cards items={[card('PlayerController','NASZA klasa: odczytaj D → wybierz (1,0)'),card('CharacterController2D','SILNIK: move(1,0,120) steruje ruchem obiektu z colliderem'),card('ShapeRenderer','Rysuj w nowej pozycji Transform')]}/>;caption='Na Player jest też CircleCollider2D(12): obszar dla systemu ruchu. Kierunek (1,0) nie oznacza nowej pozycji (1,0).';break;
  default:return null;
 }
 return <figure className="game-intro-visual" aria-label={`Schemat: ${title}`}>{content}<figcaption>{caption}</figcaption></figure>;
}
