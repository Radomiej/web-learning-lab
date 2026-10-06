import { useEffect, useRef, useState } from 'react';

export function matchesModel(model, query) {
  const text = `${model.name} ${model.id}`.toLocaleLowerCase();
  return query.trim().toLocaleLowerCase().split(/\s+/).every(word => {
    let position = -1;
    return [...word].every(letter => { position = text.indexOf(letter, position + 1); return position !== -1; });
  });
}

export default function ModelPicker({ models, value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const root = useRef(null);
  const trigger = useRef(null);
  const search = useRef(null);
  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const close = event => { if (!root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  const visible = models.filter(model => matchesModel(model, query));
  return <div className="model-picker" ref={root} onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } }}>
    <button ref={trigger} type="button" className="model-picker-trigger" disabled={disabled} aria-expanded={open} aria-label="Wybierz model" onClick={() => { setQuery(''); setOpen(value => !value); }}>{models.find(model => model.id === value)?.name || 'Wybierz model…'} <span aria-hidden="true">⌄</span></button>
    {open && <div className="model-picker-popup"><input ref={search} type="search" aria-label="Szukaj modelu" placeholder="Szukaj nazwy lub dostawcy…" value={query} onChange={event => setQuery(event.target.value)} /><small>{visible.length} z {models.length} darmowych modeli</small><select size={Math.min(8, Math.max(2, visible.length))} aria-label="Darmowy model OpenRouter" value={value} onChange={event => { onChange(event.target.value); setOpen(false); trigger.current?.focus(); }}>{visible.map(model => <option key={model.id} value={model.id}>{model.name} · {model.id}</option>)}</select>{!visible.length && <p>Brak pasujących modeli.</p>}</div>}
  </div>;
}
