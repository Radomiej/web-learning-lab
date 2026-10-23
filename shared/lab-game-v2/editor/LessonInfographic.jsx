import CodeExample from './CodeExample.jsx';
import { assetManifest } from '../assets/Assets.js';
import './LessonInfographic.css';

function PixelIcon({ asset }) {
 const item=assetManifest.assets.find(value=>value.key===asset);
 if(!item)return null;
 return <span className="lesson-pixel-icon" aria-hidden="true" style={{backgroundImage:`url(${import.meta.env.BASE_URL}game-assets/${item.source})`,backgroundPosition:`-${item.frame.x}px -${item.frame.y}px`}} />;
}
// Illustrative values explain the rule; they are not live game state or task answers.
export default function LessonInfographic({ lesson, language='java' }) {
 const theory=lesson.theory?.[0];
 const title=theory?.title||lesson.title;
 const input=theory?.text||lesson.objective;
 const code=(theory?.code||'Kod → działanie → wynik').replace(/^double /,language==='java'?'double ':'const ').replace(' - transform.x',language==='java'?' - transform.x':' - this.transform.x');
 const output=lesson.tips?.[0]||lesson.objective;
 return <figure className="lesson-infographic">
  <figcaption><span className="lesson-infographic-number">{lesson.order}</span><div><strong>{title}</strong><small>KOD → DZIAŁANIE → EFEKT · {language==='java'?'JAVA LAB':'WEB LAB'}</small></div></figcaption>
  <div className="lesson-infographic-flow">
   <article><span className="lesson-step-number">1</span><h3>Reguła</h3><p>{input}</p></article>
   <span className="lesson-flow-arrow" aria-hidden="true">→</span>
   <article><span className="lesson-step-number">2</span><h3>Kod / API</h3><CodeExample key={code} code={code}/><small>Fragment ilustruje zasadę; nazwy zmiennych dopasuj do swojego komponentu.</small></article>
   <span className="lesson-flow-arrow" aria-hidden="true">→</span>
   <article><span className="lesson-step-number">3</span><h3>Co obserwować</h3><PixelIcon asset="knight"/><p>{output}</p></article>
  </div>
 </figure>;
}
