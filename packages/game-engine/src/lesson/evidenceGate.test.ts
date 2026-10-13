import assert from "node:assert/strict";
import test from "node:test";
import { scoreEvidenceGate, type PageReview } from "./evidenceGate";

function review(file: string, trusted: boolean): PageReview {
  return {
    file,
    groundedInPage: trusted,
    answersCorrect: trusted,
    ageSuitability: trusted ? 4 : 2,
    usefulness: trusted ? 4 : 2,
    fixBurden: trusted ? "minor" : "major",
  };
}

test("the learning-pack gate stays pending until every page is reviewed", () => {
  const result = scoreEvidenceGate(10, [review("page-01.jpg", true)]);
  assert.equal(result.status, "pending");
  assert.equal(result.required, 8);
});

test("eight trusted pages out of ten pass, and seven fail", () => {
  const pages = Array.from({ length: 10 }, (_, index) => `page-${index}.jpg`);
  const eight = pages.map((file, index) => review(file, index < 8));
  assert.equal(scoreEvidenceGate(10, eight).status, "pass");
  const seven = pages.map((file, index) => review(file, index < 7));
  const failed = scoreEvidenceGate(10, seven);
  assert.equal(failed.status, "fail");
  assert.equal(failed.trusted, 7);
});

test("a major fix or a wrong answer is not trusted", () => {
  const weak = review("page.jpg", true);
  weak.fixBurden = "major";
  assert.equal(scoreEvidenceGate(1, [weak]).status, "fail");
  const wrong = review("page.jpg", true);
  wrong.answersCorrect = false;
  assert.equal(scoreEvidenceGate(1, [wrong]).trusted, 0);
});
