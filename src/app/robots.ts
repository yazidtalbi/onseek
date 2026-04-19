import { MetadataRoute } from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://onseek.co').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/settings',
          '/notifications',
          '/messages',
          '/saved',
          '/api/',
          '/auth/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
