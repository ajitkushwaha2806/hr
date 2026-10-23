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
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    radiusMeters: {
      type: Number,
      default: 200,
      min: 10,
      max: 5000,
    },
    matchThreshold: {
      type: Number,
      default: 75,
      min: 50,
      max: 100,
    },
    shiftStart: {
      type: String,
      default: "10:00",
      trim: true,
    },
    shiftEnd: {
      type: String,
      default: "19:00",
      trim: true,
    },
    gracePeriod: {
      type: Number,
      default: 15,
      min: 0,
      max: 120,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    // Company Profile & Legal NDA Details
    companyName: {
      type: String,
      default: "",
      trim: true,
    },
    companyAddress: {
      type: String,
      default: "",
      trim: true,
    },
    companyPhone: {
      type: String,
      default: "",
      trim: true,
    },
    companyWebsite: {
      type: String,
      default: "",
      trim: true,
    },
    companyRepresentative: {
      type: String,
      default: "",
      trim: true,
    },
    companyDesignation: {
      type: String,
      default: "Authorized Signatory",
      trim: true,
    },
    companyLogo: {
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
