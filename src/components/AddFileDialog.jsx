import { useState } from "react";
import { createProjectFile } from "../services/projectFiles.js";
import EditorDialog from "./EditorDialog.jsx";

const hints = {
  html: "Nowy dokument otworzysz przez „Strona podglądu”. Sprawdzanie zadania zawsze dotyczy index.html.",
  css: 'Podłącz plik w HTML: <link rel="stylesheet" href="nazwa.css"> albo zaimportuj go w module.',
  js: 'Podłącz plik w HTML przez <script src="nazwa.js" defer></script> albo import w module.',
  react:
    'Zaimportuj komponent w App.jsx, np. import Card from "./components/Card.jsx", i użyj <Card />. Plik nie jest podłączany automatycznie.',
};
export default function AddFileDialog({ project, onCreate, onClose }) {
  const [type, setType] = useState("html");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
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
          <option value="react">React (.jsx)</option>
        </select>
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
        <p id="new-file-hint">{hints[type]}</p>
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
