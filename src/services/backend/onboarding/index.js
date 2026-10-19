import dbConnect from "@/lib/db";
import User from "@/models/User";
import Employee from "@/models/Employee";
import { EmployeeService } from "@/services/backend/employee";
import { BadRequestError, UnauthorizedError } from "@/lib/api/response-handler";

export class OnboardingService {
  static async getStatus(clerkUser) {
    if (!clerkUser?.id) {
      throw new UnauthorizedError("User is not authenticated");
    }

    await dbConnect();

    const email = (
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      clerkUser.primaryEmailAddress?.emailAddress ||
      ""
    ).toLowerCase().trim();

    const fullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "Employee";
    const avatar = clerkUser.imageUrl || "";

    let user = await User.findOne({
      $or: [{ clerkId: clerkUser.id }, { email }],
    });

    if (!user) {
      user = await User.create({
        clerkId: clerkUser.id,
        email,
        name: fullName,
        avatar,
        role: "EMPLOYEE",
        isOnboarded: false,
      });
    } else {
      let needsSave = false;
      if (!user.clerkId) {
        user.clerkId = clerkUser.id;
        needsSave = true;
      }
      if (avatar && !user.avatar) {
        user.avatar = avatar;
        needsSave = true;
      }
      if (needsSave) await user.save();
    }

    let employee = null;
    if (user.employeeProfile) {
      employee = await Employee.findById(user.employeeProfile).lean();
    } else if (email) {
      employee = await Employee.findOne({ email }).lean();
      if (employee) {
        user.employeeProfile = employee._id;
        user.isOnboarded = true;
        await user.save();
      }
    }

    return {
      user: {
        id: user._id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || "EMPLOYEE",
        avatar: user.avatar,
        isOnboarded: Boolean(user.isOnboarded && employee),
      },
      employee: employee
        ? {
            ...employee,
            name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
          }
        : null,
    };
  }

  static async completeOnboarding(clerkUser, data) {
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
        role: "EMPLOYEE",
        isOnboarded: false,
      });
    }

    let employee = await Employee.findOne({ email });

    const employeePayload = {
      firstName,
      lastName,
      email,
      phone,
      department: data.department || "Engineering",
      designation: data.designation || "Team Member",
      employmentType: data.employmentType || "Full-Time",
      status: "Active",
      gender: data.gender || "Prefer not to say",
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
      address: {
        street: data.address?.street?.trim() || "",
        city: data.address?.city?.trim() || "",
        state: data.address?.state?.trim() || "",
        postalCode: data.address?.postalCode?.trim() || "",
        country: data.address?.country?.trim() || "India",
      },
      emergencyContact: {
        name: data.emergencyContact?.name?.trim() || "",
        relation: data.emergencyContact?.relation?.trim() || "",
        phone: data.emergencyContact?.phone?.trim() || "",
      },
      avatar: clerkUser.imageUrl || "",
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
    await user.save();

    return {
      user: {
        id: user._id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        role: user.role || "EMPLOYEE",
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
