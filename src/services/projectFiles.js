const extensions = { html: "html", css: "css", js: "js", react: "jsx", php: "php" };
const forbidden = new Set(["__proto__", "prototype", "constructor"]);

function safePath(value, relative = false) {
  if (
    typeof value !== "string" ||
    !value ||
    value !== value.trim() ||
    /[\\:#?%\s<>"'\x00-\x1f]/.test(value) ||
    value.startsWith("/")
  )
    throw new Error("Podaj względną nazwę pliku, np. components/Card.jsx.");
  const parts = [];
  for (const part of value.split("/")) {
    if (part === "." && relative) continue;
    if (part === ".." && relative) {
      if (!parts.length) throw new Error("Ścieżka wychodzi poza projekt.");
      parts.pop();
      continue;
    }
    if (
      !part ||
      part === "." ||
      part === ".." ||
      forbidden.has(part.split(".")[0])
    )
      throw new Error("Niedozwolona nazwa pliku.");
    parts.push(part);
  }
  return parts.join("/");
}

export function resolveLocalPath(from, specifier, files) {
  const directory = from.includes("/")
    ? from.slice(0, from.lastIndexOf("/") + 1)
    : "";
  if (/^(?:[a-z]+:|\/|\\)/i.test(specifier))
    throw new Error(`${from}: niedozwolona ścieżka ${specifier}`);
  const path = safePath(directory + specifier, true);
  const found = [path, `${path}.js`, `${path}.jsx`].find((candidate) =>
    Object.hasOwn(files, candidate),
  );
  if (!found) throw new Error(`${from}: nie znaleziono pliku ${specifier}`);
  return found;
}

function normalizeRuntime(runtime) {
  if (runtime === undefined) return undefined;
  if (!runtime || typeof runtime !== "object" || Array.isArray(runtime))
    throw new Error("Nieprawidłowy manifest runtime.");
  const knownKinds = new Set(["react-cra", "react-vite", "php-wasm", "game-js"]);
  if (!knownKinds.has(runtime.kind))
    throw new Error(`Nieznany runtime projektu: ${runtime.kind}.`);
  if (runtime.kind === 'game-js') return { kind: 'game-js' };
  if (runtime.kind === "php-wasm") {
    if (runtime.phpVersion !== undefined && runtime.phpVersion !== "8.4")
      throw new Error("Runtime PHP obsługuje obecnie wersję 8.4.");
    return { ...runtime, phpVersion: runtime.phpVersion || "8.4" };
  }
  if (typeof runtime.module !== "string" || !/\.(?:js|jsx)$/i.test(runtime.module))
    throw new Error("Runtime musi wskazywać moduł .js albo .jsx.");
  safePath(runtime.module);
  if (runtime.root !== undefined && typeof runtime.root !== "string")
    throw new Error("Nieprawidłowy selektor root runtime.");
  if (runtime.bootstrap !== undefined && typeof runtime.bootstrap !== "boolean")
    throw new Error("Nieprawidłowa flaga Bootstrap runtime.");
  return { ...runtime };
}

export function normalizeProject(bundle = {}, { track = "html" } = {}) {
  if (bundle.files && typeof bundle.files === "object") {
    const files = Object.fromEntries(
      Object.entries(bundle.files).map(([path, value]) => {
        safePath(path);
        if (typeof value !== "string")
          throw new Error(`Nieprawidłowa zawartość ${path}.`);
        return [path, value];
      }),
    );
    const runtime = normalizeRuntime(bundle.runtime);
    if (runtime?.kind === 'game-js') {
      // Remove only the obsolete stock hint from saved course projects.
      for (const path of Object.keys(files).filter(path => path.endsWith('.html'))) {
        files[path] = files[path].replace(/\s*<p class="controls">Kliknij planszę, aby sterować\. (?:Strzałki \/ )?WASD · Spacja · R<\/p>/g, '');
      }
    }
    const extension = runtime?.kind === "php-wasm" ? ".php" : ".html";
    const entry = safePath(bundle.entry || `index${extension}`);
    if (!Object.hasOwn(files, entry) || !entry.endsWith(extension))
      throw new Error(runtime?.kind === "php-wasm" ? "Brak pliku wejściowego PHP." : "Brak dokumentu wejściowego HTML.");
    return runtime === undefined ? { entry, files } : { entry, files, runtime };
  }
  let linked = false;
  let html = String(bundle.html ?? "").replace(
    /<link\b[^>]*href=["'](?:\.\/)?(?:base|theme)\.css["'][^>]*>/gi,
    () => {
      if (linked) return "";
      linked = true;
      return '<link rel="stylesheet" href="styles.css">';
    },
  );
  const files = {
    "index.html": html,
    "styles.css": [bundle.baseCss ?? "", bundle.themeCss ?? ""].join("\n"),
  };
  if (track === "react") {
    html = html.replace(
      /<script\b[^>]*src=["'](?:\.\/)?script\.js["'][^>]*>\s*<\/script>/gi,
      '<script type="module" src="main.jsx"></script>',
    );
    files["index.html"] = html;
    files["main.jsx"] = "import './legacy.jsx';\n";
    files["legacy.jsx"] = String(bundle.js ?? "");
  } else files["script.js"] = String(bundle.js ?? "");
  // v2 injected these resources even when a saved draft contained only a fragment.
  // Keep that behaviour without replacing the student's markup with a template.
  const script = track === "react" ? "main.jsx" : "script.js";
  let document = files["index.html"];
  if (!/href=["'](?:\.\/)?styles\.css["']/i.test(document)) {
    const link = '<link rel="stylesheet" href="styles.css">';
    document = /<\/head>/i.test(document)
      ? document.replace(/<\/head>/i, `${link}\n</head>`)
      : `${link}\n${document}`;
  }
  if (
    !new RegExp(`src=["'](?:\\./)?${script.replace(".", "\\.")}["']`, "i").test(
      document,
    )
  ) {
    const tag = `<script${track === "react" ? ' type="module"' : ""} src="${script}"></script>`;
    document = /<\/body>/i.test(document)
      ? document.replace(/<\/body>/i, `${tag}\n</body>`)
      : `${document}\n${tag}`;
  }
  files["index.html"] = document;
  return { entry: "index.html", files };
}

export function relativeProjectPath(fromFile, targetFile) {
  const from = safePath(fromFile);
  const target = safePath(targetFile);
  const fromDirectory = from.includes("/")
    ? from.split("/").slice(0, -1)
    : [];
  const targetParts = target.split("/");
  let common = 0;
  while (
    common < fromDirectory.length &&
    common < targetParts.length &&
    fromDirectory[common] === targetParts[common]
  ) {
    common += 1;
  }
  const upward = Array(fromDirectory.length - common).fill("..");
  const downward = targetParts.slice(common);
  const result = [...upward, ...downward].join("/");
  return result.startsWith(".") ? result : `./${result}`;
}

export function createProjectFile(project, { type, name, folder = "" }) {
  const isCraReact = type === "react" && project?.runtime?.kind === "react-cra";
  const extension = isCraReact ? "js" : extensions[type];
  if (!extension) throw new Error("Wybierz typ pliku.");
  let path = safePath(name);
  if (folder) {
    const normalizedFolder = safePath(folder);
    if (path !== normalizedFolder && !path.startsWith(`${normalizedFolder}/`)) {
      path = `${normalizedFolder}/${path}`;
    }
  }
  if (isCraReact && !path.startsWith("src/")) path = `src/${path}`;
  const basename = path.split("/").pop();
  if (!basename.includes(".")) path += `.${extension}`;
  if (!path.endsWith(`.${extension}`))
    throw new Error(`Ten typ pliku wymaga rozszerzenia .${extension}.`);
  if (Object.hasOwn(project.files, path)) throw new Error("Plik już istnieje.");
  const component = basename
    .replace(/\.[^.]+$/, "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
  const identifier = /^[A-Z]/.test(component)
    ? component
    : `Component${component}`;
  const source =
    type === "react"
      ? `import React from 'react';\n\nexport default function ${identifier}() {\n  return <section>${identifier}</section>;\n}\n`
      : type === "html"
        ? '<!doctype html>\n<html lang="pl">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Nowa strona</title>\n</head>\n<body>\n  <h1>Nowa strona</h1>\n</body>\n</html>\n'
        : type === "css"
          ? "/* Dodaj style i podłącz ten plik do HTML lub modułu. */\n"
          : type === "php"
            ? "<?php\n\n// Napisz tutaj kod PHP.\n"
            : "// Podłącz ten plik przez script albo import.\n";
  return {
    project: { ...project, files: { ...project.files, [path]: source } },
    path,
  };
}
