"use client";
import React, { useState } from "react";
import { useCalendar } from "@/store/hooks/useCalendar";
import { MonthPickerBar } from "./fragments/month-picker-bar";
import { CalendarStats } from "./fragments/calendar-stats";
import { AdminCalendarGrid } from "./fragments/admin-calendar-grid";
import { DayEditModal } from "./fragments/day-edit-modal";
import { Sparkles, CalendarCheck, ShieldCheck } from "lucide-react";

export default function AdminCalendarManagement() {
  const {
    year,
    month,
    setYear,
    setMonth,
    nextMonth,
    prevMonth,
    jumpToToday,
    days = [],
    todayString,
    isLoading,
    isFetching,
    refetch,
    updateDay,
    isUpdating,
    clearDay,
    isClearing,
  } = useCalendar();

  const [selectedDay, setSelectedDay] = useState(null);

  const handleSelectDay = (dayItem) => {
    setSelectedDay(dayItem);
  };

  const handleCloseModal = () => {
    setSelectedDay(null);
  };

  const handleSaveDay = async ({ dateString, type, title, description }) => {
    try {
      await updateDay({ dateString, type, title, description });
      setSelectedDay(null);
    } catch {
      // Error handled by useCalendar mutation
    }
  };

  const handleResetDay = async (dateString) => {
    try {
      await clearDay(dateString);
      setSelectedDay(null);
    } catch {
      // Error handled by useCalendar mutation
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 p-3 sm:p-6 pb-20 sm:pb-8 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-md border border-border/80 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 sm:size-11 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0 shadow-2xs">
              <CalendarCheck className="size-5 sm:size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Company Calendar
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck className="size-3" />
                  Admin Controls
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Manually mark organization workdays, official holidays, and weekly offs
              </p>
            </div>
          </div>
        </div>

        {/* Informational banner */}
        <div className="mt-3.5 pt-3 border-t border-border/60 flex items-start gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Click on any day in the monthly calendar below to designate it as a{" "}
            <strong className="text-foreground">Working Day</strong>,{" "}
            <strong className="text-foreground">Weekly Off</strong>, or{" "}
            <strong className="text-foreground">Official Holiday</strong>. Custom holidays and weekly offs automatically adjust employee attendance calculations so employees are not penalized.
          </p>
        </div>
      </div>

      {/* Month & Year Navigation Bar */}
      <MonthPickerBar
        year={year}
        month={month}
        onYearChange={setYear}
        onMonthChange={setMonth}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        onToday={jumpToToday}
        onRefresh={refetch}
        isFetching={isFetching}
      />

      {/* Monthly Statistics Overview */}
      <CalendarStats days={days} />

      {/* Calendar Grid */}
      <AdminCalendarGrid
        year={year}
        month={month}
        days={days}
        todayString={todayString}
        onSelectDay={handleSelectDay}
        isLoading={isLoading}
      />

      {/* Day Edit Modal */}
      {selectedDay && (
        <DayEditModal
          key={selectedDay.dateString}
          day={selectedDay}
          onClose={handleCloseModal}
          onSave={handleSaveDay}
          onReset={handleResetDay}
          isUpdating={isUpdating}
          isClearing={isClearing}
        />
      )}
    </div>
  );
}
