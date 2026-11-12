import { useId, useRef, useState } from 'react';
import { HintBubble, RadioGroup, SliderRow, nextRadioIndex } from './boardControls.jsx';

// Interaktywny plac zabaw Grida dla układu „pilot" — prawdziwy kontener
// display:grid z literowanymi elementami .item. Kontrolki z `controls`
// przełączają właściwości; reguła CSS i linia statusu aktualizują się na żywo.
//
// Kontrakt notatki: board: { kind: 'grid', props: { ... } }
//   controls        podzbiór: columns (presety + pole własne), rows, gap,
//                   areas, span, justify, width
//   items           etykiety pudełek (domyślnie ['A','B','C','D'])
//   columns/rows    wartości początkowe; 'auto' w rows = brak reguły
//   columnPresets/rowPresets  opcje przycisków
//   areas           [{ name, value: '"header header" "side content"',
//                      assign: { A: 'header', B: 'side', C: 'content' } }]
//   spanAxes        ['column','row'] — które przełączniki rozpiętości pokazać
//   gap/justify/width  wartości początkowe
//   hint            tekst dymka

const JUSTIFY_OPTIONS = [['start'], ['center'], ['end'], ['space-between']];
const TRACK_RE = /^[0-9a-zA-Z.,%\s()/-]+$/;
const looksLikeTracks = (value) => TRACK_RE.test(value) && /[0-9]|fr|auto|minmax|repeat|fit-content/i.test(value);

const selectorFor = (index, count) => {
  if (index === 0) return '.item:first-child';
  if (index === count - 1 && count > 1) return '.item:last-child';
  return `.item:nth-child(${index + 1})`;
};

