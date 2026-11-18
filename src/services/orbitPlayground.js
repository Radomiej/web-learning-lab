import { strToU8, strFromU8, unzipSync, zipSync } from 'fflate';
import { getGameRuntimeScript } from './gameRuntime.js';
import { assetManifest } from '../../shared/lab-game-v2/assets/Assets.js';

// The Web Lab engine still runs the scene and physics. Orbit draws its
// recorded commands and supplies frame time and controller input.
function orbitEnvironment(assetManifest) {
  const noop = () => {};
  const listeners = {};
  const canvas = {
    getContext: () => new Proxy({}, { get: () => noop }),
    addEventListener: (type, fn) => { listeners[type] = fn; },
    removeEventListener: noop,
  };
  let tick;
  const window = {
    document: { querySelector: selector => selector === '#game' ? canvas : null },
    addEventListener: noop,
    removeEventListener: noop,
    requestAnimationFrame: fn => { tick = fn; return 1; },
    cancelAnimationFrame: () => { tick = null; },
    ErrorEvent: class { constructor(type, details) { this.error = details.error; } },
    dispatchEvent: event => { throw event.error; },
  };
  const keys = {
    left: ['ArrowLeft', 'a'], right: ['ArrowRight', 'd'],
    up: ['ArrowUp', 'w'], down: ['ArrowDown', 's'],
    a: [' ', 'Enter', 'z'], b: ['Escape', 'x'], x: ['c'], y: ['v'], select: ['Tab'],
  };
  const held = {};
  let clock = 0;
  function createAudio(kit) {
    function wave(value) { return ({ square: 0, sine: 1, triangle: 2, noise: 3, sawtooth: 4 })[value] ?? 0; }
    function playNote(note, { wave: shape = 'square', beats = 1, tempo = 120, volume = 0.6 } = {}) {
      const midi = kit.parseNote(note);
      if (midi !== null) lab.beep(kit.midiToHz(midi), beats * 60000 / tempo, volume, wave(shape));
    }
    function playSong(song, { loop = false, volume = 0.6 } = {}) {
      const data = kit.normalizeSong(song);
      const bpm = Math.max(60, Math.min(300, data.tempo));
      const beatScale = bpm / data.tempo;
      const duration = track => track.notes.reduce((sum, step) => sum + step.beats, 0);
      const length = data.tracks.reduce((longest, track) => Math.max(longest, duration(track)), 0);
      const tracks = data.tracks.slice(0, 4).map(track => {
        const notes = track.notes.map(step => [step.midi === null ? 0 : kit.midiToHz(step.midi), step.beats]);
        // Orbit loops each track separately. Pad to Web Lab's common loop period.
        for (let remaining = length - duration(track); loop && remaining > 0.001; remaining -= 16) {
          notes.push([0, Math.min(remaining, 16)]);
        }
        return { wave: wave(track.wave), vol: volume, notes: notes.map(([hz, beats]) => [hz, beats * beatScale]) };
      });
      if (tracks.length) lab.music({ bpm, loop, tracks }); else lab.stopMusic();
    }
    const stop = () => lab.stopMusic();
    return { playNote, playSong, play: playSong, stop, dispose: stop, resume: noop, bindGestures: noop };
  }
  function color(value) { return /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value || '') ? value : '#ffffff'; }
  function transformed(x, y, rotation, sx, sy, draw) {
    lab.save();
    try {
      lab.translate(x, y);
      if (rotation) lab.rotate(rotation);
      if (sx !== 1 || sy !== 1) lab.scale(sx, sy);
      draw();
    } finally { lab.restore(); }
  }
  const atlas = new Map(assetManifest.assets.map(entry => [entry.key, entry]));
  function atlasKey(name) { return ({ wall: 'stone', projectile: 'fireball', player01: 'player' })[name] || name; }
  function spriteName(texture) {
    const name = atlasKey(texture);
    return lab.asset('weblab-' + name) ? 'weblab-' + name : lab.asset(name) ? name : null;
  }
  function ninePatch(texture, x, y, w, h, inset) {
    const key = atlasKey(texture);
    const name = spriteName(key);
    const entry = atlas.get(key);
    if (name !== 'weblab-' + key || !entry || typeof lab.drawSpriteRegion !== 'function') {
      lab.drawRect(x - w / 2, y - h / 2, w, h, '#172c45');
      return;
    }
    const { frame: f, ninePatch: slice = { left: 12, top: 12, right: 12, bottom: 12 } } = entry;
    const border = Math.max(0, Math.min(inset ?? 8, w / 2, h / 2));
    const sx = [0, slice.left, f.w - slice.right, f.w];
    const sy = [0, slice.top, f.h - slice.bottom, f.h];
    const dx = [x - w / 2, x - w / 2 + border, x + w / 2 - border, x + w / 2];
    const dy = [y - h / 2, y - h / 2 + border, y + h / 2 - border, y + h / 2];
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
      lab.drawSpriteRegion(name, sx[col], sy[row], sx[col + 1] - sx[col], sy[row + 1] - sy[row],
        dx[col], dy[row], dx[col + 1] - dx[col], dy[row + 1] - dy[row]);
    }
  }
  function progressBar(command, x, y, w, h) {
    const ratio = Math.max(0, Math.min(1, command.progress / 100));
    const key = atlasKey(command.frame);
    const frame = atlas.get(key);
    const track = spriteName(command.track);
    const fill = spriteName(command.fill);
    if (frame && track && fill && typeof lab.drawSpriteRegion === 'function') {
      const inset = frame.barInset || { left: .17, top: .24, right: .17, bottom: .26 };
      const iw = w * (1 - inset.left - inset.right), ih = h * (1 - inset.top - inset.bottom);
      const left = x - w / 2 + w * inset.left, top = y - h / 2 + h * inset.top;
      lab.drawSpriteEx(track, left, top, iw, ih);
      const shape = lab.asset(fill);
      if (ratio) lab.drawSpriteRegion(fill, 0, 0, shape.w * ratio, shape.h, left, top, iw * ratio, ih);
      ninePatch(command.frame, x, y, w, h, Math.min(10, h / 3));
      return;
    }
    lab.drawRect(x - w / 2, y - h / 2, w, h, '#172c45');
    if (ratio) lab.drawRect(x - w / 2, y - h / 2, w * ratio, h, '#76b9f2');
  }
  function draw(command) {
    const x = command.screenX ?? command.x;
    const y = command.screenY ?? command.y;
    const w = command.width * Math.abs(command.scaleX ?? 1);
    const h = command.height * Math.abs(command.scaleY ?? 1);
    switch (command.op) {
      case 'clear': lab.clear(color(command.color)); break;
      case 'rect':
        if (w > 0 && h > 0) transformed(x, y, command.rotation, 1, 1,
          () => lab.drawRect(-w / 2, -h / 2, w, h, color(command.color)));
        break;
      case 'circle':
        if (command.radius > 0) transformed(x, y, command.rotation, command.scaleX ?? 1, command.scaleY ?? 1,
          () => lab.drawCircle(0, 0, command.radius, color(command.color)));
        break;
      case 'text': {
        const size = command.fontSize || 16;
        const width = lab.measureText(command.text, size).w;
        const offset = command.align === 'center' ? width / 2 : command.align === 'right' ? width : 0;
        lab.drawText(x - offset, y - size / 2, command.text, color(command.color), size);
        break;
      }
      case 'sprite':
        if (w > 0 && h > 0) {
          const name = spriteName(command.texture);
          if (name) {
            lab.drawSpriteEx(name, x - w / 2, y - h / 2, w, h, {
              flipX: command.scaleX < 0, flipY: command.scaleY < 0,
              rot: (command.rotation || 0) * 180 / Math.PI,
            });
          } else lab.drawRect(x - w / 2, y - h / 2, w, h, '#76b9f2');
        }
        break;
      case 'progress':
        if (w > 0 && h > 0) progressBar(command, x, y, w, h);
        break;
      case 'ninepatch':
        if (w > 0 && h > 0) ninePatch(command.texture, x, y, w, h, command.border);
        break;
    }
  }
  function update(dt) {
    for (const [button, aliases] of Object.entries(keys)) {
      const down = lab.isKeyDown(button);
      if (down === !!held[button]) continue;
      held[button] = down;
      for (const key of aliases) listeners[down ? 'keydown' : 'keyup']?.({ key, preventDefault: noop });
    }
    clock += dt * 1000;
    tick?.(clock);
    for (const command of window.GameLab.current?.canvas.commands ?? []) draw(command);
  }
  return { window, update, createAudio };
}

