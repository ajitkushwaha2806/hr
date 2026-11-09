"use client";
import React from "react";
import {
  XCircle,
  CalendarCheck2,
  Clock,
  Coffee,
  AlertTriangle,
  TrendingUp,
  Hourglass,
  Sun,
} from "lucide-react";

export function AttendanceSummaryCards({ stats = {}, isLoading = false }) {
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
    holidays = 0,
    weeklyOffs = 0,
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
    {
      title: "Weekends & Offs",
      value: `${weeklyOffs}d`,
      subtitle: `${holidays} Official Holiday${holidays === 1 ? "" : "s"}`,
      icon: Coffee,
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-50/80 dark:bg-zinc-900 border-border/60",
      iconBg: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-card border border-border/40 p-3.5 flex flex-col justify-between animate-pulse"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 bg-muted rounded" />
              <div className="size-7 rounded-lg bg-muted" />
            </div>
            <div>
              <div className="h-6 w-12 bg-muted rounded mb-1" />
              <div className="h-2.5 w-24 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`rounded-xl border p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-xs ${c.bg}`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <span className="text-[11px] font-medium text-muted-foreground truncate" title={c.title}>
                  {c.title}
                </span>
                <div className={`size-6 rounded-lg flex items-center justify-center shrink-0 ${c.iconBg}`}>
                  <Icon className="size-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-xl font-bold tracking-tight ${c.color}`}>{c.value}</span>
                  {c.pill && (
                    <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${c.pillColor}`}>
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
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/50 text-xs text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-semibold">
              Total Pay Loss Deductions: {totalPayLossDays} Day(s)
            </span>
            <span className="text-muted-foreground text-[11px]">
              ({lopDays}d Approved LOP [1x] + {unapprovedAbsentDays}d Unapproved Absence [2x Penalty = {unapprovedAbsentDays * 2}d])
            </span>
          </div>
          <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-rose-600 text-white tracking-wide uppercase">
            Double Pay Loss Policy Active
          </span>
        </div>
      )}

      {/* Special status alert banner if any missed checkouts or currently clocked in */}
      {(noPunchOut > 0 || inProgress > 0) && (
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex items-center gap-3">
            {inProgress > 0 && (
              <span className="font-medium">
                Active Session: Currently clocked in today.
              </span>
            )}
            {noPunchOut > 0 && (
              <span className="font-medium">
                Warning: {noPunchOut} day{noPunchOut > 1 ? "s" : ""} marked as &quot;Missed Punch Out&quot;.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
