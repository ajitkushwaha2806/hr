import { cleanAadharNumber, cleanPanNumber } from "./formatters";
export function validateStep(step, formData) {
  const errs = {};

  if (step === 1) {
    if (!formData.firstName?.trim()) errs.firstName = "First name is required";
    if (!formData.lastName?.trim()) errs.lastName = "Last name is required";
    if (!formData.phone?.trim()) errs.phone = "Phone number is required";
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
    if (!formData.emergencyPhone?.trim()) errs.emergencyPhone = "Emergency phone number is required";
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
  }

  return errs;
}
