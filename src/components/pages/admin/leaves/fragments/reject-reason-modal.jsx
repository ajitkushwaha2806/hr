"use client";
import { useState } from "react";
import { XCircle, X } from "lucide-react";

export default function RejectReasonModal({
  isOpen,
  onClose,
  onConfirm,
  request = null,
  isSubmitting = false,
}) {
  const [remarks, setRemarks] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(remarks);
    setRemarks("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Drawer on mobile, Center modal on desktop */}
      <div className="relative w-full sm:max-w-md bg-card rounded-t-[28px] sm:rounded-2xl border-t sm:border border-border/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom duration-300 sm:slide-in-from-bottom-0 sm:zoom-in-95 ease-out z-10">
        {/* Mobile Drawer Pull Indicator */}
        <div className="flex sm:hidden justify-center pt-2.5 pb-1 bg-muted/40 cursor-grab">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 sm:py-3.5 border-b border-border/60 bg-muted/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20 shadow-2xs">
              <XCircle className="size-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm sm:text-base text-foreground tracking-tight truncate">
                Reject Leave Request
              </h2>
              <p className="text-[11px] text-muted-foreground truncate">
                {request ? `For ${request.employeeName || "employee"}` : "Provide rejection remarks"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0 ml-2"
            title="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3.5 text-xs">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Rejection Reason / Notes (Optional)
              </label>
              <textarea
                rows={4}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Critical project milestone scheduled on this date; please reschedule."
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none shadow-2xs"
                autoFocus
              />
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="p-3.5 sm:p-4 border-t border-border/70 bg-card/95 backdrop-blur-md shrink-0 flex items-center gap-2.5 pb-safe pb-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer text-center"
            >
              <span>{isSubmitting ? "Rejecting..." : "Confirm Rejection"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
