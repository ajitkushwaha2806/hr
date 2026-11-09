"use client";
import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12

  const pastDate = new Date(currentYear, currentMonth - 2, 1);
  const pastYear = pastDate.getFullYear();
  const pastMonth = pastDate.getMonth() + 1; // 1-12

  const isCurrentMonth = year === currentYear && month === currentMonth;
  const isPastMonth = year === pastYear && month === pastMonth;

  // Only past month and current month are allowed
  const ALLOWED_OPTIONS = [
    {
      year: currentYear,
      month: currentMonth,
      key: `${currentYear}-${currentMonth}`,
      label: `${MONTH_NAMES[currentMonth - 1]} ${currentYear}`,
      badge: "Current",
    },
    {
      year: pastYear,
      month: pastMonth,
      key: `${pastYear}-${pastMonth}`,
      label: `${MONTH_NAMES[pastMonth - 1]} ${pastYear}`,
      badge: "Past Month",
    },
  ];

  const handleSelectChange = (val) => {
    const [selectedYear, selectedMonth] = val.split("-").map(Number);
    if (onYearChange && selectedYear !== year) onYearChange(selectedYear);
    if (onMonthChange && selectedMonth !== month) onMonthChange(selectedMonth);
  };

  return (
    <div className="p-3 bg-card border border-border/60 rounded-md shadow-2xs space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
      {/* Current selection label & Controls */}
      <div className="flex items-center justify-between sm:justify-start gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
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
            className="size-8 rounded-md sm:hidden shrink-0"
            title="Refresh Attendance Data"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          </Button>
        )}
      </div>

      {/* Selectors and Arrow Navigation: Perfectly responsive row */}
      <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
        {/* Month Dropdown: restricted exclusively to Current Month and Past Month */}
        <Select
          value={`${year}-${month}`}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger className="h-8 text-xs flex-1 sm:w-[170px] rounded-md bg-muted/30">
            <SelectValue placeholder="Select Month">
              {MONTH_NAMES[month - 1]} {year}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ALLOWED_OPTIONS.map((opt) => (
              <SelectItem key={opt.key} value={opt.key} className="text-xs">
                <span className="font-medium">{opt.label}</span>
                <span className="text-[10px] text-muted-foreground ml-1.5 opacity-80">({opt.badge})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Prev / Next buttons: strictly restricted between Past Month and Current Month */}
        <div className="flex items-center border border-border/60 rounded-md overflow-hidden bg-background shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevMonth}
            disabled={isPastMonth}
            className="size-8 rounded-none hover:bg-muted disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title={isPastMonth ? "Past month is the earliest allowed" : "Previous Month"}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="h-4 w-[1px] bg-border/60" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            disabled={isCurrentMonth}
            className="size-8 rounded-none hover:bg-muted disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title={isCurrentMonth ? "Cannot view future months" : "Next Month"}
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
            className="h-8 text-xs px-2.5 rounded-md hidden sm:flex shrink-0"
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
            className="size-8 rounded-md hidden sm:flex shrink-0"
            title="Refresh Attendance Data"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          </Button>
        )}
      </div>
    </div>
  );
}
