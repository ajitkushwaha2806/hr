function getErrorMessage(data, fallback = "An error occurred") {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  return data.message || data.error || fallback;
}

export class LeaveFrontendService {
  static async getMyLeaves(month = null) {
    try {
      const url = month ? `/api/employee/leaves?month=${month}` : "/api/employee/leaves";
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Failed to fetch leaves"));
      }

      return data.data;
    } catch (err) {
      throw new Error(err.message || "Network error fetching leaves");
    }
  }

  static async applyLeave(payload) {
    try {
      const res = await fetch("/api/employee/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Failed to submit leave request"));
      }

      return data.data;
    } catch (err) {
      throw new Error(err.message || "Network error submitting leave request");
    }
  }

  static async cancelLeave(leaveId) {
    try {
      const res = await fetch(`/api/employee/leaves/${leaveId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Failed to cancel leave request"));
      }

      return data.data;
    } catch (err) {
      throw new Error(err.message || "Network error cancelling leave request");
    }
  }

  static async adminGetLeaves(params = {}) {
    try {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.set("status", params.status);
      if (params.month) searchParams.set("month", params.month);
      if (params.search) searchParams.set("search", params.search);

      const qs = searchParams.toString();
      const url = qs ? `/api/admin/leaves?${qs}` : "/api/admin/leaves";

      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Failed to fetch admin leaves"));
      }

      return data.data;
    } catch (err) {
      throw new Error(err.message || "Network error fetching admin leaves");
    }
  }

  static async adminReviewLeave(leaveId, action, adminRemarks = "") {
    try {
      const res = await fetch("/api/admin/leaves", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveId, action, adminRemarks }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(data, `Failed to ${action.toLowerCase()} leave`));
      }

      return data.data;
    } catch (err) {
      throw new Error(err.message || `Network error reviewing leave`);
    }
  }
}

export default LeaveFrontendService;
