"use client";

export default function ProfileHeroHeader({ fullName, avatarUrl, role, department, employeeId, status, employmentType }) {
  return (
    <div className="rounded-md border border-border bg-card p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden bg-slate-900 border border-border shrink-0 flex items-start justify-start">
            <img
              src={avatarUrl || "/placeholder.png"}
              alt={fullName || "Employee"}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/placeholder.png";
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-card" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                {fullName || "-"}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              {role || "-"} • {department || "-"}
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
          <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] font-mono text-foreground font-semibold bg-muted/60 px-2 py-0.5 rounded-md border border-border/50">
                {employeeId || "-"}
              </span>
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                {status || "-"}
              </span>
              <span className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-700">
                {employmentType || "-"}
              </span>
            </div>
        </div>
      </div>
    </div>
  );
}
