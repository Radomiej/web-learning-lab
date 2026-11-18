import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import vm from 'node:vm';
import { strFromU8, unzipSync } from 'fflate';
import { buildPlaygroundOrbit } from '../src/services/orbitPlayground.js';

test('Orbit package keeps the student scene, D-pad, canvas operations and synthesizer calls', async () => {
  const source = `
    import { speed } from './movement.js';
    class StudentGame extends GameLab.Game {
      onCreate() {
        this.x = 32;
        this.audio.playNote('A4', { wave: 'sine', beats: 0.5 });
        this.audio.playSong({ tempo: 120, tracks: [{ wave: 'triangle', notes: [{ note: 'A4', beats: 1 }] }] });
      }
      onUpdate() { if (this.input.isKeyDown('ArrowRight')) this.x += speed; }
      onDrawUI() { this.canvas.drawRect(this.x, 60, 24, 22, '#ffd166'); }
    }
    GameLab.run(StudentGame);
  `;
  const files = unzipSync(await buildPlaygroundOrbit({
    files: { 'game.js': source, 'movement.js': 'export const speed = 3;' },
  }, 'web-lab-test'));
  const manifest = JSON.parse(strFromU8(files['orbit.json']));
  assert.equal(manifest.files[0].sha256, createHash('sha256').update(files['main.js']).digest('hex'));
  const tones = [], tracks = [], translations = [];
  let right = false;
  const ignore = () => {};
  const context = vm.createContext({ lab: {
    isKeyDown: button => button === 'right' && right,
    clear: ignore, drawRect: ignore, save: ignore, restore: ignore,
    translate: (...point) => translations.push(point),
    beep: (...tone) => tones.push(tone), music: song => tracks.push(song), stopMusic: ignore,
  } });
  vm.runInContext(strFromU8(files['main.js']) + '\ninit(); update(1 / 60);', context);
  right = true;
  vm.runInContext('update(1 / 60);', context);
  assert.deepEqual(tones, [[440, 250, 0.6, 1]]);
  assert.equal(tracks[0].tracks[0].notes[0][0], 440);
  assert.deepEqual(translations.at(-1), [35, 60]);
});
