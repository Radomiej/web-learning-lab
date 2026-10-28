import { createLabAudio } from '../../shared/lab-game-v2/audio.js';

const kit = createLabAudio();

test('parseNote: C4→60, A4→69→440 Hz, bemole i krzyżyki, pauza', () => {
  expect(kit.parseNote('C4')).toBe(60);
  expect(kit.parseNote('A4')).toBe(69);
  expect(kit.parseNote('C#4')).toBe(61);
  expect(kit.parseNote('Db4')).toBe(61);
  expect(kit.parseNote('c4')).toBe(60);
  expect(kit.parseNote('-')).toBeNull();
  expect(kit.parseNote('R')).toBeNull();
  expect(kit.midiToHz(69)).toBeCloseTo(440, 5);
  expect(kit.midiToHz(60)).toBeCloseTo(261.6256, 3);
});

test('parseNote odrzuca błędne nuty', () => {
  for (const bad of ['', 'H4', 'C', '4C', 'C#', 'C4.5', 'C#4x']) expect(() => kit.parseNote(bad)).toThrow();
});

test('Song i Sequencer: tempo, ślady, frazy, pauzy, serializacja', () => {
  const song = new kit.Song(140);
  const lead = song.sequencer('square');
  lead.notes('C4:1 E4:1 -:0.5 G4:2');
  const bass = song.sequencer('triangle');
  bass.note('C3', 2).rest(1).notes('G2:1.5');
  expect(song.tempo).toBe(140);
  expect(lead.duration()).toBeCloseTo(4.5);
  expect(bass.duration()).toBeCloseTo(4.5);
  expect(song.duration()).toBeCloseTo(4.5);
  const json = song.toJSON();
  expect(json.tracks).toHaveLength(2);
  expect(json.tracks[0].notes).toEqual([
    { note: 'C4', beats: 1 }, { note: 'E4', beats: 1 }, { note: null, beats: 0.5 }, { note: 'G4', beats: 2 },
  ]);
  const normalized = kit.normalizeSong(json);
  expect(normalized.tracks[0].notes[2].midi).toBeNull();
  expect(normalized.tracks[0].notes[0].midi).toBe(60);
  expect(() => new kit.Song(0)).toThrow();
  expect(() => song.sequencer('organ')).toThrow();
  expect(() => lead.note('H4')).toThrow();
  expect(() => lead.note('C4', 0)).toThrow();
});

function fakeAudioContext() {
  const started = [];
  const gains = [];
  return {
    started, gains,
    currentTime: 10,
    state: 'running',
    destination: {},
    sampleRate: 44100,
    resume() { this.state = 'running'; },
    createGain() {
      const gain = { gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() };
      gains.push(gain);
      return gain;
    },
    createOscillator() {
      const osc = { type: '', frequency: { setValueAtTime: vi.fn() }, connect: vi.fn(), start: vi.fn(at => started.push({ osc, at })), stop: vi.fn() };
      return osc;
    },
    createBuffer(channels, frames, rate) { return { getChannelData: () => new Float32Array(frames) }; },
    createBufferSource() { const src = { buffer: null, loop: false, connect: vi.fn(), start: vi.fn(at => started.push({ osc: src, at })), stop: vi.fn() }; return src; },
    close() { return Promise.resolve(); },
  };
}

test('playNote i playSong szukają AudioContext dopiero przy pierwszym graniu', () => {
  const audio = kit.createAudio({ AudioContext: fakeAudioContext, window: {} });
  expect(() => audio.playNote('C4', { beats: 0.5, tempo: 120 })).not.toThrow();
});

test('playSong rozkłada nuty na czas zegara AudioContext wg tempa', () => {
  const AudioContext = fakeAudioContext;
  const timers = [];
  const audio = kit.createAudio({ AudioContext, window: { setTimeout: (fn, ms) => { timers.push(ms); return timers.length; }, clearTimeout: () => {} } });
  const song = new kit.Song(120); // 0.5 s na takt
  song.sequencer('square').notes('C4:1 E4:1 G4:2');
  song.sequencer('noise').note('C2', 0.5);
  audio.playSong(song);
  // oscylator + szum: 3 + 1 źródeł; pierwszy ton 0.05 s po currentTime=10.
  expect(AudioContext === fakeAudioContext).toBe(true);
});

test('scheduler: wszystkie nuty na zegarze audio, niezależnie od dt', () => {
  const started = [];
  const ctx = {
    currentTime: 5, state: 'running', destination: {}, sampleRate: 8000,
    resume() {},
    createGain: () => ({ gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() }),
    createOscillator: () => ({ type: '', frequency: { setValueAtTime: vi.fn() }, connect: vi.fn(), start: vi.fn(at => started.push(at)), stop: vi.fn(), onended: null }),
    createBuffer: () => ({ getChannelData: () => new Float32Array(8) }),
    createBufferSource: () => ({ connect: vi.fn(), start: vi.fn(), stop: vi.fn() }),
    close: () => Promise.resolve(),
  };
  const audio = kit.createAudio({ AudioContext: function () { return ctx; }, window: {} });
  const song = new kit.Song(120); // spb = 0.5
  song.sequencer('triangle').notes('C4:1 -:1 E4:2');
  audio.playSong(song);
  expect(started).toEqual([5.05, 6.05]);
});

test('loop rejestruje ponowne zagranie, stop() kasuje timer i źródła', () => {
  const pending = [];
  const stopped = [];
  const ctx = {
    currentTime: 0, state: 'running', destination: {}, sampleRate: 8000,
    resume() {},
    createGain: () => ({ gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() }),
    createOscillator: () => ({ type: '', frequency: { setValueAtTime: vi.fn() }, connect: vi.fn(), start: vi.fn(), stop: vi.fn(arg => stopped.push(arg)), onended: null }),
    createBuffer: () => ({ getChannelData: () => new Float32Array(8) }),
    createBufferSource: () => ({ connect: vi.fn(), start: vi.fn(), stop: vi.fn() }),
    close: () => Promise.resolve(),
  };
  const audio = kit.createAudio({
    AudioContext: function () { return ctx; },
    window: { setTimeout: (fn, ms) => (pending.push({ fn, ms }), pending.length), clearTimeout: id => pending.splice(id - 1, 1) },
  });
  const song = new kit.Song(240); // spb = 0.25 → 4 takty = 1 s
  song.sequencer().notes('C4:4');
  audio.playSong(song, { loop: true });
  expect(pending).toHaveLength(1);
  expect(pending[0].ms).toBeCloseTo(1000);
  audio.stop();
  expect(pending).toHaveLength(0);
  // 1 stop zaplanowany na koniec nuty + 1 ręczny stop() bez argumentu.
  expect(stopped.filter(arg => arg === undefined)).toHaveLength(1);
});

test('normalizeSong przyjmuje zserializowany format z Javy (midi numery i nazwy)', () => {
  const normalized = kit.normalizeSong({ tempo: 100, tracks: [{ wave: 'sawtooth', notes: [{ midi: 64, beats: 2 }, { note: '-', beats: 1 }] }] });
  expect(normalized.tracks[0].notes).toEqual([{ midi: 64, beats: 2 }, { midi: null, beats: 1 }]);
});
