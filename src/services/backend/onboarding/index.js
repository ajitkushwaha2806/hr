import dbConnect from "@/lib/db";
import User from "@/models/User";
import Employee from "@/models/Employee";
import { EmployeeService } from "@/services/backend/employee";
import { BadRequestError, UnauthorizedError } from "@/lib/api/response-handler";

export class OnboardingService {
  static async getStatus(clerkUser, { orgId = null, orgRole = "org:member" } = {}) {
    if (!clerkUser?.id) {
      throw new UnauthorizedError("User is not authenticated");
    }

    await dbConnect();

    const email = (
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      clerkUser.primaryEmailAddress?.emailAddress ||
      ""
    ).toLowerCase().trim();

    const firstName = clerkUser.firstName || "";
    const lastName = clerkUser.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim() || clerkUser.username || "Employee";
    const phone = (
      clerkUser.phoneNumbers?.[0]?.phoneNumber ||
      clerkUser.primaryPhoneNumber?.phoneNumber ||
      ""
    ).trim();
    const avatar = clerkUser.imageUrl || "";

    let user = await User.findOne({
      $or: [{ clerkId: clerkUser.id }, ...(email ? [{ email }] : [])],
    });

    const isRoleAdmin =
      orgRole === "org:admin" ||
      orgRole?.toLowerCase()?.includes("admin") ||
      false;

    if (!user) {
      user = await User.create({
        clerkId: clerkUser.id,
        email,
        name: fullName,
        phone,
        avatar,
        role: orgRole || "org:member",
        isOnboarded: Boolean(isRoleAdmin),
      });
    } else {
      let needsSave = false;
      if (!user.clerkId) {
        user.clerkId = clerkUser.id;
        needsSave = true;
      }
      if (email && (!user.email || user.email !== email)) {
        user.email = email;
        needsSave = true;
      }
      if (fullName && (!user.name || user.name === "Employee")) {
        user.name = fullName;
        needsSave = true;
      }
      if (phone && !user.phone) {
        user.phone = phone;
        needsSave = true;
      }
      if (avatar && !user.avatar) {
        user.avatar = avatar;
        needsSave = true;
      }
      if (orgRole && user.role !== orgRole) {
        user.role = orgRole;
        needsSave = true;
      }
      const isUserAdmin =
        orgRole === "org:admin" ||
        orgRole?.toLowerCase()?.includes("admin") ||
        user.role === "org:admin" ||
        user.role === "SUPER_ADMIN" ||
        user.role === "HR_ADMIN" ||
        user.role?.toLowerCase()?.includes("admin");

      if (isUserAdmin && !user.isOnboarded) {
        user.isOnboarded = true;
        needsSave = true;
      }
      if (needsSave) await user.save();
    }

    let employee = null;
    if (user.employeeProfile) {
      employee = await Employee.findById(user.employeeProfile).lean();
    }

    if (!employee && clerkUser.id) {
      employee = await Employee.findOne({ clerkId: clerkUser.id }).lean();
    }

    if (!employee && email) {
      if (orgId) {
        employee = await Employee.findOne({
          email: { $regex: new RegExp(`^${email}$`, "i") },
          organizationId: orgId,
        }).lean();
      }
      if (!employee) {
        employee = await Employee.findOne({
          email: { $regex: new RegExp(`^${email}$`, "i") },
        }).lean();
      }
    }

    if (employee) {
      let needsSave = false;
      if (!user.employeeProfile || String(user.employeeProfile) !== String(employee._id)) {
        user.employeeProfile = employee._id;
        needsSave = true;
      }
      if (!user.isOnboarded) {
        user.isOnboarded = true;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }

      // Sync employee clerkId and organizationId if missing
      const empUpdates = {};
      if (!employee.clerkId && clerkUser.id) {
        empUpdates.clerkId = clerkUser.id;
      }
      if (!employee.organizationId && orgId) {
        empUpdates.organizationId = orgId;
      }
      if (Object.keys(empUpdates).length > 0) {
        await Employee.findByIdAndUpdate(employee._id, { $set: empUpdates });
        Object.assign(employee, empUpdates);
      }
    }

    const isFinalAdmin =
      orgRole === "org:admin" ||
      orgRole?.toLowerCase()?.includes("admin") ||
      user.role === "org:admin" ||
      user.role === "SUPER_ADMIN" ||
      user.role === "HR_ADMIN" ||
      user.role?.toLowerCase()?.includes("admin");

    return {
      user: {
        id: user._id,
        clerkId: user.clerkId,
        name: user.name || fullName,
        firstName: firstName || (user.name ? user.name.split(" ")[0] : ""),
        lastName: lastName || (user.name ? user.name.split(" ").slice(1).join(" ") : ""),
        email: user.email || email,
        phone: user.phone || phone,
        role: orgRole || user.role || "org:member",
        avatar: user.avatar || avatar,
        isAdmin: isFinalAdmin,
        isOnboarded: isFinalAdmin ? true : Boolean(user.isOnboarded && employee),
      },
      employee: employee
        ? {
            ...employee,
            name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
          }
        : null,
    };
  }

