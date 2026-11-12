import { describe, expect, test } from 'vitest';
import { formatProjectFiles, formatSource } from '../../shared/lab-game-v2/course/formatSource.js';
import { highlightCode } from '../../shared/lab-game-v2/editor/highlightCode.js';
import { buildCourseProject } from './labGameV2Course.js';

describe('formatSource', () => {
  test('generated component files become multi-line and indented', () => {
    const source = buildCourseProject('js', 'input', 'independent').files['SpaceShooter.js'];
    const formatted = formatSource(source);
    expect(formatted).toContain('onUpdate() {\n');
    expect(formatted).toContain('    if(this.game.input.isKeyPressed("Space")) this.requireComponent(BulletShooter).shoot();');
    expect(formatted).toContain('import BulletShooter');
    expect(formatted.trim().endsWith('}')).toBe(true);
    // Braces stay balanced and code still parses as a module body.
    const opens = (formatted.match(/{/g) ?? []).length;
    const closes = (formatted.match(/}/g) ?? []).length;
    expect(opens).toBe(closes);
  });

  test('semicolons inside for() headers are not split', () => {
    const formatted = formatSource('public class T { void run() { for(int i=0;i<10;i++)step(i); } }');
    expect(formatted).toContain('for(int i=0;i<10;i++)step(i);');
  });

  test('} else stays on one line', () => {
    const formatted = formatSource('if(a){x();}else{y();}');
    expect(formatted).toContain('} else {');
  });

  test('braces inside strings and comments are ignored', () => {
    const formatted = formatSource('const s="a{b}c";// { ignore\nlet x=1;');
    expect(formatted).toContain('"a{b}c"');
    expect(formatted).toContain('// { ignore');
    expect(formatted).toContain('let x=1;');
  });

  test('object literals inside call arguments stay inline', () => {
    const formatted = formatSource('GameLab.run(MyGame, { canvas: \'#game\' });');
    expect(formatted.trim()).toBe("GameLab.run(MyGame, { canvas: '#game' });");
  });

  test('java example formats and keeps annotations and generics', () => {
    const source = buildCourseProject('java', 'input', 'independent').files['BulletShooter.java'];
    const formatted = formatSource(source);
    expect(formatted).toContain('public class BulletShooter extends Component {\n');
    expect(formatted).toContain('public void shoot()');
    expect(formatted).toContain('requireComponent(CharacterController2D.class)');
    expect(formatted).toContain('new Projectile2D(d.x,d.y,240,2,gameObject)');
    const shooter = formatSource(buildCourseProject('java', 'input', 'independent').files['SpaceShooter.java']);
    expect(shooter).toContain('@Override');
    expect(shooter).toContain('requireComponent(BulletShooter.class).shoot()');
  });
});

describe('formatProjectFiles', () => {
  test('formats js/java/css but leaves html untouched', () => {
    const files = { 'a.js': 'if(x){y();}', 'b.css': 'a{b:c;d:e}', 'index.html': '<p>x</p>' };
    const out = formatProjectFiles(files);
    expect(out['a.js']).toContain('{\n');
    expect(out['b.css']).toContain('b:c;');
    expect(out['index.html']).toBe('<p>x</p>');
  });

  test('formatted starter and solution still differ in exactly one file', () => {
    for (const chapter of ['scene', 'input', 'collisions', 'time']) {
      for (const mode of ['guided', 'modified', 'independent']) {
        const starter = formatProjectFiles(buildCourseProject('js', chapter, mode, false).files);
        const solution = formatProjectFiles(buildCourseProject('js', chapter, mode, true).files);
        const different = Object.keys(solution).filter(name => starter[name] !== solution[name]);
        expect(different.length).toBe(1);
      }
    }
  });
});

describe('highlightCode', () => {
  test('produces keyword, string, comment, number, type and annotation tokens', () => {
    const code = `// komentarz\npublic class Foo extends Bar { @Override public void run() { int n=42; String s="x"; flag=true; } }`;
    const types = new Set(highlightCode(code).map(token => token.type));
    expect(types).toContain('comment');
    expect(types).toContain('keyword');
    expect(types).toContain('type');
    expect(types).toContain('annotation');
    expect(types).toContain('number');
    expect(types).toContain('string');
    expect(types).toContain('literal');
  });

  test('token values join back to the original code', () => {
    const code = `export default class X extends GameLab.Component { onUpdate() { this.requireComponent(GameLab.Sprite); } }`;
    expect(highlightCode(code).map(token => token.value).join('')).toBe(code);
  });
});
