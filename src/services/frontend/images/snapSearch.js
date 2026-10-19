import axios from "axios";

export const SnapSearchService = {
  searchImages: async ({ query = "", page = 1, limit = 12, food_type = null, category = null, cuisine = null } = {}) => {
    try {
      const params = {
        q: query || "",
        page,
        limit,
      };
      if (food_type) params.food_type = food_type;
      if (category) params.category = category;
      if (cuisine) params.cuisine = cuisine;

      const response = await axios.get("/api/images/search", { params });
      return response.data;
    } catch (error) {
      console.error("Snap Image API search failed:", error);
      throw error;
    }
  },

  downloadImageAsFile: async (imageUrl, filename) => {
    try {
      const response = await axios.get("/api/images/proxy", {
        params: { url: imageUrl },
        responseType: "blob",
      });
      const blob = response.data;
      return new File([blob], filename || "dish-image.jpeg", { type: blob.type || "image/jpeg" });
    } catch (error) {
      console.error("Failed to download image from proxy:", error);
      throw error;
    }
  },

  autoApplyImage: async ({ item }) => {
    if (!item?.name) {
      throw new Error("Item name is required for auto-applying image");
    }

    const foodType = item.dietaryType === "veg" ? "veg" : (item.dietaryType === "non-veg" ? "non-veg" : null);

    const searchRes = await SnapSearchService.searchImages({
      query: item.name,
      food_type: foodType,
      page: 1,
      limit: 1,
    });

    const images = Array.isArray(searchRes?.data)
      ? searchRes.data
      : (searchRes?.data?.data || []);

    if (!images || images.length === 0) {
      throw new Error(`No matching image found for "${item.name}"`);
    }

    const firstImage = images[0];
    const imageKey = firstImage.key || firstImage.imageUrl || firstImage.image_url;

    if (!imageKey) {
      throw new Error(`Image key not available for "${item.name}"`);
    }

    return {
      success: true,
      key: imageKey,
      imageId: imageKey,
      imageName: firstImage.title || firstImage.name || item.name,
      imageUrl: firstImage.imageUrl || firstImage.image_url,
      foodType: firstImage.food_type,
    };
  }
};
