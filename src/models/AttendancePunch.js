import mongoose from "mongoose";

const PunchVerificationSchema = new mongoose.Schema(
  {
    time: {
      type: Date,
      default: Date.now,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    accuracyMeters: {
      type: Number,
      default: 0,
    },
    distanceMeters: {
      type: Number,
      required: true,
    },
    withinGeofence: {
      type: Boolean,
      required: true,
      default: false,
    },
    selfieUrl: {
      type: String,
      required: true,
    },
    faceMatchConfidence: {
      type: Number,
      default: 0,
    },
    faceMatched: {
      type: Boolean,
      required: true,
      default: false,
    },
    verificationMethod: {
      type: String,
      enum: ["REKOGNITION", "AWS_REKOGNITION", "FALLBACK_VISION", "MANUAL_OVERRIDE"],
      default: "REKOGNITION",
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED_GEOFENCE", "FAILED_FACEMATCH"],
      default: "SUCCESS",
    },
  },
  { _id: false }
);

const AttendancePunchSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: [true, "Organization ID is required"],
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    clerkId: {
      type: String,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    checkIn: {
      type: PunchVerificationSchema,
      default: null,
    },
    checkOut: {
      type: PunchVerificationSchema,
      default: null,
    },
    durationMinutes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED", "FAILED", "NO_PUNCH_OUT"],
      default: "IN_PROGRESS",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

AttendancePunchSchema.index({ organizationId: 1, employeeId: 1, date: 1 }, { unique: true });

export default mongoose.models.AttendancePunch ||
  mongoose.model("AttendancePunch", AttendancePunchSchema);
