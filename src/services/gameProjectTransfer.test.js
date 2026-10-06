import { playgroundProject } from '../data/playground.js';
import { parseGameProject, serializeGameProject } from './gameProjectTransfer.js';

test('round-trips every file including custom component folders', () => {
  const project = { ...playgroundProject, files: { ...playgroundProject.files, 'components/PlayerMove.js': 'export default class PlayerMove extends GameLab.Component {}' } };
  expect(parseGameProject(serializeGameProject(project))).toEqual(project);
});

test('rejects malformed, incompatible and unsafe imports without modifying the current project', () => {
  expect(() => parseGameProject('{')).toThrow(/JSON/);
  expect(() => parseGameProject(JSON.stringify({ format: 'web-learning-lab-game-project', version: 2, project: playgroundProject }))).toThrow(/wersja/);
  expect(() => parseGameProject(JSON.stringify({ ...playgroundProject, runtime: { kind: 'react-cra' } }))).toThrow();
  expect(() => parseGameProject(JSON.stringify({ ...playgroundProject, files: { ...playgroundProject.files, '../outside.js': '' } }))).toThrow();
  expect(Object.keys(playgroundProject.files)).toEqual(['index.html', 'styles.css', 'game.js']);
});

test('accepts a standalone game project manifest and rejects missing entry scripts', () => {
  expect(parseGameProject(JSON.stringify(playgroundProject))).toEqual(playgroundProject);
  const { 'game.js': _, ...files } = playgroundProject.files;
  expect(() => parseGameProject(JSON.stringify({ ...playgroundProject, files }))).toThrow(/game.js/);
});
