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

const EMBED_GAME = "plants-bubble-pop";

test("app embed route stays inert outside the app and is not indexed", async ({ page }) => {
  const problems = watchConsole(page);
  await page.goto(`/embed/game/${EMBED_GAME}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByText("This page opens inside the FunBerry Kids app.")).toBeVisible();
  await expect(page.locator(".fb-game-shell")).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await assertVisibleTapTargets(page);
  await assertProblems(problems);
});

test("app embed route runs a game only after the Worker accepts the ticket", async ({ page }) => {
  const problems = watchConsole(page);
  const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };
  let accept = false;
  await page.route("**/v1/play-tickets/check", (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    return accept
      ? route.fulfill({ status: 200, headers: cors, json: { ok: true, game_id: EMBED_GAME } })
      : route.fulfill({ status: 401, headers: cors, json: { error: "expired", code: "ticket_invalid" } });
  });
  await page.addInitScript(() => {
    const sent: string[] = [];
    Object.assign(window, { __fbSent: sent, ReactNativeWebView: { postMessage: (m: string) => sent.push(m) } });
  });
  const init = JSON.stringify({ v: 1, source: "funberry-native", type: "init", gameId: EMBED_GAME, ticket: "b".repeat(64) });
  const sentTypes = () =>
    page.evaluate(() => ((window as unknown as { __fbSent: string[] }).__fbSent).map((m) => JSON.parse(m).type));

  await page.goto(`/embed/game/${EMBED_GAME}`, { waitUntil: "domcontentloaded" });
  await expect.poll(sentTypes).toContain("ready");
  await page.evaluate((data) => window.dispatchEvent(new MessageEvent("message", { data })), init);
  await expect(page.getByText("This game needs to be opened again from the app.")).toBeVisible();
  await expect(page.locator(".fb-game-shell")).toHaveCount(0);

  accept = true;
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect.poll(sentTypes).toContain("ready");
  await page.evaluate((data) => window.dispatchEvent(new MessageEvent("message", { data })), init);
  await expect.poll(sentTypes).toContain("loaded");
  await expect(page.locator(".fb-game-shell")).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await assertProblems(problems.filter((p) => !/401/.test(p)));
});
