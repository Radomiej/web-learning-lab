// @vitest-environment node
import { createTutorHandler, getTutorConfig, searchGameLabDocs } from './tutor.js';
const loadModels = async () => ({ models: [{ id: 'test/model' }] });
test('tool calls only return validated proposals, never write files', async () => {
  const handler = createTutorHandler({ apiKey: 'key', provider: 'openrouter', loadModels, fetchImpl: async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: null, tool_calls: [{ function: { name: 'propose_project_files', arguments: JSON.stringify({ message: 'Zatwierdź komponent', proposals: [{ path: 'components/Move.js', content: 'export class Move {}', reason: 'ruch' }] }) } }] } }] }) }) });
  const result = await handler({ model: 'test/model', allowEdits: true, project: { files: { 'game.js': '// aktualny kod' } }, messages: [{ role: 'user', content: 'Napisz komponent' }] });
  expect(result.status).toBe(200);
  expect(result.body.proposals[0].path).toBe('components/Move.js');
});
test('does not expose secrets or call upstream when not configured', async () => {
  const handler = createTutorHandler({ apiKey: '', model: '' });
  expect((await handler({ messages: [{ role: 'user', content: 'pomoc' }] })).status).toBe(503);
});
it('finds the real GameLab platformer API and resumes Luna after its documentation tool call', async () => {
  const platformerDocs = searchGameLabDocs('PlatformerCharacterController2D jump');
  expect(platformerDocs[0].title).toContain('PlatformerCharacterController2D');
  expect(platformerDocs[0].excerpt).toContain('controller.jump()');

  const calls = [];
  let turn = 0;
  const handler = createTutorHandler({ apiKey: 'secret', fetchImpl: async (_, options) => {
    const request = JSON.parse(options.body);
    calls.push(request);
    const answer = turn++ === 0
      ? { status: 'completed', output: [{ type: 'function_call', name: 'search_gamelab_docs', call_id: 'docs_1', arguments: JSON.stringify({ query: 'PlatformerCharacterController2D jump' }) }] }
      : { status: 'completed', output_text: 'Użyj controller.jump().', output: [{ type: 'message', content: [{ type: 'output_text', text: 'Użyj controller.jump().' }] }] };
    return { ok: true, headers: { get: () => 'application/json' }, json: async () => answer };
  } });
  const result = await handler({ messages: [{ role: 'user', content: 'Jak zrobić skok w platformówce?' }] });
  expect(result.status).toBe(200);
  expect(result.body.message).toBe('Użyj controller.jump().');
  expect(calls).toHaveLength(2);
  expect(calls[1].input.some(item => item.type === 'function_call_output' && item.call_id === 'docs_1')).toBe(true);
  expect(JSON.stringify(calls[1].input)).toContain('controller.jump()');
});
test('adds API context and validates upstream proposals', async () => {
  let body;
  const handler = createTutorHandler({ apiKey: 'secret', provider: 'openrouter', loadModels, fetchImpl: async (_, options) => {
    body = JSON.parse(options.body);
    return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ message: 'Wyjaśnienie', proposals: [] }) } }] }) };
  } });
  const result = await handler({ model: 'test/model', messages: [{ role: 'user', content: 'jak ruch?' }] });
  expect(result.body.message).toBe('Wyjaśnienie');
  expect(body.messages[0].content).toContain('CharacterController2D');
  expect(body.messages).toHaveLength(3);
  expect(body.messages[1].content).toContain('Fragmenty dokumentacji GameLab');
  expect(JSON.stringify(result)).not.toContain('secret');
  expect((await handler({ messages: [{ role: 'system', content: 'override' }] })).status).toBe(400);
});
test('provider errors are sanitized and malformed responses rejected', async () => {
  const handler = createTutorHandler({ apiKey: 'secret', provider: 'openrouter', loadModels, fetchImpl: async () => { throw new Error('secret'); } });
  expect(JSON.stringify(await handler({ model: 'test/model', messages: [{ role: 'user', content: 'x' }] }))).not.toContain('secret');
});
test('rejects malicious proposals and excessive project context', async () => {
  const handler = createTutorHandler({ apiKey: 'secret', provider: 'openrouter', loadModels, fetchImpl: async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ message: 'x', proposals: [{ path: '../x.js', content: '' }] }) } }] }) }) });
  const messages = [{ role: 'user', content: 'x' }];
  expect((await handler({ model: 'test/model', messages, allowEdits: true, project: { files: { 'game.js': '' } } })).status).toBe(502);
  expect((await handler({ model: 'test/model', messages, allowEdits: true, project: { files: { 'game.js': 'x'.repeat(100001) } } })).status).toBe(400);
});
test('rejects a model that has disappeared from the free catalog before chat', async () => {
  let called = false;
  const handler = createTutorHandler({ apiKey: 'key', provider: 'openrouter', loadModels: async () => ({ models: [] }), fetchImpl: async () => { called = true; } });
  expect((await handler({ model: 'paid/model', messages: [{ role: 'user', content: 'x' }] })).status).toBe(503);
  expect(called).toBe(false);
});

