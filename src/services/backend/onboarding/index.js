import dbConnect from "@/lib/db";
import User from "@/models/User";
import Employee from "@/models/Employee";
import OfficeLocation from "@/models/OfficeLocation";
import { EmployeeService } from "@/services/backend/employee";
import { BadRequestError, UnauthorizedError } from "@/lib/api/response-handler";
import { uploadToS3 } from "@/lib/services/s3";

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

    const isFinalAdmin =
      orgRole === "org:admin" ||
      orgRole?.toLowerCase()?.includes("admin") ||
      user.role === "org:admin" ||
      user.role === "SUPER_ADMIN" ||
      user.role === "HR_ADMIN" ||
      user.role?.toLowerCase()?.includes("admin");

    if (!user.isOnboarded && !isFinalAdmin) {
      const empExists = await Employee.exists({
        $or: [
          ...(user.employeeProfile ? [{ _id: user.employeeProfile }] : []),
          { clerkId: clerkUser.id },
          ...(email ? [{ email: { $regex: new RegExp(`^${email}$`, "i") }, ...(orgId ? { organizationId: orgId } : {}) }] : []),
        ],
      });
      if (empExists) {
        user.isOnboarded = true;
        user.employeeProfile = empExists._id;
        await user.save();
      }
    }

    const isOnboardedStatus = isFinalAdmin ? true : Boolean(user.isOnboarded);

    const officeLocation = await OfficeLocation.findOne({
      organizationId: orgId || "default_org",
      isActive: true,
    }).lean();

    const companyDetails = {
      name: officeLocation?.companyName || "",
      address: officeLocation?.companyAddress || officeLocation?.address || "",
      phone: officeLocation?.companyPhone || "",
      website: officeLocation?.companyWebsite || "",
      representative: officeLocation?.companyRepresentative || "",
      designation: officeLocation?.companyDesignation || "Authorized Signatory",
      logo: officeLocation?.companyLogo || "/assets/icons/logo.png",
    };

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
        isOnboarded: isOnboardedStatus,
      },
      companyDetails,
      isOnboarded: isOnboardedStatus,
      isAdmin: isFinalAdmin,
      role: orgRole || user.role || "org:member",
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

    const emergencyPhone = (data.emergencyContact?.phone || "").trim();
    if (emergencyPhone) {
      const emergDigits = emergencyPhone.replace(/\D/g, "");
      if (emergDigits.length < 10 || emergDigits.length > 15) {
        throw new BadRequestError("Emergency contact phone number must be a valid number (minimum 10 digits)");
      }
      const empPhoneDigits = phone.replace(/\D/g, "");
      if (
        empPhoneDigits.length >= 10 &&
        emergDigits.length >= 10 &&
        empPhoneDigits.slice(-10) === emergDigits.slice(-10)
      ) {
        throw new BadRequestError(
          "Emergency contact phone number must be different from the employee's personal phone number"
        );
      }
    }


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

    let signatureUrl = data.nda?.signatureUrl?.trim() || "";
    let agreementPdfUrl = data.nda?.agreementPdfUrl?.trim() || "";

    // Upload base64 signature to S3 so only S3 link is saved in database
    if (data.nda?.signatureData && data.nda.signatureData.startsWith("data:image")) {
      try {
        const base64Data = data.nda.signatureData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const s3Res = await uploadToS3({
          buffer,
          originalName: `nda-sign-${(firstName || "user").toLowerCase()}-${Date.now()}.png`,
          mimeType: "image/png",
          subfolder: "signatures",
        });
        signatureUrl = s3Res.url;
      } catch (uploadErr) {
        console.error("Failed to upload signature to S3:", uploadErr);
      }
    } else if (data.nda?.signatureData && (data.nda.signatureData.startsWith("http://") || data.nda.signatureData.startsWith("https://"))) {
      signatureUrl = data.nda.signatureData;
    }

    // Upload base64 PDF agreement to S3 if sent as data URI
    if (data.nda?.agreementPdfData && data.nda.agreementPdfData.startsWith("data:application/pdf")) {
      try {
        const base64Pdf = data.nda.agreementPdfData.replace(/^data:application\/pdf;base64,/, "");
        const buffer = Buffer.from(base64Pdf, "base64");
        const s3Res = await uploadToS3({
          buffer,
          originalName: `nda-agreement-${(firstName || "user").toLowerCase()}-${Date.now()}.pdf`,
          mimeType: "application/pdf",
          subfolder: "nda",
        });
        agreementPdfUrl = s3Res.url;
      } catch (pdfUploadErr) {
        console.error("Failed to upload NDA agreement PDF to S3:", pdfUploadErr);
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
        tenthResult: {
          rollNumber: data.documents?.tenthResult?.rollNumber?.trim() || "",
          fileUrl: data.documents?.tenthResult?.fileUrl?.trim() || "",
        },
        twelfthResult: {
          rollNumber: data.documents?.twelfthResult?.rollNumber?.trim() || "",
          fileUrl: data.documents?.twelfthResult?.fileUrl?.trim() || "",
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
      nda: {
        isSigned: Boolean(data.nda?.isSigned),
        signedAt: data.nda?.signedAt ? new Date(data.nda.signedAt) : new Date(),
        signatureType: data.nda?.signatureType || "draw",
        signatureData: signatureUrl || (data.nda?.signatureType === "type" ? data.nda?.signatureData : "") || "",
        signatureUrl: signatureUrl || "",
        agreementPdfUrl: agreementPdfUrl || data.nda?.agreementPdfUrl || "",
        signerName: data.nda?.signerName || `${firstName} ${lastName}`.trim(),
        version: data.nda?.version || "1.0",
      },
      avatar:
        data.avatar && !data.avatar.includes("clerk")
          ? data.avatar.trim()
          : data.facePhoto && !data.facePhoto.includes("clerk")
          ? data.facePhoto.trim()
          : "",
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
