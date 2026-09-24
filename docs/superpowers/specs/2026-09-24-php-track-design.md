# PHP track for Web Learning Lab

## Status

Design approved in chat on 2026-09-24. This document is the implementation
brief for adding a beginner PHP track to `web-learning-lab`.

## Intent and success criteria

The course should teach a beginner the first useful PHP concepts while keeping
the same edit → run → inspect workflow as the existing HTML, CSS, JavaScript,
and React tracks. A learner should be able to open the PHP track, edit
`index.php`, run it without installing PHP locally, and see the generated HTML
in the existing preview iframe.

Success means:

- the sidebar exposes a PHP track after React;
- eight lessons (orders 40–47) teach a coherent beginner sequence;
- every lesson has explanation, a guided task, and an independent task with
  declarative checks;
- PHP source is executed by a real PHP interpreter compiled to WebAssembly,
  not by a JavaScript imitation;
- PHP output is rendered as a document in the existing sandboxed iframe;
- syntax/runtime errors are visible in the existing feedback and runtime
  console surfaces;
- existing tracks and saved projects keep their current behavior.

## Scope

### In scope

- `@php-wasm/universal` and `@php-wasm/web` as browser runtime dependencies;
- a lazy, cached PHP runtime service for the PHP track;
- PHP project manifests with a `.php` entry file and local CSS files;
- rendering one PHP request per preview run;
- output and error propagation to the current preview bridge;
- eight Polish-language beginner lessons:
  1. `echo` and PHP embedded in HTML;
  2. variables, scalar types, and concatenation;
  3. comparisons and `if`/`else`;
  4. `for` and `while` loops;
  5. arrays and `foreach`;
  6. functions, parameters, and `return`;
  7. a small form with request data and escaped output;
  8. a profile-card project combining the earlier concepts.
- checks based on rendered DOM, text, interaction, and runtime errors, using the
  existing validator protocol wherever possible.

### Out of scope

- XAMPP, Docker, a local PHP installation, or a Node/PHP server;
- persistent databases, MySQL, Composer, filesystem access outside the virtual
  runtime, authentication, sessions, uploads, or production deployment;
- pretending that browser PHP has all extensions or server capabilities;
- a full PHP linter or static analyzer in the editor;
- changes to the visual design system beyond the PHP track accent/icon and the
  small file-type additions needed for `.php`.

## Options considered

1. **Local PHP server** — most faithful to a traditional stack, but every
   learner would need a separately installed runtime and a server bridge.
2. **A PHP-like JavaScript interpreter** — easiest to bundle, but it would
   teach an incompatible subset and make errors/examples misleading.
3. **PHP.wasm in the browser (selected)** — runs the real PHP engine in an
   in-memory filesystem, works with the existing local-first course, and keeps
   setup to the course itself. The trade-off is a larger first load and the
   need to document that this is a teaching runtime with a limited extension
   set.

## Architecture

### Project model

PHP lessons use an explicit project object:

```js
{
  entry: 'index.php',
  runtime: { kind: 'php-wasm', phpVersion: '8.4' },
  files: {
    'index.php': '<?php echo "..."; ?>',
    'styles.css': '...'
  }
}
```

`normalizeProject` will accept `.php` entries only when the runtime kind is
`php-wasm`; HTML/React projects retain their current validation. Paths remain
relative and pass through the existing safe-path checks. The file creation
dialog and file icon resolver gain a PHP type; adding a PHP file is allowed
only in a PHP project and defaults to `.php`.

### Runtime service

Add a focused `phpRuntime` service that owns:

- lazy loading of PHP 8.4 through `loadWebRuntime`;
- one cached runtime/client per browser tab;
- a serialized execution queue so two runs cannot mutate the same PHP
  instance concurrently;
- writing the lesson files into the virtual filesystem;
- executing the entry file with the `PHP.run` file mode;
- converting stdout and stderr/exit code into a stable result shape;
- disposing and recreating the instance after an unrecoverable runtime failure.

The public service boundary should be something like:

```js
runPhpProject({ files, entry }): Promise<{
  html: string,
  errors: string[],
  exitCode: number
}>
```

The service is imported only by the PHP preview path, so non-PHP previews keep
their current synchronous document builder.

### Preview flow

For non-PHP tracks, `buildPreviewDocument` continues to produce `srcDoc` as it
does today. For PHP:

1. `usePreviewRuntime` marks the run as `running` and assigns a run id.
2. The PHP preview controller sends the current project files to the runtime
   service.