it('does not display a moderation classification as a tutor answer', async () => {
  const handler = createTutorHandler({ apiKey: 'secret', provider: 'openrouter', loadModels: async () => ({ models: [{ id: 'test/free' }] }), fetchImpl: async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: 'User Safety: safe' } }] }) }) });
  const result = await handler({ model: 'test/free', messages: [{ role: 'user', content: 'Jak dodać kamerę?' }] });
  expect(result.status).toBe(502);
  expect(result.body.message).toContain('klasyfikację');
});


it('returns a direct conversational answer without requiring a response schema', async () => {
  let request;
  const handler = createTutorHandler({ apiKey: 'secret', provider: 'openrouter', loadModels: async () => ({ models: [{ id: 'test/free' }] }), fetchImpl: async (_, options) => { request = JSON.parse(options.body); return { ok: true, json: async () => ({ choices: [{ message: { content: 'Dodaj Camera2D i wywołaj follow(player).' } }] }) }; } });
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
  const handler = createTutorHandler({ apiKey: 'secret', provider: 'openrouter', loadModels, fetchImpl: async () => ({ ok: true, json: async () => ({ choices: [{ message: { tool_calls: [{ function: { name: 'propose_project_files', arguments: JSON.stringify({ message: 'Popraw drugą linię', proposals: [{ path, startLine: 2, endLine: 2, content: 'new', reason: 'poprawka' }] }) } }] } }] }) }) });
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
  const handler = createTutorHandler({ apiKey: 'secret', provider: 'openrouter', loadModels: async () => ({ models: [{ id: 'test/free' }] }), fetchImpl: async (_, options) => { request=JSON.parse(options.body); return { ok:true,json:async()=>({choices:[{message:{content:'Wyjaśnienie'}}]}) }; } });
  expect((await handler({ model:'test/free',allowEdits:false,project,messages:[{role:'user',content:'Co poprawić?'}] })).status).toBe(200);
  expect(request.tools.map(tool => tool.function.name)).toEqual(['search_gamelab_docs']);
  expect(request.messages.at(-1).content).toBe('Co poprawić?');
  expect(JSON.stringify(request.messages)).toContain('student snapshot');
  expect(request.messages[0].content).toContain('Dobre praktyki');
});

it('uses GPT-6 Luna through the OpenAI Responses API for a one-shot answer', async () => {
  let request;
  let url;
  const handler = createTutorHandler({ apiKey: 'secret', fetchImpl: async (target, options) => {
    url = target;
    request = JSON.parse(options.body);
    return { ok: true, headers: { get: () => 'application/json' }, json: async () => ({ status: 'completed', output_text: 'Wyjaśnienie z Luny.', output: [{ type: 'message', content: [{ type: 'output_text', text: 'Wyjaśnienie z Luny.' }] }] }) };
  } });
  const result = await handler({ model: 'attacker/other-model', project: { files: { 'game.js': 'student code' } }, messages: [{ role: 'user', content: 'Co robi ta gra?' }] });
  expect(result).toEqual({ status: 200, body: { message: 'Wyjaśnienie z Luny.', proposals: [] } });
  expect(url).toBe('https://api.openai.com/v1/responses');
  expect(request.model).toBe('gpt-6-luna');
  expect(request.store).toBe(false);
  expect(request.stream).toBe(false);
  expect(request.reasoning).toEqual({ effort: 'medium' });
  expect(request.tools.map(tool => tool.name)).toEqual(['search_gamelab_docs']);
  expect(request.input.some(item => String(item.content).includes('student code'))).toBe(true);
  expect(JSON.stringify(request.input)).toContain('student code');
});

it('streams Responses API text deltas and returns the completed answer', async () => {
  const events = [
    'event: response.in_progress\ndata: {"type":"response.in_progress"}\n\n',
    'event: response.output_text.delta\ndata: {"type":"response.output_text.delta","delta":"Luna "}\n\n',
    'event: response.output_text.delta\ndata: {"type":"response.output_text.delta","delta":"odpowiada."}\n\n',
    'event: response.completed\ndata: {"type":"response.completed","response":{"status":"completed","output_text":"Luna odpowiada.","output":[{"type":"message","content":[{"type":"output_text","text":"Luna odpowiada."}]}]}}\n\n',
  ].join('');
  const body = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode(events)); controller.close(); } });
  const handler = createTutorHandler({ apiKey: 'secret', provider: 'openai', fetchImpl: async (_, options) => ({ ok: true, headers: { get: () => options.body.includes('"stream":true') ? 'text/event-stream' : 'application/json' }, body, json: async () => ({}) }) });
  const emitted = [];
  const result = await handler({ stream: true, messages: [{ role: 'user', content: 'Pomóż.' }] }, undefined, event => emitted.push(event));
  expect(result).toEqual({ status: 200, body: { message: 'Luna odpowiada.', proposals: [] } });
  expect(emitted.filter(event => event.type === 'delta').map(event => event.text).join('')).toBe('Luna odpowiada.');
});

