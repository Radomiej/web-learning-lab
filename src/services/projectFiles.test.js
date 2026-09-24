import {
  normalizeProject,
  resolveLocalPath,
  createProjectFile,
  relativeProjectPath,
} from "./projectFiles.js";

test("preserves an explicit CRA runtime manifest", () => {
  const runtime = {
    kind: "react-cra",
    module: "src/index.js",
    root: "#root",
    bootstrap: true,
  };
  const project = normalizeProject({
    entry: "public/index.html",
    runtime,
    files: {
      "public/index.html": "<!doctype html><div id=\"root\"></div>",
      "src/index.js": "",
    },
  });

  expect(project.runtime).toEqual(runtime);
  expect(normalizeProject(project)).toEqual(project);
});

test.each([
  ["public/index.html", "src/index.js", "../src/index.js"],
  ["index.html", "main.jsx", "./main.jsx"],
  ["src/components/Card.js", "src/hooks/useCounter.js", "../hooks/useCounter.js"],
])("creates a safe relative project reference from %s to %s", (from, target, expected) => {
  expect(relativeProjectPath(from, target)).toBe(expected);
});

test.each([
  { kind: "unknown-runtime", module: "src/index.js" },
  { kind: "react-cra", module: "../index.js" },
  { kind: "react-cra", module: "src/index.css" },
])("rejects an invalid runtime manifest %#", (runtime) => {
  expect(() => normalizeProject({
    entry: "public/index.html",
    runtime,
    files: { "public/index.html": "<div id=\"root\"></div>" },
  })).toThrow();
});

test("migration retains student source and CSS cascade", () => {
  const p = normalizeProject({
    html: "<main>Moja praca</main>",
    baseCss: "p{color:red}",
    themeCss: "p{color:blue}",
    js: "alert(1)",
  });
  expect(p.files["styles.css"]).toBe("p{color:red}\np{color:blue}");
  expect(p.files["index.html"]).toContain("<main>Moja praca</main>");
  expect(p.files["script.js"]).toBe("alert(1)");
  expect(normalizeProject(p)).toEqual(p);
});

test("legacy fragments keep their previously implicit CSS and React script connections", () => {
  const p = normalizeProject(
    {
      html: '<div id="root"></div>',
      baseCss: "body{color:red}",
      js: "window.mounted=true;",
    },
    { track: "react" },
  );
  expect(p.files["index.html"]).toContain('href="styles.css"');
  expect(p.files["index.html"]).toContain('src="main.jsx"');
  expect(p.files["index.html"]).toContain('<div id="root"></div>');
});
test("migration updates only recognized resource references", () => {
  const p = normalizeProject(
    {
      html: '<head><link rel="stylesheet" href="base.css"><link rel="stylesheet" href="theme.css"></head><body><script src="script.js" defer></script></body>',
      js: "const App=()=>null;",
      baseCss: "",
      themeCss: "",
    },
    { track: "react" },
  );
  expect(p.files["index.html"].match(/styles.css/g)).toHaveLength(1);
  expect(p.files["index.html"]).toContain('type="module"');
  expect(p.files["legacy.jsx"]).toBe("const App=()=>null;");
  expect(p.files["main.jsx"]).toContain("./legacy.jsx");
});
test.each([
  "../x.js",
  "/x.js",
  "https://a/x.js",
  "__proto__",
  "a\\x.js",
  "constructor.js",
  "a/../../b.js",
])("rejects unsafe new name %s", (name) => {
  expect(() =>
    createProjectFile({ entry: "index.html", files: {} }, { type: "js", name }),
  ).toThrow();
});
test("resolves relative imports within project and optional extensions", () => {
  const files = { "App.jsx": "", "components/Card.jsx": "" };
  expect(resolveLocalPath("components/Card.jsx", "../App", files)).toBe(
    "App.jsx",
  );
  expect(resolveLocalPath("App.jsx", "./components/Card", files)).toBe(
    "components/Card.jsx",
  );
  expect(() => resolveLocalPath("App.jsx", "../App", files)).toThrow();
  expect(() => resolveLocalPath("App.jsx", "./missing", files)).toThrow();
});
test("creates independent file without overwriting others", () => {
  const project = { entry: "index.html", files: { "App.jsx": "keep" } };
  const result = createProjectFile(project, {
    type: "react",
    name: "components/my-card",
  });
  expect(result.path).toBe("components/my-card.jsx");
  expect(result.project.files[result.path]).toContain(
    "export default function MyCard",
  );
  expect(project.files).toEqual({ "App.jsx": "keep" });
  expect(() =>
    createProjectFile(project, { type: "react", name: "App.jsx" }),
  ).toThrow();
  expect(() =>
    createProjectFile(project, { type: "css", name: "other.js" }),
  ).toThrow();
});

test("creates CRA React components under src with a .js extension", () => {
  const project = {
    entry: "public/index.html",
    runtime: {
      kind: "react-cra",
      module: "src/index.js",
      root: "#root",
      bootstrap: true,
    },
    files: {
      "public/index.html": "<div id=\"root\"></div>",
      "src/index.js": "",
    },
  };

  const result = createProjectFile(project, {
    type: "react",
    name: "components/Card",
  });

  expect(result.path).toBe("src/components/Card.js");
  expect(result.project.files[result.path]).toContain(
    "export default function Card",
  );
  expect(result.project.runtime).toEqual(project.runtime);
  expect(project.files[result.path]).toBeUndefined();
});

test("keeps an explicit CRA src path and protects it from duplicates", () => {
  const project = {
    entry: "public/index.html",
    runtime: {
      kind: "react-cra",
      module: "src/index.js",
      root: "#root",
      bootstrap: true,
    },
    files: {
      "public/index.html": "<div id=\"root\"></div>",
      "src/components/Card.js": "keep",
    },
  };

  expect(() =>
    createProjectFile(project, { type: "react", name: "src/components/Card" }),
  ).toThrow("Plik już istnieje");
  expect(() =>
    createProjectFile(project, { type: "react", name: "../Card" }),
  ).toThrow();
});
