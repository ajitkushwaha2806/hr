export function resolveEmployeeName(emp = {}) {
  return (
    emp.name ||
    `${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
    emp.email ||
    "Employee"
  );
}

export function getEmployeeInitials(name = "") {
  const clean = name.trim();
  if (!clean) return "E";
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export function formatPunchTime(timeValue) {
  if (!timeValue) return "--:--";
  try {
    return new Date(timeValue).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--:--";
  }
}

export function formatDuration(durationMinutes) {
  if (durationMinutes === null || durationMinutes === undefined) return "--";
  const totalMins = Number(durationMinutes);
  if (isNaN(totalMins) || totalMins <= 0) return "--";

  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export function formatDistance(distanceMeters) {
  if (distanceMeters === null || distanceMeters === undefined) return "--";
  const num = Number(distanceMeters);
  return isNaN(num) ? "--" : `${Math.round(num)}m`;
}

export function formatConfidence(confidence) {
  if (confidence === null || confidence === undefined) return "Verified";
  const num = Number(confidence);
  return isNaN(num) ? "Verified" : `${Math.round(num)}%`;
}

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function shiftDateByDays(dateStr, offsetDays = 0) {
  if (!dateStr) return getTodayDateString();
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + offsetDays);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return getTodayDateString();
  }
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return "Today";
  try {
    const today = getTodayDateString();
    if (dateStr === today) return "Today";

    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function filterAttendanceLogs(logs = [], searchQuery = "") {
  const query = (searchQuery || "").toLowerCase().trim();
  if (!query) return logs;

  return logs.filter((l) => {
    const emp = l.employeeId || {};
    const name = resolveEmployeeName(emp).toLowerCase();
    const email = (emp.email || "").toLowerCase();
    const department = (emp.department || "").toLowerCase();
    const date = (l.date || "").toLowerCase();

    return (
      name.includes(query) ||
      email.includes(query) ||
      department.includes(query) ||
      date.includes(query)
    );
  });
}
