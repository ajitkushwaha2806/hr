"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AttendanceService } from "@/services/frontend/attendance";

const getLocalDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function useAttendance() {
  const queryClient = useQueryClient();
  const localDate = getLocalDateStr();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["attendance-today-status", localDate],
    queryFn: () => AttendanceService.getTodayStatus(localDate),
    select: (res) => res?.data || res || {},
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60, 
  });

  const refreshAttendance = () => {
    queryClient.invalidateQueries({ queryKey: ["attendance-today-status"] });
    queryClient.invalidateQueries({ queryKey: ["organization-calendar"] });
  };

  return {
    todayStatus: data,
    isLoading,
    error,
    refreshAttendance,
    refetch,
  };
}
