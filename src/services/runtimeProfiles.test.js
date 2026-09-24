import {
  REACT_PROFILE_IDS,
  getReactPathSet,
  getReactProfile,
} from "./runtimeProfiles.js";

test("defaults React projects to the CRA INF.04 profile", () => {
  const profile = getReactProfile();

  expect(profile.id).toBe(REACT_PROFILE_IDS.CRA_INF04);
  expect(profile.entry).toBe("public/index.html");
  expect(profile.runtime).toEqual({
    kind: "react-cra",
    module: "src/index.js",
    root: "#root",
    bootstrap: true,
  });
  expect(profile.paths.app).toBe("src/App.js");
  expect(profile.paths.component("Card")).toBe("src/components/Card.js");
  expect(profile.paths.hook("useCounter")).toBe("src/hooks/useCounter.js");
});

test("keeps the existing Vite profile available explicitly", () => {
  const profile = getReactProfile(REACT_PROFILE_IDS.VITE);
  const paths = getReactPathSet(REACT_PROFILE_IDS.VITE);

  expect(profile.entry).toBe("index.html");
  expect(profile.runtime.kind).toBe("react-vite");
  expect(profile.runtime.module).toBe("main.jsx");
  expect(paths.app).toBe("App.jsx");
  expect(paths.component("Card")).toBe("components/Card.jsx");
});

test("returns immutable profile definitions", () => {
  const profile = getReactProfile();

  expect(Object.isFrozen(profile)).toBe(true);
  expect(Object.isFrozen(profile.runtime)).toBe(true);
  expect(Object.isFrozen(profile.paths)).toBe(true);
});

test("rejects unknown React profile ids", () => {
  expect(() => getReactProfile("unknown-profile")).toThrow(/profil/i);
});
