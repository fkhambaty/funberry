import { expect, test, type Locator, type Page } from "@playwright/test";
import { assertNoHorizontalOverflow, assertProblems, watchConsole } from "./helpers";
import { TEMPLATE_GAMES, type TemplateGame } from "./template-catalog";
import { TOUCH_VIEWPORTS, VIEWPORTS } from "./viewports";

async function openChildAndGame(page: Page, game: TemplateGame) {
  await page.goto("/play", { waitUntil: "domcontentloaded" });
  const worlds = page.getByRole("heading", { name: /Play Games/i });
  const picker = page.getByRole("button", { name: /Play as Test Kid/i });
  await expect(worlds.or(picker)).toBeVisible();
  if (await picker.isVisible()) await picker.click({ force: true });
  await page.locator(`[data-zone-id="${game.zoneId}"]`).click({ force: true });
  const card = page.locator(`[data-game-id="${game.gameId}"]`);
  await card.scrollIntoViewIfNeeded();
  await card.click({ force: true });
  await expect(page.locator(".fb-game-shell")).toBeVisible();
  await expect(page.getByRole("button", { name: "Home" })).toBeVisible();
}

async function assertShellFits(page: Page) {
  const shell = await page.evaluate(() => {
    const node = document.querySelector(".fb-game-shell");
    if (!node) return null;
    const style = getComputedStyle(node);
    const box = node.getBoundingClientRect();
    return {
      overflowY: style.overflowY,
      height: box.height,
      inner: window.innerHeight,
    };
  });
  expect(shell).not.toBeNull();
  expect(shell?.overflowY).toBe("auto");
  expect(Math.abs((shell?.height ?? 0) - (shell?.inner ?? 0))).toBeLessThanOrEqual(2);
  await assertNoHorizontalOverflow(page);

  const home = await page.getByRole("button", { name: "Home" }).boundingBox();
  const mute = await page.getByRole("button", { name: /mute sounds/i }).boundingBox();
  expect(home && home.width).toBeGreaterThanOrEqual(48);
  expect(home && home.height).toBeGreaterThanOrEqual(64);
  expect(mute && mute.width).toBeGreaterThanOrEqual(48);
  expect(mute && mute.height).toBeGreaterThanOrEqual(48);
}

async function touch(locator: Locator) {
  await locator.evaluate((el) => {
    const shell = el.closest(".fb-game-shell");
    if (!shell) {
      el.scrollIntoView({ block: "center", inline: "center" });
      return;
    }
    const shellRect = shell.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    shell.scrollTop += rect.top - shellRect.top - shellRect.height / 2 + rect.height / 2;
  });
  const box = await locator.boundingBox();
  if (!box || box.width < 1 || box.height < 1) {
    throw new Error("touch target has no box");
  }
  const centerX = box.x + box.width / 2;
  const centerY = box.y + Math.min(box.height / 2, box.height - 4);
  await locator.page().touchscreen.tap(centerX, centerY);
}

async function beginPlay(shell: Locator) {
  const launch = shell.getByRole("button", { name: /start|let.?s|pop it/i });
  if (await launch.count()) {
    await touch(launch.first());
    await expect(launch).toHaveCount(0);
  }
  await shell.evaluate((el) => {
    el.scrollTop = 0;
  });
}

