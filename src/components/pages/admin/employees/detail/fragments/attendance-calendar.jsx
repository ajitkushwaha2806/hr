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
} from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AttendanceCalendar({
  year,
  month,
  dailyBreakdown = [],
  isLoading = false,
}) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [selfieZoom, setSelfieZoom] = useState(null);

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
          fullLabel: "Half Day Present (<4h)",
          badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800",
          dot: "bg-amber-500",
          cardBorder: "border-amber-300/80 dark:border-amber-800/60 hover:border-amber-400",
          bgTint: "bg-card hover:bg-amber-50/25 dark:hover:bg-amber-950/10",
        };
      case "HALF_DAY_LEAVE":
        return {
          label: item.leaveTypeLabel || "Half Day Leave",
          fullLabel: item.leaveTypeLabel || "Half Day Leave (0.5d)",
          badgeBg: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-400 border-sky-300 dark:border-sky-800",
          dot: "bg-sky-500",
          cardBorder: "border-border/60 hover:border-sky-400/60",
          bgTint: "bg-card hover:bg-sky-50/20 dark:hover:bg-sky-950/10",
        };
      case "ON_LEAVE":
      case "FULL_DAY_LEAVE":
        return {
          label: "Full Day Leave",
          fullLabel: "Full Day Approved Leave",
          badgeBg: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border-blue-300 dark:border-blue-800",
          dot: "bg-blue-500",
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
          label: "No Checkout",
          fullLabel: "Missed Punch Out",
          badgeBg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800",
          dot: "bg-yellow-500",
          cardBorder: "border-yellow-300 dark:border-yellow-800/60",
          bgTint: "bg-yellow-50/20 dark:bg-yellow-950/10",
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
      case "ABSENT":
        return {
          label: "Absent",
          fullLabel: "Absent / No Attendance",
          badgeBg: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800",
          dot: "bg-rose-500",
          cardBorder: "border-border/60 hover:border-rose-400/60",
          bgTint: "bg-card hover:bg-rose-50/20 dark:hover:bg-rose-950/10",
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
      <div className="bg-card border border-border/60 rounded-xl p-4 sm:p-6 shadow-2xs">
        <div className="grid grid-cols-7 gap-2 mb-3">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center font-medium text-xs text-muted-foreground py-1">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-24 sm:h-28 rounded-lg bg-muted/40 animate-pulse border border-border/30" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-xl p-3 sm:p-5 shadow-2xs space-y-4">
      {/* Calendar Header info & legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div>
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <CalendarIcon className="size-4 text-primary" />
            Monthly Attendance Calendar
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click on any day to inspect check-in/out timestamps, selfie captures, and geofence verification
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2.5 flex-wrap text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500" /> Full Day
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-500" /> Half Day
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-rose-500" /> Absent
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-sky-500" /> Half Leave
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-blue-500" /> Full Leave
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-purple-500" /> Holiday
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-zinc-400" /> Weekend
          </span>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAYS.map((dayName, idx) => (
          <div
            key={dayName}
            className={`text-center font-semibold text-xs py-1.5 uppercase tracking-wider ${
              idx === 0 || idx === 6 ? "text-muted-foreground/80" : "text-foreground"
            }`}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {/* Leading empty placeholder cells */}
        {[...Array(firstDayOfWeek)].map((_, i) => (
          <div
            key={`empty-${i}`}
            className="h-20 sm:h-28 rounded-lg bg-muted/10 border border-transparent"
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
              onClick={() => isClickable && setSelectedDay(item)}
              className={`group relative h-20 sm:h-28 rounded-lg border p-1.5 sm:p-2 flex flex-col justify-between transition-all duration-150 ${
                config.cardBorder
              } ${config.bgTint} ${
                isClickable ? "cursor-pointer hover:shadow-xs" : ""
              } ${item.isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}`}
            >
              {/* Day number & Status badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs sm:text-sm font-semibold rounded-full size-6 flex items-center justify-center ${
                    item.isToday
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-foreground group-hover:text-primary transition-colors"
                  }`}
                >
                  {item.day}
                </span>

                <span
                  className={`text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full border truncate max-w-[65px] sm:max-w-[85px] ${config.badgeBg}`}
                  title={config.label}
                >
                  {config.label}
                </span>
              </div>

              {/* Punch / Info Content */}
              <div className="mt-1 flex flex-col justify-end text-[10px] sm:text-[11px] space-y-0.5 overflow-hidden">
                {checkIn && (
                  <div className="flex items-center gap-1 text-muted-foreground truncate">
                    <Clock className="size-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-mono">{formatTime(checkIn.time)}</span>
                  </div>
                )}

                {checkOut && (
                  <div className="flex items-center gap-1 text-muted-foreground truncate">
                    <Clock className="size-2.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="font-mono">{formatTime(checkOut.time)}</span>
                  </div>
                )}

                {durationHours && (
                  <div className="hidden sm:flex items-center justify-between text-[10px] font-semibold text-foreground/80 truncate">
                    <span>{durationHours}</span>
                    {item.isHalfDay && (
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">
                        (0.5d)
                      </span>
                    )}
                  </div>
                )}

                {item.calendarType === "HOLIDAY" && item.calendarTitle && (
                  <p className="text-[10px] text-purple-700 dark:text-purple-300 font-medium truncate">
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

      {/* Day Inspection Modal */}
      {selectedDay && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedDay(null)}
        >
          <div
            className="bg-card text-card-foreground border border-border p-5 rounded-2xl max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
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
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Shift & Day Type Classification Banner */}
            <div className="p-3 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between text-xs">
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
                  ? "Half Day Shift (<4h or Half Day Session = 0.5d)"
                  : selectedDay.isFullDay
                  ? "Full Day Shift (Standard 4h+ Completed = 1.0d)"
                  : selectedDay.leaveTypeLabel || getStatusConfig(selectedDay).fullLabel}
              </span>
            </div>

            {/* Check-In & Check-Out Details */}
            {selectedDay.punch ? (
              <div className="space-y-4">
                {/* Duration Banner */}
                {selectedDay.punch.durationMinutes > 0 && (
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total Time Logged:</span>
                    <span className="font-bold text-sm text-primary">
                      {Math.floor(selectedDay.punch.durationMinutes / 60)} hrs{" "}
                      {selectedDay.punch.durationMinutes % 60} mins{" "}
                      {selectedDay.punch.durationMinutes >= 240 ? (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          (Full Day Qualified)
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                          (Half Day Qualified)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {/* Check In Box */}
                {selectedDay.punch.checkIn ? (
                  <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-3">
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
                            className="size-8 rounded-lg object-cover border border-border"
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
                  <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-3">
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
                            className="size-8 rounded-lg object-cover border border-border"
                          />
                          <span>View Full Photo</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 text-xs text-amber-800 dark:text-amber-400 flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>No check-out timestamp recorded for this session.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground text-xs space-y-1">
                <p>No biometric punches recorded for this date.</p>
                {selectedDay.isLeave && (
                  <p className="text-sky-600 dark:text-sky-400 font-medium">
                    This day is covered by an approved leave request ({selectedDay.leaveTypeLabel || "Leave"}).
                  </p>
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
          <div className="relative max-w-sm w-full bg-card p-3 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelfieZoom(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <img
              src={selfieZoom}
              alt="Biometric Capture Preview"
              className="w-full aspect-square object-cover rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
