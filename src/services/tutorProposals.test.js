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
