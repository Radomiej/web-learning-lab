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
- npm test: 129 passing tests, including 86 executed reference solutions in JSDOM.
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

Limits:
- Independent exercises still need stronger differentiation; several currently
  add a small requirement or change expected text rather than teach a new scenario.
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
