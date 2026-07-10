import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, BookmarkPlus, Link as LinkIcon, Mail } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { fallbackPosts } from "@/lib/mock-data";

export const revalidate = 60;

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  let article: any = null;

  try {
    const { data, error } = await supabase
      .from("science_posts")
      .select("*")
      .eq("slug", resolvedParams.slug)
      .single();
    
    if (!error && data) {
      article = data;
    } else {
      article = fallbackPosts.find(p => p.slug === resolvedParams.slug);
    }
  } catch (e) {
    article = fallbackPosts.find(p => p.slug === resolvedParams.slug);
  }

  if (!article) {
    notFound();
  }

  // Calculate read time roughly
  const wordCount = article.content.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200)) + " min read";
  const formattedDate = new Date(article.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <article className="min-h-screen bg-background pb-20">
      
      {/* Cinematic Hero Section (Desktop) */}
      <div className="hidden md:block relative w-full h-[70vh] bg-muted overflow-hidden">
        <img 
          src={article.image_url} 
          alt={article.title}
          className="absolute inset-0 object-cover w-full h-full animate-in zoom-in-105 duration-1000 fill-mode-both"
        />
        {/* Gradient Overlay - Tuned for desktop to leave the top image vibrant */}
        <div className="absolute inset-0 bg-gradient-to-t from-background from-30% via-background/80 via-60% to-transparent pointer-events-none" />
        
        {/* Back Button */}
        <div className="absolute top-8 left-8 z-10">
          <Link href="/">
            <Button variant="ghost" className="rounded-full bg-background/50 backdrop-blur-md text-foreground hover:bg-background/80 hover:text-primary transition-all">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Discovery
            </Button>
          </Link>
        </div>

        {/* Title Content */}
        <div className="absolute bottom-0 left-0 w-full p-12 lg:px-24">
          <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-300">
            <div className="inline-flex items-center gap-4 text-sm font-medium">
              <span className="bg-primary/20 text-primary backdrop-blur-md px-4 py-1.5 rounded-full border border-primary/20">
                {article.category}
              </span>
              <span className="text-foreground/80">{formattedDate}</span>
              <span className="text-foreground/80">&bull;</span>
              <span className="text-foreground/80">{readTime}</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Standard App-Like Header (Mobile) */}
      <div className="md:hidden w-full bg-background">
        <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
          <img 
            src={article.image_url} 
            alt={article.title}
            className="absolute inset-0 object-cover w-full h-full animate-in zoom-in-105 duration-1000 fill-mode-both"
          />
        </div>
        <div className="px-4 pt-6 pb-2 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-300">
          <div className="inline-flex flex-wrap items-center gap-3 text-sm font-medium">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
              {article.category}
            </span>
            <span className="text-muted-foreground">{formattedDate}</span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="text-muted-foreground">{readTime}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
            {article.title}
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-8 mt-12 max-w-6xl flex flex-col md:flex-row gap-12 relative">
        
        {/* Sticky Sidebar */}
        <aside className="hidden md:block w-16 shrink-0 relative">
          <div className="sticky top-32 flex flex-col gap-4 items-center">
            <div className="h-12 w-[1px] bg-border mb-4"></div>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground">
              <LinkIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground">
              <Mail className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground mt-4">
              <BookmarkPlus className="h-5 w-5" />
            </Button>
            <div className="h-24 w-[1px] bg-border mt-4"></div>
          </div>
        </aside>

        {/* Prose Content */}
        <div className="flex-1 max-w-3xl">
          <div 
            className="prose prose-emerald prose-lg max-w-none text-foreground/90
            prose-headings:font-bold prose-headings:tracking-tight
            prose-a:text-primary hover:prose-a:text-primary/80 prose-a:underline-offset-4
            prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:font-medium prose-blockquote:text-foreground
            prose-strong:text-foreground
            animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-500"
          >
            <div dangerouslySetInnerHTML={{ 
              __html: article.content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/### (.*?)\n/g, '<h3>$1</h3>')
                .replace(/> \*\*(.*?)\*\*/g, '<blockquote><strong>$1</strong></blockquote>')
                .replace(/\n\n/g, '<br/><br/>')
            }} />
          </div>
          
          {/* Mobile Action Bar (Moved to end) */}
          <div className="flex items-center gap-3 mt-12 md:hidden border-t border-border pt-8 animate-in fade-in duration-1000 delay-700 fill-mode-both">
            <Button variant="outline" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground h-12 w-12 flex-shrink-0">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground h-12 w-12 flex-shrink-0">
              <LinkIcon className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground h-12 w-12 flex-shrink-0">
              <Mail className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
            <Button variant="default" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary shadow-none h-12 px-6 font-semibold transition-colors">
              <BookmarkPlus className="h-5 w-5 mr-2" />
              Save
            </Button>
          </div>

          <div className="mt-8 pt-8 md:mt-16 border-t border-border flex items-center justify-between animate-in fade-in duration-1000 delay-700 fill-mode-both">
            <h3 className="font-semibold text-lg hidden md:block">Share this discovery</h3>
            <div className="flex gap-2 w-full md:w-auto justify-center md:justify-start">
              <Button variant="outline" size="sm" className="rounded-full flex-1 md:flex-none">Twitter</Button>
              <Button variant="outline" size="sm" className="rounded-full flex-1 md:flex-none">LinkedIn</Button>
            </div>
          </div>
        </div>

      </div>
    </article>
  );
}
