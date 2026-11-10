import { describe, expect, it } from 'vitest';
import { allLessons } from './curriculum.js';
import { gameDevTaskLearning } from './gameDevTaskLearning.js';

const pilotLessonIds = ['g2d.scene', 'g2d.input', 'g2d.collisions', 'g2d.enemy-ai', 'g2d.projectiles'];
const pilotLessons = allLessons.filter((lesson) => lesson.track === 'game-dev' && pilotLessonIds.includes(lesson.id));
const taskIds = pilotLessons.flatMap((lesson) => lesson.tasks.map((task) => task.id));
const entries = Object.entries(gameDevTaskLearning);

describe('gameDevTaskLearning', () => {
  it('covers exactly the 15 tasks of lessons g2d.scene–g2d.projectiles', () => {
    expect(taskIds).toHaveLength(15);
    expect(entries.map(([id]) => id).sort()).toEqual([...taskIds].sort());
  });

  it('has non-empty theory and prediction fields', () => {
    for (const [id, entry] of entries) {
      for (const field of ['title', 'text', 'code', 'question', 'answer']) {
        expect(entry[field], `${id}.${field}`).toBeTruthy();
      }
      expect(entry.prediction.context, `${id}.prediction.context`).toBeTruthy();
      expect(entry.prediction.code, `${id}.prediction.code`).toBeTruthy();
      expect(entry.visual?.kind, `${id}.visual.kind`).toBeTruthy();
    }
  });

  it('uses interactive boards for enemy-ai and the platform widget for scene.modified', () => {
    for (const id of ['g2d.enemy-ai.guided', 'g2d.enemy-ai.modified', 'g2d.enemy-ai.independent']) {
      expect(gameDevTaskLearning[id].board, `${id}.board`).toEqual(expect.objectContaining({ kind: 'chase' }));
    }
    expect(gameDevTaskLearning['g2d.scene.modified'].trialWidget).toBe('platform');
    expect(gameDevTaskLearning['g2d.enemy-ai.independent'].cheatsheet?.examples.length).toBeGreaterThan(1);
  });
});
