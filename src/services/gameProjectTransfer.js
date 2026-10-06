import { normalizeProject } from './projectFiles.js';

export const MAX_GAME_PROJECT_BYTES = 5 * 1024 * 1024;
const FORMAT = 'web-learning-lab-game-project';

export function serializeGameProject(project) {
  const normalized = normalizeProject(project);
  if (normalized.runtime?.kind !== 'game-js') throw new Error('Eksport wymaga projektu GameLab.');
  return JSON.stringify({ format: FORMAT, version: 1, project: normalized }, null, 2);
}

export function parseGameProject(text) {
  if (new TextEncoder().encode(text).length > MAX_GAME_PROJECT_BYTES) throw new Error('Projekt może mieć maksymalnie 5 MB.');
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Plik nie zawiera poprawnego JSON.'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Nieprawidłowy projekt.');
  if (data.format !== undefined && (data.format !== FORMAT || data.version !== 1)) throw new Error('Nieobsługiwany format lub wersja projektu.');
  const project = data.format === FORMAT ? data.project : data;
  if (!project?.files || typeof project.files !== 'object' || Array.isArray(project.files)) throw new Error('Projekt nie zawiera plików.');
  if (Object.keys(project.files).length > 200) throw new Error('Projekt może zawierać maksymalnie 200 plików.');
  const normalized = normalizeProject(project);
  if (normalized.runtime?.kind !== 'game-js') throw new Error('Zaimportuj projekt z silnikiem GameLab (game-js).');
  if (!Object.hasOwn(normalized.files, 'game.js')) throw new Error('Projekt musi zawierać game.js.');
  return normalized;
}
