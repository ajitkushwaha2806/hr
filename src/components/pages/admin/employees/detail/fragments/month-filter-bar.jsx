"use client";
import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const AVAILABLE_YEARS = [2025, 2026, 2027];

export function MonthFilterBar({
  year,
  month,
  onYearChange,
  onMonthChange,
  onPrevMonth,
  onNextMonth,
  onJumpToCurrent,
  onRefresh,
  isRefreshing = false,
}) {
  const currentDate = new Date();
  const isCurrentMonth =
    year === currentDate.getFullYear() && month === currentDate.getMonth() + 1;

  return (
    <div className="p-3 bg-card border border-border/60 rounded-xl shadow-2xs space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
      {/* Current selection label & Controls */}
      <div className="flex items-center justify-between sm:justify-start gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <CalendarIcon className="size-4" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-sm text-foreground truncate">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            {isCurrentMonth ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 shrink-0">
                Current
              </span>
            ) : (
              <button
                onClick={onJumpToCurrent}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80 text-foreground border border-border/60 shrink-0 cursor-pointer"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Refresh button on mobile right top */}
        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="size-8 rounded-lg sm:hidden shrink-0"
            title="Refresh Attendance Data"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          </Button>
        )}
      </div>

      {/* Selectors and Arrow Navigation: Perfectly responsive row */}
      <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
        {/* Month Dropdown */}
        <Select
          value={String(month)}
          onValueChange={(val) => onMonthChange(parseInt(val, 10))}
        >
          <SelectTrigger className="h-8 text-xs flex-1 sm:w-[130px] rounded-lg bg-muted/30">
            <SelectValue placeholder="Month">
              {MONTH_NAMES[month - 1]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {MONTH_NAMES.map((name, idx) => (
              <SelectItem key={name} value={String(idx + 1)} className="text-xs">
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year Dropdown */}
        <Select
          value={String(year)}
          onValueChange={(val) => onYearChange(parseInt(val, 10))}
        >
          <SelectTrigger className="h-8 text-xs w-[80px] sm:w-[90px] rounded-lg bg-muted/30 shrink-0">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_YEARS.map((y) => (
              <SelectItem key={y} value={String(y)} className="text-xs">
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Prev / Next buttons */}
        <div className="flex items-center border border-border/60 rounded-lg overflow-hidden bg-background shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevMonth}
            className="size-8 rounded-none hover:bg-muted"
            title="Previous Month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="h-4 w-[1px] bg-border/60" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            className="size-8 rounded-none hover:bg-muted"
            title="Next Month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Desktop Jump to Today button */}
        {!isCurrentMonth && (
          <Button
            variant="outline"
            size="sm"
            onClick={onJumpToCurrent}
            className="h-8 text-xs px-2.5 rounded-lg hidden sm:flex shrink-0"
          >
            Today
          </Button>
        )}

        {/* Desktop Refresh button */}
        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="size-8 rounded-lg hidden sm:flex shrink-0"
            title="Refresh Attendance Data"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          </Button>
        )}
      </div>
    </div>
  );
}

