"use client";

export default function ProfileSectionCard({
  title,
  icon: Icon,
  tag,
  children,
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <h2 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          {title}
        </h2>
        {tag && (
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {tag}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
