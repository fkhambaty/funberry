import { expect, type Page } from "@playwright/test";

export async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const shell = document.querySelector(".fb-game-shell");
    const shellOverflow = shell ? shell.scrollWidth - shell.clientWidth : 0;
    return {
      document: doc.scrollWidth - doc.clientWidth,
      shell: shellOverflow,
    };
  });
  expect(overflow.document, "page is wider than the viewport").toBeLessThanOrEqual(2);
  expect(overflow.shell, "game shell is wider than its frame").toBeLessThanOrEqual(2);
}

export function watchConsole(page: Page) {
  const problems: string[] = [];
  page.on("pageerror", (error) => {
    problems.push(error.message);
  });
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (/favicon|Failed to load resource/i.test(text)) return;
    problems.push(text);
  });
  return problems;
}

export async function assertProblems(problems: string[]) {
  expect(problems, problems.join("\n")).toEqual([]);
}
