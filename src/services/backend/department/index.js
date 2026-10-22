import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
import Department from "@/models/Department";
import { BadRequestError, NotFoundError, ConflictError } from "@/lib/api/response-handler";

const DEFAULT_DEPARTMENTS_SEED = [
  {
    name: "Tech Team",
    designations: ["Software Engineer", "Tech Lead", "Frontend Developer", "Backend Developer"],
  },
  {
    name: "Digital Team",
    designations: ["Sales Executive", "Digital Lead"],
  },
  {
    name: "Onboarding Team",
    designations: ["Sales Executive", "Onboarding Lead"],
  },
  {
    name: "Retention Team",
    designations: ["Customer Support", "Retention Lead"],
  },
];

export class DepartmentBackendService {
  static async getDepartments(organizationId, { autoSeed = false } = {}) {
    await dbConnect();

    const cleanOrgId = organizationId || "default_org";
    let departments = await Department.find({ organizationId: cleanOrgId }).sort({ name: 1 }).lean();

    if (departments.length === 0 && autoSeed) {
      try {
        const seedDocs = DEFAULT_DEPARTMENTS_SEED.map((d) => ({
          ...d,
          organizationId: cleanOrgId,
        }));
        await Department.insertMany(seedDocs, { ordered: false });
        departments = await Department.find({ organizationId: cleanOrgId }).sort({ name: 1 }).lean();
      } catch (err) {
        console.error("Failed to seed initial departments:", err);
      }
    }

    const memberCounts = await Employee.aggregate([
      { $match: { organizationId: cleanOrgId } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    memberCounts.forEach((m) => {
      if (m._id) {
        countMap[m._id.toLowerCase().trim()] = m.count;
      }
    });

    return departments.map((dept) => ({
      ...dept,
      memberCount: countMap[dept.name.toLowerCase().trim()] || 0,
    }));
  }

  static async createDepartment(organizationId, { name, designations = [] }) {
    await dbConnect();
    const cleanOrgId = organizationId || "default_org";

    if (!name || !name.trim()) {
      throw new BadRequestError("Department name is required");
    }

    const cleanName = name.trim();
    const existing = await Department.findOne({
      organizationId: cleanOrgId,
      name: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });

    if (existing) {
      throw new ConflictError(`Department "${cleanName}" already exists`);
    }

    const cleanDesignations = Array.isArray(designations)
      ? [...new Set(designations.map((d) => (typeof d === "string" ? d.trim() : "")).filter(Boolean))]
      : [];

    const department = await Department.create({
      organizationId: cleanOrgId,
      name: cleanName,
      designations: cleanDesignations,
    });

    return department;
  }

  static async updateDepartment(organizationId, departmentId, { name, designations }) {
    await dbConnect();
    const cleanOrgId = organizationId || "default_org";

    if (!departmentId) {
      throw new BadRequestError("Department ID is required");
    }

    const department = await Department.findOne({ _id: departmentId, organizationId: cleanOrgId });
    if (!department) {
      throw new NotFoundError("Department not found");
    }

    if (name && name.trim()) {
      const cleanName = name.trim();
      const existing = await Department.findOne({
        _id: { $ne: departmentId },
        organizationId: cleanOrgId,
        name: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      });
      if (existing) {
        throw new ConflictError(`Department name "${cleanName}" is already taken`);
      }
      department.name = cleanName;
    }

    if (Array.isArray(designations)) {
      department.designations = [
        ...new Set(designations.map((d) => (typeof d === "string" ? d.trim() : "")).filter(Boolean)),
      ];
    }

    await department.save();
    return department;
  }

  static async deleteDepartment(organizationId, departmentId) {
    await dbConnect();
    const cleanOrgId = organizationId || "default_org";

    if (!departmentId) {
      throw new BadRequestError("Department ID is required");
    }

    const deleted = await Department.findOneAndDelete({ _id: departmentId, organizationId: cleanOrgId });
    if (!deleted) {
      throw new NotFoundError("Department not found");
    }

    return null;
  }
}

export default DepartmentBackendService;
