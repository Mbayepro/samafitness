import Skeleton from "./Skeleton";

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="my-8 overflow-hidden rounded-3xl border border-white/10 bg-[#121212]" role="status" aria-label="Chargement">
      <div className="space-y-3 p-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
