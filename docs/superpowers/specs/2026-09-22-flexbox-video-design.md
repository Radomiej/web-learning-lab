# Design spec — Flexbox explainer video

Status: ready for user review  
Date: 2026-09-22  
Approved direction: separate Remotion project

## Goal

Create a self-contained Polish explainer video that gives a beginner a visual mental model of Flexbox and prepares them for lesson 15, `Flexbox: pierwsza oś`, in the Web Learning Lab. The video should make the parent–child relationship, main/cross axes, and container properties visible through animated examples rather than presenting a wall of CSS text.

## Audience and learning outcome

The viewer is an HTML/CSS learner who needs to recall how a flex container changes the layout of its direct children. By the end, the viewer should be able to explain that Flexbox is one-dimensional, identify the main axis, distinguish `justify-content` from `align-items`, predict `row` versus `column`, and recognize when `flex-wrap` is useful. The final navbar example should connect the concepts to a realistic task in the course.

## Project boundary

- Source project: `C:\Nauka\web-learning-lab-video`.
- The existing course remains in `C:\Nauka\web-learning-lab` and continues to run on port `5181`.
- The video project has its own package manifest, Remotion entrypoint, composition, and Studio command.
- No CDN, remote font, external API, audio track, or runtime dependency on the course app is required.
- A future rendered MP4 may be copied to the course's `public/course-assets` directory, but this first pass does not change the course application.

## Composition contract

- Composition id: `FlexboxIntro`.
- Canvas: 1920 × 1080.
- Frame rate: 30 FPS.
- Duration: 120 seconds / 3600 frames.
- Language: Polish, with captions embedded in the composition.
- Visual system: reuse the course's navy, teal, paper, ink, and soft blue/green accents as local constants; keep the video visually focused and avoid decorative gradients.
- Safe area: keep key text at least 80 px from the sides and 100 px from the top/bottom. Use at least 84 px for the main headline and 44 px for supporting text.

## Scene timeline

| Time | Scene | Viewer should notice |
| --- | --- | --- |
| 0–5 s | Intro | “Flexbox: myśl osiami” and the course visual language. |
| 5–15 s | Model rodzic–dzieci | One parent container controls its direct children; Flexbox is one-dimensional. |
| 15–27 s | Main axis / cross axis | The main axis follows the chosen direction; the cross axis is perpendicular. |
| 27–37 s | `display: flex` | A normal block container switches into a flex container and its children become flex items. |
| 37–49 s | `flex-direction` | `row` places items horizontally; `column` places them vertically and changes the main axis. |
| 49–59 s | `flex-wrap` | Items can move to a new line when the container runs out of room. |
| 59–77 s | `justify-content` | Free space is distributed along the main axis: start, center, and space-between. |
| 77–92 s | `align-items` | Items are positioned on the cross axis: stretch, start, and center. |
| 92–112 s | Navbar exercise | Logo, links, and login button form a practical `nav` using `space-between` and `align-items: center`. |
| 112–120 s | Recap | A compact checklist and a prompt to build the navbar in the course sandbox. |

## Visual and animation approach

Each scene has one visual idea: a bounded container, colored child blocks, a highlighted axis, or a short code card. Code snippets are limited to the property currently being demonstrated. Motion uses Remotion frame primitives (`useCurrentFrame`, `interpolate`, `spring`, and `Sequence`); CSS transitions/animations are not used because they are not deterministic for Remotion rendering.

The axis scene uses an animated arrow and labels `oś główna` / `oś poprzeczna`. The property scenes animate the same three blocks so the learner can compare the effect of one declaration at a time. The navbar scene reuses the same blocks as semantic sections and shows the matching CSS beside the result.

## Content rules

- Use short Polish captions derived from the supplied Flexbox material; do not paste the whole article into the frame.
- Always name the axis before naming the property that operates on it.
- Explicitly correct the common misconception that `justify-content` always means horizontal alignment: it follows the main axis.
- Show `align-items` on a container with visible height so the cross-axis effect is obvious.
- Show `flex-wrap` with enough items to make the line break visible.
- End with the existing practical exercise: semantic `<nav>`, dark background, logo, link group, login button, `justify-content: space-between`, `align-items: center`, and padding.

## Implementation structure

The project will use small scene components and shared primitives:

- `src/Root.tsx` — registers `FlexboxIntro`.
- `src/FlexboxIntro.tsx` — timeline and scene composition.
- `src/components/SceneFrame.tsx` — safe-area frame, title, caption, and progress accent.
- `src/components/FlexContainer.tsx` — reusable animated parent/child block diagram.
- `src/components/CodeCard.tsx` — compact property/code annotation.
- `src/scenes/*.tsx` — one component per timeline scene.
- `src/theme.ts` — local course-inspired tokens.
- `public/` — only local assets if a later scene needs one.

## Verification and handoff

1. Start Studio with `npx remotion studio --no-open --port 5184` and inspect `FlexboxIntro` in the in-app browser.
2. Check representative frames at the beginning, after the axis transition, in the `justify-content` scene, and in the navbar scene.
3. Use a one-frame still check for deterministic layout before considering the composition complete.
4. Do not render the full MP4 until the user explicitly asks for the export; Studio preview and source composition are the first deliverable.

## Non-goals

- Teaching flex item properties (`flex-grow`, `order`, `align-self`) in this first video; they remain covered by later course lessons.
- Building an audio/voiceover pipeline.
- Embedding a live browser or course iframe into the rendered video.
- Changing the Web Learning Lab source or its `5181` server contract.
