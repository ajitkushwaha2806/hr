"use client";
import React, { useState } from "react";
import { format } from "date-fns";
import {
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  X,
  Sun,
  Hourglass,
  XCircle,
  CalendarDays,
  CalendarCheck2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmployeeService } from "@/services/frontend/employee";
import useNotification from "@/store/hooks/useNotification";
import { useQueryClient } from "@tanstack/react-query";

export function AttendanceLogTable({
  dailyBreakdown = [],
  isLoading = false,
  employeeId,
  isTeamLead = false,
  onStatusUpdated,
}) {
  const notification = useNotification();
  const queryClient = useQueryClient();
  const [selectedSelfie, setSelectedSelfie] = useState(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleOpenEditModal = (day) => {
    setEditingDay(day);
    setOverrideStatus(day.manualOverride?.status || "");
  };

  const handleUpdateStatus = async () => {
    if (!editingDay || !overrideStatus || !employeeId) return;
    setIsUpdatingStatus(true);
    try {
      await EmployeeService.updateAttendanceStatus(employeeId, {
        date: editingDay.date,
        status: overrideStatus,
      });
      queryClient.invalidateQueries({ queryKey: ["organization-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-today-status"] });
      notification.success(
        overrideStatus === "RESET"
          ? `Attendance for ${editingDay.date} reset to automatic biometric status.`
          : `Attendance for ${editingDay.date} updated to ${overrideStatus}.`
      );
      setEditingDay(null);
      setOverrideStatus("");
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      notification.error(err?.message || "Failed to update attendance status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const INITIAL_VISIBLE = 5;

  // Filter out future days to make the table focused on past & current days
  const activeDays = dailyBreakdown.filter((d) => !d.isFuture);
  const mobileVisibleDays = isMobileExpanded ? activeDays : activeDays.slice(0, INITIAL_VISIBLE);
  const hasMoreMobile = activeDays.length > INITIAL_VISIBLE;

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
            <span className="size-1.5 rounded-full bg-sky-500" /> {d.leaveTypeLabel || (d.leave?.type === "Loss of Pay" ? "Loss of Pay (0.5d)" : "Casual Leave (0.5d)")}
          </span>
        );
      case "ON_LEAVE":
      case "FULL_DAY_LEAVE":
        if (d.leave?.type === "Loss of Pay") {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400">
              <span className="size-1.5 rounded-full bg-indigo-500" /> Loss of Pay (1x LOP)
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-400">
            <span className="size-1.5 rounded-full bg-sky-500" /> Casual Leave (Paid)
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
            <AlertCircle className="size-3" /> Half Day (No Out)
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
      case "DOUBLE_PAY_LOSS":
      case "ABSENT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400">
            <span className="size-1.5 rounded-full bg-rose-500" /> Absent (2x LOP)
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
    if (d.status === "ABSENT" || d.isDoublePayLoss) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/50 text-[10px] font-semibold">
          <XCircle className="size-2.5" /> 2x Pay Loss (-2.0d)
        </span>
      );
    }
    if (d.leave?.type === "Loss of Pay") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50 text-[10px] font-semibold">
          <CalendarDays className="size-2.5" /> 1x LOP (-{d.isHalfDay ? "0.5" : "1.0"}d)
        </span>
      );
    }
    if (d.leave?.type === "Casual Leave") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/50 text-[10px] font-semibold">
          <CalendarCheck2 className="size-2.5" /> Paid Leave (0.0d)
        </span>
      );
    }
    if (d.isHalfDay) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50 text-[10px] font-semibold">
          <Hourglass className="size-2.5" /> Half Day (0.5d)
        </span>
      );
    }
    if (d.isFullDay) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50 text-[10px] font-semibold">
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
      <div className="bg-card border border-border/60 rounded-md p-4 shadow-2xs space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-muted/30 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-md shadow-2xs overflow-hidden">
      <div className="p-3.5 sm:p-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 min-w-0">
        <h3 className="font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2 truncate">
          <Clock className="size-4 text-primary shrink-0" />
          <span className="truncate">Day-by-Day Attendance Log</span>
        </h3>
        <span className="text-[11px] sm:text-xs text-muted-foreground shrink-0">
          Showing {mobileVisibleDays.length} of {activeDays.length} days recorded
        </span>
      </div>

      {/* Mobile Card View (sm:hidden) */}
      <div className="divide-y divide-border/40 sm:hidden">
        {activeDays.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No attendance records found for this period.
          </div>
        ) : (
          mobileVisibleDays.map((d) => {
            const punch = d.punch;
            const checkIn = punch?.checkIn;
            const checkOut = punch?.checkOut;

            return (
              <div
                key={`mobile-${d.date}`}
                className={`p-3 space-y-2 transition-colors ${d.isToday ? "bg-primary/5" : ""}`}
              >
                {/* Top: Date & Status */}
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-xs text-foreground truncate">
                        {format(new Date(d.date), "EEE, MMM dd")}
                      </span>
                      {d.isToday && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-primary text-primary-foreground shrink-0">
                          TODAY
                        </span>
                      )}
                    </div>
                    {d.calendarTitle && (
                      <p className="text-[10.5px] text-purple-600 dark:text-purple-400 font-medium truncate mt-0.5">
                        {d.calendarTitle}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    {getStatusBadge(d)}
                    {!isTeamLead && employeeId && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(d)}
                        className="p-1 text-muted-foreground hover:text-primary rounded-md border border-border/50 hover:bg-muted cursor-pointer"
                        title="Edit Attendance Status"
                      >
                        <Pencil className="size-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* In / Out / Duration Stats OR Classification Strip */}
                {(checkIn || checkOut) ? (
                  <div className="grid grid-cols-3 gap-2 p-2 rounded-md bg-muted/30 border border-border/40 text-[11px]">
                    {/* Check In */}
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold block">
                        In
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="font-mono font-bold text-foreground">
                          {formatTime(checkIn?.time)}
                        </span>
                        {checkIn?.selfieUrl && (
                          <button
                            onClick={() =>
                              setSelectedSelfie({
                                title: `Check-In Selfie · ${format(new Date(d.date), "MMM dd, yyyy")}`,
                                url: checkIn.selfieUrl,
                                confidence: checkIn.faceMatchConfidence,
                                distance: checkIn.distanceMeters,
                              })
                            }
                            className="size-4 rounded-md overflow-hidden border border-border cursor-pointer shrink-0"
                            title="View Check-In Selfie"
                          >
                            <img src={checkIn.selfieUrl} alt="Selfie" className="size-full object-cover" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Check Out */}
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold block">
                        Out
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="font-mono font-bold text-foreground">
                          {formatTime(checkOut?.time)}
                        </span>
                        {checkOut?.selfieUrl && (
                          <button
                            onClick={() =>
                              setSelectedSelfie({
                                title: `Check-Out Selfie · ${format(new Date(d.date), "MMM dd, yyyy")}`,
                                url: checkOut.selfieUrl,
                                confidence: checkOut.faceMatchConfidence,
                                distance: checkOut.distanceMeters,
                              })
                            }
                            className="size-4 rounded-md overflow-hidden border border-border cursor-pointer shrink-0"
                            title="View Check-Out Selfie"
                          >
                            <img src={checkOut.selfieUrl} alt="Selfie" className="size-full object-cover" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Duration & Policy */}
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold block">
                        Duration
                      </span>
                      <span className="font-semibold text-foreground mt-0.5 block truncate">
                        {punch?.durationMinutes
                          ? `${Math.floor(punch.durationMinutes / 60)}h ${punch.durationMinutes % 60}m`
                          : "—"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-md bg-muted/20 border border-border/40 text-[11px] min-w-0">
                    <span className="text-muted-foreground text-[10.5px] truncate">
                      {d.status === "ABSENT" ? "No punches recorded" : d.calendarTitle || "Scheduled day off"}
                    </span>
                    <div className="shrink-0">{getShiftClassificationBadge(d)}</div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* View More / View Less Toggle on Mobile */}
        {hasMoreMobile && (
          <div className="p-2.5 text-center border-t border-border/40 bg-muted/10">
            <button
              type="button"
              onClick={() => setIsMobileExpanded((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
            >
              {isMobileExpanded ? (
                <>
                  <span>Show less (recent {INITIAL_VISIBLE} days)</span>
                  <ChevronUp className="size-3.5" />
                </>
              ) : (
                <>
                  <span>View {activeDays.length - INITIAL_VISIBLE} more days...</span>
                  <ChevronDown className="size-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
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
              {!isTeamLead && employeeId && (
                <th className="py-2.5 px-4 text-right">Action</th>
              )}
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
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-primary text-primary-foreground">
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

                    {/* Admin Override Action */}
                    {!isTeamLead && employeeId && (
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(d)}
                          className="size-7 p-0 rounded-md text-muted-foreground hover:text-primary hover:bg-muted ml-auto flex items-center justify-center cursor-pointer"
                          title="Edit Attendance Status"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </td>
                    )}
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
          className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedSelfie(null)}
        >
          <div
            className="bg-card text-card-foreground border border-border p-4 rounded-md max-w-sm w-full space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <h4 className="font-semibold text-xs truncate">{selectedSelfie.title}</h4>
              <button
                onClick={() => setSelectedSelfie(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="relative aspect-square w-full rounded-md overflow-hidden border border-border bg-black">
              <img
                src={selectedSelfie.url}
                alt="Audit Selfie"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[11px] p-2 rounded-md flex items-center justify-between">
                <span>Face Match: {selectedSelfie.confidence?.toFixed(1)}%</span>
                <span>Distance: {Math.round(selectedSelfie.distance)}m</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Status Override Modal */}
      {editingDay && (
        <div
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setEditingDay(null)}
        >
          <div
            className="bg-card text-card-foreground border border-border p-4 sm:p-5 rounded-md max-w-md w-full space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Pencil className="size-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Change Attendance Status</h4>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(editingDay.date), "EEEE, MMMM dd, yyyy")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingDay(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-md bg-muted/30 border border-border/50 flex items-center justify-between">
                <span className="text-muted-foreground">Current Status:</span>
                <div>{getStatusBadge(editingDay)}</div>
              </div>

              {editingDay.manualOverride?.isOverridden && (
                <div className="p-2 rounded-md bg-primary/10 border border-primary/20 text-[11px] text-primary">
                  Currently overridden to <strong>{editingDay.manualOverride.status}</strong> by{" "}
                  {editingDay.manualOverride.overriddenByName || "Admin"}.
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-semibold text-xs text-foreground block">
                  Select New Status (Admin Only)
                </label>
                <Select value={overrideStatus} onValueChange={setOverrideStatus}>
                  <SelectTrigger className="w-full h-9 text-xs rounded-md">
                    <SelectValue placeholder="Choose attendance status..." />
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
                    {editingDay.manualOverride?.isOverridden && (
                      <SelectItem value="RESET" className="text-xs font-semibold text-rose-600">
                        ↺ Reset to Automatic Biometric Calculation
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingDay(null)}
                  disabled={isUpdatingStatus}
                  className="h-8 text-xs rounded-md"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleUpdateStatus}
                  disabled={isUpdatingStatus || !overrideStatus}
                  className="h-8 text-xs gap-1.5 rounded-md"
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Check className="size-3.5" />
                  )}
                  <span>Apply Status</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
