// @vitest-environment node
import { listFreeOpenRouterModels } from './freeModels.js';
test('copies the database policy: all published price fields must be zero', async () => {
  const fetchImpl = async () => ({ ok: true, json: async () => ({ data: [
    { id: 'free', name: 'Free', pricing: { prompt: '0', completion: '0.000', request: 0 } },
    { id: 'paid', pricing: { prompt: '0', completion: '0.001' } },
    { id: 'hidden-charge', pricing: { prompt: '0', completion: '0', request: '1' } },
    { id: 'unknown', pricing: { prompt: '0', completion: '0', image: null } },
  ] }) });
  expect(await listFreeOpenRouterModels(fetchImpl, 'key')).toEqual({ configured: true, models: [{ id: 'free', name: 'Free' }] });
  expect(await listFreeOpenRouterModels(fetchImpl, '')).toEqual({ configured: false, models: [] });
});

test('excludes moderation models and non-text generation but retains configurable free router', async () => {
  const pricing = { prompt: '0', completion: '0' };
  const fetchImpl = async () => ({ ok: true, json: async () => ({ data: [
    { id: 'nvidia/nemotron-3.5-content-safety:free', pricing },
    { id: 'meta/llama-guard:free', pricing },
    { id: 'openrouter/free', pricing },
    { id: 'music/free', pricing, architecture: { output_modalities: ['audio'] } },
    { id: 'nvidia/nemotron-3-super:free', pricing, architecture: { output_modalities: ['text'] } },
  ] }) });
  expect((await listFreeOpenRouterModels(fetchImpl, 'key')).models.map(m => m.id)).toEqual(['nvidia/nemotron-3-super:free']);
});
