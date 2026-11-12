import { useState } from 'react';
import { HintBubble, RadioGroup, SliderRow } from './boardControls.jsx';

// Interaktywny plac zabaw Flexboxa dla układu „pilot" — prawdziwy kontener
// flex z elementami .item, nie rysowany diagram. Kontrolki z `controls`
// przełączają właściwości kontenera .practice; reguła CSS pod spodem
// aktualizuje się na żywo, a linia statusu opisuje efekt słownie.
//
// Kontrakt notatki: board: { kind: 'flex', props: { ... } }
//   controls        podzbiór: direction, justify, align, wrap, gap,
//                   gapSplit (row-gap + column-gap), alignContent, width
//   items           etykiety pudełek (domyślnie ['1','2','3'])
//   direction/justify/align/wrap/alignContent  wartości początkowe
//   gap/rowGap/columnGap/width                 liczby początkowe (px / %)
//   height          stała wysokość kontenera w px (trafia do kodu CSS)
//   itemBasis       flex-basis pudełek (domyślnie '76px')
//   hint            tekst dymka (domyślnie 'Zmień właściwość!')

const OPTIONS = {
  direction: [['row'], ['column']],
  justify: [['flex-start'], ['center'], ['flex-end'], ['space-between']],
  align: [['stretch'], ['flex-start'], ['center'], ['flex-end']],
  wrap: [['nowrap'], ['wrap']],
  alignContent: [['stretch'], ['flex-start'], ['center'], ['flex-end'], ['space-between']],
};

const JUSTIFY_TEXT = {
  'flex-start': 'skupione na początku osi',
  'center': 'wyśrodkowane na osi',
  'flex-end': 'skupione na końcu osi',
  'space-between': 'rozłożone między krawędziami',
};
const ALIGN_ROW = {
  'stretch': 'rozciągnięte na wysokość',
  'flex-start': 'przy górnej krawędzi',
  'center': 'na środku wysokości',
  'flex-end': 'przy dolnej krawędzi',
};
const ALIGN_COL = {
  'stretch': 'rozciągnięte na szerokość',
  'flex-start': 'przy lewej krawędzi',
  'center': 'na środku szerokości',
  'flex-end': 'przy prawej krawędzi',
};
const ALIGN_CONTENT_TEXT = {
  'stretch': 'wiersze rozciągają się po wysokości',
  'flex-start': 'wiersze skupione u góry',
  'center': 'wiersze na środku wysokości',
  'flex-end': 'wiersze skupione u dołu',
  'space-between': 'wiersze rozłożone po całej wysokości',
};

