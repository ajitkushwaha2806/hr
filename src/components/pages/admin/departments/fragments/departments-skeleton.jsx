"use client";

export default function DepartmentsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="p-5 rounded-2xl border border-border/60 bg-card shadow-2xs space-y-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-muted" />
              <div className="space-y-1.5">
                <div className="w-28 h-4 rounded bg-muted" />
                <div className="w-16 h-3 rounded bg-muted" />
              </div>
            </div>
            <div className="w-16 h-6 rounded-lg bg-muted" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="w-20 h-3 rounded bg-muted" />
            <div className="flex flex-wrap gap-1.5">
              <div className="w-24 h-5 rounded-md bg-muted" />
              <div className="w-20 h-5 rounded-md bg-muted" />
              <div className="w-28 h-5 rounded-md bg-muted" />
            </div>
          </div>
          <div className="pt-3 border-t border-border/40 flex justify-between">
            <div className="w-16 h-4 rounded bg-muted" />
            <div className="w-20 h-4 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
