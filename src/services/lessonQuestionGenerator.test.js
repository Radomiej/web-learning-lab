// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { generateLessonQuestions, gradeLessonQuestion } from './lessonQuestionGenerator.js';

describe('lesson question generator', () => {
  it('reproduces a variant and produces different variants for another seed', () => {
    const lesson = { id: 'js-variables', track: 'js', order: 401 };
    expect(generateLessonQuestions(lesson, { seed: 'class-a' })).toEqual(generateLessonQuestions(lesson, { seed: 'class-a' }));
    expect(generateLessonQuestions(lesson, { seed: 'class-a' })).not.toEqual(generateLessonQuestions(lesson, { seed: 'class-b' }));
  });
  it('teaches one foundation at a time without requiring the DOM early', () => {
    for (const [index, topic] of ['variables', 'objects', 'functions', 'dom'].entries()) {
      const questions = generateLessonQuestions({ track: 'js', order: 401 + index }, { count: 3 });
      expect(questions).toHaveLength(3);
      expect(new Set(questions.map(question => question.id)).size).toBe(3);
      expect(questions.every(question => question.topic === topic)).toBe(true);
      if (index < 3) expect(JSON.stringify(questions)).not.toMatch(/document\.|querySelector|getElementById/);
      for (const question of questions) {
        expect(question.options).toHaveLength(4);
        expect(new Set(question.options.map(option => option.text)).size).toBe(4);
        expect(question.explanation.length).toBeGreaterThan(30);
      }
    }
  });
  it('grades stable option IDs even after the options are reordered', () => {
    const [question] = generateLessonQuestions({ track: 'js', order: 403 });
    const reordered = { ...question, options: [...question.options].reverse() };
    expect(gradeLessonQuestion(reordered, question.correctOptionId)).toEqual({ correct: true, explanation: question.explanation });
    expect(gradeLessonQuestion(question, question.options.find(option => option.id !== question.correctOptionId).id).correct).toBe(false);
    expect(gradeLessonQuestion(question, '__invalid__').correct).toBe(false);
  });
  it('uses stable topic metadata for later lessons rather than their new order', () => {
    expect(generateLessonQuestions({ id: 'js-events-forms', track: 'js', order: 408 })[0].topic).toBe('events');
    expect(generateLessonQuestions({ track: 'js', order: 499 }, { topic: 'objects' })[0].topic).toBe('objects');
  });
  it('rejects unsupported lessons and invalid counts instead of testing another topic', () => {
    expect(() => generateLessonQuestions({ track: 'html', order: 101 })).toThrow();
    expect(() => generateLessonQuestions({ track: 'js', order: 499 })).toThrow();
    for (const count of [0, -1, 1.5, 4]) expect(() => generateLessonQuestions({ track: 'js', order: 401 }, { count })).toThrow();
  });
});


it('keeps every course topic usable over many reproducible variants', () => {
  for (let order = 401; order <= 414; order++) {
    for (let seed = 0; seed < 20; seed++) {
      const questions = generateLessonQuestions({ track: 'js', order }, { seed });
      expect(new Set(questions.map(question => question.prompt)).size).toBe(3);
      for (const question of questions) {
        expect(question.options.filter(option => option.id === question.correctOptionId)).toHaveLength(1);
        expect(new Set(question.options.map(option => option.text)).size).toBe(4);
        expect(gradeLessonQuestion(question, null).correct).toBe(false);
      }
    }
  }
});
