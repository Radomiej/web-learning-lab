// Shared SSE framing for both the provider stream and the browser connection.
export async function readSSE(response, onEvent) {
  if (!response.body) throw new Error('Brak strumienia odpowiedzi.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '', event = 'message', data = [];
  const line = value => {
    if (!value) { if (data.length) onEvent({ event, data: data.join('\n') }); event = 'message'; data = []; return; }
    if (value.startsWith(':')) return;
    const colon = value.indexOf(':');
    const field = colon < 0 ? value : value.slice(0, colon);
    const content = colon < 0 ? '' : value.slice(colon + 1).replace(/^ /, '');
    if (field === 'event') event = content;
    if (field === 'data') data.push(content);
  };
  const feed = () => {
    let index;
    while ((index = buffer.indexOf('\n')) >= 0) {
      line(buffer.slice(0, index).replace(/\r$/, ''));
      buffer = buffer.slice(index + 1);
    }
  };
  try {
    while (true) { const part = await reader.read(); if (part.done) break; buffer += decoder.decode(part.value, { stream: true }); feed(); }
    buffer += decoder.decode(); feed();
    if (buffer) line(buffer.replace(/\r$/, ''));
    line('');
  } catch (error) { await reader.cancel().catch(() => {}); throw error; }
  finally { reader.releaseLock(); }
}

export async function readProviderCompletion(response, onEvent) {
  if (!response.headers?.get('content-type')?.includes('text/event-stream')) return response.json();
  let content = '', complete = false;
  const calls = new Map();
  await readSSE(response, ({ data }) => {
    if (data === '[DONE]') { complete = true; return; }
    const chunk = JSON.parse(data);
    if (chunk.error || chunk.choices?.[0]?.finish_reason === 'error') throw new Error('Dostawca przerwał odpowiedź.');
    const delta = chunk.choices?.[0]?.delta;
    if (!delta) return;
    if (delta.reasoning || delta.reasoning_details?.length) onEvent?.({ type: 'status', phase: 'thinking' });
    if (typeof delta.content === 'string' && delta.content) {
      content += delta.content;
      if (content.length > 150000) throw new Error('Odpowiedź jest zbyt duża.');
      onEvent?.({ type: 'delta', text: delta.content });
    }
    for (const part of delta.tool_calls ?? []) {
      onEvent?.({ type: 'status', phase: 'editing' });
      const index = part.index ?? 0;
      const call = calls.get(index) ?? { type: 'function', function: { name: '', arguments: '' } };
      if (part.id) call.id = part.id;
      call.function.name += part.function?.name ?? '';
      call.function.arguments += part.function?.arguments ?? '';
      if (calls.size > 10 || call.function.arguments.length > 150000) throw new Error('Propozycja jest zbyt duża.');
      calls.set(index, call);
    }
  });
  if (!complete) throw new Error('Strumień zakończył się przed ukończeniem odpowiedzi.');
  return { choices: [{ message: { content, ...(calls.size ? { tool_calls: [...calls.values()] } : {}) } }] };
}

export async function sendTutorStream(res, handler, payload, signal) {
  res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' });
  res.flushHeaders?.();
  const emit = event => { if (!res.destroyed && !res.writableEnded) res.write(`data: ${JSON.stringify(event)}\n\n`); };
  emit({ type: 'status', phase: 'connecting' });
  const heartbeat = setInterval(() => { if (!res.destroyed && !res.writableEnded) res.write(': waiting\n\n'); }, 10000);
  try {
    const result = await handler(payload, signal, emit);
    emit(result.status === 200 ? { type: 'done', ...result.body } : { type: 'error', message: result.body.message });
  } catch { emit({ type: 'error', message: 'Strumień odpowiedzi został przerwany.' }); }
  finally { clearInterval(heartbeat); if (!res.destroyed) res.end(); }
}

export async function readTutorStream(response, onEvent) {
  let answer;
  await readSSE(response, ({ data }) => {
    const event = JSON.parse(data);
    if (event.type === 'error') throw new Error(event.message || 'Odpowiedź została przerwana.');
    if (event.type === 'done') answer = { message: event.message, proposals: event.proposals ?? [] };
    else onEvent?.(event);
  });
  if (!answer) throw new Error('Odpowiedź nie została ukończona. Spróbuj ponownie.');
  return answer;
}
