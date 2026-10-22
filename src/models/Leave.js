import mongoose from "mongoose";

const LeaveSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: [true, "Organization ID is required"],
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee ID is required"],
      index: true,
    },
    clerkId: {
      type: String,
      index: true,
      default: null,
    },
    employeeName: {
      type: String,
      default: "",
    },
    employeeEmail: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      default: "General",
    },
    avatar: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["Casual Leave", "Loss of Pay"],
      default: "Casual Leave",
    },
    dayType: {
      type: String,
      enum: ["FULL_DAY", "FIRST_HALF", "SECOND_HALF"],
      default: "FULL_DAY",
    },
    startDate: {
      type: String,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: String, 
      required: [true, "End date is required"],
    },
    daysCount: {
      type: Number,
      required: true,
      default: 1,
    },
    month: {
      type: String, 
      index: true,
      required: true,
    },
    reason: {
      type: String,
      required: [true, "Reason for leave is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    adminRemarks: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

LeaveSchema.index({ organizationId: 1, employeeId: 1, month: 1 });
LeaveSchema.index({ organizationId: 1, status: 1 });

export const Leave = mongoose.models.Leave || mongoose.model("Leave", LeaveSchema);
export default Leave;
