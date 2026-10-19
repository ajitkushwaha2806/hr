import axios from "axios";
import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
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
    const { restaurantId, planId, selectedAddonIds = [], phone = "" } = body;

    if (!restaurantId) {
      return errorResponse("Restaurant ID is required", 400);
    }

    if (!planId) {
      return errorResponse("Plan ID is required", 400);
    }

    // Verify restaurant exists
    await dbConnect();
    const restaurant = await Restaurant.findById(restaurantId).lean();
    if (!restaurant) {
      return errorResponse("Restaurant not found", 404);
    }

    // Resolve plan
    const plan =
      PRICING_PLANS.find((p) => p._id === planId) ||
      PRICING_DATA.find((p) => p.id === planId);

    if (!plan) {
      return errorResponse(`Invalid plan selected: ${planId}`, 400);
    }

    // Resolve addons
    const resolvedAddons = (selectedAddonIds || [])
      .map((id) => PRICING_ADDONS.find((a) => a._id === id))
      .filter(Boolean);

    const addonsTotal = resolvedAddons.reduce((sum, a) => sum + (a.price || 0), 0);
    const basePrice = plan.totalPrice || plan.price;
    const finalAmount = basePrice + addonsTotal;

    if (finalAmount <= 0) {
      return errorResponse("Invalid calculation amount", 400);
    }

    const keyId = process.env.RAZORPAY_LIVE_API_KEY;
    const keySecret = process.env.RAZORPAY_LIVE_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("[Subscription Create Order] Razorpay credentials missing in environment variables");
      return errorResponse("Payment gateway is not properly configured", 500);
    }

    // Amount in paise
    const amountInPaise = Math.round(finalAmount * 100);

    const authHeader =
      "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const receiptId = `sub_${String(restaurantId).slice(-6)}_${Date.now().toString().slice(-6)}`;

    const rzpOrderResponse = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId,
        notes: {
          restaurantId: String(restaurantId),
          userId: String(userId),
          planId: plan._id || plan.id,
          planTitle: plan.title,
          billingCycle: plan.billingCycle || "monthly",
          phone: String(phone || ""),
          addonCount: String(resolvedAddons.length),
        },
      },
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    const rzpOrder = rzpOrderResponse.data;

    return successResponse({
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      finalAmount,
      keyId,
      planTitle: plan.title,
      restaurantName: restaurant.name,
      restaurantPhone: restaurant.phone || phone,
    });
  } catch (error) {
    console.error("[Subscription Create Order Error]:", error?.response?.data || error?.message || error);
    return errorResponse(
      error?.response?.data?.error?.description ||
        error?.message ||
        "Failed to initiate subscription payment",
      500
    );
  }
}
