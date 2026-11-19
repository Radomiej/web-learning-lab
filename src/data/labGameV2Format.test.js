// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { formatCourseSource } from './labGameV2Course.js';

describe('formatCourseSource', () => {
  test('breaks a block lambda passed to onDeath into braced statements', () => {
    const out = formatCourseSource(
      'class T extends Component { void onCreate() { hp.onDeath(() -> { score++; gameObject.destroy(); }); } }');
    expect(out).toContain('hp.onDeath(() -> {');
    expect(out).toContain('\n            score++;');
    expect(out).toContain('\n            gameObject.destroy();');
    expect(out).toContain('\n        });');
  });

  test('adds braces to a braceless for and indents its body', () => {
    const out = formatCourseSource(
      'class T { void f() { for (int i = 0; i < n; i++) sum += i; } }');
    expect(out).toContain('for (int i = 0; i < n; i++) {');
    expect(out).toContain('\n            sum += i;');
    expect(out).toContain('\n        }');
  });

  test('formats a ternary expression on one line', () => {
    const out = formatCourseSource('class T { void f() { int x=a>0?1:-1; } }');
    expect(out).toMatch(/int x = a > 0 \? 1 : -1;/);
  });

  test('leaves a string containing semicolons and braces untouched', () => {
    const out = formatCourseSource(
      'class T { void f() { canvas.drawText("a;b{c}", 10, 20); } }');
    expect(out).toContain('"a;b{c}"');
    expect(out).not.toContain('"a;b{ c }"');
  });

  test('keeps a // comment with a brace on its line', () => {
    const out = formatCourseSource(
      'class T { void f() { // zamknij blok } poprzedni\n x = 1; } }');
    expect(out).toContain('// zamknij blok } poprzedni');
    expect(out).toContain('x = 1;');
  });

  test('splits multiple field declarations into separate lines', () => {
    const out = formatCourseSource('class T { public double a=0,b=1; void f() {} }');
    expect(out).toContain('public double a = 0;');
    expect(out).toContain('public double b = 1;');
  });

  test('keeps else on the same line as the closing brace', () => {
    const out = formatCourseSource('class T { void f() { if (a) { x(); } else { y(); } } }');
    expect(out).toContain('} else {');
  });

  test('inserts a blank line between methods', () => {
    const out = formatCourseSource('class T { void a() {} void b() {} }');
    expect(out).toMatch(/\}\n\n {4}void b\(\)/);
  });
});
