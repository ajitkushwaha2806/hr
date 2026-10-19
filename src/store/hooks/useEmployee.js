"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmployeeService } from "@/services/frontend/employee";
import useNotification from "@/store/hooks/useNotification";

export function useEmployees({
  status = "all",
  department = "all",
  search = "",
  employmentType = "all",
  page = 1,
  limit = 50,
} = {}) {
  const queryClient = useQueryClient();
  const notification = useNotification();

  const queryKey = ["employees", { status, department, search, employmentType, page, limit }];

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
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

  // Add Employee Mutation
  const addMutation = useMutation({
    mutationFn: (newEmployee) => EmployeeService.createEmployee(newEmployee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      notification.success("Employee added successfully!");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to add employee";
      notification.error(msg);
    },
  });

  // Update Employee Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => EmployeeService.updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      notification.success("Employee details updated successfully!");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to update employee";
      notification.error(msg);
    },
  });

  // Delete Employee Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => EmployeeService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      notification.success("Employee removed successfully!");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete employee";
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

export default useEmployees;
