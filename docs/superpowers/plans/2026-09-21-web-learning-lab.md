# Web Learning Lab Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build a local React/Vite learning lab with 39 lessons, 24 focused Flexbox/Grid/RWD exercises, four editable project files, a sandboxed live preview, local React/JSX support, declarative checks, and local progress.

**Architecture:** The app is a data-driven single-page React interface. Lesson content and checks live in data modules; pure services build the preview document and evaluate results; hooks own persisted state; small components compose the SQL Lab-inspired shell. Student code runs in a sandboxed iframe and reports only controlled runtime signals through postMessage. React lessons add local UMD runtime assets and host-side JSX transformation, so the course works without a CDN.

**Tech Stack:** React 18, ReactDOM 18, Vite 6, Babel Standalone, Vitest, Testing Library, plain CSS, localStorage, sandboxed iframe. No backend, external API, remote runtime, or npm imports inside student code in the first version.

**Spec:** docs/superpowers/specs/2026-09-18-web-learning-lab-design.md

## Global Constraints

- React + Vite and no backend are required for the first version.
- The curriculum contains 39 lessons: 9 HTML, 14 CSS/layout, 8 JavaScript, and 8 React.
- Lessons 15–22 each contain three tasks, giving exactly 24 Flexbox/Grid/responsive-layout tasks.
- The editor always exposes index.html, base.css, theme.css, and script.js.
- The preview iframe uses sandbox="allow-scripts"; student code cannot access the host app or host localStorage.
- React preview assets and JSX compilation are local; lessons never require a CDN or network access.
- Course progress and per-task files are stored locally in localStorage only.
- The visual language follows SQL Learning Lab: navy sidebar, teal active states, light work area, restrained borders, system typography, and mobile sidebar drawer.
- The app must start through start-course.cmd after dependencies are installed or automatically installed.
- Validation must check semantic HTML, CSS behavior, DOM behavior, React behavior, and runtime failures instead of only comparing screenshots.
- Verification commands are npm test and npm run build.

## Review Focus

1. A full HTML document must not produce duplicate html, head, or body nodes when the preview builder receives doctype markup; Task 3 pins this with a full-document fixture.
2. Console values and runtime errors containing quotes, newlines, and angle brackets must reach the host as text without breaking the bridge; Task 3 covers this with an escaped message fixture.
3. React JSX containing fragments, hooks, and quotes must compile locally and render without a network request; Task 4 pins this with a local transform fixture.
4. An interaction check against a missing selector must fail with a student-facing hint instead of throwing or hanging; Task 5 covers this exact result.
5. Switching lessons with unsaved edits must preserve the current lesson bundle and restore it after remount; Task 6 covers persistence and reset separately.
6. A narrow preview with a child wider than the viewport must fail noHorizontalOverflow while a wrapped layout passes; Task 5 covers both signals.

---

### Task 1: Scaffold the runnable React/Vite project

**Files:**
- Create: package.json
- Create: package-lock.json
- Create: index.html
- Create: vite.config.js
- Create: vitest.config.js
- Create: src/main.jsx
- Create: src/App.jsx
- Create: src/test/setup.js
- Create: src/App.smoke.test.jsx
- Create: start-course.cmd
- Create: README.md
- Create: .gitignore

**Interfaces:**
- Vite entry point at src/main.jsx and App renders a named application root.
- npm scripts: dev, build, preview, test, and test:watch.
- start-course.cmd runs npm install only when node_modules is absent and then runs npm run dev -- --open --port 5181.

- [ ] Step 1: Write the failing smoke test.

    import { render, screen } from '@testing-library/react';
    import App from './App.jsx';

    test('renders the Web Learning Lab shell title', () => {
      render(<App />);
      expect(screen.getByText('Web Learning Lab')).toBeInTheDocument();
    });

- [ ] Step 2: Run the focused test.

    Run: npm test -- src/App.smoke.test.jsx
    Expected: FAIL because the application and test environment do not exist.

- [ ] Step 3: Create the Vite/Vitest configuration, React entry point, shell placeholder, launcher, and README.

- [ ] Step 4: Run the focused test and build.

    Run: npm test -- src/App.smoke.test.jsx
    Expected: PASS.
    Run: npm run build
    Expected: exit code 0 and a dist directory.

- [ ] Step 5: Commit the scaffold.

    Run: git add package.json package-lock.json index.html vite.config.js vitest.config.js src start-course.cmd README.md .gitignore
    Run: git commit -m "chore: scaffold web learning lab"

### Task 2: Add the curriculum model and lesson inventory

