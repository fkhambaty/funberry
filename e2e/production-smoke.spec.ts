import { expect, test } from "@playwright/test";
import { assertNoHorizontalOverflow } from "./helpers";

const API = process.env.FUNBERRY_API || "https://funberry-api.fkhambaty.workers.dev";

test("homepage and pricing stay inside the screen", async ({ page }) => {
  for (const size of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(size);
    const home = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(home?.status()).toBe(200);
    await assertNoHorizontalOverflow(page);
    const pricing = await page.goto("/pricing", { waitUntil: "domcontentloaded" });
    expect(pricing?.status()).toBe(200);
    await expect(page.getByText("FKTech provides FunBerry Kids Premium")).toBeVisible();
    await assertNoHorizontalOverflow(page);
  }
});

test("Razorpay review policy pages are public", async ({ request }) => {
  for (const path of [
    "/pricing",
    "/privacy",
    "/terms",
    "/cancellation",
    "/refunds",
    "/shipping",
    "/contact",
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
});

test("health, dummy login, and checkout without a charge", async ({ request }) => {
  const health = await request.get(`${API}/v1/health`);
  expect(health.status()).toBe(200);
  const healthBody = await health.json();
  expect(healthBody.ok).toBe(true);
  expect(healthBody.service).toBe("funberry-api");
  expect(healthBody.email_ready).toBe(true);
  expect(healthBody.email_domain_verified).toBe(true);
  expect(healthBody.payments_configured).toBe(true);
  expect(healthBody.checkout_mode).toBe("modal-with-hosted-fallback");

  const login = await request.post(`${API}/v1/login`, {
    data: { email: "dummy", password: "dummy" },
  });
  expect(login.ok()).toBeTruthy();
  const session = await login.json();
  const token = session?.session?.access_token;
  expect(typeof token).toBe("string");

  const payment = await request.post(`${API}/v1/payments/razorpay/subscription`, {
    headers: { authorization: `Bearer ${token}` },
    data: { plan: "weekly" },
  });
  expect(payment.status()).toBe(403);
  const paymentBody = await payment.json();
  expect(paymentBody.error).toBe("Demo account: no charge");
});
