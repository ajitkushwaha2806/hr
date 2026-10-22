import { LayoutDashboard, Users, Building2, Clock, CalendarDays, ShieldCheck, User, Sparkles } from "lucide-react";

export const EMPLOYEE_SIDEBAR_CONFIG = {
  portal: "employee",
  portalLabel: "Employee Portal",
  portalSubtitle: "Self-Service Space",
  navMain: {
    title: "EMPLOYEE SELF-SERVICE",
    items: [
      {
        title: "My Dashboard",
        url: "/employee/dashboard",
        icon: <LayoutDashboard />,
      },
      {
        title: "My Leaves",
        url: "/employee/leaves",
        icon: <CalendarDays />,
      },
      {
        title: "My Profile",
        url: "/employee/profile",
        icon: <User />,
      },
    ],
  },
  navUserItems: [
    {
      title: "My Profile",
      url: "/employee/profile",
      icon: <User />,
    },
    {
      title: "Onboarding Checklist",
      url: "/employee/onboarding",
      icon: <Sparkles />,
    },
    {
      title: "Privacy Policy",
      url: "/privacy-policy",
      icon: <ShieldCheck />,
    },
  ],
};

export const ADMIN_SIDEBAR_CONFIG = {
  portal: "admin",
  portalLabel: "Admin Portal",
  portalSubtitle: "Management Suite",
  navMain: {
    title: "ADMINISTRATION",
    items: [
      {
        title: "Admin Dashboard",
        url: "/admin/dashboard",
        icon: <LayoutDashboard />,
      },
      {
        title: "Employees",
        url: "/admin/employees",
        icon: <Users />,
      },
      {
        title: "Departments",
        url: "/admin/departments",
        icon: <Building2 />,
      },
      {
        title: "Attendance Logs",
        url: "/admin/attendance",
        icon: <Clock />,
      },
      {
        title: "Leave Approvals",
        url: "/admin/leaves",
        icon: <CalendarDays />,
      },
    ],
  },
  navUserItems: [
    {
      title: "Privacy Policy",
      url: "/privacy-policy",
      icon: <ShieldCheck />,
    },
  ],
};

export const APP_SIDEBAR_CONFIG = ADMIN_SIDEBAR_CONFIG;
