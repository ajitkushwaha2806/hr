"use client";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { Asset } from "@/components/common/Asset";
import { ChevronRightIcon, BadgeCheckIcon, LogOutIcon } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function NavUser({ user, menuItems }) {
  const { isMobile } = useSidebar();
  const { signOut } = useClerk();

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                tooltip={user?.name || "Account"}
                className="group h-auto w-full items-center gap-3 overflow-hidden rounded-lg border border-border/50 hover:border-border bg-sidebar-accent/30 hover:bg-sidebar-accent/70 p-2 shadow-2xs transition-all duration-200 data-[state=open]:border-primary/40 data-[state=open]:bg-primary/5 data-[state=open]:ring-2 data-[state=open]:ring-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent"
              />
            }
          >
            <Asset
              src={user?.avatar}
              name={user?.name}
              type="avatar"
              variant="thumbnail"
              alt={user?.name}
              className="size-8 rounded-lg border border-border/60 shadow-2xs ring-1 ring-border/20 transition-transform duration-200 group-hover:scale-105 shrink-0"
            />
            <div className="grid flex-1 min-w-0 text-left leading-tight group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {user?.name || "Account"}
                </span>
                <BadgeCheckIcon className="size-3.5 text-primary fill-primary/10 shrink-0" />
              </div>
              <span className="truncate text-[11px] font-medium text-muted-foreground/80 mt-0.5">
                {user?.email || "Signed in"}
              </span>
            </div>
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-hover:text-foreground group-data-[state=open]:rotate-90 group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[280px] rounded-xl border border-border/60 bg-popover/95 backdrop-blur-xl p-1.5 shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={10}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 p-2.5 text-left">
                  <Asset
                    src={user?.avatar}
                    name={user?.name}
                    type="avatar"
                    variant="thumbnail"
                    alt={user?.name}
                    className="size-10 rounded-lg border border-border/60 shadow-xs ring-1 ring-border/20 shrink-0"
                  />
                  <div className="grid flex-1 min-w-0 text-left leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-semibold tracking-tight text-foreground">
                        {user?.name}
                      </span>
                      <BadgeCheckIcon className="size-3.5 text-primary fill-primary/10 shrink-0" />
                    </div>
                    <span className="truncate text-[11px] font-medium text-muted-foreground/80 mt-0.5">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1 bg-border/40" />

            {menuItems && menuItems?.length > 0 && (
              <>
                <DropdownMenuGroup className="space-y-0.5">
                  {menuItems?.map((item, index) => (
                    <DropdownMenuItem
                      key={index}
                      className="cursor-pointer rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted/80 focus:bg-muted/80 transition-all"
                    >
                      <Link
                        href={item?.url || "#"}
                        className="flex w-full items-center gap-2.5"
                      >
                        <div className="size-4 text-muted-foreground [&>svg]:size-4">
                          {item?.icon}
                        </div>
                        <span>{item?.title}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-1 bg-border/40" />
              </>
            )}

            <DropdownMenuItem
              onClick={() => signOut({ redirectUrl: "/" })}
              className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10 transition-all"
            >
              <LogOutIcon className="size-4 text-destructive transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span className="font-semibold">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
