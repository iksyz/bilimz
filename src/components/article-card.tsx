import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface ArticleCardProps {
  post: any;
  index: number;
}

export function ArticleCard({ post, index }: ArticleCardProps) {
  return (
    <Link href={`/article/${post.slug}`} className="block group">
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
  );
}
