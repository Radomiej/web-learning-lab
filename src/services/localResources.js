import { resolveLocalPath } from "./projectFiles.js";
import { compileModules } from "./moduleCompiler.js";

const safeScript = (text) =>
  String(text).replace(/<\/script/gi, "\\x3c/script");
const safeStyle = (text) => String(text).replace(/<\/style/gi, "\\3c /style");

export function resolveDocumentResources(
  project,
  documentPath = project.entry,
) {
  const errors = [];
  const deferred = [];
  const moduleStyles = new Set();
  const sharedRuntimeKey = `__wll_modules_${crypto.randomUUID()}`;
  const files = project.files;
  if (!Object.hasOwn(files, documentPath))
    return {
      headMarkup: "",
      bodyMarkup: "",
      htmlAttributes: 'lang="pl"',
      doctype: "<!doctype html>",
      errors: [`Brak dokumentu ${documentPath}.`],
    };
  const doc = new DOMParser().parseFromString(files[documentPath], "text/html");
  function cssSource(path, stack = []) {
    if (stack.includes(path))
      throw new Error(`Cykl CSS: ${[...stack, path].join(" → ")}`);
    return files[path].replace(
      /@import\s+(?:url\(\s*(?:"([^"]+)"|'([^']+)'|([^\s)'";]+))\s*\)|"([^"]+)"|'([^']+)')\s*([^;]*);/gi,
      (_, doubleUrl, singleUrl, bareUrl, doubleString, singleString, media) => {
        const specifier =
          doubleUrl ?? singleUrl ?? bareUrl ?? doubleString ?? singleString;
        const nested = cssSource(resolveLocalPath(path, specifier, files), [
          ...stack,
          path,
        ]);
        return media.trim() ? `@media ${media.trim()} {${nested}}` : nested;
      },
    );
  }
  function style(path) {
    const element = doc.createElement("style");
    element.dataset.file = path;
    element.textContent = safeStyle(cssSource(path));
    return element;
  }
  for (const element of [
    ...doc.querySelectorAll('link[rel~="stylesheet"][href],script'),
  ]) {
    try {
      if (element.tagName === "LINK") {
        const next = style(
          resolveLocalPath(documentPath, element.getAttribute("href"), files),
        );
        if (element.hasAttribute("media"))
          next.setAttribute("media", element.getAttribute("media"));
        element.replaceWith(next);
        continue;
      }
      const type = element.getAttribute("type") || "";
      if (
        type &&
        !["module", "text/javascript", "application/javascript"].includes(type)
      )
        continue;
      const module = type === "module";
      const src = element.getAttribute("src");
      const path = src
        ? resolveLocalPath(documentPath, src, files)
        : `${documentPath}.inline-${deferred.length}.js`;
      let source = src ? files[path] : element.textContent;
      if (module) {
        const compilation = compileModules(
          src ? files : { ...files, [path]: source },
          path,
          { sharedRuntimeKey },
        );
        if (compilation.errors.length)
          throw new Error(compilation.errors.join("\n"));
        for (const cssPath of compilation.cssPaths) {
          if (moduleStyles.has(cssPath)) continue;
          doc.head.append(style(cssPath));
          moduleStyles.add(cssPath);
        }
        source = compilation.code;
      }
      const script = doc.createElement("script");
      script.dataset.file = path;
      script.textContent = safeScript(
        source + `\n//# sourceURL=student/${path}\n`,
      );
      if (element.hasAttribute("async")) {
        script.textContent = `setTimeout(() => { const s=document.createElement('script'); s.textContent=${JSON.stringify(source).replace(/</g, "\\u003c")}; document.body.append(s); },0);`;
        deferred.push(script);
        element.remove();
      } else if (module || (src && element.hasAttribute("defer"))) {
        deferred.push(script);
        element.remove();
      } else element.replaceWith(script);
    } catch (error) {
      errors.push(error.message);
      element.remove();
    }
  }
  for (const script of deferred) doc.body.append(script);
  const attributes = (element) =>
    [...element.attributes]
      .map(
        (a) =>
          `${a.name}="${a.value.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`,
      )
      .join(" ");
  return {
    headMarkup: doc.head.innerHTML,
    bodyMarkup: doc.body.innerHTML,
    htmlAttributes: attributes(doc.documentElement),
    bodyAttributes: attributes(doc.body),
    doctype: "<!doctype html>",
    errors,
  };
}
