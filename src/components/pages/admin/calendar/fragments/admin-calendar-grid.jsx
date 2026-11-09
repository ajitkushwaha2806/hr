"use client";
import React from "react";
import { Sparkles, Coffee, Edit3 } from "lucide-react";
import { getTodayDateString } from "@/lib/utils";

const WEEKDAYS = [
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
  { short: "Sun", full: "Sunday" },
];

export function AdminCalendarGrid({
  year,
  month,
  days = [],
  todayString,
  onSelectDay,
  isLoading = false,
}) {
  const currentTodayString = todayString || getTodayDateString("Asia/Kolkata");

  // Calculate first day weekday offset (Monday-based: Mon=0, ..., Sun=6)
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const sundayBasedDay = firstDayOfMonth.getDay(); // Sun=0, Mon=1, ..., Sat=6
  const mondayBasedOffset = (sundayBasedDay + 6) % 7;

  const totalCells = mondayBasedOffset + days.length;
  const trailingBlanks = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-md border border-border/80 shadow-2xs overflow-hidden transition-all">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border/70 bg-slate-50/80 dark:bg-zinc-950/50">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd.short}
            className="py-2.5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider"
          >
            <span className="sm:hidden">{wd.short[0]}</span>
            <span className="hidden sm:inline md:hidden">{wd.short}</span>
            <span className="hidden md:inline">{wd.full}</span>
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="p-2 sm:p-3 bg-muted/10">
        {isLoading && days.length === 0 ? (
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={`calendar-skeleton-${i}`}
                className="min-h-[90px] sm:min-h-[115px] rounded-md border border-border/40 bg-muted/20 p-2 sm:p-3 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
            {/* Blank cells before start of month */}
            {Array.from({ length: mondayBasedOffset }).map((_, i) => (
              <div
                key={`offset-${i}`}
                className="hidden sm:block min-h-[90px] sm:min-h-[115px] rounded-md border border-dashed border-border/30 bg-slate-50/30 dark:bg-zinc-950/20 opacity-30 select-none"
              />
            ))}

            {/* Actual day cells */}
            {days.map((dayItem) => {
              const isToday = dayItem.dateString === currentTodayString;
              const isHoliday = dayItem.type === "HOLIDAY";
              const isWeeklyOff = dayItem.type === "WEEKLY_OFF";

              return (
                <div
                  key={dayItem.dateString}
                  onClick={() => onSelectDay(dayItem)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectDay(dayItem);
                    }
                  }}
                  className={`min-h-[95px] sm:min-h-[115px] rounded-md border p-2 sm:p-3 transition-all flex flex-col justify-between group relative cursor-pointer select-none ${
                    isToday
                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs ring-1 ring-primary/40"
                      : isHoliday
                      ? "border-emerald-200/90 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/15 hover:border-emerald-400 hover:shadow-xs"
                      : isWeeklyOff
                      ? "border-amber-200/90 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/15 hover:border-amber-400 hover:shadow-xs"
                      : "border-purple-200/80 dark:border-purple-900/40 bg-white dark:bg-zinc-900 hover:border-purple-400 hover:shadow-xs"
                  }`}
                >
                  {/* Top Bar: Day Number and Type Badge */}
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-base sm:text-lg font-bold transition-transform group-hover:scale-110 leading-none ${
                          isToday
                            ? "size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold shadow-2xs"
                            : isHoliday
                            ? "text-emerald-700 dark:text-emerald-300 font-extrabold"
                            : isWeeklyOff
                            ? "text-amber-700 dark:text-amber-300 font-bold"
                            : "text-foreground font-bold"
                        }`}
                      >
                        {dayItem.day}
                      </span>
                    </div>

                    {/* Day Type Badge - Exact look from screenshot */}
                    <div className="shrink-0 flex items-center">
                      {isHoliday ? (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                          <Sparkles className="size-2.5 sm:size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[85px] sm:max-w-[110px]">
                            {dayItem.title || "Holiday"}
                          </span>
                        </span>
                      ) : isWeeklyOff ? (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                          <Coffee className="size-2.5 sm:size-3 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="truncate max-w-[85px] sm:max-w-[110px]">
                            {dayItem.title || "Weekly Off"}
                          </span>
                        </span>
                      ) : (
                        <span className="hidden sm:inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
                          <span className="truncate max-w-[85px] sm:max-w-[110px]">
                            {dayItem.title || "Working Day"}
                          </span>
                        </span>
                      )}

                      {/* Compact mobile dot/badge */}
                      <span
                        className={`sm:hidden size-2.5 rounded-full ${
                          isHoliday
                            ? "bg-emerald-500"
                            : isWeeklyOff
                            ? "bg-amber-500"
                            : "bg-purple-500"
                        }`}
                        title={dayItem.title || dayItem.type}
                      />
                    </div>
                  </div>

                  {/* Body Content / Custom Labels / Title */}
                  <div className="mt-2 space-y-1">
                    {/* On mobile: compact text */}
                    <div className="sm:hidden text-[10px] font-semibold truncate leading-tight text-muted-foreground">
                      {isHoliday
                        ? dayItem.title || "Holiday"
                        : isWeeklyOff
                        ? dayItem.title || "Off"
                        : dayItem.title || "Work"}
                    </div>

                    {/* Desktop custom title description */}
                    {dayItem.description && (
                      <p className="hidden md:block text-[10.5px] text-muted-foreground/80 line-clamp-1">
                        {dayItem.description}
                      </p>
                    )}

                    {/* Custom Override indicator */}
                    {dayItem.isCustom && (
                      <div className="inline-flex items-center gap-1 text-[9.5px] font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                        <span>Modified</span>
                      </div>
                    )}
                  </div>

                  {/* Hover indicator on desktop */}
                  <div className="hidden group-hover:flex items-center justify-end text-[10px] font-semibold text-primary pt-1 mt-auto">
                    <span className="flex items-center gap-0.5 opacity-90">
                      <Edit3 className="size-2.5" />
                      Edit
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Trailing blanks */}
            {Array.from({ length: trailingBlanks }).map((_, i) => (
              <div
                key={`trailing-offset-${i}`}
                className="hidden sm:block min-h-[90px] sm:min-h-[115px] rounded-md border border-dashed border-border/30 bg-slate-50/30 dark:bg-zinc-950/20 opacity-30 select-none"
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="p-3 bg-slate-50/60 dark:bg-zinc-950/40 border-t border-border/70 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center flex-wrap gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-purple-500" />
            <span className="font-medium text-foreground">Working Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-emerald-500" />
            <span className="font-medium text-foreground">Official Holiday</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-amber-500" />
            <span className="font-medium text-foreground">Weekly Off</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-600 ring-2 ring-amber-300" />
            <span>Admin Modified</span>
          </div>
        </div>

        <div className="text-[11px] font-medium text-muted-foreground">
          Tip: Click on any day cell to manually mark or adjust its status
        </div>
      </div>
    </div>
  );
}
