"use client";
import React, { useState } from "react";
import { format } from "date-fns";
import {
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar as CalendarIcon,
  AlertCircle,
  Camera,
  X,
  Sun,
  Hourglass,
  CalendarDays,
  AlertTriangle,
  Pencil,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmployeeService } from "@/services/frontend/employee";
import useNotification from "@/store/hooks/useNotification";
import { useQueryClient } from "@tanstack/react-query";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AttendanceCalendar({
  year,
  month,
  dailyBreakdown = [],
  isLoading = false,
  employeeId,
  isTeamLead = false,
  onStatusUpdated,
}) {
  const notification = useNotification();
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState(null);
  const [selfieZoom, setSelfieZoom] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleOpenDayModal = (item) => {
    setSelectedDay(item);
    setOverrideStatus(item.manualOverride?.status || "");
  };

  const handleUpdateStatus = async () => {
    if (!selectedDay || !overrideStatus || !employeeId) return;
    setIsUpdatingStatus(true);
    try {
      await EmployeeService.updateAttendanceStatus(employeeId, {
        date: selectedDay.date,
        status: overrideStatus,
      });
      queryClient.invalidateQueries({ queryKey: ["organization-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-today-status"] });
      notification.success(
        overrideStatus === "RESET"
          ? `Attendance for ${selectedDay.date} reset to automatic biometric status.`
          : `Attendance for ${selectedDay.date} updated to ${overrideStatus}.`
      );
      setSelectedDay(null);
      setOverrideStatus("");
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      notification.error(err?.message || "Failed to update attendance status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Compute first day of month (0 = Sun, 1 = Mon, ... 6 = Sat)
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  // Format punch times
  const formatTime = (timeStr) => {
    if (!timeStr) return "—";
    try {
      return format(new Date(timeStr), "hh:mm a");
    } catch {
      return timeStr;
    }
  };

  const getStatusConfig = (item) => {
    switch (item.status) {
      case "PRESENT":
      case "FULL_DAY_PRESENT":
        return {
          label: "Full Day",
          fullLabel: "Full Day Present",
          badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
          dot: "bg-emerald-500",
          cardBorder: "border-border/60 hover:border-emerald-400/60",
          bgTint: "bg-card hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10",
        };
      case "HALF_DAY":
      case "HALF_DAY_PRESENT":
        return {
          label: "Half Day",
          fullLabel: "Half Day Present (3h - 8h)",
          badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800",
          dot: "bg-amber-500",
          cardBorder: "border-amber-300/80 dark:border-amber-800/60 hover:border-amber-400",
          bgTint: "bg-card hover:bg-amber-50/25 dark:hover:bg-amber-950/10",
        };
      case "HALF_DAY_LEAVE":
      case "HALF_DAY_CASUAL":
        return {
          label: "Casual (0.5d)",
          fullLabel: item.leaveTypeLabel || "Casual Leave (Half Day = 0.5d)",
          badgeBg: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-400 border-sky-300 dark:border-sky-800",
          dot: "bg-sky-500",
          cardBorder: "border-border/60 hover:border-sky-400/60",
          bgTint: "bg-card hover:bg-sky-50/20 dark:hover:bg-sky-950/10",
        };
      case "HALF_DAY_LOP":
        return {
          label: "LOP (0.5d)",
          fullLabel: item.leaveTypeLabel || "Loss of Pay (Half Day = 0.5d LOP)",
          badgeBg: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800",
          dot: "bg-indigo-500",
          cardBorder: "border-indigo-300 dark:border-indigo-800/60 hover:border-indigo-400",
          bgTint: "bg-card hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10",
        };
      case "FULL_DAY_CASUAL":
        return {
          label: "Casual Leave",
          fullLabel: "Casual Leave (Full Day Paid)",
          badgeBg: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-400 border-sky-300 dark:border-sky-800",
          dot: "bg-sky-500",
          cardBorder: "border-border/60 hover:border-sky-400/60",
          bgTint: "bg-card hover:bg-sky-50/20 dark:hover:bg-sky-950/10",
        };
      case "FULL_DAY_LOP":
        return {
          label: "Loss of Pay",
          fullLabel: "Loss of Pay (Full Day = 1x LOP)",
          badgeBg: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800",
          dot: "bg-indigo-500",
          cardBorder: "border-indigo-300 dark:border-indigo-800/60 hover:border-indigo-400",
          bgTint: "bg-card hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10",
        };
      case "ON_LEAVE":
      case "FULL_DAY_LEAVE":
        return {
          label: item.leave?.type === "Loss of Pay" ? "Loss of Pay" : "Casual Leave",
          fullLabel: item.leaveTypeLabel || (item.leave?.type === "Loss of Pay" ? "Loss of Pay (1x LOP)" : "Casual Leave (Paid)"),
          badgeBg:
            item.leave?.type === "Loss of Pay"
              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800"
              : "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-400 border-sky-300 dark:border-sky-800",
          dot: item.leave?.type === "Loss of Pay" ? "bg-indigo-500" : "bg-sky-500",
          cardBorder: "border-border/60 hover:border-blue-400/60",
          bgTint: "bg-card hover:bg-blue-50/20 dark:hover:bg-blue-950/10",
        };
      case "IN_PROGRESS":
        return {
          label: "Clocked In",
          fullLabel: "Currently Clocked In",
          badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800",
          dot: "bg-amber-500 animate-pulse",
          cardBorder: "border-amber-300 dark:border-amber-800/60",
          bgTint: "bg-amber-50/30 dark:bg-amber-950/10",
        };
      case "NO_PUNCH_OUT":
        return {
          label: "Half Day (No Out)",
          fullLabel: "Half Day (No Punch Out = 0.5d)",
          badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800",
          dot: "bg-amber-500",
          cardBorder: "border-amber-300/80 dark:border-amber-800/60 hover:border-amber-400",
          bgTint: "bg-amber-50/25 dark:bg-amber-950/10",
        };
      case "HOLIDAY":
        return {
          label: item.calendarTitle || "Holiday",
          fullLabel: item.calendarTitle || "Official Holiday",
          badgeBg: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 border-purple-300 dark:border-purple-800",
          dot: "bg-purple-500",
          cardBorder: "border-purple-200/60 dark:border-purple-800/40",
          bgTint: "bg-purple-50/20 dark:bg-purple-950/10",
        };
      case "WEEKLY_OFF":
        return {
          label: "Weekly Off",
          fullLabel: "Weekend / Weekly Off",
          badgeBg: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
          dot: "bg-zinc-400",
          cardBorder: "border-border/40",
          bgTint: "bg-muted/15",
        };
      case "DOUBLE_PAY_LOSS":
      case "ABSENT":
        return {
          label: item.isDoublePayLoss || item.status === "ABSENT" ? "2x Pay Loss" : "Absent",
          fullLabel: "Absent without Leave (Double Pay Loss = 2x LOP)",
          badgeBg: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800",
          dot: "bg-rose-500",
          cardBorder: "border-rose-300 dark:border-rose-800/60 hover:border-rose-400",
          bgTint: "bg-card hover:bg-rose-50/25 dark:hover:bg-rose-950/10",
        };
      case "NOT_MARKED":
        return {
          label: "Not Marked",
          fullLabel: "Shift Not Marked Yet",
          badgeBg: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200",
          dot: "bg-zinc-400",
          cardBorder: "border-border/60",
          bgTint: "bg-card",
        };
      case "FUTURE":
      default:
        return {
          label: "Upcoming",
          fullLabel: "Upcoming Scheduled Day",
          badgeBg: "bg-transparent text-muted-foreground/60 border-transparent",
          dot: "bg-transparent",
          cardBorder: "border-border/20",
          bgTint: "bg-muted/5 opacity-50",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border/60 rounded-md p-4 sm:p-6 shadow-2xs">
        <div className="hidden sm:grid grid-cols-7 gap-2 mb-3">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center font-medium text-xs text-muted-foreground py-1">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
          {[...Array(28)].map((_, i) => (
            <div key={i} className="min-h-[76px] sm:min-h-[105px] rounded-md bg-muted/40 animate-pulse border border-border/30" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-md p-3 sm:p-5 shadow-2xs space-y-4">
      {/* Calendar Header info & legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div>
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <CalendarIcon className="size-4 text-primary" />
            Monthly Attendance Calendar
          </h3>
        </div>

        {/* Legend: Horizontally scrollable on mobile */}
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none py-1 text-[10.5px] sm:text-[11px] text-muted-foreground whitespace-nowrap">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500 shrink-0" /> Full Day
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-500 shrink-0" /> Half Day
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-rose-500 shrink-0" /> Absent (2x LOP)
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-sky-500 shrink-0" /> Casual Leave
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-indigo-500 shrink-0" /> LOP Leave
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-purple-500 shrink-0" /> Holiday
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-zinc-400 shrink-0" /> Weekend
          </span>
        </div>
      </div>

      {/* Weekday Labels (Hidden on mobile where 4-day columns flow directly) */}
      <div className="hidden sm:grid grid-cols-7 gap-1 sm:gap-2">
        {WEEKDAYS.map((dayName, idx) => (
          <div
            key={dayName}
            className={`text-center font-semibold text-[11px] sm:text-xs py-1 uppercase tracking-wider ${
              idx === 0 || idx === 6 ? "text-muted-foreground/80" : "text-foreground"
            }`}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid: 4 columns in a row on mobile screen, 7 on desktop */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
        {/* Leading empty placeholder cells (hidden on mobile for natural 4-day flow) */}
        {[...Array(firstDayOfWeek)].map((_, i) => (
          <div
            key={`empty-${i}`}
            className="hidden sm:block h-16 sm:h-28 rounded-md bg-muted/10 border border-transparent"
          />
        ))}

        {/* Real Month Days */}
        {dailyBreakdown.map((item) => {
          const config = getStatusConfig(item);
          const punch = item.punch;
          const checkIn = punch?.checkIn;
          const checkOut = punch?.checkOut;
          const durationHours = punch?.durationMinutes
            ? `${Math.floor(punch.durationMinutes / 60)}h ${punch.durationMinutes % 60}m`
            : null;

          const isClickable = Boolean(punch || item.isLeave || item.calendarTitle);

          return (
            <div
              key={item.date}
              onClick={() => isClickable && handleOpenDayModal(item)}
              className={`group relative min-h-[76px] sm:min-h-[105px] h-auto rounded-md border p-1.5 sm:p-2 flex flex-col justify-between transition-all duration-150 ${
                config.cardBorder
              } ${config.bgTint} ${
                isClickable ? "cursor-pointer hover:shadow-xs active:scale-[0.98]" : ""
              } ${item.isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}`}
            >
              {/* Day number & Status badge */}
              <div className="flex items-center justify-between w-full gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`text-xs sm:text-sm font-semibold rounded-full size-5 sm:size-6 flex items-center justify-center shrink-0 ${
                      item.isToday
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-foreground group-hover:text-primary transition-colors"
                    }`}
                  >
                    {item.day}
                  </span>
                  <span className="sm:hidden text-[10px] font-bold text-muted-foreground/80 uppercase tracking-tight truncate">
                    {format(new Date(item.date), "EEE")}
                  </span>
                </div>

                {/* Mobile: Clean status dot */}
                <span
                  className={`sm:hidden size-2 rounded-full shrink-0 ${config.dot}`}
                  title={config.label}
                />

                {/* Desktop: Full text badge */}
                <span
                  className={`hidden sm:inline-block text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full border truncate max-w-[85px] ${config.badgeBg}`}
                  title={config.label}
                >
                  {config.label}
                </span>
              </div>

              {/* Punch / Info Content */}
              <div className="mt-1 flex flex-col justify-end text-[9px] sm:text-[11px] space-y-0.5 overflow-hidden">
                {checkIn && (
                  <div className="flex items-center gap-1 text-muted-foreground truncate">
                    <Clock className="size-2 sm:size-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-mono text-[9px] sm:text-[10px] truncate">{formatTime(checkIn.time)}</span>
                  </div>
                )}

                {checkOut && (
                  <div className="hidden sm:flex items-center gap-1 text-muted-foreground truncate">
                    <Clock className="size-2.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="font-mono text-[10px]">{formatTime(checkOut.time)}</span>
                  </div>
                )}

                {durationHours && (
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-semibold text-foreground/80 truncate">
                    <span>{durationHours}</span>
                    {item.isHalfDay && (
                      <span className="text-[8.5px] sm:text-[9px] text-amber-600 dark:text-amber-400 font-bold">
                        (0.5d)
                      </span>
                    )}
                  </div>
                )}

                {item.calendarType === "HOLIDAY" && item.calendarTitle && (
                  <p className="text-[9px] sm:text-[10px] text-purple-700 dark:text-purple-300 font-medium truncate">
                    {item.calendarTitle}
                  </p>
                )}
              </div>

              {/* Verified badge if checkIn has face match */}
              {checkIn?.faceMatched && (
                <div
                  className="absolute bottom-1 right-1 size-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
                  title="Face Biometric & GPS Geofence Verified"
                >
                  <ShieldCheck className="size-2.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Day Inspection Modal: Native bottom-sheet on mobile, centered card on desktop */}
      {selectedDay && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedDay(null)}
        >
          <div
            className="bg-card text-card-foreground border-t sm:border border-border p-4 sm:p-5 pb-8 sm:pb-5 pb-safe rounded-t-md sm:rounded-md max-w-lg w-full space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Indicator */}
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto -mt-1 mb-2 sm:hidden" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {selectedDay.day}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">
                    {format(new Date(selectedDay.date), "EEEE, MMMM dd, yyyy")}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        getStatusConfig(selectedDay).badgeBg
                      }`}
                    >
                      {getStatusConfig(selectedDay).fullLabel}
                    </span>
                    {selectedDay.calendarTitle && (
                      <span className="text-xs text-muted-foreground">
                        {selectedDay.calendarTitle}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Shift & Day Type Classification Banner */}
            <div className="p-3 rounded-md bg-muted/30 border border-border/60 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                {selectedDay.isHalfDay ? (
                  <Hourglass className="size-3.5 text-amber-500" />
                ) : selectedDay.isFullDay ? (
                  <Sun className="size-3.5 text-emerald-500" />
                ) : (
                  <CalendarDays className="size-3.5 text-primary" />
                )}
                Shift Classification:
              </span>
              <span className="font-semibold text-foreground">
                {selectedDay.isHalfDay
                  ? selectedDay.status === "NO_PUNCH_OUT" || !selectedDay.punch?.checkOut?.time
                    ? "Half Day Shift (No Punch Out = 0.5d credited)"
                    : "Half Day Shift (3h - 8h Completed = 0.5d)"
                  : selectedDay.isFullDay
                  ? "Full Day Shift (Standard 8h+ Completed = 1.0d)"
                  : selectedDay.leaveTypeLabel || getStatusConfig(selectedDay).fullLabel}
              </span>
            </div>

            {/* Admin-only Attendance Status Override Control */}
            {!isTeamLead && employeeId && (
              <div className="p-3 rounded-md bg-primary/5 border border-primary/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Pencil className="size-3.5 text-primary" />
                    <span>Admin Attendance Override</span>
                  </span>
                  {selectedDay.manualOverride?.isOverridden && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/20">
                      Active Override ({selectedDay.manualOverride.status})
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Select
                    value={overrideStatus}
                    onValueChange={setOverrideStatus}
                  >
                    <SelectTrigger className="h-8 text-xs flex-1 rounded-md bg-background">
                      <SelectValue placeholder="Change status to..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESENT" className="text-xs">
                        <span className="font-semibold text-emerald-600">Present</span> — Full Day (1.0d)
                      </SelectItem>
                      <SelectItem value="HALF_DAY" className="text-xs">
                        <span className="font-semibold text-amber-600">Half Day</span> — Shift (0.5d)
                      </SelectItem>
                      <SelectItem value="ABSENT" className="text-xs">
                        <span className="font-semibold text-rose-600">Absent</span> — Unapproved (2x LOP Penalty)
                      </SelectItem>
                      <SelectItem value="CASUAL_LEAVE" className="text-xs">
                        <span className="font-semibold text-sky-600">Casual Leave</span> — Paid Leave (1.0d)
                      </SelectItem>
                      <SelectItem value="LOP" className="text-xs">
                        <span className="font-semibold text-indigo-600">Loss of Pay</span> — Approved LOP (1x)
                      </SelectItem>
                      <SelectItem value="HOLIDAY" className="text-xs">
                        <span className="font-semibold text-purple-600">Holiday</span> — Official Paid Off
                      </SelectItem>
                      <SelectItem value="WEEKLY_OFF" className="text-xs">
                        <span className="font-semibold text-zinc-600">Weekly Off</span> — Rest Day
                      </SelectItem>
                      {selectedDay.manualOverride?.isOverridden && (
                        <SelectItem value="RESET" className="text-xs font-semibold text-rose-600">
                          ↺ Reset to Automatic Biometric Calculation
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    onClick={handleUpdateStatus}
                    disabled={isUpdatingStatus || !overrideStatus}
                    className="h-8 text-xs px-3 rounded-md gap-1.5 shrink-0"
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                    <span>Apply Change</span>
                  </Button>
                </div>

                {selectedDay.manualOverride?.isOverridden && selectedDay.manualOverride?.overriddenByName && (
                  <p className="text-[10px] text-muted-foreground italic">
                    Modified by {selectedDay.manualOverride.overriddenByName}
                    {selectedDay.manualOverride.overriddenAt &&
                      ` on ${format(new Date(selectedDay.manualOverride.overriddenAt), "MMM dd, yyyy · hh:mm a")}`}
                  </p>
                )}
              </div>
            )}

            {/* Check-In & Check-Out Details */}
            {selectedDay.punch ? (
              <div className="space-y-4">
                {/* No Checkout Notice if applicable */}
                {!selectedDay.punch.checkOut?.time && !selectedDay.isToday && (
                  <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                    <span>Missed Check-Out: Auto-credited as Half Day (0.5d)</span>
                    <span className="font-semibold text-[11px] px-2 py-0.5 rounded-md bg-amber-500/20">Half Day (0.5d)</span>
                  </div>
                )}

                {/* Duration Banner */}
                {selectedDay.punch.durationMinutes > 0 && (
                  <div className="p-3 rounded-md bg-primary/5 border border-primary/15 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total Time Logged:</span>
                    <span className="font-bold text-sm text-primary">
                      {Math.floor(selectedDay.punch.durationMinutes / 60)} hrs{" "}
                      {selectedDay.punch.durationMinutes % 60} mins{" "}
                      {selectedDay.punch.durationMinutes >= 480 ? (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          (Full Day Qualified — 8h+)
                        </span>
                      ) : selectedDay.punch.durationMinutes >= 180 ? (
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                          (Half Day Qualified — 3h to 8h)
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                          (Under 3 hrs — Marked Absent with 2x Pay Loss)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {/* Check In Box */}
                {selectedDay.punch.checkIn ? (
                  <div className="p-3.5 rounded-md border border-border/60 bg-muted/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5" />
                        Check-In Verification
                      </span>
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {formatTime(selectedDay.punch.checkIn.time)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {/* Location */}
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                          <MapPin className="size-3" /> Geofence:
                        </span>
                        <p className="font-medium text-foreground">
                          {selectedDay.punch.checkIn.withinGeofence
                            ? `Inside (${Math.round(selectedDay.punch.checkIn.distanceMeters)}m from office)`
                            : `Outside perimeter (${Math.round(selectedDay.punch.checkIn.distanceMeters)}m)`}
                        </p>
                      </div>

                      {/* Face Match */}
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                          <ShieldCheck className="size-3 text-emerald-500" /> Face Biometrics:
                        </span>
                        <p className="font-medium text-foreground">
                          {selectedDay.punch.checkIn.faceMatched
                            ? `Matched (${selectedDay.punch.checkIn.faceMatchConfidence?.toFixed(1)}%)`
                            : "Biometric Fail"}
                        </p>
                      </div>
                    </div>

                    {/* Selfie Image */}
                    {selectedDay.punch.checkIn.selfieUrl && (
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Camera className="size-3" /> Live Selfie Audit:
                        </span>
                        <button
                          onClick={() => setSelfieZoom(selectedDay.punch.checkIn.selfieUrl)}
                          className="flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                        >
                          <img
                            src={selectedDay.punch.checkIn.selfieUrl}
                            alt="Check-in selfie"
                            className="size-8 rounded-md object-cover border border-border"
                          />
                          <span>View Full Photo</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No check-in record for this day.</p>
                )}

                {/* Check Out Box */}
                {selectedDay.punch.checkOut ? (
                  <div className="p-3.5 rounded-md border border-border/60 bg-muted/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5" />
                        Check-Out Verification
                      </span>
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {formatTime(selectedDay.punch.checkOut.time)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {/* Location */}
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                          <MapPin className="size-3" /> Geofence:
                        </span>
                        <p className="font-medium text-foreground">
                          {selectedDay.punch.checkOut.withinGeofence
                            ? `Inside (${Math.round(selectedDay.punch.checkOut.distanceMeters)}m from office)`
                            : `Outside (${Math.round(selectedDay.punch.checkOut.distanceMeters)}m)`}
                        </p>
                      </div>

                      {/* Face Match */}
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                          <ShieldCheck className="size-3 text-emerald-500" /> Face Biometrics:
                        </span>
                        <p className="font-medium text-foreground">
                          {selectedDay.punch.checkOut.faceMatched
                            ? `Matched (${selectedDay.punch.checkOut.faceMatchConfidence?.toFixed(1)}%)`
                            : "Biometric Fail"}
                        </p>
                      </div>
                    </div>

                    {/* Selfie Image */}
                    {selectedDay.punch.checkOut.selfieUrl && (
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Camera className="size-3" /> Live Selfie Audit:
                        </span>
                        <button
                          onClick={() => setSelfieZoom(selectedDay.punch.checkOut.selfieUrl)}
                          className="flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                        >
                          <img
                            src={selectedDay.punch.checkOut.selfieUrl}
                            alt="Check-out selfie"
                            className="size-8 rounded-md object-cover border border-border"
                          />
                          <span>View Full Photo</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-md bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 text-xs text-amber-800 dark:text-amber-400 flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>No check-out timestamp recorded for this session.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2 text-center text-muted-foreground text-xs space-y-2">
                <p>No biometric punches recorded for this date.</p>
                {selectedDay.isLeave ? (
                  selectedDay.leave?.type === "Loss of Pay" ? (
                    <div className="p-3.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 text-left space-y-1.5">
                      <div className="flex items-center justify-between font-semibold text-xs text-indigo-700 dark:text-indigo-300">
                        <span>Approved Loss of Pay Leave</span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold">1x Pay Loss</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Leave requested and approved by HR without pay. Reason: <em>&quot;{selectedDay.leave?.reason || "N/A"}&quot;</em>.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-md bg-sky-50 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/50 text-left space-y-1.5">
                      <div className="flex items-center justify-between font-semibold text-xs text-sky-700 dark:text-sky-300">
                        <span>Approved Casual Leave</span>
                        <span className="px-2 py-0.5 rounded-md bg-sky-600 text-white text-[10px] font-bold">Paid Leave (0x)</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Covered by monthly casual leave quota. Reason: <em>&quot;{selectedDay.leave?.reason || "N/A"}&quot;</em>.
                      </p>
                    </div>
                  )
                ) : (
                  (selectedDay.status === "ABSENT" || selectedDay.isDoublePayLoss) && (
                    <div className="p-3.5 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/50 text-left space-y-1.5">
                      <div className="flex items-center justify-between font-semibold text-xs text-rose-700 dark:text-rose-300">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="size-3.5 text-rose-600" />
                          Unapproved Absence
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold">2x Pay Loss Penalty</span>
                      </div>
                      <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80 leading-relaxed">
                        Employee was absent without taking or requesting approved leave. Policy applied: <strong>Double Pay Loss (2 days salary deduction)</strong>.
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selfie Zoom Modal */}
      {selfieZoom && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelfieZoom(null)}
        >
          <div className="relative max-w-sm w-full bg-card p-3 rounded-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelfieZoom(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <img
              src={selfieZoom}
              alt="Biometric Capture Preview"
              className="w-full aspect-square object-cover rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
