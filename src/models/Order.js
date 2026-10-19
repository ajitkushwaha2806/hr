import { Schema, Types, models, model } from "mongoose";

export const ORDER_STATUS = Object.freeze({
  PLACED: "PLACED",
  ACCEPTED: "ACCEPTED",
  PREPARING: "PREPARING",
  READY: "READY",
  SERVED: "SERVED",
  PICKED_UP: "PICKED_UP",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
});

export const PAYMENT_STATUS = Object.freeze({
  PENDING: "PENDING",
  UNVERIFIED: "UNVERIFIED",
  AUTHORIZED: "AUTHORIZED",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
});

export const ORDER_TYPES = Object.freeze(["DINE_IN", "TAKEAWAY", "DELIVERY"]);
export const PAYMENT_METHODS = Object.freeze(["CASH", "CARD", "UPI", "ONLINE"]);
export const DIETARY_TYPES = Object.freeze(["veg", "non-veg", "egg", "vegan"]);

const OrderItemAddonSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, default: 0, min: [0, "Addon price cannot be negative"] },
    isFree: { type: Boolean, default: false },
    dietaryType: { type: String, enum: DIETARY_TYPES, default: "veg" },
  },
  { _id: false }
);

const OrderItemVariantSchema = new Schema(
  {
    name: { type: String, trim: true },
    price: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const OrderItemSchema = new Schema({
  menuItem: {
    type: Types.ObjectId,
    ref: "MenuItem",
    required: [true, "Menu item reference is required"],
  },
  name: { type: String, required: [true, "Item name is required"], trim: true },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  unitPrice: {
    type: Number,
    required: [true, "Unit price is required"],
    min: [0, "Unit price cannot be negative"],
  },
  variant: {
    type: OrderItemVariantSchema,
    default: null,
  },
  addons: {
    type: [OrderItemAddonSchema],
    default: [],
  },
  specialInstructions: { type: String, trim: true, default: "" },
  totalPrice: {
    type: Number,
    required: [true, "Total price is required"],
    min: [0, "Total price cannot be negative"],
  },
});

const DeliveryAddressSchema = new Schema(
  {
    street: { type: String, required: [true, "Street address is required"], trim: true },
    city: { type: String, required: [true, "City is required"], trim: true },
    state: { type: String, trim: true, default: "" },
    zipCode: { type: String, required: [true, "Zip/Postal code is required"], trim: true },
    label: { type: String, trim: true, default: "" },
    instructions: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const CustomerInfoSchema = new Schema(
  {
    name: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema(
  {
    statusType: {
      type: String,
      enum: ["ORDER", "PAYMENT"],
      required: true,
    },
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    updatedByStaff: { type: Types.ObjectId, ref: "Staff", default: null },
    updatedByCustomer: { type: Types.ObjectId, ref: "User", default: null },
  },
  { _id: false }
);

const OrderChargesSchema = new Schema(
  {
    deliveryFee: { type: Number, default: 0, min: 0 },
    packingCharge: { type: Number, default: 0, min: 0 },
    platformFee: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const PaymentDetailsSchema = new Schema(
  {
    razorpayOrderId: { type: String, trim: true, index: true, sparse: true },
    razorpayPaymentId: { type: String, trim: true },
    razorpaySignature: { type: String, trim: true },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    restaurant: {
      type: Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant reference is required"],
      index: true,
    },
    orderNumber: {
      type: String,
      required: [true, "Order number is required"],
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    tokenNumber: {
      type: Number,
      min: 1,
    },
    orderType: {
      type: String,
      enum: ORDER_TYPES,
      required: [true, "Order type is required"],
      index: true,
    },
    table: {
      type: Types.ObjectId,
      ref: "Table",
      required: function () {
        return this.orderType === "DINE_IN";
      },
      default: null,
    },
    customer: {
      type: Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    customerInfo: {
      type: CustomerInfoSchema,
      default: () => ({}),
    },
    deliveryAddress: {
      type: DeliveryAddressSchema,
      required: function () {
        return this.orderType === "DELIVERY";
      },
      default: null,
    },
    items: {
      type: [OrderItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PLACED,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: () => [],
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
    charges: {
      type: OrderChargesSchema,
      default: () => ({ deliveryFee: 0, packingCharge: 0, platformFee: 0 }),
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, "Tax cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: "CASH",
    },
    paymentDetails: {
      type: PaymentDetailsSchema,
      default: null,
    },
    specialInstructions: {
      type: String,
      trim: true,
      default: "",
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

OrderSchema.pre("save", function () {
  const subtotal = Number(this.subtotal) || 0;
  const deliveryFee = Number(this.charges?.deliveryFee) || 0;
  const packingCharge = Number(this.charges?.packingCharge) || 0;
  const platformFee = Number(this.charges?.platformFee) || 0;
  const tax = Number(this.tax) || 0;
  const discount = Number(this.discount) || 0;

  if (
    this.isModified("subtotal") ||
    this.isModified("charges") ||
    this.isModified("tax") ||
    this.isModified("discount") ||
    this.totalAmount == null
  ) {
    const rawTotal = subtotal + deliveryFee + packingCharge + platformFee + tax - discount;
    this.totalAmount = Math.max(0, Math.round(rawTotal * 100) / 100);
  }
});

OrderSchema.index({ restaurant: 1, orderStatus: 1, createdAt: -1 });
OrderSchema.index({ restaurant: 1, createdAt: -1 });
OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ "customerInfo.phone": 1, restaurant: 1 });

export const OrderStatus = ORDER_STATUS;
export const PaymentStatus = PAYMENT_STATUS;

if (process.env.NODE_ENV === "development" && models.Order) {
  delete models.Order;
}

export default models.Order || model("Order", OrderSchema);
