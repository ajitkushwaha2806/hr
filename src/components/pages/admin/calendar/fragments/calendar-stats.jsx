"use client";
import React from "react";
import { Briefcase, Calendar, Sparkles, Coffee } from "lucide-react";

export function CalendarStats({ days = [] }) {
  const totalDays = days.length;
  const workingDays = days.filter((d) => d.type === "WORKING_DAY").length;
  const holidays = days.filter((d) => d.type === "HOLIDAY").length;
  const weeklyOffs = days.filter((d) => d.type === "WEEKLY_OFF").length;

  const cards = [
    {
      title: "Total Days",
      value: `${totalDays}d`,
      subtitle: "Days in this month",
      icon: <Calendar className="size-4 text-muted-foreground" />,
      badge: null,
      border: "border-border/70",
      bg: "bg-white dark:bg-zinc-900",
    },
    {
      title: "Working Days",
      value: `${workingDays}d`,
      subtitle: "Standard office days",
      icon: <Briefcase className="size-4 text-purple-600 dark:text-purple-400" />,
      badge: "Standard",
      border: "border-purple-200/80 dark:border-purple-900/40",
      bg: "bg-purple-50/40 dark:bg-purple-950/20",
    },
    {
      title: "Official Holidays",
      value: `${holidays}d`,
      subtitle: "Company paid holidays",
      icon: <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />,
      badge: holidays > 0 ? "Holiday" : null,
      border: "border-emerald-200/80 dark:border-emerald-900/40",
      bg: "bg-emerald-50/40 dark:bg-emerald-950/20",
    },
    {
      title: "Weekly Offs",
      value: `${weeklyOffs}d`,
      subtitle: "Weekends & designated offs",
      icon: <Coffee className="size-4 text-amber-600 dark:text-amber-400" />,
      badge: "Off Days",
      border: "border-amber-200/80 dark:border-amber-900/40",
      bg: "bg-amber-50/40 dark:bg-amber-950/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {cards.map((c) => (
        <div
          key={c.title}
          className={`rounded-md border ${c.border} ${c.bg} p-3 sm:p-4 shadow-2xs flex flex-col justify-between transition-all`}
        >
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-xs font-semibold text-muted-foreground truncate">
              {c.title}
            </span>
            <div className="p-1 rounded-md bg-background/80 shrink-0">
              {c.icon}
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {c.value}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {c.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
