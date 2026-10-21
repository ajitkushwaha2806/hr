import { CheckCircle2, XCircle, Clock, CalendarDays, Sparkles, Coffee } from "lucide-react";

export const MONTH_NAMES = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function resolveDayCategory(dayItem, todayString) {
  if (dayItem.dateString === todayString) {
    return "TODAY";
  }

  if (dayItem.attendanceStatus === "PRESENT") {
    return "PRESENT";
  }

  if (dayItem.attendanceStatus === "ABSENT") {
    return "ABSENT";
  }

  if (dayItem.attendanceStatus === "HALF_DAY") {
    return "HALF_DAY";
  }

  if (dayItem.attendanceStatus === "NOT_CHECKED_OUT") {
    return "NOT_CHECKED_OUT";
  }

  if (dayItem.attendanceStatus === "CASUAL_LEAVE") {
    return "CASUAL_LEAVE";
  }

  switch (dayItem.type) {
    case "HOLIDAY":
      return "HOLIDAY";
    case "WEEKLY_OFF":
      return "WEEKLY_OFF";
    case "WORKING_DAY":
      return "WORKING_DAY";
    default:
      return "DEFAULT";
  }
}

export function getDayCellStyles(category) {
  switch (category) {
    case "TODAY":
      return {
        cellClass: "bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/40 ring-inset",
        numberClass: "bg-primary text-white shadow-xs font-bold",
        isToday: true,
      };

    case "PRESENT":
      return {
        cellClass: "bg-emerald-500/5 dark:bg-emerald-950/20 hover:bg-emerald-500/10",
        numberClass: "text-foreground font-bold",
        isToday: false,
      };

    case "ABSENT":
      return {
        cellClass: "bg-rose-500/5 dark:bg-rose-950/20 hover:bg-rose-500/10",
        numberClass: "text-rose-600 dark:text-rose-400 font-bold",
        isToday: false,
      };

    case "HALF_DAY":
      return {
        cellClass: "bg-amber-500/5 dark:bg-amber-950/20 hover:bg-amber-500/10",
        numberClass: "text-amber-600 dark:text-amber-400 font-bold",
        isToday: false,
      };

    case "NOT_CHECKED_OUT":
      return {
        cellClass: "bg-orange-500/5 dark:bg-orange-950/20 hover:bg-orange-500/10",
        numberClass: "text-orange-600 dark:text-orange-400 font-bold",
        isToday: false,
      };

    case "CASUAL_LEAVE":
      return {
        cellClass: "bg-sky-500/5 dark:bg-sky-950/20 hover:bg-sky-500/10",
        numberClass: "text-sky-600 dark:text-sky-400 font-bold",
        isToday: false,
      };

    case "HOLIDAY":
      return {
        cellClass: "bg-purple-500/5 dark:bg-purple-950/20 hover:bg-purple-500/10",
        numberClass: "text-purple-600 dark:text-purple-400 font-extrabold",
        isToday: false,
      };

    case "WEEKLY_OFF":
      return {
        cellClass: "bg-slate-50/40 dark:bg-zinc-950/30 hover:bg-slate-100/60 dark:hover:bg-zinc-800/40",
        numberClass: "text-muted-foreground/60 font-medium",
        isToday: false,
      };

    case "WORKING_DAY":
    default:
      return {
        cellClass: "hover:bg-muted/40",
        numberClass: "text-foreground font-bold",
        isToday: false,
      };
  }
}

export function getStatusBadge(statusOrDay, customTitle, extra) {
  if (!statusOrDay) return null;

  let status = "";
  let title = "";
  let isCustom = false;

  if (typeof statusOrDay === "object" && statusOrDay !== null) {
    status = statusOrDay.attendanceStatus || statusOrDay.type || statusOrDay.status || "";
    title = customTitle || statusOrDay.title || "";
    isCustom = statusOrDay.isCustom;
  } else {
    status = statusOrDay;
    title = customTitle || "";
    if (extra && typeof extra === "object") {
      isCustom = extra.isCustom;
    }
  }

  const baseBadgeClass =
    "inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[11px] font-semibold truncate max-w-full";

  switch (status) {
    case "PRESENT":
      return (
        <div className={`${baseBadgeClass} bg-emerald-500/10 text-emerald-700 dark:text-emerald-300`}>
          <CheckCircle2 className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="truncate">{title || "Present"}</span>
        </div>
      );

    case "ABSENT":
      return (
        <div className={`${baseBadgeClass} bg-rose-500/10 text-rose-700 dark:text-rose-300`}>
          <XCircle className="size-3 shrink-0 text-rose-600 dark:text-rose-400" />
          <span className="truncate">{title && title !== "Working Day" ? title : "Absent"}</span>
        </div>
      );

    case "HALF_DAY":
      return (
        <div className={`${baseBadgeClass} bg-amber-500/10 text-amber-700 dark:text-amber-300`}>
          <Clock className="size-3 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="truncate">{title || "Half Day"}</span>
        </div>
      );

    case "NOT_CHECKED_OUT":
      return (
        <div className={`${baseBadgeClass} bg-orange-500/10 text-orange-700 dark:text-orange-300`}>
          <Clock className="size-3 shrink-0 text-orange-600 dark:text-orange-400" />
          <span className="truncate">{title || "Not Checked Out"}</span>
        </div>
      );

    case "CASUAL_LEAVE":
    case "LEAVE":
      return (
        <div className={`${baseBadgeClass} bg-sky-500/10 text-sky-700 dark:text-sky-300`}>
          <CalendarDays className="size-3 shrink-0 text-sky-600 dark:text-sky-400" />
          <span className="truncate">{title || "Leave"}</span>
        </div>
      );

    case "HOLIDAY":
      return (
        <div className={`${baseBadgeClass} bg-purple-500/10 text-purple-700 dark:text-purple-300`}>
          <Sparkles className="size-3 shrink-0 text-purple-600 dark:text-purple-400" />
          <span className="truncate">{title || "Holiday"}</span>
        </div>
      );

    case "WEEKLY_OFF":
      return (
        <div className={`${baseBadgeClass} bg-slate-500/10 text-slate-700 dark:text-slate-300`}>
          <Coffee className="size-3 shrink-0 text-slate-500 dark:text-slate-400" />
          <span className="truncate">{title || "Weekly Off"}</span>
        </div>
      );

    case "WORKING_DAY":
      if (isCustom && title && title !== "Working Day") {
        return (
          <div className={`${baseBadgeClass} border border-border/60 text-muted-foreground`}>
            <span className="truncate">{title}</span>
          </div>
        );
      }
      return null;

    default:
      if (title && isCustom) {
        return (
          <div className={`${baseBadgeClass} border border-border/60 text-muted-foreground`}>
            <span className="truncate">{title}</span>
          </div>
        );
      }
      return null;
  }
}

