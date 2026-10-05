export const trackNumberBases = Object.freeze({
  html: 100,
  css: 200,
  layout: 300,
  js: 400,
  react: 500,
  php: 600,
  'game-dev': 700,
});

export function lessonNumber(track, sequence) {
  const base = trackNumberBases[track];
  if (!base || !Number.isInteger(sequence) || sequence < 1 || sequence > 99) {
    throw new Error(`Nieprawidłowy numer lekcji: ${track}/${sequence}.`);
  }
  return base + sequence;
}

export function lessonSequence(track, number) {
  const base = trackNumberBases[track];
  if (!base || !Number.isInteger(number) || number < base + 1 || number > base + 99) {
    throw new Error(`Nieprawidłowy numer lekcji: ${track}/${number}.`);
  }
  return number - base;
}
