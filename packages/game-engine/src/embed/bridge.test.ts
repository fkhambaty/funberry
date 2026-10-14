import assert from "node:assert/strict";
import test from "node:test";
import { allEvsGames } from "../games/evs";
import {
  embedUrl,
  encodeEmbedMessage,
  encodeNativeInit,
  isAllowedEmbedUrl,
  isValidGameId,
  parseEmbedMessage,
  parseNativeMessage,
} from "./bridge";

const ORIGIN = "https://www.funberrykids.in";
const TICKET = "a".repeat(64);
const RESULT = { score: 4, maxScore: 5, starsEarned: 2, timeSpent: 41, accuracy: 80 };

test("every shipped game id is valid on the bridge", () => {
  for (const games of Object.values(allEvsGames)) {
    for (const game of games) assert.equal(isValidGameId(game.id), true, game.id);
  }
});

test("init round-trips only for the expected game and a well-formed ticket", () => {
  const raw = encodeNativeInit("plants-bubble-pop", TICKET);
  assert.deepEqual(parseNativeMessage(raw, "plants-bubble-pop")?.ticket, TICKET);
  assert.equal(parseNativeMessage(raw, "animals-bubble-pop"), null);
  assert.equal(parseNativeMessage(encodeNativeInit("plants-bubble-pop", "short"), "plants-bubble-pop"), null);
  assert.equal(parseNativeMessage("{not json", "plants-bubble-pop"), null);
  assert.equal(parseNativeMessage({ type: "init" }, "plants-bubble-pop"), null);
});

test("completion is accepted only with a sane result", () => {
  const ok = parseEmbedMessage(
    encodeEmbedMessage("plants-bubble-pop", { type: "complete", result: RESULT, saved: { stars_credited: 2, total_stars: 9 } }),
    "plants-bubble-pop",
  );
  assert.equal(ok?.type, "complete");
  const inflated = encodeEmbedMessage("plants-bubble-pop", {
    type: "complete",
    result: { ...RESULT, starsEarned: 9 },
    saved: null,
  });
  assert.equal(parseEmbedMessage(inflated, "plants-bubble-pop"), null);
  const overScore = encodeEmbedMessage("plants-bubble-pop", {
    type: "complete",
    result: { ...RESULT, score: 6 },
    saved: null,
  });
  assert.equal(parseEmbedMessage(overScore, "plants-bubble-pop"), null);
  assert.equal(parseEmbedMessage(encodeEmbedMessage("other-game", { type: "ready" }), "plants-bubble-pop"), null);
  assert.equal(parseEmbedMessage("x".repeat(9000), "plants-bubble-pop"), null);
});

test("unknown error codes and message types are dropped", () => {
  const raw = JSON.stringify({ v: 1, source: "funberry-embed", gameId: "g-1", type: "error", code: "pay_now" });
  assert.equal(parseEmbedMessage(raw, "g-1"), null);
  const navigate = JSON.stringify({ v: 1, source: "funberry-embed", gameId: "g-1", type: "navigate", url: "https://evil.example" });
  assert.equal(parseEmbedMessage(navigate, "g-1"), null);
});

test("WebView allowlist accepts only this game's embed page", () => {
  assert.equal(isAllowedEmbedUrl(`${ORIGIN}/embed/game/g-1`, ORIGIN, "g-1"), true);
  assert.equal(isAllowedEmbedUrl(`${ORIGIN}/embed/game/g-1?x=1`, ORIGIN, "g-1"), true);
  assert.equal(isAllowedEmbedUrl(`${ORIGIN}/embed/game/g-12`, ORIGIN, "g-1"), false);
  assert.equal(isAllowedEmbedUrl(`${ORIGIN}/embed/game/g-1/../../dashboard`, ORIGIN, "g-1"), false);
  assert.equal(isAllowedEmbedUrl(`${ORIGIN}/dashboard`, ORIGIN, "g-1"), false);
  assert.equal(isAllowedEmbedUrl(`https://www.funberrykids.in.evil.example/embed/game/g-1`, ORIGIN, "g-1"), false);
  assert.equal(isAllowedEmbedUrl(`https://checkout.razorpay.com/`, ORIGIN, "g-1"), false);
  assert.equal(isAllowedEmbedUrl(`http://www.funberrykids.in/embed/game/g-1`, ORIGIN, "g-1"), false);
  assert.equal(embedUrl(`${ORIGIN}/`, "g-1"), `${ORIGIN}/embed/game/g-1`);
  assert.equal(embedUrl("javascript:alert(1)", "g-1"), null);
});
