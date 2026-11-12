import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import ElementTree from './ElementTree.jsx';

afterEach(cleanup);

const HTML = `<main id="menu">
  <h1>Kroniki Smoka</h1>
  <section class="panel">
    <p>Pierwszy   <strong>akapit</strong></p>
    <!-- komentarz pomijany -->
    <script>alert(1)<\/script>
    <style>p{color:red}<\/style>
  </section>
</main>
<section id="opcje"><h2>Opcje</h2></section>`;

const CHECKS = [
  { selector: 'main > h1', label: 'Dodaj <h1> z tytułem gry.' },
  { selector: '#opcje > h2', label: 'Dodaj <h2> w sekcji opcji.' },
  { selector: 'main > footer', label: 'Dodaj <footer> ze stopką.' },
];

it('renders the body elements as a nested tree and skips text noise, comments, script and style', () => {
  const { container } = render(<ElementTree html={HTML} />);
  const items = container.querySelectorAll('[role="treeitem"]');
  const tags = [...items].map((item) => item.querySelector('.element-tree-tag').textContent);
  expect(tags).toEqual(['<main>', '<h1>', '<section>', '<p>', '<strong>', '<section>', '<h2>']);
  expect(container.querySelectorAll('script, style')).toHaveLength(0);
  expect(container.querySelector('.element-tree-id').textContent).toBe('#menu');
  expect(container.querySelector('.element-tree-class').textContent).toBe('.panel');
  expect(container.textContent).toContain('Pierwszy');
});

it('marks nodes matching task selectors with a check badge and lists unmet ones', () => {
  const { container } = render(<ElementTree html={HTML} checks={CHECKS} />);
  const matched = container.querySelectorAll('.element-tree-item.is-matched');
  expect(matched).toHaveLength(2);
  const missing = container.querySelectorAll('.element-tree-missing li');
  expect(missing).toHaveLength(1);
  expect(missing[0].textContent).toBe('Dodaj <footer> ze stopką.');
});

it('expands and collapses nodes with arrow keys and moves focus', () => {
  const { container } = render(<ElementTree html={HTML} />);
  const tree = container.querySelector('[role="tree"]');
  const itemAt = (index) => container.querySelectorAll('[role="treeitem"]')[index];
  // Focus first treeitem (main) then move down.
  fireEvent.focus(itemAt(0));
  fireEvent.keyDown(tree, { key: 'ArrowDown' });
  expect(document.activeElement).toBe(itemAt(1));
  // Right on h1 (no children) does nothing; right on section expands nothing
  // because it is expanded — focus moves to first child instead.
  fireEvent.focus(itemAt(2));
  fireEvent.keyDown(tree, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(itemAt(3));
  // Left collapses the focused node.
  fireEvent.focus(itemAt(2));
  fireEvent.keyDown(tree, { key: 'ArrowLeft' });
  expect(itemAt(2)).toHaveAttribute('aria-expanded', 'false');
  expect(container.querySelectorAll('[role="treeitem"]')).toHaveLength(5);
  // Right expands again.
  fireEvent.keyDown(tree, { key: 'ArrowRight' });
  expect(itemAt(2)).toHaveAttribute('aria-expanded', 'true');
  expect(container.querySelectorAll('[role="treeitem"]')).toHaveLength(7);
});

it('shows an empty-state message when there is nothing to render', () => {
  const { container } = render(<ElementTree html="   " />);
  expect(container.textContent).toContain('Brak elementów do pokazania');
});
