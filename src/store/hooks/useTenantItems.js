import { useQuery } from "@tanstack/react-query";
import { MenuService } from "@/services/tenant/frontend/menu";

export const useTenantItems = (slug, categoryId) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["tenant-items", slug, categoryId],
        queryFn: () => MenuService.item.getByCategory(slug, categoryId),
        enabled: !!slug && !!categoryId,
    });

    return {
        items: data?.data?.items || {},
        isLoading,
        error,
    };
};