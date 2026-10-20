import type { HTMLAttributes } from "react";

export default function Skeleton({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-white/10 ${className}`}
      {...props}
    />
  );
}
