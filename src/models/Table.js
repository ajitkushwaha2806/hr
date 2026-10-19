import crypto from "crypto";
import mongoose, { Schema, Types } from "mongoose";

const TableSchema = new Schema(
  {
    restaurant: {
      type: Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant is required"],
      index: true,
      immutable: true,
    },
    zone: {
      type: String,
      trim: true,
      maxlength: [50, "Zone name cannot exceed 50 characters"],
      default: "General",
      index: true,
    },
    tableNumber: {
      type: Number,
      required: [true, "Table number is required"],
      min: [1, "Table number must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Table number must be a whole number",
      },
    },
    label: {
      type: String,
      trim: true,
      maxlength: [50, "Table label cannot exceed 50 characters"],
      default: null,
    },
    capacity: {
      type: Number,
      required: [true, "Table capacity is required"],
      min: [1, "Table capacity must be at least 1"],
      max: [50, "Table capacity cannot exceed 50"],
      default: 4,
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      default: () => crypto.randomBytes(32).toString("hex"),
    },
    status: {
      type: String,
      enum: {
        values: ["available", "occupied", "reserved", "unavailable"],
        message: "{VALUE} is not a valid table status",
      },
      default: "available",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

TableSchema.index(
  { restaurant: 1, zone: 1, tableNumber: 1 },
  { unique: true },
);

export default mongoose.models.Table || mongoose.model("Table", TableSchema);


