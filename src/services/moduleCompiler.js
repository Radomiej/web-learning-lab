import * as BabelNamespace from "@babel/standalone";
import { resolveLocalPath } from "./projectFiles.js";

const Babel = BabelNamespace.default ?? BabelNamespace;
const EXTERNAL_MODULES = new Set(["react", "react-dom", "react-dom/client"]);
const JAVASCRIPT_EXTENSION = /\.(?:js|jsx)$/i;
const CSS_EXTENSION = /\.css$/i;

function describeError(error) {
  return error instanceof Error ? error.message : String(error);
}

function withFilename(filename, error) {
  const message = describeError(error);
  return message.includes(filename) ? message : `${filename}: ${message}`;
}

function walkAst(node, visit) {
  if (!node || typeof node !== "object") return;
  visit(node);

  for (const [key, value] of Object.entries(node)) {
    if (
      key === "loc" ||
      key === "extra" ||
      key === "tokens" ||
      key === "comments"
    )
      continue;
    if (Array.isArray(value)) {
      for (const child of value) walkAst(child, visit);
    } else if (
      value &&
      typeof value === "object" &&
      typeof value.type === "string"
    ) {
      walkAst(value, visit);
    }
  }
}

function dependencySpecifiers(ast, filename) {
  const dependencies = [];

  walkAst(ast.program, (node) => {
    if (
      (node.type === "ImportDeclaration" ||
        node.type === "ExportNamedDeclaration" ||
        node.type === "ExportAllDeclaration") &&
      node.source
    ) {
      dependencies.push(node.source.value);
      return;
    }

    if (
      node.type === "ImportExpression" ||
      (node.type === "CallExpression" && node.callee?.type === "Import")
    ) {
      throw new Error(`${filename}: dynamic import is not supported.`);
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "Identifier" &&
      node.callee.name === "require"
    ) {
      const argument = node.arguments?.[0];
      if (node.arguments?.length !== 1 || argument?.type !== "StringLiteral") {
        throw new Error(
          `${filename}: require must use one static string specifier.`,
        );
      }
      dependencies.push(argument.value);
    }
  });

  return dependencies;
}

function parseModule(source, filename) {
  return Babel.transform(source, {
    ast: true,
    code: false,
    filename,
    presets: ["react"],
    sourceType: "module",
  }).ast;
}

function transformModule(source, filename) {
  return (
    Babel.transform(source, {
      filename,
      plugins: ["transform-modules-commonjs"],
      presets: ["react"],
      sourceType: "module",
    }).code ?? ""
  );
}

function buildRuntime(modules, entry, sharedRuntimeKey) {
  const factories = Object.fromEntries(
    [...modules.entries()].map(([path, module]) => [path, module.code]),
  );
  const dependencies = Object.fromEntries(
    [...modules.entries()].map(([path, module]) => [path, module.dependencies]),
  );

  const factorySource = Object.entries(factories)
    .map(
      ([path, code]) =>
        `${JSON.stringify(path)}: function(require, module, exports) {\n${code}\n}`,
    )
    .join(",\n");

  const registry = sharedRuntimeKey
    ? `(__globals[${JSON.stringify(sharedRuntimeKey)}] ||= {cache: Object.create(null)})`
    : "{cache: Object.create(null)}";
  const runtime = `
(function (__globals) {
  "use strict";
  const factories = {${factorySource}};
  const dependencies = ${JSON.stringify(dependencies)};
  const cache = ${registry}.cache;

  function load(id) {
    if (Object.prototype.hasOwnProperty.call(cache, id)) return cache[id].exports;
    const factory = factories[id];
    if (!factory) throw new Error(id + ': module factory is unavailable.');

    const module = {exports: {}};
    cache[id] = module;
    const localRequire = function (specifier) {
      const target = dependencies[id] && dependencies[id][specifier];
      if (target === '@external/react') return __globals.React;
      if (target === '@external/react-dom') return __globals.ReactDOM;
      if (target === '@css') return {};
      if (!target) throw new Error(id + ': unresolved require "' + specifier + '".');
      return load(target);
    };

    factory(localRequire, module, module.exports);
    return module.exports;
  }

  load(${JSON.stringify(entry)});
})(globalThis);
`;

  return runtime.replace(/<\/script/gi, "<\\/script");
}

export function compileModules(files, entry, { sharedRuntimeKey } = {}) {
  const cssPaths = [];
  const cssSeen = new Set();
  const modules = new Map();
  const state = new Map();
  const active = [];

  try {
    if (!files || typeof files !== "object" || !Object.hasOwn(files, entry)) {
      throw new Error(`${entry}: entry module does not exist.`);
    }

    const visit = (path) => {
      if (state.get(path) === "done") return;
      if (state.get(path) === "visiting") {
        const start = active.indexOf(path);
        const cycle = [...active.slice(start), path].join(" -> ");
        throw new Error(`${path}: module cycle is not supported (${cycle}).`);
      }

      const source = files[path];
      if (typeof source !== "string") {
        throw new Error(`${path}: module source must be text.`);
      }
      if (!JAVASCRIPT_EXTENSION.test(path)) {
        throw new Error(
          `${path}: only .js and .jsx entry modules are supported.`,
        );
      }

      state.set(path, "visiting");
      active.push(path);

      let ast;
      let specifiers;
      try {
        ast = parseModule(source, path);
        specifiers = dependencySpecifiers(ast, path);
      } catch (error) {
        throw new Error(withFilename(path, error));
      }

      const dependencyMap = Object.create(null);
      for (const specifier of specifiers) {
        if (EXTERNAL_MODULES.has(specifier)) {
          dependencyMap[specifier] =
            specifier === "react" ? "@external/react" : "@external/react-dom";
          continue;
        }

        if (!specifier.startsWith(".")) {
          throw new Error(`${path}: unsupported module "${specifier}".`);
        }

        let target;
        try {
          target = resolveLocalPath(path, specifier, files);
        } catch (error) {
          throw new Error(withFilename(path, error));
        }

        if (CSS_EXTENSION.test(target)) {
          dependencyMap[specifier] = "@css";
          if (!cssSeen.has(target)) {
            cssSeen.add(target);
            cssPaths.push(target);
          }
          continue;
        }
        if (!JAVASCRIPT_EXTENSION.test(target)) {
          throw new Error(`${path}: unsupported local module "${target}".`);
        }

        dependencyMap[specifier] = target;
        visit(target);
      }

      let code;
      try {
        code = transformModule(source, path);
      } catch (error) {
        throw new Error(withFilename(path, error));
      }

      modules.set(path, { code, dependencies: dependencyMap });
      active.pop();
      state.set(path, "done");
    };

    visit(entry);
    return {
      code: buildRuntime(modules, entry, sharedRuntimeKey),
      cssPaths,
      errors: [],
    };
  } catch (error) {
    return { code: "", cssPaths: [], errors: [describeError(error)] };
  }
}
