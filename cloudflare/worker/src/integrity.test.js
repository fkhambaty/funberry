import assert from "node:assert/strict";
import test from "node:test";
import worker from "./index.js";
import { createMemoryD1 } from "./memoryDb.js";
import { sha256 } from "./crypto.js";
import { starsToCredit, reconciledStarTotal } from "./progress.js";
import { summarizeWeek, weekWindow } from "./analytics.js";
import { DELETE_PHRASE, publicAccountRow } from "./accountData.js";

test("star credit is only the improvement over the previous best", () => {
  assert.equal(starsToCredit(0, 2), 2);
  assert.equal(starsToCredit(2, 2), 0);
  assert.equal(starsToCredit(2, 3), 1);
  assert.equal(starsToCredit(3, 1), 0);
  assert.equal(starsToCredit(1, 9), 2);
  assert.equal(reconciledStarTotal([{ stars_earned: 3 }, { stars_earned: 1 }]), 4);
});

test("weekly summary counts credited stars and names its dates", () => {
  const window = weekWindow(new Date("2026-10-13T12:00:00.000Z"));
  assert.equal(window.period_start, "2026-10-07");
  assert.equal(window.period_end, "2026-10-13");
  const summary = summarizeWeek(
    [
      { game_id: "a", stars_credited: 2 },
      { game_id: "a", stars_credited: 0 },
      { game_id: "b", stars_credited: 1 },
    ],
    window,
  );
  assert.equal(summary.rounds, 3);
  assert.equal(summary.distinct_games, 2);
  assert.equal(summary.stars_credited, 3);
});

test("account export shape drops PIN and password fields", () => {
  const row = publicAccountRow({
    id: "p",
    email: "ada@example.com",
    pin: "1234",
    pin_hash: "secret",
    pin_salt: "salt",
    password_hash: "hash",
    password_salt: "salt",
    pin_attempts: 2,
  });
  assert.equal(row.pin_set, true);
  assert.equal("pin" in row, false);
  assert.equal("pin_hash" in row, false);
  assert.equal("password_hash" in row, false);
});

async function seedFamily() {
  const db = createMemoryD1();
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO parents
       (id, email, password_hash, password_salt, name, username, pin, email_verified_at)
       VALUES ('parent-1', 'ada@example.com', 'x', 'y', 'Ada', 'ada', '1234', ?)`,
    )
    .bind(now)
    .run();
  await db
    .prepare("INSERT INTO children (id, parent_id, name, age, total_stars) VALUES ('child-1', 'parent-1', 'Sam', 6, 99)")
    .run();
  const token = "session-token";
  await db
    .prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, 'parent-1', ?)")
    .bind(await sha256(token), new Date(Date.now() + 86400000).toISOString())
    .run();
  return { db, token };
}

function call(db, token, path, method, body) {
  return worker.fetch(
    new Request(`https://funberry-api.example${path}`, {
      method,
      headers: {
        authorization: token ? `Bearer ${token}` : "",
        origin: "http://localhost:3000",
        "content-type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    { DB: db },
  );
}

test("D1 daily quota exhaustion returns a clear retryable response", async () => {
  const db = {
    prepare() {
      throw new Error("D1_ERROR: Your account has exceeded D1's free tier daily row write limit.");
    },
  };
  const response = await worker.fetch(
    new Request("https://funberry-api.example/v1/signup", {
      method: "POST",
      headers: { origin: "http://localhost:3000", "content-type": "application/json" },
      body: JSON.stringify({ email: "quota@example.com", password: "password12", name: "Quota Test" }),
    }),
    { DB: db, RESEND_API_KEY: "test-key", MAIL_FROM: "FunBerry Kids <no-reply@funberrykids.in>" },
  );
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.match(body.error, /storage allowance/i);
  assert.match(body.error, /Nothing was charged/i);
});

test("repeat plays credit only the improvement and reconcile an inflated total", async () => {
  const { db, token } = await seedFamily();
  const first = await call(db, token, "/v1/progress", "POST", {
    child_id: "child-1",
    game_id: "plants-match",
    stars_earned: 2,
    score: 8,
    time_spent_seconds: 30,
  });
  const firstBody = await first.json();
  assert.equal(first.status, 200);
  assert.equal(firstBody.stars_credited, 2);
  assert.equal(firstBody.total_stars, 2);
  assert.equal(firstBody.progress.stars_earned, 2);

  const repeat = await call(db, token, "/v1/progress", "POST", {
    child_id: "child-1",
    game_id: "plants-match",
    stars_earned: 2,
    score: 8,
    time_spent_seconds: 20,
  });
  const repeatBody = await repeat.json();
  assert.equal(repeatBody.stars_credited, 0);
  assert.equal(repeatBody.total_stars, 2);

  const better = await call(db, token, "/v1/progress", "POST", {
    child_id: "child-1",
    game_id: "plants-match",
    stars_earned: 3,
    score: 10,
    time_spent_seconds: 25,
  });
  const betterBody = await better.json();
  assert.equal(betterBody.stars_credited, 1);
  assert.equal(betterBody.total_stars, 3);

  const worse = await call(db, token, "/v1/progress", "POST", {
    child_id: "child-1",
    game_id: "plants-match",
    stars_earned: 1,
    score: 3,
    time_spent_seconds: 10,
  });
  const worseBody = await worse.json();
  assert.equal(worseBody.stars_credited, 0);
  assert.equal(worseBody.progress.stars_earned, 3);
  assert.equal(worseBody.total_stars, 3);

  const listed = await call(db, token, "/v1/children", "GET");
  const children = await listed.json();
  assert.equal(children.children[0].total_stars, 3);

  const summary = await call(db, token, "/v1/weekly-summary?child_id=child-1", "GET");
  const week = await summary.json();
  assert.equal(week.stars_credited, 3);
  assert.equal(week.rounds, 4);
  assert.equal(week.continue_game_id, "plants-match");
  assert.equal(week.streak, null);
  assert.ok(week.period_start);
  assert.ok(week.period_end);
});

