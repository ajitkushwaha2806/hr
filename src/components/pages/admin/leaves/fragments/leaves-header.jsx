"use client";

import { Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LeavesHeader({
  pendingCount = 0,
  onRefresh,
  isLoading = false,
}) {
  return (
    <div className="flex items-center justify-between gap-2.5 pb-2 border-b border-border/40">
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground truncate">
          Leave Records
        </h1>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/25 whitespace-nowrap">
            <Clock className="size-3" /> {pendingCount} Pending
          </span>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        disabled={isLoading}
        className="size-8 rounded-lg text-xs font-semibold cursor-pointer border-border hover:bg-accent shrink-0"
        title="Refresh leave records"
      >
        <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
      </Button>
    </div>
  );
}
