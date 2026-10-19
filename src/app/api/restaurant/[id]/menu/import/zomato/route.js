import axios from "axios";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import Category from "@/models/Category";
import AddonGroup from "@/models/AddonGroup";
import Restaurant from "@/models/Restaurant";
import { uploadToS3 } from "@/services/backend/s3";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";
import { invalidateCategoryCache, invalidateItemCache, invalidateAddonGroupCache } from "@/lib/api/helpers/cacheKeys";

const parsePrice = (val) => {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const parseVariantGroups = (itemData) => {
  if (!itemData || !Array.isArray(itemData.groups)) {
    return [];
  }

  return itemData.groups
    .map((groupWrapper) => {
      const group = groupWrapper?.group;
      if (!group) return null;

      return {
        property_name: group?.name || group?.label || "",
        options: Array.isArray(group?.items)
          ? group.items.map((itemWrapper) => {
              const option = itemWrapper?.item || {};
              const rawPrice = option?.price ?? option?.default_price ?? option?.display_price ?? option?.min_price;
              return {
                name: option?.name || "",
                price: parsePrice(rawPrice),
              };
            })
          : [],
      };
    })
    .filter(Boolean);
};

const getNormalizedUrl = (url) => {
  let cleanedUrl = url.trim();
  if (!/^https?:\/\//i.test(cleanedUrl)) {
    cleanedUrl = `https://${cleanedUrl}`;
  }

  const parsed = new URL(cleanedUrl);
  const domain = `${parsed.protocol}//${parsed.host}`;
  const parts = parsed.pathname.split("/").filter(Boolean);

  if (parts.length < 2) {
    throw new BadRequestError("Invalid URL: city and outlet_name are required");
  }

  const city = parts[0];
  const outletName = parts[1];
  return `${domain}/${city}/${outletName}/order`;
};

const extractImageUrl = (data) => {
  if (!data) return null;
  if (typeof data.item_image_url === "string" && data.item_image_url.trim()) {
    return data.item_image_url.trim();
  }
  if (typeof data.image_url === "string" && data.image_url.trim()) {
    return data.image_url.trim();
  }
  if (typeof data.image === "string" && data.image.trim()) {
    return data.image.trim();
  }
  if (data.image?.url && typeof data.image.url === "string" && data.image.url.trim()) {
    return data.image.url.trim();
  }
  if (typeof data.thumb === "string" && data.thumb.trim()) {
    return data.thumb.trim();
  }
  if (Array.isArray(data.media)) {
    for (const m of data.media) {
      const url = m?.image?.url || m?.url || m?.media_url;
      if (typeof url === "string" && url.trim()) return url.trim();
    }
  }
  if (Array.isArray(data.media_list)) {
    for (const m of data.media_list) {
      const url = m?.image?.url || m?.url || m?.media_url;
      if (typeof url === "string" && url.trim()) return url.trim();
    }
  }
  return null;
};

const uploadZomatoImageToS3 = async (rawUrl) => {
  if (!rawUrl) return null;
  let normalizedUrl = rawUrl.trim();
  if (normalizedUrl.startsWith("//")) {
    normalizedUrl = `https:${normalizedUrl}`;
  }
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    return null;
  }

  try {
    const imgResp = await axios.get(normalizedUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
        Accept: "image/*,*/*",
      },
    });

    const buffer = Buffer.from(imgResp.data);
    if (!buffer || buffer.length === 0) return null;

    const contentType = imgResp.headers["content-type"] || "";
    let ext = ".jpg";
    if (contentType.includes("webp")) ext = ".webp";
    else if (contentType.includes("png")) ext = ".png";
    else if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = ".jpg";
    else if (contentType.includes("avif")) ext = ".avif";
    else {
      const cleanPath = normalizedUrl.split("?")[0];
      const extMatch = cleanPath.match(/\.(jpg|jpeg|png|webp|avif|gif)/i);
      if (extMatch) ext = extMatch[0].toLowerCase();
    }

    const uniqueId = crypto.randomUUID().slice(0, 8);
    const fileName = `zomato-${Date.now()}-${uniqueId}${ext}`;

    const s3Result = await uploadToS3({
      file: buffer,
      folder: "foodsnap/original",
      fileName,
    });

    return {
      key: s3Result.key,
      url: s3Result.url,
      fileName: s3Result.fileName || fileName,
    };
  } catch (err) {
    console.error(`[ZomatoImport] Failed to upload image to S3: ${normalizedUrl}`, err.message);
    return null;
  }
};

