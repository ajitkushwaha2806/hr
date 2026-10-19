import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
import { NotFoundError, ConflictError } from "@/lib/api/response-handler";


export class EmployeeService {
  static async getEmployees({
    search = "",
    department = "",
    status = "",
    employmentType = "",
    page = 1,
    limit = 50,
  } = {}) {
    await dbConnect();

    const query = {};

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

    const [employees, total, totalAll, activeCount, onLeaveCount, probationCount] = await Promise.all([
      Employee.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Employee.countDocuments(query),
      Employee.countDocuments({}),
      Employee.countDocuments({ status: "Active" }),
      Employee.countDocuments({ status: "On Leave" }),
      Employee.countDocuments({ status: "Probation" }),
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

  static _buildIdQuery(id) {
    if (mongoose.isValidObjectId(id)) {
      return { $or: [{ _id: id }, { employeeId: id }] };
    }
    return { employeeId: id };
  }

  static async getEmployeeById(id) {
    await dbConnect();
    const query = this._buildIdQuery(id);
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
    const existingEmail = await Employee.findOne({ email: data.email.toLowerCase().trim() });
    if (existingEmail) {
      throw new ConflictError(`An employee with email ${data.email} already exists.`);
    }

    let employeeId = data.employeeId?.trim()?.toUpperCase();
    if (!employeeId) {
      const count = await Employee.countDocuments();
      employeeId = `EMP-${String(1001 + count).padStart(4, "0")}`;
    } else {
      const existingId = await Employee.findOne({ employeeId });
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

  static async updateEmployee(id, data) {
    await dbConnect();
    const query = this._buildIdQuery(id);
    const existing = await Employee.findOne(query);
    if (!existing) {
      throw new NotFoundError("Employee not found");
    }

    if (data.email) {
      const existingEmail = await Employee.findOne({
        email: data.email.toLowerCase().trim(),
        _id: { $ne: existing._id },
      });
      if (existingEmail) {
        throw new ConflictError(`Another employee with email ${data.email} already exists.`);
      }
      data.email = data.email.toLowerCase().trim();
    }

    if (data.employeeId) {
      const formattedId = data.employeeId.trim().toUpperCase();
      const existingId = await Employee.findOne({
        employeeId: formattedId,
        _id: { $ne: existing._id },
      });
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

  static async deleteEmployee(id) {
    await dbConnect();
    const query = this._buildIdQuery(id);
    const deleted = await Employee.findOneAndDelete(query);
    if (!deleted) {
      throw new NotFoundError("Employee not found");
    }
    return { success: true, id: deleted._id, employeeId: deleted.employeeId };
  }
}

export default EmployeeService;