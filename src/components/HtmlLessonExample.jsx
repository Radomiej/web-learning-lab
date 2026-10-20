import {useEffect,useRef} from 'react';

// These examples come exclusively from the bundled teaching material, never student code.
// A shadow tree isolates their default HTML appearance from the lab UI without a runtime iframe.
export default function HtmlLessonExample({page}){
 const host=useRef(null);
 const title=page.code.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
 const viewport=/^<meta name="viewport"/.test(page.code);
 useEffect(()=>{
  if(viewport)return;
  const root=host.current.shadowRoot||host.current.attachShadow({mode:'open'});
  const document=new DOMParser().parseFromString(page.code,'text/html');
  document.querySelectorAll('script,iframe,object,embed,link,style').forEach(node=>node.remove());
  document.querySelectorAll('*').forEach(node=>{for(const attr of [...node.attributes])if(/^on/i.test(attr.name)||['src','srcset','action','formaction'].includes(attr.name))node.removeAttribute(attr.name);});
  const style=window.document.createElement('style');
  style.textContent=':host{display:block;padding:24px;color:#17222b;font:18px/1.5 Georgia,serif;background:white;min-height:150px}*{box-sizing:border-box}img,video,audio{max-width:100%}table{border-collapse:collapse}td,th{padding:5px 10px;border:1px solid #aaa}input,select,button,textarea{font:16px system-ui;max-width:100%;margin:5px}fieldset{max-width:100%}';
  root.replaceChildren(style,...[...document.body.childNodes].map(node=>window.document.importNode(node,true)));
  const prevent=event=>event.preventDefault();
  const stopLink=event=>{if(event.composedPath().some(node=>node.tagName==='A'))event.preventDefault();};
  root.addEventListener('submit',prevent);root.addEventListener('click',stopLink);
  return()=>{root.removeEventListener('submit',prevent);root.removeEventListener('click',stopLink);};
 },[page,viewport]);
 return <figure className="html-lesson-example" aria-label={`Wizualny przykład: ${page.title}`}>
  <div className="html-example-bar"><span aria-hidden="true">● ● ●</span><strong>{title||'Widok HTML'}</strong></div>
  {viewport?<div className="html-viewport-example"><div className="html-example-phone"><span>Szerokość urządzenia</span><p>Czytelny widok</p></div><p>width=device-width<br/><small>Układ dopasowujesz dalej w CSS.</small></p></div>:<div ref={host}/>}
  <figcaption>Przykład z kodu powyżej. Linki i wysyłka formularza pozostają w obrębie lekcji; zewnętrzne media nie są pobierane.</figcaption>
 </figure>;
}
