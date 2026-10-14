import assert from "node:assert/strict";
import test from "node:test";
import { zones } from "@funberry/config";
import { gameEntitlement } from "../../../../cloudflare/worker/src/gameCatalog.js";
import { allEvsGames, getCurriculumSectionsForZone, getGamesForZone } from "../games/evs";
import { freeGameIds, gameAccess } from "./access";

function access(zoneId: string, gameId: string, paid: boolean, totalStars: number) {
  return gameAccess({
    zoneId,
    gameId,
    games: getGamesForZone(zoneId),
    sections: getCurriculumSectionsForZone(zoneId),
    paid,
    totalStars,
  });
}

test("free slice matches the website rule: 30% of a world, at least one game", () => {
  const plants = getGamesForZone("plants");
  const free = freeGameIds(plants, []);
  assert.equal(free.size, Math.max(1, Math.ceil(plants.length * 0.3)));
  assert.equal(free.has(plants[0].id), true);
});

test("Computer Lab is open to free accounts", () => {
  for (const game of getGamesForZone("computers")) {
    assert.equal(access("computers", game.id, false, 0).allowed, true, game.id);
  }
});

test("paid accounts open every game", () => {
  for (const [zoneId, games] of Object.entries(allEvsGames)) {
    for (const game of games) assert.equal(access(zoneId, game.id, true, 0).allowed, true, game.id);
  }
});

test("a game the app opens is always one the Worker will save", () => {
  for (const zone of zones) {
    for (const game of getGamesForZone(zone.id)) {
      for (const [paid, stars] of [
        [false, 0],
        [false, 12],
        [false, 70],
        [true, 0],
      ] as const) {
        if (!access(zone.id, game.id, paid, stars).allowed) continue;
        assert.equal(gameEntitlement(game.id, stars, paid).allowed, true, `${game.id} paid=${paid} stars=${stars}`);
      }
    }
  }
});

test("a star-locked free-slice game reports how many stars are missing", () => {
  const food = getGamesForZone("food");
  const result = access("food", food[0].id, false, 3);
  assert.equal(result.allowed, false);
  assert.equal(result.reason, "stars");
  assert.equal(result.starsNeeded, 7);
  assert.equal(access("food", food[food.length - 1].id, false, 99).reason, "premium");
  assert.equal(access("food", "made-up", false, 99).reason, "unknown");
});
