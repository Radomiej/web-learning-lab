import { listFreeOpenRouterModels } from '../../server/freeModels.js';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ message: 'Użyj metody GET.' });
  }
  try { return response.status(200).json(await listFreeOpenRouterModels()); }
  catch { return response.status(502).json({ message: 'Nie udało się pobrać katalogu darmowych modeli. Spróbuj ponownie.' }); }
}
