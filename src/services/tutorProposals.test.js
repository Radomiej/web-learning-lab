import { validateProposals, applyTutorProposal } from './tutorProposals.js';
const project = { entry: 'index.html', runtime: { kind: 'game-js' }, files: { 'index.html': '<html></html>', 'game.js': 'old' } };
test('rejects unsafe, duplicate and oversized proposals', () => {
  for (const path of ['../x.js', '/x.js', 'a\\x.js', '__proto__.js', 'key.env']) expect(() => validateProposals([{ path, content: '' }])).toThrow();
  expect(() => validateProposals([{ path: 'a.js', content: '' }, { path: 'a.js', content: '' }])).toThrow();
  expect(() => validateProposals([{ path: 'a.js', content: 'x'.repeat(50001) }])).toThrow();
});
test('applies a file without losing others and rejects stale edits', () => {
  const proposal = { path: 'game.js', content: 'new', reason: 'ruch' };
  expect(applyTutorProposal(project, project, proposal).files).toEqual({ ...project.files, 'game.js': 'new' });
  expect(() => applyTutorProposal({ ...project, files: { ...project.files, 'game.js': 'student' } }, project, proposal)).toThrow(/zmienił/);
});

test('deletes approved extra files but protects entry and rejects stale deletion',()=>{
 const snapshot={...project,files:{...project.files,'Extra.js':'old'}};
 expect(applyTutorProposal(snapshot,snapshot,{path:'Extra.js',operation:'delete'}).files['Extra.js']).toBeUndefined();
 expect(snapshot.files['Extra.js']).toBe('old');
 expect(()=>validateProposals([{path:'game.js',operation:'delete'}])).toThrow('startowego');
 expect(()=>applyTutorProposal({...snapshot,files:{...snapshot.files,'Extra.js':'student'}},snapshot,{path:'Extra.js',operation:'delete'})).toThrow('zmienił');
});
