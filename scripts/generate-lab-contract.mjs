import {writeFileSync} from 'node:fs';
import {gameLabApi,gameLabMembers,gameLabMemberDocs} from '../src/data/gameLabApi.js';
const root=new URL('../shared/lab-game-v2/',import.meta.url);
const save=(name,data)=>writeFileSync(new URL(name,root),JSON.stringify(data,null,2)+'\n');
save('contract.json',{
  engineApiVersion:'2.0.0',languages:['Java','JavaScript'],
  coordinates:{position:'object center',units:'pixels',positiveY:'down',rotation:'radians',input:'canvas CSS pixels'},
  frame:{maximumDeltaSeconds:.1,phases:['create','UI update','WORLD update','physics','late update','world render','UI render','input edges clear'],pause:'WORLD and world time stop; UI and unscaled time continue'},
  types:gameLabApi.map(type=>({...type,members:(gameLabMembers[type.name]||[]).map(name=>({name,description:gameLabMemberDocs[`${type.name}.${name}`]??gameLabMemberDocs[name]??null}))})),
  query:{components:'intersection; inheritance; inactive included; destroyed excluded; ordered by ID; snapshot',tags:'scene index; snapshot'},
  collision:{broadPhase:'spatial hash',cellSize:64,narrowPhase:'swept rectangle, circle and rounded rectangle',axisOrder:['x','y'],tolerance:1e-6,layerMask:'both colliders must accept the other layer',onContactEnter:'once per contact; reentry after separation'},
  languageDifferences:{componentType:{Java:'Player.class',JavaScript:'Player'},assets:{Java:'enum Assets',JavaScript:'Object.freeze(Assets)'},directTransformQueries:'Java: physics.refresh() after direct field mutations within WORLD update; setPosition invalidates automatically. JavaScript: position accessors invalidate automatically.'}
});
save('render-protocol.json',{
  engineApiVersion:'2.0.0',envelope:{command:'game-draw',gameId:'active scene identifier',op:'frame',commands:'ordered array'},
  coordinates:'center, CSS pixels; rotation radians; scale visual only',
  commands:{clear:['color'],rect:['x','y','width','height','color','rotation','scaleX','scaleY'],text:['text','x','y','color','align','fontSize','baseline'],sprite:['texture','x','y','width','height','rotation','scaleX','scaleY'],ninepatch:['texture','x','y','width','height','border'],progress:['x','y','width','height','progress','frame','track','fill'],collider:['shape','x','y','width','height','trigger'],debug:['enabled']},
  defaults:{rotation:0,scaleX:1,scaleY:1,fontSize:16,align:'center',baseline:'middle'},
  assets:'assets/manifest.json',
  transport:{Java:'GameCanvas pipe-delimited records parsed by TeaVM worker into the common envelope',JavaScript:'Canvas records passed directly to the renderer'},
  input:{command:'game-input',gameId:'must equal the active scene ID',kinds:{pointer:['x','y'],mouse:['button','pressed'],clear:[],keyboard:['key','pressed']}}
});
