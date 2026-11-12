import { useRef, useState } from 'react';
import { HintBubble, RadioGroup, SliderRow, nextRadioIndex } from './boardControls.jsx';

// Plansza „pilot" do właściwości DZIECI flexa: flex-basis, flex-grow,
// flex-shrink, order, align-self, min-width i overflow-x. W trybie
// scope="each" uczeń klika pudełko (radiogroup, strzałki przesuwają wybór)
// i edytuje jeden element; w scope="all" kontrolki ustawiają regułę `.item`
// dla wszystkich naraz. Wartości aktualne widać na odznakach pudełek,
// a reguła CSS pod spodem aktualizuje się na żywo.
//
// Kontrakt notatki: board: { kind: 'flex-items', props: { ... } }
//   scope              'each' | 'all'      (domyślnie 'each')
//   controls           podzbiór: basis, grow, shrink, order, alignSelf,
//                      minWidth, overflow
//   containerControls  podzbiór: wrap, gap, width
//   items              [{ label, long?, grow?, shrink?, basis?, order?,
//                         alignSelf?, minWidth?, overflow? }]
//   selected           początkowo wybrany indeks (scope 'each')
//   wrap/gap/width/direction/height  stan kontenera
//   hint               tekst dymka

const DEFAULT_VALUES = {
  basis: 'auto', grow: '0', shrink: '1', order: '0',
  alignSelf: 'auto', minWidth: 'auto', overflow: 'visible',
};

const ITEM_OPTIONS = {
  basis: [['auto'], ['80px'], ['100px'], ['120px'], ['0%']],
  grow: [['0'], ['1'], ['2']],
  shrink: [['0'], ['1']],
  order: [['-1'], ['0'], ['1']],
  alignSelf: [['auto'], ['flex-start'], ['center'], ['flex-end'], ['stretch']],
  minWidth: [['auto'], ['0px', '0']],
  overflow: [['visible'], ['hidden']],
};

const CSS_NAMES = {
  basis: 'flex-basis', grow: 'flex-grow', shrink: 'flex-shrink', order: 'order',
  alignSelf: 'align-self', minWidth: 'min-width', overflow: 'overflow-x',
};

const CONTROL_LABELS = {
  basis: 'flex-basis', grow: 'flex-grow', shrink: 'flex-shrink', order: 'order',
  alignSelf: 'align-self', minWidth: 'min-width', overflow: 'overflow-x',
};

const EFFECTS = {
  grow: (v) => (v === '0' ? null : `rośnie z udziałem ${v}`),
  shrink: (v) => (v === '1' ? null : 'nie kurczy się poniżej bazy'),
  basis: (v) => (v === 'auto' ? null : `startuje z bazy ${v}`),
  order: (v) => (v === '0' ? null : v === '-1' ? 'skacze na początek osi' : 'spada na koniec osi'),
  alignSelf: (v) => (v === 'auto' ? null : `wyrównuje się: ${v}`),
  minWidth: (v) => (v === 'auto' ? null : 'może się skurczyć poniżej treści'),
  overflow: (v) => (v === 'visible' ? null : 'nadmiar treści jest ucięty'),
};

const selectorFor = (index, count) => {
  if (index === 0) return '.item:first-child';
  if (index === count - 1 && count > 1) return '.item:last-child';
  return `.item:nth-child(${index + 1})`;
};

const ruleLines = (values, count) => Object.keys(DEFAULT_VALUES)
  .filter((key) => values[key] !== DEFAULT_VALUES[key])
  .map((key) => `  ${CSS_NAMES[key]}: ${values[key]};`);

