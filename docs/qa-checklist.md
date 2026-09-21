# QA checklist — Web Learning Lab

Date: 2026-09-21  
Application: `http://localhost:5181/`  
SQL Learning Lab reference app: `http://localhost:5180/`

## Automated checks

- [x] `npm test` — run from `C:\Nauka\web-learning-lab` before handoff; all tests pass.
- [x] `npm run build` — run from `C:\Nauka\web-learning-lab` before handoff; the large-chunk warning is expected because Babel Standalone and the local React runtime are intentionally bundled for offline lessons.

Final command evidence:

- `npm test`: 11 files passed, 31 tests passed.
- `npm run build`: passed; 58 modules transformed, expected 4.43 MB minified bundle warning.

## Browser smoke checks

The native in-app browser was used against the running Vite server on port `5181`.

- [x] Four editable project files are visible: `index.html`, `base.css`, `theme.css`, and optional `script.js`.
- [x] Editing code, clicking `Uruchom`, and reading the sandboxed iframe updates the preview.
- [x] Student runtime failures are visible in feedback and the diagnostic console.
- [x] A guided HTML task can be checked successfully and updates completion progress.
- [x] The Layout track shows 8 lessons with 3 tasks each: 24 layout tasks total.
- [x] A Flexbox task accepts `display: flex` plus the declared alignment properties and reports `1 / 1`.
- [x] The React track renders the local React/ReactDOM runtime without a CDN; a `useState` button updates from `0` to `1` inside the iframe.
- [x] Switching the active lesson/task scope does not carry a previous task's check result into the new task.
- [x] The inspected desktop view preserves the SQL Lab-inspired navy navigation, teal status accents, card hierarchy, diagnostic panel, and editor-first workflow.

## Responsive and accessibility checks

- [x] Landmarks, headings, labelled editor textareas, file tabs, track tabs, and action buttons are exposed in the accessibility tree.
- [x] Focus-visible styles, scroll-safe editor overflow, mobile drawer styles, and reduced-motion handling are covered in the app stylesheet/tests.
- [ ] Native CUA mobile viewport check — not run because the current native CUA surface exposes no viewport override. The responsive CSS paths remain covered by the existing component/content checks and media-query implementation.

## Known intentional trade-offs

- The iframe uses `sandbox="allow-scripts"` without `allow-same-origin`; this keeps student code isolated from the host and its storage.
- React lessons bundle local development UMD assets and Babel Standalone so the course works offline. This produces a Vite large-chunk warning during build but avoids a runtime network dependency.
- Impeccable is used as a quality checklist/reference for hierarchy, accessibility, responsive behavior, and restraint; it is not installed as a runtime dependency.
