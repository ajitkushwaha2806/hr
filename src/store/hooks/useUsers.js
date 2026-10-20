import useNotification from "./useNotification";
import { UserService } from "@/services/frontend/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { extractErrorMessage } from "@/lib/helpers/notification";

export const useUsers = (resId, { status = "all", search = "", page, limit } = {}) => {
  const queryClient = useQueryClient();
  const notification = useNotification();

  const { data: usersData, isLoading, error, refetch } = useQuery({
    queryKey: ["users", resId, { status, search, page, limit }],
    queryFn: () => UserService.getAll(resId, { status, search, page, limit }),
    enabled: !!resId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => UserService.create(resId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users", resId] });
      notification.success(data?.message || "User created successfully");
    },
    onError: (err) => {
      notification.error(extractErrorMessage(err, "Failed to create user"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, data }) => UserService.update(resId, userId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users", resId] });
      notification.success(data?.message || "User updated successfully");
    },
    onError: (err) => {
      notification.error(extractErrorMessage(err, "Failed to update user"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId) => UserService.delete(resId, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users", resId] });
      notification.success(data?.message || "User deleted successfully");
    },
    onError: (err) => {
      notification.error(extractErrorMessage(err, "Failed to delete user"));
    },
  });

  const rawData = usersData?.data;
  const userList = Array.isArray(rawData) ? rawData : rawData?.users || [];
  const totalCount = rawData?.totalCount ?? userList.length;
  const totalPages = rawData?.totalPages ?? 1;

  return {
    userList,
    totalCount,
    totalPages,
    page: rawData?.page,
    limit: rawData?.limit,
    isLoading,
    error,
    refetch,
    addUser: createMutation.mutate,
    isAdding: createMutation.isPending,
    updateUser: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteUser: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};

export default useUsers;
