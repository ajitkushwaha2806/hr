import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import WebsiteConfig from "@/models/WebsiteConfig";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { getCache, setCache } from "@/services/backend/redis/cache.service";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";
import { getWebsiteConfigCacheKey, invalidateWebsiteConfigCache, invalidateRestaurantCache } from "@/lib/api/helpers/cacheKeys";
import { formatOrderingResponse } from "@/lib/api/helpers/orderingConfig";

export const GET = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) throw new BadRequestError("Restaurant ID is required");

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const cacheKey = getWebsiteConfigCacheKey(id);
  const cachedConfig = await getCache(cacheKey);

  if (cachedConfig) {
    return successResponse(
      cachedConfig,
      "Website configuration fetched successfully (cached)"
    );
  }

  const config = await WebsiteConfig.findOne({ restaurant: id })
    .populate("homepage.banners.items.image")
    .lean();

  if (!config) {
    return successResponse(
      null,
      "No website configuration found for this restaurant."
    );
  }

  const restaurantDoc = await Restaurant.findById(id).select("upiId").lean();
  const effectiveUpi = (config.ordering?.paymentSettings?.upi?.upiId || config.ordering?.upiId || restaurantDoc?.upiId || "").trim();
  if (effectiveUpi) {
    if (!config.ordering) config.ordering = {};
    if (!config.ordering.paymentSettings) config.ordering.paymentSettings = {};
    if (!config.ordering.paymentSettings.upi) config.ordering.paymentSettings.upi = {};
    config.ordering.upiId = effectiveUpi;
    config.ordering.paymentSettings.upi.upiId = effectiveUpi;
    if (config.ordering.paymentSettings.upi.isEnabled === undefined) {
      config.ordering.paymentSettings.upi.isEnabled = true;
    }
    if (!config.ordering.paymentSettings.activeProvider) {
      config.ordering.paymentSettings.activeProvider = "UPI";
    }
  }

  config.ordering = formatOrderingResponse(config.ordering);
  await setCache(cacheKey, config, 3600);
  return successResponse(config, "Website configuration fetched successfully");
});

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) throw new BadRequestError("Restaurant ID is required");

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const data = await req.json();
  const upiIdToSync = data.ordering?.paymentSettings?.upi?.upiId ?? data.ordering?.upiId;
  if (upiIdToSync !== undefined) {
    await Restaurant.findByIdAndUpdate(id, { upiId: upiIdToSync.trim() });
  }

  const updatedConfig = await WebsiteConfig.findOneAndUpdate(
    { restaurant: id },
    { $set: data },
    { returnDocument: 'after', upsert: true, runValidators: true }
  ).populate("homepage.banners.items.image");

  await invalidateWebsiteConfigCache(id);
  await invalidateRestaurantCache({ restaurantId: id });

  const formattedConfig = updatedConfig ? (updatedConfig.toObject ? updatedConfig.toObject() : JSON.parse(JSON.stringify(updatedConfig))) : null;
  if (formattedConfig?.ordering) {
    formattedConfig.ordering = formatOrderingResponse(formattedConfig.ordering);
  }

  return successResponse(
    formattedConfig || updatedConfig,
    "Website configuration saved successfully"
  );
});
