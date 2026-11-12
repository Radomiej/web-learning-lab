import { useEffect, useMemo, useRef, useState } from 'react';
import './ElementTree.css';

// Drzewo elementów <body> dokumentu HTML — podgląd struktury dla ucznia.
// Parsuje łańcuch HTML przez DOMParser (treść ucznia, nie wykonywalny kod),
// pomija białe znaki, komentarze oraz script/style. Opcjonalnie oznacza
// węzły spełniające selektory zadań odznaką ✓ i wypisuje niespełnione.
const SKIPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT']);

function textPreview(element) {
  let text = '';
  for (const child of element.childNodes) {
    if (child.nodeType === 3) text += ` ${child.textContent.trim()}`;
  }
  text = text.trim();
  return text.length > 30 ? `${text.slice(0, 29).trimEnd()}…` : text;
}

function buildModel(html, checks) {
  const empty = { nodes: [], matched: new Set(), missing: [] };
  if (typeof html !== 'string' || !html.trim()) return empty;
  let doc;
  try {
    doc = new DOMParser().parseFromString(html, 'text/html');
  } catch {
    return empty;
  }
  const body = doc?.body;
  if (!body) return empty;

  const nodes = [];
  const walk = (parent, list, prefix) => {
    let index = 0;
    for (const child of parent.children) {
      if (SKIPPED_TAGS.has(child.tagName)) continue;
      const key = `${prefix}${index}`;
      const node = { key, element: child, children: [] };
      walk(child, node.children, `${key}.`);
      list.push(node);
      index += 1;
    }
  };
  walk(body, nodes, '');

  const matched = new Set();
  const missing = [];
  for (const check of checks ?? []) {
    if (!check?.selector) continue;
    let element = null;
    try {
      element = doc.querySelector(check.selector);
    } catch {
      element = null;
    }
    if (element) matched.add(element);
    else missing.push(check);
  }
  return { nodes, matched, missing };
}

function labelFor(element) {
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const classes = element.classList.length ? `.${[...element.classList].join('.')}` : '';
  return { tag, id, classes };
}

export default function ElementTree({ html, checks }) {
  const { nodes, matched, missing } = useMemo(() => buildModel(html, checks), [html, checks]);
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [activeKey, setActiveKey] = useState(null);
  const containerRef = useRef(null);

  const visible = useMemo(() => {
    const list = [];
    const push = (nodeList, depth) => {
      for (const node of nodeList) {
        list.push({ node, depth });
        if (node.children.length && !collapsed.has(node.key)) push(node.children, depth + 1);
      }
    };
    push(nodes, 1);
    return list;
  }, [nodes, collapsed]);

  const activeIndex = Math.max(0, visible.findIndex(({ node }) => node.key === activeKey));

  useEffect(() => {
    if (activeKey == null) return;
    containerRef.current?.querySelector(`[data-tree-key="${activeKey}"]`)?.focus();
  }, [activeKey]);

  const onKeyDown = (event) => {
    const current = visible[activeIndex];
    if (!current) return;
    const { node, depth } = current;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = visible[activeIndex + (event.key === 'ArrowDown' ? 1 : -1)];
      if (next) setActiveKey(next.node.key);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (!node.children.length) return;
      if (collapsed.has(node.key)) {
        setCollapsed((set) => { const next = new Set(set); next.delete(node.key); return next; });
      } else {
        setActiveKey(node.children[0].key);
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (node.children.length && !collapsed.has(node.key)) {
        setCollapsed((set) => new Set(set).add(node.key));
      } else if (node.key.includes('.')) {
        const parentKey = node.key.slice(0, node.key.lastIndexOf('.'));
        if (visible.some(({ node: candidate }) => candidate.key === parentKey)) setActiveKey(parentKey);
      }
    }
  };

  const renderNode = (node, depth = 1) => {
    const { tag, id, classes } = labelFor(node.element);
    const hasChildren = node.children.length > 0;
    const expanded = hasChildren && !collapsed.has(node.key);
    const preview = textPreview(node.element);
    return (
      <li
        key={node.key}
        role="treeitem"
        data-tree-key={node.key}
        aria-expanded={hasChildren ? expanded : undefined}
        aria-level={depth}
        aria-selected={node.key === activeKey}
        tabIndex={node.key === visible[activeIndex]?.node.key ? 0 : -1}
        className={`element-tree-item${matched.has(node.element) ? ' is-matched' : ''}`}
        onFocus={(event) => { event.stopPropagation(); setActiveKey(node.key); }}
        onClick={(event) => {
          event.stopPropagation();
          setActiveKey(node.key);
          if (hasChildren) setCollapsed((set) => { const next = new Set(set); next.has(node.key) ? next.delete(node.key) : next.add(node.key); return next; });
        }}
      >
        <span className="element-tree-label">
          <span className="element-tree-tag">{'<'}{tag}{'>'}</span>
          {id && <span className="element-tree-id">{id}</span>}
          {classes && <span className="element-tree-class">{classes}</span>}
          {matched.has(node.element) && <span className="element-tree-check" title="Warunek spełniony">✓</span>}
          {preview && <span className="element-tree-preview">{preview}</span>}
        </span>
        {expanded && <ul role="group">{node.children.map((child) => renderNode(child, depth + 1))}</ul>}
      </li>
    );
  };

  return (
    <div className="element-tree" ref={containerRef}>
      {nodes.length === 0 ? (
        <p className="element-tree-empty">{'Brak elementów do pokazania — dopisz kod HTML w <body>.'}</p>
      ) : (
        <ul role="tree" aria-label="Drzewo elementów HTML" onKeyDown={onKeyDown}>
          {nodes.map((node) => renderNode(node))}
        </ul>
      )}
      {missing.length > 0 && (
        <div className="element-tree-missing">
          <strong>Do uzupełnienia:</strong>
          <ul>
            {missing.map((check, index) => <li key={index}>{check.label}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
