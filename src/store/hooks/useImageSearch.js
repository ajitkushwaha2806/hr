import { useInfiniteQuery } from "@tanstack/react-query";
import { SnapSearchService } from "@/services/frontend/images/snapSearch";

export function useImageSearch(query = "", { enabled = true, limit = 12, foodType = null, category = null, cuisine = null } = {}) {
  return useInfiniteQuery({
    queryKey: ["images", "search", (query || "").trim().toLowerCase(), foodType, category, cuisine, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await SnapSearchService.searchImages({
        query: (query || "").trim(),
        page: pageParam,
        limit,
        food_type: foodType,
        category,
        cuisine,
      });

      const imagesArray = Array.isArray(response?.data)
        ? response.data
        : (response?.data?.data || []);

      const hasMore = response?.hasMore ?? (
        response?.pagination
          ? Number(response.pagination.page) < Number(response.pagination.totalPages)
          : imagesArray.length >= Number(limit)
      );

      return {
        data: imagesArray,
        nextCursor: hasMore ? pageParam + 1 : undefined,
        pagination: response?.pagination,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export const useFoodsnapImageSearch = useImageSearch;
