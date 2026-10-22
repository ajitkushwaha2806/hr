"use client";
import { useOrganization } from "@clerk/nextjs";
import useNotification from "@/store/hooks/useNotification";
import { extractErrorMessage } from "@/lib/helpers/notification";
import { DepartmentFrontendService } from "@/services/frontend/department";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useDepartments(orgIdOverride) {
  const queryClient = useQueryClient();
  const notification = useNotification();
  const { organization } = useOrganization();
  const activeOrgId = orgIdOverride || organization?.id;

  const queryKey = ["departments", activeOrgId || "current"];

  const {
    data: departments = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      return await DepartmentFrontendService.getDepartments(activeOrgId);
    },
    staleTime: 60 * 1000,
  });

  const addDepartmentMutation = useMutation({
    mutationFn: async (payload) => {
      return await DepartmentFrontendService.createDepartment(payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      notification.success(`Department "${data?.name || ""}" created successfully`);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, "Failed to create department");
      notification.error(msg);
    },
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: async (payload) => {
      return await DepartmentFrontendService.updateDepartment(payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      notification.success(`Department "${data?.name || ""}" updated successfully`);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, "Failed to update department");
      notification.error(msg);
    },
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: async (departmentId) => {
      return await DepartmentFrontendService.deleteDepartment(departmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      notification.success("Department removed successfully");
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, "Failed to delete department");
      notification.error(msg);
    },
  });

  return {
    departments,
    isLoading,
    isFetching,
    error,
    refetch,
    addDepartment: addDepartmentMutation.mutateAsync,
    isAdding: addDepartmentMutation.isPending,
    updateDepartment: updateDepartmentMutation.mutateAsync,
    isUpdating: updateDepartmentMutation.isPending,
    deleteDepartment: deleteDepartmentMutation.mutateAsync,
    isDeleting: deleteDepartmentMutation.isPending,
  };
}

export default useDepartments;
