// Only explicitly zero-priced conversational models; moderation and media models cannot tutor.
export function isTutorModel(item) {
  if (item.id === 'openrouter/free') return false;
  if (/(?:content[- _]?safety|safety[- _]?guard|nemoguard|llama[- _]?guard|moderation|guardian|embed|rerank)/i.test(item.id + ' ' + (item.name || ''))) return false;
  const output = item.architecture?.output_modalities;
  return !Array.isArray(output) || (output.includes('text') && output.every(value => value === 'text'));
}
export async function listFreeOpenRouterModels(fetchImpl = fetch, apiKey = process.env.OPENROUTER_API_KEY, signal) {
  if (!apiKey?.trim()) return { configured: false, models: [] };
  const response = await fetchImpl('https://openrouter.ai/api/v1/models', { method: 'GET', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Nie udało się pobrać katalogu darmowych modeli.');
  const data = await response.json();
  if (!Array.isArray(data.data)) throw new Error('Nieprawidłowy katalog modeli.');
  const zero = price => price === 0 || (typeof price === 'string' && /^0(?:\.0+)?$/.test(price));
  return { configured: true, models: data.data.filter(item => item && typeof item.id === 'string' && item.id.length <= 160 && isTutorModel(item) && item.pricing && zero(item.pricing.prompt) && zero(item.pricing.completion) && Object.values(item.pricing).every(zero)).map(item => ({ id: item.id, name: typeof item.name === 'string' && item.name.trim() ? item.name.slice(0, 160) : item.id })).sort((a, b) => a.name.localeCompare(b.name)) };
}
