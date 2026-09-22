import { useEffect, useId, useRef } from "react";

export default function EditorDialog({ title, onClose, children }) {
  const ref = useRef(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.querySelector("input,select,button")?.focus();
    return () => {
      if (previous?.isConnected) previous.focus();
      else document.querySelector(".code-editor")?.focus();
    };
  }, []);
  function handleKey(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeRef.current();
    }
    if (event.key !== "Tab") return;
    const controls = [
      ...ref.current.querySelectorAll(
        'input,select,button,textarea,[tabindex="0"]',
      ),
    ].filter((node) => !node.disabled);
    const first = controls[0],
      last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  return (
    <div className="editor-dialog-backdrop">
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="editor-dialog"
        onKeyDown={handleKey}
      >
        <h2 id={titleId}>{title}</h2>
        {children}
      </section>
    </div>
  );
}
