"use client";

import { useState, useEffect } from "react";
import {
  LogOut,
  MapPin,
  CheckCircle2,
  Clock,
  Camera,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Timer,
  AlertCircle,
  Building2,
} from "lucide-react";
import BiometricCheckInModal from "./biometric-checkin-modal";

export default function AttendancePunchBar({
  todayStatus,
  onRefresh,
}) {
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [punchMode, setPunchMode] = useState("check-in"); // "check-in" | "check-out"
  const [now, setNow] = useState(new Date());

  // Real-time ticking clock for live punch accuracy
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const punch = todayStatus?.todayPunch;
  const officeLocation = todayStatus?.officeLocation;
  const employee = todayStatus?.employee;

  const hasCheckedIn = Boolean(punch?.checkIn?.status === "SUCCESS");
  const hasCheckedOut = Boolean(punch?.checkOut?.status === "SUCCESS");

  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return "";
    }
  };

  const handleOpenCheckIn = () => {
    setPunchMode("check-in");
    setIsCheckInModalOpen(true);
  };

  const handleOpenCheckOut = () => {
    setPunchMode("check-out");
    setIsCheckInModalOpen(true);
  };

  const checkInTime = punch?.checkIn?.time ? formatTime(punch.checkIn.time) : null;
  const checkOutTime = punch?.checkOut?.time ? formatTime(punch.checkOut.time) : null;

  // Real-time live elapsed duration when checked in
  const calculateLiveDuration = () => {
    if (!punch?.checkIn?.time) return null;
    const start = new Date(punch.checkIn.time).getTime();
    const end = hasCheckedOut && punch?.checkOut?.time ? new Date(punch.checkOut.time).getTime() : now.getTime();
    const diffSecs = Math.max(0, Math.floor((end - start) / 1000));
    const h = Math.floor(diffSecs / 3600);
    const m = Math.floor((diffSecs % 3600) / 60);
    const s = diffSecs % 60;
    return {
      formatted: `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`,
      totalMinutes: Math.floor(diffSecs / 60),
      hours: h,
      minutes: m,
    };
  };

  const liveDuration = hasCheckedIn ? calculateLiveDuration() : null;

  const loggedDuration = punch?.durationMinutes != null
    ? `${Math.floor(punch.durationMinutes / 60)}h ${punch.durationMinutes % 60}m`
    : liveDuration ? `${liveDuration.hours}h ${liveDuration.minutes}m` : null;

  // Percentage for standard 9-hour work shift (540 minutes)
  const shiftProgressPercent = liveDuration
    ? Math.min(100, Math.round((liveDuration.totalMinutes / 540) * 100))
    : 0;

  // Format current live time elements
  const hoursRaw = now.getHours();
  const ampm = hoursRaw >= 12 ? "PM" : "AM";
  const hours12 = hoursRaw % 12 || 12;
  const minutesFormatted = String(now.getMinutes()).padStart(2, "0");
  const secondsFormatted = String(now.getSeconds()).padStart(2, "0");

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <div className="w-full rounded-md border border-border/80 bg-white dark:bg-zinc-900 p-4 sm:p-5 shadow-xs transition-all relative overflow-hidden">
        {/* Top Mobile Bar: Status Badge + Date Pill */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            {hasCheckedOut ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Shift Completed
              </span>
            ) : hasCheckedIn ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                On Shift • Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Pending Check-In
              </span>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground bg-muted/60 dark:bg-zinc-800/60 px-2.5 py-1 rounded-md border border-border/40">
            <Calendar className="w-3 h-3 text-muted-foreground/80" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Center Live Hero: Real-Time Punch Clock & Shift Overview */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Real-time Punch Clock
            </span>

            {/* Live Ticking Time Display */}
            <div className="flex items-baseline gap-1 font-mono tracking-tight text-foreground select-none">
              <span className="text-3xl sm:text-4xl font-extrabold font-sans">
                {String(hours12).padStart(2, "0")}:{minutesFormatted}
              </span>
              <span className="text-lg sm:text-xl font-bold text-muted-foreground/80 font-sans">
                :{secondsFormatted}
              </span>
              <span className="text-[11px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-muted/80 text-muted-foreground tracking-wider ml-1">
                {ampm}
              </span>
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1 pt-0.5">
              {hasCheckedOut ? (
                <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Total work time logged: {loggedDuration}
                </span>
              ) : hasCheckedIn ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 font-mono text-[11.5px]">
                  <Timer className="w-3.5 h-3.5" /> Elapsed: {liveDuration?.formatted}
                </span>
              ) : (
                <span>Regular Shift Window: 09:30 AM – 06:30 PM (9 hrs)</span>
              )}
            </p>
          </div>

          {/* Location & Biometric Badges */}
          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-xs">
            {officeLocation?.officeName ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-zinc-800/80 border border-border/60 text-foreground font-medium text-[11.5px]">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate max-w-[160px] sm:max-w-[200px]">
                  {officeLocation.officeName}
                </span>
                <span className="size-1.5 rounded-full bg-emerald-500" title="Within Allowed Radius" />
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-zinc-800/80 border border-border/60 text-muted-foreground text-[11.5px]">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>Headquarters</span>
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-zinc-800/80 border border-border/60 text-muted-foreground text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Face ID Geofence</span>
            </div>
          </div>
        </div>

        {/* Active Shift Progress Bar (Shown while clocked in) */}
        {hasCheckedIn && !hasCheckedOut && (
          <div className="pt-1 pb-3">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-1.5">
              <span className="flex items-center gap-1">
                <span>In at {checkInTime}</span>
              </span>
              <span>{shiftProgressPercent}% of 9h Goal</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-md overflow-hidden border border-border/40">
              <div
                className="h-full bg-emerald-600 rounded-md transition-all duration-500"
                style={{ width: `${Math.max(5, shiftProgressPercent)}%` }}
              />
            </div>
          </div>
        )}

        {/* Shift Completed Timestamp Summary Grid */}
        {hasCheckedOut && (
          <div className="grid grid-cols-2 gap-2 pt-1 pb-3">
            <div className="p-2.5 rounded-md bg-muted/40 dark:bg-zinc-800/40 border border-border/50 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Punch In</span>
              <span className="text-sm font-bold text-foreground mt-0.5">{checkInTime || "--:--"}</span>
            </div>
            <div className="p-2.5 rounded-md bg-muted/40 dark:bg-zinc-800/40 border border-border/50 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Punch Out</span>
              <span className="text-sm font-bold text-foreground mt-0.5">{checkOutTime || "--:--"}</span>
            </div>
          </div>
        )}

        {/* Action Button - rounded-md with solid single color, no gradients */}
        <div className="pt-2">
          {!hasCheckedIn && (
            <button
              type="button"
              onClick={handleOpenCheckIn}
              className="w-full h-12 rounded-md bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors cursor-pointer group shadow-xs"
            >
              <Camera className="w-4 h-4 text-white" />
              <span>Check In Now</span>
              <ChevronRight className="w-4 h-4 text-white/80 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}

          {hasCheckedIn && !hasCheckedOut && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleOpenCheckOut}
                className="w-full h-12 rounded-md bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors cursor-pointer group shadow-xs"
              >
                <LogOut className="w-4 h-4 text-white" />
                <span>Check Out (End Shift)</span>
                <ChevronRight className="w-4 h-4 text-white/80 transition-transform group-hover:translate-x-0.5" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-center px-1 pt-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight">
                  <strong className="text-foreground font-semibold">Important:</strong> Remember to check out before leaving. Missing punch-out is automatically marked as <span className="text-rose-600 dark:text-rose-400 font-semibold">Full-Day Absent</span>.
                </p>
              </div>
            </div>
          )}

          {hasCheckedOut && (
            <div className="w-full h-11 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Today&apos;s Attendance Completed 🎉</span>
            </div>
          )}
        </div>

        {/* Warning if no face enrolled */}
        {employee && !employee.hasEnrolledFace && (
          <div className="mt-3 p-2.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-xs text-amber-700 dark:text-amber-300 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Face biometric not registered yet. Please visit <strong>Profile</strong> to enable seamless 1-tap punch.</span>
          </div>
        )}
      </div>

      {/* Biometric Check-In / Check-Out Modal */}
      <BiometricCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        mode={punchMode}
        officeLocation={officeLocation}
        employee={employee}
        onSuccess={onRefresh}
      />
    </>
  );
}
