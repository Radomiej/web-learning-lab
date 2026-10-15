export function changedRange(before='',after='') {
  if(before===after)return null;
  let start=0,end=after.length,oldEnd=before.length;
  while(start<end&&start<oldEnd&&before[start]===after[start])start++;
  while(end>start&&oldEnd>start&&before[oldEnd-1]===after[end-1]){oldEnd--;end--;}
  const position=offset=>{const lines=after.slice(0,offset).split('\n');return {line:lines.length,column:lines.at(-1).length+1};};
  return {start,end,from:position(start),to:position(end),text:after.slice(start,end)};
}
export function guidedChanges(starter,solution) {
  return Object.entries(solution??{}).flatMap(([file,code])=>{
    const range=changedRange(starter?.[file]??'',code);return range?[{file,code,...range}]:[];
  });
}
