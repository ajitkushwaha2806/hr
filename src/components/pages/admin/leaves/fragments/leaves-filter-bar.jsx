"use client";
import { Search } from "lucide-react";
import { STATUS_TABS } from "../constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LeavesFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  stats = { total: 0, pending: 0, approved: 0, rejected: 0 },
}) {
  const getTabCount = (key) => {
    if (key === "all") return stats.total;
    if (key === "pending") return stats.pending;
    if (key === "approved") return stats.approved;
    if (key === "rejected") return stats.rejected;
    return 0;
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 bg-card border border-border/70 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-xs">
      <div className="relative w-full sm:w-80">
        <Search className="size-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Search by name, department, leave..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 pr-7 h-8.5 sm:h-9 text-xs rounded-lg bg-background"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-1"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-0.5 sm:gap-1.5 p-0.5 sm:p-0 rounded-lg sm:rounded-xl bg-muted/60 sm:bg-transparent border border-border/50 sm:border-none">
        {STATUS_TABS.map((tab) => {
          const count = getTabCount(tab.key);
          const isActive = statusFilter === tab.key;

          let colorClass = "";
          if (tab.highlight === "amber") colorClass = "text-amber-600 dark:text-amber-400";
          if (tab.highlight === "emerald") colorClass = "text-emerald-600 dark:text-emerald-400";
          if (tab.highlight === "rose") colorClass = "text-rose-600 dark:text-rose-400";

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusFilterChange(tab.key)}
              className={`py-1 sm:py-1.5 px-0.5 sm:px-3 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-semibold transition-all text-center flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer sm:h-8 ${
                isActive
                  ? "bg-card text-foreground shadow-2xs border border-border/60"
                  : `text-muted-foreground hover:text-foreground ${colorClass}`
              }`}
            >
              <span className="truncate">{tab.label}</span>
              <span className="text-[9.5px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full bg-muted font-bold shrink-0">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
