# Fidelity ledger — Web Learning Lab

Reference inspected: [SQL Learning Lab concept](C:\Nauka\databases\docs\design\sql-learning-lab-concept.png)  
Reference app: `C:\Nauka\databases` on `http://localhost:5180/`  
Quality reference: [Impeccable](https://github.com/pbakaus/impeccable)  
Review date: 2026-09-21

## Carried over from SQL Learning Lab

- Navy left navigation with a clear product title, course context, active track/lesson state, and compact progress indicator.
- Teal accent color for active navigation, success state, primary actions, and system status.
- Light work area with generous spacing, strong heading hierarchy, bordered cards, and restrained corner radii.
- Grouped navigation and lesson context before the main work surface.
- Dedicated diagnostic/result surface instead of hiding feedback in transient notifications.
- Consistent icon-sized affordances and visible active states for navigation and tabs.

## Intentional divergence for a code-learning product

- The main workspace is a three-zone editor lab: lesson/task context, four-file code editor, and sandboxed iframe preview with console output.
- File tabs replace SQL's query editor context because the learner is building a small web document, not a single query.
- The lesson panel adds guided/independent/challenge tasks, declarative checks, reset/solution actions, and local progress.
- The preview is an isolated iframe and the React path includes local JSX compilation; SQL table/schema browsing is not carried into this product.
- The course stays self-contained and offline: no CDN runtime, remote fonts, backend, or external API is required.
- Mobile behavior favors a collapsible lesson drawer and stacked editor/preview sections instead of preserving the desktop three-column layout.

## Impeccable-aligned review notes

- Hierarchy: labels such as `KURS WEB`, `LABORATORIUM KODU`, `PODGLĄD`, and `DIAGNOSTYKA` create scan points without competing with the lesson title.
- Interaction clarity: active tabs, completion marks, `1 / 1` feedback, console count, and preview status make state visible.
- Accessibility: semantic landmarks/headings, explicit labels, keyboard focus states, and readable contrast are part of the shell contract.
- Restraint: no decorative gradients or remote visual assets were added; color is reserved for navigation, status, and feedback.
- Responsive intent: editor overflow stays contained, the lesson drawer can collapse, and the preview/diagnostics stack on smaller screens.

## Verification snapshot

The native browser smoke test on port `5181` was reviewed at desktop size after the Flexbox task returned `1 / 1`. The live view showed the editor, action row, feedback card, sandbox preview, and console as distinct but related surfaces. The SQL concept image was inspected directly before recording this ledger.
