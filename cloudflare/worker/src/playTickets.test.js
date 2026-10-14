import assert from "node:assert/strict";
import test from "node:test";
import worker from "./index.js";
import { createMemoryD1 } from "./memoryDb.js";
import { sha256 } from "./crypto.js";
import { MAX_OPEN_TICKETS } from "./playTickets.js";

const WEB = "https://www.funberrykids.in";

async function seed({ stars = 0, tier = "free" } = {}) {
  const db = createMemoryD1();
  const now = new Date().toISOString();
  for (const [id, email] of [
    ["parent-1", "ada@example.com"],
    ["parent-2", "bo@example.com"],
  ]) {
    await db
      .prepare(
        `INSERT INTO parents (id, email, password_hash, password_salt, name, subscription_tier, email_verified_at)
         VALUES (?, ?, 'x', 'y', 'P', ?, ?)`,
      )
      .bind(id, email, tier, now)
      .run();
  }
  await db
    .prepare("INSERT INTO children (id, parent_id, name, age, total_stars) VALUES ('child-1', 'parent-1', 'Sam', 6, ?)")
    .bind(stars)
    .run();
  await db.prepare("INSERT INTO children (id, parent_id, name, age) VALUES ('child-2', 'parent-2', 'Kai', 7)").run();
  const expires = new Date(Date.now() + 86400000).toISOString();
  await db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, 'parent-1', ?)").bind(await sha256("t1"), expires).run();
  await db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, 'parent-2', ?)").bind(await sha256("t2"), expires).run();
  return db;
}

async function call(db, path, body, { token, origin } = {}) {
  const headers = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  if (origin) headers.origin = origin;
  const response = await worker.fetch(
    new Request(`https://funberry-api.example${path}`, { method: "POST", headers, body: JSON.stringify(body) }),
    { DB: db },
  );
  return { status: response.status, body: await response.json(), headers: response.headers };
}

const issue = (db, gameId, childId = "child-1", token = "t1") =>
  call(db, "/v1/play-tickets", { child_id: childId, game_id: gameId }, { token });

test("issuing a ticket needs a session and the parent's own child", async () => {
  const db = await seed();
  assert.equal((await call(db, "/v1/play-tickets", { child_id: "child-1", game_id: "plants-bubble-pop" })).status, 401);
  assert.equal((await issue(db, "plants-bubble-pop", "child-2")).status, 404);
  assert.equal((await issue(db, "no-such-game")).body.code, "unknown_game");
});

test("a star-locked world refuses a ticket for a free account", async () => {
  const db = await seed({ stars: 0 });
  const locked = await issue(db, "food-bubble-pop");
  assert.equal(locked.status, 403);
  assert.equal(locked.body.code, "locked");
  const premium = await seed({ stars: 0, tier: "lifetime" });
  assert.equal((await issue(premium, "food-bubble-pop")).status, 201);
});

test("ticket is stored hashed, checks, and saves exactly one round", async () => {
  const db = await seed();
  const issued = await issue(db, "plants-bubble-pop");
  assert.equal(issued.status, 201);
  assert.match(issued.body.ticket, /^[0-9a-f]{64}$/);
  const raw = await db.prepare("SELECT * FROM play_tickets WHERE token_hash = ?").bind(issued.body.ticket).first();
  assert.equal(raw, null, "the plain ticket must not be stored");

  const ticket = issued.body.ticket;
  const check = await call(db, "/v1/play-tickets/check", { ticket, game_id: "plants-bubble-pop" }, { origin: WEB });
  assert.equal(check.status, 200);
  assert.equal(check.headers.get("access-control-allow-origin"), WEB);
  assert.equal("child_id" in check.body, false);

  const wrongGame = await call(db, "/v1/play-tickets/check", { ticket, game_id: "plants-sort" });
  assert.equal(wrongGame.status, 401);

  const done = await call(db, "/v1/play-tickets/complete", {
    ticket,
    game_id: "plants-bubble-pop",
    stars_earned: 9,
    score: 5,
    time_spent_seconds: 40,
  });
  assert.equal(done.status, 200);
  assert.equal(done.body.stars_credited, 3, "stars are clamped to three");
  assert.equal(done.body.total_stars, 3);

  const replay = await call(db, "/v1/play-tickets/complete", {
    ticket,
    game_id: "plants-bubble-pop",
    stars_earned: 3,
    score: 5,
  });
  assert.equal(replay.status, 409);
  assert.equal(replay.body.code, "ticket_used");
  const rows = await db.prepare("SELECT COUNT(*) AS n FROM play_events WHERE child_id = 'child-1'").first();
  assert.equal(rows.n, 1);
});

test("expired and malformed tickets are refused", async () => {
  const db = await seed();
  const { body } = await issue(db, "plants-bubble-pop");
  await db.prepare("UPDATE play_tickets SET expires_at = ?").bind(new Date(Date.now() - 1000).toISOString()).run();
  const expired = await call(db, "/v1/play-tickets/complete", { ticket: body.ticket, game_id: "plants-bubble-pop", stars_earned: 3 });
  assert.equal(expired.status, 401);
  assert.equal(expired.body.code, "ticket_invalid");
  const junk = await call(db, "/v1/play-tickets/check", { ticket: "../../etc", game_id: "plants-bubble-pop" });
  assert.equal(junk.status, 401);
});

test("a parent cannot hold unlimited open tickets", async () => {
  const db = await seed();
  for (let i = 0; i < MAX_OPEN_TICKETS; i += 1) assert.equal((await issue(db, "plants-bubble-pop")).status, 201);
  assert.equal((await issue(db, "plants-bubble-pop")).status, 429);
});

test("deleting a child revokes that child's tickets", async () => {
  const db = await seed();
  const { body } = await issue(db, "plants-bubble-pop");
  const response = await worker.fetch(
    new Request("https://funberry-api.example/v1/children/child-1", {
      method: "DELETE",
      headers: { authorization: "Bearer t1" },
    }),
    { DB: db },
  );
  assert.equal(response.status, 200);
  const check = await call(db, "/v1/play-tickets/check", { ticket: body.ticket, game_id: "plants-bubble-pop" });
  assert.equal(check.status, 401);
});

test("signed-in progress still enforces the same entitlement", async () => {
  const db = await seed({ stars: 0 });
  const locked = await call(
    db,
    "/v1/progress",
    { child_id: "child-1", game_id: "food-bubble-pop", stars_earned: 3 },
    { token: "t1" },
  );
  assert.equal(locked.status, 403);
  assert.equal(locked.body.error, "That game is still locked.");
  const open = await call(db, "/v1/progress", { child_id: "child-1", game_id: "plants-sort", stars_earned: 2 }, { token: "t1" });
  assert.equal(open.status, 200);
  assert.equal(open.body.stars_credited, 2);
});
