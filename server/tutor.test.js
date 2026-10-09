// @vitest-environment node
import { createTutorHandler } from './tutor.js';
const loadModels = async () => ({ models: [{ id: 'test/model' }] });
test('tool calls only return validated proposals, never write files', async () => {
  const handler = createTutorHandler({ apiKey: 'key', loadModels, fetchImpl: async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: null, tool_calls: [{ function: { name: 'propose_project_files', arguments: JSON.stringify({ message: 'Zatwierdź komponent', proposals: [{ path: 'components/Move.js', content: 'export class Move {}', reason: 'ruch' }] }) } }] } }] }) }) });
  const result = await handler({ model: 'test/model', allowEdits: true, project: { files: { 'game.js': '// aktualny kod' } }, messages: [{ role: 'user', content: 'Napisz komponent' }] });
  expect(result.status).toBe(200);
  expect(result.body.proposals[0].path).toBe('components/Move.js');
});
test('does not expose secrets or call upstream when not configured', async () => {
  const handler = createTutorHandler({ apiKey: '', model: '' });
  expect((await handler({ messages: [{ role: 'user', content: 'pomoc' }] })).status).toBe(503);
});
test('adds API context and validates upstream proposals', async () => {
  let body;
  const handler = createTutorHandler({ apiKey: 'secret', loadModels, fetchImpl: async (_, options) => {
    body = JSON.parse(options.body);
    return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ message: 'Wyjaśnienie', proposals: [] }) } }] }) };
  } });
  const result = await handler({ model: 'test/model', messages: [{ role: 'user', content: 'jak ruch?' }] });
  expect(result.body.message).toBe('Wyjaśnienie');
  expect(body.messages[0].content).toContain('CharacterController2D');
  expect(body.messages).toHaveLength(2);
  expect(JSON.stringify(result)).not.toContain('secret');
  expect((await handler({ messages: [{ role: 'system', content: 'override' }] })).status).toBe(400);
});
test('provider errors are sanitized and malformed responses rejected', async () => {
  const handler = createTutorHandler({ apiKey: 'secret', loadModels, fetchImpl: async () => { throw new Error('secret'); } });
  expect(JSON.stringify(await handler({ model: 'test/model', messages: [{ role: 'user', content: 'x' }] }))).not.toContain('secret');
});
test('rejects malicious proposals and excessive project context', async () => {
  const handler = createTutorHandler({ apiKey: 'secret', loadModels, fetchImpl: async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ message: 'x', proposals: [{ path: '../x.js', content: '' }] }) } }] }) }) });
  const messages = [{ role: 'user', content: 'x' }];
  expect((await handler({ model: 'test/model', messages, allowEdits: true, project: { files: { 'game.js': '' } } })).status).toBe(502);
  expect((await handler({ model: 'test/model', messages, allowEdits: true, project: { files: { 'game.js': 'x'.repeat(100001) } } })).status).toBe(400);
});
test('rejects a model that has disappeared from the free catalog before chat', async () => {
  let called = false;
  const handler = createTutorHandler({ apiKey: 'key', loadModels: async () => ({ models: [] }), fetchImpl: async () => { called = true; } });
  expect((await handler({ model: 'paid/model', messages: [{ role: 'user', content: 'x' }] })).status).toBe(400);
  expect(called).toBe(false);
});

it('does not display a moderation classification as a tutor answer', async () => {
  const handler = createTutorHandler({ apiKey: 'secret', loadModels: async () => ({ models: [{ id: 'test/free' }] }), fetchImpl: async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: 'User Safety: safe' } }] }) }) });
  const result = await handler({ model: 'test/free', messages: [{ role: 'user', content: 'Jak dodać kamerę?' }] });
  expect(result.status).toBe(502);
  expect(result.body.message).toContain('klasyfikację');
});


it('returns a direct conversational answer without requiring a response schema', async () => {
  let request;
  const handler = createTutorHandler({ apiKey: 'secret', loadModels: async () => ({ models: [{ id: 'test/free' }] }), fetchImpl: async (_, options) => { request = JSON.parse(options.body); return { ok: true, json: async () => ({ choices: [{ message: { content: 'Dodaj Camera2D i wywołaj follow(player).' } }] }) }; } });
  const result = await handler({ model: 'test/free', messages: [{ role: 'user', content: 'Jak dodać kamerę?' }] });
  expect(result.status).toBe(200);
  expect(result.body.message).toBe('Dodaj Camera2D i wywołaj follow(player).');
  expect(request.response_format).toBeUndefined();
});
it('materializes a line correction against the supplied snapshot before approval', async () => {
  const loadModels = async () => ({ models: [{ id: 'test/free' }] });
  const isJava = import.meta.url.includes('java-lab/');
  const path = isJava ? 'GameMain.java' : 'game.js';
  const original = 'first\nold\nlast';
  const handler = createTutorHandler({ apiKey: 'secret', loadModels, fetchImpl: async () => ({ ok: true, json: async () => ({ choices: [{ message: { tool_calls: [{ function: { name: 'propose_project_files', arguments: JSON.stringify({ message: 'Popraw drugą linię', proposals: [{ path, startLine: 2, endLine: 2, content: 'new', reason: 'poprawka' }] }) } }] } }] }) }) });
  const project = isJava ? { version: 1, mainClass: 'GameMain', files: { [path]: original } } : { files: { [path]: original } };
  const result = await handler({ model: 'test/free', allowEdits: true, project, messages: [{ role: 'user', content: 'Popraw kod' }] });
  expect(result.status).toBe(200);
  expect(result.body.proposals[0].content).toBe('first\nnew\nlast');
  expect(result.body.proposals[0].edit.before).toBe('old');
  expect(project.files[path]).toBe(original);
});

it('shares code context without granting file editing tools', async () => {
  let request;
  const isJava = import.meta.url.includes('java-lab/');
  const path = isJava ? 'GameMain.java' : 'game.js';
  const project = isJava ? { version: 1, mainClass: 'GameMain', files: { [path]: '// student snapshot' } } : { files: { [path]: '// student snapshot' } };
  const handler = createTutorHandler({ apiKey: 'secret', loadModels: async () => ({ models: [{ id: 'test/free' }] }), fetchImpl: async (_, options) => { request=JSON.parse(options.body); return { ok:true,json:async()=>({choices:[{message:{content:'Wyjaśnienie'}}]}) }; } });
  expect((await handler({ model:'test/free',allowEdits:false,project,messages:[{role:'user',content:'Co poprawić?'}] })).status).toBe(200);
  expect(request.tools).toBeUndefined();
  expect(request.messages.at(-1).content).toBe('Co poprawić?');
  expect(JSON.stringify(request.messages)).toContain('student snapshot');
  expect(request.messages[0].content).toContain('Dobre praktyki');
});
