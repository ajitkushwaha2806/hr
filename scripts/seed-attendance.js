import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const PunchVerificationSchema = new mongoose.Schema(
  {
    time: { type: Date, default: Date.now },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracyMeters: { type: Number, default: 0 },
    distanceMeters: { type: Number, required: true },
    withinGeofence: { type: Boolean, required: true, default: false },
    selfieUrl: { type: String, required: true },
    faceMatchConfidence: { type: Number, default: 0 },
    faceMatched: { type: Boolean, required: true, default: false },
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
    organizationId: { type: String, required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    clerkId: { type: String, index: true },
    date: { type: String, required: true, index: true },
    checkIn: { type: PunchVerificationSchema, default: null },
    checkOut: { type: PunchVerificationSchema, default: null },
    durationMinutes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED", "FAILED"],
      default: "IN_PROGRESS",
      index: true,
    },
  },
  { timestamps: true }
);

AttendancePunchSchema.index({ organizationId: 1, employeeId: 1, date: 1 }, { unique: true });

const AttendancePunch =
  mongoose.models.AttendancePunch || mongoose.model("AttendancePunch", AttendancePunchSchema);

const EmployeeSchema = new mongoose.Schema({}, { strict: false });
const Employee = mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);

async function seedAttendance() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined in environment");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  // Find target employee (support@getrepeat.in)
  const emp = await Employee.findOne({ email: "support@getrepeat.in" });
  if (!emp) {
    throw new Error("Employee support@getrepeat.in not found!");
  }

  console.log(`Target Employee: ${emp.firstName || ""} ${emp.lastName || ""} (${emp.email}) - Org: ${emp.organizationId}`);

  // Base selfie image from employee
  const selfieUrl =
    emp.avatar ||
    "https://getrepeat.s3.ap-south-1.amazonaws.com/hr/attendance/1792492958669-2g3yis-punch-1792492958208.jpg";

  // Days 1 through 19 of October 2026, plus today (20)
  // Absent days specified by user:
  // - today: Oct 20
  // - last wed: Oct 14
  // - last tues: Oct 13
  // - last sun: Oct 18
  // Also Oct 15 is Weekly Off in calendar
  const absentOrOffDates = new Set([
    "2026-10-13", // last Tuesday
    "2026-10-14", // last Wednesday
    "2026-10-15", // Weekly Off
    "2026-10-18", // last Sunday
    "2026-10-20", // today
  ]);

  // Clean out existing punches for this employee across Oct 1 - Oct 20
  const deleteResult = await AttendancePunch.deleteMany({
    employeeId: emp._id,
    date: { $gte: "2026-10-01", $lte: "2026-10-20" },
  });
  console.log(`Cleared ${deleteResult.deletedCount} existing records for Oct 1-20`);

  const createdRecords = [];

  for (let day = 1; day <= 19; day++) {
    const dayStr = String(day).padStart(2, "0");
    const dateStr = `2026-10-${dayStr}`;

    if (absentOrOffDates.has(dateStr)) {
      console.log(`- Skipping ${dateStr} (Marked as Absent / Weekly Off)`);
      continue;
    }

    // Create realistic punch
    // Check-in around 9:10 AM - 9:28 AM IST -> 03:40 UTC - 03:58 UTC
    const checkInMins = 40 + Math.floor(Math.random() * 18);
    const checkInSecs = Math.floor(Math.random() * 59);
    const checkInTime = new Date(`${dateStr}T03:${String(checkInMins).padStart(2, "0")}:${String(checkInSecs).padStart(2, "0")}.000Z`);

    // Work duration: 8 hours 35 mins to 9 hours 15 mins (515 - 555 minutes)
    const durationMinutes = 515 + Math.floor(Math.random() * 40);
    const checkOutTime = new Date(checkInTime.getTime() + durationMinutes * 60 * 1000);

    const latDelta = (Math.random() - 0.5) * 0.00015;
    const lngDelta = (Math.random() - 0.5) * 0.00015;
    const distanceMeters = Math.floor(Math.random() * 10) + 8; // 8 - 18 meters
    const confidence = 98 + Math.floor(Math.random() * 3); // 98 - 100%

    const record = await AttendancePunch.create({
      organizationId: emp.organizationId,
      employeeId: emp._id,
      clerkId: emp.clerkId,
      date: dateStr,
      checkIn: {
        time: checkInTime,
        latitude: 28.51685 + latDelta,
        longitude: 77.10432 + lngDelta,
        accuracyMeters: 35,
        distanceMeters,
        withinGeofence: true,
        selfieUrl,
        faceMatchConfidence: confidence,
        faceMatched: true,
        verificationMethod: "REKOGNITION",
        status: "SUCCESS",
      },
      checkOut: {
        time: checkOutTime,
        latitude: 28.51682 + latDelta,
        longitude: 77.10435 + lngDelta,
        accuracyMeters: 38,
        distanceMeters: distanceMeters + 1,
        withinGeofence: true,
        selfieUrl,
        faceMatchConfidence: confidence,
        faceMatched: true,
        verificationMethod: "REKOGNITION",
        status: "SUCCESS",
      },
      durationMinutes,
      status: "COMPLETED",
    });

    createdRecords.push({
      date: dateStr,
      checkIn: checkInTime.toISOString(),
      duration: `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`,
    });
  }

  console.log(`\nSuccessfully seeded ${createdRecords.length} present days:`);
  console.table(createdRecords);

  await mongoose.disconnect();
  console.log("\nDone!");
}

seedAttendance().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
