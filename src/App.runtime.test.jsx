import { render } from "@testing-library/react";
import App from "./App.jsx";
import { PROGRESS_STORAGE_KEY } from "./hooks/useCourseProgress.js";
import { allLessons } from "./data/curriculum.js";

const runtime = vi.hoisted(() => ({ state: null }));
vi.mock("./hooks/usePreviewRuntime.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    usePreviewRuntime: (...args) => {
      const result = actual.usePreviewRuntime(...args);
      return {
        ...result,
        runId: "test-run",
        runtimeState: { ...result.runtimeState, ...runtime.state },
      };
    },
  };
});

test.each([false, true])(
  "late errors revoke only credit awarded by this run (previous credit: %s)",
  (alreadyCompleted) => {
    const lesson = allLessons[0];
    const taskId = lesson.tasks[0].id;
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        selectedLessonId: lesson.id,
        selectedTrack: lesson.track,
        completedTasks: alreadyCompleted ? [taskId] : [],
      }),
    );
    runtime.state = {
      status: "ready",
      errors: [],
      checkResults: [{ id: "ok", passed: true }],
    };
    const view = render(<App />);
    expect(
      JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY)).completedTasks,
    ).toContain(taskId);
    runtime.state = { status: "error", errors: ["late"], checkResults: [] };
    view.rerender(<App />);
    expect(
      JSON.parse(
        localStorage.getItem(PROGRESS_STORAGE_KEY),
      ).completedTasks.includes(taskId),
    ).toBe(alreadyCompleted);
  },
);
