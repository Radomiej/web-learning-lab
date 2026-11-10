import { phpTaskLearning } from './phpTaskLearning.js';
import { htmlTaskLearning } from './htmlTaskLearning.js';
import { gameDevTaskLearning } from './gameDevTaskLearning.js';

// Pilot learning metadata per task id. Merge further track maps here as more
// lessons adopt the pilot layout — ids stay stable regardless of lesson order.
const taskLearning = { ...phpTaskLearning, ...htmlTaskLearning, ...gameDevTaskLearning };

export function taskLearningFor(taskId) {
  return taskLearning[taskId];
}
