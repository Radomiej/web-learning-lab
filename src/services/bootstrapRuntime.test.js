import {
  BOOTSTRAP_CSS_RESOURCE,
  BOOTSTRAP_CSS_SPECIFIER,
  getBootstrapCss,
} from "./bootstrapRuntime.js";

test("exposes the offline Bootstrap CSS resource used by CRA imports", () => {
  const css = getBootstrapCss();

  expect(BOOTSTRAP_CSS_SPECIFIER).toBe("bootstrap/dist/css/bootstrap.min.css");
  expect(BOOTSTRAP_CSS_RESOURCE).toBe("@bootstrap-css");
  expect(css).toContain(".container");
  expect(css).toContain(".row");
  expect(css).toContain(".col-md-6");
  expect(css).toContain(".mt-3");
  expect(css).toContain(".p-3");
  expect(css).toContain(".text-center");
  expect(css).toContain(".btn-primary");
});
