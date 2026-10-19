export const validateRequiredFields  = (data, requiredFields = []) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      isValid: false,
      message: "Invalid data. Expected an object.",
      missingFields: requiredFields,
    };
  }

  const missingFields = requiredFields.filter((field) => {
    const value = data[field];

    return (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    );
  });

  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `Required field${missingFields.length > 1 ? "s" : ""} missing: ${missingFields.join(", ")}.`,
      missingFields,
    };
  }

  return {
    isValid: true,
    message: "All required fields are present.",
    missingFields: [],
  };
}