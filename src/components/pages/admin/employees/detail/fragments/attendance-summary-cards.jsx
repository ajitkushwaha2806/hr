"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  XCircle,
  CalendarCheck2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Hourglass,
  Sun,
} from "lucide-react";

export function AttendanceSummaryCards({ stats = {}, isLoading = false }) {
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);

  const {
    totalWorkingDays = 0,
    fullDaysPresent = 0,
    halfDaysPresent = 0,
    effectivePresentDays = 0,
    fullDayLeaves = 0,
    halfDayLeaves = 0,
    onLeave = 0,
    casualLeaves = {},
    approvedLopLeaves = {},
    totalPayLossDays = 0,
    unapprovedAbsentDays = 0,
    absent = 0,
    noPunchOut = 0,
    inProgress = 0,
    attendancePercentage = 0,
    totalHoursWorked = 0,
    avgHoursPerDay = 0,
  } = stats || {};

  const casualDays = Number(casualLeaves?.totalDays || 0);
  const lopDays = Number(approvedLopLeaves?.totalDays || 0);

  const cards = [
    {
      title: "Attendance Rate",
      value: `${attendancePercentage}%`,
      subtitle: `${effectivePresentDays} effective days of ${totalWorkingDays} working days`,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      progress: attendancePercentage,
      progressColor: "bg-emerald-500",
    },
    {
      title: "Full Day Present",
      value: `${fullDaysPresent}d`,
      subtitle: "Standard shifts (8+ hours worked)",
      icon: Sun,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40",
      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      pill: "Full Day (1.0)",
      pillColor: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300",
    },
    {
      title: "Half Day Present",
      value: `${halfDaysPresent}d`,
      subtitle:
        halfDaysPresent > 0
          ? `${halfDaysPresent} day(s) with 3h-8h worked or no punch-out`
          : "3h-8h worked, or missed punch-out",
      icon: Hourglass,
      color: halfDaysPresent > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
      bg: halfDaysPresent > 0
        ? "bg-amber-50/70 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/40"
        : "bg-card border-border/60",
      iconBg: halfDaysPresent > 0 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground",
      pill: "Half Day (0.5)",
      pillColor: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
    },
    {
      title: "Approved Leaves",
      value: `${onLeave}d`,
      subtitle: `${casualDays}d Casual · ${lopDays}d LOP (${fullDayLeaves}F / ${halfDayLeaves}H)`,
      icon: CalendarCheck2,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-50/70 dark:bg-sky-950/20 border-sky-200/60 dark:border-sky-800/40",
      iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    {
      title: "Unapproved Absent",
      value: `${absent}d`,
      subtitle: absent === 0 ? "Zero absences recorded!" : `2x Penalty: -${absent * 2}d Pay Loss`,
      icon: XCircle,
      color: absent > 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground",
      bg: absent > 0
        ? "bg-rose-50/70 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-800/40"
        : "bg-card border-border/60",
      iconBg: absent > 0 ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-muted text-muted-foreground",
      pill: absent > 0 ? "2x Pay Loss" : null,
      pillColor: "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300",
    },
    {
      title: "Total Hours Logged",
      value: `${totalHoursWorked}h`,
      subtitle: `Avg. ${avgHoursPerDay} hrs / active day`,
      icon: Clock,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-800/40",
      iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-md bg-card border border-border/40 p-3.5 flex flex-col justify-between animate-pulse"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 bg-muted rounded-md" />
              <div className="size-7 rounded-md bg-muted" />
            </div>
            <div>
              <div className="h-6 w-12 bg-muted rounded-md mb-1" />
              <div className="h-2.5 w-24 bg-muted rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Cards Grid: Exactly 6 data cards in a symmetrical 2-col (mobile) / 3-col (tablet) / 6-col (desktop) layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`rounded-md border p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-xs ${c.bg}`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <span className="text-[11px] font-medium text-muted-foreground truncate" title={c.title}>
                  {c.title}
                </span>
                <div className={`size-6 rounded-md flex items-center justify-center shrink-0 ${c.iconBg}`}>
                  <Icon className="size-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-xl font-bold tracking-tight ${c.color}`}>{c.value}</span>
                  {c.pill && (
                    <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-md ${c.pillColor}`}>
                      {c.pill}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5" title={c.subtitle}>
                  {c.subtitle}
                </p>

                {c.progress !== undefined && (
                  <div className="w-full bg-muted/60 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${c.progressColor}`}
                      style={{ width: `${Math.min(100, Math.max(0, c.progress))}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pay Loss Deductions Banner (Approved LOP + 2x Unapproved Absences) */}
      {totalPayLossDays > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-md bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300">
          <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
            <AlertTriangle className="size-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5 sm:mt-0" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <span className="font-bold text-xs sm:text-sm text-rose-900 dark:text-rose-200 shrink-0">
                Total Pay Loss Deductions: {totalPayLossDays} Day{totalPayLossDays === 1 ? "" : "s"}
              </span>

              {/* Breakdown with truncate and view more toggle */}
              <div className="text-[11px] text-muted-foreground min-w-0 flex-1">
                <span className={cn("inline text-rose-700/80 dark:text-rose-300/70", !isBreakdownExpanded && "line-clamp-1 sm:line-clamp-none")}>
                  ({lopDays}d Approved LOP [1x] + {unapprovedAbsentDays}d Unapproved Absence [2x Penalty = {unapprovedAbsentDays * 2}d])
                </span>
                <button
                  type="button"
                  onClick={() => setIsBreakdownExpanded((prev) => !prev)}
                  className="sm:hidden ml-1 font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer inline-block"
                >
                  {isBreakdownExpanded ? "view less" : "view more..."}
                </button>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center self-start sm:self-auto">
            <span className="font-bold text-[9.5px] px-2 py-0.5 rounded-md bg-rose-600 text-white tracking-wide uppercase shadow-2xs">
              Double Pay Loss Policy Active
            </span>
          </div>
        </div>
      )}

      {/* Special status alert banner if any missed checkouts or currently clocked in */}
      {(noPunchOut > 0 || inProgress > 0) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-md bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {inProgress > 0 && (
              <span className="font-medium text-amber-900 dark:text-amber-200">
                Active Session: Currently clocked in today.
              </span>
            )}
            {noPunchOut > 0 && (
              <span className="font-medium text-amber-900 dark:text-amber-200">
                Warning: {noPunchOut} day{noPunchOut > 1 ? "s" : ""} marked as &quot;Missed Punch Out&quot;.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
