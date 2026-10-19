import { Schema, model, models, Types } from "mongoose";

const userSchema = new Schema(
  {
    clerkId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "HR_ADMIN",
        "HR_MANAGER",
        "FINANCE_MANAGER",
        "TEAM_LEAD",
        "EMPLOYEE",
      ],
      default: "EMPLOYEE",
      index: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
      index: true,
    },

    isOnboarded: {
      type: Boolean,
      default: false,
    },

    employeeProfile: {
      type: Types.ObjectId,
      ref: "Employee",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const User = models.User || model("User", userSchema);
export default User;