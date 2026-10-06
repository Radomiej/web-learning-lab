export const workHistoryKey = 'web-learning-lab.work-history.v1';
export function recordWorkEvent(event, storage = localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(workHistoryKey) || '[]');
    const history = Array.isArray(parsed) ? parsed : [];
    history.push({ ...event, version: 1, timestamp: new Date().toISOString() });
    storage.setItem(workHistoryKey, JSON.stringify(history.slice(-1000)));
    return true;
  } catch { return false; }
}
