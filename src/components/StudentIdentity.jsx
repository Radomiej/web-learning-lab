import {useEffect,useId,useRef,useState} from 'react';
import './StudentIdentity.css';
const statuses={online:'Połączono',connecting:'Łączenie…',offline:'Brak połączenia — możesz pracować dalej',too_large:'Projekt za duży do synchronizacji'};
export function ConnectionStatus({telemetry,iconOnly=false}) {
 const label=telemetry?.status === 'disabled' ? 'Praca lokalna' : statuses[telemetry?.status] || 'Łączenie…';
 if(iconOnly)return <span className="connection-indicator" role="status" aria-label={label} title={label}><span className="student-identity-dot" data-online={telemetry?.status==='online'} aria-hidden="true"/></span>;
 return <p className="student-identity-status" role="status"><span className="student-identity-dot" data-online={telemetry?.status==='online'} aria-hidden="true"/>{label}</p>;
}
export default function StudentIdentity({telemetry,compact=false}){
 const [editing,setEditing]=useState(false),[draft,setDraft]=useState('');
 const [studentId,setStudentId]=useState('');
 const inputId=useId(),inputRef=useRef(null),editRef=useRef(null),wasEditing=useRef(false);
 useEffect(()=>{
  if(editing){inputRef.current?.focus();inputRef.current?.select();}
  else if(wasEditing.current)editRef.current?.focus();
  wasEditing.current=editing;
 },[editing]);
 if(!telemetry)return null;
 let displayedId=telemetry.machineId?.slice(-6)||'—';
 try{displayedId=JSON.parse(localStorage.getItem('www-lab-assignment-identity')||'{}').studentId||displayedId;}catch{}
 const begin=()=>{setDraft(telemetry.studentName||'');try{setStudentId(JSON.parse(localStorage.getItem('www-lab-assignment-identity')||'{}').studentId||telemetry.machineId?.slice(-6)||'');}catch{setStudentId(telemetry.machineId?.slice(-6)||'');}setEditing(true);};
 const save=event=>{event.preventDefault();telemetry.setStudentName(draft.trim());try{localStorage.setItem('www-lab-assignment-identity',JSON.stringify({studentId:studentId.trim(),studentName:draft.trim()}));dispatchEvent(new Event('student-identity-change'));}catch{}setEditing(false);};
 return <section className="student-identity" aria-label="Tożsamość ucznia">
  <div className="student-identity-heading">
   <div className="student-identity-copy">
    <span className="student-identity-id" title={telemetry.machineId}>ID: {compact?displayedId:telemetry.machineId?.slice(-6)||'—'}</span>
    {(!compact || telemetry.studentName) && <strong className="student-identity-name">{telemetry.studentName||'Bez nazwy'}</strong>}
   </div>
   <button ref={editRef} type="button" className="student-identity-edit" aria-label={compact?'Edytuj ID i nazwę ucznia':'Edytuj nazwę ucznia'} title="Edytuj ID i nazwę ucznia" aria-expanded={editing} onClick={()=>editing?setEditing(false):begin()}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15l-1 6Z"/></svg>
   </button>
  </div>
  {editing&&<form className="student-identity-form" onSubmit={save} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setEditing(false);}}}>
   {compact && <><label htmlFor={`${inputId}-student`}>ID ucznia</label><input id={`${inputId}-student`} required maxLength={80} value={studentId} onChange={event=>setStudentId(event.target.value)} autoComplete="off" /></>}
   <label htmlFor={inputId}>Nick lub nazwa</label>
   <input ref={inputRef} id={inputId} type="text" maxLength={80} placeholder="Np. Ola · 3A" autoComplete="off" value={draft} onChange={event=>setDraft(event.target.value)}/>
   <span className="student-identity-hint">Opcjonalnie — nauczyciel zobaczy tę nazwę obok ID.</span>
   <div className="student-identity-actions"><button type="submit">Zapisz</button><button type="button" onClick={()=>setEditing(false)}>Anuluj</button></div>
  </form>}
  {!compact && telemetry.status!=='disabled' && <ConnectionStatus telemetry={telemetry} />}
 </section>;
}
