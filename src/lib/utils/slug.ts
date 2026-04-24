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
export function getShortId(id: string): string {
  return id.replace(/-/g, '').substring(0, 8);
}

/**
 * Create a request URL with slug and optional search params
 * New format: /[category-slug]/[request-slug]=(id)
 */
import { getCategorySlug } from "./category-routing";

export function createRequestUrl(request: { slug?: string; id: string; category?: string }, searchParams?: string | URLSearchParams): string {
  if (!request.slug) {
    const base = `/requests/${request.id}`;
    if (!searchParams) return base;
    const paramsStr = typeof searchParams === 'string' ? searchParams : searchParams.toString();
    const prefix = paramsStr.startsWith('?') ? '' : '?';
    return `${base}${prefix}${paramsStr}`;
  }

  const categorySlug = request.category ? getCategorySlug(request.category) : 'all';
  const shortId = getShortId(request.id);
  const base = `/${categorySlug}/${request.slug}-${shortId}`;
  
  if (!searchParams) return base;
  
  const paramsStr = typeof searchParams === 'string' ? searchParams : searchParams.toString();
  if (!paramsStr) return base;
  
  const prefix = paramsStr.startsWith('?') ? '' : '?';
  return `${base}${prefix}${paramsStr}`;
}

/**
 * Extract request ID from the new slug format: request-slug=(id)
 */
export function extractIdFromSlug(slugWithId: string): string | null {
  // Matches "something-id" or "something=(id)" where id is 8 hex chars
  const match = slugWithId.match(/(?:-|=\()([a-f0-9]{8})\)?$/);
  return match ? match[1] : null;
}

/**
 * Extract the pure slug part from the new slug format
 */
export function extractSlugOnly(slugWithId: string): string {
  return slugWithId.replace(/(?:-|=\()[a-f0-9]{8}\)?$/, '');
}

/**
 * Extract request ID from slug URL (Legacy support)
 * Handles format: shortId-slug-title
 */
export function extractRequestId(slug: string): string | null {
  // Format: shortId-slug-title (e.g., "faf51fe0-casio-w23-watch")
  const match = slug.match(/^([a-f0-9]{8})-/);
  if (match) return match[1];
  
  // If it's the new format, use the new extractor
  const newMatch = extractIdFromSlug(slug);
  if (newMatch) return newMatch;

  if (slug.length === 8 && slug.match(/^[a-f0-9]+$/)) {
    return slug;
  }
  return null;
}


