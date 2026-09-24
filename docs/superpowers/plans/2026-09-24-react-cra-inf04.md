# React CRA / INF.04 Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the React course start with a local Create React App-style project that mirrors the conventions used in `C:\projekty\react01` and is useful preparation for INF.04, while keeping the existing Vite-style projects and the working HTML/CSS/JavaScript sandbox compatible.

**Architecture:** Add an explicit runtime profile to a project bundle. The default React profile is `react-cra-inf04` with `public/index.html`, `src/index.js`, `src/App.js`, `src/index.css`, `src/App.css`, local React/ReactDOM runtime assets, and an offline Bootstrap stylesheet. The existing `index.html` + `main.jsx` shape remains available as `react-vite` and remains the fallback for saved projects without runtime metadata. The preview adapter injects the CRA entry module in memory only; it never rewrites the student’s `public/index.html`.

**Tech Stack:** React 18.3, Vite, Vitest, Testing Library, jsdom, Babel Standalone, local runtime assets, vendored Bootstrap 5.3.8 CSS from `C:\projekty\react01\node_modules\bootstrap\dist\css\bootstrap.min.css`.

**Spec:** `docs/superpowers/specs/2026-09-23-react-cra-inf04-design.md`

## Global Constraints

- Preserve the existing uncommitted editor/icon/auto-preview work; do not reset or overwrite unrelated changes.
- Do not silently migrate existing saved Vite projects or change their source paths. New React course bundles use CRA paths; legacy bundles continue to run through inference.
- Keep iframe execution offline. Do not add CDN URLs, `npm install` inside the sandbox, `react-scripts`, `web-vitals`, `reportWebVitals`, or Bootstrap JavaScript/Popper to the first version.
- Permit only the known external modules `react`, `react-dom`, `react-dom/client`, and `bootstrap/dist/css/bootstrap.min.css`; continue rejecting arbitrary packages, dynamic `import()`, and unsafe paths.
- Keep file-specific runtime/compiler errors so a student sees `src/index.js`, `src/App.js`, or the actual missing file in the feedback panel.
- Use at most two agents if delegation is selected. Agents must not run tests; test execution stays sequential in the main task because the computer is resource-constrained.
- Use `apply_patch` for source edits. Do not commit or push implementation changes unless the user explicitly asks after verification.

## Review Focus

- Verify the new default is genuinely CRA-shaped: `public/index.html` contains `#root` and no source script, while `src/index.js` is the bootstrap module.
- Verify a minimal `react01`-style source with `import './index.css'`, `import App from './App'`, and `import 'bootstrap/dist/css/bootstrap.min.css'` renders in the iframe without a network request.
- Verify old Vite bundles with `index.html`, `main.jsx`, and `App.jsx` still render unchanged.
- Verify every guided and independent React task has starter/solution files that match its instructions and checks.
- Verify `.js` React files receive the React icon/type treatment in the editor, while ordinary JavaScript files keep the JavaScript icon.
- Verify reset, localStorage loading, add-file, Ctrl/Cmd+S, and auto-preview keep the current behavior.

---

## Implementation Tasks

## Task 1: Define runtime profiles and preserve runtime metadata

