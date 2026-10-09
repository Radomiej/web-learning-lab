// @vitest-environment node
import { it, expect } from 'vitest';
import { createRenderer } from '../../shared/lab-game-v2/renderer.js';
import { assetManifest } from '../../shared/lab-game-v2/assets/Assets.js';

it('nine-patch preserves fixed destination corners as the center stretches', async () => {
  const renderer = createRenderer(assetManifest);
  class Image { set src(value) { this.url = value; this.onload(); } }
  await renderer.load({ Image }); const calls = [];
  const ctx = { drawImage: (...args) => calls.push(args) };
  renderer.drawNinePatch(ctx, { texture: 'ui-button-blue', x: 200, y: 100, width: 300, height: 50, border: 8 });
  expect(calls).toHaveLength(9);
  expect(calls[0].slice(-2)).toEqual([8, 8]);
  expect(calls[4].slice(-2)).toEqual([284, 34]);
  expect(calls[8].slice(-2)).toEqual([8, 8]);
});

it('progress clips the fill at 50 percent instead of scaling the frame', async () => {
  const renderer = createRenderer(assetManifest);
  class Image { set src(value) { this.url = value; this.onload(); } }
  await renderer.load({ Image }); const calls = [];
  const ctx = { save() {}, restore() {}, translate() {}, rotate() {}, scale() {}, drawImage: (...args) => calls.push(args) };
  renderer.drawProgress(ctx, { x: 100, y: 20, width: 200, height: 20, progress: 50, frame: 'ui-bar-health-frame', track: 'ui-bar-health-track', fill: 'ui-bar-health-fill' });
  expect(calls).toHaveLength(11);
  expect(calls[1][7]).toBeCloseTo(calls[0][7] / 2);
  expect(calls[1][3]).toBeCloseTo(renderer.entries.get('ui-bar-health-fill').frame.w / 2);
});
