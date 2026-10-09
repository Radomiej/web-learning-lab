import { readTutorStream } from '../../shared/lab-game-v2/tutorStream.js';
async function request(path, options, onEvent) {
  let response;
  try { response = await fetch(path, options); } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Backend pomocy AI jest niedostępny. Uruchom npm run dev:server.');
  }
  if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) return readTutorStream(response, onEvent);
  let data;
  try { data = await response.json(); } catch { throw new Error('Backend zwrócił nieczytelną odpowiedź.'); }
  if (!response.ok) throw new Error(data.message || 'Nie udało się uzyskać odpowiedzi.');
  return data;
}
export const loadTutorConfig = () => request('/api/ai/config');
export const sendTutorMessage = (payload, { signal, onEvent } = {}) => request('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, stream: true }), signal }, onEvent);