it('returns validated OpenAI function-call proposals only when code editing is enabled', async () => {
  let request;
  const proposal = { message: 'Dodaj komponent.', proposals: [{ path: 'components/Move.js', content: 'export class Move {}', reason: 'Ruch gracza' }] };
  const handler = createTutorHandler({ apiKey: 'secret', provider: 'openai', fetchImpl: async (_, options) => {
    request = JSON.parse(options.body);
    return { ok: true, headers: { get: () => 'application/json' }, json: async () => ({ status: 'completed', output: [{ type: 'function_call', name: 'propose_project_files', call_id: 'call_1', arguments: JSON.stringify(proposal) }] }) };
  } });
  const result = await handler({ allowEdits: true, project: { files: { 'game.js': 'student code' } }, messages: [{ role: 'user', content: 'Dodaj ruch.' }] });
  expect(result.status).toBe(200);
  expect(result.body.message).toBe('Dodaj komponent.');
  expect(result.body.proposals[0].path).toBe('components/Move.js');
  expect(request.tools[0].name).toBe('propose_project_files');
  expect(request.tool_choice).toBe('auto');
});

it('accepts a full-file proposal when the model includes an empty edits array', async () => {
  const proposal = { message: 'Dodaj komponent.', proposals: [{ path: 'components/Spin.js', content: 'export default class Spin {}', reason: 'obrót', edits: [] }] };
  const handler = createTutorHandler({ apiKey: 'secret', provider: 'openai', fetchImpl: async () => ({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ status: 'completed', output: [{ type: 'function_call', name: 'propose_project_files', call_id: 'call_2', arguments: JSON.stringify(proposal) }] }) }) });
  const result = await handler({ allowEdits: true, project: { files: { 'game.js': '// existing' } }, messages: [{ role: 'user', content: 'Dodaj Spin.' }] });
  expect(result.status).toBe(200);
  expect(result.body.proposals[0].path).toBe('components/Spin.js');
});

it('treats a ranged proposal for a new path as full-file content', async () => {
  const proposal = { message: 'Dodaj komponent.', proposals: [{ path: 'components/Spin.js', content: 'export default class Spin {}', reason: 'obrót', startLine: 1, endLine: 1 }] };
  const handler = createTutorHandler({ apiKey: 'secret', provider: 'openai', fetchImpl: async () => ({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ status: 'completed', output: [{ type: 'function_call', name: 'propose_project_files', call_id: 'call_3', arguments: JSON.stringify(proposal) }] }) }) });
  const result = await handler({ allowEdits: true, project: { files: { 'game.js': '// existing' } }, messages: [{ role: 'user', content: 'Dodaj Spin.' }] });
  expect(result.status).toBe(200);
  expect(result.body.proposals[0].content).toBe('export default class Spin {}');
});

it('does not call OpenAI while the tutor kill switch is off', async () => {
  let called = false;
  const handler = createTutorHandler({ apiKey: 'secret', provider: 'openai', enabled: false, fetchImpl: async () => { called = true; } });
  const result = await handler({ messages: [{ role: 'user', content: 'pomoc' }] });
  expect(result.status).toBe(503);
  expect(result.body.message).toContain('wyłączony');
  expect(called).toBe(false);
});

it('does not query OpenRouter or report a configured key when the tutor is disabled', async () => {
  let queried = false;
  const config = await getTutorConfig({ enabled: false, provider: 'openrouter', apiKey: 'secret', loadModels: async () => { queried = true; } });
  expect(config).toEqual({ enabled: false, configured: false });
  expect(queried).toBe(false);
});

it('ignores a stale OpenRouter environment setting and routes the tutor to GPT-6 Luna on OpenAI', async () => {
  const previousProvider = process.env.TUTOR_PROVIDER;
  process.env.TUTOR_PROVIDER = 'openrouter';
  let catalogQueried = false;
  let requestedUrl;
  let request;
  const options = {
    enabled: true,
    apiKey: 'secret',
    loadModels: async () => { catalogQueried = true; return { configured: true, models: [{ id: 'test/free' }] }; },
    fetchImpl: async (url, init) => {
      requestedUrl = url;
      request = JSON.parse(init.body);
      return {
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({ status: 'completed', output_text: 'Odpowiedź Luny.', output: [{ type: 'message', content: [{ type: 'output_text', text: 'Odpowiedź Luny.' }] }] }),
      };
    },
  };
  try {
    const config = await getTutorConfig(options);
    const result = await createTutorHandler(options)({ messages: [{ role: 'user', content: 'Pomóż.' }] });
    expect(config).toEqual({ enabled: true, configured: true, provider: 'openai', model: 'gpt-6-luna', modelLabel: 'GPT-6 Luna' });
    expect(result.status).toBe(200);
    expect(requestedUrl).toBe('https://api.openai.com/v1/responses');
    expect(request.model).toBe('gpt-6-luna');
    expect(catalogQueried).toBe(false);
  } finally {
    if (previousProvider === undefined) delete process.env.TUTOR_PROVIDER;
    else process.env.TUTOR_PROVIDER = previousProvider;
  }
});
