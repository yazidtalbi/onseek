/**
 * Strapi CMS Client
 * 
 * This client provides utilities to fetch content from Strapi CMS.
 * Make sure to set STRAPI_URL and STRAPI_API_TOKEN in your environment variables.
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_URL) {
  console.warn('Strapi URL is not configured. Set NEXT_PUBLIC_STRAPI_URL or STRAPI_URL environment variable.');
}

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiImage {
  id: number;
  attributes: {
    name: string;
    alternativeText: string | null;
    caption: string | null;
    width: number;
    height: number;
    formats: {
      thumbnail?: { url: string; width: number; height: number };
      small?: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      large?: { url: string; width: number; height: number };
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface StrapiComponent {
  id: number;
  __component: string;
  [key: string]: unknown;
}

/**
 * Fetch data from Strapi API
 */
async function fetchStrapi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<StrapiResponse<T>> {
  if (!STRAPI_URL) {
    throw new Error('Strapi URL is not configured');
  }

  const url = `${STRAPI_URL}/api${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add API token if available (for protected endpoints)
  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a single entry by ID
 */
export async function getStrapiEntry<T>(
  contentType: string,
  id: string | number,
  populate: string | string[] = '*'
): Promise<T | null> {
  try {
    const populateParam = Array.isArray(populate) ? populate.join(',') : populate;
    const response = await fetchStrapi<T>(
      `/${contentType}/${id}?populate=${populateParam}`
    );
    return response.data as T;
  } catch (error) {
    console.error(`Error fetching ${contentType} with id ${id}:`, error);
    return null;
  }
}

/**
 * Get entries with optional filters
 */
export async function getStrapiEntries<T>(
  contentType: string,
  options: {
    populate?: string | string[];
    filters?: Record<string, unknown>;
    sort?: string | string[];
    pagination?: {
      page?: number;
      pageSize?: number;
    };
    publicationState?: 'live' | 'preview';
  } = {}
): Promise<T[]> {
  try {
    const {
      populate = '*',
      filters,
      sort,
      pagination,
      publicationState = 'live',
    } = options;

    const params = new URLSearchParams();

    // Populate
    const populateParam = Array.isArray(populate) ? populate.join(',') : populate;
    params.append('populate', populateParam);

    // Filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        params.append(`filters[${key}]`, String(value));
      });
    }

    // Sort
    if (sort) {
      const sortParam = Array.isArray(sort) ? sort.join(',') : sort;
      params.append('sort', sortParam);
    }

    // Pagination
    if (pagination) {
      if (pagination.page) params.append('pagination[page]', String(pagination.page));
      if (pagination.pageSize) params.append('pagination[pageSize]', String(pagination.pageSize));
    }

    // Publication state
    params.append('publicationState', publicationState);

    const response = await fetchStrapi<T[]>(`/${contentType}?${params.toString()}`);
    return (response.data as T[]) || [];
  } catch (error) {
    console.error(`Error fetching ${contentType}:`, error);
    return [];
  }
}

/**
 * Get a single entry by slug or other unique field
 */
export async function getStrapiEntryBySlug<T>(
  contentType: string,
  slug: string,
  slugField: string = 'slug',
  populate: string | string[] = '*'
): Promise<T | null> {
  try {
    const populateParam = Array.isArray(populate) ? populate.join(',') : populate;
    const response = await fetchStrapi<T[]>(
      `/${contentType}?filters[${slugField}][$eq]=${slug}&populate=${populateParam}`
    );
    const entries = (response.data as T[]) || [];
    return entries[0] || null;
  } catch (error) {
    console.error(`Error fetching ${contentType} with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Get image URL from Strapi image object
 */
export function getStrapiImageUrl(image: StrapiImage | null | undefined): string | null {
  if (!image?.attributes?.url) return null;
  const baseUrl = STRAPI_URL?.replace('/api', '') || '';
  return `${baseUrl}${image.attributes.url}`;
}

/**
 * Get image URL with format (thumbnail, small, medium, large)
 */
export function getStrapiImageUrlWithFormat(
  image: StrapiImage | null | undefined,
  format: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'
): string | null {
  if (!image?.attributes) return null;
  const baseUrl = STRAPI_URL?.replace('/api', '') || '';
  const formatUrl = image.attributes.formats?.[format]?.url;
  if (formatUrl) {
    return `${baseUrl}${formatUrl}`;
  }
  // Fallback to original URL if format doesn't exist
  return image.attributes.url ? `${baseUrl}${image.attributes.url}` : null;
}

