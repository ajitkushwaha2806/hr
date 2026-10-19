import { RoleService } from "@/services/frontend/role";
import { useQuery } from "@tanstack/react-query";

export const useRole = (resId) => {
    const { data: roleData, isLoading, error } = useQuery({
        queryKey: ["roles", resId],
        queryFn: () => RoleService.getAll(resId),
        enabled: !!resId,
    });

    const rawRoles = roleData?.data || [];

    return {
        roles: rawRoles,
        isLoading,
        error,
    };
};
