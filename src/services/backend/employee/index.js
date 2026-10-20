import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
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
  } = {}) {
    await dbConnect();

    const query = {};

    if (organizationId) {
      query.organizationId = organizationId;
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
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
        { employeeId: regex },
        { designation: regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 50);
    const skip = (pageNum - 1) * limitNum;

    const baseCountFilter = organizationId ? { organizationId } : {};

    const [employees, total, totalAll, activeCount, onLeaveCount, probationCount] = await Promise.all([
      Employee.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Employee.countDocuments(query),
      Employee.countDocuments(baseCountFilter),
      Employee.countDocuments({ ...baseCountFilter, status: "Active" }),
      Employee.countDocuments({ ...baseCountFilter, status: "On Leave" }),
      Employee.countDocuments({ ...baseCountFilter, status: "Probation" }),
    ]);

    const employeesWithFullName = employees.map((emp) => ({
      ...emp,
      name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
    }));

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

  static _buildIdQuery(id, organizationId = null) {
    let baseQuery;
    if (mongoose.isValidObjectId(id)) {
      baseQuery = { $or: [{ _id: id }, { employeeId: id }] };
    } else {
      baseQuery = { employeeId: id };
    }

    if (organizationId) {
      return { $and: [baseQuery, { organizationId }] };
    }
    return baseQuery;
  }

  static async getEmployeeById(id, organizationId = null) {
    await dbConnect();
    const query = this._buildIdQuery(id, organizationId);
    const employee = await Employee.findOne(query).lean();
    if (!employee) {
      throw new NotFoundError("Employee not found");
    }
    return {
      ...employee,
      name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
    };
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

    const newEmployee = await Employee.create({
      ...data,
      employeeId,
      email: data.email.toLowerCase().trim(),
    });

    const obj = newEmployee.toObject();
    return {
      ...obj,
      name: `${obj.firstName || ""} ${obj.lastName || ""}`.trim(),
    };
  }

  static async updateEmployee(id, data, organizationId = null) {
    await dbConnect();
    const query = this._buildIdQuery(id, organizationId);
    const existing = await Employee.findOne(query);
    if (!existing) {
      throw new NotFoundError("Employee not found");
    }

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
      data.email = data.email.toLowerCase().trim();
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
      data.employeeId = formattedId;
    }

    const updated = await Employee.findByIdAndUpdate(
      existing._id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    return {
      ...updated,
      name: `${updated.firstName || ""} ${updated.lastName || ""}`.trim(),
    };
  }

  static async deleteEmployee(id, organizationId = null) {
    await dbConnect();
    const query = this._buildIdQuery(id, organizationId);
    const deleted = await Employee.findOneAndDelete(query);
    if (!deleted) {
      throw new NotFoundError("Employee not found");
    }
    return { success: true, id: deleted._id, employeeId: deleted.employeeId };
  }
}

export default EmployeeService;