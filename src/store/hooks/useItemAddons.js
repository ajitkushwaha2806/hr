import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MenuService } from "@/services/frontend/menu";
import useNotification from "./useNotification";

export function useItemAddons(restaurantId) {
    const queryClient = useQueryClient();
    const notification = useNotification();
    const [isUpdating, setIsUpdating] = useState(false);
    const [removingMappings, setRemovingMappings] = useState(new Set());

    const pendingRequestsRef = useRef(0);
    const debounceTimerRef = useRef(null);

    const scheduleInvalidate = useCallback(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(async () => {
            if (pendingRequestsRef.current === 0) {
                await queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
            }
        }, 1200);
    }, [queryClient, restaurantId]);

    const optimisticUpdateCache = useCallback((targetItemIds, groupIds, isClearAll = false) => {
        queryClient.setQueriesData({ queryKey: ["items", restaurantId] }, (old) => {
            if (!old) return old;

            const groupIdsSet = (groupIds && groupIds.length > 0) 
                ? new Set(groupIds.map(String)) 
                : null;
            const targetSet = new Set((targetItemIds || []).map(String));

            const updateItem = (item) => {
                const iId = String(item._id || item.id);
                const isItemTargeted = targetSet.has(iId);

                const variantTargets = new Set();
                targetSet.forEach(t => {
                    if (t.startsWith(`${iId}:::`)) {
                        variantTargets.add(t.split(":::")[1]);
                    }
                });

                let updatedAddonGroups = item.addonGroups || [];
                if (isItemTargeted) {
                    if (isClearAll || !groupIdsSet) {
                        updatedAddonGroups = [];
                    } else {
                        updatedAddonGroups = updatedAddonGroups.filter(g => {
                            const gid = String(g?._id || g?.id || g);
                            return !groupIdsSet.has(gid);
                        });
                    }
                }

                let updatedVariants = item.variants;
                if (Array.isArray(item.variants)) {
                    updatedVariants = item.variants.map(v => {
                        if (!Array.isArray(v.options)) return v;
                        return {
                            ...v,
                            options: v.options.map(opt => {
                                const optId = String(opt._id || opt.id || opt.name);
                                const isOptTargeted = isItemTargeted || variantTargets.has(optId) || variantTargets.has(String(opt.name));

                                if (!isOptTargeted) return opt;

                                let optGroups = opt.addonGroups || [];
                                if (isClearAll || !groupIdsSet) {
                                    optGroups = [];
                                } else {
                                    optGroups = optGroups.filter(g => {
                                        const gid = String(g?._id || g?.id || g);
                                        return !groupIdsSet.has(gid);
                                    });
                                }
                                return { ...opt, addonGroups: optGroups };
                            })
                        };
                    });
                }

                return {
                    ...item,
                    addonGroups: updatedAddonGroups,
                    variants: updatedVariants
                };
            };

            const updateList = (list) => list.map(updateItem);

            if (Array.isArray(old)) return updateList(old);
            if (Array.isArray(old.data)) {
                return {
                    ...old,
                    data: updateList(old.data)
                };
            }
            return old;
        });
    }, [queryClient, restaurantId]);

    const mapAddons = useCallback(async (itemIds, addonGroupIds) => {
        if (!restaurantId || !itemIds?.length || !addonGroupIds?.length) return false;
        setIsUpdating(true);
        try {
            await MenuService.bulkUpdateAddons(restaurantId, {
                action: 'add',
                itemIds,
                addonGroupIds,
            });
            notification.success(`Mapped ${addonGroupIds.length} addon group${addonGroupIds.length > 1 ? 's' : ''} to ${itemIds.length} item${itemIds.length > 1 ? 's' : ''}!`);
            await queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
            return true;
        } catch (error) {
            console.error("Failed to map addons:", error);
            notification.error(error?.response?.data?.message || "Failed to map addons.");
            queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
            return false;
        } finally {
            setIsUpdating(false);
        }
    }, [restaurantId, notification, queryClient]);

    const removeAddons = useCallback(async (itemIds, addonGroupIds) => {
        if (!restaurantId || !itemIds?.length || !addonGroupIds?.length) return false;
        setIsUpdating(true);
        optimisticUpdateCache(itemIds, addonGroupIds, false);
        try {
            await MenuService.bulkUpdateAddons(restaurantId, {
                action: 'remove',
                itemIds,
                addonGroupIds,
            });
            notification.success(`Removed ${addonGroupIds.length} addon group${addonGroupIds.length > 1 ? 's' : ''} from ${itemIds.length} item${itemIds.length > 1 ? 's' : ''}!`);
            await queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
            return true;
        } catch (error) {
            console.error("Failed to remove addons:", error);
            notification.error(error?.response?.data?.message || "Failed to remove addons.");
            queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
            return false;
        } finally {
            setIsUpdating(false);
        }
    }, [restaurantId, notification, queryClient, optimisticUpdateCache]);

    const clearAddons = useCallback(async (itemIds) => {
        if (!restaurantId || !itemIds?.length) return false;
        setIsUpdating(true);
        optimisticUpdateCache(itemIds, [], true);
        try {
            await MenuService.bulkUpdateAddons(restaurantId, {
                action: 'clear_all',
                itemIds,
                addonGroupIds: [],
            });
            notification.success(`Cleared all addons from ${itemIds.length} item${itemIds.length > 1 ? 's' : ''}!`);
            await queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
            return true;
        } catch (error) {
            console.error("Failed to clear addons:", error);
            notification.error(error?.response?.data?.message || "Failed to clear addons.");
            queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
            return false;
        } finally {
            setIsUpdating(false);
        }
    }, [restaurantId, notification, queryClient, optimisticUpdateCache]);

    const unmapSingleAddon = useCallback(async (targetId, groupId) => {
        if (!restaurantId) return;
        const key = `${targetId}:${groupId}`;
        setRemovingMappings(prev => new Set([...prev, key]));

        await queryClient.cancelQueries({ queryKey: ["items", restaurantId] });
        optimisticUpdateCache([targetId], [groupId], false);

        pendingRequestsRef.current++;
        try {
            await MenuService.bulkUpdateAddons(restaurantId, {
                action: 'remove',
                itemIds: [targetId],
                addonGroupIds: [groupId],
            });
        } catch (error) {
            console.error("Addons unmap error:", error);
            notification.error(error?.response?.data?.message || "Failed to unmap addon.");
            queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
        } finally {
            pendingRequestsRef.current = Math.max(0, pendingRequestsRef.current - 1);
            setRemovingMappings(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
            scheduleInvalidate();
        }
    }, [restaurantId, notification, queryClient, optimisticUpdateCache, scheduleInvalidate]);

    return {
        mapAddons,
        removeAddons,
        clearAddons,
        unmapSingleAddon,
        isUpdating,
        removingMappings,
    };
}
