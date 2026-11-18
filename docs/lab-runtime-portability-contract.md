# Lab runtime portability contract

**Status:** interoperability contract and conformance plan. Web Lab has a JavaScript-to-Orbit adapter. Java Lab export to Orbit remains open.

## Scope and naming

“Java Lab” means the separate TeaVM/JDK project. The source audit compared Java Lab revision `fa957db` with Web Lab. All 57 files under `shared/lab-game-v2` matched byte for byte. Java's `GameCanvas` emits pipe-delimited records that the TeaVM worker converts to structured frame commands. Web Lab records structured commands directly. Java's JDK harness covers many declared cases and the TeaVM harness explicitly compares C38. Source and fixture parity do not establish equal results across all targets.

The C38 lifecycle and geometry cross-check now passes in JDK, TeaVM/Wasm,
Web Lab and the Web Lab export in Orbit's native runner. After five
100 ms updates, the fixture was at (160, 80), measured 40×20, and recorded
one create and five updates. The comparison excludes the bootstrap
zero-delta update. This verifies one scenario and does not establish that
Orbit can execute a Java Lab package directly.

“Kalio” means the legacy project/package naming retained in this Orbit workspace (for example, `kalio.json` compatibility). For runtime comparisons this document uses **Orbit/Kalio**: Orbit is the current Rust/SDL2 host and Kalio is a legacy alias. It is not the Java Lab runtime.

## Compatibility levels

1. **Source portability:** the same gameplay intent can be expressed in each API, with a small language/host adapter.
2. **Semantic portability:** the observable state and event results match for a named scenario within documented tolerances.
3. **Package portability:** a package can be installed and launched unchanged. This is *not* implied by source or semantic portability.

Java Lab and Web Lab share the Lab Game v2 API semantics across their respective languages. Orbit/Kalio has a separate, versioned LRP/native host boundary. Web Lab bundles its JavaScript engine behind that boundary, which explains why its package declares LRP/1 while its student-facing API is v2. Java Lab's TeaVM engine still requires an Orbit execution adapter. Each exporter should diagnose unsupported features before installation.

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
| Packaging | Web project/course save or Java Lab project; not an Orbit package. | `.orbit`/legacy Kalio manifest and native/local package lifecycle. | Package portability is unsupported. Convert source and assets into a target package, then validate its runtime/API versions and integrity separately. |

The portable *candidate* between all three is deliberately narrow: deterministic game rules over explicit logical input snapshots and elapsed seconds, plus a bounded list of primitive clear/rectangle/circle/line/text draw intents. Even this subset is portable only where color encoding, coordinate origin, primitive geometry, text alignment/font behavior, command order, and frame timing have been normalized and tested. Sprites, asset loading, GameObjects/components, collision, audio, persistence, UI widgets, and package installation are capability-specific until each receives an explicit mapping and conformance scenarios.

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

1. Freeze a small common-subset fixture suite independent of either renderer: clear/background; rectangle/circle/line/text; exact frame dt; logical button held/pressed/released; deterministic random seed; emitted command order. Use explicit expected values and normalized event/draw logs.
2. Implement a versioned adapter that translates those fixtures to the chosen Orbit LRP API and reports its capability matrix. Confirm launch/exit, memory/command limits and visible failure for unsupported capability on desktop before device work.
3. For each mapped semantic, compare normalized state/input/draw traces. Verify primitive geometry and text separately; text can remain unsupported if font metrics cannot be matched. Add fixture coverage for boundary values, invalid numbers, overflow limits and unsupported commands.
4. Qualify advanced APIs one at a time: assets (same bytes, key, pivot and decode), then scene/component lifecycle, then input/UI, then collision/time, then audio/storage. Do not broaden the common subset merely because both sides have similarly named methods.
5. Keep package tests distinct: manifest/version, path traversal rejection, hashes/signatures, offline asset resolution, failure cleanup and return to launcher. A passing source conformance suite does not imply a package can be installed.
6. Device validation is a later, separate gate after exact KNULLI ABI and runtime facts are rechecked. Desktop success is not evidence of handheld graphics, timing, controller, audio or memory behavior.

### Required result record

For every run record commit/revision, dirty-tree state, API/runtime versions, toolchain/browser/TeaVM version, fixture list and count, pass/fail/skip counts, numeric tolerance, asset hash result, and artifact paths. List each skipped target and why. The checked-in Web report `docs/lab-game-v2-conformance-web-report.json` is a historical report that contains a failed C36 assertion (`FIREBALL` expected `projectile`); the later progress document reports the final follow-up smoke but does not replace that JSON. Re-run the current suite and store a fresh report before describing the full suite as green.

## Evidence available in this checkout

- Web Lab v2 contract, input docs, render protocol, assets, course data, and C01–C43 scenario definitions are present under `shared/lab-game-v2/`.
- `scripts/sync-lab-game-v2.mjs` is designed to copy/hash Web sources into a sibling `java-lab/` tree and supports `--check`; that sibling tree is absent here, so no current Java sync check was possible.
- `docs/lab-game-v2-progress.md` records prior Java/JDK, TeaVM, Web, and sync results. These are historical evidence, not a fresh verification of current sources.
- `docs/lab-game-v2-conformance-web-report.json` records 58/59 passing assertions and a C36 failure. That report must be treated as failed until rerun/current evidence resolves it.
- Orbit docs describe the LRP subset, Rust API, and remaining adapter/device-validation gaps; no evidence in this checkout establishes Java Lab package execution on Orbit/Kalio.
