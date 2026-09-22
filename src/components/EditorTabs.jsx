const tabs = [
  { key: 'html', label: 'index.html' },
  { key: 'baseCss', label: 'base.css' },
  { key: 'themeCss', label: 'theme.css' },
  { key: 'js', label: 'script.js' },
];

export { tabs };

export default function EditorTabs({ activeFile, onFileChange }) {
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
          <span className={`file-icon file-icon--${tab.key}`} aria-hidden="true">{tab.key === 'html' ? '‹›' : tab.key === 'js' ? 'JS' : '◈'}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
