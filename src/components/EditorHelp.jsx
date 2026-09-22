import { useEffect, useId, useRef, useState } from "react";
import "./EditorHelp.css";

const SHORTCUTS =
  "Tab / Shift+Tab: wcięcia · Enter: zachowaj wcięcie · Ctrl+Shift+K: usuń linię · Shift+Alt+F: formatuj · Ctrl+Z: cofnij · Ctrl+Shift+Z: ponów. Na Macu użyj ⌘ zamiast Ctrl. Escape, potem Tab: wyjdź z edytora.";

export default function EditorHelp() {
  const [open, setOpen] = useState(false);
  const controlRef = useRef(null);
  const triggerRef = useRef(null);
  const focusOpenedRef = useRef(false);
  const suppressFocusRef = useRef(false);
  const tooltipId = useId();

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
      {open && (
        <span id={tooltipId} className="editor-help-tooltip" role="tooltip">
          {SHORTCUTS}
        </span>
      )}
    </span>
  );
}
