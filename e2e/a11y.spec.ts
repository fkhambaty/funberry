import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openChildAndGame } from "./play-helpers";
import { TEMPLATE_GAMES } from "./template-catalog";

function violationLines(violations: { id: string; nodes: { html: string }[] }[]) {
  return violations.flatMap((violation) =>
    violation.nodes.slice(0, 2).map((node) => `${violation.id}: ${node.html.replace(/\s+/g, " ").slice(0, 160)}`),
  );
}

test.describe("game template accessibility", () => {
  test.describe.configure({ timeout: 180_000 });

  for (const game of TEMPLATE_GAMES) {
    test(`${game.type} has no axe violations`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openChildAndGame(page, game);
      const results = await new AxeBuilder({ page }).include(".fb-game-shell").analyze();
      const lines = violationLines(results.violations);
      expect(lines, lines.join("\n")).toEqual([]);
    });
  }
});
