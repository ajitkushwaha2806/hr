"use client";
import React, { useState } from "react";
import { format } from "date-fns";
import { Clock, MapPin, ShieldCheck, AlertCircle, X, Sun, Hourglass } from "lucide-react";

export function AttendanceLogTable({ dailyBreakdown = [], isLoading = false }) {
  const [selectedSelfie, setSelectedSelfie] = useState(null);

  // Filter out future days to make the table focused on past & current days
  const activeDays = dailyBreakdown.filter((d) => !d.isFuture);

  const formatTime = (timeStr) => {
    if (!timeStr) return "—";
    try {
      return format(new Date(timeStr), "hh:mm a");
    } catch {
      return timeStr;
    }
  };

  const getStatusBadge = (d) => {
    switch (d.status) {
      case "PRESENT":
      case "FULL_DAY_PRESENT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Full Day
          </span>
        );
      case "HALF_DAY":
      case "HALF_DAY_PRESENT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
            <span className="size-1.5 rounded-full bg-amber-500" /> Half Day
          </span>
        );
      case "HALF_DAY_LEAVE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-400">
            <span className="size-1.5 rounded-full bg-sky-500" /> {d.leaveTypeLabel || "Half Day Leave"}
          </span>
        );
      case "ON_LEAVE":
      case "FULL_DAY_LEAVE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
            <span className="size-1.5 rounded-full bg-blue-500" /> Full Day Leave
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" /> Clocked In
          </span>
        );
      case "NO_PUNCH_OUT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-400">
            <AlertCircle className="size-3" /> No Checkout
          </span>
        );
      case "HOLIDAY":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400">
            <span className="size-1.5 rounded-full bg-purple-500" /> Holiday
          </span>
        );
      case "WEEKLY_OFF":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Weekly Off
          </span>
        );
      case "ABSENT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400">
            <span className="size-1.5 rounded-full bg-rose-500" /> Absent
          </span>
        );
      case "NOT_MARKED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600">
            Not Marked
          </span>
        );
      default:
        return (
          <span className="text-[11px] text-muted-foreground">—</span>
        );
    }
  };

  const getShiftClassificationBadge = (d) => {
    if (d.isHalfDay) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50 text-[10px] font-semibold">
          <Hourglass className="size-2.5" /> Half Day (0.5d)
        </span>
      );
    }
    if (d.isFullDay) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50 text-[10px] font-semibold">
          <Sun className="size-2.5" /> Full Day (1.0d)
        </span>
      );
    }
    if (d.status === "HOLIDAY" || d.status === "WEEKLY_OFF") {
      return <span className="text-[11px] text-muted-foreground/60">Non-working</span>;
    }
    return <span className="text-[11px] text-muted-foreground/60">—</span>;
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border/60 rounded-xl p-4 shadow-2xs space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-muted/30 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-xl shadow-2xs overflow-hidden">
      <div className="p-4 border-b border-border/60 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          Day-by-Day Attendance Log
        </h3>
        <span className="text-xs text-muted-foreground">
          Showing {activeDays.length} days recorded
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
            <tr>
              <th className="py-2.5 px-4">Date</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4">Shift Type</th>
              <th className="py-2.5 px-4">Check-In</th>
              <th className="py-2.5 px-4">Check-Out</th>
              <th className="py-2.5 px-4">Duration</th>
              <th className="py-2.5 px-4">Verification Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-medium">
            {activeDays.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                  No attendance records found for this period.
                </td>
              </tr>
            ) : (
              activeDays.map((d) => {
                const punch = d.punch;
                const checkIn = punch?.checkIn;
                const checkOut = punch?.checkOut;

                return (
                  <tr
                    key={d.date}
                    className={`hover:bg-muted/20 transition-colors ${
                      d.isToday ? "bg-primary/5" : ""
                    }`}
                  >
                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {format(new Date(d.date), "MMM dd, yyyy")}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          ({d.dayOfWeek})
                        </span>
                        {d.isToday && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary text-primary-foreground">
                            TODAY
                          </span>
                        )}
                      </div>
                      {d.calendarTitle && (
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 font-normal">
                          {d.calendarTitle}
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(d)}
                    </td>

                    {/* Shift Classification */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getShiftClassificationBadge(d)}
                    </td>

                    {/* Check In */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {checkIn ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-foreground">
                            {formatTime(checkIn.time)}
                          </span>
                          {checkIn.selfieUrl && (
                            <button
                              onClick={() =>
                                setSelectedSelfie({
                                  title: `Check-In Selfie · ${format(new Date(d.date), "MMM dd, yyyy")}`,
                                  url: checkIn.selfieUrl,
                                  confidence: checkIn.faceMatchConfidence,
                                  distance: checkIn.distanceMeters,
                                })
                              }
                              className="size-6 rounded-md overflow-hidden border border-border hover:ring-2 hover:ring-primary cursor-pointer shrink-0"
                              title="View Check-In Selfie"
                            >
                              <img
                                src={checkIn.selfieUrl}
                                alt="Selfie"
                                className="size-full object-cover"
                              />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>

                    {/* Check Out */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {checkOut ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-foreground">
                            {formatTime(checkOut.time)}
                          </span>
                          {checkOut.selfieUrl && (
                            <button
                              onClick={() =>
                                setSelectedSelfie({
                                  title: `Check-Out Selfie · ${format(new Date(d.date), "MMM dd, yyyy")}`,
                                  url: checkOut.selfieUrl,
                                  confidence: checkOut.faceMatchConfidence,
                                  distance: checkOut.distanceMeters,
                                })
                              }
                              className="size-6 rounded-md overflow-hidden border border-border hover:ring-2 hover:ring-primary cursor-pointer shrink-0"
                              title="View Check-Out Selfie"
                            >
                              <img
                                src={checkOut.selfieUrl}
                                alt="Selfie"
                                className="size-full object-cover"
                              />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {punch?.durationMinutes > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">
                            {Math.floor(punch.durationMinutes / 60)}h {punch.durationMinutes % 60}m
                          </span>
                          {d.isHalfDay && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                              (&lt;4h)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>

                    {/* Verification Audit */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {checkIn ? (
                        <div className="flex items-center gap-3 text-[11px]">
                          <span
                            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium"
                            title={`Face confidence: ${checkIn.faceMatchConfidence?.toFixed(1)}%`}
                          >
                            <ShieldCheck className="size-3" />
                            {checkIn.faceMatchConfidence?.toFixed(0)}% Face
                          </span>
                          <span
                            className="inline-flex items-center gap-1 text-muted-foreground"
                            title={`Distance: ${Math.round(checkIn.distanceMeters)}m from office`}
                          >
                            <MapPin className="size-3" />
                            {Math.round(checkIn.distanceMeters)}m
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Selfie Preview Modal */}
      {selectedSelfie && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedSelfie(null)}
        >
          <div
            className="bg-card text-card-foreground border border-border p-4 rounded-2xl max-w-sm w-full space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <h4 className="font-semibold text-xs truncate">{selectedSelfie.title}</h4>
              <button
                onClick={() => setSelectedSelfie(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-border bg-black">
              <img
                src={selectedSelfie.url}
                alt="Audit Selfie"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[11px] p-2 rounded-lg flex items-center justify-between">
                <span>Face Match: {selectedSelfie.confidence?.toFixed(1)}%</span>
                <span>Distance: {Math.round(selectedSelfie.distance)}m</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