async function touchTemplate(page: Page, game: TemplateGame) {
  const shell = page.locator(".fb-game-shell");
  await beginPlay(shell);

  if (game.type === "star_catcher") {
    const left = shell.getByRole("button", { name: "Move left" });
    await expect(left).toBeVisible();
    const box = await left.boundingBox();
    expect(box && box.width).toBeGreaterThanOrEqual(64);
    expect(box && box.height).toBeGreaterThanOrEqual(64);
    await touch(left);
    return;
  }

  if (game.type === "pixi_lab") {
    const canvas = shell.locator("canvas");
    await expect(canvas).toBeVisible({ timeout: 20_000 });
    const box = await canvas.boundingBox();
    expect(box && box.width).toBeGreaterThan(48);
    expect(box && box.height).toBeGreaterThan(48);
    await touch(canvas);
    return;
  }

  if (game.type === "spot_difference") {
    const panel = shell.getByRole("button", { name: /picture b/i });
    await expect(panel).toBeVisible();
    await touch(panel);
    return;
  }

  if (game.type === "bubble_pop") {
    const arena = shell.locator(".fb-arena-tall");
    await expect(arena).toBeVisible();
    await expect.poll(async () => {
      const arenaBox = await arena.boundingBox();
      if (!arenaBox) return false;
      const buttons = arena.locator("button");
      const count = await buttons.count();
      for (let i = 0; i < count; i += 1) {
        const box = await buttons.nth(i).boundingBox();
        if (!box || box.width < 48 || box.height < 48) continue;
        const centerY = box.y + Math.min(box.height / 2, box.height - 8);
        const centerX = box.x + box.width / 2;
        const inside =
          centerY >= arenaBox.y + 4 &&
          centerY <= arenaBox.y + arenaBox.height - 4 &&
          centerX >= arenaBox.x + 4 &&
          centerX <= arenaBox.x + arenaBox.width - 4 &&
          centerY >= 0 &&
          centerY <= page.viewportSize()!.height;
        if (!inside) continue;
        await page.touchscreen.tap(centerX, centerY);
        return true;
      }
      return false;
    }).toBe(true);
    return;
  }

  const actions = shell.locator(".fb-play-canvas").getByRole("button");
  await expect(actions.first()).toBeVisible();
  if (game.type === "drag_sort") {
    await touch(actions.first());
    const bucket = shell.getByRole("button", { name: /Tap here!/i }).first();
    await expect(bucket).toBeVisible();
    await expect.poll(async () => (await bucket.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48);
    await touch(bucket);
    return;
  }
  await expect.poll(async () => (await actions.first().boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48);
  await expect.poll(async () => (await actions.first().boundingBox())?.width ?? 0).toBeGreaterThanOrEqual(48);
  await touch(actions.first());
}

test.describe("dummy parent", () => {
  test.describe.configure({ timeout: 180_000 });

  for (const viewport of VIEWPORTS) {
    test(`dashboard, coupon, and checkout stop at ${viewport.name}`, async ({ page }) => {
      const problems = watchConsole(page);
      const razorpay: string[] = [];
      page.on("request", (request) => {
        const url = request.url();
        if (/razorpay\.com|\/v1\/payments\/razorpay/i.test(url)) razorpay.push(url);
      });
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: "Parent Zone" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Have a coupon?" })).toBeVisible();
      await expect(page.getByLabel("Coupon code")).toBeVisible();
      await expect(page.getByRole("region", { name: "Demo checkout" })).toBeVisible();
      await expect(page.getByText("lifetime access")).toBeVisible();

      await page.getByRole("button", { name: "Weekly plan" }).click();
      await expect(page.getByText("Demo account: no charge")).toBeVisible();
      await expect(page.locator('iframe[src*="razorpay"], script[src*="checkout.razorpay.com"]')).toHaveCount(0);
      expect(razorpay).toEqual([]);
      await assertNoHorizontalOverflow(page);

      await page.evaluate(() => window.sessionStorage.setItem("funberry_pending_sub", "sub_dummy_return"));
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: "Parent Zone" })).toBeVisible();
      expect(razorpay).toEqual([]);
      await assertProblems(problems);
    });

    test(`parent PIN at ${viewport.name}`, async ({ page }) => {
      const problems = watchConsole(page);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/play", { waitUntil: "domcontentloaded" });
      await page.getByRole("button", { name: "🔒 For Parents" }).click();
      await expect(page.getByRole("heading", { name: "Enter Parent PIN" })).toBeVisible();
      await page.waitForFunction(() => {
        const digit = document.querySelector("[data-pin-idx='0']");
        if (!digit) return false;
        const box = digit.getBoundingClientRect();
        return box.width >= 48 && box.height >= 48;
      });
      for (const digit of ["1", "2", "3", "4"]) {
        const index = Number(digit) - 1;
        const box = await page.locator(`[data-pin-idx="${index}"]`).boundingBox();
        expect(box && box.width).toBeGreaterThanOrEqual(48);
        expect(box && box.height).toBeGreaterThanOrEqual(48);
        await page.locator(`[data-pin-idx="${index}"]`).fill(digit);
      }
      await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
      await expect(page.getByRole("heading", { name: "Parent Zone" })).toBeVisible();
      await assertProblems(problems);
    });
  }

  for (const viewport of VIEWPORTS) {
    test(`game templates at ${viewport.name}`, async ({ page }) => {
      test.setTimeout(600_000);
      const problems = watchConsole(page);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const touch = TOUCH_VIEWPORTS.has(viewport.name);

      for (const game of TEMPLATE_GAMES) {
        await test.step(`${game.type} ${game.title}`, async () => {
          await openChildAndGame(page, game);
          await assertShellFits(page);
          if (touch) await touchTemplate(page, game);
          await page.getByRole("button", { name: "Home" }).click({ force: true });
          await expect(page.locator(`[data-zone-id="${game.zoneId}"]`)).toBeVisible();
        });
      }
      await assertProblems(problems);
    });
  }

  test("kid picker selects Test Kid", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/play", { waitUntil: "domcontentloaded" });
    const switchPlayer = page.getByRole("button", { name: "Switch Player" });
    const kid = page.getByRole("button", { name: /Play as Test Kid/i });
    await expect(switchPlayer.or(kid)).toBeVisible();
    if (await switchPlayer.isVisible()) await switchPlayer.click({ force: true });
    await kid.click({ force: true });
    await expect(page.locator('[data-zone-id="about-me"]')).toBeVisible();
  });

  test("dummy cannot open admin coupons", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("not on the admin allowlist")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Create a coupon/i })).toHaveCount(0);
    await assertNoHorizontalOverflow(page);
  });
});
