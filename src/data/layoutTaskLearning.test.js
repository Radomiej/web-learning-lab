import { describe, expect, it } from 'vitest';
import { lessons } from './lessons.js';
import { layoutTaskLearning } from './layoutTaskLearning.js';
import { taskLearningFor } from './taskLearning.js';

const layoutTasks = lessons
  .filter((lesson) => lesson.track === 'layout')
  .flatMap((lesson) => lesson.tasks);
const taskIds = layoutTasks.map((task) => task.id);
const entries = Object.entries(layoutTaskLearning);

// Kinds rendered by the interactive layout boards (TheoryVisual in
// LessonPilot.jsx) — 'layout' visual is the PageDiagram fallback.
const supportedBoardKinds = new Set(['flex', 'flex-items', 'grid']);
const flexControls = new Set(['direction', 'justify', 'align', 'wrap', 'gap', 'gapSplit', 'alignContent', 'width']);
const itemControls = new Set(['basis', 'grow', 'shrink', 'order', 'alignSelf', 'minWidth', 'overflow']);
const itemContainerControls = new Set(['wrap', 'gap', 'width']);
const gridControls = new Set(['columns', 'rows', 'gap', 'areas', 'span', 'justify', 'width']);

describe('layoutTaskLearning', () => {
  it('covers exactly the 24 layout tasks', () => {
    expect(taskIds).toHaveLength(24);
    expect(taskIds.sort()).toEqual(
      Array.from({ length: 8 }, (_, i) => 301 + i)
        .flatMap((order) => [`layout-${order}-guided`, `layout-${order}-independent`, `layout-${order}-challenge`])
        .sort(),
    );
    expect(entries.map(([id]) => id).sort()).toEqual([...taskIds].sort());
    for (const id of taskIds) {
      expect(taskLearningFor(id), id).toBeTruthy();
    }
  });

  it('has non-empty theory and prediction fields plus an interactive board', () => {
    for (const [id, entry] of entries) {
      for (const field of ['title', 'text', 'code', 'question', 'trial', 'answer']) {
        expect(entry[field], `${id}.${field}`).toBeTruthy();
      }
      expect(entry.prediction.context, `${id}.prediction.context`).toBeTruthy();
      expect(entry.prediction.code, `${id}.prediction.code`).toBeTruthy();
      expect(supportedBoardKinds.has(entry.board?.kind), `${id} board.kind=${entry.board?.kind}`).toBe(true);
      expect(entry.board.props, `${id}.board.props`).toBeTruthy();
      expect(entry.visual?.kind, `${id}.visual.kind`).toBe('layout');
      expect(Number.isInteger(entry.visual?.variant), `${id}.visual.variant`).toBe(true);
      if (entry.prediction.options) {
        expect(entry.prediction.options.length, `${id}.prediction.options`).toBeGreaterThanOrEqual(2);
        expect(entry.prediction.options.filter((option) => option.correct), `${id} correct option`).toHaveLength(1);
      }
      if (entry.trace) {
        expect(entry.trace.steps?.length, `${id}.trace.steps`).toBeGreaterThan(1);
      }
    }
  });

  it('keeps board props inside the documented contract', () => {
    for (const [id, entry] of entries) {
      const { kind, props } = entry.board;
      if (kind === 'flex') {
        for (const control of props.controls ?? []) {
          expect(flexControls.has(control), `${id} flex control=${control}`).toBe(true);
        }
      }
      if (kind === 'flex-items') {
        expect(['all', 'each'], `${id}.scope`).toContain(props.scope ?? 'each');
        for (const control of props.controls ?? []) {
          expect(itemControls.has(control), `${id} item control=${control}`).toBe(true);
        }
        for (const control of props.containerControls ?? []) {
          expect(itemContainerControls.has(control), `${id} container control=${control}`).toBe(true);
        }
      }
      if (kind === 'grid') {
        for (const control of props.controls ?? []) {
          expect(gridControls.has(control), `${id} grid control=${control}`).toBe(true);
        }
        if ((props.controls ?? []).includes('areas')) {
          expect(props.areas?.length, `${id}.areas`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('anchors guided notes to the scenario each task actually checks', () => {
    // The first computedStyle property/value pair of each guided plan should
    // show up in the note's code sample, so theory and checks stay aligned.
    const guided = layoutTasks.filter((task) => task.id.endsWith('-guided'));
    for (const task of guided) {
      const styleChecks = task.checks.filter((check) => check.type === 'computedStyle');
      expect(styleChecks.length, `${task.id} computedStyle checks`).toBeGreaterThan(0);
      const code = layoutTaskLearning[task.id].code.replace(/\s+/g, ' ');
      for (const check of styleChecks) {
        expect(code, `${task.id} code ↔ ${check.property}: ${check.expected}`).toContain(`${check.property}:`);
        expect(code, `${task.id} code ↔ ${check.property}: ${check.expected}`).toContain(check.expected);
      }
    }
  });
});
