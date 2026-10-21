"use client";
import useNotification from "@/store/hooks/useNotification";
import { EmployeeService } from "@/services/frontend/employee";
import { NOTIFICATION_MESSAGES } from "@/constants/notification";
import { extractErrorMessage } from "@/lib/helpers/notification";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useEmployees({ status = "all", department = "all", search = "", employmentType = "all", page = 1, limit = 50 } = {}) {
  const queryClient = useQueryClient();
  const notification = useNotification();

  const queryKey = ["employees", { status, department, search, employmentType, page, limit }];

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      EmployeeService.getEmployees({
        status: status === "all" ? undefined : status,
        department: department === "all" ? undefined : department,
        employmentType: employmentType === "all" ? undefined : employmentType,
        search: search.trim() || undefined,
        page,
        limit,
      }),
    select: (res) => res?.data || res || {},
  });

  const employees = data?.employees || [];
  const stats = data?.stats || {
    total: employees.length,
    active: employees.filter((e) => e.status === "Active").length,
    onLeave: employees.filter((e) => e.status === "On Leave").length,
    probation: employees.filter((e) => e.status === "Probation").length,
  };

  const addMutation = useMutation({
    mutationFn: (newEmployee) => EmployeeService.createEmployee(newEmployee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      notification.success(NOTIFICATION_MESSAGES.EMPLOYEE.CREATE_SUCCESS);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, NOTIFICATION_MESSAGES.EMPLOYEE.CREATE_ERROR);
      notification.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => EmployeeService.updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      notification.success(NOTIFICATION_MESSAGES.EMPLOYEE.UPDATE_SUCCESS);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, NOTIFICATION_MESSAGES.EMPLOYEE.UPDATE_ERROR);
      notification.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => EmployeeService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      notification.success(NOTIFICATION_MESSAGES.EMPLOYEE.DELETE_SUCCESS);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, NOTIFICATION_MESSAGES.EMPLOYEE.DELETE_ERROR);
      notification.error(msg);
    },
  });

  return {
    employees,
    stats,
    total: data?.total || employees.length,
    totalPages: data?.totalPages || 1,
    isLoading,
    isFetching,
    error,
    refetch,

    addEmployee: addMutation.mutateAsync,
    isAdding: addMutation.isPending,

    updateEmployee: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteEmployee: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useEmployeeProfile() {
  const queryClient = useQueryClient();
  const notification = useNotification();

  const queryKey = ["employee-profile"];

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: () => EmployeeService.getProfile(),
    select: (res) => res?.data || res || {},
  });

  const employee = data?.employee || null;
  const officeLocation = data?.officeLocation || null;
  const todayPunch = data?.todayPunch || null;

  const updateMutation = useMutation({
    mutationFn: (updateData) => EmployeeService.updateProfile(updateData),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["employee-profile"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-status"] });
      notification.success(res?.message || "Profile updated successfully");
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, "Failed to update profile");
      notification.error(msg);
    },
  });

  return {
    employee,
    officeLocation,
    todayPunch,
    profileData: data,
    isLoading,
    isFetching,
    error,
    refetch,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export default useEmployees;
