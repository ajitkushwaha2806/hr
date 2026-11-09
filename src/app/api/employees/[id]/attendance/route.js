import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
import User from "@/models/User";
import AttendancePunch from "@/models/AttendancePunch";
import CalendarDay from "@/models/CalendarDay";
import Leave from "@/models/Leave";
import { getAuthContext, getAuthUser, getUserRoleContext } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse, BadRequestError, NotFoundError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
  const { orgId, orgRole } = await getAuthContext();
  const clerkUser = await getAuthUser();
  const callerContext = await getUserRoleContext(clerkUser, orgId, orgRole);

  const { id } = await params;
  if (!id) throw new BadRequestError("Employee ID is required");

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year")) || new Date().getFullYear();
  const month = parseInt(searchParams.get("month")) || new Date().getMonth() + 1;

  await dbConnect();

  // Resolve employee doc by ObjectId, employeeId, or clerkId
  const isObjectId = mongoose.isValidObjectId(id);
  const objId = isObjectId ? new mongoose.Types.ObjectId(id) : null;
  const empBaseQuery = isObjectId
    ? { $or: [{ _id: objId }, { _id: id }, { employeeId: id }, { clerkId: id }] }
    : { $or: [{ employeeId: id }, { clerkId: id }] };

  let employee = null;
  if (orgId) {
    employee = await Employee.findOne({
      $and: [
        empBaseQuery,
        {
          $or: [
            { organizationId: orgId },
            { organizationId: "default_org" },
            { organizationId: { $exists: false } },
            { organizationId: null },
          ],
        },
      ],
    }).lean();
  }

  // Fallback 1: search without organizationId filter if not found
  if (!employee) {
    employee = await Employee.findOne(empBaseQuery).lean();
  }

  // Fallback 2: Check User collection if id corresponds to a User record
  if (!employee && isObjectId) {
    const userDoc = await User.findById(id).lean();
    if (userDoc) {
      if (userDoc.employeeProfile) {
        employee = await Employee.findById(userDoc.employeeProfile).lean();
      } else if (userDoc.clerkId || userDoc.email) {
        employee = await Employee.findOne({
          $or: [
            ...(userDoc.clerkId ? [{ clerkId: userDoc.clerkId }] : []),
            ...(userDoc.email ? [{ email: userDoc.email.toLowerCase().trim() }] : []),
          ],
        }).lean();
      }
    }
  }

  if (!employee) {
    throw new NotFoundError("Employee not found");
  }

  const employeeObjectId = employee._id;

  // Role-based scoping check: Team Leads can only view attendance for their own team members
  if (callerContext?.isTeamLead && !callerContext?.isAdmin && Array.isArray(callerContext?.managedEmployeeIds)) {
    const canAccess = callerContext.managedEmployeeIds.some(
      (mId) => mId.toString() === employeeObjectId.toString()
    );
    if (!canAccess) {
      throw new BadRequestError("You only have permission to view attendance for your assigned team members.");
    }
  }

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

  // Breakdown by leave type
  let casualFullDays = 0;
  let casualHalfDays = 0;
  let lopFullDays = 0;
  let lopHalfDays = 0;

  let absent = 0;
  let unapprovedAbsentDays = 0;
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
    let dayClassification = "FUTURE"; // FULL_DAY_PRESENT | HALF_DAY_PRESENT | FULL_DAY_CASUAL | HALF_DAY_CASUAL | FULL_DAY_LOP | HALF_DAY_LOP | DOUBLE_PAY_LOSS | IN_PROGRESS | NO_PUNCH_OUT | HOLIDAY | WEEKLY_OFF | NOT_MARKED
    let leaveTypeLabel = null;
    let isHalfDay = false;
    let isFullDay = false;
    let payLossMultiplier = 0; // 0 = paid, 1 = single pay loss, 2 = double pay loss
    let isDoublePayLoss = false;

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

        const hasCheckOut = Boolean(punch.checkOut?.time || punch.status === "COMPLETED");

        if (hasCheckOut) {
          // Standard Attendance Thresholds:
          // Minimum 8 hrs (480 mins) = Full Day (1.0d)
          // Minimum 3 hrs (180 mins) = Half Day (0.5d)
          // Less than 3 hrs (<180 mins) = Absent (0.0d) without approved leave -> Double Pay Loss!
          if (durationMinutes >= 480) {
            fullDaysPresent++;
            dayStatus = "PRESENT";
            dayClassification = "FULL_DAY_PRESENT";
            isFullDay = true;
          } else if (durationMinutes >= 180) {
            halfDaysPresent++;
            dayStatus = "HALF_DAY";
            dayClassification = "HALF_DAY_PRESENT";
            isHalfDay = true;
          } else {
            // Worked <3 hrs without approved leave: marked as Absent with Double Pay Loss!
            absent++;
            unapprovedAbsentDays++;
            dayStatus = "ABSENT";
            dayClassification = "DOUBLE_PAY_LOSS";
            payLossMultiplier = 2.0;
            isDoublePayLoss = true;
          }
        } else if (isToday) {
          // Today: user has clocked in, shift is currently in progress
          inProgress++;
          dayStatus = "IN_PROGRESS";
          dayClassification = "IN_PROGRESS";
        } else {
          // Past day where check-in occurred but NO punch-out was recorded:
          // Rule: "if no punch out only check in then simply mark half day on that day"
          halfDaysPresent++;
          noPunchOut++;
          dayStatus = "NO_PUNCH_OUT";
          dayClassification = "HALF_DAY_PRESENT";
          isHalfDay = true;
        }
      } else if (isLeave) {
        // Leave handling: Distinguish between Casual Leave (Paid) and Loss of Pay (1x LOP)
        const isLop = leaveDoc.type === "Loss of Pay";
        const isHalfDayLeave = leaveDoc.dayType === "FIRST_HALF" || leaveDoc.dayType === "SECOND_HALF";

        if (isLop) {
          // Approved Loss of Pay (1x pay loss because it was officially requested and approved)
          if (isHalfDayLeave) {
            lopHalfDays++;
            halfDayLeaves++;
            dayStatus = "HALF_DAY_LEAVE";
            dayClassification = "HALF_DAY_LOP";
            isHalfDay = true;
            payLossMultiplier = 0.5;
            leaveTypeLabel = leaveDoc.dayType === "FIRST_HALF" ? "Loss of Pay (First Half)" : "Loss of Pay (Second Half)";
          } else {
            lopFullDays++;
            fullDayLeaves++;
            dayStatus = "ON_LEAVE";
            dayClassification = "FULL_DAY_LOP";
            isFullDay = true;
            payLossMultiplier = 1.0;
            leaveTypeLabel = "Loss of Pay (Full Day)";
          }
        } else {
          // Approved Casual Leave (Paid from monthly casual quota)
          if (isHalfDayLeave) {
            casualHalfDays++;
            halfDayLeaves++;
            dayStatus = "HALF_DAY_LEAVE";
            dayClassification = "HALF_DAY_CASUAL";
            isHalfDay = true;
            payLossMultiplier = 0.0;
            leaveTypeLabel = leaveDoc.dayType === "FIRST_HALF" ? "Casual Leave (First Half)" : "Casual Leave (Second Half)";
          } else {
            casualFullDays++;
            fullDayLeaves++;
            dayStatus = "ON_LEAVE";
            dayClassification = "FULL_DAY_CASUAL";
            isFullDay = true;
            payLossMultiplier = 0.0;
            leaveTypeLabel = "Casual Leave (Full Day)";
          }
        }
      } else {
        if (isToday) {
          dayStatus = "NOT_MARKED";
          dayClassification = "NOT_MARKED";
        } else {
          // Absent without taking or requesting approved leave -> Double Pay Loss (2x LOP)!
          absent++;
          unapprovedAbsentDays++;
          dayStatus = "ABSENT";
          dayClassification = "DOUBLE_PAY_LOSS";
          payLossMultiplier = 2.0;
          isDoublePayLoss = true;
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
      payLossMultiplier,
      isDoublePayLoss,
    });
  }

  // Calculate effective present and on-leave days
  const effectivePresentDays = fullDaysPresent + halfDaysPresent * 0.5;
  const effectiveLeaveDays = fullDayLeaves + halfDayLeaves * 0.5;

  // Pay loss metrics
  const casualLeaveDays = casualFullDays + casualHalfDays * 0.5;
  const approvedLopDays = lopFullDays + lopHalfDays * 0.5;
  const doublePayLossDays = unapprovedAbsentDays;
  const penaltyPayLossDays = unapprovedAbsentDays * 2;
  const totalPayLossDays = approvedLopDays + penaltyPayLossDays;

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

        // Approved Leaves by Category (Casual vs Loss of Pay)
        casualLeaves: {
          fullDays: casualFullDays,
          halfDays: casualHalfDays,
          totalDays: casualLeaveDays,
        },
        approvedLopLeaves: {
          fullDays: lopFullDays,
          halfDays: lopHalfDays,
          totalDays: approvedLopDays,
        },
        fullDayLeaves,
        halfDayLeaves,
        onLeave: fullDayLeaves + halfDayLeaves,
        effectiveLeaveDays,

        // Absences & Penalties (Double Pay Loss)
        absent,
        unapprovedAbsentDays,
        doublePayLossDays,
        penaltyPayLossDays,

        // Total Pay Loss Days (Approved LOP [1x] + Unapproved Absences [2x])
        totalPayLossDays,
        approvedLopDays,

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
