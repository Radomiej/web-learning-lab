import { renderHook, act } from "@testing-library/react";
import {
  FILES_STORAGE_KEY,
  PROGRESS_STORAGE_KEY,
  useCourseProgress,
} from "./useCourseProgress.js";
import { lessons } from "../data/lessons.js";

beforeEach(() => {
  window.localStorage.clear();
});

test("restores edited files for a selected task after remount", () => {
  const first = renderHook(() => useCourseProgress(lessons));
  act(() =>
    first.result.current.updateFiles("html-02-guided", {
      "index.html": "<h1>Nowy tytuł</h1>",
    }),
  );
  first.unmount();

  const next = renderHook(() => useCourseProgress(lessons));
  expect(
    next.result.current.filesByTask["html-02-guided"].files["index.html"],
  ).toBe("<h1>Nowy tytuł</h1>");
});

test("resetTask returns the task starter without clearing another task", () => {
  const { result } = renderHook(() => useCourseProgress(lessons));
  act(() =>
    result.current.updateFiles("layout-15-guided", {
      "index.html": "<div>zmiana</div>",
    }),
  );
  act(() =>
    result.current.updateFiles("layout-16-guided", {
      "index.html": "<div>inna</div>",
    }),
  );
  act(() => result.current.resetTask("layout-15-guided"));
  expect(
    result.current.filesByTask["layout-15-guided"].files["index.html"],
  ).not.toBe("<div>zmiana</div>");
  expect(
    result.current.filesByTask["layout-16-guided"].files["index.html"],
  ).toBe("<div>inna</div>");
});

test("does not reuse the legacy file bundle after lesson starters change", () => {
  window.localStorage.setItem(
    "web-learning-lab.files.v1",
    JSON.stringify({
      "layout-15-guided": { html: "", baseCss: "main { display: flex; }" },
    }),
  );

  const { result } = renderHook(() => useCourseProgress(lessons));

  expect(FILES_STORAGE_KEY).toBe("web-learning-lab.files.v4");
  expect(result.current.filesByTask["layout-15-guided"]).toBeUndefined();
});

test("keeps the starter HTML when only the CSS file is edited", () => {
  const { result } = renderHook(() => useCourseProgress(lessons));

  act(() =>
    result.current.updateFiles("layout-15-guided", {
      "styles.css": "main { display: flex; }",
    }),
  );

  expect(
    result.current.filesByTask["layout-15-guided"].files["index.html"],
  ).toContain("<main>");
  expect(
    result.current.filesByTask["layout-15-guided"].files["styles.css"],
  ).toContain("display: flex");
});

test("retired exercises do not grant credit to new scenarios but their drafts remain recoverable", () => {
  window.localStorage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify({
      completedTasks: ["html-01-independent", "html-01-guided"],
    }),
  );
  window.localStorage.setItem(
    "web-learning-lab.files.v2",
    JSON.stringify({
      "html-01-independent": { html: "<p>Moja stara praca</p>" },
    }),
  );
  const { result } = renderHook(() => useCourseProgress(lessons));
  expect(result.current.completedTasks).toEqual(["html-01-guided"]);
  expect(
    result.current.filesByTask["html-01-independent"].files["index.html"],
  ).toContain("Moja stara praca");
  expect(result.current.filesByTask["html-01-independent-v2"]).toBeUndefined();
});

test("edits remain in memory without overwriting damaged stored project", () => {
  localStorage.setItem(FILES_STORAGE_KEY, "broken");
  const { result } = renderHook(() => useCourseProgress(lessons));
  act(() =>
    result.current.updateFiles("html-02-guided", {
      "index.html": "<p>Recovered</p>",
    }),
  );
  expect(result.current.filesByTask["html-02-guided"].files["index.html"]).toBe(
    "<p>Recovered</p>",
  );
  expect(result.current.storageWarning).toBeTruthy();
  expect(localStorage.getItem(FILES_STORAGE_KEY)).toBe("broken");
});

test("hard reset clears achievements, projects and legacy backups in memory and storage", () => {
  localStorage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify({
      selectedTrack: "html",
      selectedLessonId: "html-02",
      completedTasks: ["html-02-guided"],
    }),
  );
  localStorage.setItem(
    FILES_STORAGE_KEY,
    JSON.stringify({
      "html-02-guided": lessons[1].tasks[0].starter,
    }),
  );
  localStorage.setItem("web-learning-lab.files.v3", '{"backup":true}');
  const { result } = renderHook(() => useCourseProgress(lessons));

  act(() => result.current.hardReset());

  expect(result.current.completedTasks).toEqual([]);
  expect(result.current.filesByTask).toEqual({});
  expect(
    Object.keys(localStorage).filter((key) =>
      key.startsWith("web-learning-lab."),
    ),
  ).toEqual([]);
});