**Files:**
- Create: src/data/curriculum.js
- Create: src/data/lessons.js
- Create: src/data/lessonFactories.js
- Create: src/data/curriculum.test.js

**Interfaces:**
- curriculum.js exports tracks, trackOrder, and allLessons.
- lessonFactories.js exports createLesson and createTask.
- lessons.js exports lessons, where each lesson has id, track, order, title, summary, objectives, theory, starter, solution, and tasks.
- A FileBundle is an object with html, baseCss, themeCss, and js strings.
- A Task has id, mode, title, prompt, starter, solution, checks, and optional hint.
- A Check has id, type, label, hint, and type-specific fields.

- [ ] Step 1: Write the failing inventory tests.

    import { allLessons } from './curriculum.js';
    import { lessons } from './lessons.js';

    test('contains the complete 39-lesson sequence', () => {
      expect(allLessons).toHaveLength(39);
      expect(allLessons.map((lesson) => lesson.order)).toEqual(
        Array.from({ length: 39 }, (_, index) => index + 1),
      );
    });

    test('contains exactly 24 layout tasks across lessons 15 to 22', () => {
      const layoutLessons = lessons.filter(
        (lesson) => lesson.order >= 15 && lesson.order <= 22,
      );
      const tasks = layoutLessons.flatMap((lesson) => lesson.tasks);
      expect(layoutLessons).toHaveLength(8);
      expect(tasks).toHaveLength(24);
      expect(tasks.filter((task) => task.mode === 'guided')).toHaveLength(8);
      expect(tasks.filter((task) => task.mode === 'independent')).toHaveLength(8);
      expect(tasks.filter((task) => task.mode === 'challenge')).toHaveLength(8);
    });

    test('contains eight React lessons after the JavaScript track', () => {
      const reactLessons = lessons.filter((lesson) => lesson.track === 'react');
      expect(reactLessons).toHaveLength(8);
      expect(reactLessons[0].order).toBe(32);
      expect(reactLessons.at(-1).order).toBe(39);
    });

    test('exposes all four editable files in every starter bundle', () => {
      expect(lessons.every((lesson) => (
        lesson.starter.html !== undefined &&
        lesson.starter.baseCss !== undefined &&
        lesson.starter.themeCss !== undefined &&
        lesson.starter.js !== undefined
      ))).toBe(true);
    });

- [ ] Step 2: Run the data test.

    Run: npm test -- src/data/curriculum.test.js
    Expected: FAIL with module-not-found errors.

- [ ] Step 3: Implement factories, track metadata, and all 39 ordered lesson records.
    Use tracks html for orders 1–9, css for 10–14 and 23, layout for 15–22, js for 24–31, and react for 32–39.
    Give every non-layout lesson at least one guided and one independent task.
    Give each layout lesson exactly three tasks:
    - 15: axis and alignment;
    - 16: wrapping and gaps;
    - 17: flex item sizing;
    - 18: order, align-self, and overflow;
    - 19: navigation, cards, and practical Flexbox patterns;
    - 20: Grid columns, rows, fr, repeat, and minmax;
    - 21: Grid areas, placement, and choosing Grid versus Flexbox;
    - 22: mobile-first media queries, flexible media, and overflow.
    Give React lessons starter code that uses React and ReactDOM globals and no imports.

- [ ] Step 4: Run the data tests.

    Run: npm test -- src/data/curriculum.test.js
    Expected: PASS with four tests.

- [ ] Step 5: Commit the curriculum model.

    Run: git add src/data
    Run: git commit -m "feat: add web learning curriculum"

### Task 3: Build the iframe preview document and runtime bridge

**Files:**
- Create: src/services/previewDocument.js
- Create: src/services/previewDocument.test.js
- Modify: src/App.jsx

**Interfaces:**
- buildPreviewDocument(files, options) returns a string suitable for iframe srcDoc.
- normalizeHtmlDocument(html) returns headMarkup and bodyMarkup.
- createRuntimeBridge() returns inline bridge source inserted before student JS.
- Runtime messages use { source: 'web-learning-lab', type, payload }.
- options includes track and requestedSignals.

