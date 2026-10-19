import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_VARIANTS = {
  Active: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  Probation: {
    bg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
    dot: "bg-purple-500",
  },
  "On Leave": {
    bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  Inactive: {
    bg: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700",
    dot: "bg-gray-400",
  },
  Terminated: {
    bg: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
    dot: "bg-red-500",
  },
};

export const EmployeeStatusBadge = ({ status = "Active" }) => {
  const config = STATUS_VARIANTS[status] || STATUS_VARIANTS.Active;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        config.bg
      )}
    >
      <span className={cn("size-1.5 rounded-full shrink-0", config.dot)} />
      {status}
    </span>
  );
};

export const DepartmentBadge = ({ department = "General" }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted/60 text-foreground border border-border/60">
      {department}
    </span>
  );
};

export const EmploymentTypeBadge = ({ type = "Full-Time" }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-muted-foreground bg-secondary/50">
      {type}
    </span>
  );
};