3. The runtime writes the files under `/www`, executes `/www/index.php`, and
   returns the response text.
4. The controller wraps the response in a minimal HTML document when the PHP
   response is a fragment, injects the existing runtime bridge, and updates the
   iframe `srcDoc`.
5. The iframe emits the same `ready`, `signals`, `console`, and
   `runtime-error` messages already consumed by `usePreviewRuntime`.
6. `checkPreview` evaluates the lesson checks against the collected DOM and
   runtime signals.

The PHP execution occurs in the WebAssembly worker/runtime outside the iframe;
the iframe remains the rendering and inspection boundary. PHP output is treated
as document markup because generating HTML is the core teaching goal.

### Request data for the form lesson

The PHP service accepts optional request input (`method`, query, and form body)
for the form lesson. The default preview is a GET-like empty request. The
lesson uses a dedicated `phpRequest` check rather than pretending that an
iframe click can submit to the parent WebAssembly runtime. The check declares
the method, query/form payload, and expected selector/text. During a check run,
the controller executes PHP with that deterministic payload, replaces the
iframe document, and evaluates the resulting DOM. This keeps request handling
testable without exposing arbitrary network requests.

### Lesson data

Add `src/data/phpLessons.js` for metadata and `src/data/phpTasks.js` for
starter/solution/check recipes. `lessons.js`
will import the PHP metadata, create PHP starters, and append the new lessons
after order 39. PHP tasks use the same `createLesson`/`createTask` shape, but
their starter projects contain `index.php` and `styles.css` instead of
`script.js`.

The course metadata will set `runtime: 'php-wasm'`, `file: 'index.php'`, and
PHP-specific `requiredApis`/`requiredPractices` where useful. Prompts will
explicitly say which PHP file to edit and will avoid implying that PHP code is
running in the browser's JavaScript context.

### Track and UI integration

- Add `php` to `tracks` and `trackOrder` with a distinct accent and a simple
  PHP label/icon.
- Replace the hard-coded sidebar footer count (`39 lekcji`) with a count
  derived from the lesson collection.
- Let `PreviewInspector` treat `.php` as the entry document and keep the same
  iframe controls.
- Show the runtime label as ready/running/error using the existing pill and
  feedback components; the PHP loader's initial download can be represented by
  the existing running state.
- Keep the PHP track's editor focused on `index.php`, while still allowing
  `styles.css` and additional PHP files through the normal tabs/dialog.

## Error handling and safety

- PHP non-zero exit codes and stderr become runtime errors and prevent task
  completion.
- Errors are normalized to readable Polish text where the runtime provides
  file/line information; raw details remain available in the runtime console.
- A run id prevents a late WebAssembly response from replacing a newer preview.
- Execution is serialized and has a client-side timeout consistent with the
  existing five-second preview watchdog. A timed-out instance is disposed and
  recreated for the next run.
- The iframe continues to use `sandbox="allow-scripts"`; PHP output is not
  allowed to navigate or access the parent document.
- The runtime receives only the in-memory project files and deterministic form
  input. No host filesystem or database is mounted.
- The UI will indicate that PHP.wasm is a browser teaching runtime and that
  server-only extensions are outside this module.

## Compatibility and migration

Existing saved projects without a runtime manifest continue through the current
HTML/CSS/JS normalization path. Saved React manifests remain unchanged. PHP
projects are stored in the same local-storage project map and can be reset with
the existing hard reset control. Adding the new lessons changes the course
lesson count and progress denominator; old completion ids remain valid.

## Verification plan

The implementation should add focused coverage for:

- PHP project normalization and safe `.php` paths;
- PHP runtime result normalization for stdout, stderr, non-zero exit, and
  timeout/recreation;
- PHP preview wrapping and bridge injection;
- one representative DOM check and one form interaction check;
- lesson order/count and starter shape for the new track;
- unchanged HTML/React preview behavior through the existing suite.

After implementation, run the existing build and the relevant unit tests, then
open the local app and manually verify: selecting PHP, first-run runtime load,
editing `index.php`, syntax error feedback, guided check completion, form
interaction, reset, and switching back to React.

## Open implementation details resolved by the plan

- Use one PHP minor version (8.4) for predictable lesson output.
- Use the service's file mode for normal lessons so `__FILE__` and line errors
  are meaningful; use request input only for the form exercise.
- Keep the initial lesson set free of SQLite/MySQL so the fundamentals remain
  portable and the runtime surface stays small.