export default function FlexItemBoard({
  scope = 'each',
  controls = ['grow'],
  containerControls = [],
  items = [
    { label: '1' }, { label: '2' }, { label: '3' },
  ],
  selected: initialSelected = 0,
  direction = 'row',
  wrap: initialWrap = 'nowrap',
  gap: initialGap = 8,
  width: initialWidth = 100,
  height = 0,
  hint = 'Wybierz element i zmień jego właściwości!',
}) {
  const [values, setValues] = useState(() => items.map((item) => ({ ...DEFAULT_VALUES, ...item })));
  const [selected, setSelected] = useState(Math.min(initialSelected, items.length - 1));
  const [wrap, setWrap] = useState(initialWrap);
  const [gap, setGap] = useState(initialGap);
  const [width, setWidth] = useState(initialWidth);
  const [hintVisible, setHintVisible] = useState(true);
  const itemsRef = useRef(null);
  const interact = () => setHintVisible(false);
  const has = (name) => controls.includes(name);
  const hasContainer = (name) => containerControls.includes(name);

  const setProp = (prop, value) => {
    setValues((prev) => prev.map((entry, index) => (
      scope === 'all' || index === selected ? { ...entry, [prop]: value } : entry
    )));
  };
  const current = scope === 'all' ? values[0] : values[selected];

  const onItemKeyDown = (event, index) => {
    const next = nextRadioIndex(event, index, items.length);
    if (next == null) return;
    setSelected(next);
    interact();
    itemsRef.current?.querySelectorAll('[role="radio"]')?.[next]?.focus();
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: direction,
    flexWrap: hasContainer('wrap') ? wrap : 'nowrap',
    gap: `${hasContainer('gap') ? gap : 8}px`,
    width: hasContainer('width') ? `${width}%` : '100%',
    minHeight: `${Math.max(height, has('alignSelf') ? 150 : 96)}px`,
  };
  const itemStyle = (v, item) => ({
    flexBasis: v.basis,
    flexGrow: Number(v.grow),
    flexShrink: Number(v.shrink),
    order: Number(v.order),
    alignSelf: v.alignSelf,
    minWidth: v.minWidth,
    overflowX: v.overflow,
    whiteSpace: item.long ? 'nowrap' : undefined,
    textOverflow: item.long ? 'ellipsis' : undefined,
  });
  const badges = (v) => Object.keys(DEFAULT_VALUES)
    .filter((key) => v[key] !== DEFAULT_VALUES[key]);

  const effectText = (v) => Object.entries(EFFECTS)
    .map(([key, effect]) => effect(v[key]))
    .filter(Boolean)
    .join(', ');
  const status = scope === 'all'
    ? `Wszystkie elementy .item: ${effectText(current) || 'wartości domyślne'}.`
    : `Element „${items[selected]?.label}”: ${effectText(current) || 'wartości domyślne — dziedziczy ustawienia kontenera'}.`;

  const lines = ['.practice {', '  display: flex;'];
  if (direction !== 'row') lines.push(`  flex-direction: ${direction};`);
  if (hasContainer('wrap')) lines.push(`  flex-wrap: ${wrap};`);
  if (hasContainer('gap')) lines.push(`  gap: ${gap}px;`);
  lines.push('}');
  if (scope === 'all') {
    const changed = ruleLines(current, items.length);
    lines.push(changed.length ? `.item {\n${changed.join('\n')}\n}` : '.item { /* wartości domyślne */ }');
  } else {
    values.forEach((v, index) => {
      const changed = ruleLines(v, items.length);
      if (changed.length) lines.push(`${selectorFor(index, items.length)} {\n${changed.join('\n')}\n}`);
    });
  }

  return (
    <div className="pilot-lb">
      <div className="pilot-lb-stage">
        <span className="pilot-lb-tag">.practice</span>
        <div className="pilot-lb-container" style={containerStyle} ref={itemsRef}
          {...(scope === 'each'
            ? { role: 'radiogroup', 'aria-label': 'Wybierz element do edycji' }
            : { role: 'img', 'aria-label': status })}>
          {items.map((item, index) => {
            const content = <>
              <span className="pilot-lb-item-label">{item.long ? item.longText ?? 'bardzo-długi-ciag-tekstu-bez-spacji-ktory-nie-chce-sie-zawijac' : item.label}</span>
              {badges(values[index]).length > 0 && (
                <span className="pilot-lb-badges" aria-hidden="true">
                  {badges(values[index]).map((key) => <span className="pilot-lb-badge" key={key}>{CSS_NAMES[key]}: {values[index][key]}</span>)}
                </span>
              )}
            </>;
            return scope === 'each'
              ? <button key={item.label} type="button" role="radio" aria-checked={index === selected}
                  aria-label={`Element ${item.label}`}
                  className="pilot-lb-item pilot-lb-item--pick" style={itemStyle(values[index], item)}
                  onClick={() => { setSelected(index); interact(); }}
                  onKeyDown={(event) => onItemKeyDown(event, index)}>
                  {content}
                </button>
              : <div key={item.label} className="pilot-lb-item" style={itemStyle(values[index], item)}>{content}</div>;
          })}
        </div>
        <HintBubble visible={hintVisible}>{hint}</HintBubble>
      </div>
      <div className="pilot-lb-controls">
        {has('basis') && <RadioGroup label="flex-basis" value={current.basis} onChange={(v) => setProp('basis', v)} onInteract={interact} options={ITEM_OPTIONS.basis} />}
        {has('grow') && <RadioGroup label="flex-grow" value={current.grow} onChange={(v) => setProp('grow', v)} onInteract={interact} options={ITEM_OPTIONS.grow} />}
        {has('shrink') && <RadioGroup label="flex-shrink" value={current.shrink} onChange={(v) => setProp('shrink', v)} onInteract={interact} options={ITEM_OPTIONS.shrink} />}
        {has('order') && <RadioGroup label="order" value={current.order} onChange={(v) => setProp('order', v)} onInteract={interact} options={ITEM_OPTIONS.order} />}
        {has('alignSelf') && <RadioGroup label="align-self" value={current.alignSelf} onChange={(v) => setProp('alignSelf', v)} onInteract={interact} options={ITEM_OPTIONS.alignSelf} />}
        {has('minWidth') && <RadioGroup label="min-width" value={current.minWidth} onChange={(v) => setProp('minWidth', v)} onInteract={interact} options={ITEM_OPTIONS.minWidth} />}
        {has('overflow') && <RadioGroup label="overflow-x" value={current.overflow} onChange={(v) => setProp('overflow', v)} onInteract={interact} options={ITEM_OPTIONS.overflow} />}
        {hasContainer('wrap') && <RadioGroup label="flex-wrap" value={wrap} onChange={setWrap} onInteract={interact} options={[['nowrap'], ['wrap']]} />}
        {hasContainer('gap') && <SliderRow label="gap" value={gap} min={0} max={32} step={2} onChange={setGap} onInteract={interact} />}
        {hasContainer('width') && <SliderRow label="szerokość kontenera" value={width} min={40} max={100} step={5} unit="%" onChange={setWidth} onInteract={interact} />}
      </div>
      <pre className="pilot-lb-code"><code>{lines.join('\n')}</code></pre>
      <p role="status" className="pilot-lb-status">{status}</p>
    </div>
  );
}