export default function FlexPlayground({
  controls = ['direction', 'justify', 'align'],
  items = ['1', '2', '3'],
  direction: initialDirection = 'row',
  justify: initialJustify = 'flex-start',
  align: initialAlign = 'stretch',
  wrap: initialWrap = 'nowrap',
  alignContent: initialAlignContent = 'stretch',
  gap: initialGap = 8,
  rowGap: initialRowGap = 24,
  columnGap: initialColumnGap = 12,
  width: initialWidth = 100,
  height = 0,
  itemBasis = '76px',
  hint = 'Zmień właściwość!',
}) {
  const [direction, setDirection] = useState(initialDirection);
  const [justify, setJustify] = useState(initialJustify);
  const [align, setAlign] = useState(initialAlign);
  const [wrap, setWrap] = useState(initialWrap);
  const [alignContent, setAlignContent] = useState(initialAlignContent);
  const [gap, setGap] = useState(initialGap);
  const [rowGap, setRowGap] = useState(initialRowGap);
  const [columnGap, setColumnGap] = useState(initialColumnGap);
  const [width, setWidth] = useState(initialWidth);
  const [hintVisible, setHintVisible] = useState(true);
  const interact = () => setHintVisible(false);
  const has = (name) => controls.includes(name);

  const containerStyle = {
    display: 'flex',
    flexDirection: direction,
    justifyContent: justify,
    alignItems: align,
    flexWrap: wrap,
    // rowGap/columnGap zamiast skrótu `gap` — React ostrzega przed mieszaniem
    // skrótu z długimi wariantami w jednym obiekcie stylów.
    rowGap: has('gapSplit') ? `${rowGap}px` : `${has('gap') ? gap : 8}px`,
    columnGap: has('gapSplit') ? `${columnGap}px` : `${has('gap') ? gap : 8}px`,
    alignContent,
    width: has('width') ? `${width}%` : '100%',
    minHeight: `${Math.max(height, has('align') || has('alignContent') ? 132 : 96)}px`,
  };

  const axisText = direction === 'row'
    ? 'Oś pozioma: elementy w rzędzie'
    : 'Oś pionowa: elementy w kolumnie';
  const status = [
    axisText,
    has('justify') ? JUSTIFY_TEXT[justify] : '',
    has('align') ? (direction === 'row' ? ALIGN_ROW : ALIGN_COL)[align] : '',
    has('wrap')
      ? (wrap === 'wrap' ? 'zawijają się do kolejnych wierszy' : 'trzymane w jednej linii — w ciasnocie wystają')
      : '',
    has('alignContent') && wrap === 'wrap' ? ALIGN_CONTENT_TEXT[alignContent] : '',
    has('gap') ? `odstępy ${gap}px` : '',
    has('gapSplit') ? `odstępy: wiersze ${rowGap}px, kolumny ${columnGap}px` : '',
  ].filter(Boolean).join(' · ') + '.';

  const lines = ['.practice {', '  display: flex;'];
  if (has('direction')) lines.push(`  flex-direction: ${direction};`);
  if (has('justify')) lines.push(`  justify-content: ${justify};`);
  if (has('align')) lines.push(`  align-items: ${align};`);
  if (has('wrap')) lines.push(`  flex-wrap: ${wrap};`);
  if (has('gap')) lines.push(`  gap: ${gap}px;`);
  if (has('gapSplit')) lines.push(`  row-gap: ${rowGap}px;`, `  column-gap: ${columnGap}px;`);
  if (has('alignContent')) lines.push(`  align-content: ${alignContent};`);
  if (height) lines.push(`  height: ${height}px;`);
  lines.push('}');

  return (
    <div className="pilot-lb">
      <div className="pilot-lb-stage">
        <span className="pilot-lb-tag">.practice</span>
        <div className="pilot-lb-container" style={containerStyle} role="img" aria-label={status}>
          {items.map((label) => (
            <div className="pilot-lb-item" style={{ flex: `0 0 ${itemBasis}` }} key={label}>{label}</div>
          ))}
        </div>
        <HintBubble visible={hintVisible}>{hint}</HintBubble>
      </div>
      <div className="pilot-lb-controls">
        {has('direction') && <RadioGroup label="flex-direction" value={direction} onChange={setDirection} onInteract={interact} options={OPTIONS.direction} />}
        {has('justify') && <RadioGroup label="justify-content" value={justify} onChange={setJustify} onInteract={interact} options={OPTIONS.justify} />}
        {has('align') && <RadioGroup label="align-items" value={align} onChange={setAlign} onInteract={interact} options={OPTIONS.align} />}
        {has('wrap') && <RadioGroup label="flex-wrap" value={wrap} onChange={setWrap} onInteract={interact} options={OPTIONS.wrap} />}
        {has('alignContent') && <RadioGroup label="align-content" value={alignContent} onChange={setAlignContent} onInteract={interact} options={OPTIONS.alignContent} />}
        {has('gap') && <SliderRow label="gap" value={gap} min={0} max={32} step={2} onChange={setGap} onInteract={interact} />}
        {has('gapSplit') && <>
          <SliderRow label="row-gap" value={rowGap} min={0} max={40} step={2} onChange={setRowGap} onInteract={interact} />
          <SliderRow label="column-gap" value={columnGap} min={0} max={40} step={2} onChange={setColumnGap} onInteract={interact} />
        </>}
        {has('width') && <SliderRow label="szerokość kontenera" value={width} min={40} max={100} step={5} unit="%" onChange={setWidth} onInteract={interact} />}
      </div>
      <pre className="pilot-lb-code"><code>{lines.join('\n')}</code></pre>
      <p role="status" className="pilot-lb-status">{status}</p>
    </div>
  );
}
