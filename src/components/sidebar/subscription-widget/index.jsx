"use client";
import Link from "next/link";
import { getSubscriptionInfo } from "@/lib/subscription";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { Clock, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function SidebarSubscriptionWidget() {
  const { restaurantId, restaurants } = useRestaurant();
  const activeRestaurant = restaurants?.find((r) => r._id === restaurantId);

  if (!activeRestaurant) return null;

  const sub = getSubscriptionInfo(activeRestaurant);
  const planLabel = sub.planName || "Subscription";

  if (sub.isExpired) {
    return (
      <TooltipProvider>
        <div className="w-full">
          <div className="group-data-[collapsible=icon]:hidden p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse text-red-600 dark:text-red-400" />
                Subscription Expired
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white uppercase tracking-wider">
                Paused
              </span>
            </div>

            <p className="text-[11px] leading-tight text-red-700/90 dark:text-red-300 font-medium">
              {sub.deletionDaysLeft > 0 ? (
                <>
                  Restaurant data will be deleted in{" "}
                  <span className="font-extrabold underline text-red-800 dark:text-red-200">
                    {sub.deletionDaysLeft} {sub.deletionDaysLeft === 1 ? "day" : "days"}
                  </span>.
                </>
              ) : (
                <>Grace period ended. Account closed.</>
              )}
            </p>

            <Link
              href="/pricing"
              className="mt-0.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Renew Now</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="hidden group-data-[collapsible=icon]:flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/pricing"
                  className="size-8 rounded-lg bg-red-500/15 border border-red-500/40 text-red-600 flex items-center justify-center relative hover:bg-red-500/25 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4 animate-pulse" />
                  <span className="absolute -top-1 -right-1 size-3.5 bg-red-600 text-[9px] font-extrabold text-white rounded-full flex items-center justify-center">
                    {sub.deletionDaysLeft}
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs font-semibold text-red-600">
                  {sub.deletionDaysLeft > 0 ? `Expired: Data deleted in ${sub.deletionDaysLeft}d` : "Account Closed"}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  const isExpiringSoon = sub.daysLeft <= 3;

  return (
    <TooltipProvider>
      <div className="w-full">
        <Link
          href="/pricing"
          className={`group-data-[collapsible=icon]:hidden p-3 rounded-xl border flex flex-col gap-2 transition-all block hover:shadow-xs ${
            isExpiringSoon
              ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300 hover:bg-amber-500/15"
              : "bg-slate-50 dark:bg-zinc-900/60 border-border/60 text-foreground hover:bg-slate-100/70 dark:hover:bg-zinc-800/60"
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-zinc-100 truncate">
              {sub.plan === "trial" ? (
                <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              )}
              <span className="truncate">{planLabel}</span>
            </span>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                isExpiringSoon
                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              }`}
            >
              {sub.daysLeft}d left
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] text-muted-foreground font-medium">
              <span>{isExpiringSoon ? "Expiring soon" : sub.plan === "trial" ? "Trial period" : "Active period"}</span>
              <span className="font-semibold text-foreground">
                {sub.daysLeft} days remaining
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isExpiringSoon ? "bg-amber-500" : "bg-primary"
                }`}
                style={{
                  width: `${sub.remainingPercent}%`,
                }}
              />
            </div>
          </div>
        </Link>
        
        <div className="hidden group-data-[collapsible=icon]:flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/pricing"
                className={`size-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors ${
                  isExpiringSoon
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-600 hover:bg-amber-500/25"
                    : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                }`}
              >
                <span>{sub.daysLeft}d</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs font-medium">
                {planLabel}: {sub.daysLeft} days left (Click to manage)
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
export default SidebarSubscriptionWidget;
