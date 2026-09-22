function AddFileIcon() {
  return (
    <svg aria-hidden="true" className="editor-tab-add-icon" viewBox="0 0 20 20">
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

export default function EditorTabs({
  files,
  activeFile,
  onFileChange,
  onAddFile,
}) {
  const tabs = Object.keys(files).map((path) => ({ key: path, label: path }));
  return (
    <div
      className="editor-tabs"
      role="group"
      aria-label="Pliki projektu i akcje"
    >
      <div
        className="editor-tablist"
        role="tablist"
        aria-label="Pliki projektu"
      >
        {tabs.map((tab) => (
          <button
            className={`editor-tab${activeFile === tab.key ? " is-active" : ""}`}
            type="button"
            role="tab"
            aria-label={tab.label}
            aria-selected={activeFile === tab.key}
            key={tab.key}
            onClick={() => onFileChange(tab.key)}
          >
            <span className="file-icon" aria-hidden="true">
              {tab.key.endsWith(".html")
                ? "‹›"
                : /\.jsx?$/.test(tab.key)
                  ? "JS"
                  : "◈"}
            </span>
            {tab.label}
          </button>
        ))}
      </div>
      <button
        className="editor-tab editor-tab--add"
        type="button"
        onClick={onAddFile}
      >
        <AddFileIcon />
        Dodaj plik
      </button>
    </div>
  );
}
