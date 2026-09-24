import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddFileDialog from "./AddFileDialog.jsx";
import { getFileTypeFromPath, getFileTypeMeta } from "./FileTypeIcon.jsx";

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

test("shows the selected language icon and updates it for each file type", async () => {
  const user = userEvent.setup();
  render(
    <AddFileDialog
      project={{ entry: "index.html", files: { "index.html": "keep" } }}
      onCreate={() => {}}
      onClose={() => {}}
    />,
  );

  expect(screen.getByRole("img", { name: "HTML" })).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText("Typ pliku"), "css");
  expect(screen.getByRole("img", { name: "CSS" })).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText("Typ pliku"), "js");
  expect(screen.getByRole("img", { name: "JavaScript" })).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText("Typ pliku"), "react");
  expect(screen.getByRole("img", { name: "React" })).toBeInTheDocument();
});

test("uses CRA .js metadata and creates a component under src", async () => {
  const user = userEvent.setup();
  let created;
  const project = {
    entry: "public/index.html",
    runtime: {
      kind: "react-cra",
      module: "src/index.js",
      root: "#root",
      bootstrap: true,
    },
    files: { "public/index.html": "<div id=\"root\"></div>" },
  };
  render(
    <AddFileDialog
      project={project}
      onCreate={(result) => {
        created = result;
      }}
      onClose={() => {}}
    />,
  );

  await user.selectOptions(screen.getByLabelText("Typ pliku"), "react");
  expect(screen.getByRole("option", { name: "React (.js)" })).toBeInTheDocument();
  expect(screen.getByText(/src\/components\/Card\.js/)).toBeInTheDocument();
  expect(screen.getByText(/App\.js/)).toBeInTheDocument();
  await user.type(screen.getByLabelText("Nazwa pliku"), "components/Card");
  await user.click(screen.getByRole("button", { name: "Utwórz plik" }));

  expect(created.path).toBe("src/components/Card.js");
});

test("keeps Vite React metadata and JavaScript icon detection distinct", () => {
  expect(getFileTypeMeta("react").extension).toBe(".jsx");
  expect(getFileTypeMeta("react", { reactProject: true }).extension).toBe(".js");
  expect(getFileTypeFromPath("src/index.js")).toBe("js");
  expect(getFileTypeFromPath("src/index.js", { reactProject: true })).toBe("react");
  expect(getFileTypeFromPath("src/App.jsx", { reactProject: true })).toBe("react");
});
