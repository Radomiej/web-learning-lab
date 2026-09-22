# Course repair — 2026-09-22

The course now has 39 lessons and 86 concrete exercises (24 layout exercises).
Requirements are displayed beside the task and each task has a runnable reference
solution. HTML checks query rendered structure; CSS checks read computed styles
after both stylesheets; JS and React checks execute code and declared interactions.

Fixed first-file editing erasing the untouched starter files, button events being
interpreted as file bundles, repeated iframe runs, lost computed-style arrays,
React input events, premature interaction snapshots, and hidden JSX errors.
Preview applies drafts on Run or Check; reset and solutions pass explicit bundles.
Vite uses port 5181 with strictPort, leaving SQL on 5180.

Verification:
- npm test: 274 passing tests. The 219 executing-document checks cover all 86
  reference solutions, all 86 unchanged starters, and all 47 next variants against
  the preceding solution (including legacy text/paragraph/letter-spacing edits).
- npm run build: passes; the bundled local React/Babel runtime still triggers the
  large-chunk advisory.
- Real browser: Flexbox solution 5/5; theme.css overriding display with block
  correctly fails that requirement (4/5); React counter 3/3 with visible state 1.
- A regression test covers CSS array transport from iframe to validator.
- Solution tests await actual snapshots and interaction signals rather than
  relying on a fixed rendering delay.
- HTML instructions use numbered, plain-language steps and identify index.html
  as the editing target. All generated starters and solutions are full HTML
  documents; existing saved student drafts are preserved.
- Desktop lesson navigation can collapse without remounting the preview. The
  inspector stays at viewport top while the lesson scrolls. Browser checks at
  1280x720 and 390x844 confirmed no horizontal page overflow; mobile keeps the
  preview in document flow and exposes navigation through a menu.
- Replaced 31 superficial HTML/CSS/JS/React independent variants with separate
  scenarios and requirements. Versioned task IDs preserve old drafts without
  granting credit to new scenarios. Layout still contains 24 exercises; several
  previously overlapping plans now have additional distinct requirements.
- Exact text and before/after interaction checks reject static final messages.
  Missing action targets produce a fresh snapshot and a failed check.
- Code editor: lazy local Prettier for HTML/CSS/JS/JSX, 2-space Tab and Shift+Tab,
  indentation on Enter, Ctrl+Shift+K line deletion, undo/redo, Escape then Tab to
  leave the editor. Parse failures and in-flight edits preserve student input.
- Solution button and handler are available only in the guided mode, now labeled
  "Z przykładem". Independent and challenge modes have no solution control.
- Real browser editor smoke: format HTML/JSX, undo, Tab/outdent, delete-line/undo.
  Independent React toggle: static "Noc" gets 2/3, real state toggles Dzień/Noc
  both ways. QA code restored to the empty starter; no relevant console errors.
- Impeccable manual review: clearer mode names, larger instructions/buttons,
  wrapping lesson/task names, removal of repeated badges and misleading JS
  "optional" label. This is not a claim of a CLI audit or objective "zero AI slop".

Limits:
- The app is a local learning tool, not an exam anti-cheating system. Reference
  solutions remain in client-side curriculum data for automated validation.
- npm audit reports 5 existing development-tool findings (3 moderate, 1 high,
  1 critical) in Vitest and its Vite/esbuild/mocker dependencies. The suggested
  fix is a major Vitest upgrade, not applied automatically. Prettier is not
  among affected packages. Do not expose the Vitest UI server to the network.
- JSDOM tests do not verify physical layout geometry or responsive breakpoints.
  Browser smoke tests cover representative flows, not every viewport/task.
- Behavioral checks establish the rendered result, not proof that the student
  used every suggested abstraction (such as map, a custom hook or cleanup).
- Final JS/React projects currently exercise the first working stage of a
  planner/board; the full projects described in overview theory remain extensions.
- Isolated iframe does not expose localStorage; lesson 30 practices JSON parsing
  and error handling explicitly.
- File drafts use files.v2; the previous files.v1 key is left untouched for recovery.
- Impeccable guided visible requirements and precise state feedback. No project
  launcher/PRODUCT.md/DESIGN.md was found; its CLI audit was not run.
