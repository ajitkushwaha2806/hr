"use client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getSubscriptionInfo } from "@/lib/subscription";
import { Sparkles, AlertTriangle, CheckCircle2, CreditCard } from "lucide-react";

export default function CurrentSubscriptionCard({ restaurant }) {
  if (!restaurant) return null;

  const sub = getSubscriptionInfo(restaurant);
  const rawSub = restaurant.subscription || {};

  const planName =
    rawSub.plan === "trial"
      ? "Free Trial Plan"
      : rawSub.plan === "plan_monthly" || rawSub.plan === "1-month" || rawSub.plan === "monthly"
      ? "Monthly Plan"
      : rawSub.plan === "plan_quarterly" || rawSub.plan === "3-month" || rawSub.plan === "quarterly"
      ? "Quarterly Plan"
      : rawSub.plan === "plan_yearly" || rawSub.plan === "1-year" || rawSub.plan === "yearly"
      ? "Annual Plan"
      : rawSub.plan ? `${rawSub.plan.toUpperCase()} Plan` : "Trial";

  const startDateFormatted = rawSub.startDate
    ? format(new Date(rawSub.startDate), "MMM dd, yyyy")
    : "N/A";
  const endDateFormatted = rawSub.endDate
    ? format(new Date(rawSub.endDate), "MMM dd, yyyy")
    : "N/A";

  const progressPercent = Math.min(100, Math.max(0, 100 - (sub.remainingPercent || 0)));

  return (
    <div
      className={cn(
        "rounded-2xl p-5 sm:p-6 border transition-all mb-8",
        sub.isExpired
          ? "bg-red-500/5 border-red-500/25 text-red-950 dark:text-red-200"
          : sub.daysLeft <= 3
          ? "bg-amber-500/5 border-amber-500/25 text-amber-950 dark:text-amber-200"
          : "bg-white dark:bg-zinc-900 border-neutral-200 dark:border-zinc-800 shadow-sm"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "size-10 rounded-xl flex items-center justify-center shrink-0",
              sub.isExpired
                ? "bg-red-500/15 text-red-600"
                : "bg-primary/10 text-primary"
            )}
          >
            {sub.isExpired ? (
              <AlertTriangle className="size-5" />
            ) : (
              <Sparkles className="size-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-white">
                {planName}
              </h3>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider",
                  sub.isExpired
                    ? "bg-red-600 text-white"
                    : sub.daysLeft <= 3
                    ? "bg-amber-500 text-white"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                )}
              >
                {sub.isExpired
                  ? "Expired"
                  : sub.daysLeft <= 3
                  ? "Expiring Soon"
                  : "Active"}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Restaurant: <strong className="text-neutral-700 dark:text-neutral-300">{restaurant.name}</strong>
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide block">
            {sub.isExpired ? "Account Deletion Status" : "Time Remaining"}
          </span>
          <span
            className={cn(
              "text-lg sm:text-xl font-black",
              sub.isExpired
                ? "text-red-600"
                : sub.daysLeft <= 3
                ? "text-amber-600"
                : "text-neutral-900 dark:text-white"
            )}
          >
            {sub.isExpired
              ? sub.deletionDaysLeft > 0
                ? `Data will be deleted in ${sub.deletionDaysLeft} ${sub.deletionDaysLeft === 1 ? "day" : "days"}`
                : "Account Closed"
              : `${sub.daysLeft} ${sub.daysLeft === 1 ? "day" : "days"} left`}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-neutral-400 block text-[11px] font-semibold uppercase">
            Started On
          </span>
          <span className="font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 block">
            {startDateFormatted}
          </span>
        </div>
        <div>
          <span className="text-neutral-400 block text-[11px] font-semibold uppercase">
            Valid Until
          </span>
          <span className="font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 block">
            {endDateFormatted}
          </span>
        </div>
        <div>
          <span className="text-neutral-400 block text-[11px] font-semibold uppercase">
            Ordering Status
          </span>
          <span
            className={cn(
              "font-bold mt-0.5 inline-flex items-center gap-1",
              sub.isOrderingAllowed
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {sub.isOrderingAllowed ? (
              <>
                <CheckCircle2 className="size-3.5" />
                Live & Enabled
              </>
            ) : (
              <>
                <AlertTriangle className="size-3.5" />
                Paused (Renew to resume)
              </>
            )}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="w-full bg-neutral-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              sub.isExpired
                ? "bg-red-500"
                : sub.daysLeft <= 3
                ? "bg-amber-500"
                : "bg-primary"
            )}
            style={{ width: `${sub.isExpired ? 100 : progressPercent}%` }}
          />
        </div>
      </div>

      {rawSub.lastPayment?.orderId && (
        <div className="mt-3.5 pt-3 border-t border-neutral-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1">
            <CreditCard className="size-3.5" />
            Last Payment: ₹{rawSub.lastPayment.amount} via Razorpay
          </span>
          {rawSub.lastPayment.paidAt && (
            <span>{format(new Date(rawSub.lastPayment.paidAt), "MMM dd, yyyy")}</span>
          )}
        </div>
      )}
    </div>
  );
}
