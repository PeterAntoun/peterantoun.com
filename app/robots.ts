import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep the private finance dashboard out of search engines.
      disallow: ['/admin', '/admin/', '/api/'],
    },
    host: 'https://peterantoun.com',
  };
}
