import { loadProjects, saveProjects } from "./projectStorage.js";
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