- [x] Complete Task 1 and its verification.

  **Files:** create `src/services/runtimeProfiles.js` and `src/services/runtimeProfiles.test.js`; update `src/services/projectFiles.js`, `src/services/projectFiles.test.js`, `src/data/lessonFactories.js`, and `src/services/projectStorage.test.js`.

  1. Add `REACT_PROFILE_IDS` with `CRA_INF04: 'react-cra-inf04'` and `VITE: 'react-vite'`.
  2. Export `getReactProfile(profileId = REACT_PROFILE_IDS.CRA_INF04)` returning an immutable profile object with:
     - `id`;
     - `runtime.kind` (`'react-cra'` or `'react-vite'`);
     - `runtime.module` (`'src/index.js'` or `'main.jsx'`);
     - `runtime.root` (`'#root'`);
     - `runtime.bootstrap` (`true` only for CRA);
     - `entry` (`'public/index.html'` for CRA and `'index.html'` for Vite);
     - `paths` helpers for `app`, `component(name)`, `hook(name)`, `indexCss`, and `appCss`.
  3. Export `getReactPathSet(profileId)` so lesson prompts and project templates use one source of truth instead of hard-coded `App.jsx`/`main.jsx` strings.
  4. Update `normalizeProject` to validate and preserve an optional `runtime` object. It must return `{ entry, files, runtime }` only when runtime metadata was supplied, so existing equality/migration behavior without metadata remains stable. The validator must reject a runtime module that is not a safe relative `.js`/`.jsx` path or whose `kind` is unknown.
  5. Add `relativeProjectPath(fromFile, targetFile)` for generating the in-memory reference from `public/index.html` to `../src/index.js`; cover same-directory, nested-directory, and upward-path cases.
  6. Update `cloneProject` in `lessonFactories.js` to retain `runtime`, and add storage tests proving a CRA project survives `saveProjects`/`loadProjects` and v2/v3 legacy projects still normalize without a runtime field.
  7. Run the focused profile, project-file, and storage tests sequentially. Do not change the storage key or trigger a hard reset.

  **Expected test cases:** CRA and Vite profile contracts; invalid runtime kind/module; runtime metadata round-trip; old `{html, baseCss, themeCss, js}` migration; safe relative path generation; legacy project equality.

## Task 2: Add the CRA preview adapter without changing student files

- [x] Complete Task 2 and its verification.

  **Files:** update `src/services/previewDocument.js`, `src/services/localResources.js`, `src/services/previewDocument.test.js`, and `src/services/localResources.test.js`.

  1. Add a small preview-only helper in `previewDocument.js` that reads `project.runtime`. For `runtime.kind === 'react-cra'`, compute the relative module reference from the selected HTML document to `runtime.module` and pass the module path as a preview-only runtime option. Do not persist an injected script or mutate `project.files`.
  2. Extend `resolveDocumentResources(project, documentPath, { runtimeModule = null } = {})` so a supplied runtime module creates a temporary `<script type="module">` node and goes through the same module compiler and deferred execution path as a normal module script. A duplicate explicit script must not be processed twice.
  3. Keep the existing Vite behavior: an `index.html` that already references `main.jsx` is resolved as before, and projects without a `runtime` field continue to work by their HTML script tags or by the existing React track fallback.
  4. Treat a CRA `.js` entry containing JSX as a React runtime entry. React runtime assets must be installed before the compiled entry module executes; do not infer React only from a `.jsx` extension.
  5. Keep source URLs and error messages filename-bearing. If `src/index.js` imports a missing `src/App.js`, the runtime error must mention both paths where relevant.
  6. Add jsdom tests that build a CRA project with no script in `public/index.html`, execute it, assert rendered DOM under `#root`, assert that the original file has no injected script, and assert a missing CRA module is reported. Add regression tests for the existing Vite document and explicit module scripts.
  7. Run the preview and local-resource test files sequentially before moving to the compiler work.

  **Expected test cases:** CRA `public/index.html` renders `App`; injected module is in the generated preview only; duplicate injection is avoided; old `main.jsx` projects render; selected non-entry HTML can still preview independently; malformed CRA source reports `src/index.js`.

## Task 3: Inline the real Bootstrap CSS offline

- [x] Complete Task 3 and its verification.

  **Files:** create `src/assets/bootstrap.min.css` by copying the verified Bootstrap 5.3.8 stylesheet from `C:\projekty\react01\node_modules\bootstrap\dist\css\bootstrap.min.css`; create `src/services/bootstrapRuntime.js` and `src/services/bootstrapRuntime.test.js`; update `src/services/moduleCompiler.js`, `src/services/moduleCompiler.test.js`, `src/services/localResources.js`, and `src/services/localResources.test.js`.

  1. Export from `bootstrapRuntime.js` the exact external specifier `bootstrap/dist/css/bootstrap.min.css`, an internal resource id such as `@bootstrap-css`, and `getBootstrapCss()` backed by the vendored asset. Keep the asset local and document the source/version in the module comment.
  2. Teach `compileModules` to recognize only that one Bootstrap CSS specifier as a permitted external CSS side effect. Include the internal resource id once in `cssPaths`; keep arbitrary bare packages rejected.
  3. Make the generated module runtime treat the Bootstrap CSS resource like the existing side-effect CSS resource, returning an empty module object to the importing JavaScript.
  4. Make `localResources` resolve the internal resource id to the vendored CSS and inline it into a `<style data-file="bootstrap.min.css">`. Do not attempt to fetch the package from the iframe or Vite dev server.
  5. Add tests for side-effect import, duplicate Bootstrap imports, CSS order relative to `src/index.css`/`src/App.css`, rejection of `some-package`, and the presence of representative exam classes such as `.container`, `.row`, `.col-md-6`, `.mt-3`, `.p-3`, `.text-center`, and `.btn-primary` in the generated document.
  6. Run compiler and resource tests sequentially, then run a build to catch raw-asset/import issues.

  **Expected test cases:** a CRA entry can import Bootstrap exactly as `react01` does; no network URL occurs in the generated preview; ordinary local CSS imports still work; duplicate CSS is emitted once; arbitrary packages remain unsupported.

