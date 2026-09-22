import { documentBundle } from './fullDocument.js';

export const emptyFileBundle = () => ({
  html: '',
  baseCss: '',
  themeCss: '',
  js: '',
});

export function createTask(input = {}) {
  return {
    id: input.id ?? 'task',
    mode: input.mode ?? 'guided',
    title: input.title ?? 'Ćwiczenie',
    prompt: input.prompt ?? '',
    starter: documentBundle(input.starter ?? emptyFileBundle(), input.title || 'Ćwiczenie'),
    solution: documentBundle(input.solution ?? emptyFileBundle(), input.title || 'Ćwiczenie'),
    checks: input.checks ?? [],
    ...(input.hint ? { hint: input.hint } : {}),
  };
}

export function createLesson(input = {}) {
  const starter = documentBundle({ ...emptyFileBundle(), ...(input.starter ?? {}) }, input.title || 'Lekcja');
  const solution = documentBundle({ ...starter, ...(input.solution ?? {}) }, input.title || 'Lekcja');

  return {
    id: input.id ?? 'lesson',
    track: input.track ?? 'html',
    order: input.order ?? 0,
    title: input.title ?? 'Lekcja',
    summary: input.summary ?? '',
    objectives: input.objectives ?? [],
    theory: input.theory ?? [],
    starter,
    solution,
    tasks: (input.tasks ?? []).map(createTask),
    requiredTags: input.requiredTags ?? [],
    requiredPractices: input.requiredPractices ?? [],
    requiredProperties: input.requiredProperties ?? [],
    requiredApis: input.requiredApis ?? [],
    runtime: input.runtime ?? 'browser',
    assets: input.assets ?? [],
  };
}
