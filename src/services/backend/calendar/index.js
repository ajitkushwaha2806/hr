import dbConnect from "@/lib/db";
import CalendarDay from "@/models/CalendarDay";
import AttendancePunch from "@/models/AttendancePunch";
import Employee from "@/models/Employee";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export class CalendarService {
  static formatDateString(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  static getDefaultDayInfo(date) {
    const dayOfWeekIdx = date.getDay();
    const dayOfWeek = DAY_NAMES[dayOfWeekIdx];
    return { type: "WORKING_DAY", title: "Working Day", dayOfWeek };
  }

  /**
   * Seed days from Oct 1, 2026 till Dec 31, 2027 (Every day is a working day by default)
   */
  static async seedOrganizationCalendar({ organizationId, force = false }) {
    await dbConnect();

    const existingCount = await CalendarDay.countDocuments({ organizationId });
    if (existingCount > 0 && !force) {
      return { seeded: false, count: existingCount, message: "Calendar days already exist" };
    }

    if (force && existingCount > 0) {
      await CalendarDay.deleteMany({ organizationId });
    }

    // Seed from Oct 1, 2026 to Dec 31, 2027
    const startDate = new Date(2026, 9, 1); // Month 9 = October (0-indexed)
    const endDate = new Date(2027, 11, 31); // Month 11 = December

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

  /**
   * Fetch calendar days for a given month & year, enriched with employee punches
   */
  static async getMonthlyCalendar({ organizationId, year, month, userId }) {
    await dbConnect();

    // Auto-seed if empty
    const count = await CalendarDay.countDocuments({ organizationId });
    if (count === 0) {
      await this.seedOrganizationCalendar({ organizationId });
    } else {
      // Ensure existing default days are all WORKING_DAY
      await CalendarDay.updateMany(
        { organizationId, isCustom: false, type: { $ne: "WORKING_DAY" } },
        { $set: { type: "WORKING_DAY", title: "Working Day" } }
      );
    }

    const currentYear = Number(year) || 2026;
    const currentMonth = Number(month) || 10;

    const days = await CalendarDay.find({
      organizationId,
      year: currentYear,
      month: currentMonth,
    })
      .sort({ day: 1 })
      .lean();

    // Fetch employee attendance punches for this month
    let employeePunches = [];
    if (userId) {
      const emp = await Employee.findOne({
        $or: [{ clerkId: userId }, { organizationId }],
      });
      if (emp) {
        const monthPad = String(currentMonth).padStart(2, "0");
        const startOfMonth = `${currentYear}-${monthPad}-01`;
        const endOfMonth = `${currentYear}-${monthPad}-31`;
        employeePunches = await AttendancePunch.find({
          employeeId: emp._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        }).lean();
      }
    }

    const punchMap = {};
    for (const p of employeePunches) {
      punchMap[p.date] = p;
    }

    const todayStr = this.formatDateString(new Date());

    const enrichedDays = days.map((d) => {
      const punch = punchMap[d.dateString];
      let attendanceStatus = null; // "PRESENT" | "ABSENT" | "HALF_DAY" | "WEEKLY_OFF" | "HOLIDAY"

      if (d.type === "HOLIDAY") {
        attendanceStatus = "HOLIDAY";
      } else if (d.type === "WEEKLY_OFF") {
        attendanceStatus = "WEEKLY_OFF";
      } else if (d.title?.toLowerCase().includes("leave") || d.type === "LEAVE") {
        attendanceStatus = "CASUAL_LEAVE";
      } else if (punch && punch.checkIn?.status === "SUCCESS") {
        if (!punch.checkOut?.time && d.dateString < todayStr) {
          attendanceStatus = "NOT_CHECKED_OUT";
        } else if (punch.durationMinutes && punch.durationMinutes > 0 && punch.durationMinutes < 240) {
          attendanceStatus = "HALF_DAY";
        } else {
          attendanceStatus = "PRESENT";
        }
      } else if (d.type === "WORKING_DAY" && d.dateString <= todayStr) {
        attendanceStatus = "ABSENT";
      }

      return {
        ...d,
        attendanceStatus,
        punch: punch
          ? {
              checkInTime: punch.checkIn?.time,
              checkOutTime: punch.checkOut?.time,
              durationMinutes: punch.durationMinutes,
            }
          : null,
      };
    });

    const stats = {
      totalDays: enrichedDays.length,
      workingDays: enrichedDays.filter((d) => d.type === "WORKING_DAY").length,
      weeklyOffs: enrichedDays.filter((d) => d.type === "WEEKLY_OFF").length,
      holidays: enrichedDays.filter((d) => d.type === "HOLIDAY").length,
      presentDays: enrichedDays.filter((d) => d.attendanceStatus === "PRESENT" || d.attendanceStatus === "HALF_DAY").length,
      absentDays: enrichedDays.filter((d) => d.attendanceStatus === "ABSENT").length,
      halfDays: enrichedDays.filter((d) => d.attendanceStatus === "HALF_DAY").length,
      notCheckedOut: enrichedDays.filter((d) => d.attendanceStatus === "NOT_CHECKED_OUT").length,
      leaves: enrichedDays.filter((d) => d.attendanceStatus === "CASUAL_LEAVE").length,
    };

    return {
      year: currentYear,
      month: currentMonth,
      days: enrichedDays,
      stats,
      todayString: todayStr,
    };
  }

  /**
   * Admin decides if a day is Holiday, Weekly Off, or Working Day
   */
  static async updateDay({ organizationId, dateString, type, title = null, description = null, updatedBy = null }) {
    await dbConnect();

    const allowedTypes = ["WORKING_DAY", "WEEKLY_OFF", "HOLIDAY"];
    if (!allowedTypes.includes(type)) {
      throw new Error(`Invalid day type: ${type}`);
    }

    const record = await CalendarDay.findOne({ organizationId, dateString });
    if (!record) {
      throw new Error(`Calendar day ${dateString} not found`);
    }

    record.type = type;
    record.title = title || (type === "WEEKLY_OFF" ? "Weekly Off" : type === "HOLIDAY" ? "Holiday" : "Working Day");
    record.description = description || null;
    record.isCustom = true;
    if (updatedBy) record.updatedBy = updatedBy;

    await record.save();
    return record.toObject();
  }

  /**
   * Reset / clear day back to default (Working day or default holiday/weekly off)
   */
  static async clearDay({ organizationId, dateString }) {
    await dbConnect();

    const record = await CalendarDay.findOne({ organizationId, dateString });
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
