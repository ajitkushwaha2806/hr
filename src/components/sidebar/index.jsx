"use client";
import { NavUser } from "./nav-user";
import { NavMain } from "./nav-main";
import { useUser } from "@clerk/nextjs";
import { APP_SIDEBAR_CONFIG } from "@/constants/sidebar";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from "@/components/ui/sidebar";

export function AppSidebar(props) {
  const { user, isLoaded } = useUser();

  const sidebarConfig = {
    user: {
      avatar: user?.imageUrl || "",
      name: user?.fullName || user?.firstName || "User",
      email: user?.primaryEmailAddress?.emailAddress || "",
    },
  };

  return (
    <Sidebar collapsible="icon" {...props} className="bg-sidebar border-r border-border/40">
      <SidebarHeader className="p-3 pb-2 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center">
        <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-sidebar-accent/30 border border-border/40 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:bg-transparent">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 font-bold text-xs">
            HR
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-xs tracking-tight text-foreground truncate">HR Portal</span>
            <span className="text-[10.5px] text-muted-foreground truncate">Workspace</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1.5 py-1 group-data-[collapsible=icon]:px-0">
        <NavMain
          title={APP_SIDEBAR_CONFIG?.navMain?.title}
          items={APP_SIDEBAR_CONFIG?.navMain?.items}
        />
      </SidebarContent>

      <SidebarSeparator className="mx-3 my-1.5 bg-border/40 group-data-[collapsible=icon]:mx-1" />

      {isLoaded && (
        <SidebarFooter className="p-3 pt-1.5 group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:items-center flex flex-col gap-2">
          <NavUser
            user={sidebarConfig?.user}
            menuItems={APP_SIDEBAR_CONFIG?.navUserItems}
          />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
