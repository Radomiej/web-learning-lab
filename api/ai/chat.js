import { createTutorHandler } from '../../server/tutor.js';

const handleTutor = createTutorHandler();
let active = 0;
let count = 0;
let windowStart = Date.now();

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ message: 'Użyj metody POST.' });
  }
  if (request.headers?.origin) {
    let origin;
    try { origin = new URL(request.headers.origin).host; } catch { return response.status(403).json({ message: 'Niedozwolone źródło.' }); }
    if (origin !== request.headers.host) return response.status(403).json({ message: 'Niedozwolone źródło.' });
  }
  if (!request.headers?.['content-type']?.startsWith('application/json')) return response.status(415).json({ message: 'Wymagany JSON.' });
  if (Date.now() - windowStart >= 60000) { count = 0; windowStart = Date.now(); }
  if (active >= 2 || count >= 10) return response.status(429).json({ message: 'Zbyt wiele zapytań. Poczekaj chwilę.' });
  let body = request.body;
  try {
    if (typeof body === 'string') body = JSON.parse(body);
    if (Buffer.byteLength(JSON.stringify(body ?? {})) > 262144) return response.status(413).json({ message: 'Zapytanie jest zbyt duże.' });
  } catch { return response.status(400).json({ message: 'Nieprawidłowy JSON.' }); }
  active++; count++;
  try {
    const result = await handleTutor(body ?? {});
    return response.status(result.status).json(result.body);
  } finally { active--; }
}
