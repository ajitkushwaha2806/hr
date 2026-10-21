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
      <SidebarHeader className="p-2 pb-1.5 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center">
        <Link href="/" className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
          <Image
            src="/assets/logo/logo-2.png"
            alt="trueHr"
            width={1000}
            height={400}
            className="w-full h-auto rounded-xl object-contain shadow-xs group-data-[collapsible=icon]:hidden hover:opacity-95 transition-opacity"
            priority
          />
          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center p-0.5">
            <Image
              src="/assets/logo/logo-mark.png"
              alt="trueHr"
              width={32}
              height={32}
              className="size-8 object-contain"
            />
          </div>
        </Link>
      </SidebarHeader>

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
