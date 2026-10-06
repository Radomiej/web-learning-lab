import { normalizeProject } from './projectFiles.js';

export function validateProposals(value) {
  if (!Array.isArray(value) || value.length > 10) throw new Error('Nieprawidłowa lista propozycji.');
  const paths = new Set();
  return value.map(item => {
    if (!item || typeof item.path !== 'string' || !/\.(html|css|js|jsx|json)$/.test(item.path) || typeof item.content !== 'string' || item.content.length > 50000 || paths.has(item.path)) throw new Error('Nieprawidłowy proponowany plik.');
    normalizeProject({ entry: 'index.html', files: { 'index.html': '', [item.path]: item.content } });
    paths.add(item.path);
    return { path: item.path, content: item.content, reason: typeof item.reason === 'string' ? item.reason.slice(0, 2000) : '' };
  });
}

export function applyTutorProposal(current, snapshot, proposal) {
  const [valid] = validateProposals([proposal]);
  if (current.files[valid.path] !== snapshot.files[valid.path] || Object.hasOwn(current.files, valid.path) !== Object.hasOwn(snapshot.files, valid.path)) throw new Error('Plik zmienił się od wysłania pytania. Poproś o nową propozycję.');
  return normalizeProject({ ...current, files: { ...current.files, [valid.path]: valid.content } });
}
