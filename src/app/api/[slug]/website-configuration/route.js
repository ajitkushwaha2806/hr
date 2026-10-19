import "@/models/Image";
import dbConnect from "@/lib/db";
import Integration from "@/models/Integration";
import WebsiteConfig from "@/models/WebsiteConfig";
import { getWebsiteConfigCacheKey } from "@/lib/api/helpers/cacheKeys";
import { getRestaurantIdFromSlug } from "@/lib/api/hooks/getRestaurant";
import { getCache, setCache } from "@/services/backend/redis/cache.service";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

import Restaurant from "@/models/Restaurant";
import { getSubscriptionInfo } from "@/lib/subscription";
import { formatOrderingResponse } from "@/lib/api/helpers/orderingConfig";

export const GET = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;
    if (!slug) {
        throw new BadRequestError("Restaurant slug is required");
    }

    const restaurantId = await getRestaurantIdFromSlug(slug);
    const cacheKey = getWebsiteConfigCacheKey(restaurantId);
    
    let config = await getCache(cacheKey);

    if (!config) {
        await dbConnect();
        
        config = await WebsiteConfig.findOne({ restaurant: restaurantId })
            .populate("homepage.banners.items.image")
            .lean();

        if (!config) {
            return successResponse(null, "No website configuration found", 200);
        }

        await setCache(cacheKey, config, 600);
    }

    const integration = await Integration.findOne({ restaurantId }).lean();
    const isRazorpayLinked = Boolean(integration?.razorpay?.accountId && integration?.razorpay?.isActive);

    const restaurantDoc = await Restaurant.findById(restaurantId).select("upiId status subscription createdAt").lean();
    const subInfo = getSubscriptionInfo(restaurantDoc);

    const effectiveUpiId = (
        config?.ordering?.paymentSettings?.upi?.upiId ||
        config?.ordering?.upiId ||
        restaurantDoc?.upiId ||
        ""
    ).trim();

    const rawUpiEnabled = config?.ordering?.paymentSettings?.upi?.isEnabled;
    const rawRazorpayEnabled = config?.ordering?.paymentSettings?.razorpay?.isEnabled ?? config?.ordering?.razorpayEnabled;

    let isRazorpayEnabled = (rawRazorpayEnabled !== undefined ? Boolean(rawRazorpayEnabled) : true) && isRazorpayLinked;
    let isUpiEnabled = false;

    if (Boolean(effectiveUpiId)) {
        if (rawUpiEnabled !== undefined) {
            isUpiEnabled = Boolean(rawUpiEnabled);
        } else {
            // Default: If UPI ID exists and Razorpay is not linked (or activeProvider is UPI)
            isUpiEnabled = !isRazorpayLinked || config?.ordering?.paymentSettings?.activeProvider === "UPI";
        }
    }

    let activeProvider = config?.ordering?.paymentSettings?.activeProvider;
    if (!activeProvider) {
        activeProvider = (isRazorpayEnabled && isRazorpayLinked) ? "RAZORPAY" : (isUpiEnabled ? "UPI" : "RAZORPAY");
    }

    // Enforce mutual exclusivity
    if (activeProvider === "UPI" && Boolean(effectiveUpiId)) {
        isUpiEnabled = true;
        isRazorpayEnabled = false;
    } else if (activeProvider === "RAZORPAY" && isRazorpayLinked) {
        isRazorpayEnabled = true;
        isUpiEnabled = false;
    }

    const hasAnyOnlineMethod = isRazorpayEnabled || isUpiEnabled;

    config = JSON.parse(JSON.stringify(config));
    if (!config.ordering) config.ordering = {};

    config.ordering.subscription = {
        isExpired: subInfo.isExpired,
        status: subInfo.status,
        daysLeft: subInfo.daysLeft,
        deletionDaysLeft: subInfo.deletionDaysLeft,
        isOrderingAllowed: subInfo.isOrderingAllowed,
    };

    if (!subInfo.isOrderingAllowed) {
        config.ordering.isOnlineOrderingEnabled = false;
        config.ordering.paymentMethods = [];
        config.ordering.defaultPaymentMethod = null;
        config.ordering.subscriptionNotice = "Online ordering is currently unavailable for this restaurant as its subscription has expired.";
    }

    config.ordering.upiId = effectiveUpiId;
    config.ordering.razorpayEnabled = isRazorpayEnabled && (activeProvider !== "UPI");
    if (!config.ordering.paymentSettings) config.ordering.paymentSettings = {};
    config.ordering.paymentSettings.upi = {
        isEnabled: isUpiEnabled,
        upiId: effectiveUpiId,
    };
    config.ordering.paymentSettings.razorpay = {
        isEnabled: isRazorpayEnabled,
    };
    config.ordering.paymentSettings.activeProvider = activeProvider;

    if (!hasAnyOnlineMethod && config.ordering.paymentMethods?.includes("ONLINE")) {
        config.ordering.paymentMethods = config.ordering.paymentMethods.filter(m => m !== "ONLINE");
        if (config.ordering.defaultPaymentMethod === "ONLINE") {
            config.ordering.defaultPaymentMethod = config.ordering.paymentMethods.length > 0 ? config.ordering.paymentMethods[0] : null;
        }
    }

    config.ordering = formatOrderingResponse(config.ordering);

    return successResponse(config, "Website configuration fetched successfully");
});
