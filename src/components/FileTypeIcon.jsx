const FILE_TYPE_META = Object.freeze({
  html: {
    label: "HTML",
    extension: ".html",
    description: "struktura dokumentu",
  },
  css: {
    label: "CSS",
    extension: ".css",
    description: "wygląd i układ",
  },
  js: {
    label: "JavaScript",
    extension: ".js",
    description: "logika strony",
  },
  react: {
    label: "React",
    extension: ".jsx",
    description: "komponent JSX",
  },
  generic: {
    label: "Plik",
    extension: "",
    description: "plik projektu",
  },
});

export function getFileTypeMeta(type, { reactProject = false } = {}) {
  if (type === "react" && reactProject) {
    return { ...FILE_TYPE_META.react, extension: ".js" };
  }
  return FILE_TYPE_META[type] || FILE_TYPE_META.generic;
}

export function getFileTypeFromPath(path = "", { reactProject = false } = {}) {
  const normalized = path.toLowerCase();
  if (normalized.endsWith(".html")) return "html";
  if (normalized.endsWith(".css")) return "css";
  if (normalized.endsWith(".jsx") || normalized.endsWith(".tsx")) return "react";
  if (
    normalized.endsWith(".js") ||
    normalized.endsWith(".mjs") ||
    normalized.endsWith(".cjs")
  ) return reactProject ? "react" : "js";
  return "generic";
}

function HtmlGlyph() {
  return (
    <>
      <path d="m11 8-5.5 8 5.5 8M21 8l5.5 8-5.5 8M18.5 6.5l-5 19" />
    </>
  );
}

function CssGlyph() {
  return (
    <>
      <path d="M12 6.5h-1.5C8.6 6.5 8 8 8 10v3c0 1.8-.6 3-3 3 2.4 0 3 1.2 3 3v3c0 2 .6 3.5 2.5 3.5H12" />
      <path d="M20 6.5h1.5c1.9 0 2.5 1.5 2.5 3.5v3c0 1.8.6 3 3 3-2.4 0-3 1.2-3 3v3c0 2-.6 3.5-2.5 3.5H20" />
    </>
  );
}

function JavaScriptGlyph() {
  return (
    <>
      <rect x="4" y="4" width="24" height="24" rx="5" fill="currentColor" opacity=".16" />
      <text x="16" y="21" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="800" letterSpacing="-.4">JS</text>
    </>
  );
}

function ReactGlyph() {
  return (
    <>
      <ellipse cx="16" cy="16" rx="11" ry="4.5" />
      <ellipse cx="16" cy="16" rx="11" ry="4.5" transform="rotate(60 16 16)" />
      <ellipse cx="16" cy="16" rx="11" ry="4.5" transform="rotate(120 16 16)" />
      <circle cx="16" cy="16" r="2.2" fill="currentColor" stroke="none" />
    </>
  );
}

function GenericGlyph() {
  return <path d="M9 4.5h9l5 5V27H9zM18 4.5V10h5" />;
}

export default function FileTypeIcon({
  type,
  labelled = false,
  className = "",
  reactProject = false,
}) {
  const normalizedType = FILE_TYPE_META[type] ? type : "generic";
  const meta = getFileTypeMeta(normalizedType, { reactProject });
  const classes = ["file-icon", `file-icon--${normalizedType}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={classes}
      role={labelled ? "img" : undefined}
      aria-label={labelled ? meta.label : undefined}
      aria-hidden={labelled ? undefined : true}
    >
      <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
        {normalizedType === "html" && <HtmlGlyph />}
        {normalizedType === "css" && <CssGlyph />}
        {normalizedType === "js" && <JavaScriptGlyph />}
        {normalizedType === "react" && <ReactGlyph />}
        {normalizedType === "generic" && <GenericGlyph />}
      </svg>
    </span>
  );
}

export { FILE_TYPE_META };
