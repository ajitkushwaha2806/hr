import { Schema, model, models, Types } from "mongoose";

const staffSessionSchema = new Schema(
  {
    staff: {
      type: Types.ObjectId,
      ref: "Staff",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

staffSessionSchema.index( { expiresAt: 1 }, { expireAfterSeconds: 0 } );
export const StaffSession = models.StaffSession || model("StaffSession", staffSessionSchema);