"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import useNotification from "@/store/hooks/useNotification";
import { LeaveFrontendService } from "@/services/frontend/leave";
import { CalendarDays, CheckCircle2, XCircle, Clock, Search, Check, X, RefreshCw } from "lucide-react";

export default function AdminLeavesPage() {
  const notify = useNotification();
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);

  const fetchLeaves = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const res = await LeaveFrontendService.adminGetLeaves();
      if (res) {
        setRequests(res.leaves || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      notify.error(err.message || "Failed to load leave requests");
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    let isSubscribed = true;
    LeaveFrontendService.adminGetLeaves()
      .then((res) => {
        if (isSubscribed && res) {
          setRequests(res.leaves || []);
          if (res.stats) setStats(res.stats);
        }
      })
      .catch((err) => {
        if (isSubscribed) notify.error(err.message || "Failed to load leave requests");
      })
      .finally(() => {
        if (isSubscribed) setIsLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [notify]);

  const handleApprove = async (id) => {
    try {
      setReviewingId(id);
      await LeaveFrontendService.adminReviewLeave(id, "APPROVE", "Approved by Admin");
      notify.success("Leave request approved successfully!");
      await fetchLeaves();
    } catch (err) {
      notify.error(err.message || "Failed to approve leave");
    } finally {
      setReviewingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Enter rejection reason (optional):") ?? "";
    try {
      setReviewingId(id);
      await LeaveFrontendService.adminReviewLeave(id, "REJECT", reason);
      notify.error("Leave request marked as rejected.");
      await fetchLeaves();
    } catch (err) {
      notify.error(err.message || "Failed to reject leave");
    } finally {
      setReviewingId(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const name = r.employeeName || "";
    const dept = r.department || "";
    const type = r.type || "";
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === "pending") return r.status === "PENDING";
    if (filterStatus === "approved") return r.status === "APPROVED";
    if (filterStatus === "rejected") return r.status === "REJECTED";
    return true;
  });

  const pendingCount = stats.pending ?? requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 p-3 sm:p-5 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Leave Management & Approvals
            </h1>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                <Clock className="w-3 h-3" /> {pendingCount} Pending Action
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Review and take action on employee time-off and monthly casual leave requests.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLeaves}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-muted-foreground transition-all shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-semibold">Total Requests</span>
            <CalendarDays className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">{stats.total ?? requests.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">All time records</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-semibold">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{pendingCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting decision</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-semibold">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {stats.approved ?? requests.filter((r) => r.status === "APPROVED").length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Granted time-off</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-semibold">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            {stats.rejected ?? requests.filter((r) => r.status === "REJECTED").length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Declined requests</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-3 rounded-xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by employee name or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-lg"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <Button
            variant={filterStatus === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterStatus("all")}
            className="h-8 text-xs rounded-lg shrink-0"
          >
            All ({requests.length})
          </Button>
          <Button
            variant={filterStatus === "pending" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterStatus("pending")}
            className="h-8 text-xs rounded-lg text-amber-600 dark:text-amber-400 shrink-0"
          >
            Pending ({pendingCount})
          </Button>
          <Button
            variant={filterStatus === "approved" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterStatus("approved")}
            className="h-8 text-xs rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0"
          >
            Approved
          </Button>
          <Button
            variant={filterStatus === "rejected" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterStatus("rejected")}
            className="h-8 text-xs rounded-lg text-rose-600 dark:text-rose-400 shrink-0"
          >
            Rejected
          </Button>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5 pl-4">Employee</th>
                <th className="p-3.5">Leave Type</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Dates</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Loading leave requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No leave requests found matching filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const reqId = req._id || req.id;
                  const isProcessing = reviewingId === reqId;

                  return (
                    <tr key={reqId} className="hover:bg-muted/20 transition-colors">
                      {/* Employee */}
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {req.employeeName ? req.employeeName.charAt(0).toUpperCase() : "E"}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{req.employeeName || "Employee"}</p>
                            <p className="text-[11px] text-muted-foreground">{req.department || req.employeeEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Leave Type */}
                      <td className="p-3.5 whitespace-nowrap font-medium text-foreground">
                        {req.type || "Casual Leave"}
                      </td>

                      {/* Duration */}
                      <td className="p-3.5 whitespace-nowrap font-medium text-foreground">
                        {req.daysCount || req.days || 1} {((req.daysCount || req.days) === 1 ? "day" : "days")}
                        {(req.dayType === "FIRST_HALF" || req.dayType === "SECOND_HALF") && " (Half Day)"}
                      </td>

                      {/* Dates */}
                      <td className="p-3.5 whitespace-nowrap text-muted-foreground">
                        {req.startDate} {req.startDate !== req.endDate ? `to ${req.endDate}` : ""}
                      </td>

                      {/* Reason */}
                      <td className="p-3.5 max-w-xs truncate text-muted-foreground" title={req.reason}>
                        {req.reason}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        {req.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {req.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {req.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                        {req.status === "CANCELLED" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-500/20">
                            Cancelled
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                        {req.status === "PENDING" ? (
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleApprove(reqId)}
                              className="h-7 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium cursor-pointer shadow-2xs"
                            >
                              <Check className="w-3 h-3 mr-1" /> Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleReject(reqId)}
                              className="h-7 px-2.5 rounded-md border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-[11px] font-medium cursor-pointer shadow-2xs"
                            >
                              <X className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Action completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
