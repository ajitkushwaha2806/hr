import axios from "axios";
import MenuItem from "@/models/Item";

const SNAP_SEARCH_URL = process.env.SNAP_SEARCH_URL || process.env.FOODSNAP_SEARCH_URL || "https://getrepeat-snap.vercel.app/api/search";
export async function searchBestMatchImage(dishName, options = {}) {
  if (!dishName || typeof dishName !== "string") return null;
  const cleanName = dishName.trim();
  if (!cleanName) return null;

  const { foodType, category, cuisine } = typeof options === "string" ? { foodType: options } : options;

  const normalizedFoodType = foodType === "veg" ? "veg" : (foodType === "non-veg" ? "non-veg" : null);

  const params = {
    q: cleanName.toLowerCase(),
    limit: 1,
  };

  if (normalizedFoodType) {
    params.food_type = normalizedFoodType;
  }
  if (category) {
    params.category = category;
  }
  if (cuisine) {
    params.cuisine = cuisine;
  }

  try {
    const response = await axios.get(SNAP_SEARCH_URL, {
      params,
      headers: { Accept: "application/json" },
      timeout: 8000,
    });

    const data = response.data;
    const images = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
    if (images.length > 0 && images[0]) {
      const best = images[0];
      const key = best.key || best.imageUrl || best.image_url;
      if (key) {
        return {
          key,
          imageUrl: best.imageUrl || (best.key ? `https://getrepeat.s3.ap-south-1.amazonaws.com/${best.key}` : ""),
          title: best.title || best.name || cleanName,
          category: best.category || "",
          subCategory: best.sub_category || "",
          foodType: best.food_type || "",
          relevanceScore: best.relevanceScore || 0,
        };
      }
    }
  } catch (error) {
    console.warn(`[Snap Image Search Error] for "${dishName}":`, error.message);
  }
  return null;
}

/**
 * Auto-applies images from the Snap Library to menu items of a restaurant.
 */
export async function autoApplyImagesToItems({
  restaurantId,
  itemIds = [],
  overwrite = false,
  concurrency = 5,
}) {
  if (!restaurantId) {
    throw new Error("restaurantId is required for auto-applying images");
  }

  const query = { restaurant: restaurantId };
  if (Array.isArray(itemIds) && itemIds.length > 0) {
    query._id = { $in: itemIds };
  }
  if (!overwrite) {
    query.$or = [{ image: null }, { image: "" }, { image: { $exists: false } }];
  }

  const items = await MenuItem.find(query).select("_id name image dietaryType").lean();
  if (!items || items.length === 0) {
    return { matchedCount: 0, updatedItems: [] };
  }

  let matchedCount = 0;
  const updatedItems = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (item) => {
        try {
          const match = await searchBestMatchImage(item.name, { foodType: item.dietaryType });
          if (match && match.key) {
            await MenuItem.findByIdAndUpdate(item._id, { image: match.key });
            matchedCount++;
            updatedItems.push({
              itemId: String(item._id),
              name: item.name,
              key: match.key,
              imageUrl: match.imageUrl,
              foodType: match.foodType,
            });
          }
        } catch (err) {
          console.warn(`Failed to auto-apply image for "${item.name}":`, err.message);
        }
      })
    );
  }

  return {
    matchedCount,
    updatedItems,
  };
}
