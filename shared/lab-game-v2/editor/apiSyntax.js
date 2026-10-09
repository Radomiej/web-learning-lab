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
    for(const match of source.matchAll(/\bpublic\s+(?:(?:static|final)\s+)*([\w<>?,.\[\] ]+?)\s+(\w+)\s*(?=[=;])/g))members.push({name:match[2],signature:`${match[1]} ${match[2]}`,kind:'field'});
    if(/\benum\b/.test(source))for(const match of source.matchAll(/^\s*([A-Z][A-Z\d_]+)\s*\(/gm))members.push({name:match[1],signature:`${owner}.${match[1]}`,kind:'field'});
    return [owner,{constructible:new RegExp(`\\bpublic\\s+(?:final\\s+)?class\\s+${owner}\\b`).test(source),parent:source.match(/\bextends\s+(\w+)/)?.[1],members}];
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
