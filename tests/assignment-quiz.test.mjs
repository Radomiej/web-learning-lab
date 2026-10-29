import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { generateAssignment, publicAssignment } from '../shared/assignments/generator.js';
import { generateLessonQuestions } from '../src/services/lessonQuestionGenerator.js';
import { javascriptLessonTemplates } from '../shared/assignments/lessonCatalog.js';
import { createAssignmentHandlers } from '../server/assignments/handlers.js';
import { issueToken } from '../server/telemetry/token.js';
// Run the sibling teacher-panel integration when that separate project is available.
let validateInTeacherPanel, quizReview;
try {
  ({validateSubmission:validateInTeacherPanel}=await import('../../lab-admin/shared/assignments/contract.js'));
  ({quizReview}=await import('../../lab-admin/src/quizReview.js'));
} catch(error) { if(error.code!=='ERR_MODULE_NOT_FOUND')throw error; }
import { courseQuizTemplates } from '../shared/assignments/courseQuizCatalog.js';

test('HTML, CSS, PHP and React quizzes reproduce every displayed question for all course lessons',()=>{
 for(const template of courseQuizTemplates){
  const assignment=generateAssignment({...descriptor,templateId:template.id,seed:'course-check'});
  const questions=generateLessonQuestions({id:template.lessonId,track:template.lessonId.split('-')[0]},{seed:'course-check'});
  const key=JSON.parse(assignment.referenceFiles['answer.json']).answers;
  assert.deepEqual(assignment.params.questions.map(question=>question.id),questions.map(question=>question.id));
  assert.deepEqual(Object.keys(key).sort(),questions.map(question=>question.id).sort());
  for(const question of questions){assert.equal(new Set(question.options.map(option=>option.text)).size,4);assert.equal(key[question.id],question.correctOptionId);}
  if(quizReview){const review=quizReview({assignment,files:assignment.referenceFiles});assert.equal(review.score,questions.length);assert.equal(review.total,questions.length);}
  assert.ok(!JSON.stringify(publicAssignment(assignment)).includes('correctOptionId'));
 }
});

const descriptor = { generatorVersion: '1', templateId: 'js-quiz-variables', seed: 'js-browser:1', difficulty: 'standard', index: 0 };
const jsLessonTemplate = javascriptLessonTemplates.find(template => template.topic === 'variables');
const jsLesson = { id: jsLessonTemplate.lessonId, track: 'js', order: jsLessonTemplate.order };
test('quiz and teacher key reconstruct the exact displayed questions without exposing reference files', () => {
  const assignment = generateAssignment(descriptor);
  const questions = generateLessonQuestions(jsLesson, { seed: descriptor.seed });
  const key = JSON.parse(assignment.referenceFiles['answer.json']).answers;
  assert.deepEqual(assignment.params.questions.map(question => question.id), questions.map(question => question.id));
  assert.deepEqual(Object.keys(key).sort(), questions.map(question => question.id).sort());
  for (const question of questions) assert.equal(key[question.id], question.correctOptionId);
  const exposed = JSON.stringify(publicAssignment(assignment));
  assert.ok(!exposed.includes('correctOptionId'));
  assert.ok(!exposed.includes('referenceFiles'));
});
test('submission API reconstructs the key and teacher panel accepts and grades its saved answers', async () => {
  const machineId = randomUUID(), sessionId = randomUUID(), submissionId = randomUUID();
  const env = { TELEMETRY_TOKEN_SECRET: 'x'.repeat(40), TELEMETRY_ALLOWED_ORIGINS: 'https://lab.test' };
  let published;
  const handlers = createAssignmentHandlers({ env, appId: 'www-lab', publish: async message => { published = message; } });
  const assignment = generateAssignment(descriptor);
  const questions = generateLessonQuestions(jsLesson, { seed: descriptor.seed });
  const answers = Object.fromEntries(questions.map(question => [question.id, question.correctOptionId]));
  const files = { 'answer.json': JSON.stringify({ lessonId: jsLesson.id, answers }) };
  let status;
  await handlers.submit({ method: 'POST', headers: { origin: 'https://lab.test', 'content-type': 'application/json', authorization: `Bearer ${issueToken({ machineId, sessionId }, env.TELEMETRY_TOKEN_SECRET, Date.now())}` }, body: { machineId, sessionId, eventId: submissionId, submissionId, studentId: 'TEST-QUIZ', studentName: '', sentAt: Date.now(), assignment: { ...descriptor, referenceFiles: { 'answer.json': 'fake' } }, files } }, { writeHead(code) { status = code; }, end() {} });
  assert.equal(status, 202);
  assert.deepEqual({...published.assignment.referenceFiles},assignment.referenceFiles);
  if(!validateInTeacherPanel||!quizReview)return;
  const accepted = validateInTeacherPanel(published);
  assert.equal(quizReview(accepted).score, questions.length);
  assert.equal(quizReview(accepted).total, questions.length);
  const changed = structuredClone(accepted);
  const answer = JSON.parse(changed.files['answer.json']);
  answer.answers[Object.keys(answer.answers)[0]] = 'invalid';
  changed.files['answer.json'] = JSON.stringify(answer);
  assert.equal(quizReview(changed).score, questions.length - 1);
  changed.files['answer.json'] = '{broken';
  assert.equal(quizReview(changed).invalid, true);
});
