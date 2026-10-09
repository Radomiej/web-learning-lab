import { gameLabApi, gameLabMemberDocs, gameLabMembers } from '../data/gameLabApi.js';
import catalog from '../../shared/lab-game-v2/editor/api-catalog.json';
import {apiMembers,callContext} from '../../shared/lab-game-v2/editor/apiSyntax.js';
const parameterName=p=>p.trim().split(/\s+/).at(-1);
const jsSignature=m=>`${m.name}(${m.parameters.map(parameterName).join(', ')})`;
const methodSnippet=m=>`${m.name}(${m.parameters.map((p,i)=>'${'+(i+1)+':'+parameterName(p)+'}').join(', ')})`;

export const callableMembers = new Set([
  'walk', 'run', 'stop', 'setRunning', 'isWalk', 'isRunning', 'jump', 'isGrounded', 'steer',
  'createObject', 'find', 'setPosition', 'addComponent', 'getComponent', 'removeComponent',
  'destroy', 'onCreate', 'onUpdate', 'onDrawUI', 'onDestroy', 'onCollision', 'onTrigger',
  'isKeyDown', 'isKeyPressed', 'drawRect', 'drawText', 'drawTileMap', 'drawSprite', 'move',
  'position', 'scale', 'rotation', 'shake', 'cancel', 'follow', 'stopFollowing', 'stopShake',
  'getObjects','getObjectsWith','getObjectsWithTag','pause','resume','isPaused','setWorldBounds','clearWorldBounds','getViewportWidth','getViewportHeight',
  'getComponents','requireComponent','hasComponent','removeComponents','onComponentChange','addTag','removeTag','hasTag','getTags','onLateUpdate',
  'isKeyReleased','consumeKey','getPointerPosition','isMouseDown','isMousePressed','isMouseReleased','consumeMouse','setEnabled','setActive','setProgress','getProgress','setValue','onContactEnter','onComplete',
  'activate','focus','blur','isFocused','getBounds','getCenter','getView','worldToScreen','screenToWorld','queryRadius','findNearest','refresh','overlaps','set','copy','length','lengthSquared','normalized','setSeed','next','nextInt','range',
]);

function completion(monaco, model, position, { label, detail, documentation, kind, insertText, insertTextRules }) {
  const word = model.getWordUntilPosition(position);
  const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
  return {
    label,
    kind: monaco.languages.CompletionItemKind[kind] ?? monaco.languages.CompletionItemKind.Text,
    detail,
    documentation,
    insertText: insertText ?? label,
    insertTextRules,
    range,
  };
}

