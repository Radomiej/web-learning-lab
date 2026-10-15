import {guidedChanges} from './guidedChanges.js';
import './GuidedChange.css';
export default function GuidedChange({starter,solution,explanation}) {
 if(!explanation)return null;
 const changes=guidedChanges(starter,solution);
 return <section className="guided-change" aria-label="Wyjaśnienie zmiany">
  <h3>Co zmieniło się i dlaczego?</h3><p>{explanation}</p>
  <p className="guided-change-key"><span aria-hidden="true">● </span>Złoty kolor wskazuje dodany lub zmieniony kod — także w edytorze.</p>
  {changes.map(change=><div key={change.file}><strong>{change.file}</strong><pre tabIndex="0"><code>{change.start>60?'…':''}{change.code.slice(Math.max(0,change.start-60),change.start)}<mark>{change.text}</mark>{change.code.slice(change.end,change.end+60)}{change.end+60<change.code.length?'…':''}</code></pre></div>)}
 </section>;
}
