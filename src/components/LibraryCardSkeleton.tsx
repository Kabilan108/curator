import { Skeleton } from "@/components/ui/skeleton";

export function LibraryCardSkeleton() {
  return (
    <div className="bg-neutral-900 overflow-hidden border border-neutral-800">
      {/* Cover Image Skeleton */}
      <Skeleton className="aspect-[2/3] w-full rounded-none" />

      {/* Card Content */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />

        {/* Status Badge */}
        <Skeleton className="h-4 w-16" />

        {/* Genre Tags */}
        <div className="flex gap-1">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-14" />
        </div>

        {/* Comparison Count */}
        <Skeleton className="h-3 w-20 mt-1" />
      </div>
    </div>
  );
}

export function LibraryGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => {
        const key = `skeleton-${i}`;
        return <LibraryCardSkeleton key={key} />;
      })}
    </div>
  );
}
