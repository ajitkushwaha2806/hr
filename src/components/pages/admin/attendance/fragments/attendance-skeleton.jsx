"use client";

export default function AttendanceSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-14 bg-muted/40 rounded-xl border border-border/40" />

      <div className="bg-white dark:bg-zinc-900 border border-border/60 rounded-xl overflow-hidden shadow-xs">
        <div className="h-10 bg-muted/30 border-b border-border/60" />
        <div className="divide-y divide-border/40">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-muted/70" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-28 bg-muted/70 rounded" />
                  <div className="h-2.5 w-36 bg-muted/50 rounded" />
                </div>
              </div>
              <div className="h-3 w-20 bg-muted/60 rounded hidden sm:block" />
              <div className="h-3 w-16 bg-muted/60 rounded" />
              <div className="h-3 w-16 bg-muted/60 rounded" />
              <div className="h-3 w-12 bg-muted/60 rounded hidden md:block" />
              <div className="h-5 w-24 bg-muted/60 rounded-full" />
              <div className="size-7 bg-muted/60 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
