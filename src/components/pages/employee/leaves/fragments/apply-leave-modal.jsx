"use client";

import { useState } from "react";
import {
  CalendarDays,
  X,
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

export function ApplyLeaveModal({
  isOpen,
  onClose,
  quota,
  onSubmit,
  isSubmitting,
}) {
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState("FIRST_HALF");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleStartDateChange = (val) => {
    setStartDate(val);
    if (!endDate || endDate < val || isHalfDay) {
      setEndDate(val);
    }
  };

  const handleToggleHalfDay = (value) => {
    setIsHalfDay(value);
    if (value && startDate) {
      setEndDate(startDate);
    }
  };

  let calculatedDays = 1;
  if (isHalfDay) {
    calculatedDays = 0.5;
  } else if (startDate && endDate) {
    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end >= start) {
      const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      calculatedDays = diffDays;
    }
  }

  const availableBalance = quota?.availableBalance ?? 2;
  const isOverQuota = leaveType === "Casual Leave" && calculatedDays > availableBalance;
  const remainingAfter = Math.max(0, Number((availableBalance - calculatedDays).toFixed(1)));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate) return;

    const dayType = isHalfDay ? halfDaySession : "FULL_DAY";
    const finalEndDate = isHalfDay ? startDate : endDate || startDate;

    onSubmit({
      startDate,
      endDate: finalEndDate,
      dayType,
      reason: reason.trim(),
      type: leaveType,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-all">
      <div
        className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[82vh] mb-16 sm:mb-0 animate-in slide-in-from-bottom duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Drag Indicator */}
        <div className="flex sm:hidden justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Compact Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-border/80 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CalendarDays className="size-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                Apply for Leave
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Monthly Balance: <strong className="text-foreground font-semibold">{availableBalance}d</strong> remaining
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          {/* Leave Type Selector (Casual Leave vs Loss of Pay) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Leave Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLeaveType("Casual Leave")}
                className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  leaveType === "Casual Leave"
                    ? "bg-blue-500/10 border-blue-500 shadow-2xs ring-1 ring-blue-500/40"
                    : "bg-muted/30 border-border/70 hover:border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-blue-500 shrink-0" />
                    <span className="text-xs font-bold text-foreground">Casual Leave</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300">
                    Paid
                  </span>
                </div>
                <p className="text-[10.5px] text-muted-foreground mt-1.5 leading-tight">
                  From monthly quota ({availableBalance}d left)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLeaveType("Loss of Pay")}
                className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  leaveType === "Loss of Pay"
                    ? "bg-rose-500/10 border-rose-500 shadow-2xs ring-1 ring-rose-500/40"
                    : "bg-muted/30 border-border/70 hover:border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-xs font-bold text-foreground">Loss of Pay</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300">
                    Unpaid
                  </span>
                </div>
                <p className="text-[10.5px] text-muted-foreground mt-1.5 leading-tight">
                  Salary deduction, quota unaffected
                </p>
              </button>
            </div>
          </div>

          {/* Duration Toggle (Full Day vs Half Day) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Duration
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-md bg-muted/50 border border-border/60">
              <button
                type="button"
                onClick={() => handleToggleHalfDay(false)}
                className={`py-2 px-3 rounded-md text-xs font-bold transition-all text-center ${
                  !isHalfDay
                    ? "bg-card text-foreground shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Full Day
              </button>
              <button
                type="button"
                onClick={() => handleToggleHalfDay(true)}
                className={`py-2 px-3 rounded-md text-xs font-bold transition-all text-center ${
                  isHalfDay
                    ? "bg-card text-foreground shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Half Day (0.5d)
              </button>
            </div>

            {/* Half Day Session Picker */}
            {isHalfDay && (
              <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in duration-150">
                <button
                  type="button"
                  onClick={() => setHalfDaySession("FIRST_HALF")}
                  className={`py-2 px-2.5 rounded-md text-[11px] font-semibold border transition-all ${
                    halfDaySession === "FIRST_HALF"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Morning (1st Half)
                </button>
                <button
                  type="button"
                  onClick={() => setHalfDaySession("SECOND_HALF")}
                  className={`py-2 px-2.5 rounded-md text-[11px] font-semibold border transition-all ${
                    halfDaySession === "SECOND_HALF"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Afternoon (2nd Half)
                </button>
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {isHalfDay ? "Select Date" : "Date Range"}
            </label>

            {isHalfDay ? (
              <div>
                <DatePicker
                  value={startDate}
                  onChange={(val) => handleStartDateChange(val || "")}
                  placeholder="Select Date"
                  className="w-full h-10 rounded-md border-border bg-background"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-1">From Date</span>
                  <DatePicker
                    value={startDate}
                    onChange={(val) => handleStartDateChange(val || "")}
                    placeholder="From Date"
                    className="w-full h-10 rounded-md border-border bg-background"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-1">To Date</span>
                  <DatePicker
                    value={endDate}
                    onChange={(val) => setEndDate(val || "")}
                    placeholder="To Date"
                    className="w-full h-10 rounded-md border-border bg-background"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Reason for Leave *</span>
              <span className="text-[10px] text-muted-foreground font-normal lowercase">required</span>
            </label>

            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain the reason for your leave request..."
              required
              className="w-full px-3 py-2.5 rounded-md border border-border bg-background text-xs focus:ring-1 focus:ring-primary resize-none placeholder:text-muted-foreground/60 leading-relaxed"
            />
          </div>

          {/* Live Impact Preview */}
          {startDate && (
            <div
              className={`p-2.5 rounded-md border flex items-center justify-between text-xs ${
                isOverQuota
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
                  : leaveType === "Loss of Pay"
                  ? "bg-rose-500/5 border-rose-500/20 text-foreground"
                  : "bg-muted/30 border-border text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                {isOverQuota ? (
                  <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                ) : (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="font-semibold text-[11px]">
                  {calculatedDays} Day(s) {leaveType === "Loss of Pay" ? "Unpaid (LOP)" : "Requested"}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {isOverQuota
                  ? `Exceeds quota (${availableBalance}d left). Switch to Loss of Pay?`
                  : leaveType === "Loss of Pay"
                  ? "Casual quota unaffected"
                  : `${remainingAfter}d left after approval`}
              </span>
            </div>
          )}

          {/* Bottom Actions - 50-50% width, rounded-md, slightly increased height */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-md border border-border text-xs sm:text-sm font-semibold text-muted-foreground hover:bg-muted/50 transition-all flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !startDate || !reason.trim() || isOverQuota}
              className="flex-1 h-11 rounded-md bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplyLeaveModal;
