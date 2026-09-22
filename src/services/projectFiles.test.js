import {
  normalizeProject,
  resolveLocalPath,
  createProjectFile,
} from "./projectFiles.js";

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
