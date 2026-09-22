import { JSDOM } from "jsdom";
import { compileModules } from "./moduleCompiler.js";
import { getReactRuntimeScripts } from "./reactRuntimeAssets.js";

function executeBundle(code, globals = {}) {
  new Function("globalThis", code)(globals);
  return globals;
}

test("supports default and named imports, re-exports, and executes a shared dependency once", () => {
  const result = compileModules(
    {
      "main.js": `
      import summary from './a.js';
      import {shared} from './b.js';
      globalThis.result = summary + ':' + shared;
    `,
      "a.js": `
      import {defaultValue, named} from './barrel.js';
      import './shared.js';
      export default defaultValue + ':' + named;
    `,
      "b.js": `
      import './shared.js';
      export {shared} from './shared.js';
    `,
      "barrel.js":
        "export {default as defaultValue, named} from './values.js';",
      "values.js": "export default 'default'; export const named = 'named';",
      "shared.js": `
      globalThis.calls = (globalThis.calls || 0) + 1;
      export const shared = 'shared';
    `,
    },
    "main.js",
  );

  expect(result.errors).toEqual([]);
  const globals = executeBundle(result.code);
  expect(globals.result).toBe("default:named:shared");
  expect(globals.calls).toBe(1);
});

test("collects imported CSS in execution order without duplicates", () => {
  const result = compileModules(
    {
      "main.js": "import './feature.js'; import './theme.css';",
      "feature.js": "import './base.css'; import './theme.css';",
      "base.css": "body { color: black; }",
      "theme.css": "body { color: rebeccapurple; }",
    },
    "main.js",
  );

  expect(result.errors).toEqual([]);
  expect(result.cssPaths).toEqual(["base.css", "theme.css"]);
  expect(() => executeBundle(result.code)).not.toThrow();
});

test("resolves extensionless JavaScript and JSX imports", () => {
  const result = compileModules(
    {
      "main.js":
        "import value from './components/Value'; globalThis.value = value;",
      "components/Value.jsx": "export default 'resolved';",
    },
    "main.js",
  );

  expect(result.errors).toEqual([]);
  expect(executeBundle(result.code).value).toBe("resolved");
});

test("renders stateful JSX with the bundled React globals", async () => {
  const result = compileModules(
    {
      "main.jsx": `
      import React, {useState} from 'react';
      import {createRoot} from 'react-dom/client';
      import App from './App.jsx';
      createRoot(document.getElementById('root')).render(<App />);
    `,
      "App.jsx": `
      import React, {useState} from 'react';
      export default function App() {
        const [count, setCount] = useState(0);
        return <button onClick={() => setCount(value => value + 1)}>{count}</button>;
      }
    `,
    },
    "main.jsx",
  );
  expect(result.errors).toEqual([]);

  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    runScripts: "dangerously",
    url: "http://localhost/",
  });
  const runtime = getReactRuntimeScripts();

  try {
    dom.window.eval(runtime.react);
    dom.window.eval(runtime.reactDom);
    dom.window.eval(result.code);
    await new Promise((resolve) => dom.window.setTimeout(resolve, 0));

    const button = dom.window.document.querySelector("button");
    expect(button).not.toBeNull();
    expect(button.textContent).toBe("0");

    button.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => dom.window.setTimeout(resolve, 0));
    expect(button.textContent).toBe("1");
  } finally {
    dom.window.close();
  }
});

test.each([
  {
    name: "missing local file",
    files: { "main.js": "import './missing.js';" },
    expected: ["main.js", "missing.js"],
  },
  {
    name: "unsupported package",
    files: {
      "main.js": "import thing from 'some-package'; globalThis.thing = thing;",
    },
    expected: ["main.js", "some-package"],
  },
  {
    name: "dynamic import",
    files: {
      "main.js": "import('./lazy.js');",
      "lazy.js": "export default 1;",
    },
    expected: ["main.js", "dynamic import"],
  },
  {
    name: "dynamic require",
    files: {
      "main.js": "const path = './lazy.js'; require(path);",
      "lazy.js": "module.exports = 1;",
    },
    expected: ["main.js", "require"],
  },
])("returns a filename-bearing error for $name", ({ files, expected }) => {
  const result = compileModules(files, "main.js");

  expect(result.code).toBe("");
  expect(result.errors).toHaveLength(1);
  for (const fragment of expected) {
    expect(result.errors[0].toLowerCase()).toContain(fragment.toLowerCase());
  }
});

test("reports a JavaScript cycle with every filename in the active chain", () => {
  const result = compileModules(
    {
      "main.js": "import './a.js';",
      "a.js": "import './b.js';",
      "b.js": "import './a.js';",
    },
    "main.js",
  );

  expect(result.code).toBe("");
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0]).toContain("a.js");
  expect(result.errors[0]).toContain("b.js");
});

test("includes the source filename in Babel syntax errors", () => {
  const result = compileModules(
    { "broken.jsx": "export default function App( {" },
    "broken.jsx",
  );

  expect(result.code).toBe("");
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0]).toContain("broken.jsx");
});

test("escapes closing script tags without changing the executed string", () => {
  const source = '</script><div id="injected"></div>';
  const result = compileModules(
    {
      "main.js": `globalThis.text = ${JSON.stringify(source)};`,
    },
    "main.js",
  );

  expect(result.errors).toEqual([]);
  expect(result.code.toLowerCase()).not.toContain("</script");
  expect(executeBundle(result.code).text).toBe(source);
});
