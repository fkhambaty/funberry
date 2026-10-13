import { expect, type Page } from "@playwright/test";
import type { TemplateGame } from "./template-catalog";

export async function openChildAndGame(page: Page, game: TemplateGame) {
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
}
