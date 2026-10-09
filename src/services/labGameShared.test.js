// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { SpatialHash } from '../../shared/lab-game-v2/spatialHash.js';
import { Assets, assetManifest } from '../../shared/lab-game-v2/assets/Assets.js';

describe('shared Lab engine building blocks', () => {
  it('finds boundary and negative-coordinate bodies once and updates teleports', () => {
    const index = new SpatialHash(64);
    index.insert(1, { left: -64, top: -64, right: 0, bottom: 0 });
    index.insert(2, { left: -1, top: -1, right: 65, bottom: 65 });
    expect(index.queryAabb({ left: 0, top: 0, right: 0, bottom: 0 })).toEqual([1, 2]);
    index.update(1, { left: 1000, top: 1000, right: 1010, bottom: 1010 });
    expect(index.queryAabb({ left: -64, top: -64, right: 0, bottom: 0 })).toEqual([2]);
    index.remove(2);
    expect(index.queryAabb({ left: -64, top: -64, right: 0, bottom: 0 })).toEqual([]);
  });

  it('handles huge bodies without allocating millions of cells', () => {
    const index = new SpatialHash(64);
    index.insert(1, { left: -1e9, top: -1e9, right: 1e9, bottom: 1e9 });
    index.insert(2, { left: 500, top: 500, right: 510, bottom: 510 });
    expect(index.queryAabb({ left: 0, top: 0, right: 1, bottom: 1 })).toEqual([1]);
    expect(index.cells.size).toBeLessThan(10);
    expect(index.queryAabb({ left: -1e9, top: -1e9, right: 1e9, bottom: 1e9 })).toEqual([1, 2]);
  });

  it('matches brute force on a deterministic dispersed scene', () => {
    const index = new SpatialHash(64);
    const bounds = Array.from({ length: 1000 }, (_, id) => ({ left: (id % 40) * 100 - 2000, top: Math.floor(id / 40) * 100 - 1200, right: (id % 40) * 100 - 1970, bottom: Math.floor(id / 40) * 100 - 1170 }));
    bounds.forEach((box, id) => index.insert(id, box));
    for (let n = 0; n < 100; n++) {
      const query = { left: n * 17 - 1500, top: n * 13 - 900, right: n * 17 - 1400, bottom: n * 13 - 800 };
      const oracle = bounds.flatMap((b, id) => b.left <= query.right && b.right >= query.left && b.top <= query.bottom && b.bottom >= query.top ? [id] : []);
      expect(index.queryAabb(query)).toEqual(oracle);
    }
  });

  it('exposes a frozen 100-sprite catalog with named keys and aliases', () => {
    expect(Object.isFrozen(Assets)).toBe(true);
    expect(Assets.PLAYER01).toBe('player');
    expect(Assets.FIREBALL).toBe('fireball');
    expect(Assets.WALL).toBe(Assets.STONE);
    expect(assetManifest.assets.length).toBeGreaterThanOrEqual(100);
    expect(new Set(assetManifest.assets.map(a => a.constant)).size).toBe(assetManifest.assets.length);
  });
});
