import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MenuService } from "@/services/frontend/menu";
import useNotification from "./useNotification";

export function useAddonGroup(restaurantId) {
    const queryClient = useQueryClient();
    const notification = useNotification();
    const queryKey = ["addonGroups", restaurantId];

    const { data, isLoading, error } = useQuery({
        queryKey,
        queryFn: () => MenuService.addonGroup.getAll(restaurantId),
        enabled: !!restaurantId,
        select: (res) => res.data || [],
    });

    const addGroupMutation = useMutation({
        mutationFn: (newGroup) => MenuService.addonGroup.create(restaurantId, newGroup),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            notification.success("Addon group created successfully");
        },
        onError: (error) => {
            notification.error(error?.response?.data?.message || "Failed to create addon group");
        }
    });

    const updateGroupMutation = useMutation({
        mutationFn: ({ groupId, data }) => MenuService.addonGroup.update(restaurantId, groupId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            notification.success("Addon group updated successfully");
        },
        onError: (error) => {
            notification.error(error?.response?.data?.message || "Failed to update addon group");
        }
    });

    const deleteGroupMutation = useMutation({
        mutationFn: (groupId) => MenuService.addonGroup.delete(restaurantId, groupId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            queryClient.invalidateQueries({ queryKey: ["items", restaurantId] }); // Items might reference it
            notification.success("Addon group deleted successfully");
        },
        onError: (error) => {
            notification.error(error?.response?.data?.message || "Failed to delete addon group");
        }
    });

    return {
        addonGroups: data || [],
        isLoading,
        error,
        addGroup: addGroupMutation.mutateAsync,
        updateGroup: updateGroupMutation.mutateAsync,
        deleteGroup: deleteGroupMutation.mutateAsync,
        isAdding: addGroupMutation.isPending,
        isUpdating: updateGroupMutation.isPending,
        isDeleting: deleteGroupMutation.isPending
    };
}
