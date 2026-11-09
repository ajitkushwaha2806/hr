import dbConnect from "@/lib/db";
import Leave from "@/models/Leave";
import Employee from "@/models/Employee";
import User from "@/models/User";
import { emailService } from "@/services/backend/email";
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

  /**
   * Resolves email addresses for organization admins & HR.
   * If an employee has an assigned Team Lead, includes their specific TL.
   * Checks ADMIN_EMAIL env, DB admin users, and falls back to SUPPORT_EMAIL.
   */
  static async getAdminRecipients(organizationId, employee = null) {
    const recipients = new Set();

    // 1. Explicit ADMIN_EMAIL environment variable
    if (process.env.ADMIN_EMAIL) {
      process.env.ADMIN_EMAIL.split(",").forEach((e) => {
        const trimmed = e.trim().toLowerCase();
        if (trimmed && trimmed.includes("@")) {
          recipients.add(trimmed);
        }
      });
    }

    // 2. Query company administrative users in MongoDB (SUPER_ADMIN, HR_ADMIN, HR_MANAGER, org:admin)
    // NOTE: Does NOT query TEAM_LEAD so other unrelated leads never receive this notification.
    try {
      const adminRoles = ["SUPER_ADMIN", "HR_ADMIN", "HR_MANAGER", "org:admin"];
      const userQuery = {
        role: { $in: adminRoles },
        status: "ACTIVE",
      };
      if (organizationId) {
        userQuery.$or = [
          { organizationId },
          { organizationId: { $exists: false } },
          { organizationId: null },
        ];
      }
      const adminUsers = await User.find(userQuery).select("email").lean();

      adminUsers.forEach((u) => {
        if (u.email && u.email.includes("@")) {
          recipients.add(u.email.toLowerCase().trim());
        }
      });
    } catch (err) {
      console.error("[LeaveService] Failed to query admin users for notification:", err);
    }

    // 3. Directly include the employee's designated Team Lead (if assigned)
    if (employee?.teamLead) {
      try {
        const tl = await Employee.findById(employee.teamLead).select("email firstName lastName").lean();
        if (tl?.email && tl.email.includes("@")) {
          recipients.add(tl.email.toLowerCase().trim());
        }
      } catch (err) {
        console.error("[LeaveService] Failed to query applicant team lead email:", err);
      }
    }

    // 4. Fallback to configured support/company email
    if (recipients.size === 0) {
      const fallback = process.env.SUPPORT_EMAIL || "truehr.payroll@gmail.com";
      recipients.add(fallback.toLowerCase().trim());
    }

    return Array.from(recipients);
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

    // Asynchronously dispatch notification to organization admins / HR & designated TL
    this.getAdminRecipients(orgId, employee)
      .then((adminEmails) => {
        const portalUrl = `${process.env.NEXT_PUBLIC_BASE_APP || process.env.NEXT_PUBLIC_APP_URL || "https://truehr.magicscale.in"}/admin/leaves`;

        return Promise.all(
          adminEmails.map((adminEmail) =>
            emailService.sendTemplateEmail({
              to: adminEmail,
              template: "leave-requested-admin",
              data: {
                employeeName: newLeave.employeeName,
                employeeId: employee.employeeId || "",
                department: employee.department || "General",
                leaveType: newLeave.type,
                dayType: newLeave.dayType,
                startDate: newLeave.startDate,
                endDate: newLeave.endDate,
                daysCount: newLeave.daysCount,
                reason: newLeave.reason,
                appliedAt: new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
                reviewUrl: portalUrl,
              },
            })
          )
        );
      })
      .catch((err) => {
        console.error("[LeaveService] Warning: Failed to dispatch leave request email to admins:", err);
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

  static async adminGetLeaves(organizationId, { status = "all", month = null, search = "", callerContext = null } = {}) {
    await dbConnect();

    const query = { organizationId };

    // Role-based scoping: If caller is a Team Lead (and not full Admin), restrict to their managed team
    if (callerContext?.isTeamLead && !callerContext?.isAdmin && Array.isArray(callerContext?.managedEmployeeIds)) {
      query.employeeId = { $in: callerContext.managedEmployeeIds };
    }

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

    const statsQuery = { organizationId };
    if (callerContext?.isTeamLead && !callerContext?.isAdmin && Array.isArray(callerContext?.managedEmployeeIds)) {
      statsQuery.employeeId = { $in: callerContext.managedEmployeeIds };
    }
    const allOrgLeaves = await Leave.find(statsQuery).lean();
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

  static async adminReviewLeave(clerkUser, organizationId, leaveId, { action, adminRemarks = "", callerContext = null }) {
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

    // Role-based scoping check: Team Leads can only review their own team members' leaves
    if (callerContext?.isTeamLead && !callerContext?.isAdmin && Array.isArray(callerContext?.managedEmployeeIds)) {
      const isManaged = callerContext.managedEmployeeIds.some(
        (id) => id.toString() === leave.employeeId?.toString()
      );
      if (!isManaged) {
        throw new BadRequestError("You only have permission to review leave requests for your direct team members.");
      }
    }

    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
    leave.status = newStatus;
    leave.adminRemarks = adminRemarks || "";

    const reviewerName = callerContext?.employee
      ? `${callerContext.employee.firstName || ""} ${callerContext.employee.lastName || ""}`.trim()
      : clerkUser?.firstName
      ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
      : "Admin";

    leave.reviewedBy = callerContext?.isTeamLead ? `${reviewerName} (Team Lead)` : reviewerName;
    leave.reviewedAt = new Date();

    await leave.save();

    // Asynchronously dispatch email notification to the employee
    (async () => {
      try {
        let recipientEmail = leave.employeeEmail;
        if (!recipientEmail && leave.employeeId) {
          const emp = await Employee.findById(leave.employeeId).select("email").lean();
          recipientEmail = emp?.email;
        }

        if (recipientEmail) {
          const portalUrl = `${process.env.NEXT_PUBLIC_BASE_APP || process.env.NEXT_PUBLIC_APP_URL || "https://truehr.magicscale.in"}/employee/leaves`;

          await emailService.sendTemplateEmail({
            to: recipientEmail,
            template: "leave-status",
            data: {
              name: leave.employeeName || "Team Member",
              status: newStatus,
              leaveType: leave.type,
              dayType: leave.dayType,
              startDate: leave.startDate,
              endDate: leave.endDate,
              daysCount: leave.daysCount,
              adminRemarks: leave.adminRemarks,
              reviewedBy: leave.reviewedBy,
              portalUrl,
            },
          });
        }
      } catch (err) {
        console.error("[LeaveService] Warning: Failed to send leave review status email to employee:", err);
      }
    })();

    return leave;
  }
}

export default LeaveService;
