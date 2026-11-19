# Lab runtime portability contract

**Status (2026-11-18):** interoperability contract and conformance plan. Web Lab has a JavaScript-to-Orbit adapter profile; Java Lab export to Orbit remains open. The shared Lab Game v2 contract is the learner-facing core, while each host profile records its supported subset.

## Scope and naming

“Java Lab” means the separate TeaVM/JDK project. The original source audit used Java Lab revision `fa957db` and reported 57 matching files under `shared/lab-game-v2`; the current `sync-lab-game-v2.mjs --check` verifies 115 shared files (see the latest result below). Java's `GameCanvas` emits pipe-delimited records that the TeaVM worker converts to structured frame commands. Web Lab records structured commands directly. Matching files and fixtures do not establish equal results across every target.

The C38 lifecycle and geometry cross-check passes in Java/JDK, TeaVM/Wasm and
Web Lab. After five 100 ms updates, the fixture is at (160, 80), measures
40×20, and records one create and five updates. The comparison excludes the
bootstrap zero-delta update. This verifies one scenario; it does not establish
that Orbit can execute a Java Lab package directly.

“Kalio” means the legacy project/package naming retained in this Orbit workspace (for example, `kalio.json` compatibility). For runtime comparisons this document uses **Orbit/Kalio**: Orbit is the current Rust/SDL2 host and Kalio is a legacy alias. It is not the Java Lab runtime.

## Canonical model and compatibility levels

The canonical learner-facing engine is the complete **Lab Game 2D v2** model. The `kalio-portable/1` adapter profile is a target boundary; it must never redefine the shared engine or remove GameObject/Component APIs from it. Java Lab and Web Lab should continue to teach and implement the same public v2 concepts, with their documented Java/JavaScript syntax differences.

1. **Source portability:** the same gameplay intent can be expressed in each API, with a small language/host adapter.
2. **Semantic portability:** the observable state and event results match for a named scenario within documented tolerances.
3. **Package portability:** a package can be installed and launched unchanged. This is *not* implied by source or semantic portability.

Java Lab and Web Lab implement the Lab Game v2 contract in their respective languages. The shared documentation defines the required semantics; current parity evidence is limited to the named scenarios and runs recorded below. Orbit/Kalio has a separate, versioned LRP/native host boundary. Web Lab bundles its JavaScript engine behind that boundary, which explains why its package declares LRP/1 while its student-facing API is v2. Java Lab's TeaVM engine still requires an Orbit execution adapter. Each exporter should diagnose unsupported features before installation.

## Inventory from the checked-in implementations

This comparison is about APIs present in code and generated catalogs, not names used in marketing material.

| Area | Lab Game v2 (Web + Java) | Orbit/Kalio native crates | Orbit/Kalio QuickJS LRP host |
| --- | --- | --- | --- |
| Main model | `Game` owns a scene of `GameObject`s; each object has a `Transform` and typed `Component`s. Components have `onCreate`, `onUpdate`, `onLateUpdate`, enable/disable and destroy hooks. | `orbit-world` is a hecs ECS with stable generation-checked entity IDs and typed components such as `Transform2D`, `Velocity2D`, `Sprite`, `Collider2D`, and `RigidBody2D`. Rust `Game`/`GameSession` is a host trait and lifecycle, not a student-authored GameObject scene. | The LRP prelude offers `lab.spawn()` numeric handles, string-kind components, `lab.attachRenderer`, property access/call helpers, and an update callback. This is not the typed Lab component API. The Web Lab exporter bundles the Web JavaScript runtime, so its scene simulation runs in the bundle rather than using Orbit's native ECS. |
| Unity-like structure | Closest to Unity: scene/objects/components/transforms, per-object behavior, component lifecycle, typed component lookup, renderers, camera, tile map, colliders/triggers and controller components. It is an educational 2D model, not Unity compatibility. It has no parent/child Transform hierarchy or general rigid-body solver. | Closest in data-oriented ECS terms: entities/components, schema metadata, stable IDs and a Rapier adapter. It lacks the student-facing GameObject/Component inheritance and per-component Unity-style hooks in the native API surface. | Uses some familiar words, but host operations are JavaScript functions over numeric IDs and untyped component kinds. No native collision system is wired into this boundary today. |
| Movement/physics | Lab v2 exposes explicit collider dimensions, circle/box contacts, triggers, masks, sweep/projectiles, spatial queries, and kinematic CharacterController2D movement. | Rapier-backed fixed-step rigid bodies, box/circle shapes, masks, contact/sensor enter-stay-exit events. Semantics and scheduling are independently defined. | Host LRP input/draw protocol does not provide parity with either Lab collision behavior or native Rapier. Web Lab JavaScript exports carry the Web Lab physics code; that does not make it Orbit-native physics. |
| Rendering and media | `Canvas`, `ShapeRenderer`, `Sprite`, `SpriteAnimator`, `TextRenderer`, `Camera2D`, `TileMap`, `UITransform`, `Button`, `ProgressBar`, plus shared assets and `game.audio`. | Bounded Canvas2D command recording, paths/curves, sprite quads, Lyon/SDL renderer and logical input. The crate does not itself provide the Lab sprite/component object model. | Ordered `lab.*` draw calls, input, audio and file/storage helpers, plus a small JS registry. Web Lab export translates the Web renderer's ordered commands to this host. Runtime extensions are versioned separately. |

