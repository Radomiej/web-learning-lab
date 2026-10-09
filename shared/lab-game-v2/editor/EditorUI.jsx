import { useRef, useState } from 'react';

const paths = {
  run: 'M8 5l11 7-11 7z',
  add: 'M12 5v14M5 12h14',
  reset: 'M4 10a8 8 0 1 1 1 8M4 4v6h6',
  solution: 'M8 9l-3 3 3 3M16 9l3 3-3 3M14 5l-4 14',
  format: 'M4 4h16M8 9h12M8 14h8M4 19h16M3 9l3 2.5L3 14',
  remove: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5',
  close: 'M6 6l12 12M6 18L18 6',
};
export function EditorIcon({ action }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={paths[action]} /></svg>;
}

export function moveTab(order, source, target) {
  if(source===target || !order.includes(source) || !order.includes(target))return order;
  const next=order.filter(name=>name!==source);
  next.splice(next.indexOf(target),0,source);
  return next;
}

// Reordering never changes the active file, source code or compilation order.
export function useEditorTabs(names, workspace) {
  const [saved,setSaved]=useState({workspace,order:names});
  const dragged=useRef(null);
  const base=saved.workspace===workspace?saved.order:[];
  const order=[...base.filter(name=>names.includes(name)),...names.filter(name=>!base.includes(name))];
  const reorder=(source,target)=>setSaved({workspace,order:moveTab(order,source,target)});
  return {order,tabProps:name=>({
    draggable:true,
    title:`${name} — przeciągnij, aby zmienić kolejność (Alt+←/→)`,
    onDragStart:event=>{dragged.current=name;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',name);},
    onDragOver:event=>{if(names.includes(dragged.current)){event.preventDefault();event.dataTransfer.dropEffect='move';}},
    onDrop:event=>{event.preventDefault();if(names.includes(dragged.current))reorder(dragged.current,name);dragged.current=null;},
    onDragEnd:()=>{dragged.current=null;},
    onKeyDown:event=>{
      if(!event.altKey || !['ArrowLeft','ArrowRight'].includes(event.key))return;
      const index=order.indexOf(name),next=index+(event.key==='ArrowLeft'?-1:1);
      if(next<0 || next>=order.length)return;
      event.preventDefault();const changed=[...order];[changed[index],changed[next]]=[changed[next],changed[index]];
      setSaved({workspace,order:changed});
    },
  })};
}
