import dbConnect from "@/lib/db";
import Leave from "@/models/Leave";
import Employee from "@/models/Employee";
import { BadRequestError, NotFoundError } from "@/lib/api/response-handler";

export class LeaveService {
  static async getEmployeeForUser(clerkUser, organizationId) {
    if (!clerkUser && !organizationId) {
      return null;
    }

    await dbConnect();

    const query = {
      $or: [
        { clerkId: clerkUser?.id },
        { email: clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase() },
      ].filter(Boolean),
    };

    if (query.$or.length === 0) {
      return null;
    }

    let employee = await Employee.findOne(query);

    if (!employee && organizationId) {
      employee = await Employee.findOne({ organizationId });
    }

    return employee;
  }

  static getCurrentMonthString(date = new Date()) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
      }).formatToParts(date);

      const year = parts.find((p) => p.type === "year")?.value;
      const month = parts.find((p) => p.type === "month")?.value;
      return `${year}-${month}`;
    } catch {
      return date.toISOString().slice(0, 7);
    }
  }

  static calculateDays(startDate, endDate, dayType = "FULL_DAY") {
    if (dayType === "FIRST_HALF" || dayType === "SECOND_HALF") {
      return 0.5;
    }

    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return 1;
    }

    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return 0;

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  static async getMyLeaves(clerkUser, organizationId, targetMonth = null) {
    await dbConnect();
    const employee = await this.getEmployeeForUser(clerkUser, organizationId);
    if (!employee) {
      return {
        hasEmployee: false,
        employee: null,
        quota: {
          monthlyQuota: 2,
          usedThisMonth: 0,
          pendingThisMonth: 0,
          availableBalance: 2,
          month: targetMonth || this.getCurrentMonthString(),
        },
        leaves: [],
      };
    }

    const orgId = employee.organizationId || organizationId;
    const currentMonth = targetMonth || this.getCurrentMonthString();
    const monthlyQuota = Number(employee.monthlyCasualLeavesQuota) || 2;

    const allLeaves = await Leave.find({
      organizationId: orgId,
      employeeId: employee._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    const thisMonthLeaves = allLeaves.filter(
      (l) => l.month === currentMonth || (l.startDate && l.startDate.startsWith(currentMonth))
    );

    const usedThisMonth = thisMonthLeaves
      .filter((l) => l.status === "APPROVED" && (l.type === "Casual Leave" || !l.type))
      .reduce((sum, l) => sum + (Number(l.daysCount) || 0), 0);

    const pendingThisMonth = thisMonthLeaves
      .filter((l) => l.status === "PENDING" && (l.type === "Casual Leave" || !l.type))
      .reduce((sum, l) => sum + (Number(l.daysCount) || 0), 0);

    const lopThisMonth = thisMonthLeaves
      .filter((l) => l.status === "APPROVED" && l.type === "Loss of Pay")
      .reduce((sum, l) => sum + (Number(l.daysCount) || 0), 0);

    const availableBalance = Math.max(0, Number((monthlyQuota - usedThisMonth).toFixed(1)));

    return {
      hasEmployee: true,
      employee: {
        _id: employee._id,
        name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.name,
        employeeId: employee.employeeId,
        department: employee.department,
        designation: employee.designation,
        avatar: employee.avatar,
      },
      quota: {
        monthlyQuota,
        usedThisMonth,
        pendingThisMonth,
        lopThisMonth,
        availableBalance,
        month: currentMonth,
      },
      leaves: allLeaves,
    };
  }

  static async applyLeave(clerkUser, organizationId, payload) {
    const { startDate, endDate, dayType = "FULL_DAY", reason, type = "Casual Leave" } = payload || {};
    const normalizedType = type === "Loss of Pay" ? "Loss of Pay" : "Casual Leave";

    if (!startDate || !endDate) {
      throw new BadRequestError("Start date and end date are required");
    }

    if (!reason || !reason.trim()) {
      throw new BadRequestError("Please provide a reason for your leave request");
    }

    if (startDate > endDate) {
      throw new BadRequestError("Start date cannot be after end date");
    }

    await dbConnect();
    const employee = await this.getEmployeeForUser(clerkUser, organizationId);
    if (!employee) {
      throw new NotFoundError("Employee record not found. Please complete profile setup first.");
    }

    const orgId = employee.organizationId || organizationId;
    const daysCount = this.calculateDays(startDate, endDate, dayType);

    if (daysCount <= 0) {
      throw new BadRequestError("Invalid date range specified for leave");
    }

    const month = startDate.slice(0, 7); // e.g. "2026-10"
    const monthlyQuota = Number(employee.monthlyCasualLeavesQuota) || 2;

    if (normalizedType === "Casual Leave") {
      const existingMonthApproved = await Leave.find({
        organizationId: orgId,
        employeeId: employee._id,
        month,
        type: "Casual Leave",
        status: "APPROVED",
      }).lean();

      const usedDays = existingMonthApproved.reduce((sum, l) => sum + (Number(l.daysCount) || 0), 0);
      const availableBalance = Math.max(0, monthlyQuota - usedDays);

      if (daysCount > availableBalance) {
        throw new BadRequestError(
          `Leave request of ${daysCount} day(s) exceeds your remaining monthly casual leave balance (${availableBalance} day(s) available for ${month}). For extended absence, please select 'Loss of Pay'.`
        );
      }
    }

    const overlap = await Leave.findOne({
      organizationId: orgId,
      employeeId: employee._id,
      status: { $in: ["PENDING", "APPROVED"] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    });

    if (overlap) {
      throw new BadRequestError(
        `You already have an active or pending leave request covering ${overlap.startDate} to ${overlap.endDate}.`
      );
    }

    const newLeave = await Leave.create({
      organizationId: orgId,
      employeeId: employee._id,
      clerkId: clerkUser?.id || employee.clerkId,
      employeeName: `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.name,
      employeeEmail: employee.email,
      department: employee.department,
      avatar: employee.avatar || "",
      type: normalizedType,
      dayType,
      startDate,
      endDate,
      daysCount,
      month,
      reason: reason.trim(),
      status: "PENDING",
      appliedAt: new Date(),
    });

    return newLeave;
  }

  static async cancelLeave(clerkUser, organizationId, leaveId) {
    await dbConnect();
    const employee = await this.getEmployeeForUser(clerkUser, organizationId);
    if (!employee) {
      throw new NotFoundError("Employee record not found");
    }

    const leave = await Leave.findOne({
      _id: leaveId,
      employeeId: employee._id,
    });

    if (!leave) {
      throw new NotFoundError("Leave request not found");
    }

    if (leave.status !== "PENDING") {
      throw new BadRequestError(`Cannot cancel a leave that is already ${leave.status.toLowerCase()}`);
    }

    leave.status = "CANCELLED";
    await leave.save();

    return leave;
  }

  static async adminGetLeaves(organizationId, { status = "all", month = null, search = "" } = {}) {
    await dbConnect();

    const query = { organizationId };

    if (status && status !== "all") {
      query.status = status.toUpperCase();
    }

    if (month) {
      query.month = month;
    }

    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), "i");
      query.$or = [
        { employeeName: reg },
        { employeeEmail: reg },
        { department: reg },
        { reason: reg },
      ];
    }

    const leaves = await Leave.find(query)
      .populate("employeeId", "avatar firstName lastName email department")
      .sort({ createdAt: -1 })
      .lean();

    const allOrgLeaves = await Leave.find({ organizationId }).lean();
    const stats = {
      total: allOrgLeaves.length,
      pending: allOrgLeaves.filter((l) => l.status === "PENDING").length,
      approved: allOrgLeaves.filter((l) => l.status === "APPROVED").length,
      rejected: allOrgLeaves.filter((l) => l.status === "REJECTED").length,
    };

    return {
      leaves,
      stats,
    };
  }

  static async adminReviewLeave(clerkUser, organizationId, leaveId, { action, adminRemarks = "" }) {
    if (!["APPROVE", "REJECT"].includes(action)) {
      throw new BadRequestError("Invalid action. Must be APPROVE or REJECT.");
    }

    await dbConnect();
    const leave = await Leave.findOne({
      _id: leaveId,
      organizationId,
    });

    if (!leave) {
      throw new NotFoundError("Leave request not found");
    }

    if (leave.status !== "PENDING") {
      throw new BadRequestError(`This leave request is already marked as ${leave.status}`);
    }

    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
    leave.status = newStatus;
    leave.adminRemarks = adminRemarks || "";
    leave.reviewedBy = clerkUser?.firstName
      ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
      : "Admin";
    leave.reviewedAt = new Date();

    await leave.save();

    return leave;
  }
}

export default LeaveService;