export const GET = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required");
  }

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const pageUrlParam = searchParams.get("pageUrl");
  if (!pageUrlParam) {
    throw new BadRequestError("pageUrl query parameter is required");
  }

  const importItems = searchParams.get("items") !== "false";
  const importMedia = searchParams.get("media") !== "false";
  const importAddons = searchParams.get("addons") !== "false";
  const importAddress = searchParams.get("address") !== "false";

  const pageUrl = getNormalizedUrl(pageUrlParam);

  const response = await axios.get(
    "https://www.zomato.com/webroutes/getPage",
    {
      params: {
        page_url: pageUrl,
        location: "",
        isMobile: 0,
      },
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
        cookie: process.env.ZOMATO_COOKIES || "",
      },
    }
  );

  const menus = response?.data?.page_data?.order?.menuList?.menus || [];
  const modifierGroups = response?.data?.page_data?.order?.menuList?.modifierGroups || {};
  const resContactInfo = response?.data?.page_data?.sections?.SECTION_RES_CONTACT || {};

  // PRE-FLIGHT VALIDATION: Verify pricing before scraping or uploading anything
  if (importItems) {
    if (!menus || menus.length === 0) {
      throw new BadRequestError(
        "No menu items returned from Zomato. The page may not have an active online ordering menu or Zomato cookies have expired."
      );
    }

    let totalItemsFound = 0;
    let itemsWithPrice = 0;

    for (const menuWrapper of menus) {
      const menu = menuWrapper?.menu || {};
      const subCategories = menu.categories || [];
      for (const subWrapper of subCategories) {
        const subCategoryData = subWrapper?.category || {};
        const items = subCategoryData.items || [];
        for (const itemWrapper of items) {
          const itemData = itemWrapper?.item;
          if (!itemData || !itemData.name) continue;
          totalItemsFound++;

          const rawPrice = itemData.price ?? itemData.default_price ?? itemData.display_price ?? itemData.min_price;
          const parsedPrice = parsePrice(rawPrice);

          if (parsedPrice > 0) {
            itemsWithPrice++;
            continue;
          }

          const variants = parseVariantGroups(itemData);
          const hasVariantWithPrice = variants.some((v) =>
            v.options.some((opt) => typeof opt.price === "number" && opt.price > 0)
          );

          if (hasVariantWithPrice) {
            itemsWithPrice++;
          }
        }
      }
    }

    if (totalItemsFound === 0) {
      throw new BadRequestError(
        "No items found on this Zomato page. Cookies may be expired or the page is unavailable."
      );
    }

    if (itemsWithPrice === 0) {
      throw new BadRequestError(
        "Item prices are missing from Zomato response. Zomato cookies are expired and must be updated in .env (ZOMATO_COOKIES)."
      );
    }
  }

  if (importAddress && (resContactInfo.city_name || resContactInfo.address)) {
    const lat = parseFloat(resContactInfo.latitude);
    const lng = parseFloat(resContactInfo.longitude);
    
    const updateData = {
      "address.city": resContactInfo.city_name || "",
      "address.street": resContactInfo.address || "",
      "address.country": "IN"
    };

    if (!isNaN(lng) && !isNaN(lat)) {
      updateData["address.location.type"] = "Point";
      updateData["address.location.coordinates"] = [lng, lat];
    }

    const currentRes = await Restaurant.findById(id).select("logo");
    if (!currentRes?.logo && importMedia) {
      const resHeader = response?.data?.page_data?.sections?.SECTION_RES_HEADER || response?.data?.page_data?.sections?.SECTION_BASIC_INFO || {};
      const rawLogoUrl = resHeader?.image?.url || resHeader?.res_thumb || resContactInfo?.image?.url || null;
      if (rawLogoUrl) {
        const s3Logo = await uploadZomatoImageToS3(rawLogoUrl);
        if (s3Logo?.key) {
          updateData["logo"] = s3Logo.key;
        }
      }
    }

    await Restaurant.findByIdAndUpdate(id, { $set: updateData });
  }

  let categoriesImported = 0;
  let itemsImported = 0;
  let addonGroupsImported = 0;

  const itemNameToId = {};
  const menusToProcess = importItems ? menus : [];
  for (const [menuIndex, menuWrapper] of menusToProcess.entries()) {
    const menu = menuWrapper?.menu || {};
    if (!menu.name) continue;

    const menuImgUrl = extractImageUrl(menu);
    let s3MenuImg = null;
    if (menuImgUrl && importMedia) {
      s3MenuImg = await uploadZomatoImageToS3(menuImgUrl);
    }

    const categoryPayload = {
      restaurant: id,
      name: menu.name,
      image: s3MenuImg?.key || null,
      displayOrder: menuIndex,
      parentCategory: null,
    };
    const mainCategory = await Category.create(categoryPayload);
    categoriesImported++;

    const subCategories = menu.categories || [];
    for (const [subIndex, subWrapper] of subCategories.entries()) {
      const subCategoryData = subWrapper?.category || {};
      const subCategoryName = subCategoryData.name?.trim() || menu.name;

      const subImgUrl = extractImageUrl(subCategoryData);
      let s3SubImg = null;
      if (subImgUrl && importMedia) {
        s3SubImg = await uploadZomatoImageToS3(subImgUrl);
      }

      const subCategoryPayload = {
        restaurant: id,
        name: subCategoryName,
        image: s3SubImg?.key || null,
        displayOrder: subIndex,
        parentCategory: mainCategory._id,
      };
      const subCategory = await Category.create(subCategoryPayload);
      categoriesImported++;

      const items = subCategoryData.items || [];
      for (const [itemIndex, itemWrapper] of items.entries()) {
        const itemData = itemWrapper?.item || {};
        if (!itemData.name) continue;

        const variants = parseVariantGroups(itemData);
        let dietaryType = "non-veg";
        if (itemData.dietary_slugs?.includes("veg") || itemData.dietary_slugs?.includes("vegan")) {
          dietaryType = "veg";
        }

        const zomatoImageUrl = extractImageUrl(itemData);
        let s3Image = null;

        if (zomatoImageUrl && importMedia) {
          s3Image = await uploadZomatoImageToS3(zomatoImageUrl);
        }

        const rawPrice = itemData.price ?? itemData.default_price ?? itemData.display_price ?? itemData.min_price;
        const basePrice = parsePrice(rawPrice);

        const itemPayload = {
          restaurant: id,
          category: mainCategory._id,
          subCategory: subCategory._id,
          name: itemData.name,
          description: itemData.desc || "",
          image: s3Image?.key || null,
          media: s3Image
            ? [{ url: s3Image.url, fileDirectory: "foodsnap/original", image_id: s3Image.fileName }]
            : [],
          base_price: basePrice,
          dietaryType: dietaryType,
          variants: variants,
          displayOrder: itemIndex,
          isAvailable: true,
        };
        const savedItem = await MenuItem.create(itemPayload);
        itemsImported++;

        itemNameToId[itemData.name.trim().toLowerCase()] = savedItem._id;
      }
    }
  }

  const modifierGroupEntries = importAddons ? Object.values(modifierGroups) : [];

  for (const groupWrapper of modifierGroupEntries) {
    const group = groupWrapper?.group;
    if (!group?.name) continue;

    const zItems = Array.isArray(group.items) ? group.items : [];
    const resolvedItems = [];
    for (const itemWrapper of zItems) {
      const zItem = itemWrapper?.item;
      if (!zItem?.name) continue;
      const matchedId = itemNameToId[zItem.name.trim().toLowerCase()];
      const rawPrice = zItem.price ?? zItem.default_price ?? zItem.display_price ?? zItem.min_price;
      const price = parsePrice(rawPrice);

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

    const linkedItemIds = resolvedItems.filter(r => r.item).map(r => r.item);
    if (linkedItemIds.length > 0) {
      await MenuItem.updateMany(
        { _id: { $in: linkedItemIds }, restaurant: id },
        { $addToSet: { addonGroups: newAddonGroup._id } }
      );
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
      },
    },
    "Menu imported successfully"
  );
});