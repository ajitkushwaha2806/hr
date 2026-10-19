export default function HomePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">HR Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome to your HR Management Platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-border/60 bg-white dark:bg-zinc-900 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Employees</span>
          <p className="text-2xl font-bold mt-2 text-foreground">0</p>
        </div>
        <div className="p-5 rounded-xl border border-border/60 bg-white dark:bg-zinc-900 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Present Today</span>
          <p className="text-2xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">0</p>
        </div>
        <div className="p-5 rounded-xl border border-border/60 bg-white dark:bg-zinc-900 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">On Leave</span>
          <p className="text-2xl font-bold mt-2 text-amber-600 dark:text-amber-400">0</p>
        </div>
        <div className="p-5 rounded-xl border border-border/60 bg-white dark:bg-zinc-900 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Departments</span>
          <p className="text-2xl font-bold mt-2 text-foreground">0</p>
        </div>
      </div>
    </div>
  );
}