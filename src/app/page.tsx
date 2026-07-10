import { Button } from "@/components/ui/button";
import { DailyAnomaly } from "@/components/daily-anomaly";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { fallbackPosts } from "@/lib/mock-data";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  let posts: any[] = [];
  
  try {
    const { data, error } = await supabase
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
    <div className="container mx-auto px-4 py-16 md:px-8 max-w-7xl">
      
      {/* Hero Section */}
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

      {/* Discovery Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts?.map((post, index) => (
          <Link href={`/article/${post.slug}`} key={post.id} className="block group">
            <Card 
              className="overflow-hidden border-border/40 bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
              style={{ animationDelay: `${(index + 1) * 150}ms` }}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <img 
                  src={post.image_url} 
                  alt={post.title} 
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold tracking-wide text-primary shadow-sm border border-primary/10">
                  {post.category}
                </div>
              </div>
              <CardHeader className="pt-6">
                <CardTitle className="leading-tight text-2xl group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-6">
                <CardDescription className="text-base text-foreground/70 leading-relaxed">
                  {post.summary}
                </CardDescription>
              </CardContent>
              <CardFooter className="pt-0 border-t border-border/40 bg-muted/20 px-6 py-4 mt-auto">
                <div className="w-full flex items-center justify-between rounded-lg font-semibold group-hover:bg-primary/10 group-hover:text-primary transition-colors h-11 px-4 text-sm">
                  Read Article 
                  <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
        {(!posts || posts.length === 0) && (
          <div className="col-span-full text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border/60">
            <h3 className="text-2xl font-semibold mb-2">Awaiting Discoveries</h3>
            <p className="text-muted-foreground">The AI pipeline has not published any articles yet.</p>
          </div>
        )}
      </section>

    </div>
  );
}
