// @vitest-environment node
import { createTutorHandler } from './tutor.js';
const loadModels = async () => ({ models: [{ id: 'test/model' }] });
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
  expect((await handler({ model: 'test/model', messages })).status).toBe(502);
  expect((await handler({ model: 'test/model', messages, project: { files: { 'game.js': 'x'.repeat(100001) } } })).status).toBe(400);
});
test('rejects a model that has disappeared from the free catalog before chat', async () => {
  let called = false;
  const handler = createTutorHandler({ apiKey: 'key', loadModels: async () => ({ models: [] }), fetchImpl: async () => { called = true; } });
  expect((await handler({ model: 'paid/model', messages: [{ role: 'user', content: 'x' }] })).status).toBe(400);
  expect(called).toBe(false);
});
