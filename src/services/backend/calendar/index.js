import dbConnect from "@/lib/db";
import Leave from "@/models/Leave";
import Employee from "@/models/Employee";
import OfficeLocation from "@/models/OfficeLocation";
import { formatDateString, getTodayDateString } from "@/lib/utils";
import CalendarDay from "@/models/CalendarDay";
import AttendancePunch from "@/models/AttendancePunch";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export class CalendarService {
  static formatDateString(d) {
    return formatDateString(d);
  }

  static getDefaultDayInfo(date) {
    const dayOfWeekIdx = date.getDay();
    const dayOfWeek = DAY_NAMES[dayOfWeekIdx];
    return { type: "WORKING_DAY", title: "Working Day", dayOfWeek };
  }

  static async seedOrganizationCalendar({ organizationId, force = false }) {
    await dbConnect();

    const existingCount = await CalendarDay.countDocuments({ organizationId });
    if (existingCount > 0 && !force) {
      return { seeded: false, count: existingCount, message: "Calendar days already exist" };
    }

    if (force && existingCount > 0) {
      await CalendarDay.deleteMany({ organizationId });
    }

    const startDate = new Date(2026, 9, 1); 
    const endDate = new Date(2027, 11, 31); 

    const records = [];
    const curr = new Date(startDate);

    while (curr <= endDate) {
      const year = curr.getFullYear();
      const month = curr.getMonth() + 1;
      const day = curr.getDate();
      const dateString = this.formatDateString(curr);
      const defaultInfo = this.getDefaultDayInfo(curr);

      records.push({
        organizationId,
        date: new Date(curr),
        dateString,
        year,
        month,
        day,
        dayOfWeek: defaultInfo.dayOfWeek,
        type: defaultInfo.type,
        title: defaultInfo.title,
        description: null,
        isCustom: false,
      });

      curr.setDate(curr.getDate() + 1);
    }

    await CalendarDay.insertMany(records, { ordered: false });

    return {
      seeded: true,
      count: records.length,
      message: `Seeded ${records.length} days from Oct 2026 to Dec 2027`,
    };
  }

  static async getMonthlyCalendar({ organizationId, year, month, userId, userEmail }) {
    await dbConnect();
    const count = await CalendarDay.countDocuments({ organizationId });
    if (count === 0) {
      await this.seedOrganizationCalendar({ organizationId });
    } else {
      await CalendarDay.updateMany(
        { organizationId, type: { $ne: "WORKING_DAY" }, isCustom: false },
        { $set: { type: "WORKING_DAY", title: "Working Day" } }
      );
    }

    const now = new Date();
    let currentYear = Number(year) || now.getFullYear();
    let currentMonth = Number(month) || now.getMonth() + 1;

    // Enforce reasonable max date boundary: 2030 December 31
    if (currentYear > 2030 || (currentYear === 2030 && currentMonth > 12)) {
      currentYear = 2030;
      currentMonth = 12;
    }

    let days = await CalendarDay.find({
      organizationId,
      year: currentYear,
      month: currentMonth,
    })
      .sort({ day: 1 })
      .lean();

    if (days.length === 0) {
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      const newDays = [];
      for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
        const curr = new Date(currentYear, currentMonth - 1, dayNum);
        const dateString = this.formatDateString(curr);
        const defaultInfo = this.getDefaultDayInfo(curr);
        newDays.push({
          organizationId,
          date: curr,
          dateString,
          year: currentYear,
          month: currentMonth,
          day: dayNum,
          dayOfWeek: defaultInfo.dayOfWeek,
          type: defaultInfo.type,
          title: defaultInfo.title,
          description: null,
          isCustom: false,
        });
      }
      try {
        await CalendarDay.insertMany(newDays, { ordered: false });
        days = await CalendarDay.find({
          organizationId,
          year: currentYear,
          month: currentMonth,
        })
          .sort({ day: 1 })
          .lean();
      } catch (e) {
        console.warn("Could not auto-seed month days:", e);
      }
    }

    let employeePunches = [];
    let approvedLeaves = [];
    if (userId || userEmail) {
      const orConditions = [];
      if (userId) orConditions.push({ clerkId: userId });
      if (userEmail) {
        orConditions.push({
          email: { $regex: new RegExp(`^${userEmail.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        });
      }

      let emp = null;
      if (organizationId && organizationId !== "default_org") {
        emp = await Employee.findOne({
          organizationId,
          $or: orConditions,
        });
      }
      if (!emp) {
        emp = await Employee.findOne({
          $or: orConditions,
        });
      }

      const punchOrConditions = [];
      const leaveOrConditions = [];

      if (emp) {
        punchOrConditions.push({ employeeId: emp._id });
        if (emp.clerkId) {
          punchOrConditions.push({ clerkId: emp.clerkId });
        }
        leaveOrConditions.push({ employeeId: emp._id });
        if (emp.clerkId) {
          leaveOrConditions.push({ clerkId: emp.clerkId });
        }
      }
      if (userId) {
        punchOrConditions.push({ clerkId: userId });
        leaveOrConditions.push({ clerkId: userId });
      }

      if (punchOrConditions.length > 0) {
        const monthPad = String(currentMonth).padStart(2, "0");
        const startOfMonth = `${currentYear}-${monthPad}-01`;
        const endOfMonth = `${currentYear}-${monthPad}-31`;

        employeePunches = await AttendancePunch.find({
          $or: punchOrConditions,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        }).lean();

        approvedLeaves = await Leave.find({
          $or: leaveOrConditions,
          status: "APPROVED",
          startDate: { $lte: endOfMonth },
          endDate: { $gte: startOfMonth },
        }).lean();
      }
    }

    const punchMap = {};
    for (const p of employeePunches) {
      if (!punchMap[p.date] || p.manualOverride?.isOverridden) {
        punchMap[p.date] = p;
      }
    }

    // Determine shift timings and current time in IST
    let shiftEndTime = "19:00";
    try {
      const officeLocation = (organizationId && organizationId !== "default_org")
        ? (await OfficeLocation.findOne({ organizationId, isActive: true }).lean() ||
           await OfficeLocation.findOne({ organizationId }).lean())
        : await OfficeLocation.findOne({ isActive: true }).lean();

      if (officeLocation?.shiftEnd) {
        shiftEndTime = officeLocation.shiftEnd;
      }
    } catch (e) {
      console.warn("Could not fetch OfficeLocation shiftEnd:", e);
    }

    const todayStr = getTodayDateString("Asia/Kolkata");

    let currentISTTime = "12:00";
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "numeric",
        hourCycle: "h23",
      }).formatToParts(new Date());
      const hour = parts.find((p) => p.type === "hour")?.value?.padStart(2, "0") || "00";
      const minute = parts.find((p) => p.type === "minute")?.value?.padStart(2, "0") || "00";
      currentISTTime = `${hour}:${minute}`;
    } catch {
      const n = new Date();
      currentISTTime = `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
    }

    // Shift is considered completed for the day if current IST time is at or past shift end
    const isTodayDayEnded = currentISTTime >= shiftEndTime;

    const enrichedDays = days.map((d) => {
      const punch = punchMap[d.dateString];
      const leaveForDay = approvedLeaves.find(
        (l) => l.startDate <= d.dateString && l.endDate >= d.dateString
      );

      const isToday = d.dateString === todayStr;
      const isPast = d.dateString < todayStr;
      const isFuture = d.dateString > todayStr;

      let attendanceStatus = null;
      const isOverridden = Boolean(punch?.manualOverride?.isOverridden && punch?.manualOverride?.status);

      // RULE 0 (HIGHEST PRIORITY): Admin manual override status for this day
      if (isOverridden) {
        const over = punch.manualOverride.status;
        if (over === "PRESENT") {
          attendanceStatus = "PRESENT";
        } else if (over === "HALF_DAY") {
          attendanceStatus = "HALF_DAY";
        } else if (over === "ABSENT") {
          attendanceStatus = "DOUBLE_PAY_LOSS";
        } else if (over === "CASUAL_LEAVE") {
          attendanceStatus = "CASUAL_LEAVE";
        } else if (over === "LOP") {
          attendanceStatus = "LOSS_OF_PAY";
        } else if (over === "HOLIDAY") {
          attendanceStatus = "HOLIDAY";
        } else if (over === "WEEKLY_OFF") {
          attendanceStatus = "WEEKLY_OFF";
        }
      } else if (punch && punch.checkIn?.status === "SUCCESS") {
        // RULE 1: If user physically checked in successfully, biometric attendance
        // ALWAYS takes precedence over leave records!
        const hasCheckedOut = Boolean(punch.checkOut?.time) || punch.status === "COMPLETED";

        let durationMinutes = punch.durationMinutes || 0;
        if (!durationMinutes && punch.checkIn?.time && punch.checkOut?.time) {
          durationMinutes = Math.max(
            0,
            Math.round(
              (new Date(punch.checkOut.time).getTime() - new Date(punch.checkIn.time).getTime()) / (1000 * 60)
            )
          );
        }

        if (hasCheckedOut) {
          // Checkout completed: finalize status based on worked hours
          // Full day minimum 8 hrs (480 mins) = PRESENT (1.0d)
          // Half day minimum 3 hrs (180 mins) = HALF_DAY (0.5d)
          // Less than 3 hrs (<180 mins) = ABSENT (0.0d)
          if (durationMinutes >= 480) {
            attendanceStatus = "PRESENT";
          } else if (durationMinutes >= 180) {
            attendanceStatus = "HALF_DAY";
          } else {
            attendanceStatus = "ABSENT";
          }
        } else if (isToday) {
          // Today: user has checked in, but not checked out yet.
          if (!isTodayDayEnded) {
            // Day/shift is currently ongoing: user is actively working!
            attendanceStatus = "CHECKED_IN";
          } else {
            // Day/shift ended and user never checked out -> Mark as HALF_DAY!
            attendanceStatus = "HALF_DAY";
          }
        } else if (isPast) {
          // Past day where check-in succeeded but NO punch-out was recorded -> Mark as HALF_DAY!
          // Rule: "if no punch out only check in then simply mark half day on that day"
          attendanceStatus = "HALF_DAY";
        }
      } else {
        // RULE 2: No successful check-in punch on this day
        if (d.type === "HOLIDAY") {
          attendanceStatus = "HOLIDAY";
        } else if (d.type === "WEEKLY_OFF") {
          attendanceStatus = "WEEKLY_OFF";
        } else if (leaveForDay) {
          // Differentiate between Casual Leave (Paid) and Loss of Pay (1x LOP)
          const isLop = leaveForDay.type === "Loss of Pay";
          attendanceStatus = isLop ? "LOSS_OF_PAY" : "CASUAL_LEAVE";
        } else if (d.title?.toLowerCase().includes("leave") || d.type === "LEAVE") {
          attendanceStatus = "CASUAL_LEAVE";
        } else if (isPast) {
          // Past working day with no punch and no approved leave -> ABSENT with Double Pay Loss (2x LOP)!
          attendanceStatus = "DOUBLE_PAY_LOSS";
        } else if (isToday) {
          // RULE 3: For Today, status is only finalized after today ends or after checkout!
          if (isTodayDayEnded) {
            // Day/shift ended without check-in or leave -> finalize as ABSENT (Double Pay Loss)
            attendanceStatus = "DOUBLE_PAY_LOSS";
          } else {
            // Shift is still ongoing -> do NOT show ABSENT yet (status is null/in progress)
            attendanceStatus = null;
          }
        } else if (isFuture) {
          // Future scheduled working days are neither absent nor present
          attendanceStatus = null;
        }
      }

      let durationMinutes = punch?.durationMinutes || 0;
      if (!durationMinutes && punch?.checkIn?.time && punch?.checkOut?.time) {
        durationMinutes = Math.max(
          0,
          Math.round(
            (new Date(punch.checkOut.time).getTime() - new Date(punch.checkIn.time).getTime()) / (1000 * 60)
          )
        );
      }
      if (isOverridden && !durationMinutes) {
        if (punch?.manualOverride?.status === "PRESENT") durationMinutes = 480;
        else if (punch?.manualOverride?.status === "HALF_DAY") durationMinutes = 240;
      }

      return {
        ...d,
        attendanceStatus,
        isManualOverride: isOverridden,
        manualOverride: punch?.manualOverride || null,
        punch: punch
          ? {
              checkInTime: punch.checkIn?.time,
              checkOutTime: punch.checkOut?.time,
              durationMinutes,
              status: punch.status,
              manualOverride: punch.manualOverride || null,
            }
          : (isOverridden ? {
              checkInTime: null,
              checkOutTime: null,
              durationMinutes,
              status: "MANUAL_OVERRIDE",
              manualOverride: punch?.manualOverride || null,
            } : null),
      };
    });

    const stats = {
      totalDays: enrichedDays.length,
      workingDays: enrichedDays.filter((d) => d.type === "WORKING_DAY").length,
      weeklyOffs: enrichedDays.filter((d) => d.type === "WEEKLY_OFF" || d.attendanceStatus === "WEEKLY_OFF").length,
      holidays: enrichedDays.filter((d) => d.type === "HOLIDAY" || d.attendanceStatus === "HOLIDAY").length,
      presentDays: enrichedDays.filter((d) => d.attendanceStatus === "PRESENT").length,
      checkedIn: enrichedDays.filter((d) => d.attendanceStatus === "CHECKED_IN").length,
      halfDays: enrichedDays.filter((d) => d.attendanceStatus === "HALF_DAY").length,
      casualLeaves: enrichedDays.filter((d) => d.attendanceStatus === "CASUAL_LEAVE").length,
      lossOfPayLeaves: enrichedDays.filter((d) => d.attendanceStatus === "LOSS_OF_PAY").length,
      absentDays: enrichedDays.filter(
        (d) => d.attendanceStatus === "ABSENT" || d.attendanceStatus === "DOUBLE_PAY_LOSS"
      ).length,
      doublePayLossDays: enrichedDays.filter((d) => d.attendanceStatus === "DOUBLE_PAY_LOSS").length,
      notCheckedOut: enrichedDays.filter(
        (d) => !d.punch?.checkOutTime && d.attendanceStatus === "HALF_DAY" && !d.isManualOverride
      ).length,
      leaves: enrichedDays.filter(
        (d) => d.attendanceStatus === "CASUAL_LEAVE" || d.attendanceStatus === "LOSS_OF_PAY"
      ).length,
    };

    return {
      year: currentYear,
      month: currentMonth,
      days: enrichedDays,
      stats,
      todayString: todayStr,
      shiftEndTime,
      isTodayDayEnded,
    };
  }

  static async updateDay({ organizationId, dateString, type, title = null, description = null, updatedBy = null }) {
    await dbConnect();

    const allowedTypes = ["WORKING_DAY", "WEEKLY_OFF", "HOLIDAY"];
    if (!allowedTypes.includes(type)) {
      throw new Error(`Invalid day type: ${type}`);
    }

    let record = await CalendarDay.findOne({ organizationId, dateString });
    if (!record && organizationId !== "default_org") {
      record = await CalendarDay.findOne({ organizationId: "default_org", dateString });
    }

    if (!record) {
      const [y, m, d] = dateString.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      const defaultInfo = this.getDefaultDayInfo(dateObj);
      record = new CalendarDay({
        organizationId,
        date: dateObj,
        dateString,
        year: y,
        month: m,
        day: d,
        dayOfWeek: defaultInfo.dayOfWeek,
        type,
        title: title || (type === "WEEKLY_OFF" ? "Weekly Off" : type === "HOLIDAY" ? "Holiday" : "Working Day"),
        description: description || null,
        isCustom: true,
        updatedBy,
      });
      await record.save();
      return record.toObject();
    }

    record.type = type;
    record.title = title || (type === "WEEKLY_OFF" ? "Weekly Off" : type === "HOLIDAY" ? "Holiday" : "Working Day");
    record.description = description || null;
    record.isCustom = true;
    if (updatedBy) record.updatedBy = updatedBy;

    await record.save();
    return record.toObject();
  }

  static async clearDay({ organizationId, dateString }) {
    await dbConnect();

    let record = await CalendarDay.findOne({ organizationId, dateString });
    if (!record && organizationId !== "default_org") {
      record = await CalendarDay.findOne({ organizationId: "default_org", dateString });
    }
    if (!record) {
      throw new Error(`Calendar day ${dateString} not found`);
    }

    const defaultInfo = this.getDefaultDayInfo(record.date);
    record.type = defaultInfo.type;
    record.title = defaultInfo.title;
    record.description = null;
    record.isCustom = false;
    record.updatedBy = null;

    await record.save();
    return record.toObject();
  }
}

export default CalendarService;
