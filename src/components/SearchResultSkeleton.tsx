import { Skeleton } from "@/components/ui/skeleton";

export function SearchResultSkeleton() {
  return (
    <div className="bg-neutral-900 border border-neutral-800 overflow-hidden flex gap-4 p-4">
      {/* Cover Image */}
      <Skeleton className="w-24 h-36 flex-shrink-0 rounded-none" />

      <div className="flex-1 min-w-0 space-y-2">
        {/* Title */}
        <div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-1" />
        </div>

        {/* Badges */}
        <div className="flex gap-1">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
        </div>

        {/* Genre Tags */}
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-12" />
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-3">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-14" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

export function SearchResultsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => {
        const key = `search-skeleton-${i}`;
        return <SearchResultSkeleton key={key} />;
      })}
    </div>
  );
}
