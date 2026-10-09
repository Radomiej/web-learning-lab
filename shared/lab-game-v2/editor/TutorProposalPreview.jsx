export default function TutorProposalPreview({ proposal }) {
  if (proposal.changes?.length) return <div>{proposal.changes.map((edit,index)=><TutorProposalPreview key={index} proposal={{...proposal,changes:undefined,edit}}/>)}</div>;
  if (proposal.operation === 'delete') return <details><summary>Plik zostanie usunięty</summary><pre><code>{proposal.edit?.before ?? ''}</code></pre></details>;
  const edit = proposal.edit;
  if (!edit) return <details><summary>Zobacz proponowany kod</summary><pre><code>{proposal.content}</code></pre></details>;
  return <details open><summary>{edit.endLine < edit.startLine ? `Wstaw przed linią ${edit.startLine}` : `Popraw linie ${edit.startLine}–${edit.endLine}`}</summary><div className="tutor-edit-before"><small>Przed zmianą</small><pre><code>{edit.before || '(puste)'}</code></pre></div><div className="tutor-edit-after"><small>Po zmianie</small><pre><code>{edit.after || '(usuń wybrane linie)'}</code></pre></div></details>;
}
