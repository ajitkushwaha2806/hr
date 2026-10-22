"use client";
import { Button } from "@/components/ui/button";
import { CalendarLegend } from "./calendar-legend";
import { Skeleton } from "@/components/ui/skeleton";
import { CALENDAR_LEGENDS } from "../helpers/constants";
import { MONTH_NAMES, WEEKDAYS, resolveDayCategory, getDayCellStyles, getStatusBadge } from "./calendar-helpers";
import { ChevronLeft, ChevronRight, Calendar, Sparkles, Coffee, CheckCircle2, CalendarDays, Briefcase } from "lucide-react";

export function AttendanceCalendar({
  year = 2026,
  month = 10,
  days = [],
  todayString = "2026-10-20",
  onNextMonth,
  onPrevMonth,
  onJumpToday,
  isLoading = false,
  isFetching = false,
  legends = CALENDAR_LEGENDS,
}) {
  const monthName = MONTH_NAMES[month - 1] || "Month";

  const firstDayOfMonth = new Date(year, month - 1, 1);
  const sundayBasedDay = firstDayOfMonth.getDay();
  const mondayBasedOffset = (sundayBasedDay + 6) % 7;
  const totalCells = mondayBasedOffset + days.length;
  const trailingBlanks = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  const isCurrentMonthView = () => year === 2026 && month === 10;
  const presentCount = days.filter((d) => d.attendanceStatus === "PRESENT").length;
  const holidaysCount = days.filter((d) => d.type === "HOLIDAY").length;
  const weeklyOffCount = days.filter((d) => d.type === "WEEKLY_OFF").length;
  const workingDaysCount = days.filter((d) => d.type === "WORKING_DAY").length || days.length;
  const leavesCount = days.filter(
    (d) => d.attendanceStatus === "CASUAL_LEAVE" || d.attendanceStatus === "HALF_DAY"
  ).length;

  return (
    <div className="rounded-md border border-border/80 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden transition-all">
      <div className="p-4 sm:p-5 border-b border-border/50 bg-slate-50/50 dark:bg-zinc-900/80">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 sm:size-10 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-2xs">
              <Calendar className="size-4.5 sm:size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                  {monthName} {year}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Monthly Work Days &amp; Attendance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {!isCurrentMonthView() && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onJumpToday}
                className="h-8 px-2.5 rounded-md text-xs font-semibold border-border/70 hover:bg-muted active:scale-95 cursor-pointer shadow-2xs"
              >
                Today
              </Button>
            )}

            <div className="inline-flex items-center rounded-lg border border-border/70 bg-background p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={onPrevMonth}
                disabled={year <= 2026 && month <= 10}
                className="size-7 sm:size-8 rounded-md flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div className="w-px h-3.5 bg-border/60 mx-0.5" />
              <button
                type="button"
                onClick={onNextMonth}
                disabled={year >= 2027 && month >= 12}
                className="size-7 sm:size-8 rounded-md flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                title="Next Month"
                aria-label="Next Month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {isLoading && days.length === 0 ? (
          <div className="flex items-center gap-2 pt-3">
            <Skeleton className="h-6 w-20 rounded-sm" />
            <Skeleton className="h-6 w-24 rounded-sm" />
            <Skeleton className="h-6 w-24 rounded-sm" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2 pt-3 overflow-x-auto no-scrollbar pb-0.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shrink-0 whitespace-nowrap">
              <CheckCircle2 className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{presentCount} Present</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 shrink-0 whitespace-nowrap">
              <Briefcase className="size-3 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>{workingDaysCount} Working Days</span>
            </span>

            {holidaysCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 shrink-0 whitespace-nowrap">
                <Sparkles className="size-3 shrink-0 text-purple-600 dark:text-purple-400" />
                <span>{holidaysCount} Holiday{holidaysCount > 1 ? "s" : ""}</span>
              </span>
            )}

            {weeklyOffCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold bg-slate-500/10 text-slate-700 dark:text-slate-300 shrink-0 whitespace-nowrap">
                <Coffee className="size-3 shrink-0 text-slate-500 dark:text-slate-400" />
                <span>{weeklyOffCount} {weeklyOffCount === 1 ? "Weekly Off" : "Weekly Offs"}</span>
              </span>
            )}

            {leavesCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 shrink-0 whitespace-nowrap">
                <CalendarDays className="size-3 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>{leavesCount} Leave{leavesCount > 1 ? "s" : ""}</span>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="hidden sm:grid grid-cols-7 border-b border-border/40 bg-muted/20 text-center">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            {wd}
          </div>
        ))}
      </div>

      <div className={`relative min-h-[420px] sm:min-h-[500px] transition-opacity duration-200 ${isFetching ? "opacity-75" : "opacity-100"}`}>
        {(isLoading || isFetching) && days.length > 0 && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/30 overflow-hidden z-20">
            <div className="h-full bg-primary animate-pulse w-full" />
          </div>
        )}

        {isLoading && days.length === 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-7 auto-rows-fr divide-x divide-y divide-border/30 border-b border-border/30">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={`calendar-cell-skeleton-${i}`}
                className="min-h-[85px] sm:min-h-[105px] p-2 sm:p-2.5 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="size-6 sm:size-7 rounded-full" />
                    <Skeleton className="sm:hidden h-2.5 w-6 rounded" />
                  </div>
                </div>
                <div className="mt-auto pt-2 space-y-1">
                  {i % 4 === 1 && <Skeleton className="h-4.5 w-16 rounded-sm" />}
                  {i % 7 === 5 && <Skeleton className="h-4.5 w-20 rounded-sm" />}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-7 auto-rows-fr divide-x divide-y divide-border/30 border-b border-border/30">
            {Array.from({ length: mondayBasedOffset }).map((_, i) => (
              <div
                key={`blank-${i}`}
                className="hidden sm:block min-h-[80px] sm:min-h-[105px] p-2 bg-slate-50/20 dark:bg-zinc-950/20 opacity-30 select-none"
              />
            ))}

          {days.map((dayItem) => {
            const category = resolveDayCategory(dayItem, todayString);
            const { cellClass, numberClass } = getDayCellStyles(category);

            return (
              <div
                key={dayItem.dateString}
                className={`min-h-[85px] sm:min-h-[105px] p-2 sm:p-2.5 transition-all flex flex-col justify-between group relative select-none ${cellClass}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span
                      className={`size-6 sm:size-7 rounded-full flex items-center justify-center text-xs sm:text-sm transition-transform group-hover:scale-110 shrink-0 ${numberClass}`}
                    >
                      {dayItem.day}
                    </span>
                    <span className="sm:hidden text-[10px] font-bold text-muted-foreground/80 uppercase tracking-tight">
                      {dayItem.dayOfWeek}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {dayItem.isCustom && (
                      <span className="size-1.5 rounded-full bg-amber-500" title="Custom override by admin" />
                    )}
                  </div>
                </div>

                <div className="space-y-1 mt-1">
                  {getStatusBadge(dayItem)}
                </div>
              </div>
            );
          })}

            {Array.from({ length: trailingBlanks }).map((_, i) => (
              <div
                key={`trailing-blank-${i}`}
                className="hidden sm:block min-h-[80px] sm:min-h-[105px] p-2 bg-slate-50/20 dark:bg-zinc-950/20 opacity-30 select-none"
              />
            ))}
        </div>
      )}
      </div>

      <CalendarLegend legends={legends} />
    </div>
  );
}

export default AttendanceCalendar;