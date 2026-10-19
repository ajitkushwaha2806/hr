import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import Category from "@/models/Category";
import AddonGroup from "@/models/AddonGroup";
import Restaurant from "@/models/Restaurant";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { autoApplyImagesToItems } from "@/services/backend/images/snapSearch";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";
import { invalidateCategoryCache, invalidateItemCache, invalidateAddonGroupCache } from "@/lib/api/helpers/cacheKeys";

export const POST = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required");
  }

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const body = await req.json();
  const menus = body.menus || [];
  const modifierGroups = body.modifierGroups || {};

  let categoriesImported = 0;
  let itemsImported = 0;
  let addonGroupsImported = 0;

  const itemNameToId = {};

  for (const [menuIndex, menuWrapper] of menus.entries()) {
    const menu = menuWrapper?.menu || menuWrapper || {};
    if (!menu.name) continue;

    const categoryPayload = {
      restaurant: id,
      name: menu.name,
      displayOrder: menuIndex,
      parentCategory: null,
    };
    const mainCategory = await Category.create(categoryPayload);
    categoriesImported++;

    const subCategories = menu.categories || menu.sub_category || [];
    for (const [subIndex, subCategoryWrapper] of subCategories.entries()) {
      const subCategoryData = subCategoryWrapper?.category || subCategoryWrapper || {};
      const subCategoryName = subCategoryData.name?.trim() || menu.name;

      const subCategoryPayload = {
        restaurant: id,
        name: subCategoryName,
        displayOrder: subIndex,
        parentCategory: mainCategory._id,
      };
      const subCategory = await Category.create(subCategoryPayload);
      categoriesImported++;

      const items = subCategoryData.items || subCategoryData.item || [];
      for (const [itemIndex, itemWrapper] of items.entries()) {
        const itemData = itemWrapper?.item || itemWrapper || {};
        if (!itemData.name) continue;

        let dietaryType = "non-veg";
        if (itemData.dietary_slugs?.includes("veg") || itemData.dietary_slugs?.includes("vegan")) {
          dietaryType = "veg";
        } else if (itemData.dietary_slugs?.includes("egg")) {
          dietaryType = "egg";
        }

        const basePrice = itemData.price || itemData.default_price || itemData.display_price || itemData.min_price || 0;
        const rawVariants = Array.isArray(itemData.variants) ? itemData.variants : [];

        const pendingVariantOptionModifiers = [];
        const sanitizedVariants = rawVariants.map((v, vIdx) => ({
          property_name: v?.property_name || "Variant",
          options: (Array.isArray(v?.options) ? v.options : []).map((opt, optIdx) => {
            if (Array.isArray(opt?.addonGroups) && opt.addonGroups.length > 0) {
              pendingVariantOptionModifiers.push({
                variantIndex: vIdx,
                optionIndex: optIdx,
                modifierIds: opt.addonGroups,
              });
            }
            return {
              name: opt?.name || "Standard",
              price: typeof opt?.price === "number" ? opt.price : 0,
              addonGroups: [], 
            };
          }),
        }));

        const itemPayload = {
          restaurant: id,
          category: mainCategory._id,
          subCategory: subCategory._id,
          name: itemData.name,
          description: itemData.desc || "",
          image: typeof itemData.image === "string" ? itemData.image : (itemData.image?.key || itemData.image?.url || null),
          base_price: basePrice,
          dietaryType: dietaryType,
          variants: sanitizedVariants,
          displayOrder: itemIndex,
          isAvailable: true,
        };
        const savedItem = await MenuItem.create(itemPayload);
        itemsImported++;

        itemNameToId[itemData.name.trim().toLowerCase()] = {
          id: savedItem._id,
          modifiers: Array.isArray(itemData.addonGroups) ? itemData.addonGroups : [],
          variantModifiers: pendingVariantOptionModifiers,
        };
      }
    }
  }

  const groupIdToMongoId = {};
  const modifierGroupEntries = Object.entries(modifierGroups);

  for (const [groupId, groupWrapper] of modifierGroupEntries) {
    const group = groupWrapper?.group;
    if (!group?.name) continue;

    const zItems = Array.isArray(group.items) ? group.items : [];
    const resolvedItems = [];
    for (const itemWrapper of zItems) {
      const zItem = itemWrapper?.item;
      if (!zItem?.name) continue;
      const matchedData = itemNameToId[zItem.name.trim().toLowerCase()];
      const matchedId = matchedData ? matchedData.id : null;
      const price = zItem.price || zItem.default_price || zItem.display_price || zItem.min_price || 0;

      let dietaryType = "non-veg";
      if (
        zItem.dietary_slugs?.includes("veg") || 
        zItem.dietary_slugs?.includes("vegan") ||
        zItem.tag_slugs?.includes("veg") ||
        zItem.tag_slugs?.includes("vegan")
      ) {
        dietaryType = "veg";
      } else if (
        zItem.dietary_slugs?.includes("egg") ||
        zItem.tag_slugs?.includes("egg")
      ) {
        dietaryType = "egg";
      }

      resolvedItems.push({
        item: matchedId || null,     
        name: zItem.name,
        description: zItem.desc || "",
        price,
        isFree: price === 0,
        dietaryType, 
        displayOrder: resolvedItems.length,
      });
    }

    const selectionType = group.max === 1 ? "single" : "multiple";

    const newAddonGroup = await AddonGroup.create({
      restaurant: id,
      name: group.name,
      selectionType,
      minSelection: group.min ?? 0,
      maxSelection: group.max ?? null,
      items: resolvedItems,
    });
    addonGroupsImported++;
    groupIdToMongoId[groupId] = newAddonGroup._id;

    const linkedItemIds = resolvedItems.filter(r => r.item).map(r => r.item);
    if (linkedItemIds.length > 0) {
      await MenuItem.updateMany(
        { _id: { $in: linkedItemIds }, restaurant: id },
        { $addToSet: { addonGroups: newAddonGroup._id } }
      );
    }
  }

  const itemUpdates = [];
  for (const data of Object.values(itemNameToId)) {
    if (data.modifiers && data.modifiers.length > 0) {
      const validMongoIds = data.modifiers
        .map(id => groupIdToMongoId[id])
        .filter(Boolean);
      
      if (validMongoIds.length > 0) {
        itemUpdates.push(
          MenuItem.findByIdAndUpdate(data.id, { $addToSet: { addonGroups: { $each: validMongoIds } } })
        );
      }
    }
  }
  
  if (itemUpdates.length > 0) {
    await Promise.all(itemUpdates);
  }

  for (const data of Object.values(itemNameToId)) {
    if (data.variantModifiers && data.variantModifiers.length > 0) {
      const itemDoc = await MenuItem.findById(data.id);
      if (itemDoc && itemDoc.variants && itemDoc.variants.length > 0) {
        let hasVariantChanges = false;
        data.variantModifiers.forEach(({ variantIndex, optionIndex, modifierIds }) => {
          const validMongoIds = modifierIds
            .map(id => groupIdToMongoId[id])
            .filter(Boolean);

          if (
            itemDoc.variants[variantIndex]?.options?.[optionIndex] &&
            validMongoIds.length > 0
          ) {
            itemDoc.variants[variantIndex].options[optionIndex].addonGroups = validMongoIds;
            hasVariantChanges = true;
          }
        });

        if (hasVariantChanges) {
          await itemDoc.save();
        }
      }
    }
  }

  // Auto-apply matched food images from photo library (unless explicitly disabled)
  let imagesApplied = 0;
  let appliedItems = [];
  const newItemIds = Object.values(itemNameToId).map((v) => v.id).filter(Boolean);

  if (body.autoApplyImages !== false && newItemIds.length > 0) {
    try {
      const autoResult = await autoApplyImagesToItems({
        restaurantId: id,
        itemIds: newItemIds,
        overwrite: false,
      });
      imagesApplied = autoResult.matchedCount || 0;
      appliedItems = autoResult.updatedItems || [];
    } catch (err) {
      console.warn("Auto-apply images error during JSON import:", err.message);
    }
  }

  await invalidateCategoryCache(id);
  await invalidateItemCache(id);
  await invalidateAddonGroupCache(id);

  return successResponse(
    {
      total_items: itemsImported,
      stats: {
        categoriesImported,
        itemsImported,
        addonGroupsImported,
        imagesApplied,
      },
      appliedItems,
    },
    `Menu imported successfully from JSON${
      imagesApplied > 0 ? ` and auto-applied ${imagesApplied} library images` : ""
    }`
  );
});
