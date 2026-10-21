"use client";

import { useState } from "react";
import { CalendarDays, Plus, Clock, CheckCircle2, XCircle, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function EmployeeLeavesPage() {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [leavesList, setLeavesList] = useState([
    {
      id: "leave-1",
      type: "Casual Leave",
      startDate: "2026-10-14",
      endDate: "2026-10-15",
      days: 2,
      reason: "Personal family commitment",
      status: "APPROVED",
      appliedAt: "2026-10-10",
    },
    {
      id: "leave-2",
      type: "Sick Leave",
      startDate: "2026-09-22",
      endDate: "2026-09-22",
      days: 1,
      reason: "Viral fever and doctor consultation",
      status: "APPROVED",
      appliedAt: "2026-09-21",
    },
  ]);

  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      toast.error("Please fill in all required leave details");
      return;
    }

    const newLeave = {
      id: `leave-${Date.now()}`,
      type: leaveType,
      startDate,
      endDate,
      days: 1,
      reason,
      status: "PENDING",
      appliedAt: new Date().toISOString().split("T")[0],
    };

    setLeavesList([newLeave, ...leavesList]);
    setIsApplyModalOpen(false);
    setReason("");
    setStartDate("");
    setEndDate("");
    toast.success("Leave request submitted for manager approval!");
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 p-3 sm:p-5 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Leave Management
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
              <Sparkles className="w-3 h-3" /> Self-Service
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            View available leave balance, submit vacation or sick leave requests, and track status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsApplyModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {/* Leave Balances Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Casual Leave (CL)
            </span>
            <span className="size-2 rounded-full bg-blue-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-extrabold tracking-tight text-foreground">10</p>
            <span className="text-xs text-muted-foreground font-medium">/ 12 days remaining</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted mt-3 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: "83%" }} />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Sick Leave (SL)
            </span>
            <span className="size-2 rounded-full bg-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-extrabold tracking-tight text-foreground">7</p>
            <span className="text-xs text-muted-foreground font-medium">/ 8 days remaining</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted mt-3 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: "87%" }} />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Paid / Earned Leave (PL)
            </span>
            <span className="size-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-extrabold tracking-tight text-foreground">15</p>
            <span className="text-xs text-muted-foreground font-medium">/ 15 days remaining</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
          </div>
        </div>
      </div>

      {/* Leave Requests History Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm text-foreground">My Leave Requests</h2>
          </div>
          <span className="text-xs text-muted-foreground">{leavesList.length} total records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Leave Type</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Dates</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Applied On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leavesList.map((req) => (
                <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-foreground">{req.type}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{req.days} Day(s)</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {req.startDate} &rarr; {req.endDate}
                  </td>
                  <td className="px-5 py-3.5 text-foreground max-w-xs truncate">{req.reason}</td>
                  <td className="px-5 py-3.5">
                    {req.status === "APPROVED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    )}
                    {req.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Clock className="w-3 h-3" /> Pending Review
                      </span>
                    )}
                    {req.status === "REJECTED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right text-muted-foreground">{req.appliedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-base text-foreground">Apply for Leave</h3>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Leave Type *</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-medium focus:ring-1 focus:ring-primary"
                >
                  <option value="Casual Leave">Casual Leave (10 days left)</option>
                  <option value="Sick Leave">Sick Leave (7 days left)</option>
                  <option value="Paid Leave">Paid / Vacation Leave (15 days left)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">From Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">To Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Reason for Absence *</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Brief explanation for your manager..."
                  required
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