export default function GridPlayground({
  controls = ['columns', 'gap'],
  items = ['A', 'B', 'C', 'D'],
  columns: initialColumns = '1fr 1fr',
  columnPresets = ['1fr 1fr', 'repeat(3, 1fr)', '80px 1fr 80px'],
  rows: initialRows = 'auto',
  rowPresets = ['auto', '80px 80px', 'repeat(2, 100px)'],
  areas = null,
  spanAxes = ['column', 'row'],
  gap: initialGap = 12,
  justify: initialJustify = 'start',
  width: initialWidth = 100,
  selected: initialSelected = 0,
  hint = 'Zmień właściwość!',
}) {
  const [columns, setColumns] = useState(initialColumns);
  const [columnsText, setColumnsText] = useState(initialColumns);
  const [columnsError, setColumnsError] = useState('');
  const [rows, setRows] = useState(initialRows);
  const [gap, setGap] = useState(initialGap);
  const [justify, setJustify] = useState(initialJustify);
  const [width, setWidth] = useState(initialWidth);
  const [layoutMode, setLayoutMode] = useState('tracks');
  const [selected, setSelected] = useState(Math.min(initialSelected, items.length - 1));
  const [spans, setSpans] = useState(() => items.map(() => ({ column: false, row: false })));
  const [hintVisible, setHintVisible] = useState(true);
  const itemsRef = useRef(null);
  const columnsInputId = useId();
  const interact = () => setHintVisible(false);
  const has = (name) => controls.includes(name);
  const areasMode = has('areas') && layoutMode === 'areas' && areas?.length;
  const area = areasMode ? areas[0] : null;
  const pickable = has('span');

  const applyColumns = (value) => {
    setColumnsText(value);
    if (looksLikeTracks(value)) {
      setColumns(value);
      setColumnsError('');
    } else {
      setColumnsError('Nie rozumiem zapisu — spróbuj np. 1fr 1fr albo repeat(3, 1fr).');
    }
    interact();
  };

  const toggleSpan = (axis) => {
    setSpans((prev) => prev.map((entry, index) => (
      index === selected ? { ...entry, [axis]: !entry[axis] } : entry
    )));
    interact();
  };

  const onItemKeyDown = (event, index) => {
    const next = nextRadioIndex(event, index, items.length);
    if (next == null) return;
    setSelected(next);
    interact();
    itemsRef.current?.querySelectorAll('[role="radio"]')?.[next]?.focus();
  };

  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: areasMode ? 'none' : columns,
    gridTemplateRows: areasMode || rows === 'auto' ? undefined : rows,
    gridTemplateAreas: areasMode ? area.value : undefined,
    gap: `${gap}px`,
    justifyContent: justify,
    width: has('width') ? `${width}%` : '100%',
  };
  const itemStyle = (label, index) => {
    // Tryby rozdzielone, żeby nie mieszać skrótu grid-area z długimi
    // wariantami grid-column/row-* w jednym obiekcie stylów.
    if (areasMode) return { gridArea: area.assign?.[label] };
    const span = spans[index];
    const style = {};
    if (span.column) {
      style.gridColumnStart = '1';
      style.gridColumnEnd = '3';
    }
    if (span.row) {
      style.gridRowStart = '1';
      style.gridRowEnd = '3';
    }
    return style;
  };

  const lines = ['.practice {', '  display: grid;'];
  if (areasMode) {
    lines.push('  grid-template-areas:');
    const groups = area.value.match(/"[^"]+"/g) ?? [area.value];
    groups.forEach((group, index) => lines.push(`    ${group}${index === groups.length - 1 ? ';' : ''}`));
  } else {
    lines.push(`  grid-template-columns: ${columns};`);
    if (rows !== 'auto') lines.push(`  grid-template-rows: ${rows};`);
  }
  lines.push(`  gap: ${gap}px;`);
  if (has('justify') && justify !== 'start') lines.push(`  justify-content: ${justify};`);
  lines.push('}');
  if (areasMode) {
    items.forEach((label, index) => {
      const name = area.assign?.[label];
      if (name) lines.push(`${selectorFor(index, items.length)} { grid-area: ${name}; }`);
    });
  } else if (pickable) {
    items.forEach((label, index) => {
      const span = spans[index];
      const parts = [];
      if (span.column) parts.push('  grid-column-start: 1;', '  grid-column-end: 3;');
      if (span.row) parts.push('  grid-row-start: 1;', '  grid-row-end: 3;');
      if (parts.length) lines.push(`${selectorFor(index, items.length)} {\n${parts.join('\n')}\n}`);
    });
  }

  const spanText = !pickable ? '' : spans.map((span, index) => {
    const parts = [span.column ? 'przez 2 kolumny' : '', span.row ? 'przez 2 wiersze' : ''].filter(Boolean).join(' i ');
    return parts ? `${items[index]} ${parts}` : '';
  }).filter(Boolean).join('; ');
  const status = [
    areasMode ? `Obszary: ${area.value.replaceAll('"', '')}` : `Siatka: ${columns}${rows !== 'auto' ? ` / wiersze ${rows}` : ''}`,
    `odstępy ${gap}px`,
    has('justify') && justify !== 'start' ? `siatka wyrównana: ${justify}` : '',
    spanText ? `rozpiętość — ${spanText}` : '',
    columnsError || '',
  ].filter(Boolean).join(' · ') + '.';

  return (
    <div className="pilot-lb">
      <div className="pilot-lb-stage">
        <span className="pilot-lb-tag">.practice</span>
        <div className="pilot-lb-container pilot-lb-container--grid" style={containerStyle} ref={itemsRef}
          {...(pickable
            ? { role: 'radiogroup', 'aria-label': 'Wybierz element do edycji' }
            : { role: 'img', 'aria-label': status })}>
          {items.map((label, index) => {
            const style = itemStyle(label, index);
            return pickable
              ? <button key={label} type="button" role="radio" aria-checked={index === selected}
                  aria-label={`Element ${label}`}
                  className="pilot-lb-item pilot-lb-item--grid pilot-lb-item--pick" style={style}
                  onClick={() => { setSelected(index); interact(); }}
                  onKeyDown={(event) => onItemKeyDown(event, index)}>
                  {label}
                </button>
              : <div key={label} className="pilot-lb-item pilot-lb-item--grid" style={style}>{label}</div>;
          })}
        </div>
        <HintBubble visible={hintVisible}>{hint}</HintBubble>
      </div>
      <div className="pilot-lb-controls">
        {has('areas') && areas?.length ? (
          <RadioGroup label="tryb siatki" value={layoutMode} onChange={setLayoutMode} onInteract={interact}
            options={[['tracks', 'kolumny'], ['areas', 'nazwane obszary']]} />
        ) : null}
        {has('columns') && !areasMode && <>
          <RadioGroup label="grid-template-columns" value={columns} onChange={(v) => { setColumns(v); setColumnsText(v); setColumnsError(''); interact(); }}
            options={columnPresets.map((preset) => [preset])} />
          <div className="pilot-lb-group pilot-lb-custom">
            <label className="pilot-lb-name" htmlFor={columnsInputId}>własne kolumny</label>
            <input id={columnsInputId} type="text" value={columnsText} spellCheck="false"
              aria-invalid={Boolean(columnsError) || undefined}
              onChange={(event) => applyColumns(event.target.value)} />
          </div>
        </>}
        {has('rows') && !areasMode && <RadioGroup label="grid-template-rows" value={rows} onChange={setRows} onInteract={interact}
          options={rowPresets.map((preset) => [preset])} />}
        {has('gap') && <SliderRow label="gap" value={gap} min={0} max={32} step={2} onChange={setGap} onInteract={interact} />}
        {has('justify') && <RadioGroup label="justify-content" value={justify} onChange={setJustify} onInteract={interact} options={JUSTIFY_OPTIONS} />}
        {has('width') && <SliderRow label="szerokość kontenera" value={width} min={40} max={100} step={5} unit="%" onChange={setWidth} onInteract={interact} />}
        {has('span') && !areasMode && (
          <div className="pilot-lb-group" role="group" aria-label={`Rozpiętość elementu ${items[selected]}`}>
            <span className="pilot-lb-name">element {items[selected]} rozciąga się</span>
            <div className="pilot-lb-options">
              {spanAxes.includes('column') && (
                <button type="button" role="switch" aria-checked={spans[selected].column}
                  className="pilot-lb-option" onClick={() => toggleSpan('column')}>przez 2 kolumny</button>
              )}
              {spanAxes.includes('row') && (
                <button type="button" role="switch" aria-checked={spans[selected].row}
                  className="pilot-lb-option" onClick={() => toggleSpan('row')}>przez 2 wiersze</button>
              )}
            </div>
          </div>
        )}
      </div>
      <pre className="pilot-lb-code"><code>{lines.join('\n')}</code></pre>
      <p role="status" className="pilot-lb-status">{status}</p>
    </div>
  );
}
