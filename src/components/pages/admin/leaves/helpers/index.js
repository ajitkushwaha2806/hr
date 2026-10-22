export function filterLeaveRequests(requests = [], searchQuery = "", statusFilter = "all") {
  const query = (searchQuery || "").toLowerCase().trim();

  return requests.filter((r) => {
    const name = (r.employeeName || "").toLowerCase();
    const dept = (r.department || "").toLowerCase();
    const email = (r.employeeEmail || "").toLowerCase();
    const type = (r.type || "").toLowerCase();
    const reason = (r.reason || "").toLowerCase();

    const matchesSearch =
      !query ||
      name.includes(query) ||
      dept.includes(query) ||
      email.includes(query) ||
      type.includes(query) ||
      reason.includes(query);

    if (!matchesSearch) return false;

    if (statusFilter === "pending") return r.status === "PENDING";
    if (statusFilter === "approved") return r.status === "APPROVED";
    if (statusFilter === "rejected") return r.status === "REJECTED";
    return true;
  });
}

export function computeLeaveStats(requests = [], rawStats = null) {
  if (rawStats && typeof rawStats === "object" && rawStats.total !== undefined) {
    return {
      total: rawStats.total ?? requests.length,
      pending: rawStats.pending ?? requests.filter((r) => r.status === "PENDING").length,
      approved: rawStats.approved ?? requests.filter((r) => r.status === "APPROVED").length,
      rejected: rawStats.rejected ?? requests.filter((r) => r.status === "REJECTED").length,
    };
  }

  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === "PENDING").length,
    approved: requests.filter((r) => r.status === "APPROVED").length,
    rejected: requests.filter((r) => r.status === "REJECTED").length,
  };
}

export function formatLeaveDuration(daysCount, dayType) {
  const count = Number(daysCount) || 1;
  const unit = count === 1 ? "day" : "days";

  if (dayType === "FIRST_HALF") return `${count} ${unit} (First Half)`;
  if (dayType === "SECOND_HALF") return `${count} ${unit} (Second Half)`;
  return `${count} ${unit}`;
}

export function formatDateRange(startDate, endDate) {
  if (!startDate) return "—";
  if (!endDate || startDate === endDate) return startDate;
  return `${startDate} to ${endDate}`;
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
