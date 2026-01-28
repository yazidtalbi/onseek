/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Get short ID from full UUID (first 8 characters)
 */
function getShortId(id: string): string {
  return id.replace(/-/g, '').substring(0, 8);
}

/**
 * Create a request URL with ID
 */
export function createRequestUrl(id: string, title?: string): string {
  return `/app/requests/${id}`;
}

/**
 * Extract request ID from slug URL
 * Handles format: shortId-slug-title
 * We need to query by the short ID prefix
 */
export function extractRequestId(slug: string): string | null {
  // Format: shortId-slug-title (e.g., "faf51fe0-casio-w23-watch")
  // Extract the short ID (first 8 hex characters before first hyphen)
  const match = slug.match(/^([a-f0-9]{8})-/);
  if (match) {
    return match[1];
  }
  // If no match, might be just the short ID
  if (slug.length === 8 && slug.match(/^[a-f0-9]+$/)) {
    return slug;
  }
  // Fallback: return null to indicate we need to search differently
  return null;
}

