import Skeleton from "./Skeleton";

export function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#121212] p-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-10 w-20" />
      <Skeleton className="mt-6 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-4/5" />
    </div>
  );
}
