import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { CATEGORIES } from '@/lib/gemini';
import { ALL_COMPETITOR_SLUGS } from '@/lib/compare-data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://onseek.co';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/latest',
    '/popular',
    '/compare',
    '/about',
    '/privacy',
    '/terms',
    '/trust',
    '/accessibility',
    '/cookies',
    '/help',
    '/release-notes',
    '/enterprise',
    '/foundation',
    '/desktop',
    '/landing',
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Category Routes
  const categoryRoutes: MetadataRoute.Sitemap = [];
  CATEGORIES.forEach((category) => {
    const slug = category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Core category page
    categoryRoutes.push({
      url: `${SITE_URL}/category/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    });
    
    // Latest in category
    categoryRoutes.push({
      url: `${SITE_URL}/latest/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    });

    // Popular in category
    categoryRoutes.push({
      url: `${SITE_URL}/popular/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    });
  });

  // 3. Dynamic Request Routes
  const { data: requests } = await supabase
    .from('requests')
    .select('slug, updated_at')
    .eq('status', 'open')
    .limit(1000); // Fetch top 1000 active requests for the sitemap

  const requestRoutes: MetadataRoute.Sitemap = (requests || []).map((req) => ({
    url: `${SITE_URL}/requests/${req.slug}`,
    lastModified: new Date(req.updated_at),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // 4. Comparison Routes
  const comparisonRoutes: MetadataRoute.Sitemap = ALL_COMPETITOR_SLUGS.map((slug) => ({
    url: `${SITE_URL}/compare/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // 5. Active Profile Routes
  const { data: activeProfiles } = await supabase
    .from('profiles')
    .select('username, updated_at')
    .limit(500); // Fetch some profiles (can be optimized to only active ones)

  const profileRoutes: MetadataRoute.Sitemap = (activeProfiles || []).map((profile) => ({
    url: `${SITE_URL}/profile/${profile.username}`,
    lastModified: new Date(profile.updated_at || new Date()),
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  // 6. Popular "Looking For" Items
  const popularSearches = ['iphone-16-pro', 'macbook-pro-m3', 'sony-camera', 'rolex-watch', 'designer-sneakers'];
  const lookingForRoutes: MetadataRoute.Sitemap = popularSearches.map((item) => ({
    url: `${SITE_URL}/looking-for/${item}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...requestRoutes,
    ...comparisonRoutes,
    ...profileRoutes,
    ...lookingForRoutes,
  ];
}
