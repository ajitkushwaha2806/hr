import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: [true, "Organization ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
    },
    designations: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

DepartmentSchema.index({ organizationId: 1, name: 1 }, { unique: true });
export default mongoose.models.Department || mongoose.model("Department", DepartmentSchema);
