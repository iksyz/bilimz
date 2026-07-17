import { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, BookmarkPlus, Link as LinkIcon, Mail } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { fallbackPosts } from "@/lib/mock-data";

export const revalidate = 60;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  
  let article: any = null;
  try {
    const { data, error } = await supabaseAdmin
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
    return {
      title: "Article Not Found | ScienceOne",
    };
  }

  return {
    title: `${article.title} | ScienceOne`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      url: `https://scienceone.net/article/${article.slug}`,
      siteName: 'ScienceOne',
      images: [
        {
          url: article.image_url,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: 'article',
      publishedTime: article.created_at,
      authors: ['Emre İpekyüz'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
      images: [article.image_url],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  let article: any = null;

  try {
    const { data, error } = await supabaseAdmin
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
  // Ensure author defaults to Emre if missing
  const authorName = article.author || "Emre Ipekyuz";
  
  const AUTHOR_INFO: Record<string, { initials: string, title: string, bgClass: string, textClass: string, imageUrl?: string }> = {
    "Emre Ipekyuz": { initials: "EI", title: "Founder & Science Writer", bgClass: "bg-[#E5F7ED] dark:bg-emerald-900/40", textClass: "text-[#10B981] dark:text-emerald-400", imageUrl: "/images/author-emre.webp" },
    "Siir Kaya": { initials: "SK", title: "Senior Cosmos Researcher", bgClass: "bg-blue-100 dark:bg-blue-900/40", textClass: "text-blue-600 dark:text-blue-400", imageUrl: "/images/author-siir.webp" },
    "Wei Chen": { initials: "WC", title: "Bio-Tech Lead Analyst", bgClass: "bg-rose-100 dark:bg-rose-900/40", textClass: "text-rose-600 dark:text-rose-400", imageUrl: "/images/author-wei.webp" },
    "Lukas Weber": { initials: "LW", title: "Deep-Space Correspondent", bgClass: "bg-amber-100 dark:bg-amber-900/40", textClass: "text-amber-600 dark:text-amber-400", imageUrl: "/images/author-lukas.webp" },
  };

  const currentAuthor = AUTHOR_INFO[authorName] || AUTHOR_INFO["Emre Ipekyuz"];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "image": article.image_url,
    "datePublished": article.created_at,
    "author": {
      "@type": "Person",
      "name": authorName,
      "jobTitle": currentAuthor.title,
      "url": "https://scienceone.net"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ScienceOne",
      "logo": {
        "@type": "ImageObject",
        "url": "https://scienceone.net/icon"
      }
    }
  };

  return (
    <article className="min-h-screen bg-background pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Cinematic Hero Section (Desktop) */}
      <div className="hidden md:block relative w-full h-[70vh] bg-muted overflow-hidden">
        <Image 
          src={article.image_url} 
          alt={article.title}
          fill
          priority
          sizes="100vw"
          className="object-cover animate-in zoom-in-105 duration-1000 fill-mode-both"
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
            <div className="flex items-center gap-3 pt-4">
              {currentAuthor.imageUrl ? (
                <img src={currentAuthor.imageUrl} alt={authorName} className="h-12 w-12 rounded-full object-cover shadow-sm" />
              ) : (
                <div className={`h-12 w-12 rounded-full ${currentAuthor.bgClass} flex items-center justify-center ${currentAuthor.textClass} font-bold text-base shadow-sm`}>
                  {currentAuthor.initials}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-base font-bold text-foreground">{authorName}</span>
                <span className="text-sm text-foreground/80 font-medium">{currentAuthor.title}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standard App-Like Header (Mobile) */}
      <div className="md:hidden w-full bg-background">
        <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
          <Image 
            src={article.image_url} 
            alt={article.title}
            fill
            priority
            sizes="100vw"
            className="object-cover animate-in zoom-in-105 duration-1000 fill-mode-both"
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
          <div className="flex items-center gap-3 pt-2">
            {currentAuthor.imageUrl ? (
              <img src={currentAuthor.imageUrl} alt={authorName} className="h-10 w-10 rounded-full object-cover shadow-sm" />
            ) : (
              <div className={`h-10 w-10 rounded-full ${currentAuthor.bgClass} flex items-center justify-center ${currentAuthor.textClass} font-bold text-sm shadow-sm`}>
                {currentAuthor.initials}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">{authorName}</span>
              <span className="text-xs text-muted-foreground font-medium">{currentAuthor.title}</span>
            </div>
          </div>
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
          {article.summary && (
            <div className="relative mb-16 mt-10 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-400">
              <span className="absolute -top-16 -left-6 text-[160px] leading-none font-serif font-bold text-emerald-500/15 dark:text-emerald-500/20 select-none pointer-events-none">
                &ldquo;
              </span>
              <p className="text-2xl md:text-[28px] font-medium leading-relaxed text-foreground/90 relative z-10 pl-8 border-l-4 border-emerald-500/30 dark:border-emerald-500/40">
                {article.summary}
              </p>
            </div>
          )}
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
                .replace(/(?:^[ \t]*\|[^\n]*\|\n?){3,}/gm, (match: string) => {
                  const lines = match.trim().split('\n');
                  if (lines.length < 3 || !lines[1].includes('---')) return match;
                  const parseRow = (r: string) => r.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
                  const headers = parseRow(lines[0]);
                  const rows = lines.slice(2).map(parseRow);
                  let html = '<div class="overflow-x-auto my-10 border border-primary/20 rounded-2xl shadow-sm"><table class="w-full text-left text-sm md:text-base"><thead class="bg-primary/5 text-foreground border-b border-primary/20"><tr>';
                  headers.forEach((h: string) => html += `<th class="px-6 py-4 font-bold tracking-tight">${h}</th>`);
                  html += '</tr></thead><tbody class="divide-y divide-primary/10">';
                  rows.forEach((row: string[]) => {
                    html += '<tr class="hover:bg-primary/5 transition-colors">';
                    row.forEach((cell: string) => html += `<td class="px-6 py-4 text-foreground/90">${cell}</td>`);
                    html += '</tr>';
                  });
                  html += '</tbody></table></div>';
                  return html;
                })
                .replace(/!\[([^\]]*)\]\(((?:\([^)]*\)|[^)])*)\)/g, '<figure class="my-8"><img src="$2" alt="$1" class="w-full rounded-2xl shadow-xl object-cover border border-primary/10" /><figcaption class="text-center text-sm text-muted-foreground mt-3 px-4 italic">$1</figcaption></figure>')
                .replace(/\[([^\]]+)\]\(((?:\([^)]*\)|[^)])*)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline underline-offset-4">$1</a>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*([^\*]+)\*/g, '<em>$1</em>')
                .replace(/### (.*?)(?:\n|$)/g, '<h3 class="text-2xl font-bold mt-10 mb-4 tracking-tight flex items-center gap-3 text-foreground"><span class="w-1.5 h-6 bg-emerald-500 rounded-full inline-block"></span>$1</h3>')
                .replace(/## (.*?)(?:\n|$)/g, '<h2 class="text-3xl md:text-4xl font-extrabold mt-14 mb-6 tracking-tight text-emerald-600 dark:text-emerald-400 border-b border-emerald-500/20 pb-4">$1</h2>')
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
            <Button variant="default" className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600 shadow-none h-12 px-6 font-semibold transition-colors">
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
