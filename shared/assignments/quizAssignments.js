import { javascriptLessonTemplates } from './lessonCatalog.js';
import { courseQuizTemplates } from './courseQuizCatalog.js';
// Server only: reconstruct the exact quiz and its answer key for the teacher.
import { generateLessonQuestions } from '../../src/services/lessonQuestionGenerator.js';

export function generateQuizAssignment(descriptor) {
  const course = courseQuizTemplates.find(template => template.id === descriptor.templateId);
  if (!course && !descriptor.templateId.startsWith('js-quiz-')) return null;
  const topic = course?.topic || descriptor.templateId.slice('js-quiz-'.length);
  const jsLesson = course ? null : javascriptLessonTemplates.find(template => template.topic === topic);
  const lessonId = course?.lessonId || jsLesson?.lessonId;
  if (!lessonId) throw Error('Nieznany temat quizu.');
  const questions = generateLessonQuestions({ id: lessonId, track: course ? lessonId.split('-')[0] : 'js', ...(jsLesson ? { order: jsLesson.order } : {}) }, { seed: descriptor.seed });
  const publicQuestions = questions.map(({ correctOptionId, explanation, ...question }) => question);
  const answers = Object.fromEntries(questions.map(question => [question.id, question.correctOptionId]));
  return { ...descriptor, id: `quiz:${topic}:${descriptor.seed}:${descriptor.index}`, title: `Quiz: ${topic}`, prompt: 'Zaznacz jedną odpowiedź w każdym pytaniu. Oddaj odpowiedzi wraz z identyfikatorami pytań i opcji.', criteria: ['Każde pytanie ma jedną odpowiedź.', 'Porównaj odpowiedzi z kluczem odtworzonym dla tego samego seeda; nie ufaj wynikowi klienta.'], starterFiles: { 'answer.json': JSON.stringify({ lessonId, answers: {} }, null, 2) }, referenceFiles: { 'answer.json': JSON.stringify({ lessonId, answers }, null, 2) }, params: { lessonId, questions: publicQuestions } };
}
