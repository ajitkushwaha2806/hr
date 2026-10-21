import mongoose from "mongoose";

const OfficeLocationSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: [true, "Organization ID is required"],
      index: true,
    },
    officeName: {
      type: String,
      default: "Headquarters Office",
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, "Office latitude is required"],
    },
    longitude: {
      type: Number,
      required: [true, "Office longitude is required"],
    },
    radiusMeters: {
      type: Number,
      default: 200, // 200 meters geofence radius
      min: 10,
      max: 5000,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    calibratedAt: {
      type: Date,
      default: Date.now,
    },
    calibratedBy: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

OfficeLocationSchema.index({ organizationId: 1, isActive: 1 });

export default mongoose.models.OfficeLocation ||
  mongoose.model("OfficeLocation", OfficeLocationSchema);
