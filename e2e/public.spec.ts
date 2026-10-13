import { expect, test } from "@playwright/test";
import { assertNoHorizontalOverflow, assertProblems, watchConsole } from "./helpers";
import { VIEWPORTS } from "./viewports";

const PUBLIC_ROUTES = [
  "/",
  "/pricing",
  "/privacy",
  "/terms",
  "/login",
  "/signup",
  "/forgot-password",
  "/auth/confirm-email",
  "/this-page-is-not-a-world",
];

const PROTECTED_ROUTES = ["/dashboard", "/dashboard/progress", "/dashboard/packs", "/play"];

async function assertVisibleTapTargets(page: import("@playwright/test").Page) {
  const offenders = await page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll("button, a.fb-cta, a.fb-cta-ghost, a.fb-float-home, .fb-auth a, .fb-picker-card"),
    );
    return nodes.flatMap((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      if (style.visibility === "hidden" || style.display === "none") return [];
      if (rect.width < 1 || rect.height < 1) return [];
      if (rect.width >= 48 && rect.height >= 48) return [];
      const label = (node.getAttribute("aria-label") || node.textContent || node.tagName).replace(/\s+/g, " ").trim().slice(0, 48);
      return [`${label} ${Math.round(rect.width)}x${Math.round(rect.height)}`];
    });
  });
  expect(offenders, "controls below 48px").toEqual([]);
}

for (const viewport of VIEWPORTS) {
  test(`public and protected routes at ${viewport.name}`, async ({ page }) => {
    const problems = watchConsole(page);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const path of PUBLIC_ROUTES) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(300);
      await assertNoHorizontalOverflow(page);
      await assertVisibleTapTargets(page);
    }

    for (const path of PROTECTED_ROUTES) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForURL(/\/login/, { timeout: 20_000 });
      await assertNoHorizontalOverflow(page);
    }

    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Admin access" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Create a coupon/i })).toHaveCount(0);
    await assertNoHorizontalOverflow(page);
    await assertProblems(problems);
  });
}