- [ ] Step 1: Write failing document-builder tests.

    import { buildPreviewDocument } from './previewDocument.js';

    test('places base CSS before theme CSS and student JavaScript after both', () => {
      const document = buildPreviewDocument({
        html: '<main id="app">Hello</main>',
        baseCss: 'body { color: red; }',
        themeCss: '#app { color: blue; }',
        js: 'document.body.dataset.ready = "yes";',
      }, { track: 'html' });
      expect(document.indexOf('body { color: red; }')).toBeLessThan(
        document.indexOf('#app { color: blue; }'),
      );
      expect(document.indexOf('document.body.dataset.ready')).toBeGreaterThan(
        document.indexOf('#app { color: blue; }'),
      );
    });

    test('does not duplicate head or body for a full HTML document', () => {
      const document = buildPreviewDocument({
        html: '<!doctype html><html lang="pl"><head><title>Ćwiczenie</title></head><body><h1>Start</h1></body></html>',
        baseCss: '',
        themeCss: '',
        js: '',
      }, { track: 'html' });
      expect((document.match(/<html\\b/gi) || []).length).toBe(1);
      expect((document.match(/<head\\b/gi) || []).length).toBe(1);
      expect((document.match(/<body\\b/gi) || []).length).toBe(1);
      expect(document).toContain('<title>Ćwiczenie</title>');
    });

    test('escapes script end markers inside student JavaScript', () => {
      const document = buildPreviewDocument({
        html: '<p>safe</p>',
        baseCss: '',
        themeCss: '',
        js: 'const label = "</script>";',
      }, { track: 'html' });
      expect(document).toContain('<\\/script>');
    });

- [ ] Step 2: Run the focused tests.

    Run: npm test -- src/services/previewDocument.test.js
    Expected: FAIL because the builder is not implemented.

- [ ] Step 3: Implement normalizeHtmlDocument, style insertion, bridge insertion, and student script insertion.
    Use a full-document branch when html contains html, head, or body tags; otherwise wrap the fragment in a standard HTML5 shell with lang="pl", charset UTF-8, and viewport.
    Replace every case-insensitive </script sequence in student JS with <\\/script before placing it in the inline script.
    Add bridge handlers for ready, console, runtime-error, signals, and run-action.
    The bridge must stringify console arguments with String(value) and post messages with the fixed source value.

- [ ] Step 4: Run the focused tests and current suite.

    Run: npm test -- src/services/previewDocument.test.js
    Expected: PASS with three tests.
    Run: npm test
    Expected: PASS with the smoke and data tests.

- [ ] Step 5: Commit the preview service.

    Run: git add src/services/previewDocument.js src/services/previewDocument.test.js src/App.jsx
    Run: git commit -m "feat: add sandboxed preview document"

### Task 4: Add local React runtime assets and JSX compilation

**Files:**
- Create: src/services/reactRuntimeAssets.js
- Create: src/services/reactRuntimeAssets.test.js
- Modify: package.json
- Modify: package-lock.json
- Modify: src/services/previewDocument.js
- Modify: vite.config.js

**Interfaces:**
- compileJsx(source) returns { code, warnings } and never performs a network request.
- getReactRuntimeScripts() returns { react, reactDom } as local script strings.
- buildPreviewDocument receives track react and adds React, ReactDOM, and compiled student code in that order.
- Student React code uses global React, ReactDOM, and ReactDOM.createRoot.

- [ ] Step 1: Write failing local-runtime tests.

    import { compileJsx, getReactRuntimeScripts } from './reactRuntimeAssets.js';

    test('compiles JSX, fragments, and hooks without a network request', () => {
      const result = compileJsx(
        'const [count, setCount] = React.useState(0); const App = () => <><button onClick={() => setCount(count + 1)}>{count}</button></>;'
      );
      expect(result.code).toContain('React.createElement');
      expect(result.code).toContain('React.useState');
      expect(result.warnings).toEqual([]);
    });

    test('returns non-empty local React and ReactDOM runtime scripts', () => {
      const runtime = getReactRuntimeScripts();
      expect(runtime.react).toContain('React');
      expect(runtime.reactDom).toContain('ReactDOM');
      expect(runtime.react.startsWith('http')).toBe(false);
      expect(runtime.reactDom.startsWith('http')).toBe(false);
    });

    test('reports JSX errors as warnings instead of throwing from the editor', () => {
      const result = compileJsx('const App = () => <div>');
      expect(result.code).toBe('');
      expect(result.warnings[0]).toContain('JSX');
    });

- [ ] Step 2: Run the focused tests.

    Run: npm test -- src/services/reactRuntimeAssets.test.js
    Expected: FAIL because Babel and local runtime assets are not configured.

- [ ] Step 3: Add @babel/standalone and local React/ReactDOM raw assets.
    Import the installed UMD development builds as Vite raw assets or generate stable local runtime strings during the Vite build.
    Configure the raw asset path explicitly so npm run build fails if a runtime file is missing.
    compileJsx uses Babel.transform with the react preset and returns a user-facing warning for syntax errors.
    Only buildPreviewDocument calls the React runtime path when options.track equals react.

