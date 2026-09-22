export default function EditorTabs({ files, activeFile, onFileChange }) {
  const tabs=Object.keys(files).map(path=>({key:path,label:path}));
  return (
    <div className="editor-tabs" role="tablist" aria-label="Pliki projektu">
      {tabs.map((tab) => (
        <button
          className={`editor-tab${activeFile === tab.key ? ' is-active' : ''}`}
          type="button"
          role="tab"
          aria-label={tab.label}
          aria-selected={activeFile === tab.key}
          key={tab.key}
          onClick={() => onFileChange(tab.key)}
        >
          <span className="file-icon" aria-hidden="true">{tab.key.endsWith('.html') ? '‹›' : /\.jsx?$/.test(tab.key) ? 'JS' : '◈'}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
