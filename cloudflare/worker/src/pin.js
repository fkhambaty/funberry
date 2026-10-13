import { bytesToHex, hashSecret } from "./crypto.js";
import { timingSafeEqualString } from "./payments.js";

const LOCK_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function isFourDigitPin(value) {
  return /^\d{4}$/.test(String(value || "").trim());
}

export function pinIsSet(row) {
  if (!row) return false;
  if (row.pin_hash && row.pin_salt) return true;
  return isFourDigitPin(row.pin);
}

export async function hashNewPin(pin) {
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  return { pin_hash: await hashSecret(pin, salt), pin_salt: salt };
}

export async function pinMatches(row, pin) {
  const entered = String(pin || "").trim();
  if (!isFourDigitPin(entered) || !row) return false;
  if (row.pin_hash && row.pin_salt) {
    const hashed = await hashSecret(entered, row.pin_salt);
    return timingSafeEqualString(hashed, row.pin_hash);
  }
  return isFourDigitPin(row.pin) && timingSafeEqualString(String(row.pin), entered);
}

/** Turns a stored 4-digit PIN into a hash and clears the plaintext column. */
export async function migratePlainPin(db, parent, now) {
  if (!parent) return parent;
  const plain = String(parent.pin || "").trim();
  if (parent.pin_hash && parent.pin_salt) {
    if (plain) {
      await db.prepare("UPDATE parents SET pin = NULL, updated_at = ? WHERE id = ?").bind(now, parent.id).run();
      parent.pin = null;
    }
    return parent;
  }
  if (!isFourDigitPin(plain)) return parent;
  const hashed = await hashNewPin(plain);
  await db
    .prepare("UPDATE parents SET pin_hash = ?, pin_salt = ?, pin = NULL, updated_at = ? WHERE id = ?")
    .bind(hashed.pin_hash, hashed.pin_salt, now, parent.id)
    .run();
  parent.pin_hash = hashed.pin_hash;
  parent.pin_salt = hashed.pin_salt;
  parent.pin = null;
  return parent;
}

export async function storeParentPin(db, parentId, pin, now) {
  const hashed = await hashNewPin(pin);
  await db
    .prepare(
      `UPDATE parents
       SET pin_hash = ?, pin_salt = ?, pin = NULL, pin_attempts = 0, pin_locked_until = NULL, updated_at = ?
       WHERE id = ?`,
    )
    .bind(hashed.pin_hash, hashed.pin_salt, now, parentId)
    .run();
}

export function pinLockActive(row, nowMs = Date.now()) {
  if (!row?.pin_locked_until) return false;
  const until = Date.parse(row.pin_locked_until);
  return Number.isFinite(until) && until > nowMs;
}

export async function recordPinFailure(db, parent, nowIso) {
  const attempts = Number(parent.pin_attempts || 0) + 1;
  if (attempts >= MAX_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCK_MS).toISOString();
    await db
      .prepare("UPDATE parents SET pin_attempts = 0, pin_locked_until = ?, updated_at = ? WHERE id = ?")
      .bind(lockedUntil, nowIso, parent.id)
      .run();
    return { locked: true };
  }
  await db
    .prepare("UPDATE parents SET pin_attempts = ?, updated_at = ? WHERE id = ?")
    .bind(attempts, nowIso, parent.id)
    .run();
  return { locked: false, remaining: MAX_ATTEMPTS - attempts };
}

export async function clearPinFailures(db, parentId, nowIso) {
  await db
    .prepare("UPDATE parents SET pin_attempts = 0, pin_locked_until = NULL, updated_at = ? WHERE id = ?")
    .bind(nowIso, parentId)
    .run();
}
