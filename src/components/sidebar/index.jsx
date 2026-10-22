"use client";
import Link from "next/link";
import Image from "next/image";
import { NavUser } from "./nav-user";
import { NavMain } from "./nav-main";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ADMIN_SIDEBAR_CONFIG, EMPLOYEE_SIDEBAR_CONFIG } from "@/constants/sidebar";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from "@/components/ui/sidebar";

export function AppSidebar(props) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  const isAdmin = pathname?.startsWith("/admin");
  const activeConfig = isAdmin ? ADMIN_SIDEBAR_CONFIG : EMPLOYEE_SIDEBAR_CONFIG;

  const sidebarConfig = {
    user: {
      avatar: user?.imageUrl || "",
      name: user?.fullName || user?.firstName || "User",
      email: user?.primaryEmailAddress?.emailAddress || "",
    },
  };

  return (
    <Sidebar collapsible="icon" {...props} className="bg-sidebar border-r border-border/40">
      <SidebarHeader className="p-2.5 pb-2 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center">
        <Link
          href="/"
          className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary group/logo"
        >
          {/* Logo with the exact same height and width and rounded-md */}
          <div className="size-10 rounded-md overflow-hidden shrink-0 shadow-2xs border border-primary/20 bg-primary flex items-center justify-center group-hover/logo:scale-105 transition-transform">
            <Image
              src="/assets/icons/logo.png"
              alt="trueHr"
              width={40}
              height={40}
              className="size-full object-cover rounded-md"
              priority
            />
          </div>

          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-base tracking-tight text-foreground leading-none flex items-center">
              true<span className="text-primary">HR</span>
            </span>
            <span className="text-[10px] text-muted-foreground truncate leading-tight mt-1 font-medium">
              Track Attendance. Track Employees.
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="mx-3 my-1 bg-border/40 group-data-[collapsible=icon]:mx-1" />

      <SidebarContent className="px-1.5 py-1 group-data-[collapsible=icon]:px-0">
        <NavMain
          title={activeConfig?.navMain?.title}
          items={activeConfig?.navMain?.items}
        />
      </SidebarContent>

      <SidebarSeparator className="mx-3 my-1.5 bg-border/40 group-data-[collapsible=icon]:mx-1" />
      {isLoaded && (
        <SidebarFooter className="p-3 pt-1.5 group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:items-center flex flex-col gap-2">
          <NavUser
            user={sidebarConfig?.user}
            menuItems={activeConfig?.navUserItems}
          />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
