import { cleanAadharNumber, cleanPanNumber } from "./formatters";

export function isValidPhoneNumber(phone) {
  if (!phone || typeof phone !== "string") return false;
  const digits = phone.replace(/\D/g, "");
  // Valid phone numbers must have at least 10 digits and at most 15 digits
  return digits.length >= 10 && digits.length <= 15;
}

export function arePhoneNumbersSame(phone1, phone2) {
  if (!phone1 || !phone2) return false;
  const d1 = String(phone1).replace(/\D/g, "");
  const d2 = String(phone2).replace(/\D/g, "");
  if (!d1 || !d2) return false;
  // Compare the core 10 digits (national number) to handle variations with country codes (+91, 0, etc.)
  if (d1.length >= 10 && d2.length >= 10) {
    return d1.slice(-10) === d2.slice(-10);
  }
  return d1 === d2;
}

export function validateStep(step, formData) {
  const errs = {};

  if (step === 1) {
    if (!formData.firstName?.trim()) errs.firstName = "First name is required";
    if (!formData.lastName?.trim()) errs.lastName = "Last name is required";
    if (!formData.phone?.trim()) {
      errs.phone = "Phone number is required";
    } else if (!isValidPhoneNumber(formData.phone)) {
      errs.phone = "Please enter a valid 10-digit phone number";
    }
    if (!formData.facePhoto?.trim() && !formData.avatar?.trim()) {
      errs.facePhoto = "Biometric face registration is required for office attendance check-in";
    }
  } else if (step === 2) {
    if (!formData.department) errs.department = "Department is required";
    if (!formData.designation?.trim()) errs.designation = "Job designation is required";
  } else if (step === 3) {
    if (!formData.currentStreet?.trim()) errs.currentStreet = "Current street address is required";
    if (!formData.currentCity?.trim()) errs.currentCity = "Current city is required";
    if (!formData.currentState?.trim()) errs.currentState = "Current state is required";
    if (!formData.currentPostalCode?.trim()) errs.currentPostalCode = "Current postal code is required";

    if (!formData.sameAsCurrentAddress) {
      if (!formData.permanentStreet?.trim()) errs.permanentStreet = "Permanent street address is required";
      if (!formData.permanentCity?.trim()) errs.permanentCity = "Permanent city is required";
      if (!formData.permanentState?.trim()) errs.permanentState = "Permanent state is required";
      if (!formData.permanentPostalCode?.trim()) errs.permanentPostalCode = "Permanent postal code is required";
    }

    if (!formData.emergencyName?.trim()) errs.emergencyName = "Emergency contact name is required";
    if (!formData.emergencyPhone?.trim()) {
      errs.emergencyPhone = "Emergency phone number is required";
    } else if (!isValidPhoneNumber(formData.emergencyPhone)) {
      errs.emergencyPhone = "Please enter a valid phone number (minimum 10 digits)";
    } else if (arePhoneNumbersSame(formData.phone, formData.emergencyPhone)) {
      errs.emergencyPhone = "Emergency contact number must be different from your personal phone number";
    }
  } else if (step === 4) {
    const cleanAadhar = cleanAadharNumber(formData.aadharNumber);
    if (!cleanAadhar) {
      errs.aadharNumber = "Aadhar card number is required";
    } else if (!/^\d{12}$/.test(cleanAadhar)) {
      errs.aadharNumber = "Aadhar number must be a valid 12-digit number";
    }

    const cleanPan = cleanPanNumber(formData.panNumber);
    if (!cleanPan) {
      errs.panNumber = "PAN card number is required";
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      errs.panNumber = "Invalid PAN format (e.g. ABCDE1234F)";
    }

    if (!formData.aadharFrontUrl?.trim()) {
      errs.aadharFrontUrl = "Aadhar card (front side) upload is required";
    }
    if (!formData.aadharBackUrl?.trim()) {
      errs.aadharBackUrl = "Aadhar card (back side) upload is required";
    }
    if (!formData.panFileUrl?.trim()) {
      errs.panFileUrl = "PAN card document upload is required";
    }

    // Bank Details Validation
    if (!formData.accountHolderName?.trim()) {
      errs.accountHolderName = "Account holder name is required";
    }
    if (!formData.bankName?.trim()) {
      errs.bankName = "Bank name is required";
    }

    const cleanAcc = (formData.accountNumber || "").replace(/\D/g, "");
    if (!cleanAcc) {
      errs.accountNumber = "Bank account number is required";
    } else if (cleanAcc.length < 9 || cleanAcc.length > 18) {
      errs.accountNumber = "Account number must be between 9 and 18 digits";
    }

    const cleanIfsc = (formData.ifscCode || "").trim().toUpperCase();
    if (!cleanIfsc) {
      errs.ifscCode = "IFSC code is required";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      errs.ifscCode = "Invalid IFSC format (e.g. HDFC0001234)";
    }
  }

  return errs;
}
