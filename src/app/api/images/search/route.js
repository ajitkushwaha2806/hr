import axios from "axios";
import { getImageSearchCacheKey } from "@/lib/api/helpers/cacheKeys";
import { getCache, setCache } from "@/services/backend/redis/cache.service";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";

const SNAP_SEARCH_URL = process.env.SNAP_SEARCH_URL || process.env.FOODSNAP_SEARCH_URL || "https://getrepeat-snap.vercel.app/api/search";

export const GET = withErrorHandler(async (request) => {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "12";
    const foodType = searchParams.get("food_type") || "";
    const category = searchParams.get("category") || "";
    const cuisine = searchParams.get("cuisine") || "";

    const cacheKey = getImageSearchCacheKey(query, page, limit, foodType);
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
        return successResponse(
            cachedData.data || cachedData, 
            "Images fetched successfully (cached)", 
            200, 
            { hasMore: cachedData.hasMore ?? false, pagination: cachedData.pagination }
        );
    }

    let rawImages = [];
    let pagination = null;
    let hasMore = false;

    try {
        const params = {
            page,
            limit,
            q: query.toLowerCase(),
        };

        if (foodType) {
            params.food_type = foodType;
        }
        if (category) {
            params.category = category;
        }
        if (cuisine) {
            params.cuisine = cuisine;
        }

        const response = await axios.get(SNAP_SEARCH_URL, {
            params,
            headers: {
                Accept: "application/json",
            },
            timeout: 8000,
        });

        const responseData = response.data;
        rawImages = Array.isArray(responseData?.data) ? responseData.data : [];
        pagination = responseData?.pagination || null;
        hasMore = pagination ? Boolean(pagination.hasNextPage) : rawImages.length >= Number(limit);
    } catch (err) {
        console.error("[Snap Image API search error]:", err.message);
        throw new Error(`Failed to search images: ${err.message}`);
    }

    // Normalize images so all expected fields are consistently present
    const normalizedImages = rawImages.map((img) => ({
        _id: img.id || img._id,
        id: img.id || img._id,
        title: img.title || img.name || "",
        name: img.title || img.name || "",
        description: img.description || "",
        category: img.category || "",
        sub_category: img.sub_category || "",
        cuisine: img.cuisine || "",
        food_type: img.food_type || "",
        tags: img.tags || [],
        key: img.key || "",
        imageUrl: img.imageUrl || (img.key ? `https://getrepeat.s3.ap-south-1.amazonaws.com/${img.key}` : ""),
        image_url: img.imageUrl || (img.key ? `https://getrepeat.s3.ap-south-1.amazonaws.com/${img.key}` : ""),
        relevanceScore: img.relevanceScore || 0,
    }));

    const formattedResponse = { data: normalizedImages, hasMore, pagination };
    await setCache(cacheKey, formattedResponse, 86400);

    return successResponse(normalizedImages, "Images fetched successfully", 200, { hasMore, pagination });
});
