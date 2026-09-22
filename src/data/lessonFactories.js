import { documentBundle } from './fullDocument.js';
import { normalizeProject } from '../services/projectFiles.js';

export const emptyFileBundle = () => ({
  html: '',
  baseCss: '',
  themeCss: '',
  js: '',
});

function cloneProject(project) {
  return { entry: project.entry, files: { ...project.files } };
}

function projectFrom(input, title, track = 'html') {
  if (input?.files) return cloneProject(normalizeProject(input, { track }));
  return normalizeProject(documentBundle({ ...emptyFileBundle(), ...(input ?? {}) }, title), { track });
}

export function createTask(input = {}) {
  const title = input.title || 'Ćwiczenie';
  const track = input.track || 'html';
  return {
    id: input.id ?? 'task',
    mode: input.mode ?? 'guided',
    title: input.title ?? 'Ćwiczenie',
    prompt: input.prompt ?? '',
    starter: projectFrom(input.starter, title, track),
    solution: projectFrom(input.solution, title, track),
    checks: input.checks ?? [],
    ...(input.hint ? { hint: input.hint } : {}),
  };
}

export function createLesson(input = {}) {
  const title = input.title || 'Lekcja';
  const track = input.track || 'html';
  const starter = projectFrom(input.starter, title, track);
  const solution = input.solution ? projectFrom(input.solution, title, track) : cloneProject(starter);

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
    tasks: (input.tasks ?? []).map((task) => createTask({ track, ...task })),
    requiredTags: input.requiredTags ?? [],
    requiredPractices: input.requiredPractices ?? [],
    requiredProperties: input.requiredProperties ?? [],
    requiredApis: input.requiredApis ?? [],
    runtime: input.runtime ?? 'browser',
    assets: input.assets ?? [],
  };
}
