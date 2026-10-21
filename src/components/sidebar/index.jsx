"use client";
import { NavUser } from "./nav-user";
import { NavMain } from "./nav-main";
import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { Shield, UserCheck, ChevronDown, Check } from "lucide-react";
import { ADMIN_SIDEBAR_CONFIG, EMPLOYEE_SIDEBAR_CONFIG } from "@/constants/sidebar";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function AppSidebar(props) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = pathname?.startsWith("/admin");
  const activeConfig = isAdmin ? ADMIN_SIDEBAR_CONFIG : EMPLOYEE_SIDEBAR_CONFIG;

  const sidebarConfig = {
    user: {
      avatar: user?.imageUrl || "",
      name: user?.fullName || user?.firstName || "User",
      email: user?.primaryEmailAddress?.emailAddress || "",
    },
  };

  const switchToAdmin = () => {
    router.push("/admin/dashboard");
  };

  const switchToEmployee = () => {
    router.push("/employee/dashboard");
  };

  return (
    <Sidebar collapsible="icon" {...props} className="bg-sidebar border-r border-border/40">
      <SidebarHeader className="p-2.5 pb-2 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full focus:outline-none">
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-sidebar-accent/40 hover:bg-sidebar-accent/70 border border-border/50 transition-all text-left group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:justify-center">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`size-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs shadow-xs ${
                    isAdmin
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-primary/15 text-primary border border-primary/30"
                  }`}
                >
                  {isAdmin ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </div>
                <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                  <span className="font-semibold text-xs text-foreground truncate flex items-center gap-1.5">
                    {activeConfig.portalLabel}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {activeConfig.portalSubtitle}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-60 p-1.5 shadow-xl border border-border/60">
            <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase px-2 py-1">
              Switch Workspace Portal
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={switchToEmployee}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                !isAdmin ? "bg-sidebar-accent/60" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-md bg-primary/15 text-primary flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Employee Portal</p>
                  <p className="text-[10.5px] text-muted-foreground">My dashboard, attendance & leaves</p>
                </div>
              </div>
              {!isAdmin && <Check className="w-4 h-4 text-primary shrink-0" />}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={switchToAdmin}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                isAdmin ? "bg-sidebar-accent/60" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Admin Portal</p>
                  <p className="text-[10.5px] text-muted-foreground">Manage employees & settings</p>
                </div>
              </div>
              {isAdmin && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
