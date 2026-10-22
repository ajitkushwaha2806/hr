export function sanitizeDepartmentPayload(name = "", designations = []) {
  const cleanName = name.trim();
  const cleanDesignations = Array.isArray(designations)
    ? [...new Set(designations.map((d) => (typeof d === "string" ? d.trim() : "")).filter(Boolean))]
    : [];

  return {
    name: cleanName,
    designations: cleanDesignations,
  };
}

export function validateDepartmentName(name = "") {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Department name is required.";
  }
  if (trimmed.length < 2) {
    return "Department name must be at least 2 characters.";
  }
  if (trimmed.length > 50) {
    return "Department name must not exceed 50 characters.";
  }
  return null;
}
