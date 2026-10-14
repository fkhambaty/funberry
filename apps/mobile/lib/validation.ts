/** Same rules the Worker enforces, checked before a request so errors show instantly. */

export function emailError(value: string): string | null {
  const email = value.trim();
  if (!email) return "Enter your email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "That email does not look right.";
  return null;
}

/** Login also accepts the username of an existing account (for example the demo account). */
export function loginError(value: string): string | null {
  return value.trim() ? null : "Enter your email or username.";
}

export function passwordError(value: string): string | null {
  return value.length >= 6 ? null : "Use at least 6 characters.";
}

export function pinError(value: string): string | null {
  return /^\d{4}$/.test(value) ? null : "The PIN is exactly 4 digits.";
}

export function codeError(value: string): string | null {
  return /^\d{6}$/.test(value.trim()) ? null : "The code is the 6 digits from the email.";
}

export function childNameError(value: string): string | null {
  const name = value.trim();
  if (!name) return "Please enter a name.";
  if (name.length > 40) return "Keep the name under 40 letters.";
  return null;
}

export function childAgeError(value: number): string | null {
  return Number.isInteger(value) && value >= 3 && value <= 12 ? null : "Age must be between 3 and 12.";
}

export const CHILD_AGES = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