- [ ] Step 4: Run runtime tests, build, and the preview-builder suite.

    Run: npm test -- src/services/reactRuntimeAssets.test.js src/services/previewDocument.test.js
    Expected: PASS.
    Run: npm run build
    Expected: exit code 0.

- [ ] Step 5: Commit local React support.

    Run: git add package.json package-lock.json vite.config.js src/services/reactRuntimeAssets.js src/services/reactRuntimeAssets.test.js src/services/previewDocument.js
    Run: git commit -m "feat: run local react and jsx in preview"

### Task 5: Implement declarative checks and interaction signals

**Files:**
- Create: src/services/lessonValidator.js
- Create: src/services/lessonValidator.test.js
- Modify: src/services/previewDocument.js

**Interfaces:**
- evaluateChecks(checks, context) returns { passed, total, results }.
- context is { files, signals }, where signals contains dom, styles, viewport, interactions, runtimeErrors, and react.
- A result is { id, label, passed, message, hint }.
- Missing selectors and unknown check types return passed false with a useful message; they never throw.
- noHorizontalOverflow compares viewport.scrollWidth <= viewport.clientWidth.
- reactRendered checks signals.react.rootReady and a DOM selector/text signal.

- [ ] Step 1: Write failing validator tests.

    import { evaluateChecks } from './lessonValidator.js';

    const baseContext = {
      files: { html: '<button id="save">Zapisz</button>', baseCss: '.card { display: flex; }', themeCss: '', js: '' },
      signals: {
        dom: { '#save': { exists: true, text: 'Zapisz', attrs: { type: 'button' } } },
        styles: { '.card|display': 'flex' },
        viewport: { scrollWidth: 390, clientWidth: 390 },
        interactions: {},
        runtimeErrors: [],
        react: { rootReady: true },
      },
    };

    test('passes source, element, attribute, style, overflow, and React checks', () => {
      const checks = [
        { id: 'html', type: 'sourceIncludes', file: 'html', needle: '<button', label: 'button' },
        { id: 'exists', type: 'elementExists', selector: '#save', label: 'save exists' },
        { id: 'attr', type: 'attributeEquals', selector: '#save', attribute: 'type', expected: 'button', label: 'type' },
        { id: 'style', type: 'computedStyle', selector: '.card', property: 'display', expected: 'flex', label: 'flex' },
        { id: 'width', type: 'noHorizontalOverflow', label: 'no overflow' },
        { id: 'react', type: 'reactRendered', selector: '#app', label: 'react' },
      ];
      const result = evaluateChecks(checks, baseContext);
      expect(result).toMatchObject({ passed: 6, total: 6 });
    });

    test('fails a missing interaction selector with its hint', () => {
      const result = evaluateChecks(
        [{ id: 'click', type: 'interaction', selector: '#missing', action: 'click', expected: { text: 'Gotowe' }, label: 'click', hint: 'Dodaj przycisk.' }],
        baseContext,
      );
      expect(result.results[0]).toMatchObject({ passed: false, hint: 'Dodaj przycisk.' });
      expect(result.results[0].message).toContain('missing');
    });

    test('fails unknown checks without throwing', () => {
      const result = evaluateChecks(
        [{ id: 'future', type: 'not-a-check', label: 'future' }],
        baseContext,
      );
      expect(result).toMatchObject({ passed: 0, total: 1 });
    });

- [ ] Step 2: Run the validator tests.

    Run: npm test -- src/services/lessonValidator.test.js
    Expected: FAIL because lessonValidator.js does not exist.

- [ ] Step 3: Implement all check types with pure data access.
    Normalize file names through html, baseCss, themeCss, and js.
    For interaction checks, look up signals.interactions[check.id] after the bridge executes the action.
    Add a signal collector in the bridge that accepts the lesson check descriptor and posts existence, text, attributes, computed styles, viewport values, and React root status.
    Capture runtime errors in a list and make runtimeError checks fail when the list is not empty.

- [ ] Step 4: Run validator and full suites.

    Run: npm test -- src/services/lessonValidator.test.js
    Expected: PASS with three tests.
    Run: npm test
    Expected: PASS.

- [ ] Step 5: Commit the validator.

    Run: git add src/services/lessonValidator.js src/services/lessonValidator.test.js src/services/previewDocument.js
    Run: git commit -m "feat: validate lesson preview checks"

### Task 6: Add persistent course and editor state

**Files:**
- Create: src/hooks/useLocalStorage.js
- Create: src/hooks/useLocalStorage.test.js
- Create: src/hooks/useCourseProgress.js
- Create: src/hooks/useCourseProgress.test.js

