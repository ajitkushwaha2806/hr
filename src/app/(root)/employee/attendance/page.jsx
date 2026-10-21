"use client";

import { useCalendar } from "@/store/hooks/useCalendar";
import { useAttendance } from "@/store/hooks/useAttendance";
import AttendanceCalendar from "@/components/pages/employee/dashboard/fragments/attendance-calendar";
import { Clock, CheckCircle2, ShieldCheck, Sparkles, MapPin, Calendar, Award } from "lucide-react";

export default function EmployeeAttendancePage() {
  const { year, month, days, todayString, isLoading: isCalendarLoading, nextMonth, prevMonth, jumpToToday } = useCalendar();

  const { todayStatus } = useAttendance();
  const punch = todayStatus?.todayPunch;
  const officeLocation = todayStatus?.officeLocation;
  const presentDays = days?.filter((d) => d.attendanceStatus === "PRESENT" || d.attendanceStatus === "HALF_DAY")?.length || 0;
  const lateDays = days?.filter((d) => {
    if (!d.punch?.checkInTime) return false;
    const checkIn = new Date(d.punch.checkInTime);
    return checkIn.getUTCHours() > 4 || (checkIn.getUTCHours() === 4 && checkIn.getUTCMinutes() > 0);
  })?.length || 0;
  const totalWorkedMinutes = days?.reduce((acc, d) => acc + (d.punch?.durationMinutes || 0), 0) || 0;
  const totalHours = Math.floor(totalWorkedMinutes / 60);

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 p-3 sm:p-5 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              My Attendance Records
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
              <Sparkles className="w-3 h-3" /> Biometric Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Your personal check-in records, working hours, and monthly attendance calendar.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-medium text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span>{officeLocation?.officeName || "Headquarters"} ({officeLocation?.radiusMeters || 200}m zone)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-medium">Days Present</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">{presentDays}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">This month</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-medium">Total Logged Time</span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">{totalHours}h {totalWorkedMinutes % 60}m</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Cumulative hours</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-medium">Late Check-Ins</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">{lateDays}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Shift start &gt; 9:30 AM</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-medium">Biometric Integrity</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">100%</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">AWS Rekognition verified</p>
        </div>
      </div>

      <AttendanceCalendar
        year={year}
        month={month}
        days={days}
        todayString={todayString}
        onNextMonth={nextMonth}
        onPrevMonth={prevMonth}
        onJumpToday={jumpToToday}
        isLoading={isCalendarLoading}
      />
    </div>
  );
}