  static async completeOnboarding(clerkUser, data, { orgId = null, orgRole = "org:member" } = {}) {
    if (!clerkUser?.id) {
      throw new UnauthorizedError("User is not authenticated");
    }

    await dbConnect();

    const email = (
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      clerkUser.primaryEmailAddress?.emailAddress ||
      data.email ||
      ""
    ).toLowerCase().trim();

    if (!email) {
      throw new BadRequestError("Valid email is required for employee onboarding");
    }

    const organizationId = orgId || data.organizationId || "org_default";
    const firstName = data.firstName?.trim() || clerkUser.firstName || "Employee";
    const lastName = data.lastName?.trim() || clerkUser.lastName || "";
    const phone = data.phone?.trim() || "";

    let user = await User.findOne({
      $or: [{ clerkId: clerkUser.id }, { email }],
    });

    if (!user) {
      user = await User.create({
        clerkId: clerkUser.id,
        email,
        name: `${firstName} ${lastName}`.trim(),
        phone,
        avatar: clerkUser.imageUrl || "",
        role: orgRole || "org:member",
        isOnboarded: false,
      });
    }

    let employee = null;
    if (user.employeeProfile) {
      employee = await Employee.findById(user.employeeProfile);
    }
    if (!employee && clerkUser.id) {
      employee = await Employee.findOne({ clerkId: clerkUser.id });
    }
    if (!employee && email) {
      if (organizationId) {
        employee = await Employee.findOne({
          email: { $regex: new RegExp(`^${email}$`, "i") },
          organizationId,
        });
      }
      if (!employee) {
        employee = await Employee.findOne({
          email: { $regex: new RegExp(`^${email}$`, "i") },
        });
      }
    }

    const employeePayload = {
      organizationId,
      clerkId: clerkUser.id,
      role: orgRole || "org:member",
      firstName,
      lastName,
      email,
      phone,
      department: data.department || "Engineering",
      designation: data.designation || "Team Member",
      employmentType: data.employmentType || "Full-Time",
      status: "Active",
      gender: data.gender || "Male",
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
      address: {
        street: data.currentAddress?.street?.trim() || data.address?.street?.trim() || "",
        city: data.currentAddress?.city?.trim() || data.address?.city?.trim() || "",
        state: data.currentAddress?.state?.trim() || data.address?.state?.trim() || "",
        postalCode: data.currentAddress?.postalCode?.trim() || data.address?.postalCode?.trim() || "",
        country: data.currentAddress?.country?.trim() || data.address?.country?.trim() || "India",
      },
      currentAddress: {
        street: data.currentAddress?.street?.trim() || data.address?.street?.trim() || "",
        city: data.currentAddress?.city?.trim() || data.address?.city?.trim() || "",
        state: data.currentAddress?.state?.trim() || data.address?.state?.trim() || "",
        postalCode: data.currentAddress?.postalCode?.trim() || data.address?.postalCode?.trim() || "",
        country: data.currentAddress?.country?.trim() || data.address?.country?.trim() || "India",
      },
      permanentAddress: {
        street: data.permanentAddress?.street?.trim() || "",
        city: data.permanentAddress?.city?.trim() || "",
        state: data.permanentAddress?.state?.trim() || "",
        postalCode: data.permanentAddress?.postalCode?.trim() || "",
        country: data.permanentAddress?.country?.trim() || "India",
        sameAsCurrent: Boolean(data.permanentAddress?.sameAsCurrent),
      },
      documents: {
        aadhar: {
          number: data.documents?.aadhar?.number?.trim() || "",
          frontUrl: data.documents?.aadhar?.frontUrl?.trim() || "",
          backUrl: data.documents?.aadhar?.backUrl?.trim() || "",
        },
        pan: {
          number: data.documents?.pan?.number?.trim()?.toUpperCase() || "",
          fileUrl: data.documents?.pan?.fileUrl?.trim() || "",
        },
      },
      bankDetails: {
        accountHolderName: data.bankDetails?.accountHolderName?.trim() || "",
        bankName: data.bankDetails?.bankName?.trim() || "",
        accountNumber: data.bankDetails?.accountNumber?.trim() || "",
        ifscCode: data.bankDetails?.ifscCode?.trim()?.toUpperCase() || "",
        branchName: data.bankDetails?.branchName?.trim() || "",
        upiId: data.bankDetails?.upiId?.trim() || "",
      },
      emergencyContact: {
        name: data.emergencyContact?.name?.trim() || "",
        relation: data.emergencyContact?.relation?.trim() || "",
        phone: data.emergencyContact?.phone?.trim() || "",
      },
      avatar: data.avatar?.trim() || data.facePhoto?.trim() || clerkUser.imageUrl || "",
    };

    if (employee) {
      employee = await Employee.findByIdAndUpdate(
        employee._id,
        { $set: employeePayload },
        { new: true, runValidators: true }
      ).lean();
    } else {
      employee = await EmployeeService.createEmployee(employeePayload);
    }

    user.isOnboarded = true;
    user.employeeProfile = employee._id || employee.id;
    user.phone = phone || user.phone;
    user.name = `${firstName} ${lastName}`.trim();
    user.role = orgRole || user.role || "org:member";
    if (employeePayload.avatar) {
      user.avatar = employeePayload.avatar;
    }
    await user.save();

    return {
      user: {
        id: user._id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        role: user.role,
        isOnboarded: true,
      },
      employee: {
        ...employee,
        name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
      },
    };
  }
}

export default OnboardingService;
