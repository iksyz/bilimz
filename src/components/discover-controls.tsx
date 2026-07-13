"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const CATEGORIES = [
  "All",
  "Bio-Tech",
  "Cosmos",
  "Life-Science",
  "Deep-Dive"
];

export function DiscoverControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get("category") || "All";
  const currentQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(currentQuery);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  const updateFilters = (newCategory: string, newQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newCategory && newCategory !== "All") {
      params.set("category", newCategory);
    } else {
      params.delete("category");
    }

    if (newQuery.trim()) {
      params.set("q", newQuery.trim());
    } else {
      params.delete("q");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(currentCategory, query);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto w-full group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search className="h-5 w-5" />
        </div>
        <Input
          type="search"
          placeholder="Search discoveries, theories, and articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-4 py-6 h-14 rounded-2xl border-border/60 bg-muted/20 text-base shadow-sm focus-visible:ring-1 focus-visible:ring-primary/50 transition-all placeholder:text-muted-foreground/60 w-full"
        />
        <Button 
          type="submit" 
          disabled={isPending}
          className="absolute right-2 top-2 bottom-2 rounded-xl h-10 px-6 font-semibold"
        >
          Search
        </Button>
      </form>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {CATEGORIES.map((category) => {
          const isActive = currentCategory === category;
          return (
            <button
              key={category}
              onClick={() => updateFilters(category, query)}
              disabled={isPending}
              className={`
                px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
                ${isActive 
                  ? "bg-primary text-primary-foreground shadow-md scale-105" 
                  : "bg-muted/50 text-foreground/80 hover:bg-muted hover:text-foreground border border-border/40 hover:border-border"
                }
              `}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
