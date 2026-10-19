"use client";
import { AppSidebar } from "./index";
import { MobileNav } from "./mobile-nav";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "../global/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const HIDE_SIDEBAR_ROUTES = [
  "/sign-in",
  "/sign-up",
];

export function SidebarLayout({ children }) {
  const pathname = usePathname();
  const shouldHideSidebar = HIDE_SIDEBAR_ROUTES.some(route => pathname?.startsWith(route));

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
        </header>

        <div className="flex-1 overflow-auto min-w-0 pb-[68px] sm:pb-0">
          {children}
        </div>
        <MobileNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
