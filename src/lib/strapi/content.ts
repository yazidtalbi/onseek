/**
 * Strapi Content Fetching Functions
 * 
 * Convenience functions to fetch specific content types from Strapi
 */

import {
  getStrapiEntry,
  getStrapiEntries,
  getStrapiEntryBySlug,
} from './client';
import type {
  LandingPageContent,
  PageContent,
  SiteSettings,
  NavigationItem,
  Announcement,
} from './types';

/**
 * Get landing page content
 */
export async function getLandingPageContent(): Promise<LandingPageContent | null> {
  const entries = await getStrapiEntries<LandingPageContent>('landing-pages', {
    populate: ['features', 'sampleRequest'],
    sort: ['createdAt:desc'],
    pagination: { pageSize: 1 },
  });
  return entries[0] || null;
}

/**
 * Get page content by slug (for Terms, Privacy, etc.)
 */
export async function getPageBySlug(slug: string): Promise<PageContent | null> {
  return getStrapiEntryBySlug<PageContent>('pages', slug, 'slug', [
    'seoImage',
  ]);
}

/**
 * Get all pages
 */
export async function getAllPages(): Promise<PageContent[]> {
  return getStrapiEntries<PageContent>('pages', {
    populate: ['seoImage'],
    sort: ['createdAt:asc'],
  });
}

/**
 * Get site settings
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const entries = await getStrapiEntries<SiteSettings>('site-settings', {
    populate: ['logo', 'favicon'],
    pagination: { pageSize: 1 },
  });
  return entries[0] || null;
}

/**
 * Get navigation items
 */
export async function getNavigationItems(): Promise<NavigationItem[]> {
  return getStrapiEntries<NavigationItem>('navigation-items', {
    sort: ['order:asc'],
  });
}

/**
 * Get active announcements
 */
export async function getActiveAnnouncements(): Promise<Announcement[]> {
  return getStrapiEntries<Announcement>('announcements', {
    filters: { isActive: true },
    sort: ['createdAt:desc'],
  });
}

