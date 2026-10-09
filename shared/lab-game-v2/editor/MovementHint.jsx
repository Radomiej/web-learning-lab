import {useId,useState} from 'react';
export default function MovementHint({taskId,language}) {
  const [open,setOpen]=useState(false),id=useId();
  if(!['g2d.input.modified','g2d.time.independent','g2d.ai.guided'].includes(taskId))return null;
  const code=language==='java'?'Vector2 direction = new Vector2(dx, dy).normalized();':'const direction = new GameLab.Vector2(dx, dy).normalized();';
  return <div className="movement-hint">
    <button type="button" className="button button--ghost" aria-expanded={open} aria-controls={id}
      title={open?'Zwiń podpowiedź':'Rozwiń podpowiedź'} onClick={()=>setOpen(!open)} onKeyDown={event=>{if(event.key==='Escape')setOpen(false);}}><span aria-hidden="true">{open?'▾':'▸'}</span> Jak obliczyć ruch po przekątnej?</button>
    {open && <div id={id} role="tooltip" className="movement-hint-content">
      <p>Prędkość oznacza łączny dystans w sekundę. Kierunek (1, 1) ma długość √(1² + 1²) = √2 ≈ 1,414. Bez poprawki ruch po przekątnej byłby około 41% szybszy.</p>
      <p>Normalizacja dzieli obie składowe przez długość: (1/√2, 1/√2) ≈ (0,707, 0,707). Sprint 200 px/s daje około 141,4 px/s na każdej osi i 200 px/s łącznie.</p>
      <p>Nie musisz liczyć tego ręcznie — użyj gotowej metody:</p><pre><code>{code}</code></pre>
      <p>Przesunięcie to direction × speed × deltaTime. Dla kierunku (0, 0) normalized() zwraca (0, 0). CharacterController2D.move(dx, dy) normalizuje kierunek automatycznie — ustaw speed = 200 dla sprintu i przekaż osie ruchu.</p>
    </div>}
  </div>;
}
