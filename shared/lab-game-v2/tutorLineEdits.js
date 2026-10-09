function materializeSingleEdits(proposals, files) {
  if (!Array.isArray(proposals)) throw new Error('Nieprawidłowa lista poprawek.');
  return proposals.map(item => {
    if (item?.operation === 'delete') {
      if (!Object.hasOwn(files ?? {}, item.path)) throw new Error('Plik do usunięcia nie istnieje.');
      const before = files[item.path];
      return { ...item, content: '', edit: { startLine: 1, endLine: before.split(/\r?\n/).length, before, after: '' } };
    }
    if (item.startLine === undefined && item.endLine === undefined) {
      const original = files?.[item.path];
      if (typeof original !== 'string' || typeof item.content !== 'string' || original === item.content) return item;
      const before = original.split(/\r?\n/), after = item.content.split(/\r?\n/);
      let start = 0, endBefore = before.length, endAfter = after.length;
      while (start < endBefore && start < endAfter && before[start] === after[start]) start++;
      while (endBefore > start && endAfter > start && before[endBefore - 1] === after[endAfter - 1]) { endBefore--; endAfter--; }
      return { ...item, edit: { startLine: start + 1, endLine: endBefore, before: before.slice(start, endBefore).join('\n'), after: after.slice(start, endAfter).join('\n') } };
    }
    const original = files?.[item.path];
    if (typeof original !== 'string' || typeof item.content !== 'string') throw new Error('Poprawka wymaga istniejącego pliku.');
    const { startLine, endLine } = item;
    const lines = original.split(/\r?\n/);
    if (!Number.isInteger(startLine) || !Number.isInteger(endLine) || startLine < 1 || endLine < startLine - 1 || endLine > lines.length || startLine > lines.length + 1) throw new Error('Nieprawidłowy zakres linii.');
    const before = lines.slice(startLine - 1, endLine).join('\n');
    const after = item.content;
    const replacement = after === '' ? [] : after.split(/\r?\n/);
    lines.splice(startLine - 1, endLine - startLine + 1, ...replacement);
    return { path: item.path, reason: item.reason, content: lines.join(original.includes('\r\n') ? '\r\n' : '\n'), edit: { startLine, endLine, before, after } };
  });
}
export function materializeLineEdits(proposals, files) {
  if (!Array.isArray(proposals) || proposals.length > 10) throw new Error('Nieprawidłowa lista poprawek.');
  const grouped = new Map();
  for (const proposal of proposals) {
    if (!proposal || typeof proposal.path !== 'string') throw new Error('Nieprawidłowy plik poprawki.');
    const group = grouped.get(proposal.path) ?? [];
    if (proposal.edits !== undefined) {
      if (!Array.isArray(proposal.edits) || !proposal.edits.length || proposal.edits.length > 10 || proposal.operation === 'delete') throw new Error('Nieprawidłowe zakresy poprawek.');
      group.push(...proposal.edits.map(edit => ({...edit,path:proposal.path,reason:proposal.reason})));
    } else group.push(proposal);
    if (group.length > 10) throw new Error('Zbyt wiele poprawek jednego pliku.');
    grouped.set(proposal.path,group);
  }
  return [...grouped.values()].map(group => {
    if (group.length === 1) return materializeSingleEdits(group,files)[0];
    if (group.some(item=>item.operation === 'delete' || !Number.isInteger(item.startLine) || !Number.isInteger(item.endLine))) throw new Error('Nie można łączyć całego pliku lub usunięcia z innymi poprawkami.');
    const sorted=[...group].sort((a,b)=>a.startLine-b.startLine);
    for(let index=1;index<sorted.length;index++) if(sorted[index].startLine<=sorted[index-1].endLine || sorted[index].startLine===sorted[index-1].startLine) throw new Error('Zakresy poprawek nakładają się.');
    const original=files?.[sorted[0].path];
    const changes=sorted.map(item=>materializeSingleEdits([item],files)[0].edit);
    const lines=original.split(/\r?\n/);
    for(const item of [...sorted].reverse()) lines.splice(item.startLine-1,item.endLine-item.startLine+1,...(item.content===''?[]:item.content.split(/\r?\n/)));
    return {path:sorted[0].path,content:lines.join(original.includes('\r\n')?'\r\n':'\n'),reason:[...new Set(sorted.map(item=>item.reason).filter(Boolean))].join('\n'),changes};
  });
}
export function changesMetadata(changes) {
  if (changes === undefined) return {};
  if (!Array.isArray(changes) || !changes.length || changes.length > 10) throw new Error('Nieprawidłowe podglądy poprawek.');
  return {changes:changes.map(change=>editMetadata(change).edit)};
}
export function editMetadata(edit) {
  if (!edit) return {};
  if (!Number.isInteger(edit.startLine) || !Number.isInteger(edit.endLine) || edit.startLine < 1 || edit.endLine < edit.startLine - 1 || typeof edit.before !== 'string' || typeof edit.after !== 'string' || edit.before.length > 50000 || edit.after.length > 50000) throw new Error('Nieprawidłowy podgląd poprawki.');
  return { edit: { startLine: edit.startLine, endLine: edit.endLine, before: edit.before, after: edit.after } };
}
