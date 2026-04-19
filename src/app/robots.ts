import { MetadataRoute } from 'next';

const SITE_URL = 'https://onseek.co';

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
