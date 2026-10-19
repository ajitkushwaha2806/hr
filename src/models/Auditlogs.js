import { Schema, model, models, Types } from "mongoose";

const auditLogSchema = new Schema(
  {
    actor: {
      type: Types.ObjectId,
      ref: "Staff",
      default: null,
      index: true,
    },

    action: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    targetType: {
      type: String,
      required: true,
      trim: true,
    },

    targetId: {
      type: String,
      required: true,
      index: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
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

auditLogSchema.index({
  targetType: 1,
  targetId: 1,
  createdAt: -1,
});

auditLogSchema.index({
  actor: 1,
  createdAt: -1,
});

export const AuditLog =
  models.AuditLog ||
  model("AuditLog", auditLogSchema);