"use client";

import { CALENDAR_LEGENDS } from "../helpers/constants";

export function CalendarLegend({ legends = CALENDAR_LEGENDS, title = "Legend:" }) {
  if (!legends || legends.length === 0) return null;

  return (
    <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50/50 dark:bg-zinc-900/50 border-t border-border/40 text-xs">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {title && (
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
            {title}
          </span>
        )}

        {legends.map((item) => {
          const Icon = item.icon;
          const name = item.name || item.label;

          return (
            <span
              key={item.id || name}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[11px] font-semibold shrink-0 whitespace-nowrap ${
                item.badgeClass || "bg-muted text-muted-foreground"
              }`}
            >
              {Icon ? (
                <Icon className={`size-3 shrink-0 ${item.iconClass || ""}`} />
              ) : item.dotColor ? (
                <span
                  className={`size-2 rounded-full ${item.dotColor}`}
                />
              ) : null}
              <span>{name}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarLegend;
