import { ArticleCard } from "@/components/article-card";
import { DiscoverControls } from "@/components/discover-controls";
import { supabase } from "@/lib/supabase/client";
import { fallbackPosts } from "@/lib/mock-data";

export const revalidate = 60; // Revalidate every minute
export const runtime = "edge";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q?.toLowerCase() || "";
  const category = resolvedParams.category || "";

  let posts: any[] = [];

  try {
    let query = supabase.from("science_posts").select("*").order("created_at", { ascending: false });
    
    if (category && category !== "All") {
      query = query.eq("category", category);
    }
    
    if (q) {
      query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);
    }

    const { data, error } = await query;

    if (!error && data) {
      posts = data;
    } else {
      // Fallback local filtering
      posts = fallbackPosts;
    }
  } catch (e) {
    posts = fallbackPosts;
  }

  // Local filtering if we fell back to mock data
  if (posts === fallbackPosts) {
    if (category && category !== "All") {
      posts = posts.filter((p) => p.category === category);
    }
    if (q) {
      posts = posts.filter((p) => 
        p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)
      );
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 md:px-8 max-w-7xl min-h-screen">
      {/* Header & Controls Section */}
      <section className="mb-16 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
          Discover <span className="text-primary">Articles</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Search through our library of scientific analyses, theories, and breakthroughs across Bio-Tech, Cosmos, and Life-Science.
        </p>
        <div className="pt-4">
          <DiscoverControls />
        </div>
      </section>

      {/* Results Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts?.map((post, index) => (
          <ArticleCard key={post.id} post={post} index={index} />
        ))}
        {posts.length === 0 && (
          <div className="col-span-full text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border/60 animate-in fade-in duration-700">
            <h3 className="text-2xl font-semibold mb-2">No discoveries found</h3>
            <p className="text-muted-foreground">Try adjusting your search query or changing the category filter.</p>
          </div>
        )}
      </section>
    </div>
  );
}