### Public API versus implementation helpers

The canonical public surface is what students can construct/use from `GameLab` in JavaScript or `engine.*` in Java, plus the published versioned behavior in `API.md`, `INPUT.md`, `AUDIO.md`, and `contract.json`. Transport records, TeaVM bridge classes, parser/index helpers and renderer internals are not public API merely because they are Java source files or completion-catalog entries.

The current code exposes a discoverability mismatch that must remain visible until reconciled:

- Web's `gameRuntime.js` returns `SpriteAnimator`; Java's `gameExtrasRuntime.js` implements it; Web `gameLabApi.js` already describes it. The generated `contract.json` and shared editor catalog were stale and omitted it.
- Web documents `ControlsHint`; Java has no matching runtime class. Keep it marked as a Web-only extension until Java implements it or the Web-only helper is intentionally retired. Do not count it as a shared core feature.
- Java has 50 class/interface source entries, while `contract.json` had 41 top-level names before regeneration. Those counts mix public types with support/transport types and are not a parity metric.
- Java support classes such as `Bounds`, `ComponentChange`, `ComponentChangeListener`, `GameCanvas`, `Input`, `Physics2D`, `UIBounds`, `Time`, `SpatialHash2D`, `Notes`, and `Sequencer` need a public/internal classification. Some are useful public concepts (for example `Time` fields and audio sequencing); some are bridge details. Keep classification in docs/catalog metadata instead of exposing every helper to beginner completion.
- Java `docs/game-engine.md` is older in places than v2: it mentions 600×400, `Vector3`, and older physics hooks. Use 640×480, `Vector2`, radians, v2 lifecycle and the generated shared API contract as the source of truth. The Java docs update is tracked separately from this Web Lab change.

**Recommended core:** retain the fullest existing GameLab v2 class/component model and its meaningful capabilities as the shared contract. Maintain a beginner path through `Game → GameObject → Transform → Component → Input/Time → renderer → collision`, with short runnable examples, API search/completion descriptions, and errors that name the missing component, bad key/size, unsupported operation, or next corrective action. Keep framework internals and host entry points in a separate reference section. Web's API guide/completions and Java's engine guide/completions should be generated from the same public contract, with language-specific signatures layered on top.

## Shared semantic core: Lab Java and Web Lab

These are the intended shared rules for matching v2 implementations. Names and syntax may differ by language.

