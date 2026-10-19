import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import WebsiteConfig from "@/models/WebsiteConfig";
import { formatOrderingResponse } from "@/lib/api/helpers/orderingConfig";
import { razorpayService } from "@/services/backend/payments/razorpay";
import { backendIntegrationService } from "@/services/backend/integration";
import { successResponse, errorResponse } from "@/lib/api/response-handler";
import { getSubscriptionInfo } from "@/lib/subscription";

export const POST = async (req, { params }) => {
    try {
        const body = await req.json();
        const resolvedParams = params ? await params : {};
        const domain = resolvedParams.slug || body.domain;
        const { amount, currency = "INR", notes = {} } = body;

        if (!domain) {
            return errorResponse("Restaurant slug is required!", 400);
        }

        if (!amount || amount <= 0) {
            return errorResponse("Valid order amount is required!", 400);
        }

        await dbConnect();
        const restaurant = await Restaurant.findOne({ slug: domain }).lean();
        
        if (!restaurant?._id) {
            return errorResponse("Restaurant not found", 404);
        }

        const subInfo = getSubscriptionInfo(restaurant);
        if (!subInfo.isOrderingAllowed) {
            return errorResponse("Online ordering is currently unavailable for this restaurant as its subscription has expired.", 400);
        }

        const reqOrderType = body.orderType || notes.orderType;
        if (reqOrderType) {
            const websiteConfig = await WebsiteConfig.findOne({ restaurant: restaurant._id }).lean();
            if (websiteConfig?.ordering) {
                const orderingConfig = formatOrderingResponse(websiteConfig.ordering);
                const acceptedTypes = orderingConfig.acceptedTypes || [];
                if (acceptedTypes.length > 0 && !acceptedTypes.includes(reqOrderType)) {
                    return errorResponse(`${reqOrderType.replace('_', ' ')} ordering is not accepted by this restaurant`, 400);
                }
                const typeConfig = reqOrderType === "DINE_IN"
                    ? orderingConfig.dineIn
                    : reqOrderType === "TAKEAWAY"
                        ? orderingConfig.takeaway
                        : orderingConfig.delivery;
                if (typeConfig && typeConfig.isEnabled === false) {
                    return errorResponse(`${reqOrderType.replace('_', ' ')} ordering is currently disabled for this restaurant`, 400);
                }
                if (typeConfig?.minOrderValue?.isEnabled) {
                    const minAmount = Number(typeConfig.minOrderValue.amount || 0);
                    const subtotal = Number(body.subtotal || notes.subtotal || amount);
                    if (minAmount > 0 && subtotal < minAmount) {
                        return errorResponse(`Minimum order value for ${reqOrderType.replace('_', ' ').toLowerCase()} is ₹${minAmount}`, 400);
                    }
                }
            }
        }

        const integrations = await backendIntegrationService.getIntegrations(restaurant._id, true);
        const accessToken = integrations?.razorpay?.accessToken;

        if (!accessToken || !integrations?.razorpay?.isLinked) {
            return errorResponse(
                "This restaurant has not connected a Razorpay account.",
                400
            );
        }

        const amountInPaise = Math.round(Number(amount) * 100);

        const options = {
            amount: amountInPaise,
            currency,
            receipt: `rcpt_${domain}_${Date.now()}`,
            notes: {
                domain,
                ...notes,
            },
        };

        let order;
        try {
            order = await razorpayService.createOrder(accessToken, options);
        } catch (err) {
            console.error("Razorpay API error:", err.message);
            return errorResponse(err.message, 500);
        }

        return successResponse(
            {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: integrations?.razorpay?.publicToken || integrations?.razorpay?.accountId || process.env.RAZORPAY_CLIENT_ID || process.env.NEXT_PUBLIC_RAZORPAY_CLIENT_ID,
            },
            "Razorpay order created successfully",
            201
        );
    } catch (err) {
        console.error("Razorpay create order error:", err);
        return errorResponse(
            err.message || "Failed to create Razorpay order",
            500
        );
    }
};
