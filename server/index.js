import { createServer } from 'node:http';
import { createTutorHandler } from './tutor.js';
import { listFreeOpenRouterModels } from './freeModels.js';

const handler = createTutorHandler();
const requests = new Map();
let active = 0;
function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}
export const server = createServer(async (req, res) => {
  if (!['127.0.0.1:5183', 'localhost:5183'].includes(req.headers.host) || (req.headers.origin && !['http://localhost:5181', 'http://127.0.0.1:5181'].includes(req.headers.origin))) return send(res, 403, { message: 'Niedozwolone źródło zapytania.' });
  if (req.url === '/api/ai/config' && req.method === 'GET') {
    try { return send(res, 200, await listFreeOpenRouterModels()); }
    catch { return send(res, 502, { message: 'Nie udało się pobrać listy darmowych modeli. Spróbuj ponownie.' }); }
  }
  if (req.url !== '/api/ai/chat' || req.method !== 'POST') return send(res, 404, { message: 'Nie znaleziono endpointu.' });
  if (!req.headers['content-type']?.startsWith('application/json')) return send(res, 415, { message: 'Wymagany JSON.' });
  const address = req.socket.remoteAddress;
  const now = Date.now();
  const recent = (requests.get(address) || []).filter(t => now - t < 60000);
  if (recent.length >= 10 || active >= 2) return send(res, 429, { message: 'Zbyt wiele zapytań. Poczekaj chwilę.' });
  requests.set(address, [...recent, now]);
  active++;
  const controller = new AbortController();
  res.on('close', () => { if (!res.writableEnded) controller.abort(); });
  try {
    const chunks = []; let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 262144) { send(res, 413, { message: 'Zapytanie jest zbyt duże.' }); req.resume(); return; }
      chunks.push(chunk);
    }
    let payload;
    try { payload = JSON.parse(Buffer.concat(chunks).toString()); } catch { return send(res, 400, { message: 'Nieprawidłowy JSON.' }); }
    const result = await handler(payload, controller.signal);
    if (!res.destroyed) send(res, result.status, result.body);
  } catch {
    if (!res.destroyed && !res.headersSent) send(res, 400, { message: 'Nie udało się odczytać zapytania.' });
  } finally { active--; }
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? 'Port tutora 5183 jest zajęty. Zamknij poprzedni serwer tej aplikacji.' : 'Nie udało się uruchomić backendu.'); process.exitCode = 1; });
server.listen(5183, '127.0.0.1', () => console.log('Tutor backend: http://127.0.0.1:5183'));
