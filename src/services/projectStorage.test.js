import {
  clearCourseStorage,
  loadProjects,
  PROJECT_STORAGE_KEY,
  saveProjects,
} from "./projectStorage.js";
beforeEach(() => localStorage.clear());
test("migrates unknown v2 drafts without changing originals", () => {
  const original = JSON.stringify({
    old: { html: "<p>Mój szkic</p>", baseCss: "a{}", themeCss: "b{}", js: "" },
  });
  localStorage.setItem("web-learning-lab.files.v2", original);
  const result = loadProjects(localStorage, []);
  expect(result.projects.old.files["index.html"]).toContain("Mój szkic");
  expect(result.projects.old.files["styles.css"]).toBe("a{}\nb{}");
  expect(localStorage.getItem("web-learning-lab.files.v2")).toBe(original);
  expect(loadProjects(localStorage, []).projects).toEqual(result.projects);
});
test("valid v3 wins over v2 and retains empty file", () => {
  localStorage.setItem(
    "web-learning-lab.files.v2",
    JSON.stringify({ old: { html: "old" } }),
  );
  const projects = {
    task: {
      entry: "index.html",
      files: { "index.html": "", "extra.js": "new" },
    },
  };
  localStorage.setItem("web-learning-lab.files.v3", JSON.stringify(projects));
  expect(loadProjects(localStorage, []).projects).toEqual(projects);
});
test("malformed v3 is protected even when v2 is valid", () => {
  localStorage.setItem("web-learning-lab.files.v3", "{bad");
  localStorage.setItem("web-learning-lab.files.v2", "{}");
  const result = loadProjects(localStorage, []);
  expect(result.readOnly).toBe(true);
  expect(result.warning).toBeTruthy();
  expect(localStorage.getItem("web-learning-lab.files.v3")).toBe("{bad");
});
test("quota failure returns a visible warning", () => {
  expect(
    saveProjects(
      {
        setItem() {
          throw new Error("QuotaExceededError");
        },
      },
      {},
    ).warning,
  ).toBeTruthy();
});

test("migrates stale layout scaffolds while preserving student CSS and the v3 backup", () => {
  const oldProjects = {
    "layout-15-guided": {
      entry: "index.html",
      files: {
        "index.html":
          "<main><h1>Stary układ</h1><p>Brak elementów ćwiczenia</p></main>",
        "styles.css": ".practice { display: flex; }",
        "notes.js": "// mój plik",
      },
    },
  };
  const original = JSON.stringify(oldProjects);
  localStorage.setItem("web-learning-lab.files.v3", original);
  const lessons = [
    {
      track: "layout",
      tasks: [
        {
          id: "layout-15-guided",
          starter: {
            entry: "index.html",
            files: {
              "index.html":
                '<main><section class="practice"><div class="item">A</div></section></main>',
              "styles.css": "/* starter */",
              "script.js": "",
            },
          },
        },
      ],
    },
  ];

  const result = loadProjects(localStorage, lessons);

  expect(PROJECT_STORAGE_KEY).toBe("web-learning-lab.files.v4");
  expect(result.projects["layout-15-guided"].files["index.html"]).toContain(
    'class="practice"',
  );
  expect(result.projects["layout-15-guided"].files["styles.css"]).toBe(
    ".practice { display: flex; }",
  );
  expect(result.projects["layout-15-guided"].files["notes.js"]).toBe(
    "// mój plik",
  );
  expect(localStorage.getItem("web-learning-lab.files.v3")).toBe(original);
  expect(localStorage.getItem(PROJECT_STORAGE_KEY)).toContain(
    'class=\\"practice\\"',
  );
});

test("hard reset removes every learning-lab version but leaves unrelated storage", () => {
  localStorage.setItem("web-learning-lab.progress.v1", "progress");
  localStorage.setItem("web-learning-lab.files.v2", "v2");
  localStorage.setItem("web-learning-lab.files.v3", "v3");
  localStorage.setItem("web-learning-lab.files.v4", "v4");
  localStorage.setItem("another-app", "keep");

  clearCourseStorage(localStorage);

  expect(Object.keys(localStorage)).toEqual(["another-app"]);
  expect(localStorage.getItem("another-app")).toBe("keep");
});