**Interfaces:**
- useLocalStorage(key, initialValue) returns [value, setValue].
- useCourseProgress(lessons) returns selectedTrack, selectedLessonId, filesByTask, completedTasks, selectTrack, selectLesson, updateFiles, resetTask, markTaskComplete.
- Storage keys are web-learning-lab.progress.v1 and web-learning-lab.files.v1.
- Invalid or unparsable storage falls back to the supplied default without breaking render.

- [ ] Step 1: Write failing hook tests.

    import { renderHook, act } from '@testing-library/react';
    import { useCourseProgress } from './useCourseProgress.js';
    import { lessons } from '../data/lessons.js';

    test('restores edited files for a selected task after remount', () => {
      const first = renderHook(() => useCourseProgress(lessons));
      act(() => first.result.current.updateFiles('html-02-guided', { html: '<h1>Nowy tytuł</h1>' }));
      first.unmount();

      const next = renderHook(() => useCourseProgress(lessons));
      expect(next.result.current.filesByTask['html-02-guided'].html).toBe('<h1>Nowy tytuł</h1>');
    });

    test('resetTask returns the task starter without clearing another task', () => {
      const { result } = renderHook(() => useCourseProgress(lessons));
      act(() => result.current.updateFiles('layout-15-guided', { html: '<div>zmiana</div>' }));
      act(() => result.current.updateFiles('layout-16-guided', { html: '<div>inna</div>' }));
      act(() => result.current.resetTask('layout-15-guided'));
      expect(result.current.filesByTask['layout-15-guided'].html).not.toBe('<div>zmiana</div>');
      expect(result.current.filesByTask['layout-16-guided'].html).toBe('<div>inna</div>');
    });

- [ ] Step 2: Run the hook tests.

    Run: npm test -- src/hooks/useCourseProgress.test.js
    Expected: FAIL because the hooks do not exist.

- [ ] Step 3: Implement safe JSON parsing, functional updates, and storage writes.
    When a lesson or task is missing, selectLesson falls back to the first lesson and resetTask leaves state unchanged instead of throwing.
    Keep current lesson files separate from starter data so editing one task never mutates lesson definitions.

- [ ] Step 4: Run hooks and full suites.

    Run: npm test -- src/hooks/useLocalStorage.test.js src/hooks/useCourseProgress.test.js
    Expected: PASS.
    Run: npm test
    Expected: PASS.

- [ ] Step 5: Commit state persistence.

    Run: git add src/hooks
    Run: git commit -m "feat: persist course progress and editor files"

### Task 7: Build the SQL Lab-inspired shell and editor components

**Files:**
- Create: src/components/AppShell.jsx
- Create: src/components/Sidebar.jsx
- Create: src/components/MobileHeader.jsx
- Create: src/components/LessonWorkspace.jsx
- Create: src/components/LessonOverview.jsx
- Create: src/components/TaskPanel.jsx
- Create: src/components/TaskList.jsx
- Create: src/components/EditorTabs.jsx
- Create: src/components/CodeEditor.jsx
- Create: src/components/PreviewInspector.jsx
- Create: src/components/FeedbackPanel.jsx
- Create: src/components/RuntimeConsole.jsx
- Create: src/components/components.test.jsx
- Create: src/styles/tokens.css
- Create: src/styles/app.css
- Modify: src/App.jsx
- Modify: src/main.jsx

**Interfaces:**
- AppShell accepts sidebar, main, inspector, sidebarOpen, and onSidebarClose.
- CodeEditor accepts fileKey, value, onChange, onRun, onReset, onCheck, onSolution and renders a labelled textarea.
- PreviewInspector accepts previewDocument, previewKey, onMessage, and runtimeState.
- FeedbackPanel accepts checkResults and runtimeErrors.
- Sidebar receives tracks, lessons, selectedTrack, selectedLessonId, completedTasks, onTrackChange, and onLessonChange.
- TaskList emits onTaskChange(taskId) and shows task mode, title, and completed state.

