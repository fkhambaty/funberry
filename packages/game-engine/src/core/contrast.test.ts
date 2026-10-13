import assert from "node:assert/strict";
import test from "node:test";
import { contrastWithWhite, onWhiteText } from "./contrast";

test("light accents are darkened until white text reads at 4.5:1", () => {
  for (const accent of ["#379df9", "#18b05a", "#fbbf24", "#8b5cf6", "#fff"]) {
    const fill = onWhiteText(accent);
    assert.ok(contrastWithWhite(fill) >= 4.5, `${accent} -> ${fill}`);
  }
});

test("dark accents and non-hex values are left alone", () => {
  assert.equal(onWhiteText("#1c498c"), "#1c498c");
  assert.equal(onWhiteText("rebeccapurple"), "rebeccapurple");
});
