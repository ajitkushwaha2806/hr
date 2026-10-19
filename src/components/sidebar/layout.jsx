"use client";
import Link from "next/link";
import { AppSidebar } from "./index";
import { MobileNav } from "./mobile-nav";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "../global/breadcrumb";
import { getSubscriptionInfo } from "@/lib/subscription";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { ExternalLink, AlertTriangle, Clock } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const HIDE_SIDEBAR_ROUTES = [
  "/restaurant/onboarding",
  "/sign-in",
  "/sign-up",
];

export function SidebarLayout({ children }) {
  const pathname = usePathname();
  const shouldHideSidebar = HIDE_SIDEBAR_ROUTES.some(route => pathname?.startsWith(route));
  const { restaurantId, restaurants } = useRestaurant();
  const activeRestaurant = restaurants?.find(r => r._id === restaurantId);
  const storefrontUrl = activeRestaurant?.slug ? `https://${activeRestaurant.slug}.getrepeat.in` : null;

  const sub = activeRestaurant ? getSubscriptionInfo(activeRestaurant) : null;

  if (shouldHideSidebar) {
    return (
      <div className="min-h-screen w-full bg-gray-50/30 dark:bg-zinc-950 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto min-w-0">
          {children}
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/30 dark:bg-zinc-950 relative">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 px-4 sm:px-6 bg-white dark:bg-zinc-900 transition-[width,height] ease-linear min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <SidebarTrigger className="-ml-1 sm:-ml-2 shrink-0" />
            <div className="h-4 w-px bg-border/60 mx-1 sm:mx-2 shrink-0" />
            <div className="min-w-0 truncate">
              <Breadcrumbs />
            </div>
          </div>

          {storefrontUrl && (
            <a 
              href={storefrontUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] font-semibold text-primary/90 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-md transition-colors shrink-0 ml-4"
            >
              Visit Website
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </header>

        {sub?.isExpired ? (
          <div className="bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 text-xs font-medium flex items-center justify-between gap-2.5 shadow-xs shrink-0 border-b border-red-700 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="p-1 rounded bg-white/20 text-white shrink-0 flex items-center justify-center">
                <AlertTriangle className="h-3.5 w-3.5 animate-pulse text-white" />
              </span>
              <p className="line-clamp-2 text-[11px] sm:text-xs leading-tight min-w-0">
                <span className="font-bold">Subscription Expired:</span> Online ordering paused. {sub.deletionDaysLeft > 0 ? (
                  <>
                    Data will be deleted in{" "}
                    <span className="font-extrabold underline decoration-white/70">
                      {sub.deletionDaysLeft} {sub.deletionDaysLeft === 1 ? "day" : "days"}
                    </span>{" "}
                    unless renewed.
                  </>
                ) : (
                  <>Grace period has expired. Account closed and data scheduled for deletion.</>
                )}
              </p>
            </div>
            <Link
              href="/pricing"
              className="px-2.5 py-1.5 bg-white text-red-600 hover:bg-red-50 rounded-md font-bold text-[11px] sm:text-xs shrink-0 transition-colors shadow-2xs whitespace-nowrap ml-1"
            >
              Renew
            </Link>
          </div>
        ) : sub?.plan === "trial" ? (
          <div className="bg-primary/10 border-b border-primary/20 text-neutral-900 dark:text-zinc-100 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-medium flex items-center justify-between gap-2.5 shrink-0 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
              <p className="line-clamp-2 text-[11px] sm:text-xs leading-tight min-w-0 text-neutral-800 dark:text-zinc-200">
                <span className="font-bold text-primary">Free Trial is going on:</span> {sub.daysLeft} {sub.daysLeft === 1 ? "day" : "days"} remaining. Renew now to enjoy uninterrupted online ordering.
              </p>
            </div>
            <Link
              href="/pricing"
              className="px-2.5 py-1 bg-primary hover:bg-[#e0614c] text-white rounded-md font-bold text-[11px] sm:text-xs shrink-0 transition-colors whitespace-nowrap ml-1 shadow-2xs"
            >
              Renew
            </Link>
          </div>
        ) : sub && sub.daysLeft <= 3 ? (
          <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-medium flex items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="line-clamp-2 text-[11px] sm:text-xs leading-tight min-w-0">
                Subscription ends in <strong>{sub.daysLeft} days</strong>. Renew to avoid ordering pause.
              </p>
            </div>
            <Link
              href="/pricing"
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-bold text-[11px] sm:text-xs shrink-0 transition-colors whitespace-nowrap ml-1"
            >
              Renew
            </Link>
          </div>
        ) : null}
        
        <div className="flex-1 overflow-auto min-w-0 pb-[68px] sm:pb-0">
          {children}
        </div>
        <MobileNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
