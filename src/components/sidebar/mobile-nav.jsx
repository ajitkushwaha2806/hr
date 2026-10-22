"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { ADMIN_SIDEBAR_CONFIG, EMPLOYEE_SIDEBAR_CONFIG } from "@/constants/sidebar";

export function MobileNav() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  const isAdmin = pathname?.startsWith("/admin");
  const activeConfig = isAdmin ? ADMIN_SIDEBAR_CONFIG : EMPLOYEE_SIDEBAR_CONFIG;
  const items = activeConfig?.navMain?.items || [];
  
  const navItems = isAdmin
    ? [
        {
          item: items.find((i) => i.title.includes("Dashboard")) || { title: "Dashboard", url: "/admin/dashboard" },
          label: "Dashboard",
        },
        {
          item: items.find((i) => i.title === "Employees") || { title: "Employees", url: "/admin/employees" },
          label: "Employees",
        },
        {
          item: items.find((i) => i.title.includes("Attendance")) || { title: "Attendance", url: "/admin/attendance" },
          label: "Attendance",
        },
        {
          item: items.find((i) => i.title.includes("Leave")) || { title: "Leaves", url: "/admin/leaves" },
          label: "Leaves",
        },
      ]
    : [
        {
          item: items.find((i) => i.title.includes("Dashboard")) || { title: "Dashboard", url: "/employee/dashboard" },
          label: "Dashboard",
        },
        {
          item: items.find((i) => i.title.includes("Leave")) || { title: "Leaves", url: "/employee/leaves" },
          label: "Leaves",
        },
        {
          item: items.find((i) => i.title.includes("Profile")) || { title: "Profile", url: "/employee/profile" },
          label: "Profile",
        },
      ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 h-16 pb-safe bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-border/40 flex items-center justify-around px-2 sm:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.25)]"
    >
      {navItems.map(({ item, label }) => {
        const isActive =
          pathname === item.url ||
          (item.url !== "/" && pathname?.startsWith(item.url));

        return (
          <Link
            key={label}
            href={item.url}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 text-muted-foreground transition-all duration-200 select-none active:scale-95 group",
              isActive ? "text-primary font-semibold" : "hover:text-foreground"
            )}
          >
            <div
              className={cn(
                "relative flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200",
                isActive
                  ? "bg-primary/12 text-primary shadow-xs dark:bg-primary/20"
                  : "bg-transparent group-hover:bg-muted/60"
              )}
            >
              {item.icon &&
                React.cloneElement(item.icon, {
                  className: cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive
                      ? "text-primary stroke-[2.2] scale-105"
                      : "text-muted-foreground stroke-[1.8] group-hover:text-foreground"
                  ),
                })}
            </div>
            <span
              className={cn(
                "text-[10.5px] mt-0.5 tracking-tight transition-colors duration-200 truncate max-w-[64px] text-center",
                isActive ? "text-primary font-bold" : "text-muted-foreground/90 font-medium"
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}

      <button
        onClick={toggleSidebar}
        type="button"
        aria-label="Open more menu"
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-muted-foreground transition-all duration-200 select-none active:scale-95 group hover:text-foreground"
      >
        <div className="flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 bg-transparent group-hover:bg-muted/60">
          <Menu className="w-5 h-5 stroke-[1.8] transition-transform duration-200 group-hover:scale-105 group-hover:text-foreground" />
        </div>
        <span className="text-[10.5px] mt-0.5 font-medium tracking-tight text-muted-foreground/90">
          More
        </span>
      </button>
    </nav>
  );
}
