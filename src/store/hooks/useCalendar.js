"use client";
import { useState } from "react";
import useNotification from "@/store/hooks/useNotification";
import { getTodayDateString } from "@/lib/utils";
import { extractErrorMessage } from "@/lib/helpers/notification";
import { CalendarFrontendService } from "@/services/frontend/calendar";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";

export function useCalendar() {
  const queryClient = useQueryClient();
  const notification = useNotification();

  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1); 

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["organization-calendar", year, month],
    queryFn: () => CalendarFrontendService.getMonthlyDays({ year, month }),
    select: (res) => res?.data || res || {},
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3, 
  });

  const updateDayMutation = useMutation({
    mutationFn: (payload) => CalendarFrontendService.updateDay(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["organization-calendar"] });
      notification.success(res?.message || "Calendar day updated successfully");
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, "Failed to update calendar day");
      notification.error(msg);
    },
  });

  const clearDayMutation = useMutation({
    mutationFn: (dateString) => CalendarFrontendService.clearDay({ dateString }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["organization-calendar"] });
      notification.success(res?.message || "Day reset to default");
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, "Failed to reset day");
      notification.error(msg);
    },
  });

  const seedMutation = useMutation({
    mutationFn: (force) => CalendarFrontendService.seedCalendar(force),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["organization-calendar"] });
      notification.success(res?.message || "Days seeded from Oct 2026 to Dec 2027");
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, "Failed to seed calendar");
      notification.error(msg);
    },
  });

  const handleSetYear = (valOrFn) => {
    setYear((prev) => {
      const val = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      return Math.min(2027, Math.max(2026, Number(val) || 2026));
    });
  };

  const handleSetMonth = (valOrFn) => {
    setMonth((prev) => {
      const val = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      const num = Number(val) || 10;
      if (year >= 2027) {
        return Math.min(12, Math.max(1, num));
      }
      return Math.min(12, Math.max(10, num));
    });
  };

  const nextMonth = () => {
    if (year >= 2027 && month >= 12) return; 
    if (month === 12) {
      if (year < 2027) {
        setYear((prev) => prev + 1);
        setMonth(1);
      }
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  const prevMonth = () => {
    if (year <= 2026 && month <= 10) return; 
    if (month === 1) {
      setYear((prev) => prev - 1);
      setMonth(12);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const jumpToToday = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  };

  return {
    year,
    month,
    setYear: handleSetYear,
    setMonth: handleSetMonth,
    nextMonth,
    prevMonth,
    jumpToToday,
    calendar: data || {},
    days: data?.days || [],
    stats: data?.stats || {},
    todayString: data?.todayString || getTodayDateString("Asia/Kolkata"),
    isLoading,
    isFetching,
    error,
    refetch,
    updateDay: updateDayMutation.mutateAsync,
    isUpdating: updateDayMutation.isPending,
    clearDay: clearDayMutation.mutateAsync,
    isClearing: clearDayMutation.isPending,
    seedCalendar: seedMutation.mutateAsync,
    isSeeding: seedMutation.isPending,
  };
}

export default useCalendar;
