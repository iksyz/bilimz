import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { DailyAnomaly } from "@/components/daily-anomaly";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { Skeleton } from "@/components/ui/skeleton";

import { supabaseAdmin } from "@/lib/supabase/server";
import { fallbackPosts } from "@/lib/mock-data";

export const revalidate = 60; // Revalidate every minute

async function LatestArticles() {
  let posts: any[] = [];
  
  try {
    const { data, error } = await supabaseAdmin
      .from("science_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
      
    if (!error && data && data.length > 0) {
      posts = data;
    } else {
      posts = fallbackPosts;
    }
  } catch (e) {
    posts = fallbackPosts;
  }

  return (
    <>
      {posts?.map((post, index) => (
        <ArticleCard key={post.id} post={post} index={index} />
      ))}
      {(!posts || posts.length === 0) && (
        <div className="col-span-full text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border/60">
          <h3 className="text-2xl font-semibold mb-2">Awaiting Discoveries</h3>
          <p className="text-muted-foreground">The AI pipeline has not published any articles yet.</p>
        </div>
      )}
    </>
  );
}

function ArticleGridSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
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

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16 md:px-8 max-w-7xl">
      
      {/* Hero Section — renders instantly */}
      <section className="mb-20 text-center max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Global Science Portal
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
          Journey Into <span className="text-primary">Discovery</span>
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Exploring the frontiers of Bio-Tech, Cosmos, and Life-Science with clean, in-depth scientific analysis.
        </p>
      </section>

      <DailyAnomaly />

      {/* Discovery Grid — streams in */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Suspense fallback={<ArticleGridSkeleton />}>
          <LatestArticles />
        </Suspense>
      </section>

    </div>
  );
}
