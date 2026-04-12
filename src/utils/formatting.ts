/**
 * Strips non-digit characters from input.
 * Use this during onChange to allow digits-only input for phone fields.
 */
export function stripNonDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Formats a raw digit string as (XXX) XXX-XXXX.
 * Use this onBlur to display the formatted phone number.
 * If less than 10 digits, returns raw digits.
 * If more than 10 digits, truncates to 10.
 */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length < 10) return digits;
  const d = digits.substring(0, 10);
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

/**
 * Validates a name field: only letters (unicode), spaces, hyphens, and apostrophes.
 */
export function sanitizeName(value: string): string {
  return value.replace(/[^a-zA-Z\s\-']/g, "");
}