- [ ] Step 1: Write failing component tests.

    import { render, screen } from '@testing-library/react';
    import App from '../App.jsx';

    test('shows the first lesson, four editor files, preview status, and track navigation', () => {
      render(<App />);
      expect(screen.getByText('Web Learning Lab')).toBeInTheDocument();
      expect(screen.getByText('Pierwszy dokument HTML5')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'index.html' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'base.css' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'theme.css' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'script.js' })).toBeInTheDocument();
      expect(screen.getByText('Podgląd na żywo')).toBeInTheDocument();
      expect(screen.getByText('39 lekcji')).toBeInTheDocument();
    });

    test('changes the active editor file and opens the mobile sidebar', async () => {
      render(<App />);
      await userEvent.click(screen.getByRole('tab', { name: 'base.css' }));
      expect(screen.getByLabelText('Edytor base.css')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Otwórz menu' }));
      expect(screen.getByRole('navigation', { name: 'Nawigacja kursu' })).toHaveAttribute('data-open', 'true');
    });

- [ ] Step 2: Run the component tests.

    Run: npm test -- src/components/components.test.jsx
    Expected: FAIL until the shell and styles are implemented.

- [ ] Step 3: Implement the shell with semantic landmarks and the SQL Lab visual language.
    Use a navy fixed sidebar at desktop, a drawer and backdrop below 991px, and a main grid with lesson content on the left and preview inspector on the right.
    Use real buttons and tabs, visible focus states, aria-labels, and explicit control typography.
    CodeEditor is a controlled textarea for the first version; use spellcheck=false, wrap=off, and monospace styles.
    Keep the four file tabs visible on every task.
    Render React track status as React + JSX locally available without displaying implementation jargon in the student-facing lesson.

- [ ] Step 4: Run component tests and build.

    Run: npm test -- src/components/components.test.jsx
    Expected: PASS.
    Run: npm run build
    Expected: exit code 0.

- [ ] Step 5: Commit the app shell.

    Run: git add src/components src/styles src/App.jsx src/main.jsx
    Run: git commit -m "feat: build learning lab interface"

### Task 8: Author all HTML, CSS, layout, JavaScript, and React lesson content

**Files:**
- Create: src/data/htmlLessons.js
- Create: src/data/cssLessons.js
- Create: src/data/layoutLessons.js
- Create: src/data/jsLessons.js
- Create: src/data/reactLessons.js
- Create: src/data/contentCoverage.test.js
- Copy: public/course-assets/01-przeplyw-html-css.svg
- Copy: public/course-assets/02-drzewo-html.svg
- Copy: public/course-assets/03-model-pudelkowy.svg
- Copy: public/course-assets/04-flexbox-grid.svg
- Copy: public/course-assets/05-rwd.svg
- Copy: public/course-assets/06-html-semantyczne-wireframe.png
- Copy: public/course-assets/07-formularz-tabela-wireframe.png
- Copy: public/course-assets/08-rwd-360-430-wireframe.png
- Modify: src/data/lessons.js

**Interfaces:**
- Each content module exports a list consumed by lessons.js without component imports.
- HTML lesson metadata includes requiredTags and requiredPractices.
- Layout lesson metadata includes requiredProperties and exactly three tasks.
- React lesson metadata includes requiredApis and a runtime field set to react.
- Course asset paths point to public/course-assets/filename.

- [ ] Step 1: Write the failing content coverage test.

    import { lessons } from './lessons.js';

    test('HTML lessons cover the required tags from the source course', () => {
      const tags = new Set(
        lessons
          .filter((lesson) => lesson.track === 'html')
          .flatMap((lesson) => lesson.requiredTags),
      );
      [
        'doctype', 'html', 'head', 'body', 'meta', 'title', 'h1', 'h6', 'p',
        'br', 'hr', 'strong', 'em', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'a',
        'nav', 'img', 'figure', 'figcaption', 'audio', 'video', 'source',
        'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
        'form', 'label', 'input', 'textarea', 'select', 'option', 'button',
        'fieldset', 'legend', 'header', 'main', 'section', 'article', 'aside',
        'footer', 'time', 'div', 'span',
      ].forEach((tag) => expect(tags).toContain(tag));
    });

    test('layout lessons cover the properties needed for 24 tasks', () => {
      const properties = new Set(
        lessons
          .filter((lesson) => lesson.track === 'layout')
          .flatMap((lesson) => lesson.requiredProperties),
      );
      [
        'display', 'flex-direction', 'justify-content', 'align-items', 'gap',
        'flex-wrap', 'flex-basis', 'flex-grow', 'flex-shrink', 'order',
        'align-self', 'grid-template-columns', 'grid-template-areas',
        'grid-area', '@media', 'max-width', 'overflow',
      ].forEach((property) => expect(properties).toContain(property));
    });

    test('React lessons cover JSX, state, events, effects, and custom hooks', () => {
      const apis = new Set(
        lessons
          .filter((lesson) => lesson.track === 'react')
          .flatMap((lesson) => lesson.requiredApis),
      );
      ['React.createElement', 'React.useState', 'React.useEffect',
       'ReactDOM.createRoot', 'props', 'onClick', 'onChange'].forEach((api) => {
        expect(apis).toContain(api);
      });
    });

- [ ] Step 2: Run the coverage test.

    Run: npm test -- src/data/contentCoverage.test.js
    Expected: FAIL because content modules do not yet include the complete inventories.

- [ ] Step 3: Author all content from C:/Nauka/web/podstawy-html-css/lekcje-html-css-klasa-1.md and add the React track.
    HTML tasks reinforce semantic elements, valid nesting, accessible labels, meaningful alt text, table headers, and keyboard-friendly controls.
    CSS tasks reinforce separation of structure and presentation, selector reasoning, units, typography, box model, display, position, background, border, and overflow.
    Layout tasks use three concrete mini-builds each:
    - guided: a short change with the needed CSS partly present;
    - independent: a realistic menu, toolbar, cards, dashboard, or responsive section;
    - challenge: a constraint combining earlier properties and requiring a choice between Flexbox and Grid.
    JavaScript tasks cover DOM, events, form handling, state, persistence, and the final planner.
    React tasks use local globals and cover JSX, components, props, state, events, lists, forms, effects, custom hooks, and the task board.
    Keep solution files separate from starter files and ensure every check can run from bridge signals or source text.
    Use the existing diagrams as lesson media instead of recreating them with CSS shapes.

- [ ] Step 4: Run content coverage, curriculum, and full tests.

    Run: npm test -- src/data/contentCoverage.test.js src/data/curriculum.test.js
    Expected: PASS.
    Run: npm test
    Expected: PASS.

- [ ] Step 5: Commit the authored curriculum.

    Run: git add src/data public/course-assets
    Run: git commit -m "feat: author html css layout javascript and react lessons"

### Task 9: Wire preview actions, feedback, progress, and task navigation

**Files:**
- Create: src/hooks/usePreviewRuntime.js
- Create: src/hooks/usePreviewRuntime.test.js
- Modify: src/App.jsx
- Modify: src/components/LessonWorkspace.jsx
- Modify: src/components/PreviewInspector.jsx
- Modify: src/components/FeedbackPanel.jsx
- Modify: src/services/previewDocument.js

**Interfaces:**
- usePreviewRuntime(files, checks, track) returns previewDocument, previewKey, runtimeState, runPreview, checkPreview, clearRuntime.
- runtimeState is { status, messages, errors, signals, checkResults }.
- checkPreview rebuilds the frame, waits for ready, requests signals/actions, then calls evaluateChecks.
- Only declared interaction actions are sent to the iframe.
- React runtime warnings are shown in the same console panel as JS warnings.

- [ ] Step 1: Write failing runtime workflow tests.

    import { renderHook, act } from '@testing-library/react';
    import { usePreviewRuntime } from './usePreviewRuntime.js';

    test('runPreview creates a new preview key and clears old runtime messages', () => {
      const { result } = renderHook(() => usePreviewRuntime(
        { html: '<p>ok</p>', baseCss: '', themeCss: '', js: '' },
        [],
        'html',
      ));
      const firstKey = result.current.previewKey;
      act(() => result.current.runPreview());
      expect(result.current.previewKey).not.toBe(firstKey);
      expect(result.current.runtimeState.messages).toEqual([]);
      expect(result.current.runtimeState.status).toBe('running');
    });

    test('React track marks the runtime as local-react mode', () => {
      const { result } = renderHook(() => usePreviewRuntime(
        { html: '<div id="root"></div>', baseCss: '', themeCss: '', js: 'const App = () => <p>OK</p>;' },
        [],
        'react',
      ));
      expect(result.current.previewDocument).toContain('ReactDOM');
      expect(result.current.previewDocument).not.toContain('https://');
    });

- [ ] Step 2: Run the runtime hook tests.

    Run: npm test -- src/hooks/usePreviewRuntime.test.js
    Expected: FAIL because the hook is not implemented.

- [ ] Step 3: Implement iframe lifecycle and message handling.
    Generate a new preview key for every Run and Check.
    Accept only window messages whose data.source equals web-learning-lab.
    On ready, store status ready and request the signal list required by selected checks.
    On console, append a bounded list of the last 80 messages.
    On runtime-error, append the error and set status error.
    On signals, store the signal payload and evaluate checks.
    Send run-action commands only for declared interactions.
    A React rootReady signal must be recorded after ReactDOM.createRoot or ReactDOM.render completes.

- [ ] Step 4: Run focused tests and full suite.

    Run: npm test -- src/hooks/usePreviewRuntime.test.js src/components/components.test.jsx
    Expected: PASS.
    Run: npm test
    Expected: PASS.

- [ ] Step 5: Commit the connected workflow.

    Run: git add src/hooks/usePreviewRuntime.js src/hooks/usePreviewRuntime.test.js src/App.jsx src/components src/services/previewDocument.js
    Run: git commit -m "feat: connect preview checks and task progress"

### Task 10: Add launcher documentation, accessibility states, and responsive polish

**Files:**
- Modify: README.md
- Modify: start-course.cmd
- Modify: src/styles/app.css
- Create: src/components/accessibility.test.jsx

**Interfaces:**
- README documents Node 18+, one-click start, manual start, port 5181, reset local progress, and 39-lesson / 24-layout-task / 8-React-lesson scope.
- Launcher prints a clear message on missing Node/npm and exits with a nonzero status.
- Responsive UI supports desktop, tablet, and 360–430 CSS px widths without host horizontal overflow.
- Interactive controls expose labels and visible focus indicators.

- [ ] Step 1: Write failing accessibility tests.

    import { render, screen } from '@testing-library/react';
    import App from './App.jsx';

    test('exposes landmarks and labels for the editor workflow', () => {
      render(<App />);
      expect(screen.getByRole('navigation', { name: 'Nawigacja kursu' })).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('complementary', { name: 'Podgląd i diagnostyka' })).toBeInTheDocument();
      expect(screen.getByLabelText('Edytor index.html')).toBeInTheDocument();
    });