export async function buildPlaygroundOrbit(project, id) {
  const game = project?.files?.['game.js'];
  if (typeof game !== 'string' || !game.trim()) throw new Error('Projekt musi zawierać game.js.');
  if (!/^web-lab-[a-z0-9-]{1,38}$/.test(id)) throw new Error('Nieprawidłowy identyfikator projektu.');
  if (/^\s*(?:import\s|export\s)/m.test(game)) throw new Error('Eksport Orbit wymaga sceny w jednym pliku game.js bez importów.');
  const runtime = getGameRuntimeScript('{window,skipAssetLoading:true,recordTiles:true,createAudio:orbitPlayground.createAudio}');
  const source = [
    'var orbitPlayground = (' + orbitEnvironment.toString() + ')(' + JSON.stringify(assetManifest) + ');',
    'function init() {',
    'const window = orbitPlayground.window;',
    runtime,
    'const GameLab = window.GameLab;',
    game,
    'if (!GameLab.current) throw new Error("Uruchom scenę przez GameLab.run.");',
    '}',
    'function update(dt) { orbitPlayground.update(dt); }',
  ].join('\n');
  const bytes = strToU8(source);
  if (bytes.length > 8 * 1024 * 1024) throw new Error('Gra przekracza limit 8 MiB.');
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const sha256 = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
  const manifest = {
    format: 'orbit-game', formatVersion: 0, id, name: 'Moja gra z Web Lab',
    version: '0.1.' + Date.now(), runtime: 'quickjs-lrp', apiVersion: 'game-lab-lrp/1',
    entrypoint: 'main.js', orientation: 'landscape', kind: 'game', signature: null,
    files: [{ path: 'main.js', size: bytes.length, sha256 }],
  };
  return zipSync({ 'orbit.json': strToU8(JSON.stringify(manifest)), 'main.js': bytes });
}