function entryCompletion(monaco, model, position, item) {
  const callable = item.kind === 'Function';
  return completion(monaco, model, position, {
    label: item.name,
    detail: item.signature,
    documentation: { value: `${item.description}${item.example ? `\n\n\`\`\`js\n${item.example}\n\`\`\`` : ''}` },
    kind: callable ? 'Function' : item.kind === 'Constructor' ? 'Constructor' : item.kind,
    insertText: callable ? `${item.name}($1)` : item.name,
    insertTextRules: callable ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
  });
}

function memberOwner(source, suffix) {
  if (/\bGameLab\.(Assets|InputManager|UIAnchor)\.$/.test(suffix)) return suffix.match(/GameLab\.(\w+)\.$/)[1];
  if (/\bGameLab\.Tweens\.$/.test(suffix)) return 'Tweens';
  if (/\.transform\.(?:scale|visualOffset)\.$/.test(suffix)) return 'Vector2';
  if (/\.transform\.$/.test(suffix)) return 'Transform';
  if (/\bthis(?:\.game)?\.input\.$/.test(suffix)) return 'InputManager';
  if (/\bthis(?:\.game)?\.physics\.$/.test(suffix)) return 'Physics2D';
  if (/\bthis(?:\.game)?\.random\.$/.test(suffix)) return 'Random';
  if (/\bthis(?:\.game)?\.canvas\.$/.test(suffix)) return 'Canvas';
  if (/\bthis(?:\.game)?\.time\.$/.test(suffix)) return 'Time';
  if (/\bthis\.gameObject\.$/.test(suffix)) return 'GameObject';
  if (/\bthis\.game\.$/.test(suffix)) return 'Game';
  if (/\bthis\.$/.test(suffix)) {
    return [...source.matchAll(/class\s+\w+\s+extends\s+(?:GameLab\.)?(Game|Component)\b/g)].at(-1)?.[1] ?? 'Game';
  }
  const receiver = suffix.match(/\b([A-Za-z_$][\w$]*)\.$/)?.[1];
  if (!receiver) return null;
  const escaped = receiver.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = [...source.matchAll(new RegExp(`(?:const|let|var)\\s+${escaped}\\s*=\\s*([^;\\n]+)`, 'g'))].at(-1)?.[1];
  if (!expression) return null;
  const component = expression.match(/(?:getComponent\(\s*|new\s+)(?:GameLab\.)?(\w+)/)?.[1];
  if (component && gameLabMembers[component]) return component;
  if (/\.(?:createObject|find)\(/.test(expression)) return 'GameObject';
  return null;
}

export function provideGameLabCompletions(monaco, model, position, workspaceKey) {
  const uri = model.uri?.path ?? model.uri?.toString?.() ?? '';
  if (!uri.includes(`/${encodeURIComponent(workspaceKey)}/`)) return { suggestions: [] };

  const source = model.getValue();
  const before = source.slice(0, model.getOffsetAt(position));
  const typed = model.getWordUntilPosition(position).word;
  const suffix = before.slice(0, before.length - typed.length);

  if (/\bGameLab\.$/.test(suffix)) {
    return { suggestions: gameLabApi.map(item => entryCompletion(monaco, model, position, item)) };
  }

  const owner = memberOwner(before, suffix);
  const names = gameLabMembers[owner] ?? [];

  const docs = new Map(gameLabApi.map(item => [item.name, item]));
  return {
    suggestions: names.map(name => {
      const apiItem = docs.get(name);
      const isCallable = callableMembers.has(name) && owner !== 'Transform';
      const method=apiMembers(catalog,owner).find(m=>m.name===name&&m.parameters);
      return completion(monaco, model, position, {
        label: name,
        detail: method?jsSignature(method):apiItem?.signature ?? (isCallable ? `${name}(...)` : 'GameLab API'),
        documentation: gameLabMemberDocs[`${owner}.${name}`] ?? gameLabMemberDocs[name] ?? apiItem?.description ?? `Wbudowany element GameLab: ${name}.`,
        kind: isCallable ? 'Method' : 'Property',
        insertText: isCallable ? method?methodSnippet(method):`${name}($1)` : name,
        insertTextRules: isCallable ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
      });
    }),
  };
}

export function createGameLabCompletionProvider(monaco, workspaceKey) {
  return {
    triggerCharacters: ['.'],
    provideCompletionItems(model, position) {
      return provideGameLabCompletions(monaco, model, position, workspaceKey);
    },
  };
}

export function createGameLabSignatureProvider(workspaceKey) {
  return {signatureHelpTriggerCharacters:['(', ','],signatureHelpRetriggerCharacters:[')'],provideSignatureHelp(model,position) {
    const uri=model.uri?.path??model.uri?.toString?.()??'';
    if(!uri.includes(`/${encodeURIComponent(workspaceKey)}/`))return null;
    const source=model.getValue().slice(0,model.getOffsetAt(position)),call=callContext(source);if(!call)return null;
    const constructing=/\bnew\s+(?:GameLab\.)?$/.test(call.prefix),owner=constructing?call.name:memberOwner(source,call.prefix);
    const members=apiMembers(catalog,owner).filter(m=>m.name===call.name&&m.parameters);
    if(!members.length)return null;
    return {value:{signatures:members.map(m=>({label:jsSignature(m),documentation:gameLabMemberDocs[`${owner}.${call.name}`]??gameLabApi.find(item=>item.name===owner)?.description,parameters:m.parameters.map(p=>({label:parameterName(p)}))})),activeSignature:Math.max(0,members.findIndex(m=>m.parameters.length>call.argument)),activeParameter:call.argument},dispose(){}};
  }};
}