## Task 4: Convert the React curriculum to a CRA/INF.04 default and retain an explicit Vite profile

- [x] Complete Task 4 and its verification.

  **Files:** update `src/data/reactProjects.js`, `src/data/reactProjects.test.js`, `src/data/reactLessons.js`, `src/data/lessons.js`, `src/data/scriptTasks.js`, `src/data/independentScripts.js`, `src/data/curriculum.test.js`, `src/data/instructions.test.js`, and `src/data/solutions.test.js`.

  1. Change `reactProjectFor(order, mode, kind, profileId = 'react-cra-inf04')` to select a profile through `getReactProfile`.
  2. Generate the CRA starter tree exactly as:
     ```text
     public/index.html
     src/index.js
     src/index.css
     src/App.css
     src/App.js
     ```
     plus dedicated `src/components/*.js` and `src/hooks/*.js` files where a lesson needs them. `public/index.html` must contain the full document structure and `<div id="root"></div>` but no script tag.
  3. Make `src/index.js` use the exam-familiar bootstrap shape: import React, import `createRoot` from `react-dom/client`, import `./index.css`, import `App` from `./App`, import `bootstrap/dist/css/bootstrap.min.css`, and render `<App />` into `#root`. Make `src/App.js` import `./App.css` as in `react01`. Keep the implementation compatible with the local React runtime and avoid `reportWebVitals`/dynamic imports.
  4. Generate all CRA component and hook filenames with `.js`; update relative imports accordingly. The source may contain JSX in `.js`, because the existing Babel preset already compiles that syntax.
  5. Keep a `react-vite` output path that reproduces the current `index.html`, `styles.css`, `main.jsx`, and `.jsx` component convention. Add tests calling `reactProjectFor(..., 'react-vite')` so this compatibility is intentional rather than accidental.
  6. Update all guided and independent prompts to use `getReactPathSet` values. They must say concrete actions such as “otwórz `src/App.js`” and “utwórz `src/components/Card.js`”, not ambiguous selector notation. Update lesson metadata (`file`, theory, and focus) to refer to `src/index.js` and the CRA paths.
  7. Preserve all eight React lesson orders (32–39), their checks, and the distinction between guided tasks with solutions and independent tasks without a solution button. Add data tests that every starter/solution pair has the expected CRA entry, all `check.file` values exist, and the independent recipes’ instructions mention the exact files they require.
  8. Add a fixture-style test containing the smallest `react01`-compatible App (`public/index.html`, `src/index.js`, `src/App.js`, two CSS imports, Bootstrap import) and assert it renders before testing the individual lesson recipes.
  9. Run data and solution tests sequentially.

  **Expected test cases:** default React lesson files are CRA-shaped; eight lessons still have working starter/solution pairs; dedicated component/hook files are used; `react-vite` remains available; every instruction path matches an actual file.

## Task 5: Make the application, persistence, and editor file workflow profile-aware

