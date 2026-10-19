import { Schema, model, models } from "mongoose";

const SubscriptionPaymentSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    userId: {
      type: String,
      default: null,
      index: true,
    },
    planId: {
      type: String,
      required: true,
    },
    planTitle: {
      type: String,
      required: true,
    },
    billingCycle: {
      type: String,
      default: "monthly",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    selectedAddons: [
      {
        id: String,
        title: String,
        price: Number,
      },
    ],
    phone: {
      type: String,
      default: null,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      required: true,
    },
    razorpaySignature: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PENDING"],
      default: "SUCCESS",
    },
  },
  {
    timestamps: true,
  }
);

export default models.SubscriptionPayment || model("SubscriptionPayment", SubscriptionPaymentSchema);
