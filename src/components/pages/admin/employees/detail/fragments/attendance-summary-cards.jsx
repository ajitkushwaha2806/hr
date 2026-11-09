"use client";
import React from "react";
import {
  CalendarDays,
  UserCheck,
  CalendarCheck2,
  TrendingDown,
} from "lucide-react";

export function AttendanceSummaryCards({ stats = {}, isLoading = false }) {
  const {
    totalWorkingDays = 0,
    effectivePresentDays = 0,
    fullDaysPresent = 0,
    halfDaysPresent = 0,
    casualLeaves = {},
    approvedLopLeaves = {},
    absent = 0,
    unapprovedAbsentDays = 0,
  } = stats || {};

  const casualDays = Number(casualLeaves?.totalDays || 0);
  const lopDays = Number(approvedLopLeaves?.totalDays || 0);
  const effectiveAbsences = unapprovedAbsentDays || absent;
  const totalPayLossDays =
    stats?.totalPayLossDays !== undefined
      ? stats.totalPayLossDays
      : lopDays + effectiveAbsences * 2;

  const cards = [
    {
      title: "Working Days",
      value: `${totalWorkingDays}d`,
      subtitle: "Monthly required days",
      icon: CalendarDays,
    },
    {
      title: "Present Days",
      value: `${effectivePresentDays}d`,
      subtitle: `${fullDaysPresent} full · ${halfDaysPresent} half days`,
      icon: UserCheck,
    },
    {
      title: "Paid Leaves",
      value: `${casualDays}d`,
      subtitle: "Approved casual leaves",
      icon: CalendarCheck2,
    },
    {
      title: "Pay Loss Deductions",
      value: `${totalPayLossDays}d`,
      subtitle:
        totalPayLossDays > 0
          ? `${effectiveAbsences * 2}d absence + ${lopDays}d LOP`
          : "Zero deductions",
      icon: TrendingDown,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 sm:h-26 rounded-md bg-card border border-border/60 p-3 sm:p-3.5 flex flex-col justify-between animate-pulse shadow-2xs"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-muted rounded-md" />
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="rounded-md border border-border/80 bg-card dark:bg-zinc-900 p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-200 hover:border-primary/40 shadow-2xs"
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span className="text-xs font-semibold text-muted-foreground truncate" title={c.title}>
                {c.title}
              </span>
              <div className="size-7 rounded-md bg-muted/60 text-muted-foreground flex items-center justify-center shrink-0">
                <Icon className="size-3.5" />
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {c.value}
              </div>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5" title={c.subtitle}>
                {c.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
