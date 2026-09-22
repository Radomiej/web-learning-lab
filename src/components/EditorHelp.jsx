import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./EditorHelp.css";

const GROUPS = [
  {
    title: "Pisanie kodu",
    icon: "edit",
    shortcuts: [
      [["Tab"], "Zwiększ wcięcie zaznaczenia"],
      [["Shift", "Tab"], "Zmniejsz wcięcie zaznaczenia"],
      [["Enter"], "Zacznij nową linię z tym samym wcięciem"],
      [["Ctrl", "Shift", "K"], "Usuń całą bieżącą linię"],
    ],
  },
  {
    title: "Formatowanie i historia",
    icon: "history",
    shortcuts: [
      [["Shift", "Alt", "F"], "Sformatuj aktywny plik"],
      [["Ctrl", "Z"], "Cofnij ostatnią zmianę"],
      [["Ctrl", "Shift", "Z"], "Ponów cofniętą zmianę"],
    ],
  },
  {
    title: "Nawigacja",
    icon: "navigate",
    shortcuts: [
      [["Esc", "potem", "Tab"], "Wyjdź z edytora do następnej kontrolki"],
      [["Esc"], "Zamknij tę pomoc"],
    ],
  },
];

function SectionIcon({ name }) {
  const paths = {
    edit: (
      <>
        <path d="M5 15.5 6 12l7.6-7.6 2 2L8 14l-3 .5Z" />
        <path d="m12.8 5.2 2 2" />
      </>
    ),
    history: (
      <>
        <path d="M5.2 7.2H2.8V4.8" />
        <path d="M3.2 7a7 7 0 1 1-.1 6" />
        <path d="M10 6v4l2.7 1.7" />
      </>
    ),
    navigate: (
      <>
        <rect x="3" y="4" width="14" height="12" rx="2" />
        <path d="m8 8-2 2 2 2M12 8l2 2-2 2" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      className="editor-help-section-icon"
      viewBox="0 0 20 20"
    >
      {paths[name]}
    </svg>
  );
}

function ShortcutKeys({ keys }) {
  return (
    <span className="editor-help-keymap">
      {keys.map((key, index) =>
        key === "potem" ? (
          <span className="editor-help-key-separator" key={`${key}-${index}`}>
            potem
          </span>
        ) : (
          <span className="editor-help-key-part" key={`${key}-${index}`}>
            {index > 0 && keys[index - 1] !== "potem" && (
              <span aria-hidden="true" className="editor-help-key-plus">
                +
              </span>
            )}
            <kbd>{key}</kbd>
          </span>
        ),
      )}
    </span>
  );
}

export default function EditorHelp() {
  const [open, setOpen] = useState(false);
  const controlRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const focusOpenedRef = useRef(false);
  const suppressFocusRef = useRef(false);
  const tooltipId = useId();
  const tooltipTitleId = useId();
  const [panelStyle, setPanelStyle] = useState({});

  useLayoutEffect(() => {
    if (!open) return undefined;
    function positionPanel() {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;
      const margin = 12;
      const gap = 8;
      const triggerRect = trigger.getBoundingClientRect();
      const width = Math.min(500, window.innerWidth - margin * 2);
      const maxHeight = Math.max(220, window.innerHeight - margin * 2);
      const panelHeight = Math.min(panel.scrollHeight || maxHeight, maxHeight);
      const roomBelow = window.innerHeight - triggerRect.bottom - gap - margin;
      const placeAbove =
        roomBelow < Math.min(panelHeight, 320) && triggerRect.top > roomBelow;
      const top = placeAbove
        ? Math.max(margin, triggerRect.top - gap - panelHeight)
        : Math.min(
            triggerRect.bottom + gap,
            window.innerHeight - margin - panelHeight,
          );
      const left = Math.min(
        Math.max(margin, triggerRect.right - width),
        window.innerWidth - margin - width,
      );
      setPanelStyle({ top, left, width, maxHeight });
    }
    positionPanel();
    window.addEventListener("resize", positionPanel);
    window.addEventListener("scroll", positionPanel, true);
    return () => {
      window.removeEventListener("resize", positionPanel);
      window.removeEventListener("scroll", positionPanel, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      focusOpenedRef.current = false;
      setOpen(false);
      suppressFocusRef.current = true;
      triggerRef.current?.focus();
      suppressFocusRef.current = false;
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function closeWhenFocusLeaves(event) {
    if (!controlRef.current?.contains(event.relatedTarget)) {
      focusOpenedRef.current = false;
      setOpen(false);
    }
  }

  function handleTriggerClick() {
    if (focusOpenedRef.current) {
      focusOpenedRef.current = false;
      setOpen(true);
      return;
    }
    setOpen((value) => !value);
  }

  return (
    <span
      ref={controlRef}
      className="editor-help-control"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        if (document.activeElement !== triggerRef.current) setOpen(false);
      }}
      onBlur={closeWhenFocusLeaves}
    >
      <button
        ref={triggerRef}
        className="button button--ghost editor-help-button"
        type="button"
        aria-label="Skróty edytora"
        aria-controls={tooltipId}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onFocus={() => {
          if (suppressFocusRef.current) return;
          focusOpenedRef.current = true;
          setOpen(true);
        }}
        onClick={handleTriggerClick}
      >
        <span aria-hidden="true">?</span>
      </button>
      {open &&
        createPortal(
          <span
            ref={panelRef}
            id={tooltipId}
            className="editor-help-tooltip"
            role="tooltip"
            aria-labelledby={tooltipTitleId}
            style={panelStyle}
          >
            <span className="editor-help-header">
              <strong id={tooltipTitleId}>Sterowanie edytorem</strong>
              <span>Skróty działają bezpośrednio w aktywnym pliku.</span>
            </span>
            <span className="editor-help-groups">
              {GROUPS.map((group) => (
                <span className="editor-help-group" key={group.title}>
                  <span className="editor-help-group-title">
                    <SectionIcon name={group.icon} />
                    <span role="heading" aria-level="4">
                      {group.title}
                    </span>
                  </span>
                  <span className="editor-help-shortcuts">
                    {group.shortcuts.map(([keys, description]) => (
                      <span
                        className="editor-help-shortcut"
                        key={`${group.title}-${description}`}
                      >
                        <ShortcutKeys keys={keys} />
                        <span>{description}</span>
                      </span>
                    ))}
                  </span>
                </span>
              ))}
            </span>
            <span className="editor-help-platform-note">
              Na macOS użyj <kbd>⌘</kbd> zamiast <kbd>Ctrl</kbd>.
            </span>
          </span>,
          document.body,
        )}
    </span>
  );
}
