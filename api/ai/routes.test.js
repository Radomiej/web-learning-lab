// @vitest-environment node
import config from './config.js';
import chat from './chat.js';
function response() { return { statusCode: 0, body: null, setHeader() {}, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } }; }
test('Vercel config reads the backend environment and never returns its key', async () => {
  const previous = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  try {
    const res = response();
    await config({ method: 'GET' }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ configured: false, models: [] });
  } finally { if (previous !== undefined) process.env.OPENROUTER_API_KEY = previous; }
});
test('Vercel endpoints reject wrong methods and cross-origin chat', async () => {
  const res = response(); await chat({ method: 'GET' }, res); expect(res.statusCode).toBe(405);
  const other = response(); await chat({ method: 'POST', headers: { origin: 'https://other.example', host: 'lab.example' } }, other); expect(other.statusCode).toBe(403);
});
