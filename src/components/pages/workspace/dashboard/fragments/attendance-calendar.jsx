"use client";

import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/global/loader";
import {
  MONTH_NAMES,
  WEEKDAYS,
  resolveDayCategory,
  getDayCellStyles,
} from "./calendar-helpers";

export function AttendanceCalendar({
  year = 2026,
  month = 10,
  days = [],
  todayString = "2026-10-20",
  onNextMonth,
  onPrevMonth,
  onJumpToday,
  isLoading = false,
}) {
  const monthName = MONTH_NAMES[month - 1] || "Month";

  const firstDayOfMonth = new Date(year, month - 1, 1);
  const sundayBasedDay = firstDayOfMonth.getDay();
  const mondayBasedOffset = (sundayBasedDay + 6) % 7;

  const isCurrentMonthView = () => year === 2026 && month === 10;

  // Monthly summary metrics for glanceable mobile stats
  const presentCount = days.filter((d) => d.attendanceStatus === "PRESENT").length;
  const holidaysCount = days.filter((d) => d.type === "HOLIDAY").length;
  const weeklyOffCount = days.filter((d) => d.type === "WEEKLY_OFF").length;
  const leavesCount = days.filter(
    (d) => d.attendanceStatus === "CASUAL_LEAVE" || d.attendanceStatus === "HALF_DAY"
  ).length;

  return (
    <div className="rounded-md border border-border/80 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden transition-all">
      {/* Top Mobile-First Calendar Header */}
      <div className="p-4 sm:p-5 border-b border-border/50 bg-slate-50/50 dark:bg-zinc-900/80">
        <div className="flex items-center justify-between gap-2.5">
          {/* Left: Icon + Month Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 sm:size-11 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-2xs">
              <Calendar className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-lg sm:text-2xl font-black tracking-tight text-foreground truncate">
                  {monthName} {year}
                </h2>
                {year === 2027 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                    2027
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                Monthly Work Days &amp; Attendance
              </p>
            </div>
          </div>

          {/* Right: Modern Stepper Controls (Inline, thumb-friendly) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isCurrentMonthView() && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onJumpToday}
                className="h-8.5 px-2.5 rounded-md text-xs font-bold border-border/70 hover:bg-muted active:scale-95 cursor-pointer shadow-2xs"
              >
                Today
              </Button>
            )}

            <div className="inline-flex items-center rounded-md border border-border/70 bg-white dark:bg-zinc-800 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={onPrevMonth}
                disabled={year <= 2026 && month <= 10}
                className="size-8 rounded-md flex items-center justify-center text-foreground hover:bg-muted active:scale-90 transition-all disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-xs font-bold px-2 sm:px-2.5 min-w-[70px] sm:min-w-[85px] text-center text-foreground select-none">
                {monthName.slice(0, 3)} {year}
              </span>
              <button
                type="button"
                onClick={onNextMonth}
                disabled={year >= 2027 && month >= 12}
                className="size-8 rounded-md flex items-center justify-center text-foreground hover:bg-muted active:scale-90 transition-all disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Month Metrics Chips (Horizontal scroll on mobile) */}
        <div className="flex items-center gap-2 pt-3 overflow-x-auto no-scrollbar">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {presentCount} Present
          </span>

          {holidaysCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 shrink-0">
              <Sparkles className="size-3 text-purple-600 dark:text-purple-400" />
              {holidaysCount} Holiday{holidaysCount > 1 ? "s" : ""}
            </span>
          )}

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20 shrink-0">
            <Coffee className="size-3 opacity-60" />
            {weeklyOffCount} Off Days
          </span>

          {leavesCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 shrink-0">
              <span className="size-1.5 rounded-full bg-amber-500" />
              {leavesCount} Leave{leavesCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Weekday Column Headers (Desktop 7-column view) */}
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

      {/* Days Grid: 4 columns on mobile, 7 columns on desktop */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 shadow-md border border-border/60 text-xs font-semibold">
              <Spinner size="sm" className="text-primary" />
              <span>Loading calendar days...</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 sm:grid-cols-7 auto-rows-fr divide-x divide-y divide-border/30 border-b border-border/30">
          {/* Leading blank offset (Desktop 7-column view only) */}
          {Array.from({ length: mondayBasedOffset }).map((_, i) => (
            <div
              key={`blank-${i}`}
              className="hidden sm:block min-h-[80px] sm:min-h-[105px] p-2 bg-slate-50/20 dark:bg-zinc-950/20 opacity-30 select-none"
            />
          ))}

          {/* Actual days */}
          {days.map((dayItem) => {
            const category = resolveDayCategory(dayItem, todayString);
            const { cellClass, numberClass, isToday } = getDayCellStyles(category);
            const isHoliday = dayItem.type === "HOLIDAY";
            const isWeeklyOff = dayItem.type === "WEEKLY_OFF";
            const isWorkingDay = dayItem.type === "WORKING_DAY";
            const isPresent = dayItem.attendanceStatus === "PRESENT";
            const isAbsent = dayItem.attendanceStatus === "ABSENT";
            const isHalfDay = dayItem.attendanceStatus === "HALF_DAY";
            const isNotCheckedOut = dayItem.attendanceStatus === "NOT_CHECKED_OUT";
            const isCasualLeave = dayItem.attendanceStatus === "CASUAL_LEAVE";

            return (
              <div
                key={dayItem.dateString}
                className={`min-h-[85px] sm:min-h-[105px] p-2 sm:p-2.5 transition-all flex flex-col justify-between group relative select-none ${cellClass}`}
              >
                {/* Top row: Date Number + Weekday on mobile */}
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span
                      className={`size-6 sm:size-7 rounded-full flex items-center justify-center text-xs sm:text-sm transition-transform group-hover:scale-110 shrink-0 ${numberClass}`}
                    >
                      {dayItem.day}
                    </span>
                    {/* Weekday tag shown on mobile 4-column layout */}
                    <span className="sm:hidden text-[10px] font-bold text-muted-foreground/80 uppercase tracking-tight">
                      {dayItem.dayOfWeek}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {dayItem.isCustom && (
                      <span className="size-1.5 rounded-full bg-amber-500" title="Custom override by admin" />
                    )}
                    {isToday && (
                      <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                        Today
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badges */}
                <div className="space-y-1 mt-1">
                  {isPresent && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-xs font-bold truncate">
                      <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">Present</span>
                    </div>
                  )}

                  {isAbsent && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-[10px] sm:text-xs font-bold truncate">
                      <span className="size-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span className="truncate">Absent</span>
                    </div>
                  )}

                  {isHalfDay && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-[10px] sm:text-xs font-bold truncate">
                      <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="truncate">Half Day</span>
                    </div>
                  )}

                  {isNotCheckedOut && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-500/15 border border-orange-500/25 text-orange-700 dark:text-orange-300 text-[10px] sm:text-xs font-bold truncate">
                      <span className="size-1.5 rounded-full bg-orange-500 shrink-0" />
                      <span className="truncate">Not Checked Out</span>
                    </div>
                  )}

                  {isCasualLeave && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/25 text-sky-700 dark:text-sky-300 text-[10px] sm:text-xs font-bold truncate">
                      <span className="size-1.5 rounded-full bg-sky-500 shrink-0" />
                      <span className="truncate">Casual Leave</span>
                    </div>
                  )}

                  {isHoliday && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/25 text-purple-700 dark:text-purple-300 text-[10px] sm:text-xs font-bold truncate">
                      <Sparkles className="size-3 shrink-0 text-purple-600" />
                      <span className="truncate">{dayItem.title || "Holiday"}</span>
                    </div>
                  )}

                  {isWeeklyOff && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground text-[10px] sm:text-[11px] font-medium truncate">
                      <Coffee className="size-3 shrink-0 opacity-60" />
                      <span className="truncate">{dayItem.title || "Weekly Off"}</span>
                    </div>
                  )}

                  {isWorkingDay && !isPresent && !isAbsent && !isHalfDay && !isNotCheckedOut && !isCasualLeave && dayItem.isCustom && dayItem.title && dayItem.title !== "Working Day" && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-border/60 text-muted-foreground text-[10px] sm:text-[11px] font-medium truncate">
                      <span className="truncate">{dayItem.title}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend Footer */}
      <div className="p-3 sm:p-4 bg-slate-50/50 dark:bg-zinc-900/50 border-t border-border/40 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
            Legend:
          </span>

          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold shrink-0">
            <span className="size-2 rounded-full bg-emerald-500" />
            Present
          </span>

          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 text-[11px] font-semibold shrink-0">
            <span className="size-2 rounded-full bg-rose-500" />
            Absent
          </span>

          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-semibold shrink-0">
            <span className="size-2 rounded-full bg-amber-500" />
            Half Day
          </span>

          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 text-[11px] font-semibold shrink-0">
            <span className="size-2 rounded-full bg-sky-500" />
            Leave
          </span>

          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[11px] font-semibold shrink-0">
            <span className="size-2 rounded-full bg-purple-500" />
            Holiday
          </span>

          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-700 dark:text-slate-300 text-[11px] font-semibold shrink-0">
            <span className="size-2 rounded-full bg-slate-400" />
            Weekly Off
          </span>
        </div>
      </div>
    </div>
  );
}

export default AttendanceCalendar;