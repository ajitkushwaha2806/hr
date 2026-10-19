import crypto from "crypto";
import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import SubscriptionPayment from "@/models/SubscriptionPayment";
import { auth } from "@clerk/nextjs/server";
import { PRICING_PLANS, PRICING_ADDONS, PRICING_DATA } from "@/constants/pricing";
import { successResponse, errorResponse } from "@/lib/api/response-handler";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    const {
      restaurantId,
      planId,
      selectedAddonIds = [],
      phone = "",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!restaurantId || !planId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse("Missing required payment verification details", 400);
    }

    const keySecret = process.env.RAZORPAY_LIVE_KEY_SECRET;
    if (!keySecret) {
      return errorResponse("Server payment secret is not configured", 500);
    }

    // Verify HMAC-SHA256 signature
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("[Subscription Verification Failed] Signature mismatch", {
        expected: generatedSignature,
        received: razorpay_signature,
      });
      return errorResponse("Invalid payment signature verification failed", 400);
    }

    await dbConnect();
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return errorResponse("Restaurant not found", 404);
    }

    // Resolve Plan
    const plan =
      PRICING_PLANS.find((p) => p._id === planId) ||
      PRICING_DATA.find((p) => p.id === planId);

    const durationMonths =
      plan?.durationMonths ||
      (planId === "plan_yearly" || planId === "1-year"
        ? 12
        : planId === "plan_quarterly" || planId === "3-month"
        ? 3
        : 1);

    const now = new Date();
    const currentSub = restaurant.subscription || {};
    const currentEndDate = currentSub.endDate ? new Date(currentSub.endDate) : null;

    let newStartDate = now;
    let baseDate = now;

    // If current subscription is active and has not expired, extend from existing endDate
    if (currentEndDate && currentEndDate > now && currentSub.status === "active") {
      newStartDate = currentSub.startDate || now;
      baseDate = currentEndDate;
    }

    const newEndDate = new Date(baseDate);
    newEndDate.setMonth(newEndDate.getMonth() + durationMonths);

    // Resolve Addons
    const resolvedAddons = (selectedAddonIds || [])
      .map((id) => PRICING_ADDONS.find((a) => a._id === id))
      .filter(Boolean)
      .map((a) => ({
        id: a._id,
        title: a.title,
        price: a.price,
        purchasedAt: now,
      }));

    const addonsTotal = resolvedAddons.reduce((sum, a) => sum + a.price, 0);
    const basePrice = plan?.totalPrice || plan?.price || 0;
    const totalPaidAmount = basePrice + addonsTotal;

    // Update restaurant subscription
    restaurant.subscription = {
      status: "active",
      plan: plan?._id || planId,
      startDate: newStartDate,
      endDate: newEndDate,
      gracePeriodDays: 7,
      autoRenew: false,
      selectedAddons: [
        ...(currentSub.selectedAddons || []),
        ...resolvedAddons,
      ],
      lastPayment: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: totalPaidAmount,
        paidAt: now,
      },
      updatedAt: now,
    };

    // If Custom Domain add-on was purchased, ensure domain capability is recognized
    if (selectedAddonIds?.includes("addon_domain")) {
      if (!restaurant.features) restaurant.features = {};
      restaurant.features.customDomain = true;
    }

    await restaurant.save();

    // Create persistent audit record
    try {
      await SubscriptionPayment.create({
        restaurantId: restaurant._id,
        userId,
        planId: plan?._id || planId,
        planTitle: plan?.title || "Subscription Plan",
        billingCycle: plan?.billingCycle || "monthly",
        amount: totalPaidAmount,
        currency: "INR",
        selectedAddons: resolvedAddons,
        phone: phone || restaurant.phone || null,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "SUCCESS",
      });
    } catch (auditErr) {
      console.warn("[Subscription Audit Log Warning]:", auditErr.message);
    }

    return successResponse({
      message: `Successfully activated ${plan?.title || "plan"}! Your subscription is now active.`,
      subscription: restaurant.subscription,
      planTitle: plan?.title,
      validUntil: newEndDate.toISOString(),
    });
  } catch (error) {
    console.error("[Subscription Verification Error]:", error);
    return errorResponse(error?.message || "Failed to verify subscription payment", 500);
  }
}
