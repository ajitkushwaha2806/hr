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
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <OrganizationSwitcher
              hidePersonal={false}
              afterCreateOrganizationUrl="/"
              afterSelectOrganizationUrl="/"
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
