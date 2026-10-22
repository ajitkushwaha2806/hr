"use client";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function AttendanceHeader({ onRefresh, isLoading = false }) {
  return (
    <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/40">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
        Attendance Logs
      </h1>

      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        disabled={isLoading}
        className="size-8.5 rounded-lg text-xs font-semibold cursor-pointer border-border/80 hover:bg-accent shrink-0 shadow-2xs"
        title="Refresh attendance logs"
      >
        <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
      </Button>
    </div>
  );
}