- [ ] Step 2: Run the focused test.

    Run: npm test -- src/components/accessibility.test.jsx
    Expected: FAIL until landmarks and labels are present.

- [ ] Step 3: Implement responsive CSS and accessible names.
    Keep the sidebar fixed at desktop and transform it into a drawer below 991px.
    Stack editor and preview below 768px.
    Keep textareas scrollable instead of allowing code to widen the host page.
    Add focus-visible styles for sidebar items, tabs, editor buttons, and task controls.
    Update README with:
      npm install
      npm run dev -- --port 5181
      npm test
      npm run build

- [ ] Step 4: Run accessibility test and build.

    Run: npm test -- src/components/accessibility.test.jsx
    Expected: PASS.
    Run: npm run build
    Expected: exit code 0.

- [ ] Step 5: Commit the responsive and documentation pass.

    Run: git add README.md start-course.cmd src/styles/app.css src/components/accessibility.test.jsx
    Run: git commit -m "docs: polish local course startup and accessibility"

### Task 11: Verify the full product in the browser

**Files:**
- Create: docs/qa-checklist.md
- Create: docs/fidelity-ledger.md

**Interfaces:**
- qa-checklist.md records commands, browser flows, viewport checks, and intentional deviations.
- fidelity-ledger.md records at least five visual comparison points against SQL Learning Lab.
- No product code changes are allowed in this task until a failing or missing behavior is reproduced and covered by a test.

