import { JSDOM } from "jsdom";
import { buildPreviewDocument } from "./previewDocument.js";
import { resolveDocumentResources } from "./localResources.js";

const project = {
  entry: "index.html",
  files: {
    "index.html":
      '<!doctype html><html><head><link rel="stylesheet" href="styles.css"></head><body><p>Tekst</p><script src="script.js"></script></body></html>',
    "styles.css": "p{color:rgb(255, 0, 0)}",
    "unused.css": "p{color:blue !important}",
    "script.js": "document.querySelector('p').textContent='Działa';",
    "other.html":
      "<!doctype html><html><head><title>Druga</title></head><body>Inna strona</body></html>",
  },
};
test("executes only connected files and reloads changed CSS", () => {
  for (const color of ["rgb(255, 0, 0)", "rgb(0, 128, 0)"]) {
    const p = {
      ...project,
      files: { ...project.files, "styles.css": `p{color:${color}}` },
    };
    const dom = new JSDOM(buildPreviewDocument(p), {
      runScripts: "dangerously",
    });
    expect(dom.window.document.querySelector("p").textContent).toBe("Działa");
    expect(
      dom.window.getComputedStyle(dom.window.document.querySelector("p")).color,
    ).toBe(color);
    dom.window.close();
  }
});
test("selects separate HTML without merging entry content", () => {
  const result = resolveDocumentResources(project, "other.html");
  expect(result.bodyMarkup).toContain("Inna strona");
  expect(result.bodyMarkup).not.toContain("Tekst");
});

test("preserves body classes, ids, styles and escaped attributes", () => {
  const p = {
    entry: "index.html",
    files: {
      "index.html":
        '<body id="page" class="dark" style="color:red" data-note="&quot;test&amp;"><p>Body</p></body>',
    },
  };
  const dom = new JSDOM(buildPreviewDocument(p));
  expect(dom.window.document.body.id).toBe("page");
  expect(dom.window.document.body.className).toBe("dark");
  expect(dom.window.document.body.style.color).toBe("red");
  expect(dom.window.document.body.dataset.note).toBe('"test&');
  dom.window.close();
});
test("resolves CSS imports and reports cycles and missing linked files", () => {
  const p = {
    ...project,
    files: {
      ...project.files,
      "styles.css": '@import "./nested/colors.css";',
      "nested/colors.css": "p{color:red}",
    },
  };
  expect(resolveDocumentResources(p, "index.html").headMarkup).toContain(
    "p{color:red}",
  );
  p.files["nested/colors.css"] = '@import "../styles.css";';
  expect(resolveDocumentResources(p, "index.html").errors.join(" ")).toMatch(
    /cykl/i,
  );
  delete p.files["styles.css"];
  expect(resolveDocumentResources(p, "index.html").errors.join(" ")).toContain(
    "styles.css",
  );
});
test("classic scripts retain shared globals without early deferred execution", () => {
  const p = {
    entry: "index.html",
    files: {
      "index.html":
        '<head><script defer src="a.js"></script></head><body><p></p><script src="b.js"></script><script src="c.js"></script></body>',
      "a.js": "document.querySelector('p').textContent += 'D';",
      "b.js": "var shared='B';",
      "c.js": "document.querySelector('p').textContent=shared+'C';",
    },
  };
  const dom = new JSDOM(buildPreviewDocument(p), { runScripts: "dangerously" });
  expect(dom.window.document.querySelector("p").textContent).toBe("BCD");
  dom.window.close();
});
test("source closing tags cannot inject markup", () => {
  const p = {
    ...project,
    files: {
      ...project.files,
      "script.js": `document.querySelector('p').textContent='</script><i id="bad">';`,
      "styles.css": 'p::after {content:"</style><i id=bad>"}',
    },
  };
  const dom = new JSDOM(buildPreviewDocument(p), { runScripts: "dangerously" });
  expect(dom.window.document.querySelector("#bad")).toBeNull();
  expect(dom.window.document.querySelector("p").textContent).toBe(
    '</script><i id="bad">',
  );
  dom.window.close();
});

test("shares module instances between document entry scripts", () => {
  const p = {
    entry: "index.html",
    files: {
      "index.html":
        '<script type="module" src="a.js"></script><script type="module" src="b.js"></script>',
      "a.js": "import './shared.js';",
      "b.js": "import './shared.js';",
      "shared.js": "globalThis.calls = (globalThis.calls || 0) + 1;",
    },
  };
  const dom = new JSDOM(buildPreviewDocument(p), { runScripts: "dangerously" });
  expect(dom.window.calls).toBe(1);
  dom.window.close();
});

test("resolves unquoted CSS url imports without host fallback", () => {
  const p = {
    ...project,
    files: {
      ...project.files,
      "styles.css": "@import url(./nested/colors.css);",
      "nested/colors.css": "p{color:green}",
    },
  };
  expect(resolveDocumentResources(p).headMarkup).toContain("p{color:green}");
  delete p.files["nested/colors.css"];
  expect(resolveDocumentResources(p).errors.join(" ")).toContain("colors.css");
});
