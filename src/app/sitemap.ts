import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase/client';

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://scienceone.net';

  // Static routes
  const routes = [
    '',
    '/discover',
    '/about',
    '/editorial-policy',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes (articles)
  let articleRoutes: MetadataRoute.Sitemap = [];
  
  try {
    const { data } = await supabase
      .from('science_posts')
      .select('slug, updated_at, created_at')
      .order('created_at', { ascending: false });

    if (data) {
      articleRoutes = data.map((post) => ({
        url: `${baseUrl}/article/${post.slug}`,
        lastModified: post.updated_at || post.created_at || new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Sitemap error:', error);
  }

  return [...routes, ...articleRoutes];
}
