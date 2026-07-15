import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Force dynamic, no cache

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
    const { data } = await supabaseAdmin
      .from('science_posts')
      .select('slug, created_at')
      .order('created_at', { ascending: false });

    if (data) {
      articleRoutes = data.map((post) => ({
        url: `${baseUrl}/article/${post.slug}`,
        lastModified: post.created_at ? new Date(post.created_at).toISOString() : new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Sitemap error:', error);
  }

  return [...routes, ...articleRoutes];
}
