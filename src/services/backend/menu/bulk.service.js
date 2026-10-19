import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import MenuItem from "@/models/Item";
import Category from "@/models/Category";
import { invalidateItemCache, invalidateCategoryCache } from "@/lib/api/helpers/cacheKeys";

export const BulkService = {
  bulkUpdateDescriptions: async (restaurantId, items) => {
    await dbConnect();

    const bulkOps = items.map((item) => {
      const updateFields = {};
      if (item.description !== undefined) {
        updateFields.description = String(item.description);
      }

      return {
        updateOne: {
          filter: { _id: item.id, restaurant: restaurantId },
          update: { $set: updateFields },
        },
      };
    });

    if (bulkOps.length === 0) {
      throw new Error("No valid description updates provided.");
    }

    const result = await MenuItem.bulkWrite(bulkOps);
    await invalidateItemCache(restaurantId);

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  },

  bulkUpdateAddons: async (restaurantId, itemIds, addonGroupIds = [], action) => {
    await dbConnect();
    
    let resultData = null;
    const pureItemIds = [];
    const variantTargetMap = {};

    (itemIds || []).forEach((id) => {
      const str = String(id);
      if (str.includes(":::")) {
        const [itemId, optId] = str.split(":::");
        if (!variantTargetMap[itemId]) variantTargetMap[itemId] = [];
        variantTargetMap[itemId].push(optId);
      } else {
        pureItemIds.push(id);
      }
    });

    const groupStrings = (addonGroupIds || []).map(String);
    const groupObjIds = (addonGroupIds || [])
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (pureItemIds.length > 0) {
      if (action === "add") {
        await MenuItem.updateMany(
          { _id: { $in: pureItemIds }, restaurant: restaurantId },
          { $addToSet: { addonGroups: { $each: groupObjIds } } }
        );
      } else if (action === "clear_all" || (action === "remove" && groupStrings.length === 0)) {
        await MenuItem.updateMany(
          { _id: { $in: pureItemIds }, restaurant: restaurantId },
          { $set: { addonGroups: [] } }
        );
        
        const itemsWithVariants = await MenuItem.find({
          _id: { $in: pureItemIds },
          restaurant: restaurantId,
          "variants.0": { $exists: true },
        });
        for (const doc of itemsWithVariants) {
          let hasMod = false;
          doc.variants?.forEach((v) => {
            v.options?.forEach((opt) => {
              if (Array.isArray(opt.addonGroups) && opt.addonGroups.length > 0) {
                opt.addonGroups = [];
                hasMod = true;
              }
            });
          });
          if (hasMod) await doc.save();
        }
      } else if (action === "remove") {
        await MenuItem.updateMany(
          { _id: { $in: pureItemIds }, restaurant: restaurantId },
          { $pull: { addonGroups: { $in: [...groupObjIds, ...groupStrings] } } }
        );
        // Also remove matching addon groups from variant options of these items
        const itemsWithVariants = await MenuItem.find({
          _id: { $in: pureItemIds },
          restaurant: restaurantId,
          "variants.0": { $exists: true },
        });
        for (const doc of itemsWithVariants) {
          let hasMod = false;
          doc.variants?.forEach((v) => {
            v.options?.forEach((opt) => {
              if (Array.isArray(opt.addonGroups) && opt.addonGroups.length > 0) {
                const initialLen = opt.addonGroups.length;
                opt.addonGroups = opt.addonGroups.filter((g) => {
                  const gStr = String(g?._id || g?.id || g);
                  return !groupStrings.includes(gStr);
                });
                if (opt.addonGroups.length !== initialLen) hasMod = true;
              }
            });
          });
          if (hasMod) await doc.save();
        }
      } else if (action === "set") {
        await MenuItem.updateMany(
          { _id: { $in: pureItemIds }, restaurant: restaurantId },
          { $set: { addonGroups: groupObjIds } }
        );
      }
    }

    const variantItemIds = Object.keys(variantTargetMap);
    if (variantItemIds.length > 0) {
      for (const vItemId of variantItemIds) {
        const targetOptIds = variantTargetMap[vItemId];
        const itemDoc = await MenuItem.findOne({ _id: vItemId, restaurant: restaurantId });
        if (!itemDoc || !Array.isArray(itemDoc.variants)) continue;

        let hasModified = false;
        itemDoc.variants.forEach((v) => {
          if (!Array.isArray(v.options)) return;
          v.options.forEach((opt) => {
            const optIdentifier = String(opt._id || opt.id || opt.name);
            if (targetOptIds.includes(optIdentifier) || targetOptIds.includes(String(opt.name))) {
              const currentGroups = (opt.addonGroups || []).map((g) => String(g?._id || g?.id || g));
              if (action === "add") {
                const combined = Array.from(new Set([...currentGroups, ...groupStrings]));
                opt.addonGroups = combined.map((id) =>
                  mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
                );
                hasModified = true;
              } else if (action === "clear_all" || (action === "remove" && groupStrings.length === 0)) {
                opt.addonGroups = [];
                hasModified = true;
              } else if (action === "remove") {
                opt.addonGroups = currentGroups
                  .filter((g) => !groupStrings.includes(g))
                  .map((id) =>
                    mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
                  );
                hasModified = true;
              } else if (action === "set") {
                opt.addonGroups = groupObjIds;
                hasModified = true;
              }
            }
          });
        });

        if (hasModified) {
          await itemDoc.save();
        }
      }
    }

    resultData = { success: true };
    await invalidateItemCache(restaurantId);
    return resultData;
  },

  bulkUpdateStructure: async (restaurantId, action, payload) => {
    await dbConnect();
    let resultData = null;

    if (action === "move_items") {
      const { itemIds, targetCategoryId, targetSubCategoryId } = payload;
      if (!Array.isArray(itemIds) || !targetCategoryId) {
        throw new Error("itemIds and targetCategoryId are required for moving items.");
      }

      const updateResult = await MenuItem.updateMany(
        { _id: { $in: itemIds }, restaurant: restaurantId },
        {
          $set: {
            category: targetCategoryId,
            subCategory: targetSubCategoryId || null,
          },
        }
      );
      resultData = { matched: updateResult.matchedCount, modified: updateResult.modifiedCount };
    } else if (action === "move_subcategories") {
      const { subCategoryIds, targetCategoryId } = payload;
      if (!Array.isArray(subCategoryIds)) {
        throw new Error("subCategoryIds is required.");
      }

      await Category.updateMany(
        { _id: { $in: subCategoryIds }, restaurant: restaurantId },
        { $set: { parentCategory: targetCategoryId || null } }
      );

      if (targetCategoryId) {
        await MenuItem.updateMany(
          { subCategory: { $in: subCategoryIds }, restaurant: restaurantId },
          { $set: { category: targetCategoryId } }
        );
      } else {
        for (const subId of subCategoryIds) {
          const promotedCategory = await Category.findOne({ _id: subId, restaurant: restaurantId });
          if (!promotedCategory) continue;

          const newSubCategory = await Category.create({
            restaurant: restaurantId,
            name: promotedCategory.name,
            image: promotedCategory.image,
            displayOrder: 0,
            parentCategory: subId,
          });

          await MenuItem.updateMany(
            { subCategory: subId, restaurant: restaurantId },
            { $set: { category: subId, subCategory: newSubCategory._id } }
          );
        }
      }
      resultData = { success: true };
    } else if (action === "merge") {
      const { sourceIds, targetId, type } = payload;
      if (!Array.isArray(sourceIds) || !targetId || !type) {
        throw new Error("sourceIds, targetId, and type are required for merging.");
      }

      if (type === "category") {
        await Category.updateMany(
          { parentCategory: { $in: sourceIds }, restaurant: restaurantId },
          { $set: { parentCategory: targetId } }
        );

        await MenuItem.updateMany(
          { category: { $in: sourceIds }, restaurant: restaurantId },
          { $set: { category: targetId } }
        );
        await Category.deleteMany({ _id: { $in: sourceIds }, restaurant: restaurantId });
      } else if (type === "subcategory") {
        const targetSub = await Category.findOne({ _id: targetId, restaurant: restaurantId });
        if (!targetSub) throw new Error("Target subcategory not found");
        await MenuItem.updateMany(
          { subCategory: { $in: sourceIds }, restaurant: restaurantId },
          {
            $set: {
              subCategory: targetId,
              category: targetSub.parentCategory,
            },
          }
        );
        await Category.deleteMany({ _id: { $in: sourceIds }, restaurant: restaurantId });
      }
      resultData = { success: true };
    } else if (action === "reorder") {
      const { categories: orderedCategories, items: orderedItems } = payload;
      if (Array.isArray(orderedCategories) && orderedCategories.length > 0) {
        const bulkCatOps = orderedCategories.map((cat) => ({
          updateOne: {
            filter: { _id: cat.id || cat._id, restaurant: restaurantId },
            update: { $set: { displayOrder: Number(cat.displayOrder) } },
          },
        }));
        await Category.bulkWrite(bulkCatOps);
      }

      if (Array.isArray(orderedItems) && orderedItems.length > 0) {
        const bulkItemOps = orderedItems.map((item) => ({
          updateOne: {
            filter: { _id: item.id || item._id, restaurant: restaurantId },
            update: { $set: { displayOrder: Number(item.displayOrder) } },
          },
        }));
        await MenuItem.bulkWrite(bulkItemOps);
      }
      resultData = { success: true };
    } else {
      throw new Error("Invalid action.");
    }

    await invalidateItemCache(restaurantId);
    await invalidateCategoryCache(restaurantId);
    return resultData;
  }
};
