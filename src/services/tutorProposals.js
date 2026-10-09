import { editMetadata, changesMetadata } from '../../shared/lab-game-v2/tutorLineEdits.js';
import { normalizeProject } from './projectFiles.js';

export function validateProposals(value) {
  if (!Array.isArray(value) || value.length > 10) throw new Error('Nieprawidłowa lista propozycji.');
  const paths = new Set();
  return value.map(item => {
    const operation=item?.operation??'write';
    if(!['write','delete'].includes(operation))throw new Error('Nieprawidłowa operacja pliku.');
    if(operation==='delete'){
      if(['index.html','game.js'].includes(item.path))throw new Error('Nie można usunąć pliku startowego.');
      item={...item,content:''};
    }
    if (!item || typeof item.path !== 'string' || !/\.(html|css|js|jsx|json)$/.test(item.path) || typeof item.content !== 'string' || item.content.length > 50000 || paths.has(item.path)) throw new Error('Nieprawidłowy proponowany plik.');
    normalizeProject({ entry: 'index.html', files: { 'index.html': '', [item.path]: item.content } });
    paths.add(item.path);
    return { ...editMetadata(item.edit), ...changesMetadata(item.changes), operation, path: item.path, content: item.content, reason: typeof item.reason === 'string' ? item.reason.slice(0, 2000) : '' };
  });
}

export function applyTutorProposal(current, snapshot, proposal) {
  const [valid] = validateProposals([proposal]);
  if (current.files[valid.path] !== snapshot.files[valid.path] || Object.hasOwn(current.files, valid.path) !== Object.hasOwn(snapshot.files, valid.path)) throw new Error('Plik zmienił się od wysłania pytania. Poproś o nową propozycję.');
  const files={...current.files};
  if(valid.operation==='delete'){
    if([current.entry,current.runtime?.module].includes(valid.path))throw new Error('Nie można usunąć pliku startowego.');
    if(!Object.hasOwn(files,valid.path))throw new Error('Plik do usunięcia nie istnieje.');
    delete files[valid.path];
  }else files[valid.path]=valid.content;
  return normalizeProject({ ...current, files });
}
