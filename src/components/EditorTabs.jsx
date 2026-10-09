import FileTypeIcon, { getFileTypeFromPath } from "./FileTypeIcon.jsx";
import { EditorIcon, useEditorTabs } from '../../shared/lab-game-v2/editor/EditorUI.jsx';

export default function EditorTabs({
  files,
  activeFile,
  onFileChange,
  onAddFile,
  runtime,
  workspaceKey,
}) {
  const reactProject = runtime?.kind?.startsWith("react") ?? false;
  const tabLayout = useEditorTabs(Object.keys(files), workspaceKey);
  const tabs = tabLayout.order.map((path) => ({ key: path, label: path }));
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
            {...tabLayout.tabProps(tab.key)}
            onClick={() => onFileChange(tab.key)}
          >
            <FileTypeIcon
              type={getFileTypeFromPath(tab.key, { reactProject })}
              reactProject={reactProject}
            />
            {tab.label}
          </button>
        ))}
      </div>
      <button
        className="editor-tab editor-tab--add"
        type="button"
        onClick={onAddFile}
        aria-label="Dodaj plik"
        title="Dodaj plik"
      >
        <EditorIcon action="add" />
      </button>
    </div>
  );
}
