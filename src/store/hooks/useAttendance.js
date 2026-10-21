"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AttendanceService } from "@/services/frontend/attendance";

export function useAttendance() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["attendance-today-status"],
    queryFn: () => AttendanceService.getTodayStatus(),
    select: (res) => res?.data || res || {},
    staleTime: 1000 * 30, // 30 seconds
  });

  const refreshAttendance = () => {
    queryClient.invalidateQueries({ queryKey: ["attendance-today-status"] });
  };

  return {
    todayStatus: data,
    isLoading,
    error,
    refreshAttendance,
    refetch,
  };
}
