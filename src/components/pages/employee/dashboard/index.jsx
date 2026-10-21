"use client";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalendar } from "@/store/hooks/useCalendar";
import { useAttendance } from "@/store/hooks/useAttendance";
import AttendanceCalendar from "./fragments/attendance-calendar";
import AttendancePunchBar from "./fragments/attendance-punch-bar";
import { CheckCircle2, Clock, AlertCircle, Briefcase } from "lucide-react";

export default function EmployeeDashboard() {
  const { user } = useUser();
  const { year, month, days = [], todayString, isLoading: isCalendarLoading, isFetching: isCalendarFetching, nextMonth, prevMonth, jumpToToday } = useCalendar();
  const { todayStatus, refreshAttendance, isLoading: isAttendanceLoading } = useAttendance();

  const employee = todayStatus?.employee;
  const displayName = employee?.name || user?.firstName || user?.fullName || "Employee";

  const presentDays = days.filter((d) => d.attendanceStatus === "PRESENT" || d.attendanceStatus === "HALF_DAY").length;
  const workingDays = days.filter((d) => d.type === "WORKING_DAY").length;
  const totalWorkedMinutes = days.reduce((acc, d) => acc + (d.punch?.durationMinutes || 0), 0);
  const totalHours = Math.floor(totalWorkedMinutes / 60);
  const remainingMinutes = totalWorkedMinutes % 60;
  const lateDays = days.filter((d) => {
    if (!d.punch?.checkInTime) return false;
    const checkIn = new Date(d.punch.checkInTime);
    return checkIn.getHours() > 9 || (checkIn.getHours() === 9 && checkIn.getMinutes() > 30);
  }).length;

  const getGreetingData = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", emoji: "☀️" };
    if (hour < 17) return { text: "Good afternoon", emoji: "👋" };
    if (hour < 21) return { text: "Good evening", emoji: "🌆" };
    return { text: "Good night", emoji: "🌙" };
  };

  const { text: greetingText, emoji: greetingEmoji } = getGreetingData();

  return (
    <div className="w-full bg-slate-50/60 dark:bg-zinc-950 px-3 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-3 sm:pb-6">
      <div className="flex items-center justify-between gap-3 px-2 pt-1">
        {!user && isAttendanceLoading ? (
          <div className="min-w-0 space-y-1.5">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-7 w-48 rounded-md" />
          </div>
        ) : (
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground">
              <span>{greetingText}</span>
              <span className="text-sm select-none">{greetingEmoji}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
              {displayName}
            </h1>
          </div>
        )}

        {!user && isAttendanceLoading ? (
          <Skeleton className="size-11 sm:size-12 rounded-xl shrink-0" />
        ) : (
          <Link
            href="/employee/profile"
            className="relative shrink-0 block group transition-transform active:scale-95"
            title="View Employee Profile"
          >
            <div className="size-11 sm:size-12 rounded-xl border border-border/80 overflow-hidden bg-muted group-hover:border-emerald-500/60 shadow-2xs transition-colors">
              <img
                src={employee?.avatar || user?.imageUrl || "/placeholder.png"}
                alt={displayName}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/placeholder.png";
                }}
                className="w-full h-full object-cover"
              />
            </div>
            {todayStatus?.hasCheckedIn && (
              <span
                className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 border-2 border-background"
                title="Checked in today"
              />
            )}
          </Link>
        )}
      </div>

      <AttendancePunchBar
        todayStatus={todayStatus}
        onRefresh={refreshAttendance}
        isLoading={isAttendanceLoading}
      />

      {isCalendarLoading && days.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`stat-skeleton-${i}`}
              className="p-3.5 rounded-md bg-white dark:bg-zinc-900 border border-border/70 shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="size-6 rounded-md" />
              </div>
              <div className="mt-3 space-y-1.5">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-3 w-14 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="p-3.5 rounded-md bg-white dark:bg-zinc-900 border border-border/70 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">Present</span>
              <div className="size-6 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg font-extrabold text-foreground tracking-tight">
                {presentDays} <span className="text-xs font-medium text-muted-foreground">/ {workingDays}</span>
              </div>
              <p className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                Days Present
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-md bg-white dark:bg-zinc-900 border border-border/70 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">Logged Time</span>
              <div className="size-6 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg font-extrabold text-foreground tracking-tight">
                {totalHours}<span className="text-xs font-semibold text-muted-foreground">h </span>
                {remainingMinutes}<span className="text-xs font-semibold text-muted-foreground">m</span>
              </div>
              <p className="text-[10.5px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                Cumulative Hours
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-md bg-white dark:bg-zinc-900 border border-border/70 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">Late Check-Ins</span>
              <div className="size-6 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg font-extrabold text-foreground tracking-tight">
                {lateDays}
              </div>
              <p className="text-[10.5px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                Shift after 9:30 AM
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-md bg-white dark:bg-zinc-900 border border-border/70 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">Working Days</span>
              <div className="size-6 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg font-extrabold text-foreground tracking-tight">
                {workingDays} <span className="text-xs font-medium text-muted-foreground">Days</span>
              </div>
              <p className="text-[10.5px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                Scheduled this Month
              </p>
            </div>
          </div>
        </div>
    )}

      <div className="pt-1">
        <AttendanceCalendar
          year={year}
          month={month}
          days={days}
          todayString={todayString}
          onNextMonth={nextMonth}
          onPrevMonth={prevMonth}
          onJumpToday={jumpToToday}
          isLoading={isCalendarLoading}
          isFetching={isCalendarFetching}
        />
      </div>
    </div>
  );
}
