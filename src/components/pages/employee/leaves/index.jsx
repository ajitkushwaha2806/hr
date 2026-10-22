"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calendar,
  UserCheck,
  Trash2,
} from "lucide-react";
import useNotification from "@/store/hooks/useNotification";
import { LeaveFrontendService } from "@/services/frontend/leave";
import ApplyLeaveModal from "./fragments/apply-leave-modal";

export function EmployeeLeavesView() {
  const notify = useNotification();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); 
  const [cancellingId, setCancellingId] = useState(null);

  const fetchLeaves = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true);
        const res = await LeaveFrontendService.getMyLeaves();
        setData(res);
      } catch (err) {
        notify.error(err.message || "Failed to load leaves");
      } finally {
        setIsLoading(false);
      }
    },
    [notify]
  );

  useEffect(() => {
    let isSubscribed = true;
    LeaveFrontendService.getMyLeaves()
      .then((res) => {
        if (isSubscribed && res) setData(res);
      })
      .catch((err) => {
        if (isSubscribed) notify.error(err.message || "Failed to load leaves");
      })
      .finally(() => {
        if (isSubscribed) setIsLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [notify]);

  const handleApplyLeave = async (payload) => {
    try {
      setIsSubmitting(true);
      await LeaveFrontendService.applyLeave(payload);
      notify.success("Leave request submitted! Awaiting admin approval.");
      setIsApplyModalOpen(false);
      await fetchLeaves(false);
    } catch (err) {
      notify.error(err.message || "Failed to apply for leave");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm("Are you sure you want to cancel this pending leave request?")) {
      return;
    }

    try {
      setCancellingId(leaveId);
      await LeaveFrontendService.cancelLeave(leaveId);
      notify.success("Leave request cancelled successfully");
      await fetchLeaves(false);
    } catch (err) {
      notify.error(err.message || "Failed to cancel leave");
    } finally {
      setCancellingId(null);
    }
  };

  const quota = data?.quota || {
    monthlyQuota: 2,
    usedThisMonth: 0,
    pendingThisMonth: 0,
    availableBalance: 2,
    month: "2026-10",
  };

  const leaves = data?.leaves || [];

  const filteredLeaves = leaves.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return item.status === "PENDING";
    if (activeTab === "approved") return item.status === "APPROVED";
    if (activeTab === "rejected") return item.status === "REJECTED";
    return true;
  });

  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;
  const approvedCount = leaves.filter((l) => l.status === "APPROVED").length;
  const rejectedCount = leaves.filter((l) => l.status === "REJECTED").length;

  const currentMonthDisplay = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 pb-28 sm:pb-16">
      <div className="w-full px-3.5 sm:px-6 lg:px-8 pt-3 sm:pt-6 space-y-4 sm:space-y-5">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Casual Leaves
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Self-Service
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {currentMonthDisplay} • Request and track your time off
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchLeaves(true)}
              disabled={isLoading}
              title="Refresh leave balance"
              className="size-9 rounded-xl border border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all shadow-2xs shrink-0 active:scale-95 cursor-pointer"
            >
              <RefreshCw
                className={`size-3.5 ${isLoading ? "animate-spin text-primary" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              <span>Request Leave</span>
            </button>
          </div>
        </div>

        {/* Quota KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border/70 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">Available</span>
              <div className="size-6 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="size-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">
                {quota.availableBalance} <span className="text-xs font-semibold text-muted-foreground">Days</span>
              </div>
              <p className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                Ready to Use
              </p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border/70 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">Used this Month</span>
              <div className="size-6 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CalendarDays className="size-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">
                {quota.usedThisMonth} <span className="text-xs font-semibold text-muted-foreground">Days</span>
              </div>
              <p className="text-[10.5px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                {quota.lopThisMonth > 0 ? `+ ${quota.lopThisMonth}d LOP` : "Casual Leaves"}
              </p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border/70 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">In Review</span>
              <div className="size-6 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="size-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">
                {pendingCount} <span className="text-xs font-semibold text-muted-foreground">Reqs</span>
              </div>
              <p className="text-[10.5px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                {pendingCount > 0 ? "Awaiting Review" : "None Pending"}
              </p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border/70 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">Monthly Quota</span>
              <div className="size-6 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Calendar className="size-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">
                {quota.monthlyQuota} <span className="text-xs font-semibold text-muted-foreground">Days</span>
              </div>
              <p className="text-[10.5px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                Per Month
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-muted/60 border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`py-1.5 px-1 sm:px-3 rounded-lg text-xs font-semibold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "all"
                ? "bg-card text-foreground shadow-2xs border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>All</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-bold">
              {leaves.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`py-1.5 px-1 sm:px-3 rounded-lg text-xs font-semibold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "pending"
                ? "bg-amber-500/15 text-amber-800 dark:text-amber-200 shadow-2xs border border-amber-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Pending</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              pendingCount > 0 ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"
            }`}>
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("approved")}
            className={`py-1.5 px-1 sm:px-3 rounded-lg text-xs font-semibold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "approved"
                ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 shadow-2xs border border-emerald-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Approved</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              approvedCount > 0 ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"
            }`}>
              {approvedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rejected")}
            className={`py-1.5 px-1 sm:px-3 rounded-lg text-xs font-semibold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "rejected"
                ? "bg-rose-500/15 text-rose-800 dark:text-rose-200 shadow-2xs border border-rose-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Rejected</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              rejectedCount > 0 ? "bg-rose-500/20 text-rose-700 dark:text-rose-300" : "bg-muted text-muted-foreground"
            }`}>
              {rejectedCount}
            </span>
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {activeTab === "all"
                ? "All Applications"
                : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Requests`}
            </h2>
            <span className="text-xs text-muted-foreground">
              {filteredLeaves.length} record{filteredLeaves.length === 1 ? "" : "s"}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full h-32 rounded-xl bg-card/60 border border-border/60 animate-pulse"
                />
              ))}
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="w-full py-10 sm:py-12 px-4 rounded-xl border border-border/70 bg-card text-center space-y-3.5 shadow-2xs">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto shadow-2xs">
                <CalendarDays className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">No leave requests found</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  {activeTab === "all"
                    ? `You have ${quota.availableBalance} days of casual leaves available for this month. Submit a request whenever you need time off.`
                    : `No ${activeTab} leave applications in your account.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="size-4" strokeWidth={2.5} />
                <span>Apply for Casual Leave</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLeaves.map((req) => {
                const isPending = req.status === "PENDING";
                const isApproved = req.status === "APPROVED";
                const isRejected = req.status === "REJECTED";
                const isCancelled = req.status === "CANCELLED";

                const dayTypeLabel =
                  req.dayType === "FIRST_HALF"
                    ? "Half Day (1st Half)"
                    : req.dayType === "SECOND_HALF"
                    ? "Half Day (2nd Half)"
                    : `${req.daysCount} Day${req.daysCount > 1 ? "s" : ""}`;

                const appliedDateFormatted = req.appliedAt
                  ? new Date(req.appliedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : req.createdAt
                  ? new Date(req.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "";

                return (
                  <div
                    key={req._id || req.id}
                    className="w-full rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs space-y-3 transition-all hover:border-border hover:shadow-xs"
                  >
                    {/* Top Row: Type & Status Badge */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-2 rounded-full shrink-0 ${
                            req.type === "Loss of Pay" ? "bg-rose-500" : "bg-blue-500"
                          }`}
                        />
                        <span className="text-xs font-bold text-foreground">
                          {req.type || "Casual Leave"}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            req.type === "Loss of Pay"
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          }`}
                        >
                          {req.type === "Loss of Pay" ? "Unpaid" : "Paid"}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
                          {dayTypeLabel}
                        </span>
                      </div>

                      {/* Status Badges */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          <Clock className="size-3" />
                          <span>Pending Approval</span>
                        </span>
                      )}

                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          <CheckCircle2 className="size-3" />
                          <span>Approved</span>
                        </span>
                      )}

                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                          <XCircle className="size-3" />
                          <span>Rejected</span>
                        </span>
                      )}

                      {isCancelled && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20">
                          <span>Cancelled</span>
                        </span>
                      )}
                    </div>

                    {/* Middle Row: Date Range Banner */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border/60 text-xs">
                      <Calendar className="size-4 text-primary shrink-0" />
                      <div className="flex-1 font-semibold text-foreground flex items-center gap-2 flex-wrap">
                        <span>{req.startDate}</span>
                        {req.startDate !== req.endDate && (
                          <>
                            <span className="text-muted-foreground">&rarr;</span>
                            <span>{req.endDate}</span>
                          </>
                        )}
                        <span className="text-[11px] font-normal text-muted-foreground">
                          ({req.daysCount} Day{req.daysCount > 1 ? "s" : ""})
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="text-xs text-foreground/90 bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-border/40">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                        Reason
                      </span>
                      <p className="leading-relaxed">{req.reason}</p>
                    </div>

                    {/* Admin remarks if reviewed */}
                    {(req.adminRemarks || req.reviewedBy) && (
                      <div className="text-xs p-2.5 rounded-xl bg-primary/5 border border-primary/15 flex items-start gap-2">
                        <UserCheck className="size-4 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-0.5 text-[11px]">
                          <span className="font-bold text-foreground">
                            {req.reviewedBy ? `Reviewed by ${req.reviewedBy}` : "Admin Review"}
                          </span>
                          {req.adminRemarks && (
                            <p className="text-muted-foreground">{req.adminRemarks}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer Row: Applied Date & Cancel Action */}
                    <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                      <span>Applied on {appliedDateFormatted}</span>

                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handleCancelLeave(req._id || req.id)}
                          disabled={cancellingId === (req._id || req.id)}
                          className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold hover:underline transition-all"
                        >
                          <Trash2 className="size-3" />
                          <span>
                            {cancellingId === (req._id || req.id)
                              ? "Cancelling..."
                              : "Cancel Request"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Apply Leave Modal / Drawer */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        quota={quota}
        onSubmit={handleApplyLeave}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default EmployeeLeavesView;
