import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditorHelp from "./EditorHelp.jsx";

test("opens from keyboard focus, Escape closes, and focus can leave the control", async () => {
  const user = userEvent.setup();
  render(
    <>
      <EditorHelp />
      <button type="button">Następny element</button>
    </>,
  );
  const trigger = screen.getByRole("button", { name: "Skróty edytora" });

  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  await user.tab();
  expect(trigger).toHaveFocus();
  expect(screen.getByRole("tooltip")).toHaveTextContent(
    "Zmniejsz wcięcie zaznaczenia",
  );
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  await user.tab();
  expect(
    screen.getByRole("button", { name: "Następny element" }),
  ).toHaveFocus();
});

test("opens on hover and closes when the pointer leaves", async () => {
  const user = userEvent.setup();
  render(<EditorHelp />);
  const trigger = screen.getByRole("button", { name: "Skróty edytora" });

  await user.hover(trigger);
  expect(screen.getByRole("tooltip")).toHaveTextContent(
    "Usuń całą bieżącą linię",
  );
  await user.unhover(trigger);
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

test("opens from a click", async () => {
  const user = userEvent.setup();
  render(<EditorHelp />);
  const trigger = screen.getByRole("button", { name: "Skróty edytora" });

  await user.click(trigger);
  expect(screen.getByRole("tooltip")).toHaveTextContent(
    "Sformatuj aktywny plik",
  );
});

test("presents shortcuts as grouped keycaps with plain-language explanations", async () => {
  const user = userEvent.setup();
  render(<EditorHelp />);

  await user.click(screen.getByRole("button", { name: "Skróty edytora" }));

  const tooltip = screen.getByRole("tooltip");
  expect(tooltip).toHaveAccessibleName("Sterowanie edytorem");
  expect(
    screen.getByRole("heading", { name: "Pisanie kodu" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Formatowanie i historia" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Nawigacja" }),
  ).toBeInTheDocument();
  expect(tooltip.querySelectorAll("kbd").length).toBeGreaterThanOrEqual(12);
  expect(tooltip).toHaveTextContent("Usuń całą bieżącą linię");
  expect(tooltip).toHaveTextContent("Na macOS użyj ⌘ zamiast Ctrl");
});

test("Escape after hover restores focus without reopening help", async () => {
  const user = userEvent.setup();
  render(<EditorHelp />);
  const trigger = screen.getByRole("button", { name: "Skróty edytora" });
  await user.hover(trigger);
  await user.keyboard("{Escape}");
  expect(trigger).toHaveFocus();
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

test("clicking an already-focused trigger closes the tooltip", async () => {
  const user = userEvent.setup();
  render(<EditorHelp />);
  const trigger = screen.getByRole("button", { name: "Skróty edytora" });

  await user.click(trigger);
  await user.click(trigger);
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

test("a touch click after focus does not immediately close the tooltip", () => {
  render(<EditorHelp />);
  const trigger = screen.getByRole("button", { name: "Skróty edytora" });

  act(() => {
    fireEvent.pointerDown(trigger, { pointerType: "touch" });
    trigger.focus();
    fireEvent.pointerUp(trigger, { pointerType: "touch" });
    fireEvent.click(trigger);
  });
  expect(screen.getByRole("tooltip")).toBeInTheDocument();
});
