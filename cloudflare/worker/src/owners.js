/** Owner emails promoted to admin on signup, verify, and sign-in. */
export const OWNER_EMAILS = ["fakhruddinkhambaty@gmail.com", "fktiindia@gmail.com"];

const OWNER_SET = new Set(OWNER_EMAILS);

export function isOwnerEmail(email) {
  return OWNER_SET.has(String(email || "").trim().toLowerCase());
}

export function roleForEmail(email) {
  return isOwnerEmail(email) ? "admin" : "parent";
}
