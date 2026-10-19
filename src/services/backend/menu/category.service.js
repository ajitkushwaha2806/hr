import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import Category from "@/models/Category";
import { validateRequiredFields } from "@/lib/api/helpers/validator";
import { getOrSetCache } from "@/services/backend/redis/cache.service";
import { getCategoriesCacheKey, invalidateCategoryCache, invalidateItemCache } from "@/lib/api/helpers/cacheKeys";

const MENU_CATEGORY_POST_REQUIRED_FIELDS = ["name"];

export const CategoryService = {
  getCategories: async (restaurantId) => {
    await dbConnect();

    const cacheKey = getCategoriesCacheKey(restaurantId);
    const { data: categories, isCached } = await getOrSetCache(
      cacheKey,
      async () => {
        const list = await Category.find({ restaurant: restaurantId })
          .sort({ displayOrder: 1, createdAt: -1 })
          .lean();
        return (list || []).map((cat) => ({
          ...cat,
          image: typeof cat.image === "string"
            ? (cat.image.trim() || null)
            : (cat.image?.key || (typeof cat.image?.original === "string" ? cat.image.original : cat.image?.original?.key) || null),
        }));
      },
      3600
    );

    return { data: categories || [], isCached };
  },

  createCategory: async (restaurantId, data) => {
    await dbConnect();

    const { isValid, message } = validateRequiredFields(data, MENU_CATEGORY_POST_REQUIRED_FIELDS);
    if (!isValid) {
      throw new Error(message);
    }

    const { name, displayOrder, image, parentCategory } = data;
    const finalImageKey = typeof image === "string" 
      ? (image.trim() || null) 
      : (image && typeof image === "object" ? (image.key || (typeof image.original === "string" ? image.original : image.original?.key) || null) : null);

    const newCategory = await Category.create({
      restaurant: restaurantId,
      name: name.trim(),
      displayOrder: displayOrder || 0,
      image: finalImageKey,
      parentCategory: parentCategory || null,
    });

    await invalidateCategoryCache(restaurantId);
    return newCategory.toObject ? newCategory.toObject() : newCategory;
  },

  updateCategory: async (restaurantId, categoryId, data) => {
    await dbConnect();

    const category = await Category.findOne({ _id: categoryId, restaurant: restaurantId });
    if (!category) {
      throw new Error("Category not found!");
    }

    if (data.name !== undefined) category.name = data.name.trim();
    if (data.displayOrder !== undefined) category.displayOrder = data.displayOrder;
    if (data.image !== undefined) {
      category.image = typeof data.image === "string"
        ? (data.image.trim() || null)
        : (data.image && typeof data.image === "object" ? (data.image.key || (typeof data.image.original === "string" ? data.image.original : data.image.original?.key) || null) : null);
    }
    if (data.parentCategory !== undefined) category.parentCategory = data.parentCategory;

    await category.save();
    await invalidateCategoryCache(restaurantId);
    return category.toObject ? category.toObject() : category;
  },

  deleteCategory: async (restaurantId, categoryId) => {
    await dbConnect();

    const category = await Category.findOne({ _id: categoryId, restaurant: restaurantId });
    if (!category) {
      throw new Error("Category not found!");
    }

    const findDescendantCategoryIds = async (parentIds) => {
      const children = await Category.find({ parentCategory: { $in: parentIds }, restaurant: restaurantId }).select("_id").lean();
      if (!children || children.length === 0) return [];
      const childIds = children.map((c) => c._id);
      const descendantIds = await findDescendantCategoryIds(childIds);
      return [...childIds, ...descendantIds];
    };

    const subCategoryIds = await findDescendantCategoryIds([categoryId]);
    const allCategoryIdsToDelete = [categoryId, ...subCategoryIds];

    await MenuItem.deleteMany({
      restaurant: restaurantId,
      $or: [
        { category: { $in: allCategoryIdsToDelete } },
        { subCategory: { $in: allCategoryIdsToDelete } },
      ],
    });

    await Category.deleteMany({
      _id: { $in: allCategoryIdsToDelete },
      restaurant: restaurantId,
    });

    await invalidateCategoryCache(restaurantId);
    await invalidateItemCache(restaurantId);

    return true;
  }
};