- [ ] Step 1: Run complete automated verification.

    Run: npm test
    Expected: all tests pass with zero failures.
    Run: npm run build
    Expected: exit code 0.

- [ ] Step 2: Start the new app on the reserved port.

    Run: npm run dev -- --port 5181
    Expected: Vite reports http://localhost:5181/ without falling back to another port.

- [ ] Step 3: Verify the core browser flow at a desktop viewport.
    Open the app, select HTML lesson 2, switch through all four tabs, edit HTML and CSS, click Uruchom, and confirm the iframe renders.
    Introduce a syntax error in script.js, click Uruchom, and confirm the runtime panel shows an error.
    Click Sprawdź on a guided task and confirm check results appear.
    Complete one layout task and confirm sidebar progress changes.
    Switch to layout lesson 15 and confirm all three task modes are visible.
    Switch to React lesson 32 and confirm JSX renders with local React runtime and no network URL.
    Click a React button in the preview and confirm state changes.

- [ ] Step 4: Verify the responsive flow at a 390px viewport.
    Open the menu, select a lesson, close the menu, scroll the editor, and confirm the host app has no horizontal overflow.
    Confirm the preview is readable and primary controls remain reachable.
    Verify lesson 22 detects or avoids horizontal overflow.

- [ ] Step 5: Capture evidence in the two QA documents.
    Record the exact browser URL, viewport sizes, test/build output, verified lesson IDs, five visual points, and any remaining intentional deviation.
    If a defect is found, return to its owning task, write a failing test, fix it, rerun npm test and npm run build, then update the evidence.

- [ ] Step 6: Commit the verification record.

    Run: git add docs/qa-checklist.md docs/fidelity-ledger.md
    Run: git commit -m "qa: verify web learning lab workflow"
