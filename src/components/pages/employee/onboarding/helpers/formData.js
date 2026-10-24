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

    // Identity & Educational Documents
    aadharNumber: employee?.documents?.aadhar?.number || "",
    aadharFrontUrl: employee?.documents?.aadhar?.frontUrl || "",
    aadharBackUrl: employee?.documents?.aadhar?.backUrl || "",
    panNumber: employee?.documents?.pan?.number || "",
    panFileUrl: employee?.documents?.pan?.fileUrl || "",
    tenthRollNumber: employee?.documents?.tenthResult?.rollNumber || "",
    tenthResultUrl: employee?.documents?.tenthResult?.fileUrl || "",
    twelfthRollNumber: employee?.documents?.twelfthResult?.rollNumber || "",
    twelfthResultUrl: employee?.documents?.twelfthResult?.fileUrl || "",

    // Bank Details
    accountHolderName: employee?.bankDetails?.accountHolderName || clerkFullName || "",
    bankName: employee?.bankDetails?.bankName || "",
    accountNumber: employee?.bankDetails?.accountNumber || "",
    ifscCode: employee?.bankDetails?.ifscCode || "",
    branchName: employee?.bankDetails?.branchName || "",
    upiId: employee?.bankDetails?.upiId || "",

    // Non-Disclosure Agreement (NDA) E-Signature & S3 links
    ndaAccepted: Boolean(employee?.nda?.isSigned),
    ndaAttested: Boolean(employee?.nda?.isSigned),
    ndaSignatureType: employee?.nda?.signatureType || "draw",
    ndaSignatureData: employee?.nda?.signatureData || "",
    ndaSignatureUrl: employee?.nda?.signatureUrl || "",
    ndaAgreementPdfUrl: employee?.nda?.agreementPdfUrl || "",
    ndaSignerName: employee?.nda?.signerName || clerkFullName || `${fName} ${lName}`.trim(),
    ndaSignedAt: employee?.nda?.signedAt ? new Date(employee.nda.signedAt).toISOString() : "",
    ndaVersion: employee?.nda?.version || "1.0",

    facePhoto: employee?.facePhoto || employee?.avatar || "",
    avatar: employee?.avatar || user?.avatar || clerkUser?.imageUrl || "",
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
    avatar: (formData.facePhoto || formData.avatar || "").trim(),
    facePhoto: (formData.facePhoto || formData.avatar || "").trim(),

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
      tenthResult: {
        rollNumber: (formData.tenthRollNumber || "").trim(),
        fileUrl: (formData.tenthResultUrl || "").trim(),
      },
      twelfthResult: {
        rollNumber: (formData.twelfthRollNumber || "").trim(),
        fileUrl: (formData.twelfthResultUrl || "").trim(),
      },
    },
    bankDetails: {
      accountHolderName:
        formData.accountHolderName?.trim() ||
        `${formData.firstName || ""} ${formData.lastName || ""}`.trim(),
      bankName: formData.bankName?.trim() || "",
      accountNumber: formData.accountNumber?.trim() || "",
      ifscCode: formData.ifscCode?.trim()?.toUpperCase() || "",
      branchName: formData.branchName?.trim() || "",
      upiId: formData.upiId?.trim() || "",
    },
    nda: {
      isSigned: Boolean(formData.ndaAccepted && formData.ndaAttested && (formData.ndaSignatureUrl || formData.ndaSignatureData)),
      signedAt: formData.ndaSignedAt || new Date().toISOString(),
      signatureType: formData.ndaSignatureType || "draw",
      signatureData: (formData.ndaSignatureUrl || formData.ndaSignatureData || "").trim(),
      signatureUrl: (formData.ndaSignatureUrl || "").trim(),
      agreementPdfUrl: (formData.ndaAgreementPdfUrl || "").trim(),
      signerName: (formData.ndaSignerName || `${formData.firstName || ""} ${formData.lastName || ""}`).trim(),
      version: formData.ndaVersion || "1.0",
    },
  };
}

