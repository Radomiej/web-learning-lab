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
    starter: input.starter ?? emptyFileBundle(),
    solution: input.solution ?? emptyFileBundle(),
    checks: input.checks ?? [],
    ...(input.hint ? { hint: input.hint } : {}),
  };
}

export function createLesson(input = {}) {
  const starter = { ...emptyFileBundle(), ...(input.starter ?? {}) };
  const solution = { ...starter, ...(input.solution ?? {}) };

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
  };
}
