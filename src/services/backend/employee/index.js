import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
import User from "@/models/User";
import { emailService } from "@/services/backend/email";
import { NotFoundError, ConflictError } from "@/lib/api/response-handler";

export class EmployeeService {
  static async getEmployees({
    organizationId = null,
    search = "",
    department = "",
    status = "",
    employmentType = "",
    page = 1,
    limit = 50,
    callerContext = null,
  } = {}) {
    await dbConnect();

    const query = {};

    if (organizationId) {
      query.$or = [
        { organizationId },
        { organizationId: "default_org" },
        { organizationId: { $exists: false } },
        { organizationId: null },
      ];
    }

    // Role-based scoping: If caller is a Team Lead (and not full Admin), restrict to their managed team
    if (callerContext?.isTeamLead && !callerContext?.isAdmin && Array.isArray(callerContext?.managedEmployeeIds)) {
      query._id = { $in: callerContext.managedEmployeeIds };
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (department && department !== "all") {
      query.department = department;
    }

    if (employmentType && employmentType !== "all") {
      query.employmentType = employmentType;
    }

    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, "i");
      const searchOr = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
        { employeeId: regex },
        { designation: regex },
      ];

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchOr }];
        delete query.$or;
      } else {
        query.$or = searchOr;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 50);
    const skip = (pageNum - 1) * limitNum;

    const baseCountFilter = organizationId
      ? {
          $or: [
            { organizationId },
            { organizationId: "default_org" },
            { organizationId: { $exists: false } },
            { organizationId: null },
          ],
        }
      : {};

    if (callerContext?.isTeamLead && !callerContext?.isAdmin && Array.isArray(callerContext?.managedEmployeeIds)) {
      baseCountFilter._id = { $in: callerContext.managedEmployeeIds };
    }

    const [employees, total, totalAll, activeCount, onLeaveCount, probationCount] = await Promise.all([
      Employee.find(query)
        .populate("teamLead", "firstName lastName employeeId email avatar isTeamLead")
        .populate("teamLeads", "firstName lastName employeeId email avatar isTeamLead")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Employee.countDocuments(query),
      Employee.countDocuments(baseCountFilter),
      Employee.countDocuments({ ...baseCountFilter, status: "Active" }),
      Employee.countDocuments({ ...baseCountFilter, status: "On Leave" }),
      Employee.countDocuments({ ...baseCountFilter, status: "Probation" }),
    ]);

    const employeesWithFullName = employees.map((emp) => {
      const mappedLeads = Array.isArray(emp.teamLeads) && emp.teamLeads.length > 0
        ? emp.teamLeads.map((tl) => ({
            ...tl,
            name: `${tl.firstName || ""} ${tl.lastName || ""}`.trim() || tl.name,
          }))
        : emp.teamLead
        ? [
            {
              ...emp.teamLead,
              name: `${emp.teamLead.firstName || ""} ${emp.teamLead.lastName || ""}`.trim(),
            },
          ]
        : [];

      return {
        ...emp,
        name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
        teamLead: mappedLeads[0] || null,
        teamLeads: mappedLeads,
      };
    });

    return {
      employees: employeesWithFullName,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      stats: {
        total: totalAll,
        active: activeCount,
        onLeave: onLeaveCount,
        probation: probationCount,
      },
    };
  }

  static _buildBaseIdQuery(id) {
    if (mongoose.isValidObjectId(id)) {
      const objId = new mongoose.Types.ObjectId(id);
      return { $or: [{ _id: objId }, { _id: id }, { employeeId: id }, { clerkId: id }] };
    }
    return { $or: [{ employeeId: id }, { clerkId: id }] };
  }

  static _buildIdQuery(id, organizationId = null) {
    const baseQuery = this._buildBaseIdQuery(id);

    if (organizationId) {
      return {
        $and: [
          baseQuery,
          {
            $or: [
              { organizationId },
              { organizationId: "default_org" },
              { organizationId: { $exists: false } },
              { organizationId: null },
            ],
          },
        ],
      };
    }
    return baseQuery;
  }

  static async getEmployeeById(id, organizationId = null) {
    await dbConnect();
    const query = this._buildIdQuery(id, organizationId);
    let employee = await Employee.findOne(query)
      .populate("teamLead", "firstName lastName employeeId email avatar isTeamLead")
      .populate("teamLeads", "firstName lastName employeeId email avatar isTeamLead")
      .lean();

    // Fallback 1: if not found with org scope (e.g. legacy org ID or global admin view), search without org filter
    if (!employee && organizationId) {
      employee = await Employee.findOne(this._buildBaseIdQuery(id))
        .populate("teamLead", "firstName lastName employeeId email avatar isTeamLead")
        .populate("teamLeads", "firstName lastName employeeId email avatar isTeamLead")
        .lean();
    }

    // Fallback 2: Check if id is a User._id (from User collection) and resolve its employee profile
    if (!employee && mongoose.isValidObjectId(id)) {
      const userDoc = await User.findById(id).lean();
      if (userDoc) {
        if (userDoc.employeeProfile) {
          employee = await Employee.findById(userDoc.employeeProfile)
            .populate("teamLead", "firstName lastName employeeId email avatar isTeamLead")
            .populate("teamLeads", "firstName lastName employeeId email avatar isTeamLead")
            .lean();
        } else if (userDoc.clerkId || userDoc.email) {
          employee = await Employee.findOne({
            $or: [
              ...(userDoc.clerkId ? [{ clerkId: userDoc.clerkId }] : []),
              ...(userDoc.email ? [{ email: userDoc.email.toLowerCase().trim() }] : []),
            ],
          })
            .populate("teamLead", "firstName lastName employeeId email avatar isTeamLead")
            .populate("teamLeads", "firstName lastName employeeId email avatar isTeamLead")
            .lean();
        }
      }
    }

    if (!employee) {
      throw new NotFoundError("Employee not found");
    }

    const mappedLeads = Array.isArray(employee.teamLeads) && employee.teamLeads.length > 0
      ? employee.teamLeads.map((tl) => ({
          ...tl,
          name: `${tl.firstName || ""} ${tl.lastName || ""}`.trim() || tl.name,
        }))
      : employee.teamLead
      ? [
          {
            ...employee.teamLead,
            name: `${employee.teamLead.firstName || ""} ${employee.teamLead.lastName || ""}`.trim(),
          },
        ]
      : [];

    return {
      ...employee,
      name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
      teamLead: mappedLeads[0] || null,
      teamLeads: mappedLeads,
    };
  }

  static async getTeamLeads(organizationId = null) {
    await dbConnect();
    const query = {
      status: { $nin: ["Terminated", "Inactive"] },
    };
    if (organizationId) {
      query.$or = [
        { organizationId },
        { organizationId: "default_org" },
        { organizationId: { $exists: false } },
        { organizationId: null },
      ];
    }
    const employees = await Employee.find(query)
      .select("firstName lastName employeeId email department designation avatar isTeamLead role")
      .sort({ isTeamLead: -1, firstName: 1 })
      .lean();

    return employees.map((l) => ({
      ...l,
      name: `${l.firstName || ""} ${l.lastName || ""}`.trim() || l.name,
    }));
  }

  static async createEmployee(data) {
    await dbConnect();

    const organizationId = data.organizationId;
    const emailFilter = { email: data.email.toLowerCase().trim() };
    if (organizationId) {
      emailFilter.organizationId = organizationId;
    }

    const existingEmail = await Employee.findOne(emailFilter);
    if (existingEmail) {
      throw new ConflictError(`An employee with email ${data.email} already exists.`);
    }

    let employeeId = data.employeeId?.trim()?.toUpperCase();
    if (!employeeId) {
      // Find all existing EMP-XXXX to find the true max numeric ID across the collection
      const existingEmps = await Employee.find(
        { employeeId: /^EMP-\d+$/ },
        { employeeId: 1 }
      ).lean();

      let maxNum = 1000;
      for (const emp of existingEmps) {
        const match = emp.employeeId?.match(/^EMP-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }

      let candidateNum = maxNum + 1;
      let candidateId = `EMP-${String(candidateNum).padStart(4, "0")}`;
      while (await Employee.exists({ employeeId: candidateId })) {
        candidateNum++;
        candidateId = `EMP-${String(candidateNum).padStart(4, "0")}`;
      }
      employeeId = candidateId;
    } else {
      const idFilter = { employeeId };
      if (organizationId) {
        idFilter.organizationId = organizationId;
      }
      const existingId = await Employee.findOne(idFilter);
      if (existingId) {
        throw new ConflictError(`Employee ID ${employeeId} is already in use.`);
      }
    }

    const isTeamLead = Boolean(data.isTeamLead || data.role === "TEAM_LEAD");

    // Multiple Team Leads support
    let sanitizedTeamLeads = [];
    if (Array.isArray(data.teamLeads)) {
      sanitizedTeamLeads = data.teamLeads
        .map((id) => (id?._id || id)?.toString())
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id));
    } else if (data.teamLead && mongoose.Types.ObjectId.isValid(data.teamLead)) {
      sanitizedTeamLeads = [data.teamLead.toString()];
    }

    const sanitizedTeamLead = sanitizedTeamLeads[0] || null;

    const newEmployee = await Employee.create({
      ...data,
      employeeId,
      email: data.email.toLowerCase().trim(),
      isTeamLead,
      teamLead: sanitizedTeamLead,
      teamLeads: sanitizedTeamLeads,
      role: isTeamLead ? "TEAM_LEAD" : (data.role || "org:member"),
    });

    if (isTeamLead) {
      await User.updateOne(
        { email: data.email.toLowerCase().trim() },
        { role: "TEAM_LEAD" }
      ).catch(() => {});
    }

    const obj = newEmployee.toObject();
    const fullName = `${obj.firstName || ""} ${obj.lastName || ""}`.trim();

    if (obj.email) {
      emailService
        .sendTemplateEmail({
          to: obj.email,
          template: "welcome-employee",
          data: {
            name: fullName,
            employeeId: obj.employeeId,
            department: obj.department || "General",
            designation: obj.designation || "",
            email: obj.email,
            loginUrl: `${process.env.NEXT_PUBLIC_BASE_APP || process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://truehr.magicscale.in"}/sign-in`,
          },
        })
        .catch((err) => {
          console.error("[Email Notification Warning] Failed to send welcome onboarding email:", err);
        });
    }

    return {
      ...obj,
      name: fullName,
    };
  }

  static async updateEmployee(id, data, organizationId = null) {
    await dbConnect();
    const query = this._buildIdQuery(id, organizationId);
    let existing = await Employee.findOne(query);
    if (!existing && organizationId) {
      existing = await Employee.findOne(this._buildBaseIdQuery(id));
    }
    if (!existing) {
      throw new NotFoundError("Employee not found");
    }

    const updatePayload = { ...data };

    if (data.email) {
      const emailFilter = {
        email: data.email.toLowerCase().trim(),
        _id: { $ne: existing._id },
      };
      if (organizationId || existing.organizationId) {
        emailFilter.organizationId = organizationId || existing.organizationId;
      }
      const existingEmail = await Employee.findOne(emailFilter);
      if (existingEmail) {
        throw new ConflictError(`Another employee with email ${data.email} already exists.`);
      }
      updatePayload.email = data.email.toLowerCase().trim();
    }

    if (data.employeeId) {
      const formattedId = data.employeeId.trim().toUpperCase();
      const idFilter = {
        employeeId: formattedId,
        _id: { $ne: existing._id },
      };
      if (organizationId || existing.organizationId) {
        idFilter.organizationId = organizationId || existing.organizationId;
      }
      const existingId = await Employee.findOne(idFilter);
      if (existingId) {
        throw new ConflictError(`Employee ID ${formattedId} is already in use.`);
      }
      updatePayload.employeeId = formattedId;
    }

    if (data.teamLeads !== undefined || data.teamLead !== undefined) {
      let sanitizedTeamLeads = [];
      if (Array.isArray(data.teamLeads)) {
        sanitizedTeamLeads = data.teamLeads
          .map((id) => (id?._id || id)?.toString())
          .filter((id) => id && mongoose.Types.ObjectId.isValid(id));
      } else if (data.teamLead && mongoose.Types.ObjectId.isValid(data.teamLead)) {
        sanitizedTeamLeads = [data.teamLead.toString()];
      }

      updatePayload.teamLeads = sanitizedTeamLeads;
      updatePayload.teamLead = sanitizedTeamLeads[0] || null;
    }

    if (data.isTeamLead !== undefined) {
      updatePayload.isTeamLead = Boolean(data.isTeamLead);
      if (updatePayload.isTeamLead && existing.role !== "org:admin") {
        updatePayload.role = "TEAM_LEAD";
      } else if (!updatePayload.isTeamLead && existing.role === "TEAM_LEAD") {
        updatePayload.role = "org:member";
      }

      await User.updateOne(
        { email: existing.email },
        { role: updatePayload.role || existing.role }
      ).catch(() => {});
    }

    const updated = await Employee.findByIdAndUpdate(
      existing._id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    )
      .populate("teamLead", "firstName lastName employeeId email avatar isTeamLead")
      .populate("teamLeads", "firstName lastName employeeId email avatar isTeamLead")
      .lean();

    const mappedLeads = Array.isArray(updated.teamLeads) && updated.teamLeads.length > 0
      ? updated.teamLeads.map((tl) => ({
          ...tl,
          name: `${tl.firstName || ""} ${tl.lastName || ""}`.trim() || tl.name,
        }))
      : updated.teamLead
      ? [
          {
            ...updated.teamLead,
            name: `${updated.teamLead.firstName || ""} ${updated.teamLead.lastName || ""}`.trim(),
          },
        ]
      : [];

    return {
      ...updated,
      name: `${updated.firstName || ""} ${updated.lastName || ""}`.trim(),
      teamLead: mappedLeads[0] || null,
      teamLeads: mappedLeads,
    };
  }

  static async deleteEmployee(id, organizationId = null) {
    await dbConnect();
    const query = this._buildIdQuery(id, organizationId);
    let deleted = await Employee.findOneAndDelete(query);
    if (!deleted && organizationId) {
      deleted = await Employee.findOneAndDelete(this._buildBaseIdQuery(id));
    }
    if (!deleted) {
      throw new NotFoundError("Employee not found");
    }
    return { success: true, id: deleted._id, employeeId: deleted.employeeId };
  }
}

export default EmployeeService;