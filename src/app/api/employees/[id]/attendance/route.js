import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
import AttendancePunch from "@/models/AttendancePunch";
import CalendarDay from "@/models/CalendarDay";
import Leave from "@/models/Leave";
import { getAuthContext } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse, BadRequestError, NotFoundError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
  const { orgId } = await getAuthContext();
  const { id } = await params;
  if (!id) throw new BadRequestError("Employee ID is required");

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year")) || new Date().getFullYear();
  const month = parseInt(searchParams.get("month")) || new Date().getMonth() + 1;

  await dbConnect();

  // Resolve employee doc by ObjectId or employeeId
  const isObjectId = mongoose.isValidObjectId(id);
  const empQuery = isObjectId
    ? { $or: [{ _id: id }, { employeeId: id }] }
    : { employeeId: id };

  const employee = await Employee.findOne({
    ...empQuery,
    ...(orgId ? { organizationId: orgId } : {}),
  }).lean();

  if (!employee) {
    throw new NotFoundError("Employee not found");
  }

  const employeeObjectId = employee._id;

  // Build date range strings
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  // Fetch attendance punches for this employee in the month
  const punches = await AttendancePunch.find({
    employeeId: employeeObjectId,
    date: { $gte: startDate, $lte: endDate },
    ...(orgId ? { organizationId: orgId } : {}),
  })
    .sort({ date: 1 })
    .lean();

  // Fetch calendar days for the month (to know working days, holidays, weekly offs)
  const calendarDays = await CalendarDay.find({
    year,
    month,
    ...(orgId ? { organizationId: orgId } : {}),
  })
    .sort({ day: 1 })
    .lean();

  // Fetch approved leaves for this employee in the month
  const leaves = await Leave.find({
    employeeId: employeeObjectId,
    status: "APPROVED",
    $or: [
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
      { month: `${year}-${String(month).padStart(2, "0")}` },
    ],
    ...(orgId ? { organizationId: orgId } : {}),
  })
    .sort({ startDate: 1 })
    .lean();

  // Build a map of date -> punch
  const punchMap = {};
  for (const p of punches) {
    punchMap[p.date] = p;
  }

  // Build a map of date -> leave object (with dayType info: FULL_DAY, FIRST_HALF, SECOND_HALF)
  const leaveMap = {};
  for (const leave of leaves) {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (ds >= startDate && ds <= endDate) {
        leaveMap[ds] = leave;
      }
    }
  }

  // Build calendar day map
  const calendarMap = {};
  for (const cd of calendarDays) {
    calendarMap[cd.dateString] = cd;
  }

  // Today date
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  let totalWorkingDays = 0;
  let fullDaysPresent = 0;
  let halfDaysPresent = 0;
  let fullDayLeaves = 0;
  let halfDayLeaves = 0;
  let absent = 0;
  let holidays = 0;
  let weeklyOffs = 0;
  let inProgress = 0;
  let noPunchOut = 0;
  let totalMinutesWorked = 0;

  // Build day-by-day breakdown
  const dailyBreakdown = [];
  for (let day = 1; day <= lastDay; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const calDay = calendarMap[dateStr];
    const punch = punchMap[dateStr];
    const leaveDoc = leaveMap[dateStr];
    const isLeave = Boolean(leaveDoc);
    const isFuture = dateStr > todayStr;
    const isToday = dateStr === todayStr;

    // Day of week
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = calDay?.dayOfWeek || dateObj.toLocaleDateString("en-US", { weekday: "short" });

    // Determine calendar type (default to Sunday as weekly off if no calendar config)
    let dayType = calDay?.type;
    if (!dayType) {
      dayType = dateObj.getDay() === 0 ? "WEEKLY_OFF" : "WORKING_DAY";
    }

    let dayStatus = "FUTURE";
    let dayClassification = "FUTURE"; // FULL_DAY_PRESENT | HALF_DAY_PRESENT | FULL_DAY_LEAVE | HALF_DAY_LEAVE | IN_PROGRESS | NO_PUNCH_OUT | ABSENT | HOLIDAY | WEEKLY_OFF | NOT_MARKED
    let leaveTypeLabel = null;
    let isHalfDay = false;
    let isFullDay = false;

    if (dayType === "HOLIDAY") {
      holidays++;
      dayStatus = "HOLIDAY";
      dayClassification = "HOLIDAY";
    } else if (dayType === "WEEKLY_OFF") {
      weeklyOffs++;
      dayStatus = "WEEKLY_OFF";
      dayClassification = "WEEKLY_OFF";
    } else if (!isFuture) {
      totalWorkingDays++;

      const hasPunch = Boolean(punch && punch.checkIn?.status === "SUCCESS");
      let durationMinutes = punch?.durationMinutes || 0;
      if (!durationMinutes && punch?.checkIn?.time && punch?.checkOut?.time) {
        durationMinutes = Math.max(
          0,
          Math.round((new Date(punch.checkOut.time).getTime() - new Date(punch.checkIn.time).getTime()) / 60000)
        );
      }

      if (hasPunch) {
        totalMinutesWorked += durationMinutes;

        if (punch.status === "COMPLETED") {
          // Standard threshold: 240 mins (4 hrs) = Half Day vs Full Day
          if (durationMinutes >= 240) {
            fullDaysPresent++;
            dayStatus = "PRESENT";
            dayClassification = "FULL_DAY_PRESENT";
            isFullDay = true;
          } else {
            halfDaysPresent++;
            dayStatus = "HALF_DAY";
            dayClassification = "HALF_DAY_PRESENT";
            isHalfDay = true;
          }
        } else if (punch.status === "IN_PROGRESS") {
          inProgress++;
          dayStatus = "IN_PROGRESS";
          dayClassification = "IN_PROGRESS";
        } else if (punch.status === "NO_PUNCH_OUT") {
          noPunchOut++;
          // If no punch out recorded, count as half day or in-progress based on punch
          halfDaysPresent++;
          dayStatus = "NO_PUNCH_OUT";
          dayClassification = "NO_PUNCH_OUT";
          isHalfDay = true;
        } else if (punch.status === "FAILED") {
          absent++;
          dayStatus = "FAILED";
          dayClassification = "ABSENT";
        } else {
          fullDaysPresent++;
          dayStatus = "PRESENT";
          dayClassification = "FULL_DAY_PRESENT";
          isFullDay = true;
        }
      } else if (isLeave) {
        // Leave handling (Check whether Full Day or Half Day leave)
        const isHalfDayLeave = leaveDoc.dayType === "FIRST_HALF" || leaveDoc.dayType === "SECOND_HALF";
        if (isHalfDayLeave) {
          halfDayLeaves++;
          dayStatus = "HALF_DAY_LEAVE";
          dayClassification = "HALF_DAY_LEAVE";
          isHalfDay = true;
          leaveTypeLabel = leaveDoc.dayType === "FIRST_HALF" ? "First Half Leave" : "Second Half Leave";
        } else {
          fullDayLeaves++;
          dayStatus = "ON_LEAVE";
          dayClassification = "FULL_DAY_LEAVE";
          isFullDay = true;
          leaveTypeLabel = "Full Day Leave";
        }
      } else {
        if (isToday) {
          dayStatus = "NOT_MARKED";
          dayClassification = "NOT_MARKED";
        } else {
          absent++;
          dayStatus = "ABSENT";
          dayClassification = "ABSENT";
        }
      }
    }

    dailyBreakdown.push({
      date: dateStr,
      day,
      dayOfWeek,
      calendarType: dayType,
      calendarTitle: calDay?.title || null,
      status: dayStatus,
      dayClassification,
      isHalfDay,
      isFullDay,
      leaveTypeLabel,
      leave: leaveDoc || null,
      punch: punch || null,
      isLeave,
      isFuture,
      isToday,
    });
  }

  // Calculate effective present and on-leave days
  const effectivePresentDays = fullDaysPresent + halfDaysPresent * 0.5;
  const effectiveLeaveDays = fullDayLeaves + halfDayLeaves * 0.5;

  const attendancePercentage =
    totalWorkingDays > 0
      ? Math.min(100, Math.round((effectivePresentDays / totalWorkingDays) * 100))
      : 0;

  const totalPresentCount = fullDaysPresent + halfDaysPresent;
  const avgHoursPerDay =
    totalPresentCount > 0 ? (totalMinutesWorked / totalPresentCount / 60).toFixed(1) : "0.0";
  const totalHoursWorked = (totalMinutesWorked / 60).toFixed(1);

  return successResponse(
    {
      employee: {
        _id: employee._id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
        avatar: employee.avatar,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        status: employee.status,
      },
      year,
      month,
      totalDaysInMonth: lastDay,
      stats: {
        totalWorkingDays,
        // Full vs Half Day Present Breakdown
        fullDaysPresent,
        halfDaysPresent,
        totalPresent: totalPresentCount,
        effectivePresentDays,

        // Full vs Half Day Leave Breakdown
        fullDayLeaves,
        halfDayLeaves,
        onLeave: fullDayLeaves + halfDayLeaves,
        effectiveLeaveDays,

        // Absences & Offs
        absent,
        holidays,
        weeklyOffs,
        inProgress,
        noPunchOut,

        // Rates & Hours
        attendancePercentage,
        totalMinutesWorked,
        totalHoursWorked: parseFloat(totalHoursWorked),
        avgHoursPerDay: parseFloat(avgHoursPerDay),
      },
      dailyBreakdown,
      leaves,
      punches,
    },
    "Employee attendance retrieved successfully"
  );
});
