"use client";
import React, { useState } from "react";
import { format } from "date-fns";
import {
  X,
  Briefcase,
  Coffee,
  Sparkles,
  RotateCcw,
  Check,
  Loader2,
  CalendarDays,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const DAY_TYPES = [
  {
    type: "WORKING_DAY",
    label: "Working Day",
    subtext: "Employees punch in and follow standard shift rules.",
    icon: Briefcase,
    color: "purple",
    activeClass: "border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-600/20",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
  },
  {
    type: "WEEKLY_OFF",
    label: "Weekly Off",
    subtext: "Designated weekly off (e.g., weekend). Employees are off without penalty.",
    icon: Coffee,
    color: "amber",
    activeClass: "border-amber-600 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-600/20",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  },
  {
    type: "HOLIDAY",
    label: "Official Holiday",
    subtext: "Official organization paid holiday (e.g., Diwali, Independence Day).",
    icon: Sparkles,
    color: "emerald",
    activeClass: "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-600/20",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  },
];

export function DayEditModal({
  day,
  onClose,
  onSave,
  onReset,
  isUpdating = false,
  isClearing = false,
}) {
  const [selectedType, setSelectedType] = useState(() => day?.type || "WORKING_DAY");
  const [title, setTitle] = useState(
    () => day?.title || (day?.type === "HOLIDAY" ? "Holiday" : day?.type === "WEEKLY_OFF" ? "Weekly Off" : "Working Day")
  );
  const [description, setDescription] = useState(() => day?.description || "");

  if (!day) return null;

  // Format date display e.g. "Saturday, November 07, 2026"
  let formattedDate = day.dateString;
  try {
    const [y, m, d] = day.dateString.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    formattedDate = format(dateObj, "EEEE, MMMM dd, yyyy");
  } catch {
    formattedDate = day.dateString;
  }

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    if (!title || title === "Working Day" || title === "Weekly Off" || title === "Holiday") {
      if (type === "HOLIDAY") setTitle("Holiday");
      else if (type === "WEEKLY_OFF") setTitle("Weekly Off");
      else setTitle("Working Day");
    }
  };

  const handleSave = () => {
    onSave({
      dateString: day.dateString,
      type: selectedType,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  const handleReset = () => {
    onReset(day.dateString);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUpdating && !isClearing) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-lg bg-card rounded-md border border-border shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-md bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 flex items-center justify-center shrink-0">
              <CalendarDays className="size-4.5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {formattedDate}
              </h3>
              <p className="text-xs text-muted-foreground">
                Set company schedule and designate day status
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating || isClearing}
            aria-label="Close modal"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Current status banner */}
        <div className="flex items-center justify-between p-2.5 rounded-md bg-muted/40 border border-border/60 text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1.5">
            <Info className="size-3.5 text-primary" />
            Current Status:
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                day.type === "HOLIDAY"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  : day.type === "WEEKLY_OFF"
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                  : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
              }`}
            >
              {day.title || (day.type === "HOLIDAY" ? "Holiday" : day.type === "WEEKLY_OFF" ? "Weekly Off" : "Working Day")}
            </span>
            {day.isCustom && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                Custom Override
              </span>
            )}
          </div>
        </div>

        {/* Day Type Selector Cards */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">
            Select Day Classification:
          </label>
          <div className="grid grid-cols-1 gap-2">
            {DAY_TYPES.map((dt) => {
              const isSelected = selectedType === dt.type;
              const IconComp = dt.icon;
              return (
                <button
                  key={dt.type}
                  type="button"
                  onClick={() => handleTypeSelect(dt.type)}
                  className={`text-left p-3 rounded-md border transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? dt.activeClass
                      : "border-border/70 hover:border-border hover:bg-muted/30 bg-background"
                  }`}
                >
                  <div
                    className={`size-8 rounded-md flex items-center justify-center shrink-0 border mt-0.5 ${dt.badgeClass}`}
                  >
                    <IconComp className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{dt.label}</span>
                      {isSelected && (
                        <span className="size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="size-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                      {dt.subtext}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            Day Title / Occasion:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              selectedType === "HOLIDAY"
                ? "e.g., Diwali, Independence Day, Christmas"
                : selectedType === "WEEKLY_OFF"
                ? "e.g., Weekly Off, Alternate Saturday"
                : "e.g., Working Day, Compensatory Working Day"
            }
            className="w-full h-9 px-3 text-xs rounded-md bg-background border border-border/80 text-foreground placeholder:text-muted-foreground/60 shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-primary/40"
          />
        </div>

        {/* Description / Note */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            Description or Note (Optional):
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add internal note or holiday notice for employees..."
            className="w-full p-2.5 text-xs rounded-md bg-background border border-border/80 text-foreground placeholder:text-muted-foreground/60 shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-primary/40 resize-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2 pt-2 border-t border-border/60">
          <div>
            {day.isCustom && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isUpdating || isClearing}
                className="w-full sm:w-auto h-8.5 rounded-md text-xs font-semibold text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
              >
                {isClearing ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RotateCcw className="size-3.5 mr-1.5" />
                    Reset to Default
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isUpdating || isClearing}
              className="flex-1 sm:flex-none h-8.5 rounded-md text-xs font-semibold cursor-pointer border-border/80"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isUpdating || isClearing}
              className="flex-1 sm:flex-none h-8.5 rounded-md text-xs font-bold cursor-pointer bg-primary text-primary-foreground shadow-2xs active:scale-95 transition-all"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="size-3.5 mr-1.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
