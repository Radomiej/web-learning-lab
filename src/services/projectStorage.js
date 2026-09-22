import { normalizeProject } from "./projectFiles.js";

export const PROJECT_STORAGE_KEY = "web-learning-lab.files.v3";
const OLD_KEY = "web-learning-lab.files.v2";
const record = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

export function saveProjects(storage, projects) {
  try {
    storage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
    return { warning: "" };
  } catch {
    return {
      warning:
        "Nie udało się zapisać pracy w przeglądarce. Zachowaj kopię kodu przed zamknięciem.",
    };
  }
}

export function loadProjects(storage, lessons = []) {
  try {
    const current = storage.getItem(PROJECT_STORAGE_KEY);
    if (current !== null) {
      const parsed = JSON.parse(current);
      if (!record(parsed)) throw new Error("Nieprawidłowy zapis v3");
      const projects = Object.fromEntries(
        Object.entries(parsed).map(([id, p]) => {
          if (!record(p) || !record(p.files))
            throw new Error("Nieprawidłowy projekt v3");
          return [id, normalizeProject(p)];
        }),
      );
      return { projects, warning: "", readOnly: false };
    }
    const original = storage.getItem(OLD_KEY);
    if (original === null)
      return { projects: {}, warning: "", readOnly: false };
    const parsed = JSON.parse(original);
    if (!record(parsed)) throw new Error("Nieprawidłowy zapis v2");
    const tracks = new Map(
      lessons.flatMap((lesson) =>
        lesson.tasks.map((task) => [task.id, lesson.track]),
      ),
    );
    const projects = Object.fromEntries(
      Object.entries(parsed).map(([id, bundle]) => {
        if (!record(bundle)) throw new Error("Nieprawidłowy szkic v2");
        return [
          id,
          normalizeProject(bundle, {
            track:
              tracks.get(id) || (id.startsWith("react-") ? "react" : "html"),
          }),
        ];
      }),
    );
    return { projects, ...saveProjects(storage, projects), readOnly: false };
  } catch {
    return {
      projects: {},
      readOnly: true,
      warning:
        "Nie można odczytać zapisanych prac. Oryginały zachowano; edytujesz teraz tylko w pamięci. Skopiuj kod przed zamknięciem strony.",
    };
  }
}
