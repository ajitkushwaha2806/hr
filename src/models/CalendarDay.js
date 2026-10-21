import mongoose from "mongoose";

const CalendarDaySchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: [true, "Organization ID is required"],
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    dateString: {
      type: String,
      required: true,
      index: true, // "YYYY-MM-DD"
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
      index: true, // 1 - 12
    },
    day: {
      type: Number,
      required: true, // 1 - 31
    },
    dayOfWeek: {
      type: String, // "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
      required: true,
    },
    type: {
      type: String,
      enum: ["WORKING_DAY", "WEEKLY_OFF", "HOLIDAY"],
      default: "WORKING_DAY",
      index: true,
    },
    title: {
      type: String,
      default: "Working Day",
    },
    description: {
      type: String,
      default: null,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

CalendarDaySchema.index({ organizationId: 1, dateString: 1 }, { unique: true });
CalendarDaySchema.index({ organizationId: 1, year: 1, month: 1 });

export default mongoose.models.CalendarDay || mongoose.model("CalendarDay", CalendarDaySchema);
