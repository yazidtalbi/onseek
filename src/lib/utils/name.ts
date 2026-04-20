/**
 * Formats a user's name as "First Name + Last Initial" (e.g., "John D.")
 * Falls back to username if name fields are missing.
 */
export function formatFullName(firstName: string | null | undefined, lastName: string | null | undefined, username?: string | null): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName.charAt(0)}.`;
  }
  if (firstName) {
    return firstName;
  }
  return username || "User";
}

/**
 * Formats a user's name as "First Last" (e.g., "John Doe")
 * Falls back to username if name fields are missing.
 */
export function formatNamesLong(firstName: string | null | undefined, lastName: string | null | undefined, username?: string | null): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) {
    return firstName;
  }
  return username || "User";
}
