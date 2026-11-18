import { strToU8, strFromU8, unzipSync, zipSync } from 'fflate';
import { getGameRuntimeScript } from './gameRuntime.js';

// The Web Lab engine still runs the scene and physics. Orbit draws its
// recorded commands and supplies frame time and controller input.
function orbitEnvironment() {
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
    a: [' ', 'Enter', 'z'], b: ['Escape', 'x'], x: ['c'], y: ['v'],
  };
  const held = {};
  let clock = 0;
  function color(value) { return /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value || '') ? value : '#ffffff'; }
  function draw(command) {
    const x = command.screenX ?? command.x;
    const y = command.screenY ?? command.y;
    const w = command.width * Math.abs(command.scaleX ?? 1);
    const h = command.height * Math.abs(command.scaleY ?? 1);
    switch (command.op) {
      case 'clear': lab.clear(color(command.color)); break;
      case 'rect': if (w > 0 && h > 0) lab.drawRect(x - w / 2, y - h / 2, w, h, color(command.color)); break;
      case 'circle': if (command.radius > 0) lab.drawCircle(x, y, command.radius * Math.abs(command.scaleX ?? 1), color(command.color)); break;
      case 'text': {
        const size = command.fontSize || 16;
        const offset = command.align === 'center' ? command.text.length * size / 4 : command.align === 'right' ? command.text.length * size / 2 : 0;
        lab.drawText(x - offset, y - size / 2, command.text, color(command.color), size);
        break;
      }
      case 'sprite':
        if (w > 0 && h > 0) {
          if (lab.asset(command.texture)) {
            lab.drawSpriteEx(command.texture, x - w / 2, y - h / 2, w, h, {
              flipX: command.scaleX < 0, flipY: command.scaleY < 0,
              rot: (command.rotation || 0) * 180 / Math.PI,
            });
          } else lab.drawRect(x - w / 2, y - h / 2, w, h, '#76b9f2');
        }
        break;
      case 'progress':
        lab.drawRect(x, y, w, h, color(command.track));
        if (command.progress > 0) lab.drawRect(x, y, w * command.progress, h, color(command.fill));
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
  return { window, update };
}

export async function buildPlaygroundOrbit(project, id) {
  const game = project?.files?.['game.js'];
  if (typeof game !== 'string' || !game.trim()) throw new Error('Projekt musi zawierać game.js.');
  if (!/^web-lab-[a-z0-9-]{1,38}$/.test(id)) throw new Error('Nieprawidłowy identyfikator projektu.');
  if (/^\s*(?:import\s|export\s)/m.test(game)) throw new Error('Eksport Orbit wymaga sceny w jednym pliku game.js bez importów.');
  const runtime = getGameRuntimeScript().replace(')({}, {Assets:', ')({window,skipAssetLoading:true}, {Assets:');
  const source = [
    'var orbitPlayground = (' + orbitEnvironment.toString() + ')();',
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