- [x] Complete Task 5 and its verification.

  **Files:** update `src/App.jsx`, `src/components/LessonWorkspace.jsx`, `src/components/EditorTabs.jsx`, `src/components/AddFileDialog.jsx`, `src/components/AddFileDialog.test.jsx`, `src/components/FileTypeIcon.jsx`, `src/services/projectFiles.js`, and any directly affected editor tests. Preserve the current `CodeEditor`, Ctrl/Cmd+S, auto-preview, and hard-reset changes.

  1. Replace hard-coded `index.html` selection in `App.jsx` with `files.entry` when selecting a task, resetting, or applying a guided solution. A CRA task must open `public/index.html` initially, while the editor can still switch to `src/index.js` and `src/App.js` through tabs.
  2. Pass the project runtime/profile into `LessonWorkspace` and `EditorTabs`. Extend `getFileTypeFromPath(path, { reactProject })` so `.js` files in a React project display the React icon while ordinary JavaScript course files keep the JavaScript icon. Keep `.jsx` and existing HTML/CSS/generic detection unchanged.
  3. Make `getFileTypeMeta`/the add-file dialog show the profile-correct extension and example. For CRA, selecting “React” creates `.js` and explains `src/components/Card.js`; for Vite it keeps `.jsx` and the current example.
  4. Make `createProjectFile(project, { type, name })` profile-aware. In CRA, a React component name such as `components/Card` becomes `src/components/Card.js` unless the user already supplied `src/`; in Vite it remains `components/Card.jsx`. Never overwrite a file, permit traversal, or create a file outside the known extension.
  5. Update add-file tests for CRA and Vite names, generated imports/examples, duplicate protection, and the visible icon/extension metadata. Keep the current Polish UI copy and the single editor tab workflow.
  6. Ensure `updateFiles`, `resetTask`, `handleSolution`, localStorage load, and hard reset preserve `runtime` metadata. A hard reset may clear progress/files as it does now, but it must not alter the built-in CRA starter definitions.
  7. Run the affected component, project-file, and storage tests sequentially. Do not make the new profile depend on a migration that destroys student code.

  **Expected test cases:** switching tasks opens the correct CRA entry; a saved CRA project reloads with the same runtime; add-file creates the expected `.js` path; React and JavaScript icons remain distinct; Vite behavior remains unchanged; hard reset restores CRA starters.

## Task 6: Run integrated verification and perform a manual student smoke pass

- [x] Complete Task 6 and its verification.

  **Files:** update only tests or small fixes identified by the preceding tasks; do not add unrelated UI changes.

  1. Run targeted tests one command at a time in this order: runtime/project services, compiler/resources, curriculum/data, editor components, then application smoke/runtime tests. Do not launch test commands concurrently.
  2. Run the complete suite with `npm test -- --reporter=dot` and record the final test/file counts. Existing unrelated warnings may be noted, but failures must be fixed before completion.
  3. Run `npm run build` and confirm the known Babel/runtime chunk warning is not a build failure.
  4. Use the already running dev server at `http://127.0.0.1:5181/` for a manual smoke pass as a student:
     - open React lesson 32 and confirm `public/index.html`, `src/index.js`, and `src/App.js` tabs;
     - edit `src/App.js`, save with Ctrl+S, and confirm auto-preview refreshes without scrolling away;
     - run the guided solution and check it awards the task;
     - open an independent task and confirm there is no “Pokaż rozwiązanie” action;
     - verify a Bootstrap `container`/`row`/`btn` class visibly applies in the iframe;
     - add a React component file and confirm it appears as an editor tab with a React icon;
     - reload the page and confirm code/progress survive; use hard reset and confirm the CRA starter returns.
  5. If a browser interaction reveals a bug, reproduce it in the nearest focused test first, fix it, rerun that test, and then rerun the full suite sequentially.
  6. Review `git diff --check`, `git status`, and the final diff for accidental changes to the existing uncommitted work. Do not commit or push until the user explicitly requests it; when requested, make one focused commit for the implementation and report its hash.

  **Expected outcome:** a learner can follow all eight React tasks using the same `public/src` conventions as `react01`, while existing HTML/CSS/JS/Vite projects continue to preview and validate normally.

## Suggested Commit Boundaries

These are boundaries for a later approved implementation, not permission to commit now:

1. `feat: add runtime profiles and CRA preview adapter`
2. `feat: inline offline bootstrap runtime`
3. `feat: add CRA INF04 React curriculum`
4. `feat: make editor and persistence profile aware`
5. `test: verify CRA React course end to end`
