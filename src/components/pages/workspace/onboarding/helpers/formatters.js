export function formatAadharInput(value = "") {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function cleanAadharNumber(value = "") {
  return value.replace(/\s+/g, "");
}

export function formatPanInput(value = "") {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
}

export function cleanPanNumber(value = "") {
  return value.trim().toUpperCase();
}