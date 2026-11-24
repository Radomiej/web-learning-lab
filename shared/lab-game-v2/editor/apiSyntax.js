export function splitArguments(text) {
  const result=[];let start=0,depth=0;
  for(let i=0;i<text.length;i++) {
    if('<([{'.includes(text[i]))depth++;
    if('>)]}'.includes(text[i]))depth--;
    if(text[i]===',' && depth===0){result.push(text.slice(start,i).trim());start=i+1;}
  }
  const last=text.slice(start).trim();if(last)result.push(last);
  return result;
}
export function parseJavaApi(sources) {
  return Object.fromEntries(Object.entries(sources).map(([file,source])=>{
    const owner=file.replace('.java',''),members=[];
    const pattern=/\bpublic\s+(?:(?:static|final|abstract|synchronized)\s+)*(?:<[^\n{}]+?>\s+)?([\w<>?,.\[\] ]+?)\s+(\w+)\s*\(([^()]*)\)/g;
    for(const match of source.matchAll(pattern))members.push({name:match[2],signature:match[0],parameters:splitArguments(match[3]),kind:'method'});
    for(const match of source.matchAll(new RegExp(`\\bpublic\\s+${owner}\\s*\\(([^()]*)\\)`,'g')))members.push({name:owner,signature:match[0],parameters:splitArguments(match[1]),kind:'constructor'});
    // Pola: deklaracje zbiorcze `int a=1,b=2;` — inicjalizatory przecinamy
    // na przecinkach tylko na głębokości 0 (poza nawiasami i literałami).
    const skipValue=i=>{let depth=0;for(;i<source.length;i++){const c=source[i];if(c==='"'||c==="'"){for(i++;i<source.length&&source[i]!==c;i++)if(source[i]==='\\')i++;continue;}if('([{'.includes(c))depth++;else if(')]}'.includes(c))depth--;else if(depth===0&&(c===','||c===';'))return i;}return i;};
    const ws=i=>{while(i<source.length&&/\s/.test(source[i]))i++;return i;};
    for(const head of source.matchAll(/\bpublic\s+((?:(?:static|final|volatile|transient)\s+)*)((?:[\w$]+\.)*[\w$]+(?:<[\w$?,. \[\]<>]*>)?(?:\[\])*)\s+/g)){
      const isStatic=/\bstatic\b/.test(head[1]),type=head[2];
      for(let i=ws(head.index+head[0].length);;){
        const name=source.slice(i).match(/^[A-Za-z_$][\w$]*/)?.[0];
        if(!name)break;
        let c=ws(i+name.length);
        if(source[c]==='('||source[c]==='{')break; // metoda, konstruktor albo `public class/enum`
        if(source[c]!=='='&&source[c]!==';'&&source[c]!==',')break; // np. `public abstract class` — to nie pole
        members.push({name,signature:`${type} ${name}`,kind:'field',static:isStatic});
        if(source[c]==='=')c=skipValue(c+1);
        c=ws(c);
        if(source[c]===','){i=ws(c+1);continue;}
        break;
      }
    }
    // Stałe enuma `enum X {A,B,C(...)}` — nazwy przed pierwszym średnikiem ciała.
    const enumHead=source.match(/\benum\s+[A-Za-z_$][\w$]*\s*\{/);
    if(enumHead){
      let depth=1,body='',i=enumHead.index+enumHead[0].length;
      for(;i<source.length&&depth;i++){const c=source[i];if(c==='{')depth++;else if(c==='}')depth--;if(depth)body+=c;}
      let split=0,start=0;
      for(let j=0;j<=body.length;j++){
        const c=body[j];
        if('([{'.includes(c))split++;else if(')]}'.includes(c))split--;
        else if(split===0&&(c===','||j===body.length||c===';')){
          const name=body.slice(start,j).trim().match(/^[A-Z][A-Z\d_]*/)?.[0];
          if(name)members.push({name,signature:`${owner} ${name}`,kind:'field',static:true});
          start=j+1;if(c===';')break;
        }
      }
    }
    return [owner,{constructible:new RegExp(`\\bpublic\\s+(?:final\\s+)?class\\s+${owner}\\b`).test(source),parent:source.match(/\bextends\s+(\w+)/)?.[1],enum:!!enumHead,members}];
  }));
}
export function apiMembers(catalog,owner) {
  const result=[],seen=new Set();
  while(catalog[owner]&&!seen.has(owner)){seen.add(owner);result.push(...catalog[owner].members);owner=catalog[owner].parent;}
  return result;
}
export function callContext(source) {
  // Mask strings/comments while retaining offsets. Nested calls and commas must not change the outer parameter.
  const masked=source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g,text=>' '.repeat(text.length));
  const stack=[];
  for(let i=0;i<masked.length;i++) {
    if(masked[i]==='(')stack.push({offset:i,argument:0});
    else if(masked[i]===')')stack.pop();
    else if(masked[i]===',' && stack.length)stack.at(-1).argument++;
  }
  const call=stack.at(-1);if(!call)return null;
  const prefix=masked.slice(0,call.offset),match=prefix.match(/([\w$]+)\s*$/),name=match?.[1];
  if(!name)return null;
  return {...call,name,prefix:source.slice(0,match.index)};
}
