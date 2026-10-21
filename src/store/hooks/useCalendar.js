"use client";
import { useState } from "react";
import useNotification from "@/store/hooks/useNotification";
import { extractErrorMessage } from "@/lib/helpers/notification";
import { CalendarFrontendService } from "@/services/frontend/calendar";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";

export function useCalendar() {
  const queryClient = useQueryClient();
  const notification = useNotification();

  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(10); 

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

  const nextMonth = () => {
    if (year === 2027 && month === 12) return; 
    if (month === 12) {
      setYear((prev) => prev + 1);
      setMonth(1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  const prevMonth = () => {
    if (year === 2026 && month === 10) return; 
    if (month === 1) {
      setYear((prev) => prev - 1);
      setMonth(12);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const jumpToToday = () => {
    setYear(2026);
    setMonth(10);
  };

  return {
    year,
    month,
    setYear,
    setMonth,
    nextMonth,
    prevMonth,
    jumpToToday,
    calendar: data || {},
    days: data?.days || [],
    stats: data?.stats || {},
    todayString: data?.todayString || "2026-10-20",
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
