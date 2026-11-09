"use client";
import React from "react";
import { ChevronLeft, ChevronRight, RotateCw, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

export function MonthPickerBar({
  year,
  month,
  onYearChange,
  onMonthChange,
  onPrevMonth,
  onNextMonth,
  onToday,
  onRefresh,
  isFetching = false,
}) {
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const currentMonthObj = MONTHS.find((m) => m.value === month) || MONTHS[0];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-border/80 rounded-md p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 transition-all">
      {/* Current Month & Year Heading */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-9 sm:size-10 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0 shadow-2xs">
          <Calendar className="size-4.5 sm:size-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
              {currentMonthObj.label} {year}
            </h2>
            {isCurrentMonth && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                Current
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            Company Calendar &amp; Schedule Management
          </p>
        </div>
      </div>

      {/* Selectors and Action Controls */}
      <div className="flex items-center flex-wrap sm:flex-nowrap gap-2">
        {/* Month Dropdown */}
        <div className="relative min-w-[125px]">
          <select
            value={month}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="w-full h-8.5 px-3 text-xs font-semibold rounded-md bg-background border border-border/80 text-foreground shadow-2xs hover:border-primary/50 focus:outline-hidden focus:ring-1 focus:ring-primary/40 transition-colors cursor-pointer"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year Dropdown */}
        <div className="relative min-w-[85px]">
          <select
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="w-full h-8.5 px-3 text-xs font-semibold rounded-md bg-background border border-border/80 text-foreground shadow-2xs hover:border-primary/50 focus:outline-hidden focus:ring-1 focus:ring-primary/40 transition-colors cursor-pointer"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Previous & Next Navigation */}
        <div className="inline-flex items-center rounded-md border border-border/80 bg-background p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={onPrevMonth}
            disabled={year <= 2025 && month <= 1}
            className="size-7.5 rounded-md flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Previous Month"
            aria-label="Previous Month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="w-px h-3.5 bg-border/60 mx-0.5" />
          <button
            type="button"
            onClick={onNextMonth}
            disabled={year >= 2030 && month >= 12}
            className="size-7.5 rounded-md flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Next Month"
            aria-label="Next Month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Jump to Today Button */}
        {!isCurrentMonth && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToday}
            className="h-8.5 px-3 rounded-md text-xs font-semibold border-border/80 hover:bg-muted active:scale-95 cursor-pointer shadow-2xs"
          >
            Today
          </Button>
        )}

        {/* Refresh Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isFetching}
          className="h-8.5 w-8.5 p-0 rounded-md border-border/80 hover:bg-muted active:scale-95 cursor-pointer shadow-2xs"
          title="Refresh Calendar"
        >
          <RotateCw className={`size-3.5 ${isFetching ? "animate-spin text-primary" : "text-foreground"}`} />
        </Button>
      </div>
    </div>
  );
}