| Area | Required shared meaning | Allowed language/runtime difference |
| --- | --- | --- |
| Coordinates and drawing | Logical 640×480 viewport; positive Y down; positions are object centers in logical pixels; rotation is radians. Letterbox scaling preserves aspect and input is mapped back to logical coordinates. | Java emits draw records through TeaVM `GameCanvas`; JS submits equivalent records to the common renderer. |
| Lifecycle and clock | Scene/component lifecycle and deterministic phase order; `deltaTime` is seconds, capped at 0.1 s. Pause freezes WORLD updates/time while UI and unscaled time continue. | Java classes/imports and JS constructors/callback syntax differ. |
| Object/component identity | Stable scene-local object IDs; snapshots for collection-returning queries; missing `getComponent` returns null; `requireComponent` reports configuration failure. Component queries include subclasses and results are deterministic by ID. | Java uses `Type.class`; JS passes the class value directly. |
| Activity and mutation | Disabling an object/component removes it from active physics immediately. Destruction removes it from subsequent queries/contacts. | Java public fields cannot observe writes. Prefer `setPosition`, `setActive`, and `setEnabled`; after direct mutation between physics queries in one update call `physics.refresh()`. JS accessors invalidate automatically. |
| Collision and movement | Collider geometry is explicit and independent from visual scale; trigger/mask behavior, sweep and contact ordering follow the v2 scenarios. Rotated visual geometry does not silently resize a collider. | Internal broad-phase and host implementation can differ only if scenario-observable results agree. |
| Input and UI | Logical input and mouse edges are scene-local. A UI control activates on a matching press/release; focus/capture is deterministic; UI and camera/world coordinate spaces are distinct. | Physical browser keys/controller events and TeaVM transport differ, but normalized logical events must match. |
| Assets and rendering | Public asset keys and actual asset bytes are shared from the manifest. Draw records preserve stable ordering; frame geometry and UI draw commands share the versioned renderer protocol. | Java enum `Assets` and JS frozen constants are generated from the manifest. Transport encoding differs, not rendered meaning. |

The contract is defined by `shared/lab-game-v2/API.md`, `INPUT.md`, `contract.json`, `render-protocol.json`, the asset manifest, and `conformance/scenarios.json`. The v2 course's Java/JS starter and solution pairs are expected to differ only in syntax, types/imports, class passing, and host integration—not gameplay behavior.

## Orbit/Kalio boundary and semantic distinctions

Orbit's LRP is a different API layer. The package/API documents describe an `init()` / `update(dt)` frame lifecycle and a bounded host command stream (`lab.clear`, primitive draw calls, dimensions, input, logging; some Orbit documentation also describes later explicit extensions). The launcher owns SDL, input sampling, audio, process/lifecycle supervision, and rendering. This is not DOM, browser Canvas, nor the full GameLab GameObject/Component runtime.

| Concern | Lab v2 (Java/Web) | Orbit/Kalio LRP/native host | Portability rule |
| --- | --- | --- | --- |
| Runtime model | Scene with GameObjects, Components, WORLD/UI phases, component lifecycle, physics and queries. | Host-driven JS frame callback and validated draw/input commands; native Rust world/physics crates are a separate API surface. | Do not translate a Lab scene into LRP and claim full engine parity. A thin game must target an explicitly named common subset. |
| Rendering | GameLab renderer records object/UI commands; includes sprites, nine-patch, progress and collider/debug records per v2 protocol. | SDL renderer consumes a bounded command protocol; exact capabilities depend on the declared LRP/API version. | Map only command semantics with matching geometry, order, color, transform, and text behavior. Expose unsupported features as errors/capability absence. |
| Time | World and unscaled clocks, pause semantics, phase ordering, max delta 0.1 s. | Host supplies `update(dt)`; a fixed-step physics mode may be host-controlled. | An adapter must state whether `dt` is clamped and when physics runs. Never equate update counts with equal time without a fixed input/time fixture. |
| Input | GameLab `InputManager`, keyboard/mouse state and transitions, focus/capture, gamepad action aliases. | Logical LRP key state/transitions sampled by SDL host; Orbit may add versioned host capabilities. | Normalize to named logical actions and test held/pressed/released separately. Browser keycodes are not device key identities. |
| Physics | Kinematic component engine with v2 spatial index, triggers, masks, sweep and scenario-defined event order. | Rust `orbit-physics2d` uses Rapier2D fixed-step adapter; its public contract and ownership are separate. | Do not promise matching contacts, solver response, or callback timing until an adapter maps and passes paired scenarios. |
| Data/assets | Shared Lab asset manifest and keys. | Orbit package-relative assets and host loading are independently versioned; device package format/signature rules also apply. | Similar key names do not prove identical bytes, decode, pivot, or availability. Verify manifest hash and capability before conversion. |
| Packaging | Web project/course save or Java Lab project. Web Lab can also generate a target-specific Orbit package; Java Lab cannot yet export one. | `.orbit`/legacy Kalio manifest and native/local package lifecycle. | Web export creates a new package for `kalio-portable/1`; it does not make the source package portable unchanged. Validate target versions, capabilities and file hashes before installation. |

