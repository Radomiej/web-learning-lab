import { phpTaskLearning } from './phpTaskLearning.js';
import { htmlTaskLearning } from './htmlTaskLearning.js';
import { htmlGdTaskLearning } from './htmlGdTaskLearning.js';
import { gameDevTaskLearning } from './gameDevTaskLearning.js';
import { layoutTaskLearning } from './layoutTaskLearning.js';

// Pilot learning metadata per task id. Merge further track maps here as more
// lessons adopt the pilot layout — ids stay stable regardless of lesson order.
const taskLearning = { ...phpTaskLearning, ...htmlTaskLearning, ...htmlGdTaskLearning, ...gameDevTaskLearning, ...layoutTaskLearning };

export function taskLearningFor(taskId) {
  return taskLearning[taskId];
}
