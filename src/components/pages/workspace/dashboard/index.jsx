"use client";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useCalendar } from "@/store/hooks/useCalendar";
import { useAttendance } from "@/store/hooks/useAttendance";
import AttendanceCalendar from "./fragments/attendance-calendar";
import AttendancePunchBar from "./fragments/attendance-punch-bar";
import { CalendarDays, Clock, Palmtree, Award, FileText, ShieldCheck } from "lucide-react";

export default function EmployeeDashboard() {
  const { user } = useUser();
  const { year, month, days = [], todayString, isLoading: isCalendarLoading, nextMonth, prevMonth, jumpToToday } = useCalendar();

  const { todayStatus, refreshAttendance } = useAttendance();

  const employee = todayStatus?.employee;
  const displayName = employee?.name || user?.firstName || user?.fullName || "Employee";
  const presentDays = days.filter((d) => d.attendanceStatus === "PRESENT").length || 0;
  const workingDays = days.filter((d) => d.type === "WORKING_DAY").length || 22;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/60 dark:bg-zinc-950 px-3 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-24 sm:pb-10">
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <span>{getGreeting()}</span>
            <span>👋</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground truncate">
            {displayName}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="size-10 sm:size-11 rounded-md bg-primary/10 border border-primary/25 text-primary flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden">
            {employee?.avatar || user?.imageUrl ? (
              <img
                src={employee?.avatar || user?.imageUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              displayName.slice(0, 2).toUpperCase()
            )}
          </div>
        </div>
      </div>

      <AttendancePunchBar
        todayStatus={todayStatus}
        onRefresh={refreshAttendance}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3.5 rounded-md bg-white dark:bg-zinc-900 border border-border/70 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">This Month</span>
            <div className="size-6 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CalendarDays className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-extrabold text-foreground tracking-tight">
              {presentDays || "--"} <span className="text-xs font-medium text-muted-foreground">/ {workingDays}</span>
            </div>
            <p className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              Days Present
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-md bg-white dark:bg-zinc-900 border border-border/70 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">Avg Time</span>
            <div className="size-6 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-extrabold text-foreground tracking-tight">
              8.5 <span className="text-xs font-medium text-muted-foreground">hrs</span>
            </div>
            <p className="text-[10.5px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
              Daily Average
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-md bg-white dark:bg-zinc-900 border border-border/70 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">Leave Bal.</span>
            <div className="size-6 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Palmtree className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-extrabold text-foreground tracking-tight">
              14 <span className="text-xs font-medium text-muted-foreground">Days</span>
            </div>
            <p className="text-[10.5px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
              Available Leaves
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-md bg-white dark:bg-zinc-900 border border-border/70 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">Punctuality</span>
            <div className="size-6 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-extrabold text-foreground tracking-tight">
              98%
            </div>
            <p className="text-[10.5px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
              On-Time Rate
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <Link
          href="/employee/leaves"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-border/70 text-xs font-semibold text-foreground hover:bg-muted active:scale-[0.98] transition-all shrink-0 shadow-2xs"
        >
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span>Apply Leave</span>
        </Link>

        <Link
          href="/employee/attendance"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-border/70 text-xs font-semibold text-foreground hover:bg-muted active:scale-[0.98] transition-all shrink-0 shadow-2xs"
        >
          <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
          <span>Attendance Log</span>
        </Link>

        <Link
          href="/employee/profile"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-border/70 text-xs font-semibold text-foreground hover:bg-muted active:scale-[0.98] transition-all shrink-0 shadow-2xs"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Face ID Profile</span>
        </Link>
      </div>

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
        />
      </div>
    </div>
  );
}
