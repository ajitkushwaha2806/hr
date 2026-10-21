"use client";

import { useEffect } from "react";
import { AppSidebar } from "./index";
import { MobileNav } from "./mobile-nav";
import Loader from "@/components/global/loader";
import { Breadcrumbs } from "../global/breadcrumb";
import { OrganizationSwitcher } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useOnboarding } from "@/store/hooks/useOnboarding";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const HIDE_SIDEBAR_ROUTES = [
  "/sign-in",
  "/sign-up",
  "/onboarding",
  "/employee/onboarding",
];

export function SidebarLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isOnboarded, isLoading, isAdmin } = useOnboarding();

  const isAuthRoute = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");
  const shouldHideSidebar = HIDE_SIDEBAR_ROUTES.some((route) => pathname?.startsWith(route));

  // Centralized Professional-Grade Role & Auth Routing:
  // - Admin is ALWAYS migrated to Admin Portal (/admin/...)
  // - Employee is ALWAYS routed to Employee Portal (/employee/...) or /employee/onboarding (if pending)
  useEffect(() => {
    if (isLoading || isAuthRoute) return;

    if (isAdmin) {
      if (!pathname?.startsWith("/admin")) {
        router.replace("/admin/dashboard");
      }
    } else {
      if (pathname?.startsWith("/admin")) {
        router.replace(isOnboarded ? "/employee/dashboard" : "/employee/onboarding");
      } else if (!isOnboarded) {
        if (pathname !== "/employee/onboarding" && pathname !== "/onboarding") {
          router.replace("/employee/onboarding");
        }
      } else {
        if (
          pathname === "/" ||
          pathname === "/dashboard" ||
          pathname === "/onboarding" ||
          pathname === "/employee/onboarding"
        ) {
          router.replace("/employee/dashboard");
        }
      }
    }
  }, [isLoading, isAuthRoute, isAdmin, isOnboarded, pathname, router]);

  // Loading / Transition Guard
  if (!isAuthRoute) {
    if (isLoading) {
      return <Loader fullscreen />;
    }

    if (isAdmin && !pathname?.startsWith("/admin")) {
      return <Loader fullscreen />;
    }

    if (!isAdmin && !isOnboarded && pathname !== "/employee/onboarding" && pathname !== "/onboarding") {
      return <Loader fullscreen />;
    }

    if (
      !isAdmin &&
      isOnboarded &&
      (pathname === "/" ||
        pathname === "/dashboard" ||
        pathname === "/onboarding" ||
        pathname === "/employee/onboarding" ||
        pathname?.startsWith("/admin"))
    ) {
      return <Loader fullscreen />;
    }
  }

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
        <header className="flex h-13 shrink-0 items-center justify-between border-b border-border/40 px-3 sm:px-4 bg-white dark:bg-zinc-900 transition-[width,height] ease-linear min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <SidebarTrigger className="-ml-1 shrink-0" />
            <div className="h-3.5 w-px bg-border/60 mx-1 shrink-0" />
            <div className="min-w-0 truncate">
              <Breadcrumbs />
            </div>

            <div className="hidden sm:flex items-center gap-2 pl-1.5">
              <div className="h-3.5 w-px bg-border/60 shrink-0" />
              <div className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-all cursor-help">
                <span className="size-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                <span className="font-bold tracking-tight">Phase 2:</span>
                <span className="truncate max-w-[120px] md:max-w-none text-foreground/90 font-medium">
                  Employee Onboarding
                </span>

                <div className="absolute left-0 top-full mt-2 hidden group-hover:flex flex-col z-50 w-72 p-3 rounded-xl bg-popover/95 backdrop-blur-xl border border-border/60 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 text-xs text-foreground animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-border/40">
                    <span className="font-bold text-primary flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-primary" /> Phase 2
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      In Progress
                    </span>
                  </div>
                  <p className="font-semibold text-xs text-foreground">Employee Onboarding</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    Multi-step onboarding wizard, personal &amp; employment profile setup, emergency contact capture, and profile persistence.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <OrganizationSwitcher
              hidePersonal={false}
              afterCreateOrganizationUrl="/dashboard"
              afterSelectOrganizationUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "flex items-center text-xs",
                },
              }}
            />
          </div>
        </header>

        <div className="flex-1 overflow-auto min-w-0 pb-[68px] sm:pb-0">
          {children}
        </div>
        <MobileNav />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default SidebarLayout;