export async function runPlaygroundOnLan(address, pairCode, archive) {
  const match = /^(?:http:\/\/)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::8080)?\/?$/.exec(address.trim());
  const [a, b, ...rest] = match ? match[1].split('.').map(Number) : [];
  if (!match || [a, b, ...rest].some(value => value > 255) ||
      !(a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31))) {
    throw new Error('Wpisz lokalny adres IPv4 z ekranu Dev Server, z portem 8080.');
  }
  const code = pairCode.trim().toUpperCase();
  if (!/^[A-Z0-9]{5}$/.test(code)) throw new Error('Wpisz pięcioznakowy kod parowania LAN.');
  const base = `http://${[a, b, ...rest].join('.')}:8080`;
  const files = unzipSync(archive);
  const manifest = JSON.parse(strFromU8(files['orbit.json']));
  async function request(path, method, body, type, authenticated = true) {
    const headers = {};
    if (authenticated) headers['X-Orbit-Pair-Code'] = code;
    if (type) headers['Content-Type'] = type;
    let response;
    try {
      response = await fetch(base + path, {
        method, headers, body, credentials: 'omit', redirect: 'error',
        signal: AbortSignal.timeout(12000),
      });
    } catch {
      throw new Error('Brak dostępu do konsoli. Sprawdź Wi‑Fi i zezwolenie przeglądarki na sieć lokalną albo użyj paczki .orbit w Nekko.');
    }
    const result = await response.json().catch(() => ({}));
    if (response.status === 403) throw new Error('Konsola odrzuciła kod parowania.');
    if (!response.ok || result.ok === false) throw new Error(result.error || `Konsola zwróciła HTTP ${response.status}.`);
    return result;
  }
  const status = await request('/api/status', 'GET', undefined, undefined, false);
  if (!status.capabilities?.includes('package-deploy')) throw new Error('Zaktualizuj launcher Orbit przed instalacją.');
  if (!status.capabilities.includes('weblab-atlas')) throw new Error('Projekt Web Lab wymaga Orbit 0.3.33 lub nowszego.');
  const identity = await request('/api/pair?code=' + encodeURIComponent(code), 'GET', undefined, undefined, false);
  if (!status.deviceId || identity.deviceId !== status.deviceId) throw new Error('Nie udało się potwierdzić kodu i tożsamości konsoli.');
  const { uploadId } = await request('/api/deploy', 'POST', JSON.stringify({ id: manifest.id, mode: 'replace' }), 'application/json');
  if (typeof uploadId !== 'string' || !uploadId) throw new Error('Konsola nie zwróciła identyfikatora instalacji.');
  const upload = '/api/deploy/' + encodeURIComponent(uploadId);
  try {
    for (const [path, bytes] of Object.entries(files)) {
      await request(upload + '/file?path=' + encodeURIComponent(path), 'PUT', bytes, 'application/octet-stream');
    }
    await request(upload + '/commit', 'POST');
  } catch (error) {
    await request(upload, 'DELETE').catch(() => {});
    throw error;
  }
  await request('/api/launch/' + encodeURIComponent(manifest.id), 'POST');
}
