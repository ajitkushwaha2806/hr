import { cleanAadharNumber, cleanPanNumber } from "./formatters";

export function getInitialFormData(clerkUser, user, employee) {
  const clerkEmail = (
    clerkUser?.primaryEmailAddress?.emailAddress ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    ""
  ).toLowerCase().trim();

  const clerkPhone = (
    clerkUser?.primaryPhoneNumber?.phoneNumber ||
    clerkUser?.phoneNumbers?.[0]?.phoneNumber ||
    ""
  ).trim();

  const clerkFirstName = clerkUser?.firstName || "";
  const clerkLastName = clerkUser?.lastName || "";
  const clerkFullName = clerkUser?.fullName || `${clerkFirstName} ${clerkLastName}`.trim();

  const rawName = employee?.name || user?.name || clerkFullName || "";
  const nameParts = rawName.trim().split(" ");

  const fName = employee?.firstName || user?.firstName || clerkFirstName || nameParts[0] || "";
  const lName = employee?.lastName || user?.lastName || clerkLastName || nameParts.slice(1).join(" ") || "";

  let dob = "";
  if (employee?.dateOfBirth) {
    try {
      dob = new Date(employee.dateOfBirth).toISOString().split("T")[0];
    } catch {
      dob = "";
    }
  }

  let joinDate = "";
  if (employee?.joiningDate) {
    try {
      joinDate = new Date(employee.joiningDate).toISOString().split("T")[0];
    } catch {
      joinDate = "";
    }
  }

  const email = employee?.email || user?.email || clerkEmail || "";
  const phone = employee?.phone || user?.phone || clerkPhone || "";

  return {
    firstName: fName,
    lastName: lName,
    email,
    phone,
    gender: (employee?.gender && employee?.gender !== "Prefer not to say" && employee?.gender !== "Other") ? employee.gender : "Male",
    dateOfBirth: dob,
    joiningDate: joinDate,
    department: employee?.department || "Digital Team",
    designation: employee?.designation || "Sales Executive",
    employmentType: employee?.employmentType || "Full-Time",
    workLocation: employee?.workLocation || "On-site",

    currentStreet: employee?.currentAddress?.street || employee?.address?.street || "",
    currentCity: employee?.currentAddress?.city || employee?.address?.city || "",
    currentState: employee?.currentAddress?.state || employee?.address?.state || "",
    currentPostalCode: employee?.currentAddress?.postalCode || employee?.address?.postalCode || "",
    currentCountry: employee?.currentAddress?.country || employee?.address?.country || "India",

    sameAsCurrentAddress: employee?.permanentAddress?.sameAsCurrent !== undefined
      ? Boolean(employee.permanentAddress.sameAsCurrent)
      : true,
    permanentStreet: employee?.permanentAddress?.street || "",
    permanentCity: employee?.permanentAddress?.city || "",
    permanentState: employee?.permanentAddress?.state || "",
    permanentPostalCode: employee?.permanentAddress?.postalCode || "",
    permanentCountry: employee?.permanentAddress?.country || "India",

    // Emergency Contact
    emergencyName: employee?.emergencyContact?.name || "",
    emergencyRelation: employee?.emergencyContact?.relation || "",
    emergencyPhone: employee?.emergencyContact?.phone || "",

    // Identity Documents
    aadharNumber: employee?.documents?.aadhar?.number || "",
    aadharFrontUrl: employee?.documents?.aadhar?.frontUrl || "",
    aadharBackUrl: employee?.documents?.aadhar?.backUrl || "",
    panNumber: employee?.documents?.pan?.number || "",
    panFileUrl: employee?.documents?.pan?.fileUrl || "",
  };
}

export function buildOnboardingPayload(formData) {
  return {
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim(),
    gender: formData.gender,
    dateOfBirth: formData.dateOfBirth || null,
    joiningDate: formData.joiningDate || new Date().toISOString(),
    department: formData.department,
    designation: formData.designation.trim(),
    employmentType: formData.employmentType,
    workLocation: formData.workLocation,

    currentAddress: {
      street: formData.currentStreet.trim(),
      city: formData.currentCity.trim(),
      state: formData.currentState.trim(),
      postalCode: formData.currentPostalCode.trim(),
      country: formData.currentCountry.trim() || "India",
    },
    permanentAddress: formData.sameAsCurrentAddress
      ? {
          street: formData.currentStreet.trim(),
          city: formData.currentCity.trim(),
          state: formData.currentState.trim(),
          postalCode: formData.currentPostalCode.trim(),
          country: formData.currentCountry.trim() || "India",
          sameAsCurrent: true,
        }
      : {
          street: formData.permanentStreet.trim(),
          city: formData.permanentCity.trim(),
          state: formData.permanentState.trim(),
          postalCode: formData.permanentPostalCode.trim(),
          country: formData.permanentCountry.trim() || "India",
          sameAsCurrent: false,
        },
    emergencyContact: {
      name: formData.emergencyName.trim(),
      relation: formData.emergencyRelation.trim(),
      phone: formData.emergencyPhone.trim(),
    },
    documents: {
      aadhar: {
        number: cleanAadharNumber(formData.aadharNumber),
        frontUrl: formData.aadharFrontUrl.trim(),
        backUrl: formData.aadharBackUrl.trim(),
      },
      pan: {
        number: cleanPanNumber(formData.panNumber),
        fileUrl: formData.panFileUrl.trim(),
      },
    },
  };
}