The adapter is separate from the canonical core. Web Lab's JavaScript export currently packages the Web Lab v2 JavaScript runtime inside a Kalio/Orbit LRP package and maps its frame, input, audio, and render boundary. Java Lab student code is compiled by TeaVM to WebAssembly; the current QuickJS LRP host does not run that TeaVM artifact. Java-to-Kalio therefore needs a distinct TeaVM/Wasm host and versioned bridge, not a renamed `.wasm` file or a claim based only on shared source semantics.

The current adapter profile is documented in [`kalio-portable-1.json`](kalio-portable-1.json). It maps the host-facing semantics while preserving the full Lab v2 engine as the authoring core. Anything outside the profile must either be implemented by the target-side bundled v2 runtime or rejected with an actionable error. Do not silently replace missing sprites/widgets with generic rectangles or drop unknown render operations. The profile is a compatibility declaration, not evidence that Java and Orbit run every v2 feature today.

## Java Lab follow-on: TeaVM/WebAssembly

Java Lab should use the same learner-facing Lab Game v2 API as Web Lab, then export to a separate Orbit runtime profile. This follow-on is not implemented. A fresh TeaVM build of the Java Lab `survivor` course project produced a 176,031-byte Wasm module with 30 imports and 18 exports. The imports include TeaVM/JS interop (`teavmJso`, `teavmMath`, `teavm`) and `wasm:js-string`; the exports include `main`, `tick`, `frame`, `setKey`, `resize`, and `dispose`. The probe was loaded using Java Lab's vendored JavaScript TeaVM runtime, not an Orbit engine. Machine-readable details are preserved in `out/online-orbit-evidence/java-teavm-module-probe.json` for this local session.

The next target should use an explicit package runtime such as `teavm-wasm` and a separately versioned adapter ABI such as `lab-game-wasm/1`. The adapter must supply or eliminate the exact imports, define input/frame/render/audio/lifecycle/error transport, and reject unprofiled Java features before creating an installable package. Select a Rust Wasm engine only after checking TeaVM imports, JavaScript string built-ins, device memory, and frame-time limits. Required steps and the novice-facing explanation are in the shared [Lab Game portability guide](../shared/lab-game-v2/PORTABILITY.md). Do not claim Java execution on Orbit until the paired desktop traces and a physical-device run both pass.

## Version and capability negotiation

- Treat Lab `engineApiVersion: 2.0.0`, Orbit package `apiVersion`, LRP protocol version, package `formatVersion`, and Orbit Rust `orbit-game-api` version as separate version axes. Do not compare their numbers as if they were one version.
- Each adapter declares `sourceRuntime`, `sourceApi`, `targetRuntime`, `targetApi`, and a capability list. A feature is supported only when both endpoints advertise the same semantics or a tested mapping.
- Conversion fails closed for unknown versions, unsupported commands, unavailable assets, unbounded values, and semantics that cannot be preserved. Diagnostics identify the first unsupported feature and source location/asset key where available.
- A display-only `supports` list is not proof. A capability becomes conformant only after its shared fixtures pass on both endpoints.
- Preserve source and target project files. Conversion output is a generated artifact with input hashes and adapter version, never an in-place rewrite.

## Conformance plan

### A. Lab v2 parity (Java Lab ↔ Web Lab)

1. Restore/locate the sibling `java-lab/` checkout and verify the sync provenance. Run `node scripts/sync-lab-game-v2.mjs --check`; capture source commit/dirty state and hashes for shared runtime, renderer, transport, assets, courses and scenario fixtures.
2. Compile and execute all C01–C43 fixtures on Web JS and Java/JDK. Compare normalized observable state, callback order, input edges and render commands at tolerance `1e-6`; compare asset keys *and bytes* by SHA-256. Keep engine-private internals out of the oracle.
3. Run C38 independently on JavaScript, Java/JDK and actual TeaVM WebAssembly. Ensure the TeaVM run loads the production transport worker and reports the compiled artifact/runtime version.
4. Run paired course checks for each Java/JS task: starter does not pass, expected solution does pass, and criteria/IDs are shared. Run the same survival end-to-end replay with fixed random seed, fixed dt, and timestamped logical input.
5. Run renderer/input smoke fixtures at 640×480 and resized letterboxed viewports: center/origin, rotation radians, visual-scale/collider independence, stable layering, pointer inverse transform, mouse press/release, pause, reset and asset decoding.
6. Report Java/JDK, Web, and TeaVM results separately. Do not substitute unit tests for browser rendering or claim visual conformance from protocol-only results.

