import { useState } from "react";
import {
  createProjectFile,
  relativeProjectPath,
} from "../services/projectFiles.js";
import EditorDialog from "./EditorDialog.jsx";
import FileTypeIcon, { getFileTypeMeta } from "./FileTypeIcon.jsx";

const hints = {
  html: "Nowy dokument otworzysz przez „Strona podglądu”. Sprawdzanie zadania zawsze dotyczy index.html.",
  css: 'Podłącz plik w HTML: <link rel="stylesheet" href="nazwa.css"> albo zaimportuj go w module.',
  js: 'Podłącz plik w HTML przez <script src="nazwa.js" defer></script> albo import w module.',
  react:
    'Zaimportuj komponent w App.jsx, np. import Card from "./components/Card.jsx", i użyj <Card />. Plik nie jest podłączany automatycznie.',
  php: "Plik PHP zostanie dodany do projektu uruchamianego przez PHP.wasm. Połącz go przez require albo include, jeśli potrzebujesz podzielić kod.",
};
export default function AddFileDialog({ project, onCreate, onClose }) {
  const [type, setType] = useState(
    project?.runtime?.kind === "php-wasm"
      ? "php"
      : project?.runtime?.kind === "game-js"
        ? "js"
        : "html",
  );
  const [name, setName] = useState("");
  const [folder, setFolder] = useState("");
  const [error, setError] = useState("");
  const isCraProject = project?.runtime?.kind === "react-cra";
  const supportsFolder = type === "js" || type === "react";
  const typeMeta = getFileTypeMeta(type, { reactProject: isCraProject });
  const reactMeta = getFileTypeMeta("react", { reactProject: isCraProject });
  const extension = type === "react" ? reactMeta.extension.slice(1) : "js";
  const basename = name.split("/").pop() || (type === "react" ? "Card" : "NowyPlik");
  const componentName = basename
    .replace(/\.[^.]+$/, "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
  const exportName = /^[A-Z]/.test(componentName)
    ? componentName
    : `Component${componentName}`;
  const filename = basename.includes(".")
    ? basename
    : `${basename}.${extension}`;
  let previewPath = name.trim();
  const previewFolder = folder.trim();
  if (
    previewFolder &&
    previewPath &&
    previewPath !== previewFolder &&
    !previewPath.startsWith(`${previewFolder}/`)
  ) {
    previewPath = `${previewFolder}/${previewPath}`;
  }
  if (previewPath && !previewPath.endsWith(`.${extension}`)) previewPath += `.${extension}`;
  if (
    type === "react" &&
    isCraProject &&
    previewPath &&
    !previewPath.startsWith("src/")
  ) {
    previewPath = `src/${previewPath}`;
  }
  let importPath = `./${folder ? `${folder}/` : ""}${filename}`;
  if (previewPath) {
    try {
      importPath = relativeProjectPath(
        isCraProject ? "src/App.js" : "App.jsx",
        previewPath,
      );
    } catch {
      // Keep the dialog usable while the user is typing an incomplete path.
      importPath = "./…";
    }
  }
  const hint = type === "react"
    ? isCraProject
      ? `Plik: ${previewPath || `src/${folder ? `${folder}/` : "components/"}${filename}`}. Zaimportuj go w src/App.js: import ${exportName} from "${importPath}"; potem użyj komponentu w JSX.`
      : `Plik: ${previewPath || `${folder ? `${folder}/` : ""}${filename}`}. Zaimportuj go w App.jsx: import ${exportName} from "${importPath}"; potem użyj komponentu w JSX.`
    : type === "js" && folder
      ? `Plik powstanie jako ${previewPath}. Zaimportuj go z pliku, który będzie go używać, albo połącz ścieżką z HTML.`
      : hints[type];
  function submit(event) {
    event.preventDefault();
    try {
      onCreate(
        createProjectFile(project, {
          type,
          name,
          folder: supportsFolder ? folder : "",
        }),
      );
    } catch (problem) {
      setError(problem.message);
    }
  }
  return (
    <EditorDialog title="Dodaj plik" onClose={onClose}>
      <form onSubmit={submit}>
        <label htmlFor="new-file-type">Typ pliku</label>
        <select
          id="new-file-type"
          value={type}
          onChange={(event) => {
            setType(event.target.value);
            if (event.target.value === "react" && !folder) setFolder("components");
            setError("");
          }}
        >
          <option value="html">HTML (.html)</option>
          <option value="css">CSS (.css)</option>
          <option value="js">JavaScript (.js)</option>
          <option value="react">React ({reactMeta.extension})</option>
          <option value="php">PHP (.php)</option>
        </select>
        <div className="file-type-preview" aria-live="polite">
          <FileTypeIcon type={type} labelled reactProject={isCraProject} />
          <div>
            <strong>{typeMeta.label}</strong>
            <span>
              {typeMeta.extension} · {typeMeta.description}
            </span>
          </div>
        </div>
        <label htmlFor="new-file-name">Nazwa pliku</label>
        <input
          id="new-file-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
          required
          autoComplete="off"
          aria-describedby="new-file-hint"
        />
        {supportsFolder && (
          <>
            <label htmlFor="new-file-folder">
              Folder <span>(opcjonalnie)</span>
            </label>
            <input
              id="new-file-folder"
              value={folder}
              onChange={(event) => {
                setFolder(event.target.value);
                setError("");
              }}
              placeholder="components, systems, custom"
              autoComplete="off"
              aria-describedby="new-file-folder-hint"
            />
            <p id="new-file-folder-hint">
              Foldery utworzą się automatycznie. Możesz też podać ścieżkę, np.{" "}
              <code>systems/physics</code>.
            </p>
          </>
        )}
        <p id="new-file-hint">{hint}</p>
        {error && <p role="alert">{error}</p>}
        <div className="editor-dialog-actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={onClose}
          >
            Anuluj
          </button>
          <button type="submit" className="button button--primary">
            Utwórz plik
          </button>
        </div>
      </form>
    </EditorDialog>
  );
}
