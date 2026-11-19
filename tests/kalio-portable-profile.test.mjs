import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { strFromU8, unzipSync } from 'fflate';
import { buildPlaygroundOrbit } from '../src/services/orbitPlayground.js';

const root = new URL('../', import.meta.url);
const json = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));

test('contract keeps the complete v2 core and labels Web-only helpers', async () => {
  const contract = await json('shared/lab-game-v2/contract.json');
  const types = new Map(contract.types.map(type => [type.name, type]));
  assert.equal(contract.engineApiVersion, '2.0.0');
  assert.equal(contract.compatibility.canonicalModel, 'Lab Game 2D v2');
  assert.equal(types.get('GameObject').scope, 'shared-core');
  assert.equal(types.get('Component').scope, 'shared-core');
  assert.equal(types.get('SpriteAnimator').scope, 'shared-core');
  assert.equal(types.get('ControlsHint').scope, 'web-host-extension');
  assert.equal(types.get('run').scope, 'web-host-extension');
});

test('kalio-portable/1 declares geometry, wave mappings, and deliberate gaps', async () => {
  const profile = await json('docs/kalio-portable-1.json');
  assert.equal(profile.profile, 'kalio-portable/1');
  assert.equal(profile.canonicalSourceApi, 'Lab Game 2D v2');
  assert.equal(profile.javaFollowOn.status, 'not-implemented');
  assert.equal(profile.javaFollowOn.plannedRuntime, 'teavm-wasm');
  assert.equal(profile.javaFollowOn.plannedAdapter, 'lab-game-wasm/1');
  assert.equal(profile.semantics.drawing.rect, 'GameLab center x/y to LRP top-left x-width/2,y-height/2');
  assert.deepEqual(profile.capabilities.drawOperations, ['clear', 'rect', 'circle', 'text', 'sprite', 'progress', 'ninepatch']);
  assert.match(profile.capabilities.metadataOperations.tilemap, /expands each visible tile into an ordered sprite command/);
  assert.match(profile.semantics.frameTime.hostBehavior, /clamps finite dt to \[0, 0\.1\]/);
  assert.equal(profile.semantics.audio.waveIndex.triangle, 2);
  assert.ok(profile.notProvided.includes('Java TeaVM/Wasm execution by QuickJS LRP'));
  assert.ok(profile.fixtures.some(fixture => fixture.id === 'K06'));
});

test('Orbit export rejects unsupported render ops and out-of-profile dt', async () => {
  const packageBytes = await buildPlaygroundOrbit({ files: { 'game.js': `
    class BadGame extends GameLab.Game {
      onDrawUI() { this.canvas.commands.push({ op: 'future-op' }); }
    }
    GameLab.run(BadGame);
  ` } }, 'web-lab-fail-closed');
  const files = unzipSync(packageBytes);
  const context = vm.createContext({ lab: new Proxy({}, {
    get: (_target, key) => key === 'isKeyDown' ? () => false : () => {},
  }) });
  vm.runInContext(strFromU8(files['main.js']) + '\ninit();', context);
  assert.throws(() => vm.runInContext('update(1 / 60);', context), /unsupported render operation "future-op"/);
  assert.throws(() => vm.runInContext('update(0.101);', context), /finite seconds in \[0, 0.1\]/);
});
