import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-16 md:px-8 max-w-7xl min-h-screen">
      {/* Header & Controls Skeleton */}
      <section className="mb-16 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 text-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-16 w-3/4 max-w-md rounded-2xl" />
          <Skeleton className="h-6 w-full max-w-lg rounded-full" />
          <Skeleton className="h-6 w-5/6 max-w-md rounded-full" />
        </div>
        <div className="pt-4 flex justify-center gap-4">
          <Skeleton className="h-12 w-full max-w-md rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </section>

      {/* Results Grid Skeleton */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      </section>
    </div>
  );
}
