import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { fallbackPosts } from "@/lib/mock-data";

const categoryTitles: Record<string, string> = {
  "bio-tech": "Bio-Tech (Human & Tech)",
  "cosmos": "Cosmos (Space & Physics)",
  "life-science": "Life-Science (Fitness & Health)",
  "deep-dive": "Deep-Dive (Data & Mysteries)"
};

export const revalidate = 60; // Revalidate every minute

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const categoryTitle = categoryTitles[slug];

  if (!categoryTitle) {
    notFound();
  }

  let posts: any[] = [];
  const categoryPrefix = categoryTitle.split(" ")[0];

  try {
    // Fetch posts for this category
    const { data, error } = await supabase
      .from("science_posts")
      .select("*")
      .eq("category", categoryPrefix)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      posts = data;
    } else {
      posts = fallbackPosts.filter(p => p.category === categoryPrefix);
    }
  } catch (e) {
    posts = fallbackPosts.filter(p => p.category === categoryPrefix);
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-8 max-w-7xl">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="rounded-lg pl-2 -ml-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <header className="mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          {categoryTitle}
        </h1>
        <p className="text-lg text-muted-foreground">
          Explore the latest discoveries in {categoryTitle.split(" ")[0]}.
        </p>
      </header>

      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
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
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border/60 animate-in fade-in">
          <h3 className="text-2xl font-semibold mb-2">No discoveries yet</h3>
          <p className="text-muted-foreground">The AI is currently researching this topic. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
