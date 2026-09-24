export const REACT_PROFILE_IDS = Object.freeze({
  CRA_INF04: "react-cra-inf04",
  VITE: "react-vite",
});

function componentPath(directory, extension) {
  return (name) => `${directory}/${name}.${extension}`;
}

const PROFILE_DEFINITIONS = {
  [REACT_PROFILE_IDS.CRA_INF04]: {
    id: REACT_PROFILE_IDS.CRA_INF04,
    entry: "public/index.html",
    runtime: {
      kind: "react-cra",
      module: "src/index.js",
      root: "#root",
      bootstrap: true,
    },
    paths: {
      app: "src/App.js",
      indexCss: "src/index.css",
      appCss: "src/App.css",
      component: componentPath("src/components", "js"),
      hook: componentPath("src/hooks", "js"),
    },
  },
  [REACT_PROFILE_IDS.VITE]: {
    id: REACT_PROFILE_IDS.VITE,
    entry: "index.html",
    runtime: {
      kind: "react-vite",
      module: "main.jsx",
      root: "#root",
      bootstrap: false,
    },
    paths: {
      app: "App.jsx",
      indexCss: "styles.css",
      appCss: "styles.css",
      component: componentPath("components", "jsx"),
      hook: componentPath("hooks", "js"),
    },
  },
};

function freezeProfile(definition) {
  const paths = Object.freeze({ ...definition.paths });
  const runtime = Object.freeze({ ...definition.runtime });
  return Object.freeze({ ...definition, runtime, paths });
}

const PROFILES = Object.freeze(
  Object.fromEntries(
    Object.entries(PROFILE_DEFINITIONS).map(([id, definition]) => [
      id,
      freezeProfile(definition),
    ]),
  ),
);

export function getReactProfile(profileId = REACT_PROFILE_IDS.CRA_INF04) {
  const profile = PROFILES[profileId];
  if (!profile) throw new Error(`Nieznany profil React: ${profileId}.`);
  return profile;
}

export function getReactPathSet(profileId = REACT_PROFILE_IDS.CRA_INF04) {
  return getReactProfile(profileId).paths;
}
