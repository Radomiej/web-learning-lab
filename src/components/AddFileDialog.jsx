import { useState } from "react";
import { createProjectFile } from "../services/projectFiles.js";
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
  const [type, setType] = useState(project?.runtime?.kind === "php-wasm" ? "php" : "html");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const isCraProject = project?.runtime?.kind === "react-cra";
  const typeMeta = getFileTypeMeta(type, { reactProject: isCraProject });
  const reactMeta = getFileTypeMeta("react", { reactProject: isCraProject });
  const hint =
    type === "react" && isCraProject
      ? 'Plik powstanie jako src/components/Card.js. Zaimportuj go w src/App.js, np. import Card from "./components/Card.js", i użyj <Card />. Plik nie jest podłączany automatycznie.'
      : hints[type];
  function submit(event) {
    event.preventDefault();
    try {
      onCreate(createProjectFile(project, { type, name }));
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
