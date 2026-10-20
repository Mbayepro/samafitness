import Skeleton from "./Skeleton";

export function SkeletonButton({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-10 w-32 rounded-full ${className}`} />;
}
