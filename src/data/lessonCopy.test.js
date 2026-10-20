import { allLessons } from './curriculum.js';

test('lesson instructions refer to Play instead of the retired check button', () => {
  const retiredControl = /(?:kliknij|przycisk)\s+[„"]?Sprawdź/iu;
  for (const lesson of allLessons) {
    const theory = (lesson.theory ?? []).flatMap(block => typeof block === 'string' ? [block] : [block.title, block.text]);
    const texts = [lesson.summary, ...theory, ...(lesson.objectives ?? []), ...lesson.tasks.flatMap(task => [task.prompt, task.hint])];
    for (const text of texts.filter(Boolean)) {
      expect(text, `${lesson.id}: ${text}`).not.toMatch(retiredControl);
    }
  }
  const hints = allLessons.flatMap(lesson => lesson.tasks.map(task => task.hint ?? ''));
  expect(hints.some(hint => hint.includes('przycisk ▶ Play'))).toBe(true);
});
