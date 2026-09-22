import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddFileDialog from "./AddFileDialog.jsx";

test("rejects duplicate files and allows correcting the name", async () => {
  const user = userEvent.setup();
  let created;
  render(
    <AddFileDialog
      project={{ entry: "index.html", files: { "index.html": "keep" } }}
      onCreate={(result) => {
        created = result;
      }}
      onClose={() => {}}
    />,
  );
  await user.type(screen.getByLabelText("Nazwa pliku"), "index.html");
  await user.click(screen.getByRole("button", { name: "Utwórz plik" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Plik już istnieje");
  expect(created).toBeUndefined();
  await user.clear(screen.getByLabelText("Nazwa pliku"));
  await user.type(screen.getByLabelText("Nazwa pliku"), "about");
  await user.click(screen.getByRole("button", { name: "Utwórz plik" }));
  expect(created.path).toBe("about.html");
  expect(created.project.files["index.html"]).toBe("keep");
});
