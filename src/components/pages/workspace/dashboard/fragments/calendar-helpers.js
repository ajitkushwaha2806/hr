export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Resolve the state category for a day
 */
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

/**
 * Returns clean styling configuration for a day cell using switch statement
 */
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
