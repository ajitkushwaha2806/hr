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
  const [activeTab, setActiveTab] = useState("all"); // "all", "pending", "approved", "rejected"
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
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 pb-20">
      <div className="max-w-2xl lg:max-w-4xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6 space-y-3.5 sm:space-y-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-3 sm:space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground whitespace-nowrap">
                  Casual Leaves
                </h1>
                
                <div className="flex justify-center items-center gap-2"><button
                type="button"
                onClick={() => fetchLeaves(true)}
                disabled={isLoading}
                title="Refresh leave balance"
                className="size-9 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground flex items-center justify-center transition-all shadow-2xs shrink-0 active:scale-95"
              >
                <RefreshCw
                  className={`size-3.5 ${isLoading ? "animate-spin text-primary" : ""}`}
                />
              </button>
                <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs transition-all active:scale-95 whitespace-nowrap"
                >
                  <Plus className="size-4" />
                  <span>Request Leave</span>
                </button></div>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentMonthDisplay} • Self-Service Portal
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/60 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === "all"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>All</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-semibold">
              {leaves.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`flex-1 min-w-[85px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === "pending"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-xs border border-amber-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Pending</span>
            {pendingCount > 0 && (
              <span className="size-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("approved")}
            className={`flex-1 min-w-[85px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === "approved"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs border border-emerald-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Approved</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-semibold">
              {approvedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rejected")}
            className={`flex-1 min-w-[85px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === "rejected"
                ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 shadow-xs border border-rose-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Rejected</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-semibold">
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
                  className="w-full h-32 rounded-2xl bg-card/60 border border-border/60 animate-pulse"
                />
              ))}
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="w-full py-12 px-4 rounded-2xl border border-dashed border-border/80 bg-card/50 text-center space-y-3">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <CalendarDays className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">No leave requests found</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  {activeTab === "all"
                    ? "You haven't requested any casual leaves yet. Apply whenever you need time off."
                    : `No ${activeTab} leave applications in your account.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all"
              >
                <Plus className="size-3.5" />
                Apply for Casual Leave
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
                        <span className="size-2 rounded-full bg-primary" />
                        <span className="text-xs font-bold text-foreground">
                          {req.type || "Casual Leave"}
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