### B. Orbit/Kalio adapter qualification

1. Freeze fixtures for the adapter boundary: 640×480 logical drawing, center-based rectangle/circle, centered text anchor, exact clamped `dt`, logical key held/pressed/released edges, note-to-tone mapping, song track order/tempo, stop/replacement cancellation, track-limit rejection, and emitted command order. Compare traces, not platform font pixels/audio samples.
2. Build/test Web Lab export through the current host. For Java Lab, first profile TeaVM imports/exports and choose a compatible Wasm host; only then execute a bridged fixture on JDK, TeaVM/Wasm, and Orbit/Kalio. Fail unsupported source/API features before creating a package.
3. Compare normalized state/input/draw/audio-request traces. Test invalid numbers, out-of-range values, missing assets, unknown render ops, and overflow. Unsupported cases must fail with the API name and a corrective action.
4. Extend parity feature by feature: assets and bytes, scene/component lifecycle, UI, collision/time, and storage. Keep native Orbit ECS/Rapier results as a distinct target unless a mapping passes the same fixtures.
5. Keep package tests distinct: manifest/version, path traversal rejection, hashes/signatures, offline asset resolution, failure cleanup and return to launcher. A passing source conformance suite does not imply a package can be installed.
6. Device validation is a later, separate gate after exact KNULLI ABI and runtime facts are rechecked. Desktop success is not evidence of handheld graphics, timing, controller, audio or memory behavior.

### Required result record

For every run record commit/revision, dirty-tree state, API/runtime versions, toolchain/browser/TeaVM version, fixture list and count, pass/fail/skip counts, numeric tolerance, asset hash result, and artifact paths. List each skipped target and why. The checked-in `docs/lab-game-v2-conformance-web-report.json` remains a historical 58/59 report with an obsolete C36 asset-key assertion (`FIREBALL` expected `projectile`). The fresh result below supersedes it for the current Web source; the historical artifact stays unchanged for traceability.

## Latest verification (2026-11-18)

- Source worktrees: Web Lab `0c8f6ea` and Java Lab `fa957db`; both contain uncommitted work. Current API version is Lab Game 2D v2 (`2.0.0`).
- `node scripts/sync-lab-game-v2.mjs --check` verified 115 shared files against the sibling Java Lab checkout. This proves file synchronization, not semantic parity on every runtime.
- Web Lab verification: C01–C43 conformance suite 47/47; `gameRuntime` + `labGameV2` tests 32/32; Kalio profile tests 3/3. These are Web-side results. The broader `test:assignments` command still reports two unrelated course/quiz-count expectation failures (70 vs 63 courses; 3 vs 4 quiz items).
- Java/Web independent parity: C38 passes on Java/JDK, actual TeaVM WebAssembly and Web JavaScript with position (160, 80), geometry 40×20, one create event and five update events. This is one cross-runtime scenario, not proof that every C01–C43 case is identical in Java and Web.
- Orbit/Kalio: the checked device reported launcher 0.3.38, API v1 and `weblab-atlas`; the Web package adapter is available for QuickJS LRP. A successful export fixture or mocked browser relay test does not establish production cross-network pairing or Java execution on the device.
- Web Lab desktop replay: a package built by `buildPlaygroundOrbit` ran through the release `orbit-run` 0.3.38 at scale 1 (640×480), fixed `dt=16 ms`, seed 2026. Holding D-pad-right for 59 frames moved the 28×28 player from center (79.5, 239.5) to (192.5, 239.5); original screenshots, input trace, package, and hashes are in the local `out/online-orbit-evidence/` directory. This proves one Web export and visual/input mapping on desktop. The runner drains audio without output, so sound was not auditioned.
- Java TeaVM probe: a current TeaVM course module had 30 imports/18 exports (176,031 B), with the import namespaces and ABI recorded above and in `out/online-orbit-evidence/java-teavm-module-probe.json`. It was instantiated using the vendored TeaVM JavaScript runtime, not on Orbit; Java→Orbit remains unsupported.
- Unsupported or not yet qualified: Java TeaVM/Wasm package execution on Orbit, full Java↔Web conformance across all scenarios, native Orbit ECS/Rapier parity, pointer/mouse input on the handheld profile, pixel-identical text and sample-identical audio, and a live cross-network relay session.

