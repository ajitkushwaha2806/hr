"use client";
import { Skeleton } from "@/components/ui/skeleton";

export default function LeavesSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-border bg-card/60 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="size-7 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-xl border border-border bg-card/60 shadow-xs flex items-center justify-between">
        <Skeleton className="h-9 w-72 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border/60">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="divide-y divide-border/40 p-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-18 rounded-full" />
              <div className="flex gap-1.5">
                <Skeleton className="h-7 w-16 rounded-md" />
                <Skeleton className="h-7 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
