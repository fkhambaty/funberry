import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { openChildAndGame } from "./play-helpers";
import { TEMPLATE_GAMES } from "./template-catalog";

type Violation = { id: string; nodes: { html: string; failureSummary?: string }[] };

function violationLines(violations: Violation[]) {
  return violations.flatMap((violation) =>
    violation.nodes.slice(0, 2).map((node) => {
      const html = node.html.replace(/\s+/g, " ").slice(0, 160);
      const why = (node.failureSummary || "").replace(/\s+/g, " ").slice(0, 240);
      return `${violation.id}: ${html} — ${why}`;
    }),
  );
}

/** Entrance animations fade content in; contrast is only meaningful once they finish. */
async function waitForSettledShell(page: Page) {
  await page.waitForFunction(
    () => {
      const shell = document.querySelector(".fb-game-shell");
      if (!shell) return false;
      const faded = [...shell.querySelectorAll("button, h1, h2, h3")].some((el) => {
        for (let node: Element | null = el; node && node !== document.body; node = node.parentElement) {
          if (parseFloat(getComputedStyle(node).opacity) < 1) return true;
        }
        return false;
      });
      return !faded;
    },
    undefined,
    { timeout: 10_000 },
  );
}

test.describe("game template accessibility", () => {
  test.describe.configure({ timeout: 180_000 });

  for (const game of TEMPLATE_GAMES) {
    test(`${game.type} has no axe violations`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openChildAndGame(page, game);
      await waitForSettledShell(page);
      const results = await new AxeBuilder({ page }).include(".fb-game-shell").analyze();
      const lines = violationLines(results.violations);
      expect(lines, lines.join("\n")).toEqual([]);
    });
  }
});
