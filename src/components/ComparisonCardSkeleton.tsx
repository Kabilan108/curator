import { Skeleton } from "@/components/ui/skeleton";

export function ComparisonCardSkeleton() {
  return (
    <div className="bg-neutral-900 border-2 border-neutral-800 overflow-hidden">
      {/* Banner area */}
      <Skeleton className="aspect-video w-full rounded-none" />

      <div className="p-6 space-y-4">
        {/* Cover + Title */}
        <div className="flex gap-4">
          <Skeleton className="w-20 h-28 flex-shrink-0 rounded-none" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-5 w-14" />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-8 ml-auto" />
          </div>
        </div>

        {/* Genre tags */}
        <div className="flex gap-1">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    </div>
  );
}

export function ComparisonPairSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ComparisonCardSkeleton />
      <ComparisonCardSkeleton />
    </div>
  );
}
