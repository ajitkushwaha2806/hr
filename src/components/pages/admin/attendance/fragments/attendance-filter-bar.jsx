"use client";
import { Search, X, ChevronLeft, ChevronRight, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { shiftDateByDays, getTodayDateString } from "../helpers";

export default function AttendanceFilterBar({
  searchQuery,
  onSearchChange,
  selectedDate,
  onDateChange,
  totalCount = 0,
}) {
  const isToday = selectedDate === getTodayDateString();

  const handlePrevDay = () => {
    if (onDateChange) onDateChange(shiftDateByDays(selectedDate, -1));
  };

  const handleNextDay = () => {
    if (onDateChange) onDateChange(shiftDateByDays(selectedDate, 1));
  };

  const handleSetToday = () => {
    if (onDateChange) onDateChange(getTodayDateString());
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-card border border-border/70 p-2.5 sm:p-3 rounded-xl shadow-xs">
      <div className="relative w-full sm:w-72">
        <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Search by employee, email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-8 h-9 text-xs rounded-lg bg-background border-border/60"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
        <div className="flex items-center bg-muted/40 border border-border/80 rounded-xl p-1 shadow-2xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSetToday}
            className={`h-7 px-2.5 text-xs font-semibold rounded-lg cursor-pointer ${
              isToday
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Today
          </Button>

          <div className="h-4 w-px bg-border/60 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevDay}
            className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div className="w-32 sm:w-36">
            <DatePicker
              value={selectedDate}
              onChange={(newDate) => {
                if (newDate && onDateChange) onDateChange(newDate);
              }}
              placeholder="Select date"
              className="h-7 border-0 shadow-none px-2 text-xs font-semibold hover:bg-muted/60 cursor-pointer"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextDay}
            className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 border border-border/40 font-medium text-[11px] text-muted-foreground shrink-0">
          <UserCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-foreground">{totalCount} Logged</span>
        </span>
      </div>
    </div>
  );
}
