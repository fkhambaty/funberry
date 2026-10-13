export type FixBurden = "none" | "minor" | "major";

export interface PageReview {
  file: string;
  groundedInPage: boolean | null;
  answersCorrect: boolean | null;
  ageSuitability: number | null;
  usefulness: number | null;
  fixBurden: FixBurden | null;
  notes?: string;
}

export function isCompletedReview(review: PageReview): boolean {
  return (
    review.groundedInPage != null &&
    review.answersCorrect != null &&
    review.ageSuitability != null &&
    review.usefulness != null &&
    review.fixBurden != null
  );
}

export function isTrustedReview(review: PageReview): boolean {
  return (
    review.groundedInPage === true &&
    review.answersCorrect === true &&
    (review.ageSuitability ?? 0) >= 4 &&
    (review.usefulness ?? 0) >= 4 &&
    (review.fixBurden === "none" || review.fixBurden === "minor")
  );
}

/** Human review is the verdict. Automated OCR counts are not an input. */
export function scoreEvidenceGate(pageCount: number, reviews: PageReview[]) {
  const completed = reviews.filter(isCompletedReview);
  const trusted = completed.filter(isTrustedReview);
  const required = Math.ceil(pageCount * 0.8);
  const status =
    pageCount < 1 || completed.length < pageCount ? "pending" : trusted.length >= required ? "pass" : "fail";
  return {
    pageCount,
    completed: completed.length,
    trusted: trusted.length,
    required,
    status,
  } as const;
}
