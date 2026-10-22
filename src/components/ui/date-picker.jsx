"use client";

import { useState, useMemo } from "react";
import { format, parseISO, isValid } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function safeParseDate(value) {
  if (!value) return null;
  try {
    if (value instanceof Date) {
      return isValid(value) ? value : null;
    }
    const d = typeof value === "string" && value.length === 10
      ? parseISO(value)
      : new Date(value);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  className = "",
  minYear = 1940,
  maxYear = 2027,
  displayFormat = "dd MMM yyyy",
}) {
  const [open, setOpen] = useState(false);
  const parsedDate = useMemo(() => safeParseDate(value), [value]);
  const [currentMonth, setCurrentMonth] = useState(() => parsedDate || new Date());
  const [prevParsedDate, setPrevParsedDate] = useState(parsedDate);

  if (parsedDate !== prevParsedDate) {
    setPrevParsedDate(parsedDate);
    if (parsedDate) {
      setCurrentMonth(parsedDate);
    }
  }

  const effectiveMaxYear = Math.min(2027, maxYear);

  const years = useMemo(() => {
    const list = [];
    for (let y = effectiveMaxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [minYear, effectiveMaxYear]);

  const handleSelect = (selectedDate) => {
    if (!selectedDate) {
      onChange?.("");
      return;
    }
    onChange?.(format(selectedDate, "yyyy-MM-dd"));
    setOpen(false);
  };

  const handleClear = (e) => {
    e?.stopPropagation();
    onChange?.("");
  };

  const handleMonthSelect = (monthIndex) => {
    const year = currentMonth.getFullYear();
    setCurrentMonth(new Date(year, monthIndex, 1));
  };

  const handleYearSelect = (year) => {
    const month = currentMonth.getMonth();
    setCurrentMonth(new Date(year, month, 1));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex items-center justify-between w-full h-9 px-3 text-xs font-normal rounded-md border border-input bg-transparent shadow-xs transition-colors outline-none cursor-pointer select-none",
            "hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring",
            disabled && "cursor-not-allowed opacity-50 bg-muted/40",
            className
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className={cn("truncate", !parsedDate && "text-muted-foreground")}>
              {parsedDate ? format(parsedDate, displayFormat) : placeholder}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1.5">
            {parsedDate && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Clear date"
              >
                <X className="size-3" />
              </span>
            )}
            <ChevronDown className="size-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </button>
      } />

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="rounded-md border border-border/80 bg-popover shadow-xl p-3 z-50 w-auto"
      >
        <div className="flex items-center gap-2 pb-2.5 mb-2 border-b border-border/60">
          <select
            value={currentMonth.getMonth()}
            onChange={(e) => handleMonthSelect(Number(e.target.value))}
            className="flex-1 h-9 rounded-md bg-muted/70 dark:bg-zinc-800 border border-border/60 text-xs font-medium px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {MONTH_NAMES.map((m, idx) => (
              <option key={m} value={idx}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={currentMonth.getFullYear()}
            onChange={(e) => handleYearSelect(Number(e.target.value))}
            className="w-24 h-9 rounded-md bg-muted/70 dark:bg-zinc-800 border border-border/60 text-xs font-medium px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <Calendar
          mode="single"
          selected={parsedDate || undefined}
          onSelect={handleSelect}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          disabled={(date) => date > new Date(2027, 11, 31)}
          className="p-0"
        />
      </PopoverContent>
    </Popover>
  );
}

function FloatingDatePicker({
  label,
  icon: Icon = CalendarIcon,
  error,
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  helperText,
  minYear = 1940,
  maxYear = 2027,
  displayFormat = "dd MMMM yyyy",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const parsedDate = useMemo(() => safeParseDate(value), [value]);
  const [currentMonth, setCurrentMonth] = useState(() => parsedDate || new Date());
  const [prevParsedDate, setPrevParsedDate] = useState(parsedDate);

  if (parsedDate !== prevParsedDate) {
    setPrevParsedDate(parsedDate);
    if (parsedDate) {
      setCurrentMonth(parsedDate);
    }
  }

  const effectiveMaxYear = Math.min(2027, maxYear);

  const years = useMemo(() => {
    const list = [];
    for (let y = effectiveMaxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [minYear, effectiveMaxYear]);

  const handleSelect = (selectedDate) => {
    if (!selectedDate) {
      onChange?.("");
      return;
    }
    onChange?.(format(selectedDate, "yyyy-MM-dd"));
    setOpen(false);
  };

  const handleClear = (e) => {
    e?.stopPropagation();
    onChange?.("");
  };

  const handleMonthSelect = (monthIndex) => {
    const year = currentMonth.getFullYear();
    setCurrentMonth(new Date(year, monthIndex, 1));
  };

  const handleYearSelect = (year) => {
    const month = currentMonth.getMonth();
    setCurrentMonth(new Date(year, month, 1));
  };

  return (
    <div className={cn("relative group", className)}>
      <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-900 z-10 pointer-events-none">
        <span
          className={cn(
            "text-[11px] font-semibold uppercase tracking-wider transition-colors",
            error
              ? "text-destructive"
              : "text-slate-500 dark:text-zinc-400 group-focus-within:text-primary"
          )}
        >
          {label}
        </span>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "relative flex items-center justify-between w-full h-12 border rounded-md transition-all bg-white dark:bg-zinc-900/50 px-3 cursor-pointer select-none text-left",
              error
                ? "border-destructive ring-1 ring-destructive"
                : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary shadow-xs",
              disabled && "opacity-75 cursor-not-allowed bg-muted/40"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {Icon && (
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    error ? "text-destructive" : "text-primary/90"
                  )}
                />
              )}
              <span
                className={cn(
                  "text-sm sm:text-base truncate",
                  parsedDate
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {parsedDate ? format(parsedDate, displayFormat) : placeholder}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {parsedDate && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title="Clear date"
                >
                  <X className="size-3.5" />
                </span>
              )}
              <ChevronDown className="size-4 text-muted-foreground pointer-events-none" />
            </div>
          </button>
        } />

        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={6}
          className="rounded-md border border-border/80 bg-white dark:bg-zinc-900 shadow-xl p-3 z-50 w-auto"
        >
          <div className="flex items-center gap-2 pb-2.5 mb-2 border-b border-border/60">
            <select
              value={currentMonth.getMonth()}
              onChange={(e) => handleMonthSelect(Number(e.target.value))}
              className="flex-1 h-9 rounded-md bg-muted/70 dark:bg-zinc-800 border border-border/60 text-xs font-semibold px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={currentMonth.getFullYear()}
              onChange={(e) => handleYearSelect(Number(e.target.value))}
              className="w-24 h-9 rounded-md bg-muted/70 dark:bg-zinc-800 border border-border/60 text-xs font-semibold px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <Calendar
            mode="single"
            selected={parsedDate || undefined}
            onSelect={handleSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            disabled={(date) => date > new Date(2027, 11, 31)}
            className="p-0"
          />
        </PopoverContent>
      </Popover>

      {error ? (
        <p className="text-xs text-destructive font-medium mt-1.5">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-muted-foreground mt-1.5">{helperText}</p>
      ) : null}
    </div>
  );
}

export { DatePicker, FloatingDatePicker };
