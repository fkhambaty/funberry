import assert from "node:assert/strict";
import test from "node:test";
import {
  PLAN_RULES,
  hasActivePremium,
  hmacSha256Hex,
  isDemoParent,
  isTerminalSubscriptionStatus,
  isWebsiteMismatchMessage,
  signaturesMatch,
  timingSafeEqualString,
} from "./payments.js";
import { normalizeCouponCode, validateCouponCode } from "./admin.js";
import { isOwnerEmail, roleForEmail } from "./owners.js";

test("checkout signature accepts the Razorpay payment and subscription message", async () => {
  const secret = "test-secret";
  const message = "pay_test|sub_test";
  const signature = await hmacSha256Hex(secret, message);
  assert.equal(await signaturesMatch(secret, message, signature), true);
  assert.equal(await signaturesMatch(secret, message, signature.toUpperCase()), true);
});

test("forged checkout signature is rejected", async () => {
  assert.equal(await signaturesMatch("test-secret", "pay_test|sub_test", "0".repeat(64)), false);
  assert.equal(await signaturesMatch("test-secret", "pay_test|sub_test", ""), false);
  assert.equal(await signaturesMatch("", "pay_test|sub_test", "abc"), false);
});

test("timing-safe compare rejects a different length", () => {
  assert.equal(timingSafeEqualString("abcd", "abc"), false);
  assert.equal(timingSafeEqualString("abcd", "abcd"), true);
});

test("plan lengths match the billing year", () => {
  assert.equal(PLAN_RULES.weekly.totalCount, 52);
  assert.equal(PLAN_RULES.monthly.totalCount, 12);
  assert.equal(PLAN_RULES.weekly.tier, "premium_weekly");
  assert.equal(PLAN_RULES.monthly.tier, "premium_monthly");
});

test("active premium and demo account rules", () => {
  assert.equal(hasActivePremium({ subscription_tier: "free" }), false);
  assert.equal(hasActivePremium({ subscription_tier: "lifetime" }), true);
  assert.equal(
    hasActivePremium({ subscription_tier: "premium_weekly", subscription_expires_at: new Date(Date.now() + 60000).toISOString() }),
    true,
  );
  assert.equal(
    hasActivePremium({ subscription_tier: "premium_weekly", subscription_expires_at: new Date(Date.now() - 60000).toISOString() }),
    false,
  );
  assert.equal(isDemoParent({ username: "dummy" }), true);
  assert.equal(isDemoParent({ username: "Dummy" }), true);
  assert.equal(isDemoParent({ username: "parent" }), false);
});

test("terminal subscription statuses and website mismatch text", () => {
  assert.equal(isTerminalSubscriptionStatus("cancelled"), true);
  assert.equal(isTerminalSubscriptionStatus("active"), false);
  assert.equal(isWebsiteMismatchMessage({ error: { description: "Website domain mismatch" } }), true);
  assert.equal(isWebsiteMismatchMessage({ error: { description: "Payment failed" } }), false);
});

test("coupon codes and owner promotion", () => {
  assert.equal(validateCouponCode(" welcome1week "), "WELCOME1WEEK");
  assert.equal(validateCouponCode("ab"), "");
  assert.equal(validateCouponCode("bad code"), "");
  assert.equal(normalizeCouponCode("ab"), "AB");
  assert.equal(isOwnerEmail("FakhruddinKhambaty@gmail.com"), true);
  assert.equal(isOwnerEmail("fktiindia@gmail.com"), true);
  assert.equal(isOwnerEmail("other@example.com"), false);
  assert.equal(roleForEmail("fktiindia@gmail.com"), "admin");
  assert.equal(roleForEmail("other@example.com"), "parent");
});
