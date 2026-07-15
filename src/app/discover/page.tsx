import { Suspense } from "react";
import { ArticleCard } from "@/components/article-card";
import { DiscoverControls } from "@/components/discover-controls";
import { supabaseAdmin } from "@/lib/supabase/server";
import { fallbackPosts } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 60; // Revalidate every minute

// Separate async component for data fetching
async function ArticleGrid({ category, q }: { category: string; q: string }) {
  let posts: any[] = [];

  try {
    let query = supabaseAdmin.from("science_posts").select("*").order("created_at", { ascending: false });
    
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
    <>
      {posts?.map((post, index) => (
        <ArticleCard key={post.id} post={post} index={index} />
      ))}
      {posts.length === 0 && (
        <div className="col-span-full text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border/60 animate-in fade-in duration-700">
          <h3 className="text-2xl font-semibold mb-2">No discoveries found</h3>
          <p className="text-muted-foreground">Try adjusting your search query or changing the category filter.</p>
        </div>
      )}
    </>
  );
}

function ArticleGridSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex flex-col rounded-xl border border-border/40 bg-card overflow-hidden">
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="p-6 flex-1 flex flex-col gap-4">
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-4/5 rounded-md" />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-border/40 bg-muted/20 mt-auto">
            <Skeleton className="h-6 w-32 rounded-md" />
          </div>
        </div>
      ))}
    </>
  );
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q?.toLowerCase() || "";
  const category = resolvedParams.category || "";

  return (
    <div className="container mx-auto px-4 py-16 md:px-8 max-w-7xl min-h-screen">
      {/* Header & Controls Section — renders instantly */}
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

      {/* Results Grid — streams in with Suspense */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Suspense fallback={<ArticleGridSkeleton />}>
          <ArticleGrid category={category} q={q} />
        </Suspense>
      </section>
    </div>
  );
}
