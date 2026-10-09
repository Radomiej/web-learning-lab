import { useId } from 'react';
import { assetManifest } from '../assets/Assets.js';
import './PageDiagram.css';

function Sprite({ asset = 'player', x, y, size = 48, flip = false, opacity = 1 }) {
  const item = assetManifest.assets.find(value => value.key === asset);
  if (!item) return null;
  return <g opacity={opacity} transform={flip ? `translate(${2*x+size} 0) scale(-1 1)` : undefined}>
    <svg x={x} y={y} width={size} height={size} viewBox={`${item.frame.x} ${item.frame.y} ${item.frame.w} ${item.frame.h}`}>
      <image href={`${import.meta.env.BASE_URL}game-assets/${item.source}`} width="640" height="640" style={{ imageRendering: 'pixelated' }} />
    </svg>
  </g>;
}
function Label({ x, y, children, color, anchor = 'middle' }) { return <text x={x} y={y} textAnchor={anchor} fill={color || '#24483e'} fontSize="20" fontWeight="600">{children}</text>; }
function Bar({ x, y, value, label, color = '#dc5b64', width = 155 }) {
  return <g><rect x={x} y={y} width={width} height="28" rx="8" fill="#e1e9e5"/><rect x={x} y={y} width={width*value} height="28" rx="8" fill={color}/><Label x={x+width/2} y={y-12}>{label}</Label></g>;
}
export default function PageDiagram({ page }) {
  const marker = useId().replaceAll(':', '');
  const { kind, variant = 0, nodes = [], note } = page.visual;
  const arrow = (x1,y1,x2,y2,color='#328779') => <path d={`M${x1} ${y1} L${x2} ${y2}`} fill="none" stroke={color} strokeWidth="3" markerEnd={`url(#${marker})`}/>;
  if (kind === 'flow') return <figure className="page-diagram" data-visual={kind}>
    <figcaption>{page.title}</figcaption><ol className="page-diagram-flow">{nodes.map((node, i) => <li key={`${i}:${node}`}><span>{i+1}</span><strong>{node}</strong>{i<nodes.length-1&&<b aria-hidden="true">↓</b>}</li>)}</ol>
    {note&&<p>{note}</p>}<small>Przykład zasady • diagram relacji</small>
  </figure>;
  let content;
  switch (kind) {
    case 'box-model': content = <>
      <rect x="35" y="40" width="370" height="230" fill="#f0e4cf"/><Label x={220} y={65}>margin • na zewnątrz</Label>
      <rect x="70" y="85" width="300" height="150" fill="#7e98af"/><Label x={220} y={110} color="#fff">border • 2 px</Label>
      <rect x="85" y="120" width="270" height="100" fill="#c4dcc5"/><Label x={220} y={143}>padding • 10 px</Label>
      <rect x="115" y="155" width="210" height="50" fill="#fff"/><Label x={220} y={187}>content: {variant===0?'100':'76'} px</Label>
      <Label x={220} y={305}>{variant===0?'całość: 100 + 20 + 4 = 124 px':'border-box: całość 100 px'}</Label>
    </>; break;
    case 'layout': content = <>
      <rect x="30" y="55" width="380" height="210" rx="12" fill="#f3f8f4" stroke="#9bbbad"/>
      {(variant===0?[[50,85,95,65],[172,85,95,65],[294,85,95,65]]:[[50,85,150,65],[230,85,150,65],[50,170,150,65],[230,170,150,65]]).map(([x,y,w,h],i)=><g key={i}><rect x={x} y={y} width={w} height={h} rx="8" fill="#cee4f6" stroke="#397fce"/><Label x={x+w/2} y={y+40}>{i+1}</Label></g>)}
      <Label x={220} y={35}>{variant===0?'Oś główna / kolumny →':'Wiersze i zawijanie ↓'}</Label>
      <Label x={220} y={305}>{variant===0?'element • odstęp • element':'mała przestrzeń: kolejny wiersz'}</Label>
    </>; break;
    case 'position': content = <>
      <path d="M50 35V245H400M50 85H400M50 135H400M50 185H400M100 35V245M150 35V245M200 35V245M250 35V245M300 35V245M350 35V245" stroke="#dcebe2" fill="none"/>
      {arrow(50,35,400,35,'#d85158')}{arrow(50,35,50,255,'#397fce')}
      <Label x={38} y={25}>0</Label><Label x={350} y={25} color="#d85158">X → 200</Label><Label x={110} y={275} color="#397fce">Y ↓ 200</Label>
      <path d="M225 35V200H50" stroke="#638f82" strokeDasharray="5 5" fill="none"/>
      <Sprite x={197} y={172} size={56}/><circle cx="225" cy="200" r="4" fill="#143d35"/>
      {variant===1&&<><rect x="185" y="160" width="80" height="80" rx="4" fill="none" stroke="#9461be" strokeWidth="2"/><circle cx="225" cy="200" r="24" stroke="#ed9441" fill="none" strokeWidth="3"/><Label x={330} y={140} color="#9461be">Sprite</Label><Label x={333} y={170} color="#c27a28">Collider</Label></>}
      <Label x={225} y={252}>100 | 150</Label><Label x={225} y={65} color="#d85158">X: 100</Label><Label x={112} y={190} color="#397fce">Y: 150</Label>
    </>; break;
    case 'flip': content = <>
      <Label x={112} y={45}>flipX = false</Label><Label x={325} y={45}>flipX = true</Label>
      <Sprite asset="ranger" x={48} y={75} size={128}/><Sprite asset="ranger" x={261} y={75} size={128} flip/>
      {variant===1&&<><circle cx="112" cy="139" r="42" stroke="#ed9441" fill="none" strokeWidth="3"/><circle cx="325" cy="139" r="42" stroke="#ed9441" fill="none" strokeWidth="3"/></>}
      <Label x={112} y={235}>← łuk po lewej</Label><Label x={325} y={235}>łuk po prawej →</Label>
      <Label x={220} y={280}>{variant===1?'Collider bez zmian':'Ta sama tekstura • odbicie X'}</Label>
    </>; break;
    case 'motion': content = variant===1 ? <>
      {arrow(60,50,280,50,'#d85158')}{arrow(60,50,215,205,'#397fce')}
      <path d="M60 50L280 270M280 50V270" fill="none" stroke="#c3a5a7" strokeWidth="2" strokeDasharray="5 5"/>
      <Label x={265} y={245}>(1,1): √2</Label><Label x={220} y={310}>(0.707,0.707): długość 1</Label>
      <Label x={240} y={150} color="#397fce">po normalizacji</Label><Label x={220} y={30} color="#d85158">(1,0): długość 1</Label>
    </> : <>
      <Sprite asset={variant===3?'slime':'player'} x={65} y={95}/><Sprite x={320} y={95}/>
      {variant!==2&&arrow(125,120,307,120)}<Label x={90} y={175}>x = 100</Label><Label x={345} y={175}>{variant===2?'x = 100':'x = 160'}</Label>
      <Label x={220} y={60}>{variant===2?'kierunek (0,0)':variant===3?'cel − przeciwnik = (60,0)':'120 px/s × 0.5 s'}</Label>
      <Label x={220} y={235}>{variant===2?'Nie dziel przez zero':variant===3?'Normalizacja → (1,0)':'Przesunięcie: 60 px →'}</Label>
    </>; break;
    case 'camera': content = <>
      {[35,240].map((x,i)=><g key={x}><rect x={x} y="70" width="170" height="165" rx="12" fill="#edf7ed" stroke="#57967b" strokeWidth="2"/>
        <path d={`M${x} 120h170M${x} 170h170M${x+55} 70v165M${x+110} 70v165`} stroke="#cbdccc"/>
        <rect x={x+8} y="78" width="80" height="24" rx="5" fill="#fff"/><Label x={x+48} y={97}>HP 5/5</Label>
        <Sprite x={x+(i===0?60:10)} y={i===0?180:110} size={40}/>
        <Label x={x+85} y={45}>{i===0?'Widok (0,0)':'Widok (60,150)'}</Label>
        <Label x={x+85} y={265}>{i===0?'ekran (80,180)':'ekran (20,30)'}</Label></g>)}
      <Label x={220} y={300}>{variant===2?'ekran + widok = świat':variant===1?'HUD: to samo miejsce ekranu':'Świat: zawsze (80,180)'}</Label>
    </>; break;
    case 'contact': content = <>
      <rect x="298" y="55" width="28" height="195" fill="#8a9296"/><Label x={355} y={45}>ściana</Label>
      <Sprite x={variant===0?85:240} y={115} size={56}/><circle cx={variant===0?113:268} cy="143" r="28" fill="none" stroke="#ed9441" strokeWidth="3"/>
      {variant===0&&<rect x="79" y="109" width="68" height="68" fill="none" stroke="#9461be" strokeWidth="2"/>}
      {variant===1&&<><Sprite x={75} y={115} size={56} opacity={0.3}/>{arrow(140,143,230,143)}</>}
      {variant===2&&<>{arrow(268,110,268,65)}<path d="M290 142h35" stroke="#d85158" strokeWidth="4"/><Label x={155} y={215}>X zablokowany</Label></>}
      <Label x={220} y={280}>{['Sprite ≠ collider','Collider zatrzymany przy ścianie','Y: ruch wzdłuż ściany'][variant]}</Label>
    </>; break;
    case 'bars': content = <>
      <Label x={110} y={70}>PRZED</Label><Label x={330} y={70}>PO</Label>
      <Bar x={30} y={145} value={[1,1,0.8,0.8][variant]} label={['0%','HP: 5 / 5','XP: 4 / 5','120 px/s'][variant]} color={variant===1?'#dc5b64':'#328779'}/>
      <Bar x={250} y={145} value={[0.5,0.8,0.2,1][variant]} label={['50%','HP: 4 / 5','poziom 2: XP 1','150 px/s'][variant]} color={variant===1?'#dc5b64':'#328779'}/>
      {arrow(198,160,230,160)}<Label x={220} y={240}>{['setProgress(50)','damage(1)','4 + 2 − 5 = 1 XP','120 + 30 = 150 px/s'][variant]}</Label>
    </>; break;
    case 'timeline': {
      const sequences = [ ['cios: 5 → 4 HP','ochrona: 4 HP','ochrona wygasa'], ['pocisk żyje','lot / brak celu','TTL: usunięcie'], ['strzał • 0 s','czekaj • 0.25 s','strzał • 0.5 s'], ['spawn • 0 s','spawn • 1 s','spawn • 2 s'], ['WORLD 1 s','WORLD 1 s','WORLD 1 s'], ['trafienie','shake • 0.15 s','spokój • 0.3 s'] ];
      content=<>{arrow(40,135,395,135)}{sequences[variant].map((label,i)=><g key={label+i}><circle cx={65+155*i} cy="135" r="10" fill="#328779"/><Label x={220} y={45+i*33}>{i+1}. {label}</Label><Label x={65+155*i} y={175}>{i+1}</Label></g>)}
        {variant===4&&<><Label x={220} y={220}>UI: 1 s → 2 s → 3 s</Label><Label x={220} y={270}>WORLD stoi • UI działa</Label></>}
      </>; break;
    }
    case 'instances': {
      const examples=[['A: counts = 1','A: counts = 2','B: counts = 0'],['utworzono: 5','żywe: 3','limit żywych: 4'],['Health A: 5 HP','Health B: 3 HP','osobny stan'],['3 pociski','1 kończy życie','2 aktywne']];
      content=<>{examples[variant].map((label,i)=><g key={label}><rect x="50" y={35+i*80} width="340" height="60" rx="12" fill={i===1?'#d4ebe1':'#eef3f0'} stroke="#69a08c"/><Label x={220} y={73+i*80}>{label}</Label></g>)}</>; break;
    }
    case 'pickup': content = <>
      {variant===2?<><Sprite asset="gem" x={45} y={110} size={64}/><Sprite asset="gem" x={110} y={110} size={64}/><Sprite asset="gem" x={300} y={110} size={64}/>{arrow(185,142,285,142)}</>:<><Sprite x={45} y={110} size={64}/><Sprite asset="coin" x={variant===1?285:210} y={110} size={64} opacity={variant===1?0.25:1}/>{arrow(125,142,195,142)}</>}
      <Label x={220} y={65}>{variant===2?'orby: 2 XP + 3 XP':'gracz → kontakt'}</Label><Label x={220} y={235}>{variant===2?'jeden orb: 5 XP':variant===1?'moneta znika • złoto 0 → 1':'trigger przepuszcza gracza'}</Label>
    </>; break;
    case 'projectile': content = <>
      <Sprite x={35} y={105} size={64}/><Sprite asset="fireball" x={180} y={112}/><Sprite asset="slime" x={330} y={105} size={64}/>
      {arrow(115,137,167,137)}{arrow(240,137,318,137)}<Label x={220} y={65}>{variant===1?'broń → pocisk → cel':'właściciel → lot → trafienie'}</Label><Label x={220} y={240}>{variant===1?'strzał ustawia nowy cooldown':'obrażenia raz • pocisk zużyty'}</Label>
    </>; break;
    case 'layers': content = <>
      <rect x="70" y="65" width="290" height="155" rx="10" fill="#dceac4" stroke="#75956c"/>
      <path d="M70 115h290M70 165h290M120 65v155M170 65v155M220 65v155M270 65v155M320 65v155" stroke="#b3ca95"/>
      <Sprite x={190} y={120} size={64}/><Label x={220} y={40}>Sprite • wyższa warstwa</Label><Label x={220} y={265}>TileMap • niższa warstwa</Label>
    </>; break;
    case 'rectangle': content = <>
      <rect x="100" y="80" width="240" height="120" fill="#cee4f6" stroke="#397fce" strokeWidth="3"/><circle cx="220" cy="140" r="5" fill="#d85158"/>
      {arrow(100,235,340,235)}{arrow(370,80,370,200)}<Label x={220} y={270}>szerokość: 240</Label><Label x={220} y={50}>wysokość: 120</Label><Label x={220} y={145}>• środek</Label>
    </>; break;
    case 'input': content = <>
      {['klatka 1','klatka 2','klatka 3'].map((label,i)=><g key={label}><rect x={35+140*i} y="80" width="100" height="75" rx="12" fill="#d4ebe1" stroke="#328779"/><Label x={85+140*i} y={60}>{label}</Label><Label x={85+140*i} y={125}>{variant===1?['↓','trzymaj','↑'][i]:['nowe','trzymaj','trzymaj'][i]}</Label></g>)}
      <Label x={220} y={215}>{variant===1?'akcja przy zwolnieniu ↑':'isDown: tak • tak • tak'}</Label><Label x={220} y={265}>{variant===1?'jedno kliknięcie → jedna akcja':'isPressed: tak • nie • nie'}</Label>
    </>; break;
    case 'focus': content = <>{['Opcja A','Opcja B','Opcja C'].map((label,i)=><g key={label}><rect x="90" y={30+i*80} width="260" height="60" rx="12" fill={i===1?'#cee4f6':'#eef3f0'} stroke={i===1?'#397fce':'#b9cec4'} strokeWidth={i===1?4:1}/><Label x={220} y={68+i*80}>{label}{i===1?' ← focus':''}</Label></g>)}</>; break;
    case 'ninepatch': content = <>
      <rect x="45" y="80" width="350" height="120" rx="16" fill="#cee4f6" stroke="#397fce" strokeWidth="3"/><path d="M85 80v120M355 80v120M45 110h350M45 170h350" stroke="#397fce" strokeDasharray="5 5"/>
      <Label x={220} y={145}>rozciągany środek</Label><Label x={220} y={45}>9patch: narożniki bez zmian</Label><Bar x={130} y={240} value={0.5} label="ProgressBar: 50%"/>
    </>; break;
    case 'fade': content = <>
      {[1,0.5,0].map((alpha,i)=><g key={alpha}><rect x={25+145*i} y="75" width="100" height="125" rx="12" fill="#edf3ef"/><Sprite x={42+145*i} y={100} size={64} opacity={alpha}/><Label x={75+145*i} y={235}>α = {alpha}</Label></g>)}<Label x={220} y={45}>początek → środek → koniec</Label>
    </>; break;
    case 'spatial': content = <>
      <path d="M45 50h350v200H45ZM45 100h350M45 150h350M45 200h350M95 50v200M145 50v200M195 50v200M245 50v200M295 50v200M345 50v200" fill="#f2f7f3" stroke="#abc6b8"/>
      <rect x="145" y="100" width="150" height="100" fill="#cee4f6" opacity="0.8"/>
      {[70,170,215,265,375].map((x,i)=><circle key={x} cx={x} cy={i%2?130:175} r="10" fill={x>140&&x<300?'#397fce':'#a6b7ad'}/>)}<Label x={220} y={285}>Sprawdź pobliskie komórki</Label>
    </>; break;
    case 'run': content = <>
      <Label x={220} y={45}>{variant===1?'Pętla rozwoju':'Stan rundy'}</Label>
      <rect x="30" y="80" width="150" height="55" rx="12" fill="#e7eee9"/><Label x={105} y={115}>{variant===1?'WALKA':'READY'}</Label>
      <rect x="250" y="80" width="160" height="55" rx="12" fill="#d4ebe1"/><Label x={330} y={115}>{variant===1?'AWANS':'RUNNING'}</Label>{arrow(185,105,240,105)}
      <rect x="250" y="215" width="160" height="55" rx="12" fill="#f4dfce"/><Label x={330} y={250}>{variant===1?'WYBÓR':'LOST / WON'}</Label>{arrow(330,145,330,205)}
      {variant===1?arrow(245,245,105,145):<Label x={105} y={250}>restart ↑</Label>}
    </>; break;
    default: content = <Label x={220} y={150}>{page.title}</Label>;
  }
  return <figure className="page-diagram" data-visual={`${kind}:${variant}`}><figcaption>{page.title}</figcaption>
    <svg viewBox="0 0 440 320" role="img" aria-label={`${page.title}. ${note || page.text}`}>
      <defs><marker id={marker} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="context-stroke"/></marker></defs>{content}
    </svg>{note&&<p>{note}</p>}<small>Wartości przykładowe • ilustracja zasady</small>
  </figure>;
}