test("progress rejects invented and locked game identifiers", async () => {
  const { db, token } = await seedFamily();
  await db.prepare("UPDATE children SET total_stars = 0 WHERE id = 'child-1'").run();

  const invented = await call(db, token, "/v1/progress", "POST", {
    child_id: "child-1",
    game_id: "invented-three-stars",
    score: 100,
    stars_earned: 3,
    completed: true,
  });
  assert.equal(invented.status, 400);

  const locked = await call(db, token, "/v1/progress", "POST", {
    child_id: "child-1",
    game_id: "transport-medium-sort",
    score: 100,
    stars_earned: 3,
    completed: true,
  });
  assert.equal(locked.status, 403);
});

test("rank does not disclose another family's child", async () => {
  const { db, token } = await seedFamily();
  await db
    .prepare("INSERT INTO parents (id, email, username, password_hash, password_salt) VALUES ('parent-2', 'other@example.com', 'other', 'hash', 'salt')")
    .run();
  await db
    .prepare("INSERT INTO children (id, parent_id, name, age, total_stars) VALUES ('child-2', 'parent-2', 'Other Child', 7, 50)")
    .run();
  const response = await call(db, token, "/v1/rank?child_id=child-2", "GET");
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.rank, null);
});

test("password changes revoke sessions and parents can remove a child", async () => {
  const passwordFamily = await seedFamily();
  const changed = await call(passwordFamily.db, passwordFamily.token, "/v1/password", "POST", {
    password: "new-password",
  });
  assert.equal(changed.status, 200);
  const sessions = await passwordFamily.db
    .prepare("SELECT COUNT(*) AS n FROM sessions WHERE user_id = 'parent-1'")
    .first();
  assert.equal(Number(sessions.n), 0);

  const deleteFamily = await seedFamily();
  const removed = await call(deleteFamily.db, deleteFamily.token, "/v1/children/child-1", "DELETE");
  assert.equal(removed.status, 200);
  const children = await deleteFamily.db
    .prepare("SELECT COUNT(*) AS n FROM children WHERE id = 'child-1'")
    .first();
  assert.equal(Number(children.n), 0);
});

test("parent APIs never return the PIN and verify it on the server", async () => {
  const { db, token } = await seedFamily();
  const parent = await call(db, token, "/v1/parent", "GET");
  const parentBody = await parent.json();
  assert.equal(parent.status, 200);
  assert.equal(parentBody.parent.pin_set, true);
  assert.equal("pin" in parentBody.parent, false);
  assert.equal(JSON.stringify(parentBody).includes("1234"), false);

  const wrong = await call(db, token, "/v1/pin/verify", "POST", { pin: "0000" });
  assert.equal(wrong.status, 403);
  const right = await call(db, token, "/v1/pin/verify", "POST", { pin: "1234" });
  assert.equal(right.status, 200);

  const changed = await call(db, token, "/v1/parent", "PUT", { pin: "5678", current_pin: "1234" });
  assert.equal(changed.status, 200);
  const changedBody = await changed.json();
  assert.equal(changedBody.parent.pin_set, true);
  assert.equal("pin" in changedBody.parent, false);
  const oldPin = await call(db, token, "/v1/pin/verify", "POST", { pin: "1234" });
  assert.equal(oldPin.status, 403);
  const newPin = await call(db, token, "/v1/pin/verify", "POST", { pin: "5678" });
  assert.equal(newPin.status, 200);
});

test("PIN guesses lock after five failures", async () => {
  const { db, token } = await seedFamily();
  for (let i = 0; i < 4; i += 1) {
    const response = await call(db, token, "/v1/pin/verify", "POST", { pin: "0000" });
    assert.equal(response.status, 403);
  }
  const locked = await call(db, token, "/v1/pin/verify", "POST", { pin: "0000" });
  assert.equal(locked.status, 429);
  const duringLock = await call(db, token, "/v1/pin/verify", "POST", { pin: "1234" });
  assert.equal(duringLock.status, 429);
});

test("export omits secrets and deletion requires the exact phrase", async () => {
  const { db, token } = await seedFamily();
  const exported = await call(db, token, "/v1/account/export", "GET");
  const bundle = await exported.json();
  assert.equal(bundle.parent.email, "ada@example.com");
  assert.equal(bundle.parent.pin_set, true);
  assert.equal(JSON.stringify(bundle).includes("1234"), false);
  assert.equal(JSON.stringify(bundle).includes("pin_hash"), false);

  const missing = await call(db, token, "/v1/account/delete", "POST", { confirm: "delete", password: "nope" });
  assert.equal(missing.status, 400);
  assert.match((await missing.json()).error, new RegExp(DELETE_PHRASE));
  const stillThere = await db.prepare("SELECT id FROM parents WHERE id = 'parent-1'").first();
  assert.equal(stillThere.id, "parent-1");
});

test("health reports email readiness without creating an account", async () => {
  const db = createMemoryD1();
  const response = await worker.fetch(new Request("https://funberry-api.example/v1/health"), { DB: db, MAIL_FROM: "FunBerry Kids <no-reply@funberrykids.in>" });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.email_ready, false);
  assert.equal(body.payments_configured, false);
  assert.equal(body.checkout_mode, "modal-with-hosted-fallback");
  const parents = await db.prepare("SELECT COUNT(*) AS n FROM parents").first();
  assert.equal(Number(parents.n), 0);
});
