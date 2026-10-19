import { LayoutDashboard, Users, Building2, Clock, CalendarDays, Wallet, TrendingUp, UserPlus, Laptop, BarChart3, ShieldCheck, Settings, User, Sparkles } from "lucide-react";

export const APP_SIDEBAR_CONFIG = {
  navUserItems: [
    {
      title: "Onboarding Checklist",
      url: "/onboarding",
      icon: <Sparkles />,
    },
    {
      title: "My Profile",
      url: "/profile",
      icon: <User />,
    },
    {
      title: "Account Settings",
      url: "/settings",
      icon: <Settings />,
    },
  ],

  navMain: {
    title: "HR MANAGEMENT",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: <LayoutDashboard />,
      },
      {
        title: "Employees",
        url: "/employees",
        icon: <Users />,
      },
      {
        title: "Departments",
        url: "/departments",
        icon: <Building2 />,
      },
      {
        title: "Attendance",
        url: "/attendance",
        icon: <Clock />,
      },
      {
        title: "Leave Management",
        url: "/leaves",
        icon: <CalendarDays />,
      },
      {
        title: "Payroll",
        url: "/payroll",
        icon: <Wallet />,
      },
      {
        title: "Performance",
        url: "/performance",
        icon: <TrendingUp />,
      },
      {
        title: "Recruitment",
        url: "/recruitment",
        icon: <UserPlus />,
      },
      {
        title: "Assets",
        url: "/assets",
        icon: <Laptop />,
      },
      {
        title: "Reports & Analytics",
        url: "/reports",
        icon: <BarChart3 />,
      },
      {
        title: "Roles & Permissions",
        url: "/settings/roles",
        icon: <ShieldCheck />,
      },
      {
        title: "Company Settings",
        url: "/settings",
        icon: <Settings />,
      },
    ],
  },
};
