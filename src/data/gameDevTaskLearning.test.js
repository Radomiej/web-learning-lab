import { describe, expect, it } from 'vitest';
import { allLessons } from './curriculum.js';
import { gameDevTaskLearning } from './gameDevTaskLearning.js';
import { taskLearningFor } from './taskLearning.js';
import manifest from '../../shared/lab-game-v2/course/manifest.json';

const taskIds = manifest.chapters.flatMap((chapter) => chapter.tasks.map((task) => task.id));
const entries = Object.entries(gameDevTaskLearning);

// Kinds PageDiagram (shared/lab-game-v2/editor/PageDiagram.jsx) can render, plus
// 'flow' (nodes + note) and 'array' handled directly in LessonPilot.
const supportedKinds = new Set([
  'flow', 'array', 'scene-map', 'sprint-distance', 'flee-range', 'chase-motion',
  'component-appearance', 'direction', 'combat-health', 'enemy-tactics',
  'floating-text', 'position', 'flip', 'motion', 'camera', 'contact', 'bars',
  'timeline', 'instances', 'pickup', 'projectile', 'layers', 'rectangle',
  'input', 'focus', 'ninepatch', 'spatial', 'run',
]);

describe('gameDevTaskLearning', () => {
  it('covers exactly the 72 tasks of the course manifest', () => {
    expect(taskIds).toHaveLength(72);
    expect(entries.map(([id]) => id).sort()).toEqual([...taskIds].sort());
    for (const id of taskIds) {
      expect(taskLearningFor(id), id).toBeTruthy();
    }
  });

  it('has non-empty theory and prediction fields plus a renderable visual', () => {
    for (const [id, entry] of entries) {
      for (const field of ['title', 'text', 'code', 'question', 'answer']) {
        expect(entry[field], `${id}.${field}`).toBeTruthy();
      }
      expect(entry.prediction.context, `${id}.prediction.context`).toBeTruthy();
      expect(entry.prediction.code, `${id}.prediction.code`).toBeTruthy();
      if (entry.board) {
        expect(['chase', 'coordinates', 'components', 'keypress', 'canvas', 'lifecycle', 'sprint', 'vector-race', 'events'], `${id} board.kind=${entry.board.kind}`).toContain(entry.board.kind);
      }
      expect(supportedKinds.has(entry.visual?.kind), `${id} visual.kind=${entry.visual?.kind}`).toBe(true);
      if (entry.visual.kind === 'flow') {
        expect(entry.visual.nodes?.length, `${id} flow nodes`).toBeGreaterThan(1);
      } else {
        expect(Number.isInteger(entry.visual.variant), `${id} visual.variant`).toBe(true);
      }
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
