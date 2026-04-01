import type { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/lib/blog';

const siteUrl = 'https://kartonbaas.nl';

const staticRoutes = [
  '/',
  '/contact',
  '/blog',
  '/bedankt',
  '/cookies',
  '/privacy',
  '/retouren',
  '/algemene-voorwaarde',
  '/algemene-voorwaarden',
  '/voorwaarden',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries];
}