## Orbit adapter regression recheck (2026-11-19)

- A Web Lab `TileMap` export initially failed in Orbit because the Lab runtime emits a `tilemap` metadata record before the visible tiles. The adapter now skips that marker and preserves the following ordered sprite draws; unknown render operations still report an error.
- The TileMap exporter regression and profile checks pass 5/5. A fresh package with a TileMap and moving player ran in the release `orbit-run` at 640×480; a 59-frame right input moved the player 113 px (113.28 px expected). Original captures and file hashes are recorded in `out/online-orbit-evidence/desktop-replay.md`.
- The production Web Lab bundle builds successfully. After updating the formatter and dynamic lesson-count expectations, the full Vitest suite passes: 105/105 files and 1,350/1,350 tests. Component tests still print non-failing JSDOM warnings for unsupported `window.scrollTo` and `requestSubmit` APIs.
- At the time of this 0.3.38 read-only check, physical package launch and live cross-network relay were unverified. A later 0.3.41 device/API check is recorded below.
- The latest Web/Java synchronization and test summary is appended to `docs/lab-game-v2-progress.md`. The older 58/59 JSON report is retained as historical evidence only.

## Orbit device/API check (2026-11-19, launcher 0.3.41)

- The connected KNULLI/aarch64 console reported API v1 and the package-deploy, patch-deploy and Web Lab capabilities. Through a temporary USB ADB port forward, status, game listing, screen capture and pairing discovery responded successfully.
- A complete staged deployment uploaded `orbit.json` and `main.js` (165,465 bytes total). The device file SHA-256 matched the host package. The launcher listed, launched and stopped the temporary Web Lab package without a runtime error; a separate post-deploy screenshot confirms the API-installed copy launched. The temporary package and port forward were removed afterward.
- A replay on the API-installed copy moved +18 px for a synthetic 200 ms Right input; the deterministic desktop replay moved +23 px. An earlier ADB-installed copy with the same `main.js` hash moved +22 px, so device timing varied by 4 px across runs. This did not press the physical handheld D-pad. Full-frame differences were 8.219% before movement and 8.310% after the API-installed replay, mostly in the tiled background; functional input works, but timing and pixel-perfect parity remain open.
- The tested package contained code and a manifest, not separate image/audio files. The Orbit package API accepts multiple files, but a standalone asset transfer was not part of this run. Web Lab's private exporter still does not package arbitrary project assets.
- The console relay page reported `CONNECTED · WAITING FOR OWNER`; the Nekko portal still required account sign-in to add the console. Its separate Instant page offers five-hour `.nekko` game sharing, not console claim/debug. The public API readiness endpoint returned HTTP 200, but no authenticated claim or cross-network deploy/debug request was completed; readiness alone does not prove relay command delivery.
- Java TeaVM/WebAssembly remains unsupported by the Orbit runtime. See the local workspace evidence report at `C:\Projekty\konsolka\out\online-orbit-evidence\api-test-report-0.3.41.md` for hashes, frame names, input traces and request results.
- A matched desktop/handheld replay now covers the same installed `web-lab-orbit-check` package and exact `main.js` hash (`e692d028366c975c748804a460cafd9b50e0b7c492b35f8509c513433f539b31`). Desktop `orbit-run` replay `1:7 right` asserted `scout-x=141`; a 200 ms synthetic uinput `ABS_HAT0X` right event on the physical console also reached `scout-x=141`. Their 640×480 post-move frames were pixel-identical (0/307,200 differing pixels). This confirms one hat-to-SDL-to-Web-Lab scenario; it is not a physical switch press or a full compatibility proof. Full details and source frames: `C:\Projekty\konsolka\out\online-orbit-evidence\same-game-dpad-parity-0.3.41.md`.
