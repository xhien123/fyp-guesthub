import React from "react";

export const SkeletonBlock: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-neutral-200 rounded ${className ?? "h-5 w-24"}`} />
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 6,
  cols = 5,
}) => {
  return (
    <div className="rounded-2xl border overflow-hidden bg-white shadow-sm">
      <div className="bg-neutral-50 h-10" />
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="grid grid-cols-12 gap-2 p-3">
            {Array.from({ length: cols }).map((__, c) => (
              <SkeletonBlock key={c} className="h-5 w-full col-span-3" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
